'use strict';

class candle {
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

function walletSnapshot() {

}

function walletUpdate() {

}

function tradeExecuted() {

}

function candleBitfinex(candle) {
  this.chanId = candle[0];
  this.MTS = candle[1];
  this.OPEN = candle[2];
  this.CLOSE = candle[3];
}

module.exports = {
  candle
};