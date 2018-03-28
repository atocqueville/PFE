const cron = require('node-cron');
const {updateConfigMongo, getConfig} = require('../lib/mongodb');
const wsAuth = require('./wsAuth');
const {makeDecisions, setPreviousData, setConfig} = require('./walletAndTrades');

let config, status = false;

let task = cron.schedule('*/5 * * * * *', function () {
  makeDecisions();
}, false);

function startWebsockets() {
  wsPublic.connection(config);
  wsAuth.connection(config);
  status = true;
}

function stopWebsockets() {
  wsPublic.closeWebsocket();
  wsAuth.closeWebsocket();
  status = false;
}

async function updateConfig(newConfig) {
  await updateConfigMongo(newConfig);
  initModules();
  startWebsockets();
  return status;
}

function initModules() {
  config = getConfig();
  setConfig(config);
  setPreviousData();
}

function taskStopStart(bool) {
  //TODO refacto start/stop
  if (bool) task.start();
  else if (!bool) task.stop();
}

function getStatus() {
  return status;
}

module.exports = {
  stopWebsockets,
  updateConfig,
  initModules,
  taskStopStart,
  getStatus
};

const wsPublic = require('./wsPublic');