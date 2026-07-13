const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Habitacion = require('./Habitacion');

const Inquilino = sequelize.define('Inquilino', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dni: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Un DNI único por persona
  },
  nombreCompleto: {
    type: DataTypes.STRING,
    allowNull: false
  },
  celular: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});

// Relación: Un inquilino pertenece a una habitación
Inquilino.belongsTo(Habitacion, { foreignKey: 'idHabitacion', onDelete: 'SET NULL' });
Habitacion.hasOne(Inquilino, { foreignKey: 'idHabitacion' });

module.exports = Inquilino;