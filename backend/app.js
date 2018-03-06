// const mongoUtil = require('./lib/mongodb');
const version = require('./package').version;
const config = require('./config/config');
const startApp = require('./services/services').startWebsockets;
const express = require('express');
const app = express();
let path = require('path');
let WebSocketServer = require('ws').Server;

let wss = new WebSocketServer({port: 40510});

wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log('received: %s', message);
  });

  setInterval(
    () => ws.send(`${new Date()}`), 5000
  );
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../backend/template', 'app.html'));
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
  initConsole();
  // startApp();
});

// mongoUtil.connectToServer(function (err) {
//   if (err) error.info('[Mongo] - ' + err);
//   startApp();
// });

function initConsole() {
  console.log(version + '  /  ' + config.currency + '  /  ' + config.timestamp +
    'mn' + '  /  RSI ' + config.RSIperiod + '\n');
}