import { IsEmail, IsString, MinLength, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password for the account',
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty() // Password should not be optional for registration
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the user'
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string; // Add optional marker

  @ApiProperty({
    example: '123 Main St, City, Country',
    description: 'The address of the user'
  })
  @IsString()
  @IsOptional()
  address?: string; // Add optional marker

  
  @IsNotEmpty()
  @IsString()
  role: string;
   
  
  @ApiProperty({
    example: true,
    
    description: 'Indicates if the user is verified',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean = true;

}

export class LoginDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password for the account',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'newPassword123',
    description: 'The new password for the account',
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;
}

export class RegisterRestaurantDto extends RegisterDto {
  @ApiProperty({
    example: 'Restaurant Name',
    description: 'The name of the restaurant'
  })
  @IsString()
  @IsNotEmpty()
  restaurantName: string;

  @ApiProperty({
    example: '123 Restaurant St, City, Country',
    description: 'The address of the restaurant'
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: 'A nice family restaurant',
    description: 'Description of the restaurant'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the restaurant'
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    example: 'Italian',
    description: 'Type of cuisine served'
  })
  @IsString()
  @IsOptional()
  cuisine?: string;

  @ApiProperty({
    example: true,
    description: 'Whether delivery service is available'
  })
  @IsBoolean()
  @IsOptional()
  isDeliveryAvailable?: boolean;
}
