const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

// IMPORTACIÓN DE MODELOS
const Habitacion = require('./models/Habitacion');
const Inquilino = require('./models/Inquilino');
const Pago = require('./models/Pago');
const Gasto = require('./models/Gasto');

// IMPORTACIÓN DE RUTAS
const habitacionesRoutes = require('./routes/habitaciones');
const inquilinosRoutes = require('./routes/inquilinos');
const pagosRoutes = require('./routes/pagos');
const gastosRoutes = require('./routes/gastos'); // Nueva ruta de gastos

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARES
app.use(cors({ origin: '*' })); // Permiso total para desarrollo con Vite
app.use(express.json());

// ENRUTAMIENTO (Asignación de endpoints limpios)
app.use('/api/habitaciones', habitacionesRoutes);
app.use('/api/inquilinos', inquilinosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/gastos', gastosRoutes); // Endpoints para registrar y ver gastos

// RUTA BASE DE PRUEBA
app.get('/', (req, res) => {
  res.send('¡El servidor de AlquilerGestor está corriendo perfectamente! 🚀');
});

// DEFINICIÓN DE RELACIONES (ASOCIACIONES)
// 1. Un inquilino puede ocupar una habitación actualmente
Inquilino.hasOne(Habitacion, { foreignKey: 'InquilinoDni', constraints: false });
Habitacion.belongsTo(Inquilino, { foreignKey: 'InquilinoDni', constraints: false });

// 2. Una habitación tiene muchos pagos históricos
Habitacion.hasMany(Pago, { foreignKey: 'idHabitacion' });
Pago.belongsTo(Habitacion, { foreignKey: 'idHabitacion' });

// SINCRONIZACIÓN DE LA BASE DE DATOS
// Nota: Una vez que corra con éxito por primera vez, puedes cambiar { force: true } a { alter: true } o quitarlo
sequelize.sync({ force: true }) 
  .then(() => {
    console.log('¡Base de datos reestructurada con perfiles inmortales y notas internas! 🚀');
    
    // El servidor solo empieza a escuchar cuando la BD está lista y conectada
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch(err => console.error('Error al sincronizar BD:', err));