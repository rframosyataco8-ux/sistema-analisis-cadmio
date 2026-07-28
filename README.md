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
| Fase 4 - Desarrollo módulo por módulo | ✅ Completada |

---

## Funcionalidades implementadas

### Backend
- Autenticación JWT + roles (ADMIN / ANALISTA)
- CRUD de usuarios y muestras
- Actualización de Cadmio
- Validación de muestras
- Estadísticas
- Migración de Excel histórico

### App Escritorio
- Login profesional
- **Dashboard con gráficos** (tendencia, comparación por zonas, distribución por producto)
- **Filtros y búsqueda** de muestras
- **Exportar a CSV**
- Crear / listar / validar muestras
- Gestión de usuarios

### App Móvil
- Login
- Lista de pendientes mejorada
- Formulario de Cadmio con observaciones
- Pull-to-refresh
- Mensajes de éxito / error claros

---

## Cómo levantar el proyecto

```bash
# 1. Base de datos
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev

# 3. (Opcional) Migrar Excel histórico
# Coloca el archivo en backend/data/Torta_Trozada_Cadmio_traza_2026.xlsx
npm run migrate:excel

# 4. App Escritorio
cd desktop
npm install
npm run dev

# 5. App Móvil
cd mobile
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

## Flujo de uso

1. Admin crea muestras (o se migran desde Excel).
2. Las muestras quedan `PENDING_ANALYSIS`.
3. Analista (Lima) ingresa el Cadmio desde la app móvil.
4. Admin ve el resultado en el Dashboard, puede filtrar, exportar y validar.
