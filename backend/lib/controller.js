'use strict';

const services = require('../services/services');
const mongo = require('./mongodb');

exports.getConfig = function (req, res) {
  res.set('status', services.getStatus()).json(mongo.getConfig());
};

exports.start = function (req, res) {
  services.updateConfig(req.body)
    .then((running) => res.set('status', running).send('ok'))
    .catch(() => res.set('status', false).send('nope'));
};

exports.stop = function (req, res) {
  services.stopWebsockets();
  res.set('status', services.getStatus()).send('stop');
};

exports.listAllTrades = function (req, res) {
  res.send('trades');
};
