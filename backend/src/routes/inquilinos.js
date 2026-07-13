const express = require('express');
const router = express.Router();
const Inquilino = require('../models/Inquilino');
const Habitacion = require('../models/Habitacion');

// REGISTRAR UN NUEVO INQUILINO Y OCUPAR LA HABITACIÓN
router.post('/', async (req, res) => {
  const { dni, nombreCompleto, celular, idHabitacion } = req.body;

  try {
    // 1. Buscamos si la habitación existe y está disponible
    const habitacion = await Habitacion.findByPk(idHabitacion);
    if (!habitacion) {
      return res.status(404).json({ mensaje: 'La habitación no existe' });
    }

    if (habitacion.estado === 'Ocupado') {
      return res.status(400).json({ mensaje: 'Esta habitación ya está ocupada' });
    }

    // 2. Creamos el registro del inquilino en SQLite
    const nuevoInquilino = await Inquilino.create({
      dni,
      nombreCompleto,
      celular,
      idHabitacion
    });

    // 3. ¡LA CLAVE! Actualizamos el estado de la habitación a 'Ocupado'
    habitacion.estado = 'Ocupado';
    await habitacion.save();

    res.status(201).json({
      mensaje: 'Inquilino registrado con éxito y habitación ocupada',
      inquilino: nuevoInquilino
    });

  } catch (error) {
    console.error('Error al registrar inquilino:', error);
    res.status(500).json({ mensaje: 'Error interno en el servidor' });
  }
});

// RUTA PARA RETIRAR UN INQUILINO Y LIBERAR LA HABITACIÓN
router.delete('/habitacion/:idHabitacion', async (req, res) => {
  const { idHabitacion } = req.params;
  try {
    // 1. Borramos al inquilino asociado a esa habitación
    await Inquilino.destroy({ where: { idHabitacion } });

    // 2. Buscamos la habitación para cambiarle el estado a Disponible
    const habitacion = await Habitacion.findByPk(idHabitacion);
    if (habitacion) {
      habitacion.estado = 'Disponible';
      await habitacion.save();
    }

    res.json({ mensaje: 'Inquilino retirado y habitación liberada con éxito' });
  } catch (error) {
    console.error('Error al retirar inquilino:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;