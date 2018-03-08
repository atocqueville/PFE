import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

let ws = new WebSocket('ws://localhost:3001');

ws.onopen = function () {
  ws.send('New client !');
};

ws.onmessage = function (event) {
  document.getElementById("rsi").innerHTML = event.data;
};

// function updateStatus(status) {
//   ws.send(status);
// }

ReactDOM.render(<App/>, document.getElementById('root'));
registerServiceWorker();
