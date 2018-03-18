const cron = require('node-cron');
const mongo = require('../lib/mongodb');
const clientTel = require('../lib/twilio');
const {trades, console2} = require('../lib/logger');
const wsPublic = require('./wsPublic');
const wsAuth = require('./wsAuth');
const Candle = require('../model/model').candle;
const twilioConfigSetter = require('../lib/twilio').setConfig;
const wsAuthConfigSetter = require('./wsAuth').setConfig;
const wsPublicConfigSetter = require('./wsPublic').setConfig;

let config;
let derniereLocalCandle = new Candle();
let avantDerniereLocalCandle = new Candle();
let buy, sell, position;
let walletUSD, walletCrypto, orderAmount, buyAmount, benef;
let status = false;

let task = cron.schedule('*/5 * * * * *', function () {
  // makeDecisions(derniereLocalCandle.DATA);
  console.log(derniereLocalCandle.DATA.CLOSE);
}, false);

async function updateConfig(newConfig) {
  await mongo.updateConfig(newConfig);
  initConfig();
  startWebsockets();
  return status;
}

function startWebsockets() {
  wsPublic.connection();
  wsAuth.connection();
  task.start();
  status = true;
}

function stopWebsockets() {
  wsPublic.closeWebsocket();
  wsAuth.closeWebsocket();
  task.stop();
  status = false;
}

function makeDecisions(lastCandle) {
  if (!position) {
    if (lastCandle.RSI < config.minRSI) {
      console2.warn('buy order executed');
      orderAmount = ((walletUSD / lastCandle.CLOSE) * (Number(config.walletUsed) / 100)).toString();
      wsAuth.newOrder(orderAmount);
    }
  } else if (position) {
    if (lastCandle.RSI > config.maxRSI) {
      console2.warn('sell order executed\n');
      orderAmount = (-1 * walletCrypto).toString();
      wsAuth.newOrder(orderAmount);
    }
  }
}

function setBuy(price, amountBought) {
  buy = price;
  buyAmount = amountBought;
  trades.info(`Achat au prix de : ${buy}$`);
}

function setSell(price, amountSold) {
  sell = price;
  trades.info('Vente au prix de: $', sell + '\n');
  benef = Number((amountSold * sell * (-1)) - (buyAmount * buy)).toFixed(2);
  clientTel.sendSMS(buy, sell, benef);
}

function updateWallet(usd, crypto, init) {
  walletUSD = usd;
  walletCrypto = crypto;
  position = !!walletCrypto;
  if (init) {
    // TODO REFACTO OLD BUY
    // if (walletCrypto) buy = Number(fs.readFileSync('./logs/trades.log').toString('utf-8').split('\r\n').reverse()[1].split('$')[1]);
  }
}

function initCandleStack(previousCandles) {
  previousCandles.reverse();
  let candlesJSON = [];

  let candleTemplate;
  for (let i = 1; i < previousCandles.length; i++) {
    candleTemplate = new Candle();
    candleTemplate.MTS = previousCandles[i][0];
    candleTemplate.DATA.CLOSE = previousCandles[i][2];
    candleTemplate.DATA.DIFF = previousCandles[i][2] - previousCandles[i - 1][2];
    candleTemplate.DATE = new Date(previousCandles[i][0]).toLocaleTimeString();
    candlesJSON.push(candleTemplate);
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

function getStatus() {
  return status;
}

function initConfig() {
  config = mongo.getConfig();
  twilioConfigSetter(config);
  wsPublicConfigSetter(config);
  wsAuthConfigSetter(config);
}

module.exports.initConfig = initConfig;
module.exports.updateConfig = updateConfig;
module.exports.startWebsockets = startWebsockets;
module.exports.stopWebsockets = stopWebsockets;
module.exports.initCandleStack = initCandleStack;
module.exports.manageCandle = manageCandle;
module.exports.updateWallet = updateWallet;
module.exports.setSell = setSell;
module.exports.getStatus = getStatus;
module.exports.setBuy = setBuy;