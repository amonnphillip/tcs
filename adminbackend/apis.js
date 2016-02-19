"use strict";

var fs = require('fs');
var restify = require('restify');
var status = require('./status')();
var auth = require('./auth')();
var dbadmin = require('./dbadmin')();

var okRetCode = 200;
var errorRetCode = 401;
var noAuthRetCode = 401;

module.exports = function() {
  return {
    HTTPCodes: {
      OK: {
        code: 200,
        message: 'ok'
      },
      GENERIC_ERROR: {
        code: 400,
        message: 'error'
      },
      NO_AUTH: {
        code: 401,
        message: 'not authorized'
      },
      AUTH_FAILED: {
        code: 401,
        message: 'authorized failed'
      }
    },
    useHTTPS: true,
    serverPort: 4301,
    server: '',
    status: status, // TODO: Initialize this within this object?
    auth: auth, // TODO: Initialize this within this object?
    dbadmin: dbadmin, // TODO: Initialize this within this object?
    initializeServer: function() {
      if (this.useHTTPS) {
        this.server = restify.createServer({
          name: 'tcs apis',
          key: fs.readFileSync('./certs/privatekey.key'),
          certificate: fs.readFileSync('./certs/certificate.crt'),
          passphrase: 'tcs'
        });
      } else {
        this.server = restify.createServer({
          name: 'tcs apis'
        });
      }

      this.server.use(restify.queryParser());
      this.server.use(restify.bodyParser());
      this.server.use(
        function crossOrigin(req,res,next){
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
          res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
          return next();
        }
      );

      this.server.use(restify.CORS({
        origins: ['*'],   // defaults to ['*']
        credentials: true,                 // defaults to false
        headers: ['Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With']
      }));
      this.server.use(restify.fullResponse());

      // auth initialization
      auth.initialize();

      // Database initialization
      dbadmin.initialize(); // TODO: Should wait for promise to finish?

      // APIs
      this.server.get('/api/status', function(req, res, next) {
        console.log('/api/status');
        res.send(200, status.machineStatus());
        return next();
      });

      this.server.post('/api/login', function(req, res, next) {
        console.log('/api/login');

        if (typeof req.body.username !== 'undefined' &&
          typeof req.body.password !== 'undefined') {
          this.dbadmin.getUserByUserName(req.body.username).then(function(user) {
            return auth.createToken(user.username, user.id, user.scopes);
          }.bind(this)).then(function(token) {
            res.send(this.HTTPCodes.OK.code, token);
          }.bind(this)).catch(function(err) {
            res.send(this.HTTPCodes.AUTH_FAILED.code, this.HTTPCodes.AUTH_FAILED.message + ' ' + err);
          }.bind(this));
        }

        return next();
      }.bind(this));

      this.server.get('/api/scopecheck', function(req, res, next) {
        console.log('/api/scopecheck');
        this.verifyTokenAndScope(req, res, next, 'any', function(req, res, next, decodedToken) {
          res.send(this.HTTPCodes.OK.code, decodedToken.scopes);
        }.bind(this));
      }.bind(this));

      this.server.get('/api/seeddb', function(req, res, next) {
        console.log('/api/seeddb');
        this.verifyTokenAndScope(req, res, next, 'admin', function(req, res, next, decodedToken) {
          dbadmin.seedDb().then(function(result) {
            res.send(this.HTTPCodes.OK.code);
          }.bind(this)).catch(function(result) {
            res.send(this.HTTPCodes.GENERIC_ERROR.code, result);
          }.bind(this));
        }.bind(this));
      }.bind(this));

      /*
      this.server.get('/api/layout', function(req, res, next) {
        console.log('/api/layout');
        this.verifyTokenAndScope(req, res, next, 'admin', function(req, res, next, decodedToken) {
          dbadmin.getLayouts().then(function(result) {
            res.send(this.HTTPCodes.OK.code, result);
          }.bind(this)).catch(function(result) {
            res.send(this.HTTPCodes.GENERIC_ERROR.code, result);
          }.bind(this));
        }.bind(this));
      }.bind(this));

      this.server.get('/api/layout/:id', function(req, res, next) {
        console.log('/api/layout/' + req.params.id);
        this.verifyTokenAndScope(req, res, next, 'admin', function(req, res, next, decodedToken) {
          // TODO: verify body
          dbadmin.getLayout(req.params.id).then(function(result) {
            res.send(this.HTTPCodes.OK.code, result);
          }.bind(this)).catch(function(result) {
            res.send(this.HTTPCodes.GENERIC_ERROR.code, result);
          }.bind(this));
        }.bind(this));
      }.bind(this));

      this.server.post('/api/layout', function(req, res, next) {
        console.log('/api/layout');
        this.verifyTokenAndScope(req, res, next, 'admin', function(req, res, next, decodedToken) {
          // TODO: verify body
          dbadmin.postLayout(req.body).then(function(result) {
            res.send(this.HTTPCodes.OK.code, result);
          }.bind(this)).catch(function(result) {
            res.send(this.HTTPCodes.GENERIC_ERROR.code, result);
          }.bind(this));
        }.bind(this));
      }.bind(this));

      this.server.put('/api/layout/:id', function(req, res, next) {
        console.log('/api/layout');
        this.verifyTokenAndScope(req, res, next, 'admin', function(req, res, next, decodedToken) {
          // TODO: verify body
          dbadmin.putLayout(req.body, req.params.id).then(function(result) {
            res.send(this.HTTPCodes.OK.code, result);
          }.bind(this)).catch(function(result) {
            res.send(this.HTTPCodes.GENERIC_ERROR.code, result);
          }.bind(this));
        }.bind(this));
      }.bind(this));

      this.server.del('/api/layout/:id', function(req, res, next) {
        console.log('DELETE /api/layout');
        this.verifyTokenAndScope(req, res, next, 'admin', function(req, res, next, decodedToken) {
          // TODO: verify body
          dbadmin.deleteLayout(req.params.id).then(function(result) {
            res.send(this.HTTPCodes.OK.code, result);
          }.bind(this)).catch(function(result) {
            res.send(this.HTTPCodes.GENERIC_ERROR.code, result);
          }.bind(this));
        }.bind(this));
      }.bind(this));
*/


      this.createApi = function(verb, url, restriction, action) {
        this.server[verb](url, function(req, res, next) {
          console.log(verb + ' ' + url);
          this.verifyTokenAndScope(req, res, next, restriction, function(req, res, next, decodedToken) {
            // TODO: verify body
            action(req, res, next).then(function(result) {
              res.send(this.HTTPCodes.OK.code, result);
            }.bind(this)).catch(function(result) {
              res.send(this.HTTPCodes.GENERIC_ERROR.code, result);
            }.bind(this));
          }.bind(this));
        }.bind(this));
      };

      this.createApi('get', '/api/layout', 'admin', function(req, res, next) {
        return dbadmin.getLayouts();
      }.bind(this));

      this.createApi('get', '/api/layout/:id', 'admin', function(req, res, next) {
        return dbadmin.getLayout(req.params.id);
      }.bind(this));

      this.createApi('post', '/api/layout', 'admin', function(req, res, next) {
        return dbadmin.postLayout(req.body);
      }.bind(this));

      this.createApi('put', '/api/layout/:id', 'admin', function(req, res, next) {
        return dbadmin.putLayout(req.body, req.params.id);
      }.bind(this));

      this.createApi('del', '/api/layout/:id', 'admin', function(req, res, next) {
        return dbadmin.deleteLayout(req.params.id);
      }.bind(this));

      this.server.listen(this.serverPort, function() {
        console.log('%s listening at %s', this.server.name, this.server.url);
      }.bind(this));
    },
    verifyTokenAndScope: function(req, res, next, expectedScope, authOkFunction) {
      if (typeof req.headers.authorization !== 'undefined') {
        auth.verify(req.headers.authorization).then(function(authRes) {
          if (auth.hasScope(authRes.decoded, expectedScope)) {
            // Authorization ok
            authOkFunction(req, res, next, authRes.decoded);
          } else {
            // Authorization header from user does not have scope to do this
            res.send(noAuthRetCode);
          }
        }).catch(function() {
          // Authorization header mismatch
          res.send(noAuthRetCode);
        });
      } else {
        // No authorization header
        res.send(noAuthRetCode);
      }
    }
  }
};