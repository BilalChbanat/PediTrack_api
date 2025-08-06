// ====================
// 2. DTOs (patient.dto.ts)
// ====================
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsMongoId,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class  CreatePatientDto {



  @ApiProperty({
    description: 'insurance',
    example: 'Health Insurance',
  })
  @IsString()
  @IsOptional()
  insurance?: string;

  @ApiProperty({
    description: 'First name of the patient',
    example: 'Ahmed',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message:
      'First name can only contain letters, spaces, hyphens and apostrophes',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the patient',
    example: 'Benali',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message:
      'Last name can only contain letters, spaces, hyphens and apostrophes',
  })
  lastName: string;

  @ApiProperty({
    description: 'Gender of the patient',
    enum: ['male', 'female', 'other'],
    example: 'male',
  })
  @IsEnum(['male', 'female', 'other'], {
    message: 'Gender must be either male, female, or other',
  })
  @Transform(({ value }) => value?.toLowerCase())
  gender: string;

  @ApiProperty({
    description: 'Birth date of the patient (ISO date string)',
    example: '2020-05-15T00:00:00.000Z',
  })
  // @IsDateString({}, { message: 'Birth date must be a valid date' })
  // @Transform(({ value }) => {
  //   const date = new Date(value);
  //   const today = new Date();

  //   if (date > today) {
  //     throw new Error('Birth date cannot be in the future');
  //   }

  //   const maxAge = new Date();
  //   maxAge.setFullYear(maxAge.getFullYear() - 18);

  //   if (date < maxAge) {
  //     throw new Error('Patient must be under 18 years old');
  //   }

  //   return date;
  // })
  @IsString({ message: 'Birth date must be a valid date' })
  birthDate: string;
  @ApiProperty({
    description: 'Parent ID (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiProperty({
    description: 'Doctor ID (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439012',
  })
  // Doctor ID must be a valid MongoDB ObjectId
  // @IsMongoId({ message: 'Doctor ID must be a valid MongoDB ObjectId  dqsfs' })
  // doctorId?: string;
  @ApiPropertyOptional({
    description: 'Growth curve ID (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439013',
  })
  @IsOptional()
  @IsMongoId({ message: 'Growth curve ID must be a valid MongoDB ObjectId' })
  growthCurveId?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiPropertyOptional({
    description: 'Email address (optional)',
    example: 'ahmed.benali@email.com',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toLowerCase())
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'Please enter a valid email address',
  })
  email?: string;

  @IsEnum(['parent'], {
    message: 'Role must be parent',
  })
  @Transform(({ value }) => value?.toLowerCase())
  role: string;

  @ApiProperty({
    description: 'Address',
    example: '123 Main Street, City, Country',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Address must be at least 5 characters long' })
  @MaxLength(200, { message: 'Address must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  address: string;

 
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Transform(({ value }) => value?.trim())
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in international format (e.g., +1234567890)',
  })
  phoneNumber: string;

  
}








export class UpdatePatientDto extends PartialType(CreatePatientDto) {}
export class PatientQueryDto {
  @ApiPropertyOptional({
    description: 'Search by first name or last name',
    example: 'Ahmed',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by parent ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by doctor ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsMongoId()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by gender',
    enum: ['male', 'female', 'other'],
  })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => Math.min(parseInt(value) || 10, 100))
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'firstName',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
