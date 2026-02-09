import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 200 },
    { duration: '30s', target: 200 },
    { duration: '10s', target: 0 },
  ],
};

export default function () {

  // ---------- 1️LOGIN ----------
  const loginUrl = 'http://localhost:3000/api/auth/login';

  const loginPayload = JSON.stringify({
    email: 'test@test.com',
    password: '123456',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const loginRes = http.post(loginUrl, loginPayload, params);

  check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'token recibido': (r) => r.json('token') !== undefined,
  });

  const token = loginRes.json('token');

  // Si el login falla, no continuamos
  if (!token) {
    return;
  }

  // ---------- 2️CREAR LIBRO ----------
  const libroUrl = 'http://localhost:3000/api/libros';

  const libroPayload = JSON.stringify({
    titulo: `Libro Completo Test ${__VU}`,
    autor: `Autor Completo ${__VU}`,
    cantidad: Math.floor(Math.random() * 15) + 1,
  });

  const libroParams = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  const libroRes = http.post(libroUrl, libroPayload, libroParams);

  check(libroRes, {
    'libro creado': (r) => r.status === 201 || r.status === 200,
  });

  // ---------- 3️LISTAR LIBROS ----------
  const getLibros = http.get(
    'http://localhost:3000/api/libros',
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  check(getLibros, {
    'listado libros OK': (r) => r.status === 200,
  });

  sleep(1);
}
