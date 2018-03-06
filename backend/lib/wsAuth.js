const WebSocket = require('ws');
const Crypto = require('crypto-js');
const apiKeys = require('../config/apikeys');
const {error} = require('./logger');
const config = require('../config/config');
const authFormat = require('../services/wsFormat').authFormat;
const services = require('../services/services');

let apiKey = apiKeys.public;
let walletUSD, walletCrypto;
let webSocket;

function wsAuthConnection() {
  const authNonce = Date.now() * 1000;
  const authPayload = 'AUTH' + authNonce;
  const authSig = Crypto
    .HmacSHA384(authPayload, apiKeys.private)
    .toString(Crypto.enc.Hex);
  const payload = {
    apiKey,
    authSig,
    authNonce,
    authPayload,
    event: 'auth',
    filter: ['wallet', 'trading']
  };
  const ws = new WebSocket('wss://api.bitfinex.com/ws/2/');
  webSocket = ws;

  ws.on('open', () => ws.send(JSON.stringify(payload)));
  ws.on('message', (message) => {
    let msg = authFormat(JSON.parse(message));
    // console.log(msg);
    if (msg[1] === 'ws') {
      msg[2].forEach((wallet) => {
        if (wallet[0] === 'exchange' && wallet[1] === config.currency) walletCrypto = wallet[2];
        if (wallet[0] === 'exchange' && wallet[1] === 'USD') walletUSD = wallet[2];
      });
      services.updateWallet(walletUSD, walletCrypto, true);
    } else if (msg[1] === 'wu') {
      if (msg[2][0] === 'exchange' && msg[2][1] === 'USD') {
        walletUSD = msg[2][2];
      } else if (msg[2][0] === 'exchange' && msg[2][1] === config.currency) {
        walletCrypto = msg[2][2];
      }
      services.updateWallet(walletUSD, walletCrypto, false);
    } else if (msg[1] === 'te') {
      if (msg[2][4] > 0) services.setBuy(msg[2][5], msg[2][4]);
      if (msg[2][4] < 0) services.setSell(msg[2][5], msg[2][4]);
    }
  });
  ws.on('close', (res) => {
    error.info('[CLOSED] - ' + res);
    setTimeout(() => wsAuthConnection(), 1000);
  });
  ws.on('error', (err) => {
    error.info('[ERROR] - ' + err);
  });
}

function newOrder(amount) {
  const order = JSON.stringify([
    0, 'on', null,
    {
      cid: Date.now(),
      type: 'EXCHANGE MARKET',
      symbol: 't' + config.currency + 'USD',
      amount: amount,
      hidden: 0,
    }
  ]);
  webSocket.send(order);
}

module.exports = {
  connection: wsAuthConnection,
  newOrder: newOrder
};