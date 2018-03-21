import React, {Component} from "react";
import Config from './config/config';
import History from './history/history';
import Chart from './chart/chart';
import './home.css';
import http from "axios/index";
import {ConfigModel} from "./config/configModel";

class Home extends Component {
  componentWillMount() {
    http.get('http://localhost:3000/history')
      .then(response => {
        this.setState({
          history: response.data
        })
      });
    http.get('http://localhost:3000/config')
      .then(response => this.setState({
        config: new ConfigModel(response.data),
        status: response.headers.status === 'true'
      }));
    http.get('http://localhost:3000/wallet')
      .then(response => this.setState({
        wallet: response.data
      }));
  }

  render() {
    return (
      <main>
        {this.state && this.state.history &&
        this.state.config && this.state.wallet &&
        <div>
          <section>
            <Config config={this.state.config} status={this.state.status}/>
          </section>
          <section>
            <History history={this.state.history}/>
          </section>
          <section>
            <Chart wallet={this.state.wallet}/>
          </section>
        </div>
        }
      </main>
    );
  }
}

export default Home;