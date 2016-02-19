"use strict";
var mongoose = require('mongoose');

module.exports = function() {
  return {
    username: { type: String, unique: true, required: true, dropDups: true },
    password: String,
    scopes: [String]
  }
};