'use strict';

const services = require('../services/index');
const mongo = require('./mongodb');

exports.getConfig = function (req, res) {
  res.set('status', services.getStatus()).json(mongo.getConfig());
};

exports.getShortHistory = function (req, res) {
  mongo.getShortHistory()
    .then(history => res.json(history))
    .catch(() => res.send('historyFetchFailed'));
};

exports.getWallet = function (req, res) {
  mongo.getWallet()
    .then(wallet => res.json(wallet))
    .catch(() => res.send('walletFetchFailed'));
};

exports.start = function (req, res) {
  services.updateConfig(req.body)
    .then(running => res.set('status', running).send('ok'))
    .catch(() => res.set('status', false).send('nope'));
};

exports.stop = function (req, res) {
  services.stopWebsockets();
  res.set('status', services.getStatus()).send('stop');
};

exports.listAllTrades = function (req, res) {
  res.send('trades');
};
