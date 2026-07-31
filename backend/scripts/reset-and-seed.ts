/**
 * Borra datos de negocio y vuelve a cargar el seed del Excel.
 * Uso (desde carpeta backend):
 *   npx ts-node scripts/reset-and-seed.ts
 * o:
 *   npm run db:reset
 */
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('\n⚠️  RESET: eliminando pesticides, origins, samples...\n');

  await prisma.pesticide.deleteMany();
  await prisma.sampleOrigin.deleteMany();
  await prisma.sample.deleteMany();
  await prisma.auditLog.deleteMany();
  // No borramos users/productTypes/zones para no romper FKs; el seed hace upsert

  console.log('✅ Tablas de muestras limpias.\n');
  console.log('🌱 Ejecutando seed...\n');

  execSync('npx ts-node prisma/seed.ts', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: process.env,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
