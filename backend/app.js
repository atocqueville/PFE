const mongo = require('./lib/mongodb');
const startServer = require('./services/services').startWebsockets;
const express = require('express');
const wsServer = require('ws').Server;
const app = express();

let server = app.listen(3001, async () => {
  await mongo.initConfig();
  startServer();
});

// app.get('/users', function (req, res) {
//   res.json([{
//     id: 1,
//     username: "samsepi0l"
//   }, {
//     id: 2,
//     username: "D0loresH4ze"
//   }]);
// });
//
// const wss = new wsServer({server});
// wss.on('connection', (ws) => {
//   console.log('Client connected');
//   ws.on('message', (message) => console.log(message));
//   ws.on('close', () => console.log('Client disconnected'));
// });
//
// setInterval(() => {
//   wss.clients.forEach((client) => {
//     client.send(new Date().toTimeString());
//   });
// }, 1000);