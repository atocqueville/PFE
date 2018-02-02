const config = require('./config.json');
const log4js = require('./logger');
const bfx = require('./bfx');
const {Order} = require('bitfinex-api-node/lib/models');
const CANDLE_KEY = 'trade:' + config.timestamp + 'm:t' + config.currency + 'USD';

let cron = require('node-cron');
cron.schedule('*/5 * * * * *', function () {
  // getDocument();
});

const logger = log4js.getLogger('trades');
const errorLogger = log4js.getLogger('error');
const consoleJS = log4js.getLogger('');

let init = true;
let long = false;
let buy;
let sell;

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'myproject';

MongoClient.connect(url, function (err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  insertDocuments(db, function () {
    client.close();
  });
  // .then(function(result) {
  //   // process result
  //   console.log('ayé g fini');
  // });
});

const insertDocuments = function (db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Insert some documents
  collection.insertMany([
    {a: 1}, {a: 2}, {a: 3}
  ], function (err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
};

const wsCandle = bfx.ws(2, {
  manageCandles: true,
  transform: true
});
const wsAuth = bfx.ws(2);

// wsCandle.on('open', () => {
//   wsCandle.subscribeCandles(CANDLE_KEY);
// });
// wsCandle.on('error', (err) => errorLogger.info(err));
// wsCandle.onCandle({key: CANDLE_KEY}, (candles) => {
//   if (init) {
//     console.log('\n' +
//       '            ____        __     ____ _____ ____       \n' +
//       '           / __ )____  / /_   / __ / ___//  _/       \n' +
//       ' ______   / __  / __ \\/ __/  / /_/ \\__ \\ / /   ______\n' +
//       '/_____/  / /_/ / /_/ / /_   / _, ____/ _/ /   /_____/\n' +
//       '        /_____/\\____/\\__/  /_/ |_/____/___/          \n' +
//       '                                                     \n' +
//       'v1.1.1  /  ' + config.currency + '\n');
//     consoleJS.trace('Initialising Couchbase..');
//     initCouchbase(candles);
//     init = false;
//   }
//   retrieveDocumentAndUpdate(candles[0]);
// });
// // wsCandle.open();
//
// wsAuth.on('open', () => {
//   wsAuth.auth();
// });
// wsAuth.on('error', (err) => errorLogger.info(err));
// wsAuth.once('auth', () => {
//   console.log('authenticated');
//
//   // Build new order
//   const o = new Order({
//     cid: Date.now(),
//     symbol: 'tBTCUSD',
//     amount: -0.0020958,
//     type: Order.type.EXCHANGE_MARKET
//   }, wsAuth);
//
//   let closed = false;
//
//   // Enable automatic updates
//   o.registerListeners();
//
//   o.on('update', () => {
//     console.log('order updated: %j', o.serialize());
//   });
//
//   o.on('close', () => {
//     console.log('order closed: %s', o.status);
//     closed = true
//   });
//
//   console.log('submitting order %d', o.cid);
//
//   o.submit().then(() => {
//     console.log('got submit confirmation for order %d [%d]', o.cid, o.id);
//
//     // wait a bit...
//     setTimeout(() => {
//       if (closed) return;
//
//       console.log('canceling...');
//
//       o.cancel().then(() => {
//         console.log('got cancel confirmation for order %d', o.cid);
//       }).catch((err) => {
//         console.log('error cancelling order: %j', err);
//       })
//     }, 2000)
//   }).catch((err) => {
//     console.log(err)
//   });
// });
// wsAuth.open();


function initCouchbase(previousCandles) {
  bucket.upsert('oldCandles',
    initJSON(previousCandles), function (err) {
    if (err) console.error("Couldn't store document: %j", err);
    else {
      transferLastCandles();
      consoleJS.info('Couchbase initialised.');
      consoleJS.trace('Waiting for trades..\n');
    }
  });
}

function initJSON(previousCandles) {
  let candlesJSON = [];
  let period = config.RSIperiod;

  previousCandles.reverse();

  for (let i = 1; i < previousCandles.length; i++) {
    candlesJSON.push(
      {
        MTS: previousCandles[i].mts,
        DATE: new Date(previousCandles[i].mts).toLocaleTimeString(),
        DATA:
          {
            CLOSE: previousCandles[i].close,
            DIFF: previousCandles[i].close - previousCandles[i - 1].close,
            AVGGAIN: '',
            AVGLOSS: '',
            RSI: ''
          }
      }
    );
  }

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
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
  previousCandles.reverse();
  return candlesJSON;
}

function transferLastCandles() {
  bucket.get('oldCandles', function (err, result) {
    if (err) console.log('Some error occurred : %j', err);
    else createNewDocument(result.value);
  });
}

function createNewDocument(candlesCouchbase) {
  candlesCouchbase.reverse();
  bucket.upsert('newCandles',
    [candlesCouchbase[1], candlesCouchbase[0]],
    function (err) {
      if (err) console.error("Couldn't store document: %j", err);
      else {
        bucket.remove('oldCandles', function (err) {
          if (err) console.error("Couldn't store document: %j", err);
        });
      }
    });

}

function retrieveDocumentAndUpdate(lastCandle) {
  bucket.get('newCandles', function (err, result) {
    if (err) console.log('Some error occurred ! : %j', err);
    else {
      updateJSON(result.value, lastCandle);
    }
  });
}

function getDocument() {
  bucket.get('newCandles', function (err, result) {
    if (err) console.log('Some error occurred: %j', err);
    else {
      let lastCandle = result.value.reverse()[0].DATA;
      makeDecisions(lastCandle);
    }
  });
}

function updateJSON(candlesCouchbase, lastCandle) {
  let search = getObjects(candlesCouchbase, 'MTS', lastCandle.mts);
  if (search.length === 0) {
    candlesCouchbase.push(
      {
        MTS: lastCandle.mts,
        DATE: new Date(lastCandle.mts).toLocaleTimeString(),
        DATA:
          {
            CLOSE: lastCandle.close,
            DIFF: '',
            AVGGAIN: '',
            AVGLOSS: '',
            RSI: ''
          }
      }
    );
  }
  updateCouchbase(candlesCouchbase, lastCandle);
}

function updateCouchbase(candlesCouchbase, lastCandle) {
  bucket.upsert('newCandles',
    updateCandle(candlesCouchbase, lastCandle), function (err) {
    if (err) console.error("Couldn't store document: %j", err);
  });
}

function updateCandle(candlesCouchbase, lastCandle) {
  let period = config.RSIperiod;
  let previousCandle = getObjects(candlesCouchbase, 'MTS', lastCandle.mts - (60000 * config.timestamp))[0].DATA;
  for (let i = 0; i < candlesCouchbase.length; i++) {
    if (candlesCouchbase[i].MTS === lastCandle.mts) {
      candlesCouchbase[i].DATA.CLOSE = lastCandle.close;
      candlesCouchbase[i].DATA.DIFF = Number(lastCandle.close) - Number(previousCandle.CLOSE);

      if (candlesCouchbase[i].DATA.DIFF > 0) {
        candlesCouchbase[i].DATA.AVGGAIN = (previousCandle.AVGGAIN * (period - 1) + candlesCouchbase[i].DATA.DIFF) / period;
        candlesCouchbase[i].DATA.AVGLOSS = (previousCandle.AVGLOSS * (period - 1)) / period;
      } else if (candlesCouchbase[i].DATA.DIFF < 0) {
        candlesCouchbase[i].DATA.AVGGAIN = (previousCandle.AVGGAIN * (period - 1)) / period;
        candlesCouchbase[i].DATA.AVGLOSS = (previousCandle.AVGLOSS * (period - 1) + Math.abs(candlesCouchbase[i].DATA.DIFF)) / period;
      } else {
        candlesCouchbase[i].DATA.AVGGAIN = (previousCandle.AVGGAIN * (period - 1)) / period;
        candlesCouchbase[i].DATA.AVGLOSS = (previousCandle.AVGLOSS * (period - 1)) / period;
      }
      candlesCouchbase[i].DATA.RSI = 100 - (100 / (1 + (candlesCouchbase[i].DATA.AVGGAIN / candlesCouchbase[i].DATA.AVGLOSS)));
      break;
    }
  }
  return candlesCouchbase;
}

function makeDecisions(lastCandle) {
  if (!long) {
    if (lastCandle.RSI <= 30) {
      consoleJS.warn('Buy order executed');
      buy = lastCandle.CLOSE;
      logger.info('Achat au prix de : $', buy);
      long = true;
    }
  } else if (long) {
    if (lastCandle.RSI >= 70) {
      consoleJS.warn('Sell order executed\n');
      sell = lastCandle.CLOSE;
      logger.info('Vente au prix de : $', sell);
      logger.trace('Variation : %', ((sell / buy) - 1) * 100);
      long = false;
    }
  }
}

function getObjects(obj, key, val) {
  let objects = [];
  for (let i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    if (typeof obj[i] === 'object') {
        objects = objects.concat(getObjects(obj[i], key, val));
    } else
    //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
    if (i === key && obj[i] === val || i === key && val === '') { //
      objects.push(obj);
    } else if (obj[i] === val && key === '') {
      //only add if the object is not already in the array
      if (objects.lastIndexOf(obj) === -1) {
        objects.push(obj);
      }
    }
  }
    return objects;
}