const WebSocket = require('ws');
const candleCalc = require('./candleCalc');
const services = require('./index');
const {error} = require('../lib/logger');
const publicFormat = require('./wsFormat').publicFormat;

let candleKey, channelID, config, timestampFormat, ws;

function wsPublicConnection() {
  initTimestamp();
  candleKey = 'trade:' + timestampFormat + ':t' + config.currency + 'USD';
  const payload = {
    event: 'subscribe',
    channel: 'candles',
    key: candleKey
  };
  ws = new WebSocket('wss://api.bitfinex.com/ws/2/');

  ws.on('open', () => {
    ws.send(JSON.stringify(payload));
    services.taskStopStart(true);
  });
  ws.on('message', (message) => {
    let msg = publicFormat(JSON.parse(message));
    // console.log(msg);
    if (msg.event && msg.event === 'subscribed') {
      channelID = msg.chanId;
    } else if (msg.length && msg.length > 1 && msg[1] !== 'hb') {
      if (msg[1][0].length > 1) {
        candleCalc.initCandleStack(msg[1]);
      } else if (msg.length && msg.length > 1 && msg[0] === channelID) {
        candleCalc.manageCandle(msg[1]);
      }
    }
  });
  ws.on('close', (res) => {
    if (res !== 1005) {
      setTimeout(() => wsPublicConnection(), 1000);
    }
    services.taskStopStart(false);
    error.info('[CLOSED] - ' + res);
  });
  ws.on('error', (err) => {
    error.warn('[ERROR] - ' + err);
  });
}

function initTimestamp() {
  switch (config.timestamp) {
    case '5':
      timestampFormat = '5m';
      break;
    case '15':
      timestampFormat = '15m';
      break;
    case '30':
      timestampFormat = '30m';
      break;
    case '60':
      timestampFormat = '1h';
      break;
    case '180':
      timestampFormat = '3h';
      break;
    case '360':
      timestampFormat = '6h';
  }
}

function closeWebsocket() {
  ws.close();
}

function setConfig(configMongo) {
  config = configMongo;
}

module.exports = {
  connection: wsPublicConnection,
  closeWebsocket,
  setConfig
};