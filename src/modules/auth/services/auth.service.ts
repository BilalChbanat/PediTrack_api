import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { UserService } from './userService.service';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { EmailVerificationService } from 'src/utils';
import { MailService } from './mailService.service';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { AuthResponse } from '../../../common/interfaces/authResponse';
import { Response } from 'express';
// import { RestaurantService } from 'src/modules/resto/resto.service';
import { CreateRestaurantDto } from '../dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtConfig: any;

  constructor(
    private readonly userService: UserService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    this.jwtConfig = this.configService.get('jwt');
  }

  private async generateTokens(payload: {
    sub: string;
    email: string;
    role: string;
  }) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.secret,
      algorithm: this.jwtConfig.accessToken.algorithm,
      expiresIn: this.jwtConfig.accessToken.expiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.secret,
      algorithm: this.jwtConfig.refreshToken.algorithm,
      expiresIn: this.jwtConfig.refreshToken.expiresIn,
    });

    return { accessToken, refreshToken };
  }

  private setAuthCookies(
    response: Response,
    tokens: { accessToken: string; refreshToken: string },
  ): void {
    const secure = this.configService.get<string>('NODE_ENV') === 'production';
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/',
      maxAge: this.parseDuration('1d'),
    });

    response.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/',
      maxAge: this.parseDuration(this.jwtConfig.accessToken.expiresIn),
    });
    response.setHeader('Authorization', `Bearer ${tokens.accessToken}`);
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 900000; // 15 minutes default

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

  async login(
    credentials: LoginDto,
    response: Response,
  ): Promise<AuthResponse> {
    try {
      const user = await this.validateUser(credentials);
      // await this.checkEmailVerification(user);

      const tokens = await this.generateTokens({
        sub: user._id.toString(),
        email: user.email,
        role: user.role, // Assurez-vous que user.role est correctement récupéré
      });

      this.setAuthCookies(response, tokens);

      return {
        status: HttpStatus.OK,
        data: {
          message: 'Login successful',
          user: {
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          },
          accessToken: tokens.accessToken,
        },
      };
    } catch (error) {
      this.logger.error(
        `Login failed for ${credentials.email}: ${error.message}`,
        error.stack,
      );
      throw this.handleLoginError(error);
    }
  }

  async refreshToken(
    refreshToken: string,
    response: Response,
  ): Promise<AuthResponse> {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.jwtConfig.secret,
        algorithms: [this.jwtConfig.refreshToken.algorithm],
      });

      const user = await this.userModel.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens({
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      this.setAuthCookies(response, tokens);

      return {
        status: HttpStatus.OK,
        data: {
          message: 'Token refreshed successfully',
          accessToken: tokens.accessToken,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async registerClient(body: RegisterDto): Promise<any> {
    try {
      const registrationResult = await this.registerAndVerifyUser(body);

      return registrationResult;
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Registration failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generateAuthResponse(
    user: UserDocument,
    response: Response,
  ): Promise<AuthResponse> {
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    // Set refresh token cookie
    this.setRefreshTokenCookie(response, refreshToken);

    return {
      status: HttpStatus.OK,
      data: {
        message: 'Login successful',
        accessToken,
        refreshToken, // Optional: you might not want to send this in the response body
      },
    };
  }

  private async generateAccessToken(payload: {
    id: string;
    email: string;
    role: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.accessToken.expiresIn'),
    });
  }

  private async generateRefreshToken(payload: {
    id: string;
    email: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.refreshToken.expiresIn'),
    });
  }

  private setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
  ): void {
    const secure = this.configService.get<string>('NODE_ENV') === 'production';
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/',
      maxAge,
    });
  }

  async registerAndVerifyUser(userData: RegisterDto): Promise<any> {
    const registered = await this.userService.registerUser(userData);

    if (!registered.success) {
      throw new HttpException(registered.error, HttpStatus.BAD_REQUEST);
    }
    if (!registered.user?._id || !registered.user?.email) {
      throw new InternalServerErrorException(
        'Invalid user data after registration',
      );
    }
    // const emailSent = await this.sendVerificationEmail(
    //   registered.user._id.toString(),
    //   registered.user.email,
    // );

    // if (!emailSent) {
    //   throw new InternalServerErrorException(
    //     'Failed to send verification email',
    //   );
    // }

    return {
      status: HttpStatus.CREATED,
      data: {
        userId: registered.user?.id,
        message: 'User created successfully. Check your email for verification',
      },
    };
  }

  async verifyEmail(
    token: string,
  ): Promise<{ message: string; statusCode: number }> {
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.validateAndGetUserFromToken(token);
      return await this.completeEmailVerification(user);
    } catch (error) {
      throw this.handleVerificationError(error);
    }
  }

  private async validateUser(credentials: LoginDto): Promise<UserDocument> {
    const user = await this.userService.findByEmail(credentials.email);
    if (!user || !(await user.comparePassword(credentials.password))) {
      throw new UnauthorizedException('Invalid credentials');
    } else if (user.isVerified === false) {
      throw new UnauthorizedException(
        'Email not verified - Please verify your email',
      );
    }
    await this.checkEmailVerification(user);
    return user;
  }

  private async checkEmailVerification(user: UserDocument): Promise<void> {
    if (!user.isVerified) {
      const emailSent = await this.sendVerificationEmail(
        user._id.toString(),
        user.email,
      );

      if (!emailSent) {
        throw new InternalServerErrorException(
          'Failed to send verification email',
        );
      }

      throw new UnauthorizedException(
        'Email not verified. Check your email for verification',
      );
    }
  }

  private async validateAndGetUserFromToken(
    token: string,
  ): Promise<UserDocument> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      const user = await this.userModel.findById(decoded.id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }

  private async completeEmailVerification(
    user: UserDocument,
  ): Promise<{ message: string; statusCode: number }> {
    if (user.isVerified) {
      throw new HttpException('Email already verified', HttpStatus.BAD_REQUEST);
    }

    user.isVerified = true;
    await user.save();

    return {
      message: 'Email verified successfully',
      statusCode: HttpStatus.OK,
    };
  }

  private async sendVerificationEmail(
    userId: string,
    email: string,
  ): Promise<boolean> {
    console.log('Sending verification email...');
    return this.emailVerificationService.sendEmailVerification(userId, email);
  }

  private handleLoginError(error: Error): never {
    this.logger.error(`Login error: ${error.message}`, error.stack);
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException('An unexpected error occurred');
  }

  private handleVerificationError(error: Error): never {
    this.logger.error(`Verification error: ${error.message}`, error.stack);
    if (error.name === 'TokenExpiredError') {
      throw new HttpException(
        'Verification link has expired',
        HttpStatus.BAD_REQUEST,
      );
    }
    throw new HttpException(
      'Invalid verification link',
      HttpStatus.BAD_REQUEST,
    );
  }

  async forgetPassword(
    email: string,
  ): Promise<{ message: string; statusCode: number }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const token = await this.generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const emailSent =
      await this.emailVerificationService.sendPasswordResetEmail(
        user.email,
        token,
      );

    if (!emailSent) {
      throw new InternalServerErrorException(
        'Failed to send password reset email',
      );
    }

    return {
      message: 'Password reset email sent successfully',
      statusCode: HttpStatus.OK,
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string; statusCode: number }> {
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.BAD_REQUEST);
    }

    const user = await this.validateAndGetUserFromToken(token);

    try {
      user.password = newPassword;
      await user.save();
      return {
        message: 'Password reset successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  async getUserById(userId: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(userId).select('-password');
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      this.logger.error(
        `Error fetching user by ID: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve user information',
      );
    }
  }

  async logout(response: Response): Promise<void> {
    try {
      response.clearCookie('accessToken', {
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
      });

      response.clearCookie('refreshToken', {
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
      });

      response.removeHeader('Authorization');
    } catch (error) {
      this.logger.error(`Logout error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to logout');
    }
  }

  // async getRestaurantsWithManagers() {
  //   try {
  //     const restaurants =
  //       await this.restaurantService.getRestaurantsWithManagers();
  //     return restaurants;
  //   } catch (error) {
  //     this.logger.error(
  //       `Error fetching restaurants with managers: ${error.message}`,
  //       error.stack,
  //     );
  //     throw new InternalServerErrorException(
  //       'Failed to fetch restaurants with managers',
  //     );
  //   }
  // }
}
