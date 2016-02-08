"use strict";
var mongoose = require('mongoose');
var fs = require('fs');

module.exports = function() {
  return {
    isInitialized: false,
    connection: '',
    db: '',
    mongoConfig: '',
    schemas: {},
    models: {},
    initialize: function() {
      var promise = new Promise(function(resolve, reject) {
        var mongoConfig = fs.readFileSync('./data/mongo.json', 'utf8');
        this.mongoConfig = JSON.parse(mongoConfig);

        mongoose.connect(this.mongoConfig.url + '/' + this.mongoConfig.db);
        mongoose.connection.on('error', function() {
          console.log('Error connecting to db ' + this.mongoConfig.db);
          reject();
        }.bind(this));
        mongoose.connection.once('open', function() {
          this.isInitialized = true;
          console.log('Connected to db ' + this.mongoConfig.db);
          resolve();
        }.bind(this));
      }.bind(this));
      return promise;
    },
    removeCollection: function(collectionName) {
      var promise = new Promise(function(resolve, reject) {
        mongoose.connection.db.dropCollection(collectionName, function(err, result) {
          if (err && err.code !== 26) {
            console.log('Error removing collection ' + collectionName);
            reject(err);
          } else {
            console.log('Removed collection ' + collectionName);
            resolve(result);
          }
        });
      }.bind(this));
      return promise;
    },
    removeAllCollections: function() {
      var promise = new Promise(function(resolve, reject) {
        var promises = [];

        var collections = fs.readFileSync('./data/collections.json', 'utf8');
        collections = JSON.parse(collections);

        collections.forEach(function(item) {
          promises.push(this.removeCollection(item));
        }.bind(this));

        Promise.all(promises).then(function () {
          console.log('All collections removed');
          resolve();
        }.bind(this)).catch(function () {
          console.log('Error removing collections');
          reject();
        }.bind(this));
      }.bind(this));
      return promise;
    },
    createCollection: function(collectionName) {
      var promise = new Promise(function(resolve, reject) {
        mongoose.connection.db.createCollection(collectionName, function(err, result) {
          if (err && err.code !== 26) {
            console.log('Error creating collection ' + collectionName);
            reject(err);
          } else {
            console.log('Collection ' + collectionName + ' created');
            resolve(result);
          }
        });
      }.bind(this));
      return promise;
    },
    createAllCollections: function() {
      var promise = new Promise(function(resolve, reject) {
        var promises = [];

        var collections = fs.readFileSync('./data/collections.json', 'utf8');
        collections = JSON.parse(collections);

        collections.forEach(function(item) {
          promises.push(this.createCollection(item));
        }.bind(this));

        Promise.all(promises).then(function () {
          console.log('All collections created');
          resolve();
        }.bind(this)).catch(function () {
          console.log('Error creating collections');
          reject();
        }.bind(this));
      }.bind(this));
      return promise;
    },
    seedDb: function() {
      var promise = new Promise(function(resolve, reject) {
        var modelPromises = [];

        if (this.isInitialized) {
          this.removeAllCollections().then(function() {
            return this.createAllCollections();
          }.bind(this)).then(function() {

            var schemas = fs.readFileSync('./data/schemas.json', 'utf8');
            schemas = JSON.parse(schemas);

            var models = fs.readFileSync('./data/models.json', 'utf8');
            models = JSON.parse(models);


            schemas.forEach(function(schema) {
              var schemaName;
              for (var prop in schema) {
                if (schema.hasOwnProperty(prop)) {
                  schemaName = prop;
                  break;
                }
              }

              if (schemaName) {
                if (typeof this.schemas[schemaName] === 'undefined') {
                  var schemaTemplate = schema[schemaName];
                  this.schemas[schemaName] = mongoose.Schema(schemaTemplate);
                }

                if (typeof this.models[schemaName] === 'undefined') {
                  this.models[schemaName] = mongoose.model(schemaName, this.schemas[schemaName]);
                }

                if (typeof models[schemaName] !== 'undefined') {
                  models[schemaName].forEach(function(model) {
                    var tempModel = new this.models[schemaName](model);
                    modelPromises.push(tempModel.save());
                  }.bind(this));
                }
              }

            }.bind(this));

            if (modelPromises.length > 0) {
              Promise.all(modelPromises).then(function() {
                console.log('Database seeded db');
                resolve();
              }).catch(function() {
                console.log('Error seeding db when writing models');
                reject();
              });
            } else {
              resolve();
            }

          }.bind(this)).catch(function(err) {
            console.log('Error seeding db');
            reject();
          }.bind(this));
        } else {
          console.log('Error seeding db');
          reject();
        }
      }.bind(this));
      return promise;
    }
  }
};