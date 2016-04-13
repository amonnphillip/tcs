import Ember from 'ember';

export default Ember.Service.extend({
  headers: [{
    name: 'Content-Type',
    value: 'application/json'
  }],
  getHeader(headerName) {
    this.headers.forEach((header) => {
      if (headerName === header.name) {
        return header;
      }
    });
  },
  setHeaders(headersArray) {
    headersArray.forEach((header) => {
      var headerObj = this.getHeader(header.name);
      if (typeof headerObj !== 'undefined') {
        headerObj.value = header.value;
      } else {
        this.headers.push(header);
      }
    });
  },
  setRequestHeaders(req) {
    this.headers.forEach((header) => {
      req.setRequestHeader(header.name, header.value);
      console.dir('setHeaders: ' + header.name + ' ' + header.value);
    });
  },
  _formatResponse(res, response) {
    if (typeof response === 'string') {
      if (response.startsWith('"') &&
        response.endsWith('"')) {
        response = response.slice(1, response.length - 1);
      }
    }

    return response;
  },
  _formatResponseHeaders(headerString) {
    var ret = {};
    var fragments = headerString.split('\n');
    fragments.forEach(function(fragment) {
      var index = fragment.indexOf(':');
      if (index >= 0) {
        var headerName = fragment.slice(0, index);
        var headerValue = fragment.slice(index + 1, fragment.length);
        if (headerName.length > 0 &&
          headerValue.length > 0) {
          ret[headerName] = headerValue.trim();
        }
      }
    });
  },
  _request(requestType, url, body, canceller) {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();

      req.addEventListener("load", function () {
        if (req.status === 200) {
          resolve({
            status: req.status,
            response: this._formatResponse(req, req.response),
            headers: this._formatResponseHeaders(req.getAllResponseHeaders())
          });
        } else {
          reject({
            status: req.status,
            response: this._formatResponse(req, req.response),
            headers: this._formatResponseHeaders(req.getAllResponseHeaders())
          });
        }
      }.bind(this));
      req.addEventListener("error", function () {
        reject({
          status: req.status,
          response: this._formatResponse(req, req.response),
          headers: this._formatResponseHeaders(req.getAllResponseHeaders())
        });
      }.bind(this));
      req.addEventListener("abort", function () {
        reject({
          status: req.status,
          response: this._formatResponse(req, req.response),
          headers: this._formatResponseHeaders(req.getAllResponseHeaders())
        });
      }.bind(this));

      if (typeof canceller !== 'undefined') {
        canceller.cancel = function () {
          req.abort();
        }.bind(this);
      }

      console.dir('_request: ' + requestType + ' ' + url);

      req.open(requestType, url);
      req.withCredentials = true;
      this.setRequestHeaders(req);
      if (body !== null &&
        typeof body !== 'undefined') {
        req.send(JSON.stringify(body));
      } else {
        req.send();
      }

    }.bind(this));
  },
  httpGet(url, canceller) {
    return this._request('GET', url, null, canceller);
  },
  httpPost(url, body, canceller) {
    return this._request('POST', url, body, canceller);
  },
  httpPut(url, body, canceller) {
    return this._request('PUT', url, body, canceller);
  },
  httpDel(url, canceller) {
    return this._request('DELETE', url, null, canceller);
  }
});
