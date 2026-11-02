import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { DiaDto } from './dia.dto';

export class CrearPlanDto {
  @IsNotEmpty({ message: 'El plan necesita un nombre' })
  nombre: string;

  @IsOptional()
  @IsInt()
  alumnoId?: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'Agregá al menos un día al plan' })
  @ValidateNested({ each: true })
  @Type(() => DiaDto)
  dias: DiaDto[];
}
