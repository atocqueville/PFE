import React, {Component} from "react";
import './history.css';
import http from "axios/index";

class History extends Component {
  constructor() {
    super();

    // this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount() {
    http.get('http://localhost:3000/history')
      .then(response => {
        this.setState({
          history: response.data
        })
      });
  }
  render() {
    return (
      <div className="card border-secondary mb-3">
        <h5 className="card-header">Last transactions</h5>
        {this.state && this.state.history &&
        <div className="card-body">
          <p className="card-text">{this.state.history[0].type} {this.state.history[0].amount}
            {this.state.history[0].crypto} {this.state.history[0].value} {this.state.history[0].date}</p>
          <p className="card-text">Buy 0.25 BTC at $9450</p>
          <p className="card-text">Buy 0.25 BTC at $9450</p>
          <p className="card-text">Buy 0.25 BTC at $9450</p>
        </div>
        }
      </div>
    );
  }
}

export default History;