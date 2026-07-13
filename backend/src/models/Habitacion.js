const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Habitacion = sequelize.define('Habitacion', {
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
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('Disponible', 'Ocupado'),
    defaultValue: 'Disponible'
  },
  // Tu Plus: Fechas para controlar alertas de deuda
  fechaIngreso: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  diaPago: {
    type: DataTypes.INTEGER, // Ej: 15 (significa que paga los 15 de cada mes)
    allowNull: true
  }
});

module.exports = Habitacion;