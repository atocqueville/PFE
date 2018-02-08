'use strict';

let twilio = require('twilio');
let accountSid = 'AC548f0858ff157b80058d6b80fdeaeec3';
let authToken = '0403974c745ce3c65541fcd353863250';
let client = new twilio(accountSid, authToken);

function sendSMS(content) {
  client.messages.create({
    body: content,
    to: '+33617676272',
    from: '+33757902225 '
  });
}

module.exports.sendSMS = sendSMS;