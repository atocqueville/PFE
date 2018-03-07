'use strict';

class candle {
  constructor() {
    this.MTS = '';
    this.DATA = [];
    this.DATA.CLOSE = '';
    this.DATA.DIFF = '';
    this.DATA.AVGGAIN = '';
    this.DATA.AVGLOSS = '';
    this.DATA.RSI = '';
    this.DATE = '';
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