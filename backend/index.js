let apiKeys = require('./apikeys.json');

let config = require('./config.json');

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
  manageCandles: true,
  transform: true
});
const CANDLE_KEY = 'trade:' + config.timestamp + 'm:t' + config.currency + 'USD';

// new Date(c.mts).toLocaleTimeString()

let couchbase = require('couchbase');
let cluster = new couchbase.Cluster('127.0.0.1');
cluster.authenticate('Tokie', 'detoka');
let bucket = cluster.openBucket('candles', function (err) {
  if (err) {
    console.log('cant open bucket');
    throw err;
  }
});

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

let init = true;
let long = false;
let buy;
let sell;

ws.on('open', () => {
  ws.subscribeCandles(CANDLE_KEY);
});

ws.onCandle({key: CANDLE_KEY}, (candles) => {
  responselogger.trace(candles[0]);
  if (init) {
    console.log('\n' +
      '            ____        __     ____ _____ ____       \n' +
      '           / __ )____  / /_   / __ / ___//  _/       \n' +
      ' ______   / __  / __ \\/ __/  / /_/ \\__ \\ / /   ______\n' +
      '/_____/  / /_/ / /_/ / /_   / _, ____/ _/ /   /_____/\n' +
      '        /_____/\\____/\\__/  /_/ |_/____/___/          \n' +
      '                                                     \n' +
      '\n');
    consoleJS.trace('Initialising Couchbase..');
    initCouchbase(candles);
    init = false;
  }
  retrieveDocumentAndUpdate(candles[0]);
});
ws.open();

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
      logger.trace('Benef : $', Number(sell) - Number(buy));
      long = false;
    }
  }
}

function initCouchbase(previousCandles) {
  bucket.upsert('values',
    initJSON(previousCandles), function (err) {
    if (err) console.error("Couldn't store document: %j", err);
    else {
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

function retrieveDocumentAndUpdate(lastCandle) {
  bucket.get('values', function (err, result) {
    if (err) console.log('Some error occurred: %j', err);
    else {
      updateJSON(result.value, lastCandle);
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
  bucket.upsert('values',
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