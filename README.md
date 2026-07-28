# Sistema Inteligente de Análisis de Cadmio

Plataforma empresarial para el análisis, monitoreo y control del cadmio en productos de cacao.

## Componentes

- **Backend** (`/backend`) — NestJS + PostgreSQL + Prisma + Socket.io
- **App Escritorio** (`/desktop`) — Electron + React + TypeScript + Tailwind + Recharts
- **App Móvil** (`/mobile`) — Flutter (Android .apk)

## Arquitectura

- Autenticación JWT + Refresh Token
- Roles: ADMIN (Chincha) y ANALISTA (Lima)
- Sincronización en tiempo real
- Gestión de usuarios desde la aplicación de escritorio
- Migración de histórico Excel

## Requisitos

- Node.js 20+
- Docker & Docker Compose
- Flutter 3.22+
- PostgreSQL 16 (incluido en Docker)

## Inicio rápido (próximas fases)

```bash
git clone https://github.com/rframosyataco8-ux/sistema-analisis-cadmio.git
cd sistema-analisis-cadmio
```

La configuración e instalación completa se entregará en la **Fase 3**.

---
**Estado actual:** Fase 2 — Estructura de carpetas completada.
