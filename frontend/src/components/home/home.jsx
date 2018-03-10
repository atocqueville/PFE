import React, {Component} from "react";
import Config from './config/config';
import History from './history/history';
import Chart from './chart/chart';
import './home.css';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date: new Date()
    });
  }

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