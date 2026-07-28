/**
 * Script de migración del Excel histórico a PostgreSQL
 * 
 * Uso:
 * 1. Coloca el archivo Excel en: backend/data/Torta_Trozada_Cadmio_traza_2026.xlsx
 * 2. Ejecuta: npm run migrate:excel
 *
 * El script:
 * - Lee las hojas principales del Excel
 * - Normaliza tipos de producto, zonas y valores de cadmio
 * - Inserta los registros en la base de datos
 * - Marca como ANALYZED los que tienen valor de cadmio
 * - Marca como PENDING_ANALYSIS los que dicen "PENDIENTE ANALIZAR"
 */

import { PrismaClient, SampleStatus } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Ruta del Excel (el usuario debe colocar el archivo aquí)
const EXCEL_PATH = path.join(__dirname, '../data/Torta_Trozada_Cadmio_traza_2026.xlsx');

// Mapeo de nombres de hojas → nombre limpio de product type
const SHEET_TO_PRODUCT: Record<string, string> = {
  'Torta de Cacao': 'Torta de cacao',
  'torta de cacao alcalino': 'Torta de cacao alcalino',
  'Grano de cacao': 'Grano de cacao',
  'Cacao alcalino': 'Cacao alcalino',
  'Cacao en polvo': 'Cacao en polvo',
  'Hoja1': 'Torta trozada',
};

// Zonas conocidas (se crean si no existen)
const KNOWN_ZONES = [
  'Ayacucho', 'Jaen', 'Tarapoto', 'Neshuya', 'Pangoa',
  'Tingo María', 'Tingo Maria', 'Sisa', 'Bagua', 'Quillabamba',
  'Juanjui', 'Yurimaguas', 'Chanchamayo', 'Tocache', 'Moyobamba',
  'Campoverde', 'Constitución', 'Caecam-Ucayali',
];

function cleanString(value: any): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === '' || s === 'undefined' || s === 'null' ? null : s;
}

function parseCadmium(value: any): { cadmium: number | null; isPending: boolean } {
  if (value === null || value === undefined) return { cadmium: null, isPending: true };
  const s = String(value).trim().toUpperCase();

  if (s.includes('PENDIENTE') || s === '' || s === '-' || s === 'N/A') {
    return { cadmium: null, isPending: true };
  }

  // Limpia comas y espacios (ej: "1,021" o " 1.021 ")
  const cleaned = s.replace(',', '.').replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);

  if (isNaN(num)) return { cadmium: null, isPending: true };
  return { cadmium: num, isPending: false };
}

function extractZonesFromRow(row: any, possibleColumns: string[]): string[] {
  const zones: string[] = [];
  for (const col of possibleColumns) {
    const val = cleanString(row[col]);
    if (val) {
      // Puede venir "Jaen, Tarapoto" o solo "Jaen"
      const parts = val.split(/[,;/|]+/).map((p) => p.trim()).filter(Boolean);
      zones.push(...parts);
    }
  }
  // También buscar en columnas genéricas que contengan nombres de zonas
  return [...new Set(zones.map((z) => z.replace(/\s+/g, ' ').trim()))];
}

async function ensureProductType(name: string) {
  return prisma.productType.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function ensureZone(name: string) {
  const normalized = name
    .replace(/Mar\u00eda/gi, 'María')
    .replace(/Maria/gi, 'María')
    .trim();

  return prisma.zone.upsert({
    where: { name: normalized },
    update: {},
    create: { name: normalized },
  });
}

async function migrateSheet(
  sheetName: string,
  workbook: XLSX.WorkBook,
  adminUserId: string,
) {
  const productName = SHEET_TO_PRODUCT[sheetName];
  if (!productName) {
    console.log(`  ⚠ Hoja "${sheetName}" no mapeada, se omite.`);
    return 0;
  }

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) return 0;

  // Convertir a JSON (toma la primera fila como headers)
  const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

  if (rows.length === 0) {
    console.log(`  ℹ Hoja "${sheetName}" vacía.`);
    return 0;
  }

  console.log(`  📄 Procesando hoja "${sheetName}" → ${productName} (${rows.length} filas)`);

  const productType = await ensureProductType(productName);
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      // Intentar encontrar el código de lote en diferentes posibles columnas
      const loteCode =
        cleanString(row['Cuartel/Lote (Cod. Parcela/Sector)']) ||
        cleanString(row['Cuartel/Lote']) ||
        cleanString(row['Lote']) ||
        cleanString(row['Código']) ||
        cleanString(row['Columna5']) ||
        null;

      if (!loteCode) {
        skipped++;
        continue;
      }

      // Evitar duplicados por lote + product type
      const exists = await prisma.sample.findFirst({
        where: {
          loteCode,
          productTypeId: productType.id,
        },
      });
      if (exists) {
        skipped++;
        continue;
      }

      // Cadmio
      const cadmiumRaw =
        row['Cadmio'] ??
        row['cadmio'] ??
        row['Columna7'] ??
        row['Referencia 1 (ANALISIS)'] ??
        null;

      const { cadmium, isPending } = parseCadmium(cadmiumRaw);

      // Peso
      const weightRaw = row['Peso'] ?? row['Peso: gr'] ?? row['Columna2'] ?? null;
      let weight: number | null = null;
      if (weightRaw) {
        const w = parseFloat(String(weightRaw).replace(/[^0-9.]/g, ''));
        if (!isNaN(w)) weight = w;
      }

      // Productor
      const producerCode =
        cleanString(row['Código Productor']) ||
        cleanString(row['Codigo Productor']) ||
        'Chincha';

      const producerName =
        cleanString(row['Nombre Productor']) ||
        cleanString(row['Nombre productor']) ||
        'Exportadora Romex S.A';

      // Orígenes de grano (columnas posibles)
      const originColumns = [
        'Orígen de grano',
        'Origen de grano',
        'Orígen de grano',
        'Columna12', 'Columna13', 'Columna14', 'Columna15',
        'Columna1', 'Columna2', 'Columna3',
      ];
      const zoneNames = extractZonesFromRow(row, originColumns);

      // Estado
      const status = isPending || cadmium === null
        ? SampleStatus.PENDING_ANALYSIS
        : SampleStatus.ANALYZED;

      // Crear la muestra
      const sample = await prisma.sample.create({
        data: {
          loteCode,
          productTypeId: productType.id,
          weight,
          producerCode,
          producerName,
          cadmium,
          status,
          analyzedAt: status === SampleStatus.ANALYZED ? new Date() : null,
          createdById: adminUserId,
          notes: `Migrado desde Excel - hoja: ${sheetName}`,
        },
      });

      // Asociar zonas
      for (const zoneName of zoneNames) {
        if (!zoneName || zoneName.length < 2) continue;
        try {
          const zone = await ensureZone(zoneName);
          await prisma.sampleOrigin.create({
            data: {
              sampleId: sample.id,
              zoneId: zone.id,
            },
          });
        } catch {
          // Zona duplicada o inválida, se ignora
        }
      }

      // Plaguicidas (si existe la columna)
      const pestRaw =
        cleanString(row['Plaguicidas']) ||
        cleanString(row['plaguicidas']) ||
        null;

      if (pestRaw && pestRaw.length > 2) {
        await prisma.pesticide.create({
          data: {
            sampleId: sample.id,
            name: 'Plaguicidas (migrado)',
            value: pestRaw.substring(0, 500),
          },
        });
      }

      inserted++;
    } catch (err: any) {
      console.error(`    Error en fila:`, err.message);
      skipped++;
    }
  }

  console.log(`    ✅ Insertados: ${inserted} | Omitidos/duplicados: ${skipped}`);
  return inserted;
}

async function main() {
  console.log('\n🚀 Iniciando migración del Excel histórico...\n');

  // Verificar que existe el archivo
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('❌ No se encontró el archivo Excel.');
    console.error(`   Coloca el archivo en: ${EXCEL_PATH}`);
    console.error('   Nombre esperado: Torta_Trozada_Cadmio_traza_2026.xlsx');
    process.exit(1);
  }

  // Obtener usuario admin para assigned createdBy
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.error('❌ No existe un usuario ADMIN. Ejecuta primero: npm run prisma:seed');
    process.exit(1);
  }

  console.log(`📂 Leyendo: ${EXCEL_PATH}`);
  const workbook = XLSX.readFile(EXCEL_PATH);
  console.log(`📋 Hojas encontradas: ${workbook.SheetNames.join(', ')}\n`);

  let totalInserted = 0;

  for (const sheetName of workbook.SheetNames) {
    const count = await migrateSheet(sheetName, workbook, admin.id);
    totalInserted += count;
  }

  console.log(`\n🎉 Migración finalizada.`);
  console.log(`   Total de registros insertados: ${totalInserted}`);
  console.log('\nPuedes verificar los datos con: npx prisma studio\n');
}

main()
  .catch((e) => {
    console.error('Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
