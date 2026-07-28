# Sistema Inteligente de Análisis de Cadmio

Plataforma empresarial para el análisis, monitoreo y control del cadmio en productos de cacao.

**Repositorio:** https://github.com/rframosyataco8-ux/sistema-analisis-cadmio

---

## Estado: MVP COMPLETO ✅

| Fase | Estado |
|------|--------|
| Fase 1 - Análisis y Arquitectura | ✅ |
| Fase 2 - Estructura de carpetas | ✅ |
| Fase 3 - Configuración inicial | ✅ |
| Fase 4 - Desarrollo módulo por módulo | ✅ |

---

## Funcionalidades

### Backend
- NestJS + Prisma + PostgreSQL
- JWT + Roles (ADMIN / ANALISTA)
- CRUD completo de muestras y usuarios
- Estadísticas
- Migración Excel
- **WebSockets (tiempo real)**

### App Escritorio
- Login profesional
- Dashboard con gráficos (tendencia, zonas, productos)
- **Actualización en tiempo real** cuando Lima ingresa Cadmio
- Filtros y búsqueda
- Exportar CSV
- Crear / validar muestras
- Gestión de usuarios

### App Móvil
- Login
- Lista de pendientes
- Ingreso de Cadmio + observaciones
- Pull-to-refresh
- UI profesional

---

## Cómo levantarlo

```bash
git clone https://github.com/rframosyataco8-ux/sistema-analisis-cadmio.git
cd sistema-analisis-cadmio

# Base de datos
docker compose up -d

# Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev

# (Opcional) Migrar Excel
# Coloca el archivo en backend/data/Torta_Trozada_Cadmio_traza_2026.xlsx
npm run migrate:excel

# Escritorio
cd ../desktop
npm install
npm run dev

# Móvil
cd ../mobile
flutter pub get
flutter run
```

---

## Credenciales

| Rol | Email | Contraseña |
|-----|-------|------------|
| ADMIN | admin@romex.pe | Admin123! |
| ANALISTA | lima@romex.pe | Analista123! |

---

## Flujo completo

1. **Chincha (escritorio)** crea una muestra → queda `PENDING_ANALYSIS`
2. **Lima (móvil)** ve la muestra e ingresa el valor de Cadmio
3. **Chincha** ve el cambio **en tiempo real** en el Dashboard
4. Admin puede filtrar, exportar CSV y **Validar** la muestra
