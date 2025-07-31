// config/mail.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  smtp: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  },
  defaults: {
    from: process.env.MAIL_FROM || 'noreply@yourapp.com',
  },
  templates: {
    dir: process.env.MAIL_TEMPLATES_DIR || 'templates/email',
  },
  preview: process.env.MAIL_PREVIEW === 'true',
}));
