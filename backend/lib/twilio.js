'use strict';

const config = require('../config/twilio');
let twilio = require('twilio');
let accountSid = config.accountSid;
let authToken = config.authToken;
let client = new twilio(accountSid, authToken);

function sendSMS(buy, sell) {
  let message = '\nAchat au prix de: $' + buy + '\n' +
    'Vente au prix de: $' + sell + '\n' +
    'Variation après fees: %' + ((((sell / buy) - 1) * 100).toFixed(2) - 0.4);
  client.messages.create({
    body: message,
    to: config.to,
    from: config.from
  });
}

module.exports = {
  sendSMS
};