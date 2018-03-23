'use strict';

const mongo = require('../lib/mongodb');
const clientTel = require('../lib/twilio');
const {trades} = require('../lib/logger');

let buy, sell, walletUSD;


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