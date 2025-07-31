import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { User, UserSchema } from './schema/user.schema';
import { JwtAuthService } from './services/jwtService.service';
import { UserService } from './services/userService.service';
import { JwtAuthGuard } from '../../common/guards/JwtAuthGuard.guard';
import { MailService } from './services/mailService.service';
import { EmailVerificationService } from 'src/utils';
import { Algorithm } from 'jsonwebtoken';
import { mongo } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessToken.expiresIn'),
          algorithm: configService.get<string>('jwt.accessToken.algorithm') as Algorithm,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthService,
    UserService,
    JwtAuthGuard,
    EmailVerificationService,
    MailService,
  ],
  exports: [AuthService, JwtAuthService, JwtAuthGuard, UserService, MongooseModule],
})
export class AuthModule {}

