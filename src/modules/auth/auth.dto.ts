import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'securepassword',
    description: 'User password (min 6 characters)',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'customer',
    description: 'User role (admin or customer)',
  })
  @IsEnum(['admin', 'customer'])
  role: 'admin' | 'customer';
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'securepassword', description: 'User password' })
  @IsNotEmpty()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'Login successful', description: 'Success message' })
  message: string;

  @ApiProperty({ example: 200, description: 'Response status code' })
  code: number;

  @ApiProperty({
    example: {
      token: 'jwt_token_here',
      user: { email: 'user@example.com', role: 'customer' },
    },
    description: 'Authenticated user data and token',
  })
  data: {
    token: string;
    user: { email: string; role: string };
  };
}
