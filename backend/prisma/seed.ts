import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Usuarios iniciales
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const analistaPassword = await bcrypt.hash('Analista123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@romex.pe' },
    update: {},
    create: {
      email: 'admin@romex.pe',
      passwordHash: adminPassword,
      fullName: 'Administrador Chincha',
      role: Role.ADMIN,
    },
  });

  const analista = await prisma.user.upsert({
    where: { email: 'lima@romex.pe' },
    update: {},
    create: {
      email: 'lima@romex.pe',
      passwordHash: analistaPassword,
      fullName: 'Analista Lima',
      role: Role.ANALISTA,
    },
  });

  // Tipos de producto
  const productTypes = [
    'Torta de cacao',
    'Torta de cacao alcalino',
    'Grano de cacao',
    'Cacao alcalino',
    'Cacao en polvo',
    'Torta trozada',
  ];

  for (const name of productTypes) {
    await prisma.productType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Zonas principales
  const zones = [
    'Ayacucho', 'Jaen', 'Tarapoto', 'Neshuya', 'Pangoa',
    'Tingo María', 'Sisa', 'Bagua', 'Quillabamba', 'Juanjui',
    'Yurimaguas', 'Chanchamayo', 'Tocache', 'Moyobamba',
  ];

  for (const name of zones) {
    await prisma.zone.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seed completado');
  console.log('Admin:', admin.email, '- Password: Admin123!');
  console.log('Analista:', analista.email, '- Password: Analista123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
