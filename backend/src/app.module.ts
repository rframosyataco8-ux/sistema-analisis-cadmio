import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SamplesModule } from './samples/samples.module';
import { ProductTypesModule } from './product-types/product-types.module';
import { ZonesModule } from './zones/zones.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    SamplesModule,
    ProductTypesModule,
    ZonesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
