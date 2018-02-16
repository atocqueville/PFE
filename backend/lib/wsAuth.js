const WebSocket = require('ws');
const Crypto = require('crypto-js');
const apiKeys = require('../config/apikeys');
const {error, trades} = require('./logger');
const config = require('../config/config');
const services = require('./services');

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
  webSocket = new WebSocket('wss://api.bitfinex.com/ws/2/');
  const ws = webSocket;

  ws.on('open', () => ws.send(JSON.stringify(payload)));
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    if (msg.event === "auth" && msg.status === "OK") {
      console.log('[Account Connected]');
    } else if (msg.event === "auth" && msg.status === "FAILED") {
      console.log('[Account Failed]');
    }
    if (msg[1] === 'ws') {
      console.log(msg[2]);
    }
    if (msg[1] === 'ws') {
      msg[2].forEach((wallet) => {
        if (wallet[0] === 'exchange' && wallet[1] === config.currency) walletCrypto = wallet[2];
        if (wallet[0] === 'exchange' && wallet[1] === 'USD') walletUSD = wallet[2];
      });
      services.initWallet(walletUSD, walletCrypto);
    }
    // } else if (msg[1] === 'wu') {
    //   //for(let i = 0; i < msg[2].length; i++)
    //   console.log('... ', msg[2]);
    //   const wallet = msg[2];
    //   if (wallet != null) {
    //     if (wallet[0] === 'exchange') {
    //       if (wallet[1] === Env.cryptoSimplSymbol) {
    //         if (wallet[4] != null) {
    //           Env.cryptoWallet = wallet[4];
    //           console.log('[CRYPTO UPDATE] => ', Env.cryptoWallet);
    //           Log.print(Env.logFileName, '[CRYPTO UPDATE] => ' + Env.cryptoWallet);
    //         } else {
    //           Env.cryptoWallet = wallet[2];
    //           console.log('[CRYPTO UPDATE] => ', Env.cryptoWallet);
    //           Log.print(Env.logFileName, '[CRYPTO UPDATE] => ' + Env.cryptoWallet);
    //         }
    //       } else if (wallet[1] === 'USD') {
    //         if (wallet[4] != null) {
    //           Env.usdWallet = wallet[4];
    //           console.log('[USD UPDATE] => ', Env.usdWallet);
    //           Log.print(Env.logFileName, '[USD UPDATE] => ' + Env.usdWallet);
    //         } else {
    //           Env.usdWallet = wallet[2];
    //           console.log('[USD UPDATE] => ', Env.usdWallet);
    //           Log.print(Env.logFileName, '[USD UPDATE] => ' + Env.usdWallet);
    //         }
    //       }
    //     }
    //   }
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
  wsAuthConnection: wsAuthConnection,
  newOrder: newOrder
};