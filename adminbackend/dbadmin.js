"use strict";
var mongoose = require('mongoose');
var fs = require('fs');

// TODO: Schema.json has empty objects

module.exports = function() {
  return {
    mongoose: '',
    isInitialized: false,
    connection: '',
    db: '',
    mongoConfig: '',
    schemas: {},
    models: {},
    initialize: function() {
      console.log('initialzing db admin module');

      this.mongoose = new mongoose.Mongoose();

      var promise = new Promise(function(resolve, reject) {
        var mongoConfig = fs.readFileSync('./data/mongo.json', 'utf8');
        this.mongoConfig = JSON.parse(mongoConfig);

        this.openConnection(this.mongoConfig.url + '/' + this.mongoConfig.db).then(function() {
          console.log('Connected to db ' + this.mongoConfig.db);
          this.isInitialized = true;
          this.createSchemaAndModels();
          resolve();
        }.bind(this)).catch(function(err) {
          console.log('Error connecting to db ' + this.mongoConfig.db);
          console.log(err);
          reject();
        }.bind(this));


        // TODO: DO I NEED THIS??
        this.mongoose.connection.on('error', function(err) {
          console.log('Error connecting to db ' + this.mongoConfig.db);
        }.bind(this));


        // TODO: DO I NEED THIS??
        this.mongoose.connection.once('open', function() {
          // We are initialised so create the schemas and models for later use
          //this.createSchemaAndModels();
          //this.isInitialized = true;
          //console.log('Connected to db ' + this.mongoConfig.db);
          //resolve();
        }.bind(this));
      }.bind(this));
      return promise;
    },
    shutdown: function() {
      console.log('Shutting down');
      return new Promise(function(resolve, reject) {
        this.closeConnection().then(function() {
          delete this.mongoose;

          for (var prop in this.schemas) {
            if (this.schemas.hasOwnProperty(prop)) {
              delete this.schemas[prop];
            }
          }

          for (var prop in this.models) {
            if (this.models.hasOwnProperty(prop)) {
              delete this.models[prop];
            }
          }

          this.models = [];
          this.schemas = [];

          this.isInitialized = false;

          console.log('Shutdown complete');
          resolve();
        }.bind(this)).catch(function() {
          console.log('Error shutdown complete');
          reject();
        }.bind(this))
      }.bind(this));
    },
    openConnection: function(url) {
      console.log('connecting');
      return new Promise(function(resolve, reject) {
        this.mongoose.connect(url, function(error) {
          if (error) {
            console.log('connection open error');
            reject();
          } else {
            console.log('connection open');
            resolve();
          }
        })
      }.bind(this));
    },
    closeConnection: function() {
      console.log('closing');
      return new Promise(function(resolve, reject) {
        this.mongoose.connection.close(function() {
          console.log('connection closed');
          resolve();
        })
      }.bind(this));
    },
    disconnect: function() {
      console.log('disconnecting');
      return new Promise(function(resolve, reject) {
        this.mongoose.disconnect(function() {
          console.log('disconnected');
          resolve();
        })
      }.bind(this));
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
            this.schemas[schemaName] = this.mongoose.Schema(schemaTemplate.getSchemaTemplate(), {
              autoIndex: true
            });

            var schemaIndexes = schemaTemplate.getSchemaIndexes();
            schemaIndexes.forEach(function(schemaIndex) {
              this.schemas[schemaName].index(schemaIndex);
            }.bind(this));
          }

          if (typeof this.models[schemaName] === 'undefined') {
            this.models[schemaName] = this.mongoose.model(schemaName, this.schemas[schemaName]);

            // For debug purposes
            this.models[schemaName].schema.options.emitIndexErrors = true;
            this.models[schemaName].on('index', function(err) {
              if (err) {
                console.log('error building indexes: ' + err);
              } else {
                console.log('indexes built');
              }
            });
            this.models[schemaName].on('error', function(err) {
              console.log('error on model: ' + err);
            });
          }
        }
      }.bind(this));
    },
    removeCollection: function(collectionName) {
      var promise = new Promise(function(resolve, reject) {
        this.mongoose.connection.db.dropCollection(collectionName, function(err, result) {
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
    removeAllCollections: function(fullSeed) {
      var promise = new Promise(function(resolve, reject) {
        var promises = [];

        for (var prop in this.schemas) {
          if (!(fullSeed && prop === 'user')) {
            if (this.schemas.hasOwnProperty(prop)) {
              promises.push(this.removeCollection(prop + 's'));
            }
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
        this.mongoose.connection.db.createCollection(collectionName, function(err, result) {
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
    ensureIndexOnModel: function(modelName) {
      console.log('ensureIndexOnModel for model ' + modelName);
      return new Promise(function(resolve, reject) {
        if (typeof this.models[modelName] !== 'undefined') {
          this.models[modelName].ensureIndexes(function (err) {
            if (err) {
              console.log('ensureIndexes completed with error on model. ' + err);
              reject();
            } else {
              console.log('ensureIndexes completed on model ' + modelName);
              resolve();
            }
          }.bind(this))
        } else {
          reject();
        }
      }.bind(this));
    },
    ensureAllIndexes: function() {
      var promise = new Promise(function(resolve, reject) {
        var modelPromises = [];
        for(var prop in this.models) {
          if (this.models.hasOwnProperty(prop)) {
            modelPromises.push(this.ensureIndexOnModel(prop));
          }
        }

        Promise.all(modelPromises).then(function() {
          console.log('All indexes built');
          resolve();
        }.bind(this)).catch(function() {
          console.log('Error building indexes');
          reject();
        });
      }.bind(this));
      return promise;
    },
    seedDb: function(fullSeed) {
      fullSeed = false;

      var promise = new Promise(function(resolve, reject) {
        var modelPromises = [];

        if (this.isInitialized) {
          this.removeAllCollections(fullSeed).then(function() {
            return this.createAllCollections();
          }.bind(this)).then(function() {
            return this.closeConnection();
          }.bind(this)).then(function() {
            return this.shutdown();
          }.bind(this)).then(function() {
            return this.initialize();
          }.bind(this)).then(function() {

            var schemas = fs.readFileSync('./data/schemas.json', 'utf8');
            schemas = JSON.parse(schemas);

            var models = fs.readFileSync('./data/models.json', 'utf8');
            models = JSON.parse(models);

// TODO: We have already parsed schemas.json at this point!
            schemas.forEach(function(schema) {
              var schemaName;
              for (var prop in schema) {
                if (schema.hasOwnProperty(prop)) {
                  schemaName = prop;
                  break;
                }
              }

              if (schemaName) {
                if (!(fullSeed && schemaName === 'user')) {
                  if (typeof models[schemaName] !== 'undefined') {
                    models[schemaName].forEach(function(model) {
                      var tempModel = new this.models[schemaName](model);
                      modelPromises.push(tempModel.save());
                    }.bind(this));
                  }
                }
              }

            }.bind(this));

            if (modelPromises.length > 0) {
              Promise.all(modelPromises).then(function() {
                return this.ensureAllIndexes();
              }.bind(this)).then(function() {
                console.log('Database seeded db');
                resolve();
              }.bind(this)).catch(function() {
                console.log('Error seeding db');
                reject();
              }.bind(this));
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
    getModelsByTextQuery: function(modelName, property, query) {
      return new Promise(function(resolve, reject) {
        if (typeof this.models[modelName] !== 'undefined') {

          var queryModel = {};
          queryModel[property] = {
            $text:
            {
              $search: query,
              $language: 'none',
              $caseSensitive: false,
              $diacriticSensitive: false
            }
          };

          queryModel = {
            $text:
            {
              $search: query
            }
          };

          this.models[modelName].find(queryModel, function (err, models) {
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
    getIngredientsByQuery: function(query) {
      return this.getModelsByTextQuery('ingredient', 'name', query);
    }
  }
};