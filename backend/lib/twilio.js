'use strict';

const config = require('../config/twilio');
const twilio = require('twilio');
const currency = require('../config/config').currency;
let client = new twilio(config.accountSid, config.authToken);

function sendSMS(buy, sell) {
  let message = 'Crypto: ' + currency + '\n' +
    'Achat au prix de: $' + buy + '\n' +
    'Vente au prix de: $' + sell + '\n' +
    'Variation après fees: %' + ((((sell / buy) - 1) * 100) - 0.4).toFixed(2);
  client.messages.create({
    body: message,
    to: config.to,
    from: config.from
  });
}

module.exports = {
  sendSMS
};