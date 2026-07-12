const express = require('express');
const router = express.Router();
const Habitacion = require('../models/Habitacion');

// DATOS DE PRUEBA: Simulamos 3 habitaciones en la casa de tus papás
const habitacionesDePrueba = [
  new Habitacion(1, "101", 500, "Ocupado"),
  new Habitacion(2, "102", 450, "Disponible"),
  new Habitacion(3, "201", 600, "Ocupado")
];

// ENDPOINT: GET /api/habitaciones (CUS02)
router.get('/', (req, res) => {
  // Cuando el celular pida las habitaciones, le enviamos esta lista
  res.json(habitacionesDePrueba);
});

module.exports = router;