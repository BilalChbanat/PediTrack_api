import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Prescription extends Document {
  @Prop({ required: true }) patientId: string;
  @Prop({ required: true }) medication: string;
  @Prop({ required: true }) dosage: string;
  @Prop({ required: true }) frequency: string;
  @Prop({ required: true }) startDate: Date;
  @Prop() endDate: Date;
  @Prop() notes: string;
  @Prop({ enum: ['Active', 'Completed', 'Cancelled'], default: 'Active' }) status: string;
  @Prop({ default: Date.now }) createdAt: Date;

}
export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
