const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/botrsi';
const dbName = 'botrsi';
let configCollection, historyCollection, walletCollection;
let options = {
  keepAlive: 1,
  socketTimeoutMS: 5000,
  connectTimeoutMS: 5000
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
      .then(item => {
        config = item.ops[0];
        return item;
      });
  }
}

function initCollections(db) {
  configCollection = db.collection('config');
  historyCollection = db.collection('history');
  walletCollection = db.collection('wallet');
}

module.exports = {
  initMongo: function () {
    return MongoClient.connect(url, options)
      .then(client => {
        initCollections(client.db(dbName));
        return configCollection.findOne({});
      })
      .then(doc => {
        return initConfig(doc);
      })
      .catch(err => console.log(err));
  },

  updateConfigMongo: function (newConfig) {
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

  insertHistory: function (trade) {
    historyCollection.insertOne(trade)
      .catch(err => console.log(err));
  },

  getHistory: function () {
    return historyCollection.find({}).toArray();
  },

  getShortHistory: function () {
    return historyCollection.find({}).limit(4).sort({$natural: -1}).toArray();
  },

  getLastTrade: function () {
    return historyCollection.find({}).limit(1).sort({$natural: -1}).toArray();
  },

  insertWallet: function (wallet) {
    walletCollection.insertOne(wallet)
      .catch(err => console.log(err));
  },

  getWallet: function () {
    return walletCollection.find({}).toArray();
  },

  getConfig: function () {
    return config;
  }
};