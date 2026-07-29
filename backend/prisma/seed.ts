import { PrismaClient, Role, SampleStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Datos reales extraídos del Excel "Torta Trozada Cadmio traza 2026"
const SAMPLE_DATA = [
  // Torta de Cacao — con cadmio
  { lote: '23260205', product: 'Torta de cacao', weight: 1000, cadmium: 1.021, zones: ['Ayacucho', 'Jaen', 'Tarapoto'], status: 'ANALYZED' as const },
  { lote: '24260207', product: 'Torta de cacao', weight: 1000, cadmium: 1.212, zones: ['Tarapoto', 'Jaen', 'Pangoa'], status: 'ANALYZED' as const },
  { lote: '25260211', product: 'Torta de cacao', weight: 1000, cadmium: 1.143, zones: ['Tarapoto', 'Jaen', 'Pangoa', 'Neshuya'], status: 'ANALYZED' as const },
  { lote: '26260212', product: 'Torta de cacao', weight: 1000, cadmium: 1.043, zones: ['Neshuya', 'Pangoa'], status: 'ANALYZED' as const },
  { lote: '27260213', product: 'Torta de cacao', weight: 1000, cadmium: 1.029, zones: ['Neshuya', 'Pangoa'], status: 'ANALYZED' as const },
  { lote: '28260214', product: 'Torta de cacao', weight: 1000, cadmium: 1.099, zones: ['Neshuya', 'Pangoa'], status: 'ANALYZED' as const },
  { lote: '29260214', product: 'Torta de cacao', weight: 1000, cadmium: 1.123, zones: ['Neshuya', 'Pangoa'], status: 'ANALYZED' as const },
  { lote: '30260216', product: 'Torta de cacao', weight: 1000, cadmium: 1.066, zones: ['Neshuya', 'Pangoa'], status: 'ANALYZED' as const },
  { lote: '31260216', product: 'Torta de cacao', weight: 1000, cadmium: 1.363, zones: ['Neshuya', 'Pangoa', 'Tingo María'], status: 'ANALYZED' as const },
  { lote: '32260218', product: 'Torta de cacao', weight: 1000, cadmium: 1.306, zones: ['Neshuya', 'Pangoa', 'Tingo María'], status: 'ANALYZED' as const },
  { lote: '38260227', product: 'Torta de cacao', weight: 1000, cadmium: 0.938, zones: ['Sisa', 'Jaen'], status: 'ANALYZED' as const },
  { lote: '45260305', product: 'Torta de cacao', weight: 1000, cadmium: 0.866, zones: ['Juanjui'], status: 'ANALYZED' as const },
  { lote: '61260409', product: 'Torta de cacao', weight: 300, cadmium: 2.239, zones: ['Jaen', 'Bagua'], status: 'ANALYZED' as const },
  { lote: '62260410', product: 'Torta de cacao', weight: 300, cadmium: 1.785, zones: ['Bagua', 'Ayacucho', 'Jaen'], status: 'ANALYZED' as const },
  { lote: '63260411', product: 'Torta de cacao', weight: 300, cadmium: 1.381, zones: ['Ayacucho', 'Jaen'], status: 'ANALYZED' as const },
  { lote: '116260618', product: 'Torta de cacao', weight: 300, cadmium: 0.65, zones: ['Ayacucho', 'Quillabamba', 'Sisa', 'Pangoa', 'Chanchamayo'], status: 'ANALYZED' as const },
  { lote: '103260522', product: 'Torta de cacao', weight: 300, cadmium: 1.48, zones: ['Tingo María', 'Jaen', 'Juanjui'], status: 'ANALYZED' as const },
  // Pendientes (SIN MUESTRA / PENDIENTE) — para que Lima complete
  { lote: '70260419', product: 'Torta de cacao', weight: 300, cadmium: null, zones: ['Sisa', 'Yurimaguas'], status: 'PENDING_ANALYSIS' as const },
  { lote: '93260517', product: 'Torta de cacao', weight: 300, cadmium: null, zones: ['Pangoa', 'Ayacucho'], status: 'PENDING_ANALYSIS' as const },
  { lote: '128260701', product: 'Torta de cacao', weight: 300, cadmium: null, zones: ['Tarapoto', 'Juanjui'], status: 'PENDING_ANALYSIS' as const },
  { lote: '131260710', product: 'Torta de cacao', weight: 300, cadmium: null, zones: [], status: 'PENDING_ANALYSIS' as const },
  // Alcalino
  { lote: '22260511', product: 'Torta de cacao alcalino', weight: 300, cadmium: 0.96, zones: ['Tingo María', 'Sisa'], status: 'ANALYZED' as const },
  { lote: '23260515', product: 'Torta de cacao alcalino', weight: 300, cadmium: 0.82, zones: ['Tarapoto', 'Chanchamayo', 'Tocache'], status: 'ANALYZED' as const },
  { lote: '24260518', product: 'Torta de cacao alcalino', weight: 300, cadmium: 1.05, zones: ['Tarapoto', 'Pangoa', 'Chanchamayo'], status: 'ANALYZED' as const },
  { lote: '25260520', product: 'Torta de cacao alcalino', weight: 300, cadmium: null, zones: ['Bagua', 'Jaen', 'Pangoa'], status: 'PENDING_ANALYSIS' as const },
  // Cacao alcalino
  { lote: '12260417', product: 'Cacao alcalino', weight: 300, cadmium: 1.02, zones: ['Sisa', 'Jaen', 'Tarapoto', 'Tingo María'], status: 'ANALYZED' as const },
  { lote: '13260420', product: 'Cacao alcalino', weight: 300, cadmium: 1.09, zones: ['Sisa', 'Jaen', 'Tarapoto', 'Tingo María'], status: 'ANALYZED' as const },
  // Cacao en polvo
  { lote: '14260526', product: 'Cacao en polvo', weight: 300, cadmium: 0.98, zones: [], status: 'ANALYZED' as const },
  { lote: '11260513', product: 'Cacao en polvo', weight: 300, cadmium: 1.07, zones: [], status: 'ANALYZED' as const },
  { lote: '12260522', product: 'Cacao en polvo', weight: 300, cadmium: 0.79, zones: [], status: 'ANALYZED' as const },
  { lote: '15260527', product: 'Cacao en polvo', weight: 300, cadmium: 0.98, zones: ['Jaen', 'Ayacucho', 'Quillabamba', 'Tingo María', 'Yurimaguas'], status: 'ANALYZED' as const },
  { lote: '16260706', product: 'Cacao en polvo', weight: 300, cadmium: 1.12, zones: ['Jaen', 'Yurimaguas', 'Neshuya'], status: 'ANALYZED' as const },
  // Grano
  { lote: 'EG07-3546', product: 'Grano de cacao', weight: 350, cadmium: 0.66, zones: ['Ayacucho'], status: 'ANALYZED' as const },
  { lote: 'EG07-3609', product: 'Grano de cacao', weight: 350, cadmium: 0.34, zones: ['Ayacucho'], status: 'ANALYZED' as const },
];

async function main() {
  console.log('Seeding...');

  const adminPass = await bcrypt.hash('Admin123!', 12);
  const analistaPass = await bcrypt.hash('Analista123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@romex.pe' },
    update: {},
    create: { email: 'admin@romex.pe', passwordHash: adminPass, fullName: 'Administrador Chincha', role: Role.ADMIN },
  });

  await prisma.user.upsert({
    where: { email: 'lima@romex.pe' },
    update: {},
    create: { email: 'lima@romex.pe', passwordHash: analistaPass, fullName: 'Analista Lima', role: Role.ANALISTA },
  });

  const productNames = ['Torta de cacao', 'Torta de cacao alcalino', 'Grano de cacao', 'Cacao alcalino', 'Cacao en polvo', 'Torta trozada'];
  const productMap: Record<string, string> = {};
  for (const name of productNames) {
    const p = await prisma.productType.upsert({ where: { name }, update: {}, create: { name } });
    productMap[name] = p.id;
  }

  const zoneNames = [
    'Ayacucho', 'Jaen', 'Tarapoto', 'Neshuya', 'Pangoa', 'Tingo María', 'Sisa', 'Bagua',
    'Quillabamba', 'Juanjui', 'Yurimaguas', 'Chanchamayo', 'Tocache', 'Moyobamba',
  ];
  const zoneMap: Record<string, string> = {};
  for (const name of zoneNames) {
    const z = await prisma.zone.upsert({ where: { name }, update: {}, create: { name } });
    zoneMap[name] = z.id;
  }

  let created = 0;
  for (const s of SAMPLE_DATA) {
    const existing = await prisma.sample.findFirst({ where: { loteCode: s.lote } });
    if (existing) continue;

    const productId = productMap[s.product];
    if (!productId) continue;

    const sample = await prisma.sample.create({
      data: {
        loteCode: s.lote,
        productTypeId: productId,
        weight: s.weight,
        producerCode: 'Chincha',
        producerName: 'Exportadora Romex S.A',
        cadmium: s.cadmium,
        status: s.status === 'ANALYZED' ? SampleStatus.ANALYZED : SampleStatus.PENDING_ANALYSIS,
        analyzedAt: s.cadmium != null ? new Date() : null,
        createdById: admin.id,
        origins: {
          create: s.zones
            .filter((z) => zoneMap[z])
            .map((z) => ({ zoneId: zoneMap[z] })),
        },
      },
    });
    created++;
    console.log(`  + ${sample.loteCode} (${s.cadmium ?? 'PENDIENTE'})`);
  }

  console.log(`\nSeed OK. Admin: admin@romex.pe / Admin123!`);
  console.log(`Analista: lima@romex.pe / Analista123!`);
  console.log(`Muestras creadas: ${created}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
