"use strict";
var mongoose = require('mongoose');

module.exports = function() {
  return {
    name: String,
    date: Date
  }
};