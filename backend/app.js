// const mongoUtil = require('./lib/mongodb');
const version = require('./package').version;
const config = require('./config/config');
const startServer = require('./services/services').startWebsockets;
const express = require('express');
const wsServer = require('ws').Server;
const app = express();

app.get('/users', function (req, res) {
  res.json([{
    id: 1,
    username: "samsepi0l"
  }, {
    id: 2,
    username: "D0loresH4ze"
  }]);
});

let server = app.listen(3001, function () {
  console.log('Listening on port 3001!');
  startServer();
  // initConsole();
});

const wss = new wsServer({server});
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => console.log(message));
  ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);


// mongoUtil.connectToServer(function (err) {
//   if (err) error.info('[Mongo] - ' + err);
//   startApp();
// });

function initConsole() {
  console.log(version + '  /  ' + config.currency + '  /  ' + config.timestamp +
    'mn' + '  /  RSI ' + config.RSIperiod + '\n');
}