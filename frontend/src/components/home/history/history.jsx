import React, {Component} from "react";
import './history.css';

class History extends Component {

  render() {
    return (
      <div className="history">
        <div className="card">
          <h5 className="card-header">History</h5>
          <div className="card-body">
            <h5 className="card-title">Special title treatment</h5>
            <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
          </div>
        </div>
      </div>
    );
  }
}

export default History;