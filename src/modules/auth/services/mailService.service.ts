// mail.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const mailConfig = this.configService.get('mail');

    this.transporter = nodemailer.createTransport({
      host: mailConfig.smtp.host,
      port: mailConfig.smtp.port,
      secure: mailConfig.smtp.secure, // true for 465, false for other ports
      auth: {
        user: mailConfig.smtp.auth.user,
        pass: mailConfig.smtp.auth.pass,
      },
    });
  }

  async send(email: string, subject: string, html: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('mail.defaults.from'),
        to: email,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}