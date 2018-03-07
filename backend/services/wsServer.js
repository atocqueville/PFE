const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 40510});
let services = require('./services');

function wsServerInit() {
  wss.on('connection', function (ws) {
    ws.on('message', function (message) {
      console.log('received: %s', message);
      if (message === 'stop') services.setStatus(false);
      if (message === 'start') services.setStatus(true);
    });

    setInterval(
      () =>
        ws.send(services.getRSI()), 2000
    );
  });
}

module.exports = {
  init: wsServerInit
};