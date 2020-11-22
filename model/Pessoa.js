const { Sequelize, Model, DataTypes, BuildOptions, HasManyGetAssociationsMixin, Association } = require('sequelize');
const sequelize = require("./sequelize-config");

class Pessoa extends Model {}

Pessoa.init({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  nome: {
    allowNull: false,
    type: DataTypes.STRING(255),
    validate: {
      len: {msg: 'Favor inserir nome', args: [1, 255]},
      notNull: {msg: 'Favor inserir nome'},
    }
  }, 
  custo: {
    allowNull: false,
    type: DataTypes.FLOAT(11),
    validate: {
      len: {msg: 'Favor inserir o custo', args: [1, 255]},
      notNull: {msg: 'Favor inserir o custo'},
    }
  }, 
  matricula: {
    allowNull: false,
    type: DataTypes.STRING(255),
    validate: {
      len: {msg: 'Favor inserir matricula', args: [1, 255]},
      notNull: {msg: 'Favor inserir matricula'},
    }
  }, 
  cpf: {
    allowNull: false,
    type: DataTypes.STRING(45),
    validate: {
      len: {msg: 'Favor inserir cpf', args: [1, 45]},
      notNull: {msg: 'Favor inserir cpf'},
    }
  } 
}, {
  sequelize: sequelize, // this bit is important
  tableName: 'pessoa',
  underscored: true,
});

module.exports = { Pessoa }