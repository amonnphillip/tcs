import Ember from 'ember';
"use strict";

export default Ember.Service.extend({
  initialize() {

  },
  request(requestType, url, body, canceller) {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();

      debugger;
      // TODO: Set req headers
      //req.

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
      req.send();
    }.bind(this));
  },
  get(url, canceller) {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();

      // TODO: Set req headers

      req.addEventListener("load", function(e) {
        // TODO: Get req headers
        resolve(req);
      }.bind(this));
      req.addEventListener("error", function(e) {
        // TODO: Get req headers
        reject(req);
      }.bind(this));
      req.addEventListener("abort", function(e) {
        // TODO: Get req headers
        reject(req);
      }.bind(this));

      if (typeof canceller !== 'undefined') {
        canceller.cancel = function() {
          req.abort();
        }.bind(this);
      }

      req.open("GET", url);
      req.send();
    });
  },
  post(url, body, canceller) {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();

      // TODO: Set req headers
      req.

      req.addEventListener("load", function(e) {
        // TODO: Get req headers
        resolve(req);
      }.bind(this));
      req.addEventListener("error", function(e) {
        // TODO: Get req headers
        reject(req);
      }.bind(this));
      req.addEventListener("abort", function(e) {
        // TODO: Get req headers
        reject(req);
      }.bind(this));

      if (typeof canceller !== 'undefined') {
        canceller.cancel = function() {
          req.abort();
        }.bind(this);
      }

      req.open("POST", url);
      req.send();
    });
  }
});
