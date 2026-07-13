const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Habitacion = require('./Habitacion');

const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mesPagado: {
    type: DataTypes.STRING, // Ej: "Enero 2026"
    allowNull: false
  },
  monto: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  impuestoSunat: {
    type: DataTypes.FLOAT,
    allowNull: false // Aquí guardaremos el 5% calculado
  },
  inquilinoNombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

// Relación: Un pago corresponde a una habitación
Pago.belongsTo(Habitacion, { foreignKey: 'idHabitacion', onDelete: 'CASCADE' });
Habitacion.hasMany(Pago, { foreignKey: 'idHabitacion' });

module.exports = Pago;