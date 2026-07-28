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
| Fase 4 - Desarrollo módulo por módulo | 🔄 En progreso |

---

## Lo que ya funciona

### Backend
- Autenticación JWT + roles (ADMIN / ANALISTA)
- CRUD de usuarios
- Creación, listado y validación de muestras
- Actualización de Cadmio desde móvil
- Estadísticas (promedio, máx, mín)
- **Migración del Excel histórico** ← nuevo

### App Escritorio
- Login + Layout profesional
- Dashboard con KPIs
- Módulo de Muestras (crear + listar + validar)
- Módulo de Usuarios

### App Móvil
- Login
- Lista de pendientes + ingreso de Cadmio

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

### 3. Migrar el Excel histórico (importante)

1. Copia tu archivo Excel a la carpeta:
   ```
   backend/data/Torta_Trozada_Cadmio_traza_2026.xlsx
   ```
   (el nombre debe ser exactamente ese)

2. Ejecuta la migración:
   ```bash
   cd backend
   npm run migrate:excel
   ```

3. Verifica los datos:
   ```bash
   npx prisma studio
   ```

### 4. App Escritorio
```bash
cd desktop
npm install
npm run dev
```

### 5. App Móvil
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

## Flujo de uso

1. Admin crea muestras o se migran desde el Excel.
2. Las muestras quedan en estado `PENDING_ANALYSIS`.
3. Analista (Lima) abre la app móvil e ingresa el valor de Cadmio.
4. Admin ve el resultado en el Dashboard y puede **Validar**.

---

## Próximos bloques de la Fase 4

- Gráficos del Dashboard (Recharts)
- Filtros y búsqueda avanzada
- Reportes PDF / Excel
- Tiempo real con WebSockets
- Mejoras de UI móvil
