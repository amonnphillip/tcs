"use strict";

module.exports = function() {
  return {
    origins: [
      'https://localhost:4301',
      'http://localhost:7357'
      ],
    allowHeaders: [
      'accept',
      'accept-version',
      'content-type',
      'request-id',
      'origin',
      'x-api-version',
      'x-request-id',
      'authorization'
    ],
    exposeHeaders: [
      'api-version',
      'content-length',
      'content-md5',
      'content-type',
      'date',
      'request-id',
      'response-time'
    ],
    _matchOrigin: function(req) {
      var origin = req.headers['origin'];

      function belongs(o) {
        if (origin === o || o === '*') {
          origin = o;
          return (true);
        }

        return (false);
      }

      return ((origin && this.origins.some(belongs)) ? origin : false);
    },
    _addHeaders: function(res, origin) {
      var AC_ALLOW_ORIGIN = 'Access-Control-Allow-Origin';
      var AC_ALLOW_CREDS = 'Access-Control-Allow-Credentials';
      var AC_EXPOSE_HEADERS = 'Access-Control-Expose-Headers';
      var AC_ALLOW_HEADERS = 'Access-Control-Allow-Headers';

      res.setHeader(AC_ALLOW_ORIGIN, origin);
      res.setHeader(AC_ALLOW_CREDS, 'true');
      res.setHeader(AC_EXPOSE_HEADERS, this.exposeHeaders.join(', '));
      res.setHeader(AC_ALLOW_HEADERS, this.allowHeaders.join(', '));
    },
    opt: function(req, res, next) {
      var origin;
      if (!(origin = this._matchOrigin(req))) {
        next();
        return;
      }

      this._addHeaders(res, origin);
      res.send(200);
      next();
    },
    restifyCorsPlugin: function() {
      return function(req, res, next) {
        res.once('header', function() {
          var origin;
          if (!(origin = this._matchOrigin(req))) {
            return;
          }

          this._addHeaders(res, origin);
        }.bind(this));
        next();
      }.bind(this);
    }
  };
};