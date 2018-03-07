// const mongoUtil = require('./lib/mongodb');
const version = require('./package').version;
const config = require('./config/config');
const startServer = require('./services/services').startWebsockets;
const express = require('express');
const app = express();
const path = require('path');

app.use(express.static('services'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../backend', 'index.html'));
});

app.listen(3000, function () {
  console.log('Listening on port 3000!');
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