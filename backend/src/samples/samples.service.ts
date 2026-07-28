import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SampleStatus, Role } from '@prisma/client';
import { UpdateCadmiumDto } from './dto/update-cadmium.dto';
import { CreateSampleDto } from './dto/create-sample.dto';
import { SamplesGateway } from './samples.gateway';

@Injectable()
export class SamplesService {
  constructor(
    private prisma: PrismaService,
    private gateway: SamplesGateway,
  ) {}

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

  async create(dto: CreateSampleDto, userId: string) {
    const sample = await this.prisma.sample.create({
      data: {
        loteCode: dto.loteCode,
        productTypeId: dto.productTypeId,
        weight: dto.weight,
        producerCode: dto.producerCode,
        producerName: dto.producerName,
        notes: dto.notes,
        status: SampleStatus.PENDING_ANALYSIS,
        createdById: userId,
        origins: dto.zoneIds?.length
          ? { create: dto.zoneIds.map((zoneId) => ({ zoneId })) }
          : undefined,
      },
      include: {
        productType: true,
        origins: { include: { zone: true } },
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    this.gateway.emitSampleCreated(sample);
    return sample;
  }

  async updateCadmium(id: string, dto: UpdateCadmiumDto, userId: string, userRole: Role) {
    const sample = await this.findOne(id);

    if (sample.status !== SampleStatus.PENDING_ANALYSIS) {
      throw new ForbiddenException('Solo se puede actualizar cadmio en muestras pendientes de análisis');
    }

    if (userRole !== Role.ANALISTA && userRole !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permiso para esta acción');
    }

    const updated = await this.prisma.sample.update({
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

    this.gateway.emitSampleUpdated(updated);
    return updated;
  }

  async validate(id: string) {
    const sample = await this.findOne(id);
    if (sample.status !== SampleStatus.ANALYZED) {
      throw new ForbiddenException('Solo se pueden validar muestras ya analizadas');
    }

    const updated = await this.prisma.sample.update({
      where: { id },
      data: { status: SampleStatus.VALIDATED },
      include: {
        productType: true,
        origins: { include: { zone: true } },
      },
    });

    this.gateway.emitSampleUpdated(updated);
    return updated;
  }

  async getStats() {
    const [total, pending, analyzed, validated] = await Promise.all([
      this.prisma.sample.count(),
      this.prisma.sample.count({ where: { status: SampleStatus.PENDING_ANALYSIS } }),
      this.prisma.sample.count({ where: { status: SampleStatus.ANALYZED } }),
      this.prisma.sample.count({ where: { status: SampleStatus.VALIDATED } }),
    ]);

    const cadmiumStats = await this.prisma.sample.aggregate({
      where: { cadmium: { not: null } },
      _avg: { cadmium: true },
      _max: { cadmium: true },
      _min: { cadmium: true },
    });

    return {
      total,
      pending,
      analyzed,
      validated,
      cadmium: {
        avg: cadmiumStats._avg.cadmium ? Number(cadmiumStats._avg.cadmium) : null,
        max: cadmiumStats._max.cadmium ? Number(cadmiumStats._max.cadmium) : null,
        min: cadmiumStats._min.cadmium ? Number(cadmiumStats._min.cadmium) : null,
      },
    };
  }
}
