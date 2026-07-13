const express = require('express');
const router = express.Router();
const Pago = require('../models/Pago');
const Habitacion = require('../models/Habitacion');

// 1. REGISTRAR UN NUEVO PAGO (Guardando el nombre del inquilino)
router.post('/', async (req, res) => {
  const { mesPagado, monto, idHabitacion, inquilinoNombre } = req.body;

  try {
    const impuestoSunat = monto * 0.05;

    const nuevoPago = await Pago.create({
      mesPagado,
      monto,
      impuestoSunat,
      idHabitacion,
      inquilinoNombre // Se queda grabado para siempre
    });

    res.status(201).json({ mensaje: 'Pago registrado', pago: nuevoPago });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al procesar el pago' });
  }
});

// 2. NUEVO: OBTENER TODOS LOS PAGOS DE TODAS LAS HABITACIONES (Para el Historial Global)
router.get('/', async (req, res) => {
  try {
    const todosLosPagos = await Pago.findAll({
      include: [{ model: Habitacion, attributes: ['numero'] }], // Para saber qué número de cuarto fue
      order: [['createdAt', 'DESC']]
    });
    res.json(todosLosPagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el historial global' });
  }
});

// 3. OBTENER PAGOS DE UNA HABITACIÓN ESPECÍFICA
router.get('/:idHabitacion', async (req, res) => {
  try {
    const pagos = await Pago.findAll({
      where: { idHabitacion: req.params.idHabitacion },
      order: [['createdAt', 'DESC']]
    });
    res.json(pagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener historial' });
  }
});

module.exports = router;