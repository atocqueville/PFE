// const mongoUtil = require('./lib/mongodb');
const wsPublic = require('./lib/wsPublic');
const wsAuth = require('./lib/wsAuth');
const version = require('./package').version;
const config = require('./config/config');
const {console2} = require('./lib/logger');

// mongoUtil.connectToServer(function (err) {
//   if (err) error.info('[Mongo] - ' + err);
initConsole();
wsPublic.wsPublicConnection();
wsAuth.wsAuthConnection();
// });

function initConsole() {
  console.log(version + '  /  ' + config.currency + '  /  ' + config.timestamp +
    'mn' + '  /  RSI ' + config.RSIperiod + '\n');
}