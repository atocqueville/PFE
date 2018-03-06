const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 40510});
let lastCandle = require('../services/services').getRSI;

function wsServerInit() {
  wss.on('connection', function (ws) {
    ws.on('message', function (message) {
      console.log('received: %s', message);
    });

    setInterval(
      () =>
        console.log(lastCandle), 2000
      // ws.send(lastCandle.RSI), 2000
    );
  });
}

module.exports = {
  init: wsServerInit
};