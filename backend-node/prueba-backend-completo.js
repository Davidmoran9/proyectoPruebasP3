import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 50 },
    { duration: '30s', target: 50 },
    { duration: '10s', target: 0 },
  ],
};

export default function () {
  // LOGIN para obtener token
  const loginRes = http.post(
    'http://localhost:3000/api/auth/login',
    JSON.stringify({
      email: 'test@test.com',
      password: '123456'
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, {
    'login OK': (r) => r.status === 200,
  });

  const token = loginRes.json('token');
  if (!token) return;

  // CREAR LIBRO
  const libroPayload = JSON.stringify({
    titulo: `Libro del usuario ${__VU} - iteración ${__ITER}`,
    autor: `Autor ${__VU}`,
    cantidad: Math.floor(Math.random() * 10) + 1
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  };

  const res = http.post('http://localhost:3000/api/libros', libroPayload, params);

  check(res, {
    'libro creado': (r) => r.status === 201,
  });

  sleep(1);
}
