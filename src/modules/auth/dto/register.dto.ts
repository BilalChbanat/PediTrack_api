// create-restaurant.dto.ts
import { IsString, IsBoolean, IsArray, IsOptional, IsMongoId, IsNotEmpty, IsEmail, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Restaurant Name', description: 'The name of the restaurant' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Italian', description: 'Type of cuisine' })
  @IsString()
  @IsOptional()
  cuisineType?: string;

  @ApiProperty({ example: '123 Restaurant St, City', description: 'Physical address of the restaurant' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '40.7128° N, 74.0060° W', description: 'Geographic location' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123', description: 'Password' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9\s\-()]{7,20}$/, { message: 'Phone number must contain only digits and may include +, -, spaces, or parentheses' })
  phoneNumber: string;

  @ApiProperty({ example: false, description: 'Approval status' })
  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @IsOptional()
  @IsMongoId()
  manager: string;

  @ApiProperty({ example: ['507f1f77bcf86cd799439011'], description: 'Menu items IDs' })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  menu?: ObjectId[];

   
  @IsNotEmpty()
  @IsString()
  role: string;

}