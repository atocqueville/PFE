const cron = require('node-cron');
const mongo = require('../lib/mongodb');
const clientTel = require('../lib/twilio');
const {trades, console2} = require('../lib/logger');
const wsPublic = require('./wsPublic');
const wsAuth = require('./wsAuth');
const twilioConfigSetter = require('../lib/twilio').setConfig;
const wsAuthConfigSetter = require('./wsAuth').setConfig;
const wsPublicConfigSetter = require('./wsPublic').setConfig;
const candleCalcSetter = require('./candleCalc').setConfig;

let config, derniereLocalCandle, avantDerniereLocalCandle, buy, sell;
let walletUSD, walletCrypto, orderAmount, buyAmount, benef, position;
let status = false;

let task = cron.schedule('*/5 * * * * *', function () {
  // makeDecisions(derniereLocalCandle.DATA);
  console.log(derniereLocalCandle.DATA.CLOSE);
}, false);

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

async function updateConfig(newConfig) {
  await mongo.updateConfig(newConfig);
  initConfig();
  startWebsockets();
  return status;
}

function initConfig() {
  config = mongo.getConfig();
  twilioConfigSetter(config);
  wsPublicConfigSetter(config);
  wsAuthConfigSetter(config);
  candleCalcSetter(config);
  startWebsockets();
}

function getStatus() {
  return status;
}

function setAvantDerniereCandle(candle) {
  avantDerniereLocalCandle = candle;
}

function setDerniereCandle(candle) {
  derniereLocalCandle = candle;
}

module.exports.initConfig = initConfig;
module.exports.updateConfig = updateConfig;
module.exports.startWebsockets = startWebsockets;
module.exports.stopWebsockets = stopWebsockets;
module.exports.setAvantDerniereCandle = setAvantDerniereCandle;
module.exports.setDerniereCandle = setDerniereCandle;
module.exports.updateWallet = updateWallet;
module.exports.setSell = setSell;
module.exports.getStatus = getStatus;
module.exports.setBuy = setBuy;