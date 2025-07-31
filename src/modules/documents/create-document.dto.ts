// src/documents/dto/create-document.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsString()
  patientId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  // The backend generates `url` and `type`
  @IsOptional()
  @IsString()
  url?: string; // Path to file (local or remote)

  @IsOptional()
  @IsString()
  type?: string; // pdf, jpg, png etc.
}