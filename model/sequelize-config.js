'use strict';  
const Sequelize = require('sequelize'); 
let env = 'stfqa'; 
console.log("env-sequelize", env);
const config = require('../db-config.json')[env];
const db = {
  sequelize: null,
  Sequelize: null,
  associate: null
};

let sequelize = new Sequelize(config.database, config.user, config.password, config);

Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = sequelize;
