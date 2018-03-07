import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

const ws = new WebSocket('ws://localhost:40510');

ws.onopen = function () {
  ws.send('client connected');
};

ws.onmessage = function (ev) {
  document.getElementById("rsi").innerHTML = ev.data;
};

// function updateStatus(status) {
//   ws.send(status);
// }

ReactDOM.render(<App/>, document.getElementById('root'));
registerServiceWorker();
