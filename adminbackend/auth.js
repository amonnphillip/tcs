"use strict";

var jwt = require('jsonwebtoken');
var fs = require('fs');

// TODO: how to handle logout? <<- use a redis database, or local array if we have one instance!!
// TODO: how to handle password change? <<-- use redis db!
// TODO: how to stop a token being used by more than one user?

/*
When user logs in generate a token and set the user record as logged in
At each request verify token. If token could not be verified return 401
if token has expired check user is logged in and generate a new token if user is indeed still logged in. If user is logged out return 401
*/

module.exports = function() {
  return {
    config: '',
    initialize: function() {
      var config = fs.readFileSync('./auth/authconfig.json', 'utf8');
      this.config = JSON.parse(config);

      this.cert = fs.readFileSync('./auth/' + this.config.cert, 'utf8');
      console.log('Auth initialised');
    },
    createToken: function(userName, userPassword) {
      // TODO: Verify un and password

      var accountId = 0; // TODO: Get accountId
      var scopes = ['user']; // TODO: Get user scopes

      return this.sign(accountId, scopes);
    },
    sign: function(accountId, scopes) {
      return new Promise(function(resolve, reject) {
        jwt.sign({
          accountId: accountId,
          scopes: scopes
        }, this.cert, {
          expiresIn: this.config.tokenExpire,
          issuer: this.config.jwtIssuer,
          subject: this.config.jwtSubject,
          algorithm: 'RS512'
        }, function(token) {
          resolve(token);
        });
      }.bind(this));
    },
    verify: function(token) {
      token = token.replace('Bearer ', '');
      token = token.replace('bearer ', '');
      return new Promise(function(resolve, reject) {
        jwt.verify(token, this.cert, {algorithm: 'RS512'}, function(err, decoded) {
          if (err) {
            console.log('Auth token verify failed, ' + err.message);
            reject(err.message);
          } else {
            this.sign(decoded.accountId, decoded.scopes).then(function(token) {
              resolve({
                token: token,
                decoded: decoded
              });
            }).catch(function() {
              reject();
            });
          }
        }.bind(this));
      }.bind(this));
    },
    hasScope: function(decoded, scope) {
      if (scope === 'any') {
        return true;
      }

      if (typeof decoded.scopes !== 'undefined') {
        return decoded.scopes.indexOf(scope) > -1;
      }

      return false;
    }
  }
};