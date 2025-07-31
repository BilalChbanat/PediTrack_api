// ===== CONSULTATION SCHEMA =====
// consultation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConsultationDocument = Consultation & Document;

@Schema({ timestamps: true })
export class Consultation {
  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  appointmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  consultationDate: Date;

  @Prop({ required: true, trim: true })
  motifConsultation: string;

  @Prop({ type: String, trim: true })
  antecedents?: string;

  @Prop({ type: String, trim: true })
  anamnese?: string;

  @Prop({ type: String, trim: true })
  examenClinique?: string;

  @Prop({ type: String, trim: true })
  cat?: string;

  @Prop({ type: String, trim: true })
  traitement?: string;

  @Prop({ type: String, enum: ['completed'], default: 'completed' })
  status: string;

  @Prop({ type: Boolean, default: false })
  isPaid: boolean;
  
}

export const ConsultationSchema = SchemaFactory.createForClass(Consultation);

// Indexes
ConsultationSchema.index({ patientId: 1, consultationDate: -1 });
ConsultationSchema.index({ doctorId: 1, consultationDate: -1 });
ConsultationSchema.index({ appointmentId: 1 });
