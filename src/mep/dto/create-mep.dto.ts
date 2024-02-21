import { IsInt, Min, Max, IsNumber, IsDate, IsIn } from 'class-validator';
export class CreateMepDto {
  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsInt()
  @Min(0)
  @Max(127)
  weekDays: number;

  @IsNumber()
  @IsIn([1, 1.5, 2, 2.5, 3, 3.5, 4])
  hoursPerDay: number;
}
