'use strict';

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/botrsi';
const dbName = 'botrsi';
let _db;
let options = {
  keepAlive: 1,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 60000
};

module.exports = {
  connectToServer: function (callback) {
    MongoClient.connect(url, options, function (err, client) {
      if (err) console.log(err);
      _db = client.db(dbName);
      return callback(err);
    });
  },

  getDb: function () {
    return _db;
  }
};