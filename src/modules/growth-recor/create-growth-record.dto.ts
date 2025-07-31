import { IsNumber, IsString, IsDateString } from 'class-validator';

export class CreateGrowthRecordDto {
  @IsString()
  patientId: string;

  @IsNumber()
  heightCm: number;

  @IsNumber()
  weightKg: number;

  @IsDateString()
  date: string; // Format ISO (YYYY-MM-DD)

  @IsNumber()
  headCircumferenceCm?: number;
}
