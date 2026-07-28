# Carpeta de datos para migración

Coloca aquí el archivo Excel histórico con el siguiente nombre exacto:

```
Torta_Trozada_Cadmio_traza_2026.xlsx
```

Luego ejecuta desde la carpeta `backend`:

```bash
npm run migrate:excel
```

El script migrará todas las hojas reconocidas a la base de datos.
