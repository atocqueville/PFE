'use strict';

let apiKeys = require('../config/apikeys');
const BFX = require('bitfinex-api-node');

const bfx = new BFX({
  apiKey: apiKeys.public,
  apiSecret: apiKeys.private,
  ws: {
    autoReconnect: true,
    seqAudit: true,
    packetWDDelay: 10 * 1000
  }
});
// Error: unexpected server response (525)

module.exports = bfx;