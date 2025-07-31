// jwtService.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(payload: any, type: 'access' | 'refresh' | 'verification' | 'reset') {
    const expiresIn = this.configService.get<string>(`jwt.${type}Token.expiresIn`);
    return this.jwtService.sign(payload, { expiresIn });
  }
}