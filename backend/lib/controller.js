'use strict';

const services = require('../services/services');
const mongo = require('./mongodb');

exports.getConfig = function (req, res) {
  res.json(mongo.getConfig());
};

exports.updateConfig = function (req, res) {
  services.updateConfig(req.body)
    .then((function (oldConfig) {
      console.log('dans le then');
      return res.send(oldConfig);
    }));
};

exports.listAllTrades = function (req, res) {
  res.send('trades');
};
