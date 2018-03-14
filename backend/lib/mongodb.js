'use strict';

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/botrsi';
const dbName = 'botrsi';
let _db, collection;
let options = {
  keepAlive: 1,
  socketTimeoutMS: 10000,
  connectTimeoutMS: 10000
};
let config = {
  RSIperiod: "9",
  timestamp: "5",
  currency: "BTC",
  walletUsed: "90",
  minRSI: "30",
  maxRSI: "70"
};

function initConfig(doc) {
  if (doc) {
    config = doc;
    return doc;
  } else {
    return collection.insertOne(config)
      .then(function (item) {
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
        collection = _db.collection('config');
        return collection.findOne();
      })
      .then(function (doc) {
        return initConfig(doc);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getDb: function () {
    return _db;
  },

  getConfig: function () {
    return config;
  }
};