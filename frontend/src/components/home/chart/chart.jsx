import React, {Component} from 'react';
import './chart.css';
import classNames from 'classnames';
import TradingViewWidget from 'react-tradingview-widget';
import {Line} from 'react-chartjs-2';

class Chart extends Component {
  constructor() {
    super();
    this.state = {
      tabNumero: '1',
    };

    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    this.initDataChart();
  }

  initDataChart() {
    let balance = [], dates = [];
    for (let value of this.props.wallet) {
      balance.push(value.balance);
    }
    for (let value of this.props.wallet) {
      dates.push(value.date);
    }
    this.setState({
      chartData: {
        labels: dates,
        datasets: [
          {
            data: balance,
            fill: true,
            lineTension: 0.1,
            backgroundColor: 'rgba(52, 58, 64, 0.8)',
            borderColor: 'rgba(0,0,0,0.8)',
            borderCapStyle: 'butt',
            borderJoinStyle: 'round',
            pointBackgroundColor: '#fff',
            legend: {
              display: false
            }
          }
        ]
      }
    })
  }

  handleClick(event) {
    this.setState({
      tabNumero: event.target.id
    })
  }

  render() {
    const tabNumero = this.state.tabNumero;

    const tab = tabNumero === '1' ? (
      <div className="card-body">
        < Line
          data={this.state.chartData}
          options={{
            legend: {
              display: false
            }
          }}
          width={300}
        />
      </div>
    ) : (
      <TradingViewWidget
        symbol="BITFINEX:BTCUSD"
        theme="Dark"
        locale="fr"
        autosize
      />
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
              <a className={tab1} id="1" onClick={this.handleClick}>Wallet</a>
            </li>
            <li className="nav-item">
              <a className={tab2} id="2" onClick={this.handleClick}>Bitfinex Chart</a>
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