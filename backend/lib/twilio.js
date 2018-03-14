'use strict';

const config = require('../config/twilio');
const twilio = require('twilio');
const currency = require('../config/config').currency;
//TODO recup from Mongo
let client = new twilio(config.accountSid, config.authToken);

function sendSMS(buy, sell, benef) {
  let message = 'Crypto: ' + currency + '\n' +
    'Achat au prix de: $' + buy + '\n' +
    'Vente au prix de: $' + sell + '\n' +
    'Variation après fees: ' + ((((sell / buy) - 1) * 100) - 0.4).toFixed(2) + '%' + '\n' +
    'Bénéfice net: $' + benef;
  client.messages.create({
    body: message,
    to: config.to,
    from: config.from
  });
}

module.exports = {
  sendSMS
};