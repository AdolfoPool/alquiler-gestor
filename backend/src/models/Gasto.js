const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Gasto = sequelize.define('Gasto', {
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  monto: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Gasto;