import React, {Component} from "react";
import './history.css';

class History extends Component {

  render() {
    return (
      <div className="card border-secondary mb-3">
        <h5 className="card-header">Last transactions</h5>
        <div className="card-body">
          <p className="card-text">Buy 0.25 BTC at $9450</p>
          <p className="card-text">Buy 0.25 BTC at $9450</p>
          <p className="card-text">Buy 0.25 BTC at $9450</p>
          <p className="card-text">Buy 0.25 BTC at $9450</p>
        </div>
      </div>
    );
  }
}

export default History;