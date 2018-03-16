'use strict';

module.exports = function (app) {
  const controller = require('./controller');

  app.route('/config')
    .get(controller.retrieveConfig)
    .post(controller.updateConfig);

  app.route('/stats')
    .get(controller.listAllTrades)
};