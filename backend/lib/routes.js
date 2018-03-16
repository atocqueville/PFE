'use strict';

const bodyParser = require('body-parser');

module.exports = function (app) {
  const controller = require('./controller');

  app.use(bodyParser.json({type: 'application/json'}));

  app.route('/config')
    .get(controller.getConfig)
    .post(controller.updateConfig);

  app.route('/stats')
    .get(controller.listAllTrades)
};