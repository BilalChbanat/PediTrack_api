import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Consultation, ConsultationDocument } from './schemas/consultation.schema';
import { Appointment, AppointmentDocument } from '../appointment/appointment.schema';

import { ConsultationQueryDto } from './dto/consultation-query.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { CreateConsultationDto } from './dto/reate-consultation.dto';
import { User, UserDocument } from '../auth/schema/user.schema';

@Injectable()
export class ConsultationService {
  private doctorId: string | null = null;

  constructor(
    @InjectModel(Consultation.name) private consultationModel: Model<ConsultationDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {
    this.initializeDoctor();
  }
  

  private async initializeDoctor() {
    // Find the first user with doctor role
    const doctor = await this.userModel.findOne({ role: 'doctor' }).exec();
    if (!doctor) {
      throw new Error('No doctor found in the system');
    }
    this.doctorId = doctor._id.toString();
  }

  async create(createConsultationDto: CreateConsultationDto): Promise<Consultation> {
    if (!this.doctorId) {
      throw new NotFoundException('Doctor not available');
    }

    const { patientId, appointmentId: dtoAppointmentId } = createConsultationDto;
    let appointmentId = dtoAppointmentId;
    let appointment: AppointmentDocument | null = null;

    if (appointmentId) {
      appointment = await this.appointmentModel.findById(appointmentId);
      if (!appointment) throw new NotFoundException('Appointment not found');
    } else {
      // Find today's latest confirmed appointment for patient
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      appointment = await this.appointmentModel
        .findOne({
          patientId,
          date: { $gte: startOfDay, $lt: endOfDay },
          status: 'confirmed'
        })
        .sort({ time: -1 })
        .exec();

      if (!appointment) {
        throw new NotFoundException(
          'No appointment found for this patient today. Please specify appointmentId.'
        );
      }
      appointmentId = appointment._id.toString();
    }

    // Check if consultation already exists for this appointment
    const existingConsultation = await this.consultationModel.findOne({ appointmentId });
    if (existingConsultation) {
      throw new BadRequestException('Consultation already exists for this appointment');
    }

    // Create consultation
    const consultation = new this.consultationModel({
      ...createConsultationDto,
      appointmentId,
      patientId: appointment.patientId,
      doctorId: this.doctorId, // Always use the single doctor
      consultationDate:  new Date()
    });

    // Update appointment status to completed
    await this.appointmentModel.findByIdAndUpdate(appointmentId, { status: 'completed' });

    return consultation.save();
  }

  // ===== GET ALL CONSULTATIONS WITH FILTERING =====

async findAll(queryDto: ConsultationQueryDto, patientId: string): Promise<any> {
    const { page = 1, limit = 10, startDate, endDate, search, sortOrder = 'desc' } = queryDto;
    
    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new BadRequestException('End date must be after start date');
    }

    const filter: any = { patientId };

    // Date range filter
    if (startDate && endDate) {
        filter.consultationDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    } else if (startDate) {
        filter.consultationDate = { $gte: new Date(startDate) };
    } else if (endDate) {
        filter.consultationDate = { $lte: new Date(endDate) };
    }

    // Search across relevant text fields
    if (search) {
        filter.$or = [
            { motifConsultation: { $regex: search, $options: 'i' } },
            { antecedents: { $regex: search, $options: 'i' } },
            { anamnese: { $regex: search, $options: 'i' } },
            { examenClinique: { $regex: search, $options: 'i' } },
            { cat: { $regex: search, $options: 'i' } },
            { traitement: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [consultations, total] = await Promise.all([
        this.consultationModel
            .find(filter)
            .populate('patientId', 'firstName lastName gender birthDate')
            .populate('doctorId', 'fullName email')
            .populate('appointmentId', 'date time type status')
            .sort({ consultationDate: sortDirection })
            .skip(skip)
            .limit(limit)
            .exec(),
        this.consultationModel.countDocuments(filter)
    ]);

    return {
        consultations,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}
  // ===== GET SINGLE CONSULTATION =====
 async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid consultation ID');
    }

    return this.consultationModel.findById(id)
      .populate('patient', 'firstName lastName gender birthDate')
      .populate('doctor', 'fullName email')
      .populate('appointment', 'date time type status')
      .exec();
  }

  // ===== GET CONSULTATIONS BY PATIENT =====
  async findByPatient(patientId: string): Promise<Consultation[]> {
    const filter: any = { patientId };
    if (!patientId) {
      throw new BadRequestException('Patient ID is required');
    }
    return await this.consultationModel
      .find(filter)
      .populate('patientId', 'firstName lastName')
      .populate('appointmentId', 'date time type')
      .sort({ consultationDate: -1 })
      .exec();
  }

 
  // ===== UPDATE CONSULTATION =====
  async update(id: string, updateConsultationDto: UpdateConsultationDto): Promise<Consultation> {
    // Ensure doctor can only update their own consultations
    const consultation = await this.consultationModel.findOne({ _id: id });
    if (!consultation) {
      throw new NotFoundException('Consultation not found or you do not have permission to update it');
    }

    const updatedConsultation = await this.consultationModel
      .findByIdAndUpdate(id, updateConsultationDto, { new: true })
      .populate('patientId', 'firstName lastName gender birthDate')
      .populate('doctorId', 'fullName email')
      .populate('appointmentId', 'date time type')
      .exec();
      
    return updatedConsultation;
  }

  // ===== DELETE CONSULTATION =====
async remove(id: string): Promise<void> {
    if (!isValidObjectId(id)) {
        throw new BadRequestException('Invalid consultation ID');
    }

    const consultation = await this.consultationModel.findById(id);
    if (!consultation) {
        throw new NotFoundException('Consultation not found or you do not have permission to delete it');
    }

    // Revert appointment status back to confirmed if appointment exists
    if (consultation.appointmentId) {
        await this.appointmentModel.findByIdAndUpdate(
            consultation.appointmentId,
            { status: 'confirmed' }
        );
    }

    await this.consultationModel.findByIdAndDelete(id);
}

  // ===== CONSULTATION STATISTICS =====
  async getStats(doctorId?: string) {
    const match = doctorId ? { doctorId } : {};
    
    const [totalConsultations, todayConsultations, monthlyStats] = await Promise.all([
      // Total consultations
      this.consultationModel.countDocuments(match),
      
      // Today's consultations
      this.consultationModel.countDocuments({
        ...match,
        consultationDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      
      // Monthly stats
      this.consultationModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              year: { $year: '$consultationDate' },
              month: { $month: '$consultationDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    return {
      totalConsultations,
      todayConsultations,
      monthlyStats
    };
  }

  // ===== SEARCH CONSULTATIONS =====
  async search(searchTerm: string, doctorId?: string) {
    const filter: any = {
      $or: [
        { motifConsultation: { $regex: searchTerm, $options: 'i' } },
        { antecedents: { $regex: searchTerm, $options: 'i' } },
        { anamnese: { $regex: searchTerm, $options: 'i' } },
        { examenClinique: { $regex: searchTerm, $options: 'i' } },
        { cat: { $regex: searchTerm, $options: 'i' } },
        { traitement: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    if (doctorId) filter.doctorId = doctorId;

    return await this.consultationModel
      .find(filter)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'fullName')
      .sort({ consultationDate: -1 })
      .limit(50)
      .exec();
  }
}