const apiKeys = require('../config/apikeys');
const WSv2 = require("bitfinex-api-node").WSv2;
const {error, trades} = require('../lib/logger');
const Order = require('bitfinex-api-node').Models.Order;
const symbol = require('../config/config').currency;

function wsAuthConnection(price, position) {
  let wSv2 = new WSv2({
    apiKey: apiKeys.public,
    apiSecret: apiKeys.private,
    transform: true,
  });
  wSv2.on('open', () => wSv2.auth());
  wSv2.on('error', (err) => error.info(err));
  wSv2.once('auth', () => {
    const o = new Order({
      cid: Date.now(),
      symbol: 't' + symbol + 'USD',
      amount: position ? 0.3 : -0.3,
      price: price,
      type: Order.type.EXCHANGE_LIMIT
    }, wSv2);
    let closed = false;
    o.registerListeners();
    o.on('close', () => {
      closed = true;
    });
    o.submit().then(() => {
      trades.info(`submitted order ${o.id}`);
      console.log(o.getLastFillAmount());
      // wSv2.close();
    }).catch((err) => {
      error.info(err);
      wSv2.close();
    })
  });
  wSv2.open();
}

module.exports = {
  wsAuthConnection: wsAuthConnection
};