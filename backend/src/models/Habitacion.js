const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Habitacion = sequelize.define('Habitacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  precioMensual: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  piso: {
    type: DataTypes.INTEGER, // <-- NUEVO: Para guardar 1 o 2
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'Disponible' // Todos nacen Disponibles de verdad 🎉
  }
}, {
  timestamps: true
});

module.exports = Habitacion;