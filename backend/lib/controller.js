'use strict';

const services = require('../services/services');
const mongo = require('./mongodb');

exports.getConfig = function (req, res) {
  res.json(mongo.getConfig());
};

exports.updateConfig = async function (req, res) {
  await services.updateConfig(req.body);
  res.send('updateconfig');
};

exports.listAllTrades = function (req, res) {
  res.send('trades');
};
