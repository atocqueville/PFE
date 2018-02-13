const Crypto = require('crypto-js');
const WebSocket = require('ws');
const apiKeys = require('../config/apikeys');
const config = require('../config/config');
const services = require('../lib/services');
const {error, console2} = require('../lib/logger');
const version = require('../package').version;
const url = 'wss://api.bitfinex.com/ws/2/';
const CANDLE_KEY = 'trade:' + config.timestamp + 'm:t' + config.currency + 'USD';

let lastBuyOrderId;
let lastSellOrderId;
let channelID;

function wsConnection() {
  const payload = {
    event: 'subscribe',
    channel: 'candles',
    key: CANDLE_KEY
  };
  const ws = new WebSocket(url);

  ws.on('open', () => {
    console.log('\n' +
      '            ____        __     ____ _____ ____       \n' +
      '           / __ )____  / /_   / __ / ___//  _/       \n' +
      ' ______   / __  / __ \\/ __/  / /_/ \\__ \\ / /   ______\n' +
      '/_____/  / /_/ / /_/ / /_   / _, ____/ _/ /   /_____/\n' +
      '        /_____/\\____/\\__/  /_/ |_/____/___/          \n' +
      '                                                     \n ' +
      version + '  /  ' + config.currency + '  /  ' +
      config.timestamp + 'mn' + '  /  RSI ' + config.RSIperiod + '\n');
    ws.send(JSON.stringify(payload));
    console2.info('Connection established with Bitfinex API');
  });
  ws.on('message', (res) => {
    let msg = JSON.parse(res);
    if (msg.event && msg.event === 'subscribed') {
      channelID = msg.chanId;
    } else if (msg.length && msg.length > 1 && msg[1] !== 'hb') {
      if (msg[1][0].length > 1) {
        services.initCandleStack(msg[1]);
      } else if (msg.length && msg.length > 1 && msg[0] === channelID) {
        services.manageCandle(msg[1]);
      }
    }
  });
  ws.on('close', (res) => {
    error.info('[CLOSED] - ' + res);
    setTimeout(() => wsConnection(), 1000);
  });
  ws.on('error', (err) => {
    error.warn('[ERROR] - ' + err);
  });
}

module.exports = {
  wsConnection
};