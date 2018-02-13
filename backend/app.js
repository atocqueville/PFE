const mongoUtil = require('./lib/mongodb');
const wsBitfinex = require('./lib/wsBitfinex');

// mongoUtil.connectToServer(function (err) {
//   if (err) error.info('[Mongo] - ' + err);
wsBitfinex.wsConnection();
// });

// wsAuth.on('open', () => {
//   wsAuth.auth();
// });
// wsAuth.on('error', (err) => errorLogger.info(err));
// wsAuth.once('auth', () => {
//   console.log('authenticated');
//
//   // Build new order
//   const o = new Order({
//     cid: Date.now(),
//     symbol: 'tBTCUSD',
//     amount: -0.0020958,
//     type: Order.type.EXCHANGE_MARKET
//   }, wsAuth);
//
//   let closed = false;
//
//   // Enable automatic updates
//   o.registerListeners();
//
//   o.on('update', () => {
//     console.log('order updated: %j', o.serialize());
//   });
//
//   o.on('close', () => {
//     console.log('order closed: %s', o.status);
//     closed = true
//   });
//
//   console.log('submitting order %d', o.cid);
//
//   o.submit().then(() => {
//     console.log('got submit confirmation for order %d [%d]', o.cid, o.id);
//
//     // wait a bit...
//     setTimeout(() => {
//       if (closed) return;
//
//       console.log('canceling...');
//
//       o.cancel().then(() => {
//         console.log('got cancel confirmation for order %d', o.cid);
//       }).catch((err) => {
//         console.log('error cancelling order: %j', err);
//       })
//     }, 2000)
//   }).catch((err) => {
//     console.log(err)
//   });
// });
// wsAuth.open();