'use strict';

var Future = require('data.future');

module.exports = exports = function makeRouter(route, handler, parent) {
  var router = function routeHandler(oreq, ores, onext) {
    if (!onext) {
      onext = function next(req, res) {
        return Future.of(res);
      };
    }

    if (!parent) {
      return onext(oreq, ores);
    }

    return parent(oreq, ores, function next(req, res) {
      var path = req.get('path');

      // skip if route doesn't match
      if (path.toLowerCase().substr(0, route.length) !== route.toLowerCase()) {
        return onext(req, res);
      }

      // skip if route match does not border '/', '.' or end
      var c = path[route.length];
      if (c !== undefined && c !== '/' && c !== '.') {
        return onext(req, res);
      }

      // trim off the part of the url that matches the route
      if (route.length !== 0 && route !== '/') {
        var removed = route;
        var fqreq = req
          .update('url', sliceAtRemoved)
          .update('path', sliceAtRemoved);

        return handler(fqreq, res, function next(nreq, nres) {
          nreq = nreq.update('url', insertRemoved);
          nreq = nreq.update('path', insertRemoved);

          return onext(nreq, nreq);
        });
      }

      return handler(req, res, onext);

      function sliceAtRemoved(path) {
        path = path.slice(removed.length);

        if (path[0] === '/') {
          return path;
        } else {
          return '/' + path;
        }
      }

      function insertRemoved(path) {
        if (removed[removed.length] === '/') {
          return removed + path.slice(1);
        } else {
          return removed + path;
        }
      }
    });
  };

  router.use = function(route, fn) {
    if (typeof route !== 'string') {
      fn = route;
      route = '/';
    }

    if (route[route.length - 1] === '/') {
      route = route.slice(0, -1);
    }

    return makeRouter(route, fn, router);
  };

  router.useAll = function(routes) {
    return reduce(function(router, route) {
      if (typeof route === 'function') {
        return router.use(route);
      } else {
        return router.use(route[0], route[1]);
      }
    }, router, routes);
  };

  return router;
};

function reduce(fn, data, array) {
  var index = -1;
  var length = array.length;

  while (index++ < length) {
    data = fn(data, array[index]);
  }

  return data;
}
