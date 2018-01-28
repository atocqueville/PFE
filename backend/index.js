const WebSocket = require('ws');
const wsCandles = new WebSocket('wss://api.bitfinex.com/ws/2');

let apiKeys = require('./apikeys.json');

const BFX = require('bitfinex-api-node');
const bfx = new BFX({
  apiKey: apiKeys.public,
  apiSecret: apiKeys.private,

  ws: {
    autoReconnect: true,
    seqAudit: true,
    packetWDDelay: 10 * 1000
  }
});
const ws = bfx.ws(2, {
  manageCandles: true,  // enable candle dataset persistence/management
  transform: true       // converts ws data arrays to Candle models (and others)
});
const CANDLE_KEY = 'trade:1m:tBTCUSD';

ws.on('open', () => {
  ws.subscribeCandles(CANDLE_KEY);
});

let prevTS = null;

// 'candles' here is an array
ws.onCandle({key: CANDLE_KEY}, (candles) => {
  console.log(candles[0]);
  if (prevTS === null || candles[0].mts > prevTS) {
    const c = candles[1]; // report previous candle

    console.log(`%s %s open: %f, high: %f, low: %f, close: %f, volume: %f`,
      CANDLE_KEY, new Date(c.mts).toLocaleTimeString(),
      c.open, c.high, c.low, c.close, c.volume
    );

    prevTS = candles[0].mts
  }
});

ws.open();



let config = require('./config.json');
const period = config.period;
const MTS = config.timestamp;
const currency = config.currency;

let couchbase = require('couchbase');
let cluster = new couchbase.Cluster('127.0.0.1');
cluster.authenticate('Tokie', 'detoka');
let bucket = cluster.openBucket('candles', function (err) {
  if (err) {
    console.log('cant open bucket');
    throw err;
  }
});

let candlesJSON = [];

let cron = require('node-cron');
cron.schedule('*/5 * * * * *', function () {
  getDocument();
});

let log4js = require('log4js');
log4js.configure({
  appenders: {
    tradesLogs: { type: 'file', filename: 'logger.log' },
    responseLogs: {type: 'file', filename: 'responseLogs.log'},
    console: { type: 'console' }
  },
  categories: {
    trades: { appenders: ['tradesLogs'], level: 'trace' },
    csl: {appenders: ['console'], level: 'trace'},
    response: {appenders: ['responseLogs'], level: 'trace'},
    default: { appenders: ['console'], level: 'trace' }
  }
});
const logger = log4js.getLogger('trades');
const responselogger = log4js.getLogger('response');
const consoleJS = log4js.getLogger('csl');

let long = false;
let buy;
let sell;

wsCandles.onopen = () => {
  let count = 0;
  const crypto = require('crypto-js');

  const authNonce = Date.now() * 1000;
  const authPayload = 'AUTH' + authNonce;
  // const authSig = crypto
  //   .HmacSHA384(authPayload, keySecret)
  //   .toString(crypto.enc.Hex);

  // const payload = {
  //   keyPublic,
  //   authSig,
  //   authNonce,
  //   authPayload,
  //   event: 'auth'
  // };

//  wsCandles.send(JSON.stringify(payload));

  let msg = ({
    'event': 'subscribe',
    'channel': 'candles',
    'key': 'trade:' + MTS + 'm:t' + currency + 'USD'
  });

  // te = trade executed
  // tu = trade execution update

  // wsCandles.send(JSON.stringify(msg));

  wsCandles.onmessage = (msg) => {
    let response = JSON.parse(msg.data);
    responselogger.trace(response);
    if (response[1] === 'hb') {
    } else {
      if (count < 3) {
        if (count === 2) {
          console.log('\n' +
            '            ____        __     ____ _____ ____       \n' +
            '           / __ )____  / /_   / __ / ___//  _/       \n' +
            ' ______   / __  / __ \\/ __/  / /_/ \\__ \\ / /   ______\n' +
            '/_____/  / /_/ / /_/ / /_   / _, ____/ _/ /   /_____/\n' +
            '        /_____/\\____/\\__/  /_/ |_/____/___/          \n' +
            '                                                     \n' +
            '\n');
          let previousCandles = response[1];
          consoleJS.trace('Initialising Couchbase..');
          initCouchbase(previousCandles, period);
        }
        count++;
      } else {
        retrieveDocumentAndUpdate(response[1]);
      }
    }
  }
};

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
      consoleJS.warn('Sell order executed');
      sell = lastCandle.CLOSE;
      logger.info('Vente au prix de : $', sell);
      logger.trace('Benef : $', Number(sell) - Number(buy));
      long = false;
    }
  }
}

function initCouchbase(previousCandles, period) {
  initJSON(previousCandles, period);
  bucket.upsert('values', candlesJSON, function (err) {
    if (err) console.error("Couldn't store document: %j", err);
    else {
      consoleJS.info('Couchbase initialised.');
      consoleJS.trace('Waiting for trades..\n');
    }
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

function retrieveDocumentAndUpdate(response) {
  bucket.get('values', function (err, result) {
    if (err) console.log('Some error occurred: %j', err);
    else {
      let documentCB = result.value;
      updateJSON(documentCB, response);
    }
  });
}

function getDocument() {
  bucket.get('values', function (err, result) {
    if (err) console.log('Some error occurred: %j', err);
    else {
      let lastCandle = result.value.reverse()[0].DATA;
      makeDecisions(lastCandle);
    }
  });
}

function updateJSON(documentCB, candleBitfinex) {
  let search = getObjects(documentCB, 'MTS', candleBitfinex[0]);
  if (search.length === 0) {
    documentCB.push(
      {
        MTS: candleBitfinex[0],
        DATA:
          {
            CLOSE: candleBitfinex[2],
            DIFF: '',
            AVGGAIN: '',
            AVGLOSS: '',
            RSI: ''
          }
      }
    );
  }
  updateCouchbase(documentCB, candleBitfinex);
}

function updateCouchbase(documentCB, candleBitfinex) {
  let newJSON = updateCandle(documentCB, candleBitfinex);
  bucket.upsert('values', newJSON, function (err) {
    if (err) console.error("Couldn't store document: %j", err);
  });
}

function updateCandle(documentCB, candleBitfinex) {
  let previousCandle = getObjects(documentCB, 'MTS', Number(candleBitfinex[0]) - 60000 * Number(MTS))[0].DATA;
  for (let i = 0; i < documentCB.length; i++) {
    if (documentCB[i].MTS === candleBitfinex[0]) {
      documentCB[i].DATA.CLOSE = candleBitfinex[2];
      documentCB[i].DATA.DIFF = Number(candleBitfinex[2]) - Number(previousCandle.CLOSE);

      if (documentCB[i].DATA.DIFF > 0) {
        documentCB[i].DATA.AVGGAIN = (previousCandle.AVGGAIN * (period - 1) + documentCB[i].DATA.DIFF) / period;
        documentCB[i].DATA.AVGLOSS = (previousCandle.AVGLOSS * (period - 1)) / period;
      } else if (documentCB[i].DATA.DIFF < 0) {
        documentCB[i].DATA.AVGGAIN = (previousCandle.AVGGAIN * (period - 1)) / period;
        documentCB[i].DATA.AVGLOSS = (previousCandle.AVGLOSS * (period - 1) + Math.abs(documentCB[i].DATA.DIFF)) / period;
      } else {
        documentCB[i].DATA.AVGGAIN = (previousCandle.AVGGAIN * (period - 1)) / period;
        documentCB[i].DATA.AVGLOSS = (previousCandle.AVGLOSS * (period - 1)) / period;
      }
      documentCB[i].DATA.RSI = 100 - (100 / (1 + (documentCB[i].DATA.AVGGAIN / documentCB[i].DATA.AVGLOSS)));
      break;
    }
  }
  return documentCB;
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