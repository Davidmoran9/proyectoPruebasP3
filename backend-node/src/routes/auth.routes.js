const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const router = express.Router();
const SECRET = 'biblioteca_secret'; // luego puede ir en .env

// REGISTRO
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  // SIMULACIÓN (sin MongoDB)
  if (nombre && email && password) {
    res.json({ msg: 'Usuario registrado correctamente (simulado)' });
  } else {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // SIMULACIÓN de autenticación (sin MongoDB)
  if (email && password) {
    const token = jwt.sign(
      { id: 'usuario-simulado' },
      SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } else {
    return res.status(400).json({ msg: 'Credenciales inválidas' });
  }
});

module.exports = router;
