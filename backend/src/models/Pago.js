const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Pago = sequelize.define('Pago', {
  mesPagado: {
    type: DataTypes.STRING, // Ej: "Julio 2026"
    allowNull: false
  },
  monto: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  impuestoSunat: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  inquilinoNombre: {
    type: DataTypes.STRING,
    allowNull: false // Guarda el nombre del perfil textualmente en el recibo
  },
  inquilinoDni: {
    type: DataTypes.STRING,
    allowNull: false // Guarda el DNI para enlazar al perfil histórico
  },
  notaInterna: {
    type: DataTypes.TEXT,
    allowNull: true // Tu Plus: Bitácora secreta para tus papás
  }
});

module.exports = Pago;