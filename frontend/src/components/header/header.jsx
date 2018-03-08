import React from "react";
import {NavLink} from "react-router-dom";
import './header.css';
import logo from '../../assets/logo.png';

const Header = () => (
  <div>
    <header className={"App-header"}>
      <div><img src={logo} className="logo" alt={"risitas"}/><span className="logo-titre">Bot RSI</span></div>
      <NavLink exact to="/" id="Home" className="link-header" activeClassName="active-link"><span
        className="App-title">Home</span></NavLink>
      <NavLink exact to="/stats" id="Stats" className="link-header" activeClassName="active-link"><span
        className="App-title">Stats</span></NavLink>
      <NavLink exact to="/about" id="About" className="link-header" activeClassName="active-link"><span
        className="App-title">About</span></NavLink>
    </header>
  </div>
);

export default Header;