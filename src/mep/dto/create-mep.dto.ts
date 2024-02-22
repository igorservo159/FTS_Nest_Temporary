import {
  IsInt,
  Min,
  Max,
  IsNumber,
  IsIn,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
export class CreateMepDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(127)
  weekDays: number;

  @IsNotEmpty()
  @IsNumber()
  @IsIn([1, 1.5, 2, 2.5, 3, 3.5, 4])
  hoursPerDay: number;

  @IsNotEmpty()
  @IsIn(['ENEM', 'EsPCEx', 'EEAR', 'AFA'])
  entrance_exam: string;
}
