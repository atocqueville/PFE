'use strict';

let log4js = require('log4js');

log4js.configure({
  appenders: {
    tradesLogs: {type: 'file', filename: 'logs/trades.log'},
    errorLogs: {type: 'file', filename: 'logs/errors.log'},
    responseLogs: {type: 'file', filename: 'logs/response.log'},
    console: {type: 'console'}
  },
  categories: {
    trades: {appenders: ['tradesLogs'], level: 'trace'},
    error: {appenders: ['errorLogs'], level: 'trace'},
    response: {appenders: ['responseLogs'], level: 'trace'},
    default: {appenders: ['console'], level: 'trace'}
  }
});

const trades = log4js.getLogger('trades');
const error = log4js.getLogger('error');
const response = log4js.getLogger('response');
const console2 = log4js.getLogger('');

module.exports = {
  trades,
  error,
  response,
  console2
};