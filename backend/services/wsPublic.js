const WebSocket = require('ws');
const mongo = require('../lib/mongodb');
const services = require('./services');
const {error} = require('../lib/logger');
const publicFormat = require('./wsFormat').publicFormat;

let candleKey, channelID, config;

function wsPublicConnection() {
  initConfig();
  const payload = {
    event: 'subscribe',
    channel: 'candles',
    key: candleKey
  };
  const ws = new WebSocket('wss://api.bitfinex.com/ws/2/');

  ws.on('open', () => ws.send(JSON.stringify(payload)));
  ws.on('message', (message) => {
    let msg = publicFormat(JSON.parse(message));
    // console.log(msg);
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
    setTimeout(() => wsPublicConnection(), 1000);
  });
  ws.on('error', (err) => {
    error.warn('[ERROR] - ' + err);
  });
}

function initConfig() {
  config = mongo.getConfig();
  candleKey = 'trade:' + config.timestamp + 'm:t' + config.currency + 'USD';
}

module.exports = {
  connection: wsPublicConnection
};