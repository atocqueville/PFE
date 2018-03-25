const mongo = require('../lib/mongodb');
const wsAuth = require('./wsAuth');
const clientTel = require('../lib/twilio');
const {trades} = require('../lib/logger');
const {Trade} = require('../model/model');

let derniereLocalCandle, config, tradeMongo, buy, sell, walletUSD, walletCrypto, orderAmount, position = false;

module.exports = {
  setLastTrade: function () {
    mongo.getLastTrade()
      .then(trade => {
        if (trade.length) {
          if (trade[0].type === 'Buy') {
            buy = trade[0].value;
            position = true;
          }
        }
      })
      .catch(err => console.log(err));
  },

  makeDecisions: function () {
    if (!position) {
      if (derniereLocalCandle.DATA.RSI < config.minRSI) {
        orderAmount = ((walletUSD / derniereLocalCandle.DATA.CLOSE) * (Number(config.walletUsed) / 100)).toString();
        wsAuth.newOrder(orderAmount);
      }
    } else if (position) {
      if (derniereLocalCandle.DATA.RSI > config.maxRSI) {
        orderAmount = (-1 * walletCrypto).toString();
        wsAuth.newOrder(orderAmount);
      }
    }
  },

  updateWallet: function (usd, crypto) {
    walletUSD = usd;
    walletCrypto = crypto;
  },

  setDerniereCandle: function (candle) {
    derniereLocalCandle = candle;
  },

  setBuy: function (trade) {
    tradeMongo = new Trade('Buy', config.currency, trade[5], trade[4], trade[2]);
    mongo.insertHistory(tradeMongo);
    buy = trade[5];
    position = true;
    trades.info(`Achat au prix de : ${buy}$`);
  },

  setSell: function (trade) {
    tradeMongo = new Trade('Sell', config.currency, trade[5], trade[4], trade[2]);
    mongo.insertHistory(tradeMongo);
    sell = trade[5];
    position = false;
    trades.info(`Vente au prix de: ${sell}$ \n`);
    clientTel.sendSMS(buy, sell);
  },

  setConfig: function (configMongo) {
    config = configMongo;
  }
};