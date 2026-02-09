import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '5s', target: 0 },    // inicio
    { duration: '5s', target: 150 },  // pico súbito
    { duration: '10s', target: 150 }, // mantener pico
    { duration: '5s', target: 0 },    // caída rápida
  ],
};

export default function () {

  // LOGIN
  const loginRes = http.post(
    'http://localhost:3000/api/auth/login',
    JSON.stringify({
      email: 'test@test.com',
      password: '123456',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, {
    'login OK': (r) => r.status === 200,
  });

  const token = loginRes.json('token');
  if (!token) return;

  // CREAR LIBRO
  const libroRes = http.post(
    'http://localhost:3000/api/libros',
    JSON.stringify({
      titulo: `Libro Spike Test ${__VU}`,
      autor: `Autor Spike ${__VU}`,
      cantidad: Math.floor(Math.random() * 5) + 1,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  check(libroRes, {
    'libro creado': (r) => r.status === 200 || r.status === 201,
  });

  sleep(1);
}
