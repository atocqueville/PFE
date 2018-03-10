import React from "react";
import {NavLink} from "react-router-dom";
import './navbar.css';
import logo from '../../assets/logo.png';

const Navbar = () => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    <span className="navbar-brand">
      <img src={logo} width="30" height="30"
           className="d-inline-block align-top" alt="risitas"/>
      <span className="brand-name">Bot RSI</span>
    </span>
    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"/>
    </button>
    <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
      <div className="navbar-nav">
        <NavLink exact to="/" id="Home" className="nav-item nav-link">Home</NavLink>
        <NavLink exact to="/stats" id="Stats" className="nav-item nav-link">Stats</NavLink>
        <NavLink exact to="/about" id="About" className="nav-item nav-link">About</NavLink>
      </div>
    </div>
  </nav>
);

export default Navbar;