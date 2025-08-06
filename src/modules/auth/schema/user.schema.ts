// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

// Define interface for methods
interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: [true, 'Full name is required'] })
  fullName: string;

  @Prop({ required: false, unique: true, sparse: true })
  email?: string;

  @Prop({
    required: [false, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
  })
  password?: string;

  @Prop({
    required: [true, 'Role is required'],
    enum: ['admin', 'doctor', 'parent'],
    default: 'doctor',
  })
  role: string;

  @Prop({ required: [false, 'Address is required'] })
  address?: string;

    @Prop({
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true,
      // Added validation for international phone number format
      validate: {
        validator: function (v: string) {
          return /^\+[1-9]\d{1,14}$/.test(v);
        },
        message: (props) =>
          'Phone number must be in international format (e.g., +1234567890)',
      },
    })
    phoneNumber: string;


    @Prop()
    insurance?: string;

  @Prop({ default: false })
  isVerified: boolean;
}

export type UserDocument = User & Document & UserMethods;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};
