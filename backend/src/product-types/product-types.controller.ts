import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('product-types')
@UseGuards(JwtAuthGuard)
export class ProductTypesController {
  constructor(private service: ProductTypesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
