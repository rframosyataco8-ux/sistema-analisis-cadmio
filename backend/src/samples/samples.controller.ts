import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { SamplesService } from './samples.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, SampleStatus } from '@prisma/client';
import { UpdateCadmiumDto } from './dto/update-cadmium.dto';

@Controller('samples')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SamplesController {
  constructor(private samplesService: SamplesService) {}

  @Get()
  findAll(@Query('status') status?: SampleStatus) {
    return this.samplesService.findAll(status);
  }

  @Get('pending')
  @Roles(Role.ANALISTA, Role.ADMIN)
  findPending() {
    return this.samplesService.findPending();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.samplesService.findOne(id);
  }

  @Patch(':id/cadmium')
  @Roles(Role.ANALISTA, Role.ADMIN)
  updateCadmium(
    @Param('id') id: string,
    @Body() dto: UpdateCadmiumDto,
    @Req() req: any,
  ) {
    return this.samplesService.updateCadmium(id, dto, req.user.id, req.user.role);
  }
}
