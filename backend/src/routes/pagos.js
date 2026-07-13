const express = require('express');
const router = express.Router();
const Pago = require('../models/Pago');

// 1. REGISTRAR UN NUEVO PAGO Y CALCULAR EL 5% DE LA SUNAT
router.post('/', async (req, res) => {
  const { mesPagado, monto, idHabitacion } = req.body;

  try {
    // Cálculo automático del impuesto (5% del monto de alquiler)
    const impuestoSunat = monto * 0.05;

    const nuevoPago = await Pago.create({
      mesPagado,
      monto,
      impuestoSunat,
      idHabitacion
    });

    res.status(201).json({
      mensaje: 'Pago registrado con éxito',
      pago: nuevoPago
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ mensaje: 'Error al procesar el pago' });
  }
});

// 2. OBTENER EL HISTORIAL DE PAGOS DE UNA HABITACIÓN
router.get('/:idHabitacion', async (req, res) => {
  try {
    const pagos = await Pago.findAll({
      where: { idHabitacion: req.params.idHabitacion },
      order: [['createdAt', 'DESC']] // El pago más reciente primero
    });
    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ mensaje: 'Error al obtener historial' });
  }
});

module.exports = router;