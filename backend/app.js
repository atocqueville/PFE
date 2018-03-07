// const mongoUtil = require('./lib/mongodb');
const version = require('./package').version;
const config = require('./config/config');
const startServer = require('./services/services').startWebsockets;
const express = require('express');
const app = express();

app.get('/', function (req, res) {
  res.json([{
    id: 1,
    username: "samsepi0l"
  }, {
    id: 2,
    username: "D0loresH4ze"
  }]);
});

app.listen(3001, function () {
  console.log('Listening on port 3001!');
  initConsole();
  startServer();
});

// mongoUtil.connectToServer(function (err) {
//   if (err) error.info('[Mongo] - ' + err);
//   startApp();
// });

function initConsole() {
  console.log(version + '  /  ' + config.currency + '  /  ' + config.timestamp +
    'mn' + '  /  RSI ' + config.RSIperiod + '\n');
}