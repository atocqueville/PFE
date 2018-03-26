'use strict';

const config = require('../config/twilio');
const twilio = require('twilio');

let client = new twilio(config.accountSid, config.authToken);

function sendSMS(buyTrade, sellTrade) {
  let benef = (sellTrade.value * sellTrade.amount * 0.999) - (buyTrade.value * buyTrade.amount * 0.999);
  let message = `Crypto ${sellTrade.crypto}
  Achat au prix de: ${buyTrade.value}$
  Vente au prix de: ${sellTrade.value}$
  Variation après fees: ${((((sellTrade.value / buyTrade.value) - 1) * 100) - 0.4).toFixed(2)}%
  Benefice net: ${benef.toFixed(2)}$`;
  client.messages.create({
    body: message,
    to: config.to,
    from: config.from
  });
}

module.exports = {
  sendSMS
};