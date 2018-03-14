'use strict';

const MongoClient = require('mongodb').MongoClient;
const config = require('../config/config');

const url = 'mongodb://localhost:27017/botrsi';
const dbName = 'botrsi';
let _db, _config, collection;
let options = {
  keepAlive: 1,
  socketTimeoutMS: 10000,
  connectTimeoutMS: 10000
};

function initConfig(doc) {
  if (doc) {
    _config = doc;
    return doc;
  } else {
    return collection.insertOne(config)
      .then(function (item) {
        _config = item.ops[0];
        return item;
      });
  }
}

module.exports = {
  initMongo: function () {
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
    return _config;
  }
};