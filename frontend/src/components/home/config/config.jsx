import React, {Component} from "react";
import http from 'axios';
import './config.css';

class Config extends Component {
  constructor(props) {
    super();

    this.state = {
      config: props.config,
      status: props.status
    };
    this.startClick = this.startClick.bind(this);
    this.stopClick = this.stopClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    let id = event.target.id;
    let value = event.target.value;
    this.setState(state => {
      state.config[id] = value;
      return state;
    });
  }

  startClick() {
    http.post('http://localhost:3000/config/status', this.state.config)
      .then(response => {
        this.setState({
          status: response.headers.status === 'true'
        })
      });
  }

  stopClick() {
    http.get('http://localhost:3000/config/status')
      .then(response => this.setState({
        status: response.headers.status === 'true'
      }));
  }

  render() {
    return (
      <div className="card border-secondary mb-3">
        <h5 className="card-header">Config</h5>
        <div className="card-body">
          <form>
            <div className="form-row">
              <div className="col">
                <label className="input-label">Currency</label>
                <select className="custom-select mr-sm-2" id="currency" disabled={this.state.status}
                        value={this.state.config.currency} onChange={this.handleChange}>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="NEO">NEO</option>
                  <option value="OMG">OMG</option>
                  <option value="IOT">IOT</option>
                  <option value="XRP">XRP</option>
                </select>
              </div>
              <div className="col">
                <label className="input-label">Timestamp</label>
                <select className="custom-select mr-sm-2" id="timestamp" disabled={this.state.status}
                        value={this.state.config.timestamp} onChange={this.handleChange}>
                  <option value="1">1mn</option>
                  <option value="5">5mn</option>
                  <option value="15">15mn</option>
                  <option value="30">30mn</option>
                  <option value="60">1h</option>
                  <option value="180">3h</option>
                  <option value="360">6h</option>
                </select>
              </div>
              <div className="col">
                <label className="input-label">RSI period</label>
                <select className="custom-select mr-sm-2" id="RSIperiod" disabled={this.state.status}
                        value={this.state.config.RSIperiod} onChange={this.handleChange}>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                  <option value="13">13</option>
                  <option value="14">14</option>
                </select>
              </div>
            </div>
            <br/>
            <div className="form-row">
              <div className="col">
                <label className="input-label">RSI min</label>
                <input type="text" className="form-control" placeholder="RSI min" id="minRSI"
                       value={this.state.config.minRSI} onChange={this.handleChange}
                       disabled={this.state.status}/>
              </div>
              <div className="col">
                <label className="input-label">RSI max</label>
                <input type="text" className="form-control" placeholder="RSI max" id="maxRSI"
                       value={this.state.config.maxRSI} onChange={this.handleChange}
                       disabled={this.state.status}/>
              </div>
              <div className="col">
                <label className="input-label">Wallet %</label>
                <input type="text" className="form-control" placeholder="Wallet %" id="walletUsed"
                       value={this.state.config.walletUsed} onChange={this.handleChange}
                       disabled={this.state.status}/>
              </div>
            </div>
          </form>
          <br/>
          <div className="button-container">
            <button type="button" className="btn btn-success start-button"
                    disabled={this.state.status} onClick={this.startClick}>Start
            </button>
            <button type="button" className="btn btn-danger stop-button"
                    disabled={!this.state.status} onClick={this.stopClick}>Stop
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Config;