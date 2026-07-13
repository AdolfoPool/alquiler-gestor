const express = require('express');
const router = express.Router();
const Inquilino = require('../models/Inquilino');
const Habitacion = require('../models/Habitacion');

// REGISTRAR INQUILINO Y ASIGNARLO A LA HABITACIÓN
router.post('/', async (req, res) => {
  const { dni, nombreCompleto, celular, idHabitacion, fechaIngreso, diaPago } = req.body;

  try {
    // 1. Buscamos o creamos el perfil único del Inquilino por su DNI
    const [inquilino] = await Inquilino.findOrCreate({
      where: { dni },
      defaults: { nombreCompleto, celular }
    });

    // Si el inquilino ya existía pero cambió de celular, lo actualizamos
    if (celular) {
      inquilino.celular = celular;
      await inquilino.save();
    }

    // 2. Buscamos la habitación y le asignamos este perfil junto con las fechas de pago
    const habitacion = await Habitacion.findByPk(idHabitacion);
    if (!habitacion) {
      return res.status(404).json({ mensaje: 'Habitación no encontrada' });
    }

    habitacion.estado = 'Ocupado';
    habitacion.InquilinoDni = inquilino.dni; // Vinculamos el perfil actual
    habitacion.fechaIngreso = fechaIngreso;   // Tu Plus: Fecha en que entró
    habitacion.diaPago = parseInt(diaPago);   // Tu Plus: Qué día del mes paga
    await habitacion.save();

    res.status(200).json({ mensaje: 'Inquilino asignado y cuarto ocupado', habitacion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar inquilino' });
  }
});

// DESALOJAR INQUILINO (Liberar habitación manteniendo el perfil vivo)
router.delete('/habitacion/:idHabitacion', async (req, res) => {
  try {
    const habitacion = await Habitacion.findByPk(req.params.idHabitacion);
    if (habitacion) {
      habitacion.estado = 'Disponible';
      habitacion.InquilinoDni = null; // Rompemos el vínculo actual (pero el perfil de Inquilino queda intacto en su tabla)
      habitacion.fechaIngreso = null;
      habitacion.diaPago = null;
      await habitacion.save();
    }
    res.json({ mensaje: 'Habitación liberada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al liberar habitación' });
  }
});

module.exports = router;