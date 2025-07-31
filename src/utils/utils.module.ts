// import { Module } from '@nestjs/common';
// import { EmailVerificationService } from './mail/mail.service';

// import { JwtAuthService } from './../modules/auth/jwtService.service';
// import { MailService } from './../modules/auth/mailService.service';

// import { JwtModule } from '@nestjs/jwt';
// import { AuthModule } from '../modules/auth/auth.module';

// @Module({
//     imports: [
// AuthModule,
//         JwtModule.register({
//             secret: process.env.JWT_SECRET,
//             signOptions: { expiresIn: '1d' },
//         }),
//     ],
//     providers: [EmailVerificationService, JwtAuthService, MailService],
//     exports: [EmailVerificationService],
// })
// export class UtilsModule {}
