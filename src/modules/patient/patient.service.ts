// ====================
// 3. Patient Service (patient.service.ts)
// ====================
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Patient, PatientDocument } from './patient.schema';
import {
  CreatePatientDto,
  PatientQueryDto,
  UpdatePatientDto,
} from './patient.dto';
import { User, UserDocument } from '../auth/schema/user.schema';
import { Appointment } from '../appointment/appointment.schema';
import { AppointmentModule } from '../appointment/appointment.module';
import e from 'express';

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<AppointmentModule>,
  ) {}

  async create(createPatientDto): Promise<Patient> {
  
    try {
      // Check if patient already exists (same name, birth date, and parent)
      const existingPatient = await this.patientModel.findOne({
        firstName: { $regex: new RegExp(createPatientDto.firstName, 'i') },
        lastName: { $regex: new RegExp(createPatientDto.lastName, 'i') },
        birthDate: createPatientDto.birthDate,
        // parentId: new Types.ObjectId(createPatientDto.parentId),
      });

      if (existingPatient) {
        // Patient already exists, return it
        return existingPatient;
      }

      let parentId = createPatientDto.parentId;

      // If parentId is not provided, create a new parent
      if (!parentId && (createPatientDto.fullName || createPatientDto.email || createPatientDto.phoneNumber)) {
        const parent = await this.userModel.create({
          fullName: createPatientDto.fullName,
          email: createPatientDto.email,
          phoneNumber: createPatientDto.phoneNumber,
          role: 'parent',
          isVerified: true,
          insurance: createPatientDto.insurance,
          // Optional: Add default address if not provided
          address: '',
        });
        parentId = parent._id;
      }

      const doctor = await this.userModel.findOne({ role: 'doctor' });
      if (!doctor) {
        throw new NotFoundException('No doctor found in the system');
      }

      const patient = new this.patientModel({
        ...createPatientDto,
        parentId,
        doctorId: doctor._id,
      });

      return await patient.save();
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(`Validation failed: ${error.message}`);
      }
      throw error;
    }
  }




  
  async createParent(
    createPatientDto
  ): Promise<UserDocument> {
    try {

      const insurance = createPatientDto.insurance;
      const existingParent = await this.userModel.findOne({
        email: createPatientDto.email,
        role: 'parent',
      });

      if (existingParent) {
        throw new ConflictException('Parent with this email already exists');
      }

      const parent = new this.userModel({
        fullName: createPatientDto.fullName,
        email: createPatientDto.email,
        phoneNumber: createPatientDto.phoneNumber,
        insurance:  insurance,
        role: 'parent',
        isVerified: true,
        address: '',
      });

      return await parent.save();
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(`Validation failed: ${error.message}`);
      }
      throw error;
    }
  }



  // getParent
  async getParent(): Promise<UserDocument[]> {
    try {
      return await this.userModel.find({ role: 'parent' });
    } catch (error) {
      console.error('Error fetching parents:', error);
      throw new InternalServerErrorException('Failed to retrieve parents');
    }
  }


//   async findAll() {
//   try {
//     // Method 1: Using aggregation with proper ObjectId conversion + parent join
//     const patients = await this.patientModel.aggregate([
//       {
//         $lookup: {
//           from: 'appointments', // Make sure this matches your collection name exactly
//           let: { patientId: '$_id' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $or: [
//                     // Handle case where patientId is ObjectId
//                     { $eq: ['$patientId', '$$patientId'] },
//                     // Handle case where patientId is string
//                     { $eq: ['$patientId', { $toString: '$$patientId' }] },
//                     // Handle case where patientId needs to be converted to ObjectId
//                     { $eq: [{ $toObjectId: '$patientId' }, '$$patientId'] }
//                   ]
//                 }
//               }
//             }
//           ],
//           as: 'appointments',
//         },
//       },
//       {
//         $lookup: {
//           from: 'users', // Join with users collection to get parent info
//           localField: 'parentId',
//           foreignField: '_id',
//           as: 'parent',
//         },
//       },
//       {
//         $addFields: {
//           appointments: {
//             $ifNull: ['$appointments', []],
//           },
//           appointmentCount: { $size: { $ifNull: ['$appointments', []] } },
//           parent: { $arrayElemAt: ['$parent', 0] }, // Convert parent array to single object
//         },
//       },
//     ]);
//     return patients;
//   } catch (error) {
//     console.error('Aggregation error:', error);
//     throw new NotFoundException(`No patients found: ${error.message}`);
//   }
// }

async findAll() {
  try {
    const patients = await this.patientModel.aggregate([
      {
      $lookup: {
        from: 'appointments',
        let: { patientId: '$_id' },
        pipeline: [
        {
          $match: {
          $expr: {
            $or: [
            // ObjectId-to-ObjectId match
            { $eq: ['$patientId', '$$patientId'] },
            // String-to-string match
            { $eq: ['$patientId', { $toString: '$$patientId' }] },
            // ObjectId-to-string match
            { $eq: [{ $toString: '$patientId' }, { $toString: '$$patientId' }] },
            // String-to-ObjectId match (if possible)
            { $eq: [{ $toObjectId: '$patientId' }, '$$patientId'] }
            ]
          }
          }
        }
        ],
        as: 'appointments',
      },
      },
      {
      $lookup: {
        from: 'users',
        let: { parentId: '$parentId' },
        pipeline: [
        {
          $match: {
          $expr: {
            $or: [
            { $eq: ['$_id', '$$parentId'] },
            { $eq: [{ $toString: '$_id' }, { $toString: '$$parentId' }] },
            { $eq: ['$_id', { $toObjectId: '$$parentId' }] }
            ]
          }
          }
        }
        ],
        as: 'parent',
      },
      },
      {
      $addFields: {
        appointments: { $ifNull: ['$appointments', []] },
        appointmentCount: { $size: { $ifNull: ['$appointments', []] } },
        parent: { $arrayElemAt: ['$parent', 0] },
      },
      },
    ]);
    return patients;
  } catch (error) {
    console.error('Aggregation error:', error);
    throw new NotFoundException(`No patients found: ${error.message}`);
  }
}

  async findOne(
    id: string,
    // userId: string,
    // userRole: string,
  ): Promise<Patient> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid patient ID format');
    }

    const filter: any = { _id: new Types.ObjectId(id) };

    // Role-based filtering
    // if (userRole === 'doctor') {
    //   filter.doctorId = new Types.ObjectId(userId);
    // }

    const patient = await this.patientModel
      .findOne(filter)
      .populate('parentId', 'name email phone')
      .populate('doctorId', 'name email')
      .populate('growthCurveId')
      .lean();

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async update(
    id: string,
    updatePatientDto: any,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid patient ID format');
    }

    // Check if patient exists
    const existingPatient = await this.patientModel.findById(id);
    if (!existingPatient) {
      throw new NotFoundException('Patient not found');
    }

    // Check for duplicate patient (same name, birth date, and parent)
    const duplicatePatient = await this.patientModel.findOne({
      _id: { $ne: id },
      firstName: { $regex: new RegExp(updatePatientDto.firstName, 'i') },
      lastName: { $regex: new RegExp(updatePatientDto.lastName, 'i') },
      birthDate: updatePatientDto.birthDate,
      // parentId: updatePatientDto.parentId ? new Types.ObjectId(updatePatientDto.parentId) : existingPatient.parentId,
    });
    if (duplicatePatient) {
      throw new ConflictException(
        'A patient with the same name, birth date, and parent already exists',
      );
    }

    // If parent info is being updated, update the parent user as well
    if (
      updatePatientDto.fullName ||
      updatePatientDto.email ||
      updatePatientDto.phoneNumber
    ) {
      await this.userModel.findByIdAndUpdate(
        existingPatient.parentId,
        {
          ...(updatePatientDto.fullName && { fullName: updatePatientDto.fullName }),
          ...(updatePatientDto.email && { email: updatePatientDto.email }),
          ...(updatePatientDto.phoneNumber && { phoneNumber: updatePatientDto.phoneNumber }),
        },
        { new: true },
      );
    }

  
     let doctorId = existingPatient.doctorId;
    

    // Prepare update data
    const updateData: any = {
      ...updatePatientDto,
      doctorId,
    };

    // Convert string IDs to ObjectIds if present
    if (updateData.parentId) {
      updateData.parentId = new Types.ObjectId(updateData.parentId);
    }
    if (updateData.doctorId) {
      updateData.doctorId = new Types.ObjectId(updateData.doctorId);
    }
    if (updateData.growthCurveId) {
      updateData.growthCurveId = new Types.ObjectId(updateData.growthCurveId);
    }

    try {
      const updatedPatient = await this.patientModel
        .findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        })
        .populate('parentId', 'fullName email phoneNumber')
        .populate('doctorId', 'fullName email')
        .lean();

      return updatedPatient;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(`Validation failed: ${error.message}`);
      }
      throw error;
    }
  }

  async remove(
    patientId:any,
    // userId: string,
    // userRole: string,
  ): Promise<{ message: string }> {

    console.log('Removing patient with ID:', patientId);
    // if (!Types.ObjectId.isValid(patientId)) {
    //   throw new BadRequestException('Invalid patient ID format');
    // }


    // Role-based filtering
   

    const patient = await this.patientModel.deleteOne({ _id: patientId });
    console.log('Found patient:', patient);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // // Soft delete by adding deletedAt field
    // await this.patientModel.findByIdAndUpdate(patientId, {
    //   deletedAt: new Date(),
    //   isActive: false,
    // });

    return { message: 'Patient successfully deleted' };
  }

  // Additional utility methods
  async getPatientsByParent(parentId: string): Promise<Patient[]> {
    if (!Types.ObjectId.isValid(parentId)) {
      throw new BadRequestException('Invalid parent ID format');
    }

    return await this.patientModel
      .find({ parentId: new Types.ObjectId(parentId) })
      .populate('doctorId', 'name email')
      .lean();
  }

  async getPatientsByDoctor(
    doctorId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    patients: Patient[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    if (!Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException('Invalid doctor ID format');
    }

    const skip = (page - 1) * limit;
    const filter = { doctorId: new Types.ObjectId(doctorId) };

    const [patients, total] = await Promise.all([
      this.patientModel
        .find(filter)
        .populate('parentId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.patientModel.countDocuments(filter),
    ]);

    return {
      patients,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
