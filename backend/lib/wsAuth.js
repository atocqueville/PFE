const apiKeys = require('../config/apikeys');
const WSv2 = require("bitfinex-api-node").WSv2;
const Order = require('bitfinex-api-node').Models.Order;

let wSv2 = new WSv2({
  apiKey: apiKeys.public,
  apiSecret: apiKeys.private,
  transform: true,
  autoReconnect: true
});

wSv2.on('open', () => {
  wSv2.auth();
  console.log('open')
});

wSv2.on('error', (err) => {
  console.log('error: %j', err)
});

wSv2.once('auth', () => {
  console.log('authenticated');

  // Build new order
  const o = new Order({
    cid: Date.now(),
    symbol: 'tBTCUSD',
    price: 589.10,
    amount: -0.02,
    type: Order.type.EXCHANGE_LIMIT
  }, wSv2);

  let closed = false;

  o.registerListeners();

  o.on('update', () => {
    console.log('order updated: %j', o.serialize());
  });

  o.on('close', () => {
    console.log('order closed: %s', o.status);
    closed = true
  });

  console.log('submitting order %d', o.cid);

  o.submit().then(() => {
    console.log('got submit confirmation for order %d [%d]', o.cid, o.id);

    // wait a bit...
    setTimeout(() => {
      if (closed) return;

      console.log('canceling...');

      o.cancel().then(() => {
        console.log('got cancel confirmation for order %d', o.cid);
      }).catch((err) => {
        console.log('error cancelling order: %j', err);
      })
    }, 2000)
  }).catch((err) => {
    console.log(err);
  })
});

// Register a callback for any order snapshot that comes in (account orders)
wSv2.onOrderSnapshot({}, (orders) => {
  console.log(`order snapshot: ${JSON.stringify(orders, null, 2)}`)
});

wSv2.open();