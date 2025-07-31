import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import * as cookieParser from 'cookie-parser';

export enum TokenLocation {
  QUERY = 'query',
  PARAMS = 'params',
  COOKIES = 'cookies',
  HEADERS = 'headers',


}

export const Token = (location: TokenLocation) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('tokenLocation', location, descriptor.value);
    return descriptor;
  };
};

interface TokenPayload {
  sub: string;
  email: string;
  role: string; // Ajout du rôle dans le payload

}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwtConfig: any;

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    this.jwtConfig = this.configService.get('jwt');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const requiredRoles = this.reflector.get<string[]>('roles', handler); // Récupérer les rôles requis
    const tokenLocation =
      this.reflector.get<TokenLocation>('tokenLocation', handler) ||
      TokenLocation.HEADERS;

    try {
      const accessToken = this.extractToken(request, tokenLocation);

      if (!accessToken) {
        throw new UnauthorizedException('Access token not found');
      }

      try {
        const decoded = this.jwtService.verify<TokenPayload>(accessToken, {
          secret: this.jwtConfig.secret,
          algorithms: [this.jwtConfig.accessToken.algorithm],
        });
        request['decoded'] = decoded;

        // Vérification des rôles
        if (requiredRoles && !requiredRoles.includes(decoded.role)) {
          console.log('Required roles:', requiredRoles);
          console.log('Decoded role:', decoded.role);
          throw new ForbiddenException('Insufficient permissions');
        }
        
        return true;
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return await this.handleTokenRefresh(request);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error in canActivate:', error);
      throw new UnauthorizedException(error.message || 'Invalid token');
    }
  }



  private async handleTokenRefresh(request: Request): Promise<boolean> {
    console.log('Checking for refresh token...');
    console.log('All cookies received:', request.cookies); // Log all cookies
  
    const refreshToken = request.cookies?.refreshToken;
    console.log('Refresh token from cookies:', refreshToken);
  
    if (!refreshToken) {
      console.error('No refresh token found in cookies');
      throw new UnauthorizedException('Refresh token not found');
    }
      console.log('rf')
    try {
      console.log('Verifying refresh token...');
      const decoded = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.jwtConfig.secret,
        algorithms: [this.jwtConfig.refreshToken.algorithm],
      });

      console.log('Decoded refresh token:', decoded);

      const newAccessToken = this.jwtService.sign(
        { sub: decoded.sub, email: decoded.email },
        {
          secret: this.jwtConfig.secret,
          algorithm: this.jwtConfig.accessToken.algorithm,
          expiresIn: this.jwtConfig.accessToken.expiresIn,
        },
      );

      console.log('New access token generated:', newAccessToken);

      const response = request.res as Response;
      response.setHeader('Authorization', `Bearer ${newAccessToken}`);
      response.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: this.parseDuration(this.jwtConfig.accessToken.expiresIn),
      });

      request['decoded'] = decoded;
      return true;
    } catch (error) {
      console.error('Invalid refresh token:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private extractToken(
    request: Request,
    location: TokenLocation,
  ): string | undefined {
    switch (location) {
      case TokenLocation.QUERY:
        return request.query.token as string;
      case TokenLocation.PARAMS:
        return request.params.token;
      case TokenLocation.COOKIES:
        return request.cookies?.accessToken;
      case TokenLocation.HEADERS:
        const authHeader = request.headers.authorization;
        return authHeader ? authHeader.split(' ')[1] : undefined;
      default:
        return undefined;
    }
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 900000;

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    switch (unit) {
      case 's':
        return num * 1000;
      case 'm':
        return num * 60 * 1000;
      case 'h':
        return num * 60 * 60 * 1000;
      case 'd':
        return num * 24 * 60 * 60 * 1000;
      default:
        return 900000;
    }
  }
}
