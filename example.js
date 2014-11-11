'use strict';

var  nhttp = require('network.http-server');
var Future = require('data.future');
var   http = require('http');
var   path = require('path');
var router = require('./');
var     fs = require('fs');

var app = router();

app = app.use(function(req, res, next) {
  var filepath = __dirname + req.path;

  return readFile(filepath).map(function(data) {
    return res.type(path.extname(filepath)).send(data);
  }).orElse(function() {
    return next(req, res);
  });
});

app = app.use('/foo', function(req, res) {
  return Future.of(res.send(req.path));
});

app = app.use(function(req, res) {
  return Future.of(res.sendStatus(404));
});

http.createServer(nhttp(app)).listen(8000);

function readFile(file) {
  return new Future(function(reject, resolve) {
    fs.readFile(file, function(err, buffer) {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
}
