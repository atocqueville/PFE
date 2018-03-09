import React from "react";
import './config.css';

class Config extends React.Component {

  render() {
    return (
      <div className="config">
        <h1>Config</h1>
        <form>
          <input type="button" id="start" value="Start"/>
          <input type="button" id="stop" value="Stop"/>
          {/*<label>*/}
          {/*Name:*/}
          {/*<input type="text" value={this.state.value} onChange={this.handleChange} />*/}
          {/*</label>*/}
          <input type="button" value="Submit"/>
        </form>
      </div>
    );
  }
}

export default Config;