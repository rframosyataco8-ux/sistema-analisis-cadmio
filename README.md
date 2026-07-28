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
| Fase 4 - Desarrollo módulo por módulo | 🔄 En progreso (parte 1) |

---

## Lo que ya funciona (Fase 4 - parte 1)

### Backend
- Autenticación JWT + roles
- CRUD de usuarios (solo ADMIN)
- Creación de muestras (solo ADMIN)
- Listado de muestras + filtros por estado
- Actualización de Cadmio (ANALISTA / ADMIN)
- Validación de muestras (ADMIN)
- Estadísticas (promedio, máx, mín cadmio)
- Product Types y Zones

### App Escritorio
- Login
- Layout con menú lateral
- Dashboard con KPIs reales
- Módulo de Muestras (crear + listar + validar)
- Módulo de Usuarios (crear + desactivar)

### App Móvil
- Login
- Lista de muestras pendientes
- Ingreso de valor de Cadmio

---

## Cómo levantar el proyecto

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

---

## Credenciales iniciales

| Rol | Email | Contraseña |
|-----|-------|------------|
| ADMIN (Chincha) | admin@romex.pe | Admin123! |
| ANALISTA (Lima) | lima@romex.pe | Analista123! |

---

## Flujo de uso actual

1. Entra como **admin@romex.pe** en la app de escritorio.
2. Ve a **Muestras → + Nueva muestra** y crea un registro.
3. La muestra queda en estado `PENDING_ANALYSIS`.
4. En la app móvil entra como **lima@romex.pe**.
5. Verás la muestra pendiente → ingresa el valor de Cadmio.
6. Vuelve al escritorio: el valor ya aparece y puedes **Validar**.

---

## Próximos entregables (Fase 4 - continuación)

- Gráficos (Recharts) en el Dashboard
- Migración del Excel histórico
- Filtros avanzados y búsqueda
- Reportes PDF/Excel
- Tiempo real (WebSockets)
- Mejoras de UI móvil
