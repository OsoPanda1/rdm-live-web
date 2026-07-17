# TAMV MD-X4: Knowledge Cells Architecture

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)

Una arquitectura de **microservicios hiperspecializados** para renderización 3D/4D, integración cuántica multisensorial, y orquestación IA inmersiva.

## 🎯 Características Principales

- **Renderización 3D/4D**: Cubos holográficos y hipercubos con proyecciones interactivas
- **Integración Cuántica**: Canales multisensoriales con IA adaptativa
- **Microservicios Modulares**: Células de conocimiento independientes, escalables y versionables
- **Orquestación IA**: Especialización y composición dinámica de servicios
- **Observabilidad**: Prometheus + Grafana + logging estructurado
- **Production-Ready**: Docker Compose, health checks, graceful shutdown

## 📦 Stack Tecnológico

- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js
- **Testing**: Vitest
- **Linting**: ESLint + Prettier

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Compilar TypeScript
npm run build

# Ejecutar en desarrollo
npm run dev
```

El sistema estará disponible en http://localhost:3000

## 📚 Estructura del Proyecto

```
.
├── src/
│   ├── cells/                    # Células de conocimiento
│   │   ├── render-3d-holocube/
│   │   ├── render-4d-hypercube/
│   ├── types/                    # Definiciones TypeScript
│   ├── utils/                    # Utilitarios
│   ├── repository/               # Gestión de células
│   ├── server/                   # Servidor Express
│   └── index.ts                  # Entry point
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 🔗 Endpoints API

### Gestión de Células

```bash
GET /api/cells                           # Listar todas
GET /api/cells/:cellId                   # Detalles de célula
GET /api/cells/:cellId/dependencies      # Gráfico de dependencias
GET /api/cells/type/:type                # Células por tipo
```

### Renderización

```bash
POST /api/render/3d/holocube             # Render 3D
POST /api/render/4d/hypercube            # Render 4D
```

### Metadatos

```bash
GET /health                              # Health check
GET /api/repo/metadata                   # Metadatos del repo
GET /api/repo/export                     # Exportar JSON completo
```

## 📊 Monitoreo

Los logs se almacenan en `./logs/` con formato JSON.

```bash
tail -f logs/tamv-*.log | jq .
```

## 🔧 Scripts

```bash
npm run dev              # Desarrollo
npm run build            # Compilar
npm start                # Producción
npm test                 # Tests
npm run lint             # Linting
npm run format           # Formatting
```

## 📄 Licencia

MIT - © 2024–2026 TAMV Ecosystem · OsoPanda1
