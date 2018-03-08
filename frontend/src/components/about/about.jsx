import React from "react";

class About extends React.Component {
  constructor(props) {
    super(props);
    this.state = {active: true};
  }

  // componentDidMount() {
  //   this.setState({
  //     active: true
  //   });
  // }
  //
  // componentWillUnmount() {
  //   this.setState({
  //     active: false
  //   });
  // }

  render() {
    return (
      <div>
        <h1>About</h1>
        <span id="rsi">Waiting for server..</span>
      </div>
    );
  }
}

export default About;