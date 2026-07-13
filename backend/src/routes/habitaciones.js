const express = require('express');
const router = express.Router();
const Habitacion = require('../models/Habitacion');
const Inquilino = require('../models/Inquilino'); // Importamos Inquilino

// OBTENER TODAS LAS HABITACIONES CON SUS INQUILINOS INCLUIDOS
router.get('/', async (req, res) => {
  try {
    const habitaciones = await Habitacion.findAll({
      include: [{ model: Inquilino }], // Mágicamente Sequelize adjunta el inquilino si existe
      order: [
        ['piso', 'ASC'],
        ['numero', 'ASC']
      ]
    });
    
    // Si la base de datos está vacía, creamos los 7 cuartos reales
    if (habitaciones.length === 0) {
      const cuartosReales = await Habitacion.bulkCreate([
        { numero: '101', precioMensual: 500, piso: 1, estado: 'Disponible' },
        { numero: '102', precioMensual: 450, piso: 1, estado: 'Disponible' },
        { numero: '201', precioMensual: 550, piso: 2, estado: 'Disponible' },
        { numero: '202', precioMensual: 550, piso: 2, estado: 'Disponible' },
        { numero: '203', precioMensual: 600, piso: 2, estado: 'Disponible' },
        { numero: '204', precioMensual: 500, piso: 2, estado: 'Disponible' },
        { numero: '205', precioMensual: 450, piso: 2, estado: 'Disponible' }
      ]);
      return res.json(cuartosReales);
    }

    return res.json(habitaciones);
  } catch (error) {
    console.error('--- ERROR EN RUTAS HABITACIONES ---', error);
    return res.status(500).json([]);
  }
});

module.exports = router;