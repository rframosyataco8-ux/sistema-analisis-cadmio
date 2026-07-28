import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SampleStatus, Role } from '@prisma/client';
import { UpdateCadmiumDto } from './dto/update-cadmium.dto';

@Injectable()
export class SamplesService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: SampleStatus) {
    return this.prisma.sample.findMany({
      where: status ? { status } : undefined,
      include: {
        productType: true,
        origins: { include: { zone: true } },
        pesticides: true,
        createdBy: { select: { id: true, fullName: true } },
        analyzedBy: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPending() {
    return this.findAll(SampleStatus.PENDING_ANALYSIS);
  }

  async findOne(id: string) {
    const sample = await this.prisma.sample.findUnique({
      where: { id },
      include: {
        productType: true,
        origins: { include: { zone: true } },
        pesticides: true,
        createdBy: { select: { id: true, fullName: true } },
        analyzedBy: { select: { id: true, fullName: true } },
      },
    });
    if (!sample) throw new NotFoundException('Muestra no encontrada');
    return sample;
  }

  async updateCadmium(id: string, dto: UpdateCadmiumDto, userId: string, userRole: Role) {
    const sample = await this.findOne(id);

    if (sample.status !== SampleStatus.PENDING_ANALYSIS) {
      throw new ForbiddenException('Solo se puede actualizar cadmio en muestras pendientes de análisis');
    }

    // Solo ANALISTA o ADMIN pueden actualizar cadmio
    if (userRole !== Role.ANALISTA && userRole !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permiso para esta acción');
    }

    return this.prisma.sample.update({
      where: { id },
      data: {
        cadmium: dto.cadmium,
        status: SampleStatus.ANALYZED,
        analyzedAt: new Date(),
        analyzedById: userId,
        notes: dto.notes ?? sample.notes,
      },
      include: {
        productType: true,
        origins: { include: { zone: true } },
        analyzedBy: { select: { id: true, fullName: true } },
      },
    });
  }
}
