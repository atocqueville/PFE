import React from "react";
import {NavLink} from "react-router-dom";
import './navbar.css';
import logo from '../../assets/logo.png';

const Navbar = () => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    <NavLink className="navbar-brand" to="/">
      <img src={logo} width="30" height="30"
           className="d-inline-block align-top" alt="risitas"/>Bot RSI
    </NavLink>
    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
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