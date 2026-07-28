import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCadmiumDto {
  @IsNumber()
  @Min(0)
  cadmium: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
