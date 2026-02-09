const request = require('supertest');
const express = require('express');

// Simulamos la app sin base de datos
const app = express();
app.use(express.json());

// Importamos las rutas - RUTA CORREGIDA
app.use('/api/auth', require('./src/routes/auth.routes'));

describe('🔐 API Auth Routes', () => {
  describe('POST /api/auth/login', () => {
    test('debería hacer login exitoso con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: '123456'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('debería fallar con credenciales incompletas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com'
          // password faltante
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Credenciales inválidas');
    });
  });

  describe('POST /api/auth/register', () => {
    test('debería registrar usuario exitosamente', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test User',
          email: 'test@test.com',
          password: '123456'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toBe('Usuario registrado correctamente (simulado)');
    });

    test('debería fallar con campos faltantes', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test User'
          // email y password faltantes
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Todos los campos son obligatorios');
    });
  });
});