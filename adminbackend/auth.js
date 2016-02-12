"use strict";

var jwt = require('jsonwebtoken');
var fs = require('fs');

// TODO: how to handle logout? <<- use a redis database, or local array if we have one instance!!
// TODO: how to handle password change? <<-- use redis db!
// TODO: how to stop a token being used by more than one user?
// Is it up to the user to keep their token secure? Would solve a bunch of problems...

module.exports = function() {
  return {
    config: '',
    initialize: function() {
      var config = fs.readFileSync('./auth/authconfig.json', 'utf8');
      this.config = JSON.parse(config);

      this.publickey = fs.readFileSync('./auth/' + this.config.publickey, 'utf8');
      this.privatekey = fs.readFileSync('./auth/' + this.config.privatekey, 'utf8');
      console.log('Auth initialised');
    },
    createToken: function(userName, accountId, scopes) {
      return this.sign(userName, accountId, scopes);
    },
    sign: function(userName, accountId, scopes) {
      return new Promise(function(resolve, reject) {
        jwt.sign({
          userName: userName,
          accountId: accountId,
          scopes: scopes
        }, this.privatekey, {
          expiresIn: this.config.tokenExpire,
          issuer: this.config.jwtIssuer,
          subject: this.config.jwtSubject,
          algorithm: 'RS256'
        }, function(token) {
          resolve(token);
        });
      }.bind(this));
    },
    verify: function(token) {
      token = token.replace('Bearer ', '');
      token = token.replace('bearer ', '');
      return new Promise(function(resolve, reject) {
        jwt.verify(token, this.publickey, {algorithm: 'RS256'}, function(err, decoded) {
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