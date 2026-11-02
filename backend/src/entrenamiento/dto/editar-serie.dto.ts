import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class EditarSerieDto {
  @IsNumber()
  @Min(0)
  carga: number;

  @IsInt()
  @Min(0)
  repeticiones: number;

  @IsInt({ message: 'El RPE es obligatorio (de 6 a 10)' })
  @Min(6, { message: 'El RPE va de 6 a 10' })
  @Max(10, { message: 'El RPE va de 6 a 10' })
  rpe: number;
}
