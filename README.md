# Sistema Inteligente de Análisis de Cadmio

Sistema empresarial completo para el control de cadmio en productos de cacao.

**Repositorio:** https://github.com/rframosyataco8-ux/sistema-analisis-cadmio

---

## Componentes

| Componente | Tecnología | Uso |
|------------|-----------|-----|
| **Backend** | NestJS + Prisma + PostgreSQL | API segura + tiempo real |
| **App Escritorio** | Electron + React + Tailwind | Panel de control Chincha |
| **App Móvil** | Flutter | Ingreso de Cadmio (Lima) |

---

## Requisitos

- Node.js 20+
- Docker Desktop
- Git
- Flutter 3.16+ (solo para móvil)

---

## 1. Clonar y base de datos

```bash
git clone https://github.com/rframosyataco8-ux/sistema-analisis-cadmio.git
cd sistema-analisis-cadmio
docker compose up -d
```

---

## 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

Backend en: http://localhost:3000

---

## 3. App de Escritorio (ventana nativa)

```bash
cd desktop
npm install
npm run electron:dev
```

Se abre una **ventana de Windows** (no el navegador).

### Credenciales

| Rol | Email | Contraseña |
|-----|-------|------------|
| ADMIN (Chincha) | admin@romex.pe | Admin123! |
| ANALISTA (Lima) | lima@romex.pe | Analista123! |

### Funciones del escritorio

- Login profesional
- Dashboard con KPIs y gráficos (tendencia, zonas, productos)
- Actualización en tiempo real
- Crear / listar / filtrar / validar muestras
- Exportar CSV
- Gestión de usuarios (crear ADMIN y ANALISTA)

---

## 4. App Móvil (Flutter)

```bash
cd mobile
flutter create . --project-name sistema_cadmio_mobile
flutter pub get
flutter run
```

> `flutter create .` genera las carpetas android/ios necesarias la primera vez.

### Conexión al backend

| Dispositivo | URL API |
|-------------|--------|
| Emulador Android | `http://10.0.2.2:3000` (ya configurado) |
| Celular físico | Cambia en `lib/core/network/api_client.dart` a la IP de tu PC, ej: `http://192.168.1.15:3000` |

### Generar APK para Lima

```bash
cd mobile
flutter build apk --release
```

El APK queda en: `mobile/build/app/outputs/flutter-apk/app-release.apk`

### Funciones del móvil

- Login (solo ANALISTA)
- Lista de muestras pendientes
- Ingreso de valor de Cadmio + observaciones
- Pull-to-refresh

---

## 5. Migrar Excel histórico (opcional)

1. Copia el Excel a: `backend/data/Torta_Trozada_Cadmio_traza_2026.xlsx`
2. Ejecuta:

```bash
cd backend
npm run migrate:excel
```

---

## Flujo de uso real

1. **Chincha** (escritorio) crea una muestra → estado `PENDING_ANALYSIS`
2. **Lima** (móvil) ve la muestra e ingresa el Cadmio
3. **Chincha** ve el resultado **en tiempo real** en el Dashboard
4. Admin filtra, exporta CSV y **valida** la muestra

---

## Estado del sistema

| Módulo | Estado |
|--------|--------|
| Backend seguro (JWT + roles) | Completo |
| App Escritorio (Electron) | Completo |
| Dashboard + gráficos | Completo |
| Filtros + export CSV | Completo |
| Usuarios | Completo |
| App Móvil Flutter | Completo |
| Tiempo real (WebSockets) | Completo |
| Migración Excel | Script listo |
