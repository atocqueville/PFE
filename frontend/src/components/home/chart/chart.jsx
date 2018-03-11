import React from "react";
import './chart.css';
import TradingViewWidget from 'react-tradingview-widget';

const Chart = () => (
  <div className="card border-secondary mb-3 chart-container">
    <h5 className="card-header">Chart</h5>
    <div className="card-chart">
      <TradingViewWidget
        symbol="BITFINEX:BTCUSD"
        theme="Dark"
        locale="fr"
        autosize
      />
    </div>
  </div>
);

export default Chart;