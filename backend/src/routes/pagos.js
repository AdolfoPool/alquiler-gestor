const express = require('express');
const router = express.Router();
const Pago = require('../models/Pago'); // Importamos nuestro modelo con la regla de negocio

const listaPagos = [];

// ENDPOINT: POST /api/pagos (CUS03)
router.post('/', (req, res) => {
  const { idAlquiler, periodo, montoRecibido } = req.body;

  // Validación básica
  if (!idAlquiler || !periodo || !montoRecibido) {
    return res.status(400).json({ 
      error: "Todos los campos (idAlquiler, periodo, montoRecibido) son obligatorios." 
    });
  }

  // Instanciamos la clase Pago. 
  // Al hacer esto, el constructor ejecuta automáticamente el cálculo del 5% de SUNAT.
  const nuevoPago = new Pago(
    listaPagos.length + 1, // ID simulado
    idAlquiler,
    periodo,
    montoRecibido
  );

  listaPagos.push(nuevoPago);

  // Devolvemos el resumen formateado usando el método de nuestra clase
  res.status(201).json({
    mensaje: "¡Pago registrado y procesado con éxito! 💰",
    pago: nuevoPago.obtenerResumenPago()
  });
});

module.exports = router;