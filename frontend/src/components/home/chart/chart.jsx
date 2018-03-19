import React, {Component} from 'react';
import './chart.css';
import classNames from 'classnames';
import TradingViewWidget from 'react-tradingview-widget';

class Chart extends Component {
  constructor() {
    super();
    this.state = {
      tabNumero: '1'
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    this.setState({
      tabNumero: event.target.id
    })
  }

  render() {
    const isFirstTab = this.state.tabNumero;

    const tab = isFirstTab === '1' ? (
      <TradingViewWidget
        symbol="BITFINEX:BTCUSD"
        theme="Dark"
        locale="fr"
        autosize
      />
    ) : (
      <div className="card-body">
        <h3>Bitfinex Wallet</h3>
      </div>
    );

    let tab1 = classNames({
      'nav-link': true,
      'active': this.state.tabNumero === '1'
    });

    let tab2 = classNames({
      'nav-link': true,
      'active': this.state.tabNumero === '2'
    });

    return (
      <div className="card border-secondary mb-3">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <a className={tab1} id="1" onClick={this.handleClick}>Bitfinex chart</a>
            </li>
            <li className="nav-item">
              <a className={tab2} id="2" onClick={this.handleClick}>Wallet</a>
            </li>
          </ul>
        </div>
        <div className="charts-container">
          {tab}
        </div>
      </div>)
  }
}

export default Chart;