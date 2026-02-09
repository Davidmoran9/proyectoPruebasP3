import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 300 }, // aumento gradual
        { duration: '30s', target: 300 },// carga sostenida
        { duration: '10s', target: 0 }
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],// el 95% de las solicitudes deben responder en menos de 500ms
        http_req_failed: ['rate<0.01']// menos del 1% de las solicitudes deben fallar
    }
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

    // GET libros con token
    const res = http.get('http://localhost:3000/api/libros', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    check(res, {
        'status es 200': (r) => r.status === 200,// Verifica que el estado de la respuesta sea 200
        'respuesta en < 500ms': (r) => r.timings.duration < 500// Verifica que el tiempo de respuesta sea menor a 500ms
    });

    sleep(1);
}
