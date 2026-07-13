const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Asegúrate de que esta ruta apunte a tu config de BD

const Inquilino = sequelize.define('Inquilino', {
  dni: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true
  },
  nombreCompleto: {
    type: DataTypes.STRING,
    allowNull: false
  },
  celular: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Inquilino;