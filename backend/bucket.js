'use strict';

let couchbase = require('couchbase');

let cluster = new couchbase.Cluster('127.0.0.1');
cluster.authenticate('Tokie', 'detoka');
let bucket = cluster.openBucket('candles', function (err) {
  if (err) {
    console.log('cant open bucket');
    throw err;
  }
});
bucket.operationTimeout = 120 * 1000; // 120 seconds operation timeout

module.exports = bucket;