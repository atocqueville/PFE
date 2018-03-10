import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import Navbar from './components/navbar/navbar';
import Home from './components/home/home';
import Stats from './components/stats/stats';
import About from './components/about/about';
import './App.css';

class App extends Component {

  render() {
    return (
        <Router>
          <div>
            <Navbar/>
            <Route exact path="/" component={Home}/>
            <Route exact path="/stats" component={Stats}/>
            <Route exact path="/about" component={About}/>
          </div>
        </Router>
    );
  }
}

export default App;
