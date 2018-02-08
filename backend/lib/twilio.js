'use strict';

const config = require('../config/twilio');
let twilio = require('twilio');
let accountSid = config.accountSid;
let authToken = config.authToken;
let client = new twilio(accountSid, authToken);

function sendSMS(content) {
  client.messages.create({
    body: content,
    to: config.to,
    from: config.from
  });
}

module.exports.sendSMS = sendSMS;