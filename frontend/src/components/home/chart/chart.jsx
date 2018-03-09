import React from "react";
import './chart.css';
import TradingViewWidget from 'react-tradingview-widget';

const Chart = () => (
  <div className="chart-container">
    <div className="card border-secondary mb-3">
      <h5 className="card-header">Chart</h5>
      <div className="chart">
        <TradingViewWidget
          symbol="BITFINEX:BTCUSD"
          theme="Dark"
          locale="fr"
          autosize
        />
      </div>
    </div>
  </div>
);

export default Chart;