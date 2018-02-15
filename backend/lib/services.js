const cron = require('node-cron');
const config = require('../config/config');
const mongoUtil = require('./mongodb');
const clientTel = require('./twilio');
const {trades, console2} = require('./logger');
const wsAuth = require('./wsAuth');
let Candle = require('../models/candle');

let task = cron.schedule('*/5 * * * * *', function () {
  // makeDecisions(derniereLocalCandle.DATA);
}, false);

let derniereLocalCandle = new Candle();
let avantDerniereLocalCandle = new Candle();
let buy, sell, position;
let walletUSD, walletCrypto;

function makeDecisions(lastCandle) {
  if (!position) {
    if (lastCandle.RSI < 30) {
      console2.warn('Buy order executed');
      buy = lastCandle.CLOSE;
      trades.info('Achat au prix de : $', buy);
      position = true;
    }
  } else if (position) {
    if (lastCandle.RSI > 70) {
      console2.warn('Sell order executed\n');
      sell = lastCandle.CLOSE;
      trades.info('Vente au prix de: $', sell);
      trades.trace('Variation après fees: %', ((((sell / buy) - 1) * 100).toFixed(2) - 0.4) + '\n');
      clientTel.sendSMS(buy, sell);
      position = false;
    }
  }
}

function initBot(usd, crypto) {
  walletUSD = usd;
  walletCrypto = crypto;
  position = !!walletCrypto;
  wsAuth.buy();
  task.start();
}

function initCandleStack(previousCandles) {
  initJSON(previousCandles);
  // console2.warn('Initialisation MongoDb');
  // let db = mongoUtil.getDb();
  // let collection = db.collection('candles');
  // collection.deleteMany(function (err, delOK) {
  //   if (err) throw err;
  //   if (delOK) console2.trace('Suppression ancienne collection');
  //   collection.insertMany(initJSON(previousCandles), function (err) {
  //     if (err) throw err;
  //     console2.trace('Creation nouvelle collection');
  //     console2.warn('Waiting for trades..\n');
  //   });
  // });
}

function initJSON(previousCandles) {
  previousCandles.reverse();
  let candlesJSON = [];

  // USE CANDLE MODEL !!
  for (let i = 1; i < previousCandles.length; i++) {
    candlesJSON.push({
      MTS: previousCandles[i][0],
      DATA: {
        CLOSE: previousCandles[i][2],
        DIFF: previousCandles[i][2] - previousCandles[i - 1][2],
        AVGGAIN: "",
        AVGLOSS: "",
        RSI: ""
      },
      DATE: new Date(previousCandles[i][0]).toLocaleTimeString()
    });
  }

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= config.RSIperiod; i++) {
    let candle = candlesJSON[i].DATA;
    if (candle.DIFF > 0) avgGain += candle.DIFF;
    else avgLoss += Math.abs(candle.DIFF);
  }
  let firstDynamicCandle = candlesJSON[config.RSIperiod].DATA;
  firstDynamicCandle.AVGGAIN = avgGain / Number(config.RSIperiod);
  firstDynamicCandle.AVGLOSS = avgLoss / Number(config.RSIperiod);

  for (let i = Number(config.RSIperiod) + 1; i < previousCandles.length - 1; i++) {
    let previousCandle = candlesJSON[i - 1].DATA;
    let candle = candlesJSON[i].DATA;
    let previousAvgGain = previousCandle.AVGGAIN;
    let previousAvgLoss = previousCandle.AVGLOSS;
    let diff = candle.DIFF;
    if (diff > 0) {
      candle.AVGGAIN = (previousAvgGain * (Number(config.RSIperiod) - 1) + diff) / Number(config.RSIperiod);
      candle.AVGLOSS = (previousAvgLoss * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
    } else if (diff < 0) {
      candle.AVGGAIN = (previousAvgGain * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
      candle.AVGLOSS = (previousAvgLoss * (Number(config.RSIperiod) - 1) + Math.abs(diff)) / Number(config.RSIperiod);
    } else {
      candle.AVGGAIN = (previousAvgGain * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
      candle.AVGLOSS = (previousAvgLoss * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
    }
    candle.RSI = 100 - (100 / (1 + (candle.AVGGAIN / candle.AVGLOSS)));

    avantDerniereLocalCandle.MTS = derniereLocalCandle.MTS;
    avantDerniereLocalCandle.DATA = derniereLocalCandle.DATA;
    avantDerniereLocalCandle.DATE = derniereLocalCandle.DATE;

    derniereLocalCandle.MTS = candlesJSON[i].MTS;
    derniereLocalCandle.DATA = candle;
    derniereLocalCandle.DATE = candlesJSON[i].DATE;
  }
  return candlesJSON;
}

function manageCandle(lastCandle) {
  if (lastCandle[0] > derniereLocalCandle.MTS) {
    // updateMongoDb();
    avantDerniereLocalCandle.MTS = derniereLocalCandle.MTS;
    avantDerniereLocalCandle.DATA.CLOSE = derniereLocalCandle.DATA.CLOSE;
    avantDerniereLocalCandle.DATA.DIFF = derniereLocalCandle.DATA.DIFF;
    avantDerniereLocalCandle.DATA.AVGGAIN = derniereLocalCandle.DATA.AVGGAIN;
    avantDerniereLocalCandle.DATA.AVGLOSS = derniereLocalCandle.DATA.AVGLOSS;
    avantDerniereLocalCandle.DATA.RSI = derniereLocalCandle.DATA.RSI;
    avantDerniereLocalCandle.DATE = derniereLocalCandle.DATE;
    updateLocalLastCandle(lastCandle);
  }
  else if (lastCandle[0] === derniereLocalCandle.MTS) {
    updateLocalLastCandle(lastCandle);
  }
}

function updateLocalLastCandle(lastCandle) {
  derniereLocalCandle.MTS = lastCandle[0];
  derniereLocalCandle.DATA.CLOSE = lastCandle[2];
  derniereLocalCandle.DATA.DIFF = derniereLocalCandle.DATA.CLOSE - avantDerniereLocalCandle.DATA.CLOSE;
  if (derniereLocalCandle.DATA.DIFF > 0) {
    derniereLocalCandle.DATA.AVGGAIN = (avantDerniereLocalCandle.DATA.AVGGAIN * (Number(config.RSIperiod) - 1) + derniereLocalCandle.DATA.DIFF) / Number(config.RSIperiod);
    derniereLocalCandle.DATA.AVGLOSS = (avantDerniereLocalCandle.DATA.AVGLOSS * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
  } else if (derniereLocalCandle.DATA.DIFF < 0) {
    derniereLocalCandle.DATA.AVGGAIN = (avantDerniereLocalCandle.DATA.AVGGAIN * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
    derniereLocalCandle.DATA.AVGLOSS = (avantDerniereLocalCandle.DATA.AVGLOSS * (Number(config.RSIperiod) - 1) + Math.abs(derniereLocalCandle.DATA.DIFF)) / Number(config.RSIperiod);
  } else {
    derniereLocalCandle.DATA.AVGGAIN = (avantDerniereLocalCandle.DATA.AVGGAIN * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
    derniereLocalCandle.DATA.AVGLOSS = (avantDerniereLocalCandle.DATA.AVGLOSS * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
  }
  derniereLocalCandle.DATA.RSI = 100 - (100 / (1 + (derniereLocalCandle.DATA.AVGGAIN / derniereLocalCandle.DATA.AVGLOSS)));
  derniereLocalCandle.DATE = new Date(derniereLocalCandle.MTS).toLocaleTimeString();
}

function updateMongoDb() {
  let db = mongoUtil.getDb();
  let collection = db.collection('candles');
  let newValues = {
    $set: {
      MTS: derniereLocalCandle.MTS,
      DATA: {
        CLOSE: derniereLocalCandle.DATA.CLOSE,
        DIFF: derniereLocalCandle.DATA.DIFF,
        AVGGAIN: derniereLocalCandle.DATA.AVGGAIN,
        AVGLOSS: derniereLocalCandle.DATA.AVGLOSS,
        RSI: derniereLocalCandle.DATA.RSI
      },
      DATE: new Date(derniereLocalCandle.MTS).toLocaleTimeString()
    }
  };
  collection.updateOne({MTS: derniereLocalCandle.MTS}, newValues, {upsert: true});
}

module.exports.initCandleStack = initCandleStack;
module.exports.manageCandle = manageCandle;
module.exports.initBot = initBot;