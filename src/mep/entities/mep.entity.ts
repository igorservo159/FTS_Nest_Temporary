import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Mep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  data_inicio: Date;

  @Column({ type: 'date' })
  data_termino: Date;

  @Column({ type: 'tinyint', width: 1 })
  dias_semana: number; // Armazenará um número entre 0 e 127

  @Column({ type: 'int' })
  quantidade_horas: number;
}
