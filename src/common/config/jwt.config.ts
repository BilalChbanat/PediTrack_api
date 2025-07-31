import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'super-secret-key',
  accessToken: {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
    // You can add more access token specific configurations
    algorithm: 'HS256',
  },
  refreshToken: {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    // You can add more refresh token specific configurations
    algorithm: 'HS256',
  },
  verificationToken: {
    expiresIn: process.env.JWT_VERIFICATION_EXPIRATION || '24h',
  },
  passwordResetToken: {
    expiresIn: process.env.JWT_RESET_EXPIRATION || '1h',
  },
}));
