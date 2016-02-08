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
    useHTTPS: true,
    serverPort: 4301,
    server: '',
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

      this.server.get('/api/login', function(req, res, next) {
        console.log('/api/login');
        auth.createToken().then(function(token) {
          res.send(200, token);
        }).catch(function() {
          res.send(200, 'error!'); // TODO: Return some kind of error
        });
        return next();
      });

      this.server.get('/api/dosomething', function(req, res, next) {
        console.log('/api/login');
        if (typeof req.headers.authorization !== 'undefined') {
          auth.verify(req.headers.authorization).then(function(authRes) {
            res.header('Authorization', authRes.token);
            res.send(200, authRes.token);
          }).catch(function() {
            res.send(200, 'error!'); // TODO: Return some kind of error
          });
        } else {
          // No authorization
          res.send(200, 'error!'); // TODO: Return some kind of error
        }

        return next();
      });

      this.server.get('/api/scope', function(req, res, next) {
        console.log('/api/scope');
        if (typeof req.headers.authorization !== 'undefined') {
          auth.verify(req.headers.authorization).then(function(authRes) {
            var d = auth.hasScope(authRes.decoded, 'user'); // Check we have the scope... Will remove
            res.send(200, d);
          }).catch(function() {
            res.send(200, 'error!'); // TODO: Return some kind of error
          });
        } else {
          // No authorization
          res.send(200, 'error!'); // TODO: Return some kind of error
        }
      });

      this.server.get('/api/seeddb', function(req, res, next) {
        console.log('/api/seeddb');
        if (typeof req.headers.authorization !== 'undefined') {
          auth.verify(req.headers.authorization).then(function(authRes) {
            if (auth.hasScope(authRes.decoded, 'any')) {
              // Authorization ok
              dbadmin.seedDb().then(function(m) {
                console.log(m);
                res.send(okRetCode);
              });
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
      });


      this.server.listen(this.serverPort, function() {
        console.log('%s listening at %s', this.server.name, this.server.url);
      }.bind(this));
    }
  }
};