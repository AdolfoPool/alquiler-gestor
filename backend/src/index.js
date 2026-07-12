const express = require('express');
const cors = require('cors');
const habitacionesRoutes = require('./routes/habitaciones'); // 1. Importamos la ruta

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// 2. Conectamos la ruta a la URL /api/habitaciones
app.use('/api/habitaciones', habitacionesRoutes);

// Ruta base de prueba
app.get('/', (req, res) => {
  res.send('¡El servidor de AlquilerGestor está corriendo perfectamente! 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});