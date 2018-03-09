import React, {Component} from "react";
import './history.css';

class History extends Component {

  render() {
    return (
      <div className="history">
        <div className="card border-secondary mb-3">
          <h5 className="card-header">4 last transactions</h5>
          <div className="card-body">
            <p className="card-text">Buy 0.25 BTC at $9450</p>
            <p className="card-text">Buy 0.25 BTC at $9450</p>
            <p className="card-text">Buy 0.25 BTC at $9450</p>
            <p className="card-text">Buy 0.25 BTC at $9450</p>
          </div>
        </div>
      </div>
    );
  }
}

export default History;