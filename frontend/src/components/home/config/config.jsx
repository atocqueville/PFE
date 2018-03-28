import React, {Component} from "react";
import http from 'axios';
import {Slider, InputNumber, Select, Row, Col} from 'antd';
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

  handleChange(input, field) {
    if (field === 'rsiSlider') {
      this.setState(state => {
        state.config['minRSI'] = input[0];
        state.config['maxRSI'] = input[1];
        return state;
      });
    } else {
      this.setState(state => {
        state.config[field] = input;
        return state;
      });
    }
  }

  startClick() {
    http.post('http://localhost:3000/config/status', this.state.config)
      .then(response => this.setState({
        status: response.headers.status === 'true'
      }));
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
                <Select disabled={this.state.status} size="large" key={'test'}
                        value={this.state.config.currency} onChange={e => this.handleChange(e, 'currency')}>
                  <Select.Option value="BTC">BTC</Select.Option>
                  <Select.Option value="ETH">ETH</Select.Option>
                  <Select.Option value="NEO">NEO</Select.Option>
                  <Select.Option value="OMG">OMG</Select.Option>
                  <Select.Option value="IOT">IOT</Select.Option>
                  <Select.Option value="XRP">XRP</Select.Option>
                </Select>
              </div>
              <div className="col">
                <label className="input-label">Timestamp</label>
                <Select disabled={this.state.status} size="large"
                        value={this.state.config.timestamp} onChange={e => this.handleChange(e, 'timestamp')}>
                  <Select.Option value="1">1mn</Select.Option>
                  <Select.Option value="5">5mn</Select.Option>
                  <Select.Option value="15">15mn</Select.Option>
                  <Select.Option value="30">30mn</Select.Option>
                  <Select.Option value="60">1h</Select.Option>
                  <Select.Option value="180">3h</Select.Option>
                  <Select.Option value="360">6h</Select.Option>
                </Select>
              </div>
              <div className="col">
                <label className="input-label">RSI period</label>
                <Select disabled={this.state.status} size="large"
                        value={this.state.config.RSIperiod} onChange={e => this.handleChange(e, 'RSIperiod')}>
                  <Select.Option value="7">7</Select.Option>
                  <Select.Option value="8">8</Select.Option>
                  <Select.Option value="9">9</Select.Option>
                  <Select.Option value="10">10</Select.Option>
                  <Select.Option value="11">11</Select.Option>
                  <Select.Option value="12">12</Select.Option>
                  <Select.Option value="13">13</Select.Option>
                  <Select.Option value="14">14</Select.Option>
                </Select>
              </div>
            </div>
            <br/>
            <label className="input-label-sliders">RSI range</label>
            <div className="slider-container">
              <div className="number-input">
                <InputNumber
                  min={1} max={99}
                  onChange={e => this.handleChange(e, 'minRSI')}
                  value={Number(this.state.config.minRSI)}
                  disabled={this.state.status}/>
              </div>
              <div className="rsi-slider-input">
                <Slider range disabled={this.state.status}
                        onChange={e => this.handleChange(e, 'rsiSlider')}
                        tipFormatter={null}
                        value={[Number(this.state.config.minRSI), Number(this.state.config.maxRSI)]}/>
              </div>
              <div className="number-input">
                <InputNumber
                  min={1} max={99}
                  onChange={e => this.handleChange(e, 'maxRSI')}
                  value={Number(this.state.config.maxRSI)}
                  disabled={this.state.status}/>
              </div>
            </div>
            <label className="input-label-sliders">Wallet</label>
            <div className="slider-container">
              <div className="wallet-slider-input">
                <Slider min={1} max={95}
                        value={Number(this.state.config.walletUsed)}
                        onChange={e => this.handleChange(e, 'walletUsed')}
                        tipFormatter={null}
                        disabled={this.state.status}/>
              </div>
              <div className="number-input">
                <InputNumber
                  min={1} max={95}
                  onChange={e => this.handleChange(e, 'walletUsed')}
                  value={Number(this.state.config.walletUsed)}
                  disabled={this.state.status}
                  formatter={value => `${value} %`}
                  parser={value => value.replace(' %', '')}/>
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