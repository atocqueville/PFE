'use strict';

const apiKeys = require('../config/apikeys');
const BFX = require('bitfinex-api-node');

const bfx = new BFX({
  apiKey: apiKeys.public,
  apiSecret: apiKeys.private,
  ws: {
    autoReconnect: false,
    seqAudit: true,
    packetWDDelay: 10 * 1000
  }
});

module.exports = bfx;