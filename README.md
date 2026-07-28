# Sistema Inteligente de Análisis de Cadmio

Plataforma empresarial para el análisis, monitoreo y control del cadmio en productos de cacao.

**Repositorio:** https://github.com/rframosyataco8-ux/sistema-analisis-cadmio

---

## Estado del proyecto

| Fase | Estado |
|------|--------|
| Fase 1 - Análisis y Arquitectura | ✅ Completada |
| Fase 2 - Estructura de carpetas | ✅ Completada |
| Fase 3 - Configuración inicial | ✅ Completada |
| Fase 4 - Desarrollo módulo por módulo | 🔄 Siguiente |

---

## Componentes

- **Backend** (`/backend`) — NestJS + Prisma + PostgreSQL + JWT
- **App Escritorio** (`/desktop`) — Electron + React + TypeScript + Tailwind
- **App Móvil** (`/mobile`) — Flutter (Android)

---

## Cómo levantar el proyecto (Fase 3)

### 1. Base de datos

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

Credenciales iniciales (seed):
- **Admin (Chincha):** `admin@romex.pe` / `Admin123!`
- **Analista (Lima):** `lima@romex.pe` / `Analista123!`

### 3. App Escritorio

```bash
cd desktop
npm install
npm run dev
```

### 4. App Móvil

```bash
cd mobile
flutter pub get
flutter run
```

> Nota: En emulador Android usa `10.0.2.2:3000` como host del backend.

---

## Próxima fase

**Fase 4** — Desarrollo completo módulo por módulo (CRUD de muestras, gráficos, gestión de usuarios, migración del Excel, reportes, etc.).
