import { Double } from 'typeorm';

export class CreateMepDto {
  data_inicio: Date;

  data_termino: Date;

  dias_semana: number;

  horas_por_dia: number;
}
