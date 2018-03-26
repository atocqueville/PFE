const WebSocket = require('ws');
const {error} = require('../lib/logger');
const publicFormat = require('./wsFormat').publicFormat;

let channelID, ws;

function wsPublicConnection(configMongo) {
  let config = configMongo;
  let candleKey = `trade:${initTimestamp(config)}:t${config.currency}USD`;
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
        candleCalc.initCandleStack(msg[1], config);
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

function initTimestamp(config) {
  switch (config.timestamp) {
    case '1':
      return '1m';
    case '5':
      return '5m';
    case '15':
      return '15m';
    case '30':
      return '30m';
    case '60':
      return '1h';
    case '180':
      return '3h';
    case '360':
      return '6h';
  }
}

function closeWebsocket() {
  ws.close();
}

module.exports = {
  connection: wsPublicConnection,
  closeWebsocket
};

const services = require('./index');
const candleCalc = require('./candleCalc');