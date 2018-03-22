const mongo = require('./lib/mongodb');
const express = require('express');
const app = express();
const startServer = require('./services/index').initConfig;
const routes = require('./lib/routes');

routes(app);

app.listen(3001, async () => {
  await mongo.init();
  startServer();
});