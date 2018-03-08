import React from "react";
import {Link} from "react-router-dom";

const header = () => (
  <div>
    <header className="App-header">
      <Link to="/" label="Home"><span className="App-title">Home</span></Link>
      <Link to="/stats" label="Stats"><span className="App-title">Stats</span></Link>
      <Link to="/about" label="About"><span className="App-title">About</span></Link>
    </header>
  </div>
);

export default header;