import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

/** Endpoint público para verificar que API + DB responden (sin login). */
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    let db = false;
    let users = 0;
    let samples = 0;
    let products = 0;
    let zones = 0;
    let dbError: string | null = null;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = true;
      [users, samples, products, zones] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.sample.count(),
        this.prisma.productType.count(),
        this.prisma.zone.count(),
      ]);
    } catch (e: any) {
      dbError = e?.message || String(e);
    }

    return {
      ok: db,
      api: true,
      database: db,
      dbError,
      counts: { users, samples, products, zones },
      hint:
        !db
          ? 'Postgres no responde. Ejecuta: docker compose up -d'
          : samples === 0
            ? 'Base vacía. En backend ejecuta: npm run prisma:seed'
            : 'Sistema listo',
    };
  }
}
