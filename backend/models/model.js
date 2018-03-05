'use strict';

function candle() {
  this.MTS = "";
  this.DATA = [
    this.CLOSE = "",
    this.DIFF = "",
    this.AVGGAIN = "",
    this.AVGLOSS = "",
    this.RSI = ""
  ];
  this.DATE = "";
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