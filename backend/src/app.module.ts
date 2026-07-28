import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SamplesModule } from './samples/samples.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    SamplesModule,
  ],
})
export class AppModule {}
