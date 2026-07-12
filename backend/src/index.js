const express = require('express');
const cors = require('cors');
const habitacionesRoutes = require('./routes/habitaciones');
const inquilinosRoutes = require('./routes/inquilinos');
const pagosRoutes = require('./routes/pagos'); // 1. Importamos la ruta de pagos

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/habitaciones', habitacionesRoutes);
app.use('/api/inquilinos', inquilinosRoutes);
app.use('/api/pagos', pagosRoutes); // 2. Conectamos la ruta de pagos

app.get('/', (req, res) => {
  res.send('¡El servidor de AlquilerGestor está corriendo perfectamente! 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});