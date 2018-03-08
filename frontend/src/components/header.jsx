import React from "react";
import {Link} from "react-router-dom";
import classNames from 'classnames';
import './header.css';
import logo from '../assets/logo.png';

const header = () => (
  <div>
    <header className={"App-header"}>
      <div><img src={logo} className="logo"/><span className="logo-titre">Bot RSI</span></div>
      <Link to="/" label="Home" className="link-header"><span className="App-title">Home</span></Link>
      <Link to="/stats" label="Stats" className="link-header"><span className="App-title">Stats</span></Link>
      <Link to="/about" label="About" className="link-header"><span className="App-title">About</span></Link>
    </header>
  </div>
);

let appHeader = classNames({
  'App-header': true
});

export default header;