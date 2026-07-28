import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateSampleDto {
  @IsString()
  @IsNotEmpty()
  loteCode: string;

  @IsUUID()
  @IsNotEmpty()
  productTypeId: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @IsString()
  @IsOptional()
  producerCode?: string;

  @IsString()
  @IsOptional()
  producerName?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  zoneIds?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}
