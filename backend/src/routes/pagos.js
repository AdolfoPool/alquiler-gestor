const express = require('express');
const router = express.Router();
const Pago = require('../models/Pago');
const Habitacion = require('../models/Habitacion');

// REGISTRAR UN NUEVO PAGO WITH TU PLUS
router.post('/', async (req, res) => {
  const { mesPagado, monto, idHabitacion, inquilinoNombre, inquilinoDni, notaInterna } = req.body;

  try {
    const impuestoSunat = monto * 0.05;

    const nuevoPago = await Pago.create({
      mesPagado,
      monto,
      impuestoSunat,
      idHabitacion,
      inquilinoNombre, // Inmortal en texto
      inquilinoDni,    // Enlazado al perfil histórico
      notaInterna      // Tu Plus: Bitácora oculta
    });

    res.status(201).json({ mensaje: 'Pago registrado', pago: nuevoPago });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar el pago' });
  }
});

// OBTENER TODOS LOS PAGOS (Para el historial global)
router.get('/', async (req, res) => {
  try {
    const pagos = await Pago.findAll({
      include: [{ model: Habitacion, attributes: ['numero'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(pagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error' });
  }
});

// OBTENER PAGOS DE UN CUARTO ESPECÍFICO
router.get('/:idHabitacion', async (req, res) => {
  try {
    const pagos = await Pago.findAll({
      where: { idHabitacion: req.params.idHabitacion },
      order: [['createdAt', 'DESC']]
    });
    res.json(pagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error' });
  }
});

module.exports = router;