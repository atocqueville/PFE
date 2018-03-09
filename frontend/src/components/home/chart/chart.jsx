import React from "react";
import './chart.css';
import TradingViewWidget from 'react-tradingview-widget';

const Chart = () => (
  <div className="chart">
    <TradingViewWidget
      symbol="BITFINEX:BTCUSD"
      theme="Dark"
      locale="fr"
      autosize
    />
  </div>
);

export default Chart;