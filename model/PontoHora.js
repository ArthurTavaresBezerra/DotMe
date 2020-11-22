const { Sequelize, Model, DataTypes, BuildOptions, HasManyGetAssociationsMixin, Association } = require('sequelize');
const sequelize = require("./sequelize-config");

class PontoHora extends Model {}

PontoHora.init({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  pessoa_id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: 'pessoa',
      key: 'id'
    },
    validate: {
      len: {msg: 'Favor inserir a pessoa', args: [1, 255]},
      notNull: {
        msg: 'Favor inserir pessoa'
      }
    }
  },
  data:{
    allowNull:false,
    type: DataTypes.STRING,
    validate: {
      len: {msg: 'Favor inserir a data', args: [2, 255]},
      notNull: {
        msg: 'Favor inserir data'
      }
    }
  },
  entrada1:{
    allowNull:true,
    type: DataTypes.TIME
  },
  saida1:{
    allowNull:true,
    type: DataTypes.TIME
  },
  entrada2:{
    allowNull:true,
    type: DataTypes.TIME
  },
  saida2:{
    allowNull:true,
    type: DataTypes.TIME
  },
  entrada3:{
    allowNull:true,
    type: DataTypes.TIME
  },
  saida3:{
    allowNull:true,
    type: DataTypes.TIME
  },
  entrada4:{
    allowNull:true,
    type: DataTypes.TIME
  },
  saida4:{
    allowNull:true,
    type: DataTypes.TIME
  },
  is_ferias:{
    allowNull:false,
    type: DataTypes.BOOLEAN,
    validate: {
      len: {msg: 'Favor inserir ferias', args: [2, 255]},
    }
  },
  is_falta:{
    allowNull:false,
    type: DataTypes.BOOLEAN,
    validate: {
      len: {msg: 'Favor inserir falta', args: [2, 255]},
    }
  },
  is_inconsistente:{
    allowNull:false,
    type: DataTypes.BOOLEAN    
  },
  qtd_hora_total:{
    allowNull:false,
    type: DataTypes.FLOAT,
    defaultValue:0
  },
  qtd_hora_saldo:{
    allowNull:false,
    type: DataTypes.FLOAT,
    defaultValue:0
  }
}, {
  sequelize: sequelize, 
  tableName: 'ponto_hora',
  underscored: true,
});

module.exports = {PontoHora}