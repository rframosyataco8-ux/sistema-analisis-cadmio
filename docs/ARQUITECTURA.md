# Arquitectura del Sistema - Fase 1 (Aprobada)

## Resumen

Sistema compuesto por:

1. **Aplicación de Escritorio** (Windows) — Panel de control completo
2. **Aplicación Móvil** (Android) — Solo ingreso de Cadmio
3. **Backend** seguro + Base de datos PostgreSQL

## Flujo principal

1. Chincha crea/registra la muestra en la app de escritorio (todos los datos excepto Cadmio).
2. La muestra queda en estado `PENDING_ANALYSIS`.
3. Lima abre la app móvil, ve solo las pendientes, ingresa el valor de Cadmio y marca como `ANALYZED`.
4. Chincha ve en tiempo real la actualización en el Dashboard y puede validar.

## Roles

- `ADMIN`: Acceso total + gestión de usuarios
- `ANALISTA`: Solo puede completar Cadmio en muestras pendientes

## Stack

- Backend: NestJS + Prisma + PostgreSQL + Socket.io
- Desktop: Electron + React + TypeScript + Tailwind + Recharts
- Mobile: Flutter

## Seguridad

- JWT + Refresh Token
- RBAC
- Validación estricta de entrada
- Auditoría de acciones
- Contraseñas hasheadas con bcrypt
