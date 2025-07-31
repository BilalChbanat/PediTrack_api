// user.interface.ts
import { Document } from 'mongoose';

export interface User extends Document {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: string;
  isVerified: boolean;
  loginHistory: {
    history: LoginHistory[];
    lastLogin: Date;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}
export interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}
export interface LoginHistory {
  fingerprint: string;
  location: string;
}
