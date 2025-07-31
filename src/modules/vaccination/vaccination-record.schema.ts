import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VaccinationRecordDocument = VaccinationRecord & Document;

@Schema({ timestamps: true })
export class VaccinationRecord {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true })
  vaccine: string;

  @Prop()
  dateAdministered?: Date;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ enum: ['done', 'pending'], default: 'pending' })
  status: 'done' | 'pending';

  @Prop({ default: false })
  notified: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  administeredBy?: Types.ObjectId;
}

export const VaccinationRecordSchema = SchemaFactory.createForClass(VaccinationRecord);
