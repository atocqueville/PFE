const mongo = require('../lib/mongodb');
const wsAuth = require('./wsAuth');
const clientTel = require('../lib/twilio');
const {trades} = require('../lib/logger');
console.log(wsAuth);
let derniereLocalCandle, config, buy, sell, walletUSD, walletCrypto, orderAmount, position = false;

module.exports = {
  setWalletAndLastTrade: function () {
    mongo.getLastTrade()
      .then(trade => {
        if (trade[0].type === 'BUY') {
          buy = trade[0].value;
          position = true;
        }
      })
      .catch(err => console.log(err));

    // UTILE ??
    mongo.getLastWallet()
      .then(wallet => walletUSD = wallet[0].balance)
      .catch(err => console.log(err));
  },

  makeDecisions: function () {
    console.log(`${derniereLocalCandle.DATA.CLOSE}, RSI: ${derniereLocalCandle.DATA.RSI}`);
    // if (!position) {
    //   if (derniereLocalCandle.DATA.RSI < config.minRSI) {
    //     orderAmount = ((walletUSD / derniereLocalCandle.DATA.CLOSE) * (Number(config.walletUsed) / 100)).toString();
    //     wsAuth.newOrder(orderAmount);
    //   }
    // } else if (position) {
    //   if (derniereLocalCandle.DATA.RSI > config.maxRSI) {
    //     orderAmount = (-1 * walletCrypto).toString();
    //     wsAuth.newOrder(orderAmount);
    //   }
    // }
  },

  updateWallet: function (usd, crypto) {
    walletUSD = usd;
    walletCrypto = crypto;
  },

  setDerniereCandle: function (candle) {
    derniereLocalCandle = candle;
  },

  setBuy: function (price) {
    buy = price;
    position = true;
    trades.info(`Achat au prix de : ${buy}$`);
  },

  setSell: function (price) {
    sell = price;
    position = false;
    trades.info(`Vente au prix de: ${sell}$ \n`);
    clientTel.sendSMS(buy, sell);
  },

  setConfig: function (configMongo) {
    config = configMongo;
  }
};