const mongo = require('../lib/mongodb');
const wsAuth = require('./wsAuth');
const clientTel = require('../lib/twilio');
const {trades} = require('../lib/logger');
const {Trade, WalletBalance} = require('../model/model');

let lastCandle, config, tradeMongo, walletUSD, walletCrypto, previousTrade, position = false;

module.exports = {
  setPreviousData: function () {
    mongo.getLastTrade()
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
        wsAuth.newOrder(orderAmount);
      }
    } else if (position) {
      if (lastCandle.DATA.RSI > config.maxRSI) {
        let orderAmount = (-1 * walletCrypto).toString();
        wsAuth.newOrder(orderAmount);
      }
    }
  },

  updateWallet: function (usd, crypto) {
    walletUSD = usd;
    walletCrypto = crypto;
    //TODO refacto cette merde
    if (walletCrypto !== 0) mongo.insertWallet(new WalletBalance(walletUSD))
  },

  setLastCandle: function (candle) {
    lastCandle = candle;
  },

  setBuy: function (trade) {
    tradeMongo = new Trade('Buy', config.currency, trade[5], trade[4], trade[2]);
    mongo.insertHistory(tradeMongo);
    previousTrade = tradeMongo;
    console.log(previousTrade);
    position = true;
    trades.info(`Achat au prix de : ${trade[5]}$`);
  },

  setSell: function (trade) {
    tradeMongo = new Trade('Sell', config.currency, trade[5], trade[4], trade[2]);
    mongo.insertHistory(tradeMongo);
    position = false;
    console.log(tradeMongo);
    trades.info(`Vente au prix de: ${trade[5]}$ \n`);
    clientTel.sendSMS(previousTrade, tradeMongo);
  },

  setConfig: function (configMongo) {
    config = configMongo;
  }
};