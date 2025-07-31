


// =====================================
// appointment.schema.ts
// =====================================
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

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
    enum: ['confirmed', 'cancelled', 'completed', 'pending'],
    default: 'pending',
  })
  status: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Indexes for better query performance
AppointmentSchema.index({ patientId: 1 });
AppointmentSchema.index({ doctorId: 1, date: 1 });