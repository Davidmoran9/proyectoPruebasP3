const request = require('supertest');
const express = require('express');

// Simulamos la app sin base de datos
const app = express();
app.use(express.json());

// Importamos las rutas
app.use('/api/auth', require('./src/routes/auth.routes'));

describe('API Auth Routes', () => {
  describe('POST /api/auth/login', () => {
    test('debería hacer login exitoso con credenciales válidas', async () => {
      // ARRANGE - Preparar datos de entrada
      const credenciales = {
        email: 'test@test.com',
        password: '123456'
      };

      // ACT - Ejecutar la acción a probar
      const res = await request(app)
        .post('/api/auth/login')
        .send(credenciales);
      
      // ASSERT - Verificar resultados esperados
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('debería fallar con credenciales incompletas', async () => {
      // ARRANGE - Preparar datos incompletos (sin password)
      const credencialesIncompletas = {
        email: 'test@test.com'
      };

      // ACT - Intentar login con datos incompletos
      const res = await request(app)
        .post('/api/auth/login')
        .send(credencialesIncompletas);
      
      // ASSERT - Verificar que retorna error 400
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Credenciales inválidas');
    });
  });

  describe('POST /api/auth/register', () => {
    test('debería registrar usuario exitosamente', async () => {
      // ARRANGE - Preparar datos del nuevo usuario
      const nuevoUsuario = {
        nombre: 'Test User',
        email: 'test@test.com',
        password: '123456'
      };

      // ACT - Ejecutar registro
      const res = await request(app)
        .post('/api/auth/register')
        .send(nuevoUsuario);
      
      // ASSERT - Verificar registro exitoso
      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toBe('Usuario registrado correctamente (simulado)');
    });

    test('debería fallar con campos faltantes', async () => {
      // ARRANGE - Preparar datos incompletos (solo nombre)
      const datosIncompletos = {
        nombre: 'Test User'
      };

      // ACT - Intentar registro con datos incompletos
      const res = await request(app)
        .post('/api/auth/register')
        .send(datosIncompletos);
      
      // ASSERT - Verificar que retorna error 400
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Todos los campos son obligatorios');
    });
  });
});