const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 40510});

let config;

function wsServerInit() {
  wss.on('connection', function (ws) {
    ws.on('message', function (message) {
      console.log('received: %s', message);
    });
  });
}

function setConfig(configMongo) {
  config = configMongo;
}

// module.exports = {
//   init: wsServerInit,
//   setConfig
// };