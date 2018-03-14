'use strict';

const MongoClient = require('mongodb').MongoClient;
const config = require('../config/config');

const url = 'mongodb://localhost:27017/botrsi';
const dbName = 'botrsi';
let _db;
let _config;
let options = {
  keepAlive: 1,
  socketTimeoutMS: 10000,
  connectTimeoutMS: 10000
};

module.exports = {
  initConfig: function () {
    return MongoClient.connect(url, options)
      .then(function (client) {
        console.log('init mongodb');
        _db = client.db(dbName);
        const collection = _db.collection('config');
        return collection.findOne()
          .then(function (item) {
            if (item) {
              _config = item;
              return item
            } else {
              return collection.insertOne(config)
                .then(function (item) {
                  _config = item.ops[0];
                  console.log('final action');
                  return item;
                });
            }
          });
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