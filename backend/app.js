const express = require('express');
const app = require('./lib/routes')(express());
const {initMongo} = require('./lib/mongodb');
const {initModules} = require('./services/index');

app.listen(3001, async () => {
  await initMongo();
  initModules();
});