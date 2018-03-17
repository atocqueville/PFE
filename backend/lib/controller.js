'use strict';

const services = require('../services/services');
const mongo = require('./mongodb');

exports.getConfig = function (req, res) {
  res.set('status', services.getStatus()).json(mongo.getConfig());
};

exports.updateConfig = function (req, res) {
  services.updateConfig(req.body)
    .then((running) => res.set('status', running).send('ok'))
    .catch(() => res.send('nope'));
};

exports.listAllTrades = function (req, res) {
  res.send('trades');
};
