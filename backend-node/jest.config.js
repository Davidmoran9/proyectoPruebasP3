module.exports = {
  // Entorno de pruebas
  testEnvironment: 'node',
  
  // Cobertura de código
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Patrones de archivos a testear
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  
  // Configuración additional para CI
  verbose: true,
  forceExit: true,
  clearMocks: true
};