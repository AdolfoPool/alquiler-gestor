const express = require('express');
const router = express.Router();
const Gasto = require('../models/Gasto');

// 1. REGISTRAR UN NUEVO GASTO (Mantenimiento, recibos de agua/luz de áreas comunes, etc.)
router.post('/', async (req, res) => {
  const { descripcion, monto, fecha } = req.body;

  try {
    const nuevoGasto = await Gasto.create({
      descripcion,
      monto: parseFloat(monto),
      fecha: fecha || undefined // Si no mandan fecha, Sequelize pone la de hoy por defecto
    });

    res.status(201).json({ mensaje: 'Gasto registrado con éxito', gasto: nuevoGasto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar el gasto' });
  }
});

// 2. OBTENER TODOS LOS GASTOS
router.get('/', async (req, res) => {
  try {
    const gastos = await Gasto.findAll({
      order: [['fecha', 'DESC']]
    });
    res.json(gastos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la lista de gastos' });
  }
});

module.exports = router;