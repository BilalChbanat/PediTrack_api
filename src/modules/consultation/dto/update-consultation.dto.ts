// update-consultation.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateConsultationDto } from './reate-consultation.dto';
export class UpdateConsultationDto extends PartialType(CreateConsultationDto) {}
