const Crypto = require('crypto-js');
const WebSocket = require('ws');
const apiKeys = require('../config/apikeys');
const config = require('../config/config');
const url = 'wss://api.bitfinex.com/ws/2/';
const CANDLE_KEY = 'trade:' + config.timestamp + 'm:t' + config.currency + 'USD';

let lastBuyOrderId;
let lastSellOrderId;
let chanId;

function wsConnection() {
  const payload = {
    event: 'subscribe',
    channel: 'candles',
    key: CANDLE_KEY
  };
  const ws = new WebSocket(url);

  ws.on('open', () => {
    ws.send(JSON.stringify(payload));
    console.log('[CONNECTED]');
  });

  ws.on('message', (res) => {
    let msg = JSON.parse(res);
    if (msg.event && msg.event === 'subscribed') {
      console.log('[CANDLES SUBSCRIBED]');
      chanId = msg.chanId;
    } else if (msg.length && msg.length > 1 && msg[1] !== 'hb') {
      if (msg[1][0].length > 1) {
        initCandleStack(msg[1]);
      } else if (msg.length && msg.length > 1 && msg[0] === chanId) {
        manageCandle(msg[1]);
      }
    }
  });

  ws.on('close', (res) => {
    console.log('CLOSED');
    setTimeout(() => wsConnection(), 1000);

  });

  ws.on('error', (err) => {
    console.log('ERROR');
  });
}

function initCandleStack(candle) {
  console.log('initcandlestack', candle)
}

function manageCandle(candle) {
  console.log('manageCandle', candle)
}

module.exports.wsConnection = wsConnection;