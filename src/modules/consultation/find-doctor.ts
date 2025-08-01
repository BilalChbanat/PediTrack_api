import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schema/user.schema';

@Injectable()
export class DoctorFinderService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async findFirstDoctor(): Promise<string | null> {
    const doctor = await this.userModel.findOne({ role: 'doctor' }).exec();
    return doctor ? doctor._id.toString() : null;
  }

  async createDefaultDoctorIfNotExists(): Promise<string> {
    // Check if any doctor exists
    const existingDoctor = await this.userModel.findOne({ role: 'doctor' }).exec();
    
    if (existingDoctor) {
      return existingDoctor._id.toString();
    }

    // Create a default doctor if none exists
    const defaultDoctor = new this.userModel({
      fullName: 'Dr. Default Doctor',
      email: 'doctor@default.com',
      password: 'defaultpassword', // This should be hashed in production
      role: 'doctor',
      isEmailVerified: true,
      isActive: true
    });

    const savedDoctor = await defaultDoctor.save();
    return savedDoctor._id.toString();
  }
} 