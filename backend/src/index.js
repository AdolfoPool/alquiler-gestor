const express = require('express');
const cors = require('cors');
const habitacionesRoutes = require('./routes/habitaciones');
const inquilinosRoutes = require('./routes/inquilinos');
const pagosRoutes = require('./routes/pagos'); // 1. Importamos la ruta de pagos

const app = express();
const PORT = process.env.PORT || 5000;

// Cambia el app.use(cors()) simple por esto para abrir el permiso total en desarrollo:
app.use(cors({
  origin: '*' // Permite que cualquier frontend (como tu Vite) se conecte
}));
app.use(express.json());

// Rutas
app.use('/api/habitaciones', habitacionesRoutes);
app.use('/api/inquilinos', inquilinosRoutes);
app.use('/api/pagos', require('./routes/pagos'));

app.get('/', (req, res) => {
  res.send('¡El servidor de AlquilerGestor está corriendo perfectamente! 🚀');
});

// ... Tus otras importaciones de express, cors, etc.
const sequelize = require('./config/db');
// Importamos los modelos para que Sequelize sepa que existen al sincronizar
const Habitacion = require('./models/Habitacion');
const Inquilino = require('./models/Inquilino');
const Pago = require('./models/Pago');

// ... Tus middlewares (cors, express.json) y rutas

// Reemplaza tu app.listen básico por esta sincronización:
sequelize.sync({ force: false }) // force: false evita que se borren tus datos cada vez que reinicias
  .then(() => {
    console.log('¡Base de datos SQLite sincronizada correctamente! 🗄️');
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
  });

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});