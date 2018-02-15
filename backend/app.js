const mongoUtil = require('./lib/mongodb');
const wsBitfinex = require('./lib/wsPublic');
const version = require('./package').version;
const config = require('./config/config');
const {console2} = require('./lib/logger');


// mongoUtil.connectToServer(function (err) {
//   if (err) error.info('[Mongo] - ' + err);
// initConsole();
// wsBitfinex.wsConnection();
// });

function initConsole() {
  console.log('\n' +
    '            ____        __     ____ _____ ____       \n' +
    '           / __ )____  / /_   / __ / ___//  _/       \n' +
    ' ______   / __  / __ \\/ __/  / /_/ \\__ \\ / /   ______\n' +
    '/_____/  / /_/ / /_/ / /_   / _, ____/ _/ /   /_____/\n' +
    '        /_____/\\____/\\__/  /_/ |_/____/___/          \n' +
    '                                                     \n ' +
    version + '  /  ' + config.currency + '  /  ' +
    config.timestamp + 'mn' + '  /  RSI ' + config.RSIperiod + '\n');
  console2.info('Connection established with Bitfinex API');
  console2.warn('Waiting for trades..\n');
}