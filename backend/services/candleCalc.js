const {Candle} = require('../model/model');
const walletModule = require('./walletAndTrades');

let derniereLocalCandle = new Candle();
let avantDerniereLocalCandle = new Candle();
let config;

function updateCandle(lastCandle) {
  derniereLocalCandle.MTS = lastCandle[0];
  derniereLocalCandle.DATA.CLOSE = lastCandle[2];
  derniereLocalCandle.DATA.DIFF = derniereLocalCandle.DATA.CLOSE - avantDerniereLocalCandle.DATA.CLOSE;
  if (derniereLocalCandle.DATA.DIFF > 0) {
    derniereLocalCandle.DATA.AVGGAIN = (avantDerniereLocalCandle.DATA.AVGGAIN * (Number(config.RSIperiod) - 1) + derniereLocalCandle.DATA.DIFF) / Number(config.RSIperiod);
    derniereLocalCandle.DATA.AVGLOSS = (avantDerniereLocalCandle.DATA.AVGLOSS * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
  } else if (derniereLocalCandle.DATA.DIFF < 0) {
    derniereLocalCandle.DATA.AVGGAIN = (avantDerniereLocalCandle.DATA.AVGGAIN * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
    derniereLocalCandle.DATA.AVGLOSS = (avantDerniereLocalCandle.DATA.AVGLOSS * (Number(config.RSIperiod) - 1) + Math.abs(derniereLocalCandle.DATA.DIFF)) / Number(config.RSIperiod);
  } else {
    derniereLocalCandle.DATA.AVGGAIN = (avantDerniereLocalCandle.DATA.AVGGAIN * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
    derniereLocalCandle.DATA.AVGLOSS = (avantDerniereLocalCandle.DATA.AVGLOSS * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
  }
  derniereLocalCandle.DATA.RSI = 100 - (100 / (1 + (derniereLocalCandle.DATA.AVGGAIN / derniereLocalCandle.DATA.AVGLOSS)));
  derniereLocalCandle.DATE = new Date(derniereLocalCandle.MTS).toLocaleTimeString();
  walletModule.setLastCandle(derniereLocalCandle);
}

module.exports = {
  initCandleStack: function (previousCandles, configMongo) {
    config = configMongo;
    previousCandles.reverse();
    let candlesJSON = [];

    let candleTemplate;
    for (let i = 1; i < previousCandles.length; i++) {
      candleTemplate = new Candle(
        previousCandles[i][0], // MTS
        previousCandles[i][2], // CLOSE
        previousCandles[i][2] - previousCandles[i - 1][2], // DIFF
        '', '', '', // AVG GAIN/LOSS, RSI
        new Date(previousCandles[i][0]).toLocaleTimeString() // DATE
      );
      candlesJSON.push(candleTemplate);
    }

    let avgGain = 0;
    let avgLoss = 0;
    for (let i = 1; i <= config.RSIperiod; i++) {
      let candle = candlesJSON[i].DATA;
      if (candle.DIFF > 0) avgGain += candle.DIFF;
      else avgLoss += Math.abs(candle.DIFF);
    }
    let firstDynamicCandle = candlesJSON[config.RSIperiod].DATA;
    firstDynamicCandle.AVGGAIN = avgGain / Number(config.RSIperiod);
    firstDynamicCandle.AVGLOSS = avgLoss / Number(config.RSIperiod);

    for (let i = Number(config.RSIperiod) + 1; i < previousCandles.length - 1; i++) {
      let previousCandle = candlesJSON[i - 1].DATA;
      let candle = candlesJSON[i].DATA;
      let previousAvgGain = previousCandle.AVGGAIN;
      let previousAvgLoss = previousCandle.AVGLOSS;
      let diff = candle.DIFF;
      if (diff > 0) {
        candle.AVGGAIN = (previousAvgGain * (Number(config.RSIperiod) - 1) + diff) / Number(config.RSIperiod);
        candle.AVGLOSS = (previousAvgLoss * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
      } else if (diff < 0) {
        candle.AVGGAIN = (previousAvgGain * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
        candle.AVGLOSS = (previousAvgLoss * (Number(config.RSIperiod) - 1) + Math.abs(diff)) / Number(config.RSIperiod);
      } else {
        candle.AVGGAIN = (previousAvgGain * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
        candle.AVGLOSS = (previousAvgLoss * (Number(config.RSIperiod) - 1)) / Number(config.RSIperiod);
      }
      candle.RSI = 100 - (100 / (1 + (candle.AVGGAIN / candle.AVGLOSS)));

      avantDerniereLocalCandle.MTS = derniereLocalCandle.MTS;
      avantDerniereLocalCandle.DATA = derniereLocalCandle.DATA;
      avantDerniereLocalCandle.DATE = derniereLocalCandle.DATE;

      derniereLocalCandle.MTS = candlesJSON[i].MTS;
      derniereLocalCandle.DATA = candle;
      derniereLocalCandle.DATE = candlesJSON[i].DATE;
    }
    walletModule.setLastCandle(derniereLocalCandle);
    return candlesJSON;
  },

  manageCandle: function (lastCandle) {
    if (lastCandle[0] > derniereLocalCandle.MTS) {
      avantDerniereLocalCandle.MTS = derniereLocalCandle.MTS;
      avantDerniereLocalCandle.DATA.CLOSE = derniereLocalCandle.DATA.CLOSE;
      avantDerniereLocalCandle.DATA.DIFF = derniereLocalCandle.DATA.DIFF;
      avantDerniereLocalCandle.DATA.AVGGAIN = derniereLocalCandle.DATA.AVGGAIN;
      avantDerniereLocalCandle.DATA.AVGLOSS = derniereLocalCandle.DATA.AVGLOSS;
      avantDerniereLocalCandle.DATA.RSI = derniereLocalCandle.DATA.RSI;
      avantDerniereLocalCandle.DATE = derniereLocalCandle.DATE;
      updateCandle(lastCandle);
    }
    else if (lastCandle[0] === derniereLocalCandle.MTS) {
      updateCandle(lastCandle);
    }
  }
};