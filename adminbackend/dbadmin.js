"use strict";
var mongoose = require('mongoose');
var fs = require('fs');

// TODO: Schema.json has empty objects

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
          // We are initialised so create the schemas and models for later use
          this.createSchemaAndModels();

          this.isInitialized = true;
          console.log('Connected to db ' + this.mongoConfig.db);
          resolve();
        }.bind(this));
      }.bind(this));
      return promise;
    },
    updateModel: function(srcModel, schema, targetModel) {
      for (var prop in schema.paths) {
        if (prop !== '_id' &&
          prop !== '__v') {
          targetModel[prop] = srcModel[prop];
        }
      }
    },
    createSchemaAndModels: function() {
      var schemas = fs.readFileSync('./data/schemas.json', 'utf8');
      schemas = JSON.parse(schemas);

      this.schemas = [];
      this.models = [];

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
            var schemaTemplate = require('./models/' + schemaName + "Model.js")();
            this.schemas[schemaName] = mongoose.Schema(schemaTemplate);
          }

          if (typeof this.models[schemaName] === 'undefined') {
            this.models[schemaName] = mongoose.model(schemaName, this.schemas[schemaName]);
          }
        }
      }.bind(this));
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

        for (var prop in this.schemas) {
          if (this.schemas.hasOwnProperty(prop)) {
            promises.push(this.removeCollection(prop + 's'));
          }
        }

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

        for (var prop in this.schemas) {
          if (this.schemas.hasOwnProperty(prop)) {
            promises.push(this.createCollection(prop + 's'));
          }
        }

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
    },
    getUserByUserName: function(userName) {
      return new Promise(function(resolve, reject) {
        if (typeof this.models.user !== 'undefined') {
          this.models.user.find({
            username: userName
          }, function(err, users) {
            if (err) {
              reject('user model not found');
            } else {
              if (users.length === 0) {
                reject('user not found');
              } else if (users.length === 1) {
                resolve(users[0]);
              } else if (users.length > 1) {
                reject('too many users with the same id');
              }
            }
          }.bind(this));
        } else {
          reject('user model has not been defined');
        }
      }.bind(this));
    },
    getModels: function(modelName) {
      return new Promise(function(resolve, reject) {
        if (typeof this.models[modelName] !== 'undefined') {
          this.models[modelName].find({
          }, function (err, models) {
            if (err) {
              reject(modelName + ' model not found');
            } else {
              if (models.length === 0) {
                reject(modelName + ' not found');
              } else if (models.length > 0) {
                resolve(models);
              }
            }
          }.bind(this));
        } else {
          reject(modelName + ' model has not been defined');
        }
      }.bind(this));
    },
    getModelById: function(id, modelName) {
      return new Promise(function(resolve, reject) {
        if (typeof this.models[modelName] !== 'undefined') {
          this.models[modelName].find({
            _id: id
          }, function (err, models) {
            if (err) {
              reject(modelName + ' model not found');
            } else {
              if (models.length === 0) {
                reject(modelName + ' not found');
              } else if (models.length === 1) {
                resolve(models[0]);
              } else if (models.length > 1) {
                reject(modelName + ': too many with the same name');
              }
            }
          }.bind(this));
        } else {
          reject(modelName + ' model has not been defined');
        }
      }.bind(this));
    },
    postModel: function(model, modelName) {
      return new Promise(function(resolve, reject) {
        if (typeof this.models[modelName] !== 'undefined') {
          var tempModel = new this.models[modelName](model);
          tempModel.save(function(err, retModel) {
            if (err) {
              reject(modelName + ' model not be saved');
            } else {
              resolve(retModel);
            }
          });
        }
      }.bind(this));
    },
    putModelById: function(model, id, modelName) {
      return new Promise(function(resolve, reject) {
        if (typeof this.models[modelName] !== 'undefined') {
          this.models[modelName].findById(id, function(err, foundModel) {
            if (err) {
              reject(modelName + ' model could not be saved');
            } else {
              var schema = foundModel.schema;
              this.updateModel(model, schema, foundModel);
              foundModel.save(function(err, retModel) {
                if (err) {
                  reject(modelName + ' model could not be saved');
                } else {
                  resolve(retModel);
                }
              }.bind(this));
            }
          }.bind(this));
        }
      }.bind(this));
    },
    deleteModelById: function(id, modelName) {
      return new Promise(function(resolve, reject) {
        if (typeof this.models[modelName] !== 'undefined') {
          this.models[modelName].remove({
            _id: id
          }, function(err) {
            if (err) {
              reject(modelName + ' model could not be deleted');
            } else {
              resolve();
            }
          })
        }
      }.bind(this));
    },
    getLayouts: function() {
      return this.getModels('layout');
    },
    getLayout: function(layoutId) {
      return this.getModelById(layoutId, 'layout');
    },
    postLayout: function(model) {
      return this.postModel(model, 'layout');
    },
    putLayout: function(model, layoutId) {
      return this.putModelById(model, layoutId, 'layout');
    },
    deleteLayout: function(layoutId) {
      return this.deleteModelById(layoutId, 'layout');
    },

    getDrinks: function() {
      return this.getModels('drink');
    },
    getDrink: function(drinkId) {
      return this.getModelById(drinkId, 'drink');
    },
    postDrink: function(model) {
      return this.postModel(model, 'drink');
    },
    putDrink: function(model, drinkId) {
      return this.putModelById(model, drinkId, 'drink');
    },
    deleteDrink: function(drinkId) {
      return this.deleteModelById(drinkId, 'drink');
    },

    getIngredients: function() {
      return this.getModels('ingredient');
    },
    getIngredient: function(ingredientId) {
      return this.getModelById(ingredientId, 'ingredient');
    },
    postIngredient: function(model) {
      return this.postModel(model, 'ingredient');
    },
    putIngredient: function(model, ingredientId) {
      return this.putModelById(model, ingredientId, 'ingredient');
    },
    deleteIngredient: function(ingredientId) {
      return this.deleteModelById(ingredientId, 'ingredient');
    },
  }
};