network.http-router
-------------------

A small routing framework for network.http-server.

Example
-------

```js
var Future = require('data.future');
var router = require('network.http-router');
var nhttp = require('network.http-server');
var http = require('http');

var app = router();

app = app.use('/', function(req, res) {
  return Future.of(req.set('body', 'Hello World'));
});

http.createServer(nhttp(app)).listen(9000);
```

Documentation
-------------

TODO

License
-------

Copyright &copy; 2014 Tenor Biel

Released under the MIT license.
