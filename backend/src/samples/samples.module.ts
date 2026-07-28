import { Module } from '@nestjs/common';
import { SamplesService } from './samples.service';
import { SamplesController } from './samples.controller';
import { SamplesGateway } from './samples.gateway';

@Module({
  controllers: [SamplesController],
  providers: [SamplesService, SamplesGateway],
  exports: [SamplesService, SamplesGateway],
})
export class SamplesModule {}
