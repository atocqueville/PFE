import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import Header from './components/header';
import Home from './components/home';
import Stats from './stats';
import About from './components/about';
// import Chart from './chart';
import './App.css';

class App extends Component {

  componentDidMount() {
    fetch('/users')
      .then(res => res.json())
      .then(users => console.log(users));
  }

  render() {
    return (
      <div className="App">
        <Router>
          <div>
            <Header/>
            <Route exact path="/" component={Home}/>
            <Route path="/stats" component={Stats}/>
            <Route path="/about" component={About}/>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
