const mongoUtil = require('./lib/mongodb');
const wsBitfinex = require('./lib/wsBitfinex');

// mongoUtil.connectToServer(function (err) {
//   if (err) error.info('[Mongo] - ' + err);
wsBitfinex.wsConnection();
// });