'use strict';

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/botrsi';
const dbName = 'botrsi';
let _db, configCollection;
let options = {
  keepAlive: 1,
  socketTimeoutMS: 10000,
  connectTimeoutMS: 10000
};
let config = {
  currency: "BTC",
  timestamp: "5",
  RSIperiod: "9",
  walletUsed: "90",
  minRSI: "30",
  maxRSI: "70"
};

function initConfig(doc) {
  if (doc) {
    config = doc;
    return doc;
  } else {
    return configCollection.insertOne(config)
      .then(function (item) { // TODO: RETRIEVE CONFIG AND SET VALUE
        config = item.ops[0];
        return item;
      });
  }
}

module.exports = {
  init: function () {
    return MongoClient.connect(url, options)
      .then(function (client) {
        _db = client.db(dbName);
        configCollection = _db.collection('config');
        return configCollection.findOne();
      })
      .then(function (doc) {
        return initConfig(doc);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  updateConfig: function (newConfig) {
    return configCollection.updateOne({}, {
      $set: {
        currency: newConfig.currency,
        timestamp: newConfig.timestamp,
        RSIperiod: newConfig.RSIperiod,
        walletUsed: newConfig.walletUsed,
        minRSI: newConfig.minRSI,
        maxRSI: newConfig.maxRSI
      }
    }).then((response) => { // TODO: RETRIEVE CONFIG AND SET VALUE ET POURQUOI DESYNCHRO
      console.log('mongodbbb', response.result)
    });
  },

  getDb: function () {
    return _db;
  },

  getConfig: function () {
    return config;
  }
};