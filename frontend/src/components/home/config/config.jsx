import React from "react";
import './config.css';

class Config extends React.Component {

  render() {
    return (
      <div className="config">
        <div className="card border-secondary mb-3">
          <h5 className="card-header">Config</h5>
          <div className="card-body">

            <form>
              <div className="form-row">
                <div className="col">
                  <select className="custom-select mr-sm-2" id="crypto">
                    <option selected>Crypto</option>
                    <option value="1">BTC</option>
                    <option value="2">ETH</option>
                    <option value="3">XRP</option>
                  </select>
                </div>
                <div className="col">
                  <select className="custom-select mr-sm-2" id="period">
                    <option selected>Period</option>
                    <option value="1">5mn</option>
                    <option value="2">15mn</option>
                    <option value="3">30mn</option>
                  </select>
                </div>
                <div className="col">
                  <select className="custom-select mr-sm-2" id="rsi">
                    <option selected>RSI</option>
                    <option value="1">5</option>
                    <option value="2">9</option>
                    <option value="3">14</option>
                  </select>
                </div>
              </div>
              <br/>
              <div className="form-row">
                <div className="col">
                  <input type="text" className="form-control" placeholder="Wallet %"/>
                </div>
                <div className="col">
                  <input type="text" className="form-control" placeholder="RSI min"/>
                </div>
                <div className="col">
                  <input type="text" className="form-control" placeholder="RSI max"/>
                </div>
              </div>
            </form>
            <br/>
            <button type="button" className="btn btn-success btn-sm">Start</button>
            <button type="button" className="btn btn-danger btn-sm">Stop</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Config;