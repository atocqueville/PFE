const mongo = require('./lib/mongodb');
const express = require('express');
const app = require('./lib/routes')(express());
const services = require('./services/index');

app.listen(3001, async () => {
  await mongo.init();
  services.initModules();
});