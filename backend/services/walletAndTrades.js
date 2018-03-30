const {getLastTrade, insertHistory, insertWallet} = require('../lib/mongodb');
const {sendSMS} = require('../lib/twilio');
const {trades} = require('../lib/logger');
const {Trade, WalletBalance} = require('../model/model');
const {newOrder} = require('./wsAuth');

let lastCandle, config, tradeMongo, walletUSD, walletCrypto, previousTrade, position = false;

module.exports = {
  setPreviousData: function () {
    getLastTrade()
      .then(trade => {
        if (trade.length) {
          if (trade[0].type === 'Buy') {
            previousTrade = trade[0];
            position = true;
          }
        }
      })
      .catch(err => console.log(err));
  },

  makeDecisions: function () {
    if (!position) {
      if (lastCandle.DATA.RSI < config.minRSI) {
        let orderAmount = ((walletUSD / lastCandle.DATA.CLOSE) * (Number(config.walletUsed) / 100)).toString();
        console.log('buy');
        newOrder(orderAmount);
      }
    } else if (position) {
      if (lastCandle.DATA.RSI > config.maxRSI) {
        let orderAmount = (-1 * walletCrypto).toString();
        console.log('sell');
        newOrder(orderAmount);
      }
    }
  },

  updateWallet: function (usd, crypto) {
    walletUSD = usd;
    walletCrypto = crypto;
    if (walletCrypto === 0) {
      setTimeout(function () {
        insertWallet(new WalletBalance(walletUSD))
      }, 3000);
    }
  },

  setLastCandle: function (candle) {
    lastCandle = candle;
  },

  setBuy: function (trade) {
    tradeMongo = new Trade('Buy', config.currency, trade[5], trade[4], trade[2]);
    insertHistory(tradeMongo);
    previousTrade = tradeMongo;
    position = true;
    trades.info(`Achat au prix de : ${trade[5]}$`);
  },

  setSell: function (trade) {
    tradeMongo = new Trade('Sell', config.currency, trade[5], trade[4], trade[2]);
    insertHistory(tradeMongo);
    position = false;
    trades.info(`Vente au prix de: ${trade[5]}$ \n`);
    sendSMS(previousTrade, tradeMongo);
  },

  setConfig: function (configMongo) {
    config = configMongo;
  }
};

