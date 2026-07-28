import { Controller, Get, UseGuards } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('zones')
@UseGuards(JwtAuthGuard)
export class ZonesController {
  constructor(private service: ZonesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
