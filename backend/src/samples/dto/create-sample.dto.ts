import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PesticideDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  unit?: string;
}

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PesticideDto)
  @IsOptional()
  pesticides?: PesticideDto[];
}
