// // src/mail/mail.module.ts
// import { Module, forwardRef } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { EmailVerificationService } from './mail.service';
// import { AuthModule } from '../../modules/auth/auth.module';
// import { MailService } from '../../modules/auth/mailService.service';

// @Module({
//   imports: [
//     ConfigModule,
//     forwardRef(() => AuthModule), // Use forwardRef to handle circular dependency
//   ],
//   providers: [MailService, EmailVerificationService],
//   exports: [MailService, EmailVerificationService],
// })
// export class MailModule {}
