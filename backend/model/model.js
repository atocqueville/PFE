'use strict';

class Candle {
  constructor(mts, close, diff, avgGain, avgLoss, rsi, date) {
    this.MTS = mts || '';
    this.DATA = [];
    this.DATA.CLOSE = close || '';
    this.DATA.DIFF = diff || '';
    this.DATA.AVGGAIN = avgGain || '';
    this.DATA.AVGLOSS = avgLoss || '';
    this.DATA.RSI = rsi || '';
    this.DATE = date || '';
  }
}

class Trade {
  constructor(type, crypto, value, amount, date) {
    this.type = type;
    this.crypto = crypto;
    this.value = value;
    this.amount = Math.abs(amount);
    this.date = new Date(date).toLocaleString()
  }
}

// function walletSnapshot() {
//
// }
//
// function walletUpdate() {
//
// }
//
// function tradeExecuted() {
//
// }
//
// function candleBitfinex(candle) {
//   this.chanId = candle[0];
//   this.MTS = candle[1];
//   this.OPEN = candle[2];
//   this.CLOSE = candle[3];
// }

module.exports = {
  Candle,
  Trade
};