const WebSocket = require('ws');
const Crypto = require('crypto-js');
const apiKeys = require('../config/apikeys');
const {error} = require('../lib/logger');
const authFormat = require('./wsFormat').authFormat;

let apiKey = apiKeys.public;
let walletUSD = 0, walletCrypto = 0, config, ws;

function wsAuthConnection(configMongo) {
  console.log(walletModule);
  config = configMongo;
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
  ws = new WebSocket('wss://api.bitfinex.com/ws/2/');

  ws.on('open', () => ws.send(JSON.stringify(payload)));
  ws.on('message', (message) => {
    let msg = authFormat(JSON.parse(message));
    // console.log(msg);
    if (msg[1] === 'ws') {
      msg[2].forEach((wallet) => {
        if (wallet[0] === 'exchange' && wallet[1] === config.currency) walletCrypto = wallet[2];
        if (wallet[0] === 'exchange' && wallet[1] === 'USD') walletUSD = wallet[2];
      });
      walletModule.updateWallet(walletUSD, walletCrypto);
    } else if (msg[1] === 'wu') {
      if (msg[2][0] === 'exchange' && msg[2][1] === 'USD') {
        walletUSD = msg[2][2];
      } else if (msg[2][0] === 'exchange' && msg[2][1] === config.currency) {
        walletCrypto = msg[2][2];
      }
      walletModule.updateWallet(walletUSD, walletCrypto);
    } else if (msg[1] === 'te') {
      if (msg[2][4] > 0) walletModule.setBuy(msg[2]);
      if (msg[2][4] < 0) walletModule.setSell(msg[2]);
    }
  });
  ws.on('close', (res) => {
    if (res !== 1005) {
      setTimeout(() => wsAuthConnection(), 1000);
    }
    error.info('[CLOSED] - ' + res);
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
  ws.send(order);
}

function closeWebsocket() {
  ws.close();
}

module.exports = {
  connection: wsAuthConnection,
  closeWebsocket,
  newOrder
};

const walletModule = require('./walletAndTrades');