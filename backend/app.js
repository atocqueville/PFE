const packagejson = require('./package.json');
const config = require('./config.json');
const log4js = require('./logger');
const bfx = require('./bfx');
const mongoUtil = require('./mongodb');
const {Order} = require('bitfinex-api-node/lib/models');
const CANDLE_KEY = 'trade:' + config.timestamp + 'm:t' + config.currency + 'USD';

let cron = require('node-cron');
cron.schedule('*/5 * * * * *', function () {
  getDocument();
});

const logger = log4js.getLogger('trades');
const errorLogger = log4js.getLogger('error');
const consoleJS = log4js.getLogger('');

let init = true;
let long = false;
let buy;
let sell;
const wsCandle = bfx.ws(2, {
  manageCandles: true,
  transform: true
});
const wsAuth = bfx.ws(2);

mongoUtil.connectToServer(function (err) {
  if (err) throw err;
  wsCandle.on('open', () => {
    wsCandle.subscribeCandles(CANDLE_KEY);
  });
  wsCandle.on('error', (err) => errorLogger.info(err));
  wsCandle.onCandle({key: CANDLE_KEY}, (candles) => {
    if (init) {
      console.log('\n' +
        '            ____        __     ____ _____ ____       \n' +
        '           / __ )____  / /_   / __ / ___//  _/       \n' +
        ' ______   / __  / __ \\/ __/  / /_/ \\__ \\ / /   ______\n' +
        '/_____/  / /_/ / /_/ / /_   / _, ____/ _/ /   /_____/\n' +
        '        /_____/\\____/\\__/  /_/ |_/____/___/          \n' +
        '                                                     \n ' +
        packagejson.version + '  /  ' + config.currency + '\n');
      initMongoDb(candles);
      init = false;
    } else {
      updateLastCandle(candles[0]);
    }
  });
  wsCandle.open();
});

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

function initMongoDb(previousCandles) {
  consoleJS.warn('Initialisation MongoDb');
  let db = mongoUtil.getDb();
  let collection = db.collection('candles');
  collection.deleteMany(function (err, delOK) {
    if (err) throw err;
    if (delOK) consoleJS.trace('Suppression ancienne collection');
    collection.insertMany(initJSON(previousCandles), function (err) {
      if (err) throw err;
      consoleJS.trace('Creation nouvelle collection');
    });
  });
}

function initJSON(previousCandles) {
  let candlesJSON = [];
  let period = config.RSIperiod;
  previousCandles.reverse();

  for (let i = 1; i < previousCandles.length; i++) {
    candlesJSON.push({
      MTS: previousCandles[i].mts,
      DATA: {
        CLOSE: previousCandles[i].close,
        DIFF: previousCandles[i].close - previousCandles[i - 1].close,
        AVGGAIN: "",
        AVGLOSS: "",
        RSI: ""
      },
      DATE: new Date(previousCandles[i].mts).toLocaleTimeString()
    });
  }

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    let candle = candlesJSON[i].DATA;
    if (candle.DIFF > 0) avgGain += candle.DIFF;
    else avgLoss += Math.abs(candle.DIFF);
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
  return candlesJSON;
}

function updateLastCandle(lastCandle) {
  let period = config.RSIperiod;
  let db = mongoUtil.getDb();
  let collection = db.collection('candles');

  collection.find({MTS: lastCandle.mts - (60000 * config.timestamp)}).toArray(function (err, res) {
    if (err) throw err;
    let previousCandle = res[0].DATA;
    let DIFF = Number(lastCandle.close) - Number(previousCandle.CLOSE);
    let AVGGAIN, AVGLOSS;
    if (DIFF > 0) {
      AVGGAIN = (previousCandle.AVGGAIN * (period - 1) + DIFF) / period;
      AVGLOSS = (previousCandle.AVGLOSS * (period - 1)) / period;
    } else if (DIFF < 0) {
      AVGGAIN = (previousCandle.AVGGAIN * (period - 1)) / period;
      AVGLOSS = (previousCandle.AVGLOSS * (period - 1) + Math.abs(DIFF)) / period;
    } else {
      AVGGAIN = (previousCandle.AVGGAIN * (period - 1)) / period;
      AVGLOSS = (previousCandle.AVGLOSS * (period - 1)) / period;
    }
    let RSI = 100 - (100 / (1 + (AVGGAIN / AVGLOSS)));
    let newValues = {
      $set: {
        MTS: lastCandle.mts,
        DATA: {
          CLOSE: lastCandle.close,
          DIFF: DIFF,
          AVGGAIN: AVGGAIN,
          AVGLOSS: AVGLOSS,
          RSI: RSI
        },
        DATE: new Date(lastCandle.mts).toLocaleTimeString()
      }
    };
    collection.updateOne({MTS: lastCandle.mts}, newValues, {upsert: true});
  });
}

function getDocument() {
  let db = mongoUtil.getDb();
  let collection = db.collection('candles');
  collection.find().sort({"MTS": -1}).limit(1).toArray(function (err, res) {
    if (err) throw err;
    makeDecisions(res[0].DATA)
  });
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