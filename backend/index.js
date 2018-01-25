const WebSocket = require('ws');
const wsCandles = new WebSocket('wss://api.bitfinex.com/ws/2');

let apiKeys = require('./apikeys.json');
const keyPublic = apiKeys.public;
const keySecret = apiKeys.private;

let config = require('./config.json');
const period = config.period;
const MTS = config.timestamp;
const currency = config.currency;

let couchbase = require('couchbase');
let cluster = new couchbase.Cluster('127.0.0.1');
cluster.authenticate('Tokie', 'detoka');

let candlesJSON = [];

let lastRSI;
let long = false;
let buy;
let sell;

wsCandles.onopen = () => {
  let count = 0;
  const crypto = require('crypto-js');

  const authNonce = Date.now() * 1000;
  const authPayload = 'AUTH' + authNonce;
  const authSig = crypto
    .HmacSHA384(authPayload, keySecret)
    .toString(crypto.enc.Hex);

  const payload = {
    keyPublic,
    authSig,
    authNonce,
    authPayload,
    event: 'auth'
  };

//  wsCandles.send(JSON.stringify(payload));

  let msg = ({
    'event': 'subscribe',
    'channel': 'candles',
    'key': 'trade:' + MTS + 'm:t' + currency + 'USD'
  });

  // te = trade executed
  // tu = trade execution update

  wsCandles.send(JSON.stringify(msg));

  wsCandles.onmessage = (msg) => {
    let response = JSON.parse(msg.data);
    if (response[1] === 'hb') {
      // console.log('heartbeat');
    } else {
      if (count < 3) {
        if (count === 2) {
          let previousCandles = response[1];
          initCouchbase(previousCandles, period);
        }
        count++;
      } else {
        retrieveDocument(response[1]);
      }
    }
  }
};

function makeDecisions(candleJSON) {
  if (!long) {
    if (lastRSI <= 30) {
      buy = candleJSON[0].CLOSE;
      console.log('j\'achete au prix de : $', buy);
      console.log((new Date()));
      long = true;
    }
  } else if (long) {
    if (lastRSI >= 70) {
      sell = candleJSON[0].CLOSE;
      console.log('je vends au prix de : $', sell);
      console.log('benef : $', Number(sell) - Number(buy));
      console.log((new Date()));
      long = false;
    }
  }
}

function initCouchbase(previousCandles, period) {
  let bucket = cluster.openBucket('candles', function(err) {
    if (err) {
      console.log('cant open bucket');
      throw err;
    }

    initJSON(previousCandles, period);

    bucket.upsert('values',
      candlesJSON
      , function(err, result) {
        if (!err) {
          console.log("stored document successfully. CAS is %j", result.cas);
        } else {
          console.error("Couldn't store document: %j", err);
        }
      });
  });
}

function initJSON(previousCandles, period) {
  previousCandles.reverse();

  for (let i = 1; i < previousCandles.length; i++) {
    candlesJSON.push(
      {
        MTS: previousCandles[i][0],
        DATA:
          {
            CLOSE: previousCandles[i][2],
            DIFF: previousCandles[i][2] - previousCandles[i - 1][2],
            AVGGAIN: '',
            AVGLOSS: '',
            RSI: ''
          }
      }
    );
  }

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i < Number(period) + 1; i++) {
    let candle = candlesJSON[i].DATA;
    if (candle.DIFF > 0) {
      avgGain += candle.DIFF;
    } else {
      avgLoss += Math.abs(candle.DIFF);
    }
  }
  let firstDynamicCandle = candlesJSON[period].DATA;
  firstDynamicCandle.AVGGAIN = avgGain / Number(period);
  firstDynamicCandle.AVGLOSS = avgLoss / Number(period);

  for (let i = Number(period) + 1; i < previousCandles.length - 1; i++) {
    let previousCandle = candlesJSON[i - 1].DATA;
    let candle = candlesJSON[i].DATA;
    let previousAvgGain = previousCandle.AVGGAIN;
    let previousAvgLoss = previousCandle.AVGLOSS;
    let diff = candle.DIFF;

    if (diff > 0) {
      candle.AVGGAIN = (previousAvgGain * (Number(period) - 1) + diff) / Number(period);
      candle.AVGLOSS = (previousAvgLoss * (Number(period) - 1)) / Number(period);
    } else if (diff < 0) {
        candle.AVGGAIN = (previousAvgGain * (Number(period) - 1)) / Number(period);
      candle.AVGLOSS = (previousAvgLoss * (Number(period) - 1) + Math.abs(diff)) / Number(period);
    } else {
        candle.AVGGAIN = (previousAvgGain * (Number(period) - 1)) / Number(period);
      candle.AVGLOSS = (previousAvgLoss * (Number(period) - 1)) / Number(period);
    }
    candle.RSI = 100 - (100 / (1 + (candle.AVGGAIN / candle.AVGLOSS)));
  }
}

function retrieveDocument(response) {
  let bucket = cluster.openBucket('candles', function (err) {
    if (err) {
      console.log('cant open bucket');
      throw err;
    }

    bucket.get('values', function (err, result) {
      if (err) {
        console.log('Some error occurred: %j', err);
      } else {
        let documentCB = result.value;
        updateJSON(response, documentCB);
      }
    })
  });
}

function updateJSON(response, documentCB) {

  let search = getObjects(documentCB, 'MTS', response[0]);

  if (search.length !== 0) {
     if (search[0].DATA.CLOSE !== response[2]) {
       console.log("updating candle..");
       updateCouchbase(documentCB, response);
      // updateCandle(search[0].DATA, response, documentCB);
      // makeDecisions(candleJSON);
     }
  } else {
    console.log('existe pas !');
    createCandle(response, documentCB);
  }
}

function updateCouchbase(documentCB, candleBitfinex) {
    let bucket = cluster.openBucket('candles', function(err) {
        if (err) {
            console.log('cant open bucket');
            throw err;
        }

        let newJSON = updateCandle(documentCB, candleBitfinex);

        bucket.upsert('values',
            newJSON
            , function(err, result) {
                if (!err) {
                    console.log("stored document successfully. CAS is %j", result.cas);
                } else {
                    console.error("Couldn't store document: %j", err);
                }
            });
    });
}

function updateCandle(candleJSON, candleBitfinex, documentCB) {

    for (let i = 0; i < candlesJSON2.length; i++) {
        if (candlesJSON2[i].MTS === 1516831200000) {
            console.log(candlesJSON2[i]);
            candlesJSON2[i].DATA.CLOSE = 200;
            console.log(candlesJSON2[i]);
            break;
        }
    }

  let previousCandle = candlesJSON.find({
    'MTS': candleJSON[0].MTS - (60000 * Number(MTS))
  });
  candleJSON[0].CLOSE = candleBitfinex[2];
  candleJSON[0].DIFF = candleJSON[0].CLOSE - previousCandle[0].CLOSE;

  if (candleJSON[0].DIFF > 0) {
    candleJSON[0].AVGGAIN = (previousCandle[0].AVGGAIN * (period - 1) + candleJSON[0].DIFF) / period;
    candleJSON[0].AVGLOSS = (previousCandle[0].AVGLOSS * (period - 1)) / period;
  } else if (candleJSON[0].DIFF < 0) {
    candleJSON[0].AVGGAIN = (previousCandle[0].AVGGAIN * (period - 1)) / period;
    candleJSON[0].AVGLOSS = (previousCandle[0].AVGLOSS * (period - 1) + Math.abs(candleJSON[0].DIFF)) / period;
  } else {
    candleJSON[0].AVGGAIN = (previousCandle[0].AVGGAIN * (period - 1)) / period;
    candleJSON[0].AVGLOSS = (previousCandle[0].AVGLOSS * (period - 1)) / period;
  }
  candleJSON[0].RSI = 100 - (100 / (1 + (candleJSON[0].AVGGAIN / candleJSON[0].AVGLOSS)));
  candlesJSON.update(candleJSON);
}

function createCandle(candleBitfinex, documentCB) {

  let previousCandle = getObjects(documentCB, 'MTS', candleBitfinex[0] - (60000 * Number(MTS)))[0].DATA;

  documentCB.push(
    {
      MTS: candleBitfinex[0],
      DATA:
        {
          CLOSE: candleBitfinex[2],
          DIFF: candleBitfinex[2] - previousCandle.CLOSE,
          AVGGAIN: '',
          AVGLOSS: '',
          RSI: ''
        }
    }
  );

  let bucket = cluster.openBucket('candles', function (err) {
    if (err) {
      console.log('cant open bucket');
      throw err;
    }

    bucket.upsert('values', documentCB, function (err, result) {
      if (!err) {
        console.log("stored document successfully. CAS is %j", result.cas);
      } else {
        console.error("Couldn't store document: %j", err);
      }
    });
  });
}

function getObjects(obj, key, val) {
  let objects = [];
  for (let i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    if (typeof obj[i] == 'object') {
        objects = objects.concat(getObjects(obj[i], key, val));
    } else
    //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
    if (i == key && obj[i] == val || i == key && val == '') { //
      objects.push(obj);
    } else if (obj[i] == val && key == '') {
      //only add if the object is not already in the array
      if (objects.lastIndexOf(obj) == -1) {
        objects.push(obj);
      }
    }
  }
    return objects;
}