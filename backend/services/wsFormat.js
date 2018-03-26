'use strict';
function publicFormat(message) {
  if (message[1] === 'candle') {

  }
  else {
    return message;
  }
}

function authFormat(message) {
  if (message[1] === 'ws') {
    return message;
  }
  else if (message[1] === 'wu') {
    return message;
  }
  else if (message[1] === 'te') {
    return message;
  }
  else {
    return message;
  }
}

module.exports = {
  publicFormat,
  authFormat
};