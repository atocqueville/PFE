import React from "react";
import './config.css';

class Config extends React.Component {

  render() {
    return (
      <div className="config">
        <div className="card">
          <h5 className="card-header">Config</h5>
          <div className="card-body">
            <h5 className="card-title">Special title treatment</h5>
            <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
            <a href="#" className="btn btn-primary">Go somewhere</a>
          </div>
        </div>
      </div>
    );
  }
}

export default Config;