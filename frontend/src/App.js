import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import Header from './components/header';
import Home from './components/home';
import Stats from './components/stats';
import About from './components/about';
import './App.css';
// import Chart from './chart';

class App extends Component {

  componentDidMount() {
    fetch('/users')
      .then(res => res.json())
      .then(users => console.log(users));
  }

  render() {
    return (
      <div>
        <Router>
          <div>
            <Header/>
            <div className="body-container">
              <Route exact path="/" component={Home}/>
              <Route path="/stats" component={Stats}/>
              <Route path="/about" component={About}/>
            </div>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
