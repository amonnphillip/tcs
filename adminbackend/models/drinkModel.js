"use strict";
var mongoose = require('mongoose');

module.exports = function() {
  return {
    getSchemaIndexes: function() {
      return [];
    },
    getSchemaTemplate: function() {
      return {
        name: String,
        ratings: {
          5: Number,
          4: Number,
          3: Number,
          2: Number,
          1: Number,
          0: Number
        },
        ingredients: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ingredients'
          }
        ]
      }
    }
  }
};