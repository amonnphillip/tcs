"use strict";
var mongoose = require('mongoose');

module.exports = function() {
  return {
    getSchemaIndexes: function() {
      return [
      ]
    },
    getSchemaTemplate: function() {
      return {
        name: { type: String, text: true }
      };
    }
  }
};