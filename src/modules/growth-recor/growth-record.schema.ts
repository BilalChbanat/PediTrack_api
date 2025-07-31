import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GrowthRecordDocument = GrowthRecord & Document;

@Schema({ timestamps: true })
export class GrowthRecord {
  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  heightCm: number;

  @Prop({ required: true })
  weightKg: number;

  @Prop({ required: true })
  bmi: number;

  @Prop({ required: true })
  date: Date;

  @Prop()
  headCircumferenceCm?: number;
}
export const GrowthRecordSchema = SchemaFactory.createForClass(GrowthRecord);