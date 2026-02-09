module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12
  },
  ignorePatterns: [
    'src/middlewares/prueba-*.js',  // Archivos K6 (usan ES6 modules)
    'node_modules/',
    'coverage/'
  ],
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'warn',
    'quotes': ['error', 'single'],
    'semi': ['error', 'always']
  }
};