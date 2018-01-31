'use strict';

let log4js = require('log4js');

log4js.configure({
  appenders: {
    tradesLogs: {type: 'file', filename: 'logger.log'},
    errorLogs: {type: 'file', filename: 'errors.log'},
    console: {type: 'console'}
  },
  categories: {
    trades: {appenders: ['tradesLogs'], level: 'trace'},
    error: {appenders: ['errorLogs'], level: 'trace'},
    default: {appenders: ['console'], level: 'trace'}
  }
});

module.exports = log4js;