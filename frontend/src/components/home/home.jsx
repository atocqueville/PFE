import React, {Component} from "react";
import Config from './config/config';
import History from './history/history';
import Chart from './chart/chart';
import './home.css';

class Home extends Component {

  render() {
    return (
      <main>
        <section>
          <Config/>
        </section>
        <section>
          <History/>
        </section>
        <section className="chart">
          <Chart/>
        </section>
      </main>
    );
  }
}

export default Home;