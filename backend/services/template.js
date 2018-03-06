const ws = new WebSocket('ws://localhost:40510');

ws.onopen = function () {
  ws.send('client connected');
};

ws.onmessage = function (ev) {
  document.getElementById("rsi").innerHTML = ev.data;
};