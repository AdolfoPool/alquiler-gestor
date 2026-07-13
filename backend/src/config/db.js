const { Sequelize } = require('sequelize');
const path = require('path');

// Configuramos Sequelize para usar SQLite y guardar el archivo en la raíz del backend
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false // Evita llenar la terminal de logs de SQL, manteniéndola limpia
});

module.exports = sequelize;