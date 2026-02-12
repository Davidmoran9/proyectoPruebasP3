const express = require('express');
const cors = require('cors');
console.log('APP INICIADA');

// IMPORTAR LA CONEXIÓN A MONGO
require('./database');

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// Middleware para ver las peticiones
app.use((req, res, next) => {
  console.log(` ${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
  next();
});

// rutas
app.use('/api/libros', require('./routes/libros.routes'));
app.use('/api/auth', require('./routes/auth.routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor backend corriendo en puerto', PORT);
});
