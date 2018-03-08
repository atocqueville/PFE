import React from "react";
import TradingViewWidget from 'react-tradingview-widget';

const Chart = () => (
  <TradingViewWidget
    symbol="BITFINEX:BTCUSD"
    theme="Dark"
    locale="fr"
    width="600"
    height="500"
  />
);

export default Chart;