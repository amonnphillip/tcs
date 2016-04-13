import Ember from 'ember';
import http from './http-service';

export default Ember.Service.extend({
  http: http.create(),
  host: 'https://localhost:4301/api/', // TODO: Need to get this from configuration
  routes: {
    login: 'login',
    scopeCheck: 'scopecheck'
  },
  jwt: '',
  _isResponseJWT(jwt) {
    if (typeof jwt === 'string' &&
      jwt.length > 0) {
      return true;
    } else {
      return false;
    }
  },
  _isResponseJson(jsonString) {
    if (typeof jsonString === 'string' &&
      jsonString.length > 0) {
      try {
        var json = JSON.parse(jsonString);
        if (typeof json === 'object') {
          return true;
        }
      } catch(e) {
        // Do nothing on exception
      }
    }

    return false;
  },
  hasJWT() {
    return this.jwt.length > 0;
  },
  _getUrl(route) {
    var baseUrl = this.host + this.routes[route];
    if (arguments.length > 1) {
      var count = 0;
      arguments.forEach((arg) => {
        baseUrl.replace('::' + count + '::', arg);
        count ++;
      });
    }
    return baseUrl;
  },
  login(username, password, canceller) {
    return new Promise((resolve, reject) => { // TODO: cancellers do not work!
      this.get('http').httpPost(this._getUrl('login'), {
        username: username,
        password: password
      }, canceller).then((res) => {
        // Check if response is a jwt
        if (this._isResponseJWT(res.response)) {
          this.jwt = res.response;
          this.get('http').setHeaders([
            {
              name: 'Authorization',
              value: 'bearer ' + this.jwt
            }
          ]);
          resolve();
        } else {
          reject();
        }
      }).catch(function() {
        reject();
      }.bind(this));
    });
  },
  scopeCheck(canceller) {
    return new Promise((resolve, reject) => {
      this.get('http').httpGet(this._getUrl('scopeCheck'), canceller).then((res) => {
        // Check we got back the scopes for this user
        if (this._isResponseJson(res.response)) {
          resolve(JSON.parse(res.response));
        } else {
          reject();
        }
      }).catch((res) => {
        reject();
      });
    });
  },
  restPost() {

  },
  restPut() {

  },
  restDel() {

  }
});
