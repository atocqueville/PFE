const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/botrsi';
const dbName = 'botrsi';
let _db, configCollection, historyCollection, walletCollection;
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

let walletFaked = {
  balance: "1000",
  date: new Date().toLocaleDateString()
};

function initConfig(doc) {
  if (doc) {
    config = doc;
    return doc;
  } else {
    return configCollection.insertOne(config)
      .then(item => {
        config = item.ops[0];
        return item;
      });
  }
}

module.exports = {
  init: function () {
    return MongoClient.connect(url, options)
      .then(client => {
        _db = client.db(dbName);
        configCollection = _db.collection('config');
        return configCollection.findOne({});
      })
      .then(doc => {
        return initConfig(doc);
      })
      .catch(err => console.log(err));
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
    }).then(() => configCollection.findOne())
      .then(doc => config = doc);
  },

  getHistory: function () {
    return _db.collection('history').find({}).toArray();
  },

  getLastTrade: function () {
    return _db.collection('history').find({}).limit(1).sort({$natural: -1}).toArray();
  },

  getShortHistory: function () {
    return _db.collection('history').find({}).limit(4).sort({$natural: -1}).toArray();
  },

  getWallet: function () {
    return _db.collection('wallet').find({}).toArray();
  },

  getLastWallet: function () {
    return _db.collection('wallet').find({}).limit(1).sort({$natural: -1}).toArray();
  },

  insertHistory: function (trade) {
    historyCollection = _db.collection('history');
    historyCollection.insertOne(trade)
      .catch(err => console.log(err));
  },

  insertWallet: function () {
    walletCollection = _db.collection('wallet');
    walletCollection.insertOne(walletFaked)
      .then(item => console.log(item));
  },

  getConfig: function () {
    return config;
  }
};