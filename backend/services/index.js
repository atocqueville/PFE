const cron = require('node-cron');
const mongo = require('../lib/mongodb');
const wsAuth = require('./wsAuth');
const wsPublic = require('./wsPublic');
const twilioConfigSetter = require('../lib/twilio').setConfig;
const wsAuthConfigSetter = require('./wsAuth').setConfig;
const wsPublicConfigSetter = require('./wsPublic').setConfig;
const candleCalcConfigSetter = require('./candleCalc').setConfig;
const walletModule = require('./walletAndTrades');

let config, status = false;

let task = cron.schedule('*/5 * * * * *', function () {
  walletModule.makeDecisions();
}, false);

function startWebsockets() {
  wsPublic.connection();
  wsAuth.connection();
  status = true;
}

function stopWebsockets() {
  wsPublic.closeWebsocket();
  wsAuth.closeWebsocket();
  status = false;
}

async function updateConfig(newConfig) {
  await mongo.updateConfig(newConfig);
  initMongoFetch();
  startWebsockets();
  return status;
}

function initMongoFetch() {
  config = mongo.getConfig();
  twilioConfigSetter(config);
  wsPublicConfigSetter(config);
  wsAuthConfigSetter(config);
  candleCalcConfigSetter(config);
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

module.exports.startWebsockets = startWebsockets;
module.exports.stopWebsockets = stopWebsockets;
module.exports.updateConfig = updateConfig;
module.exports.initMongo = initMongoFetch;
module.exports.taskStopStart = taskStopStart;
module.exports.getStatus = getStatus;