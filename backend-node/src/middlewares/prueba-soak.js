import http from 'k6/http';
import { check, sleep } from 'k6';
//SOEAK: Evalúa si el sistema se mantiene estable durante mucho tiempo con carga constante, 
// sin caerse ni degradarse.
export let options = {
  stages: [
    { duration: '30s', target: 20 },   // subida gradual
    { duration: '30s', target: 20 },    // carga sostenida (SOAK)
    { duration: '30s', target: 0 },    // bajada
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

  // POST libro
  const libroRes = http.post(
    'http://localhost:3000/api/libros',
    JSON.stringify({
      titulo: `Libro Soak Test ${__VU}`,
      autor: `Autor Soak ${__VU}`,
      cantidad: Math.floor(Math.random() * 8) + 1,
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

  // GET libros
  const getRes = http.get(
    'http://localhost:3000/api/libros',
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  check(getRes, {
    'listado OK': (r) => r.status === 200,
  });

  sleep(1);
}
