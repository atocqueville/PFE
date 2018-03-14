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
  connectToServer: function (callback) {
    MongoClient.connect(url, options)
      .then(function (client) {
        console.log('init mongodb');
        _db = client.db(dbName);
        const collection = _db.collection('config');
        collection.find({}).toArray(function (err, docs) {
          if (!docs.length) {
            console.log('pas de config en base');
            collection.insertOne(config, function (err, res) {
              if (err) throw err;
              _config = res.ops[0];
              return callback(client);
            });
          } else {
            console.log('exists, on recupere la config en base');
            collection.findOne(function (err, res) {
              if (err) throw err;
              _config = res;
              return callback(client);
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