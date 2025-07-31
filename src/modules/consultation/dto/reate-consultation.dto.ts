// create-consultation.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsDateString, IsBoolean } from 'class-validator';

export class CreateConsultationDto {
  @IsMongoId()
  @IsNotEmpty()
  patientId: string;

  @IsMongoId()
  @IsOptional()
  appointmentId?: string; // Optional - can be auto-detected

  @IsString()
  @IsNotEmpty()
  motifConsultation: string;

  @IsString()
  @IsOptional()
  antecedents?: string;

  @IsString()
  @IsOptional()
  anamnese?: string;

  @IsString()
  @IsOptional()
  examenClinique?: string;

  @IsString()
  @IsOptional()
  cat?: string;

  @IsString()
  @IsOptional()
  traitement?: string;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

}
