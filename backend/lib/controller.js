'use strict';

const mongo = require('./mongodb');

exports.retrieveConfig = function (req, res) {
  res.send(mongo.getConfig());
};

exports.updateConfig = function (req, res) {
  res.send('updateconfig');
};

exports.listAllTrades = function (req, res) {
  res.send('trades');
};
