


// =====================================
// appointment.schema.ts
// =====================================
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

// Define the appointment status enum
export const appointmentStatusEnum = [
  'pending',
  'confirmed', 
  'in-consultation',
  'completed',
  'cancelled',
  'no-show'
] as const;

export type AppointmentStatus = typeof appointmentStatusEnum[number];

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ 
    type: Types.ObjectId, 
    ref: 'Patient', 
    required: true, 
    index: true 
  })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  time: string;

  @Prop({ enum: ['consultation', 'vaccination', 'follow-up'], default: 'consultation' })
  type: string;

  @Prop()
  notes: string;

  @Prop({
    enum: appointmentStatusEnum,
    default: 'pending',
  })
  status: AppointmentStatus;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Indexes for better query performance
AppointmentSchema.index({ patientId: 1 });
AppointmentSchema.index({ doctorId: 1, date: 1 });