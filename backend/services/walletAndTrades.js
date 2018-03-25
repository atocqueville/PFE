const mongo = require('../lib/mongodb');
const wsAuth = require('./wsAuth');
const clientTel = require('../lib/twilio');
const {trades} = require('../lib/logger');

let buy, sell, walletUSD, walletCrypto, orderAmount;
let derniereLocalCandle;

module.exports = {
  setWalletAndLastTrade: function () {
    mongo.getLastTrade()
      .then(trade => {
        if (trade[0].type === 'BUY') buy = trade[0].value;
      })
      .catch(err => console.log(err));
    mongo.getLastWallet()
      .then(wallet => walletUSD = wallet[0].balance)
      .catch(err => console.log(err));
  },

  makeDecisions: function () {
    // if (!position) {
    //   if (lastCandle.RSI < config.minRSI) {
    //     orderAmount = ((walletUSD / lastCandle.CLOSE) * (Number(config.walletUsed) / 100)).toString();
    //     wsAuth.newOrder(orderAmount);
    //   }
    // } else if (position) {
    //   if (lastCandle.RSI > config.maxRSI) {
    //     orderAmount = (-1 * walletCrypto).toString();
    //     wsAuth.newOrder(orderAmount);
    //   }
    // }
    // console.log(derniereLocalCandle);
  },

  updateWallet: function (usd, crypto) {
    walletUSD = usd;
    walletCrypto = crypto;
    // position = !!walletCrypto; TODO: set position dans index ?
  },

  setDerniereCandle: function (candle) {
    derniereLocalCandle = candle;
  },

  setBuy: function (price) {
    buy = price;
    trades.info(`Achat au prix de : ${buy}$`);
  },

  setSell: function (price) {
    sell = price;
    trades.info('Vente au prix de: $', sell + '\n');
    clientTel.sendSMS(buy, sell);
  }
};