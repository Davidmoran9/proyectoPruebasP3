# 📚 Sistema de Biblioteca - Angular + Node.js

## 🚀 CI/CD Pipeline Completo

[![CI/CD Pipeline](https://github.com/tu-usuario/biblioteca-proyecto/actions/workflows/ci.yml/badge.svg)](https://github.com/tu-usuario/biblioteca-proyecto/actions)

### 🏗️ Arquitectura del Proyecto

```
BIBLIOTECA ANGULAR/
├── 🔧 backend-node/           # API REST con Node.js & Express
│   ├── src/
│   │   ├── routes/           # Rutas de libros y autenticación  
│   │   ├── models/           # Modelos de datos
│   │   └── middlewares/      # Tests de performance K6
│   ├── *.test.js            # Tests unitarios con Jest
│   └── package.json         # Scripts y dependencias
├── 🎨 frontend-angular/       # Aplicación Angular
│   └── frontend-angular/
│       ├── src/app/         # Componentes Angular
│       └── package.json     # Scripts Angular
├── .github/workflows/        # GitHub Actions
└── package.json             # Scripts del workspace
```

## ⚡ Quick Start

### 📦 Instalación Completa
```bash
# Instalar todas las dependencias
npm run install:all

# O manualmente:
npm run install:backend
npm run install:frontend
```

### 🚀 Desarrollo Local
```bash
# Backend (Puerto 3000)
npm run start:backend

# Frontend (Puerto 4200) - en otra terminal
npm run start:frontend
```

## 🧪 Testing & Quality Assurance

### 🔍 Tests Unitarios
```bash
# Backend tests con Jest
cd backend-node
npm test
npm run test:coverage    # Con reporte de cobertura
npm run test:watch       # Modo watch
```

### 🧹 Code Quality
```bash
# Linting del código
cd backend-node  
npm run lint
npm run lint:fix         # Auto-fix problemas
```

### ⚡ Performance Testing
```bash
# Asegurate de que el backend esté corriendo
npm run start:backend

# En otra terminal, tests de performance
cd backend-node
npm run performance      # Test de carga básico
npm run performance:soak # Test de resistencia
npm run performance:spike # Test de picos
npm run performance:all  # Todos los tests
```

## 🤖 CI/CD Pipeline

### 📋 Workflows Automáticos

**🔧 Backend Tests & Lint**
- ✅ ESLint code quality
- ✅ Jest unit tests  
- ✅ Coverage reports

**🎨 Frontend Build & Tests**
- ✅ Angular build
- ✅ Unit tests (Jasmine/Karma)

**⚡ Performance Tests** *(solo en push a main)*
- ✅ K6 load testing
- ✅ API response validation

### 🔄 Triggers
- **Push** a `main` o `develop` → Pipeline completo
- **Pull Request** a `main` → Tests y build

## 📊 Scripts Disponibles

### 🌍 Workspace (desde raíz)
```bash
npm run install:all      # Instalar todo
npm run test:all         # Tests completos
npm run ci               # Pipeline completo local
```

### 🔧 Backend (desde backend-node/)
```bash
npm start                # Iniciar servidor
npm test                 # Tests unitarios
npm run lint             # Code linting
npm run performance:all  # Performance tests
```

### 🎨 Frontend (desde frontend-angular/frontend-angular/)
```bash
npm start                # Dev server
npm run build            # Build producción
npm test                 # Angular tests
```

## 🛠️ Tecnologías

**Backend:**
- Node.js + Express
- JWT Authentication  
- Jest + Supertest
- ESLint
- K6 Performance Testing

**Frontend:**  
- Angular 20
- TypeScript
- Jasmine + Karma

**DevOps:**
- GitHub Actions
- Automated Testing
- Code Quality Checks

## 📈 Métricas de Performance

Los tests de K6 validan:
- ⚡ **Response Time**: < 500ms
- 📊 **Success Rate**: > 99%
- 👥 **Concurrent Users**: Hasta 300
- 🔄 **Soak Testing**: 5 minutos de carga sostenida

---

**🎯 ¿Listo para GitHub?** Solo sube el código y el CI/CD funcionará automáticamente! 🚀