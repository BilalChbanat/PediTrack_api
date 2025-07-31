import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreatePrescriptionDto {
  @IsNotEmpty() @IsString() patientId: string;
  @IsNotEmpty() @IsString() medication: string;
  @IsNotEmpty() @IsString() dosage: string;
  @IsNotEmpty() @IsString() frequency: string;
  @IsNotEmpty() @IsDateString() startDate: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() status?: string;
  

}
