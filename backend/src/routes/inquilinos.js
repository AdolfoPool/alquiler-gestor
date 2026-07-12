const express = require('express');
const router = express.Router();
const Inquilino = require('../models/Inquilino');

// Arreglo temporal para simular nuestra base de datos de inquilinos
const listaInquilinos = [];

// ENDPOINT: POST /api/inquilinos (CUS01)
router.post('/', (req, res) => {
  // Extraemos los datos que envían tus papás desde el formulario del celular
  const { dni, nombreCompleto, celular } = req.body;

  // Validación básica de ingeniería (Contexto Perú: DNI debe tener 8 dígitos)
  if (!dni || dni.length !== 8) {
    return res.status(400).json({ 
      error: "El DNI es obligatorio y debe tener exactamente 8 dígitos." 
    });
  }

  // Creamos la instancia usando nuestra clase del Modelo
  const nuevoInquilino = new Inquilino(
    listaInquilinos.length + 1, // ID autoincremental simulado
    dni,
    nombreCompleto,
    celular
  );

  // "Guardamos" en nuestro arreglo temporal
  listaInquilinos.push(nuevoInquilino);

  // Respondemos al celular que todo salió bien y le devolvemos el objeto creado
  res.status(201).json({
    mensaje: "¡Inquilino registrado con éxito! 🎉",
    inquilino: nuevoInquilino
  });
});

module.exports = router;