import React from "react";
import './home.css';
import Config from './config/config';
import Chart from './chart/chart';
import History from './history/history';

class Home extends React.Component {
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
      <div className="home">
        <div className="left-side">
          <Config/>
        </div>
        <div className="right-side">
          <Chart/>
          <History/>
        </div>
      </div>
    );
  }
}

export default Home;