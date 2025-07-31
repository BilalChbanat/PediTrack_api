// appointment.service.ts
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from './appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import * as moment from 'moment';
import { Patient, PatientDocument } from '../patient/patient.schema';
import { User } from '../auth/schema/user.schema';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(User.name) private usertModel: Model<User>,
  ) {}

async create(dto: CreateAppointmentDto) {
  console.log('Creating appointment with data:', dto);
  
  // Check appointment is in future
  const appointmentDateTime = moment(`${dto.date}T${dto.time}`);
  if (appointmentDateTime.isBefore(moment())) {
    
    throw new BadRequestException('Appointment must be in the future');
  }

  // Find a doctor - handle case where none exists
  const doctor = await this.usertModel.findOne({ role: 'doctor' });
  console.log('first finding doctor', doctor);
  if (!doctor) {
    throw new BadRequestException('No available doctors found');
  }
  console.log('Doctor found:', doctor._id);

  // Check for existing appointments
  const existing = await this.appointmentModel.findOne({
    doctorId: doctor._id,
    date: dto.date,
    time: dto.time,
    status: { $ne: 'cancelled' },
  });

  if (existing) {
    throw new BadRequestException('This time slot is already booked');
  }

  // Create appointment
  return this.appointmentModel.create({
    ...dto,
    doctorId: doctor._id,
    status: 'confirmed',
  });
}

  // GET all appointments for the current doctor
  async findAllForDoctor() {
    return this.appointmentModel.find().sort({ date: 1, time: 1 });
  }

  // GET appointment by ID
  async findById(id: string) {
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  // UPDATE appointment (notes, status, etc.)
  async update(id: string, dto: UpdateAppointmentDto) {
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');

    Object.assign(appointment, dto);
    return appointment.save();
  }

  // CANCEL appointment
  async cancel(id: string) {
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');

    await this.appointmentModel.deleteOne({ _id: id });
    return { message: 'Appointment deleted successfully' };
  }

  // MARK as completed
  async complete(id: string) {
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');
    appointment.status = 'completed';
    return appointment.save();
  }

  // List available time slots for a specific day (optional helper)
  async getAvailableSlots(date: string) {
    const existing = await this.appointmentModel.find({
      date,
      status: { $ne: 'cancelled' },
    });
    const takenSlots = new Set(existing.map((a) => a.time));

    const allSlots = [
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
    ];

    return allSlots.filter((slot) => !takenSlots.has(slot));
  }
}
