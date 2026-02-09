import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '20s', target: 20 },
    { duration: '10s', target: 0 },
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

  check(loginRes, { 'login OK': r => r.status === 200 });

  const token = loginRes.json('token');
  if (!token) return;

  const headersAuth = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  // POST → crear libro
  const crearLibro = http.post(
    'http://localhost:3000/api/libros',
    JSON.stringify({
      titulo: `Libro Test GET-POST ${__VU}`,
      autor: `Autor Test ${__VU}`,
      cantidad: Math.floor(Math.random() * 10) + 1,
    }),
    headersAuth
  );

  // GET → listar libros
  const listarLibros = http.get(
    'http://localhost:3000/api/libros',
    headersAuth
  );

  check(crearLibro, { 'libro creado': r => r.status === 201 });
  check(listarLibros, { 'listado OK': r => r.status === 200 });

  sleep(1);
}
