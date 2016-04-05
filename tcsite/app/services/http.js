"use strict";
import Ember from 'ember';


export default Ember.Service.extend({
  initialize() {

  },
  setHeaders(req) {
    req.setRequestHeader("Cache-Control", "no-cache");
  },
  request(requestType, url, body, canceller) {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();

      req.addEventListener("load", function (e) {
        // TODO: Get req headers
        resolve(req);
      }.bind(this));
      req.addEventListener("error", function (e) {
        // TODO: Get req headers
        reject(req);
      }.bind(this));
      req.addEventListener("abort", function (e) {
        // TODO: Get req headers
        reject(req);
      }.bind(this));

      if (typeof canceller !== 'undefined') {
        canceller.cancel = function () {
          req.abort();
        }.bind(this);
      }

      req.open(requestType, url);
      req.withCredentials = true;
      req.setRequestHeader("Content-Type", "application/json");
      if (body !== null &&
        typeof body !== 'undefined') {
        req.send(JSON.stringify(body));
      } else {
        req.send();
      }

    }.bind(this));
  },
  get(url, canceller) {
    return this.request('GET', url, null, canceller);
  },
  post(url, body, canceller) {
    return this.request('POST', url, body, canceller);
  },
  put(url, body, canceller) {
    return this.request('PUT', url, body, canceller);
  },
  del(url, canceller) {
    return this.request('DELETE', url, null, canceller);
  }
});
