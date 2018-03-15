const mongo = require('./lib/mongodb');
const startServer = require('./services/services').startWebsockets;
const express = require('express');
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