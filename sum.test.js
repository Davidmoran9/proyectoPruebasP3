const sum = require('./sum');

// Pruebas para la función suma
describe('Función suma', () => {
    test('adds 1 + 2 debe ser 3', () => {
        expect(sum(1, 2)).toBe(3);
    });

    test('suma de números negativos: -5 + 3 debe ser -2', () => {
        expect(sum(-5, 3)).toBe(-2);
    });

    test('suma con cero: 10 + 0 debe ser 10', () => {
        expect(sum(10, 0)).toBe(10);
    });

    test('suma de números decimales: 2.5 + 3.7 debe ser 6.2', () => {
        expect(sum(2.5, 3.7)).toBeCloseTo(6.2);
    });

    test('suma de números grandes debe funcionar', () => {
        expect(sum(1000000, 2000000)).toBe(3000000);
    });
});