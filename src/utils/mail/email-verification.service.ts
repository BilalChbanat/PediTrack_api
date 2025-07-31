import { Injectable } from '@nestjs/common';
import { JwtAuthService } from 'src/modules/auth/services/jwtService.service';
import { MailService } from 'src/modules/auth/services/mailService.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly jwtService: JwtAuthService,
    private readonly mailService: MailService,
  ) {}

  async sendEmailVerification(id: string, email: string): Promise<boolean> {
    try {
      const token = this.jwtService.generateToken({ id }, 'verification');
      const baseUrl = process.env.FRONT_APP_HOST.startsWith('http')
        ? process.env.FRONT_APP_HOST
        : `https://${process.env.FRONT_APP_HOST}`;

      // Use URL parameter for the token
      const link = `${baseUrl}/verify-email/${token}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            .container {
              padding: 20px;
              max-width: 600px;
              margin: 0 auto;
              font-family: Arial, sans-serif;
            }
            .button {
              background-color: #4CAF50;
              border: none;
              color: white !important;
              padding: 15px 32px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
              border-radius: 4px;
            }
            a {
              color: #4CAF50;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Email Verification</h1>
            <p>Please click the button below to verify your email address:</p>
            <a href="${link}" class="button">Verify Email</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <a href="${link}">${link}</a>
          </div>
        </body>
        </html>
      `;

      const isSent = await this.mailService.send(
        email,
        'Email Verification',
        htmlContent,
      );

      if (!isSent) {
        console.error('Email sending failed');
        return false;
      }

      console.log('Email sent successfully');
      return true;
    } catch (error) {
      console.error('Email verification error:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    try {
      const baseUrl = process.env.FRONT_APP_HOST.startsWith('http')
        ? process.env.FRONT_APP_HOST
        : `https://${process.env.FRONT_APP_HOST}`;
      // Use URL parameter for the token in password reset as well
      const link = `${baseUrl}/auth/reset-password?token=${token}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            .container {
              padding: 20px;
              max-width: 600px;
              margin: 0 auto;
              font-family: Arial, sans-serif;
            }
            .button {
              background-color: #4CAF50;
              border: none;
              color: white !important;
              padding: 15px 32px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
              border-radius: 4px;
            }
            a {
              color: #4CAF50;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Password Reset</h1>
            <p>Please click the button below to reset your password:</p>
            <a href="${link}" class="button">Reset Password</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <a href="${link}">${link}</a>
          </div>
        </body>
        </html>
      `;

      const isSent = await this.mailService.send(
        email,
        'Password Reset',
        htmlContent,
      );

      if (!isSent) {
        console.error('Email sending failed');
        return false;
      }

      console.log('Email sent successfully');
      return true;
    } catch (error) {
      console.error('Password reset email sending error:', error);
      return false;
    }
  }
}
