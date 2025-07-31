// consultation-query.dto.ts
import { IsOptional, IsString, IsDateString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ConsultationQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit: number = 10;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}