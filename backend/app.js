const mongo = require('./lib/mongodb');
const express = require('express');
const app = express();
const startServer = require('./services/services').startWebsockets;
const routes = require('./lib/routes');

routes(app);

app.listen(3001, async () => {
  await mongo.initConfig();
  startServer();
});