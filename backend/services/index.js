const cron = require('node-cron');
const mongo = require('../lib/mongodb');
const wsAuth = require('./wsAuth');
const walletModule = require('./walletAndTrades');

let config, status = false;

let task = cron.schedule('*/5 * * * * *', function () {
  walletModule.makeDecisions();
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
  await mongo.updateConfig(newConfig);
  initModules();
  startWebsockets();
  return status;
}

function initModules() {
  config = mongo.getConfig();
  walletModule.setConfig(config);
  walletModule.setPreviousData();
}

function taskStopStart(bool) {
  //TODO refacto start/stop
  if (bool) task.start();
  else if (!bool) task.stop();
}

function getStatus() {
  return status;
}

// module.exports.startWebsockets = startWebsockets;
// module.exports.stopWebsockets = stopWebsockets;
// module.exports.updateConfig = updateConfig;
// module.exports.initMongo = initMongo;
// module.exports.taskStopStart = taskStopStart;
// module.exports.getStatus = getStatus;

module.exports = {
  stopWebsockets,
  updateConfig,
  initModules,
  taskStopStart,
  getStatus
};

const wsPublic = require('./wsPublic');