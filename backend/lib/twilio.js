'use strict';

const config = require('../config/twilio');
const twilio = require('twilio');

let currency;
let client = new twilio(config.accountSid, config.authToken);

function sendSMS(buyTrade, sellTrade) {
  let benef = (sellTrade[2] * sellTrade[3] * 0.999) - (buyTrade[2] * buyTrade[3] * 0.999);
  let message = `Cyrpto ${currency}
    Achat au prix de: ${buyTrade[2]}$
    Vente au prix de: ${sellTrade[2]}$
    Variation après fees: ${((((sellTrade[2] / buyTrade[2]) - 1) * 100) - 0.4).toFixed(2)}%
    Benefice net: ${benef}`;
  client.messages.create({
    body: message,
    to: config.to,
    from: config.from
  });
}

function setConfig(configMongo) {
  currency = configMongo.currency;
}

module.exports = {
  sendSMS,
  setConfig
};