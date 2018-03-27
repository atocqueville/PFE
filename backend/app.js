const mongo = require('./lib/mongodb');
const express = require('express');
const app = express();
const routes = require('./lib/routes');
const services = require('./services/index');

routes(app);

app.listen(3001, async () => {
  await mongo.init();
  services.initModules();
});