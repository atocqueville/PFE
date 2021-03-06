'use strict';

const bodyParser = require('body-parser');
const controller = require('./controller');

module.exports = function (app) {

  app.use(bodyParser.json({type: 'application/json'}));

  app.route('/config')
    .get(controller.getConfig);

  app.route('/history')
    .get(controller.getShortHistory);

  app.route('/config/status')
    .get(controller.stop)
    .post(controller.start);

  app.route('/wallet')
    .get(controller.getWallet);

  app.route('/stats')
    .get(controller.listAllTrades);
};