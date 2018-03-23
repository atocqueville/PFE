const cron = require('node-cron');
const mongo = require('../lib/mongodb');
const wsPublic = require('./wsPublic');
const wsAuth = require('./wsAuth');
const twilioConfigSetter = require('../lib/twilio').setConfig;
const wsAuthConfigSetter = require('./wsAuth').setConfig;
const wsPublicConfigSetter = require('./wsPublic').setConfig;
const candleCalcSetter = require('./candleCalc').setConfig;
const localWalletSetter = require('./walletAndTrades').setWalletAndLastTrade;

let config, derniereLocalCandle;
let walletUSD, walletCrypto, orderAmount, position;
let status = false;

let task = cron.schedule('*/5 * * * * *', function () {
  // makeDecisions(derniereLocalCandle.DATA);
  // console.log(derniereLocalCandle.DATA.CLOSE);
}, false);

function startWebsockets() {
  wsPublic.connection();
  wsAuth.connection();
  status = true;
}

function stopWebsockets() {
  wsPublic.closeWebsocket();
  wsAuth.closeWebsocket();
  status = false;
}

function makeDecisions(lastCandle) {
  if (!position) {
    if (lastCandle.RSI < config.minRSI) {
      orderAmount = ((walletUSD / lastCandle.CLOSE) * (Number(config.walletUsed) / 100)).toString();
      wsAuth.newOrder(orderAmount);
    }
  } else if (position) {
    if (lastCandle.RSI > config.maxRSI) {
      orderAmount = (-1 * walletCrypto).toString();
      wsAuth.newOrder(orderAmount);
    }
  }
}

function updateWallet(usd, crypto) {
  walletUSD = usd;
  walletCrypto = crypto;
  position = !!walletCrypto;
}

async function updateConfig(newConfig) {
  await mongo.updateConfig(newConfig);
  initMongoFetch();
  startWebsockets();
  return status;
}

function initMongoFetch() {
  config = mongo.getConfig();
  twilioConfigSetter(config);
  wsPublicConfigSetter(config);
  wsAuthConfigSetter(config);
  candleCalcSetter(config);
  localWalletSetter();
}

function taskStopStart(bool) {
  //TODO refacto start/stop
  if (bool) task.start();
  else if (!bool) task.stop();
}

function getStatus() {
  return status;
}

function setDerniereCandle(candle) {
  derniereLocalCandle = candle;
}

module.exports.startWebsockets = startWebsockets;
module.exports.stopWebsockets = stopWebsockets;
module.exports.updateWallet = updateWallet;
module.exports.updateConfig = updateConfig;
module.exports.initMongoFetch = initMongoFetch;
module.exports.taskStopStart = taskStopStart;
module.exports.getStatus = getStatus;
module.exports.setDerniereCandle = setDerniereCandle;