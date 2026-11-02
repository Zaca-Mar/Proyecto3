import { IsInt } from 'class-validator';

export class AsignarPlanDto {
  @IsInt()
  alumnoId: number;
}
