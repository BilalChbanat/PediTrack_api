// src/documents/documents.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';

export type DocumentDocument = Document & MongooseDocument;

@Schema({ timestamps: true })
export class Document {
  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  type: string; // Will store mimetype like 'image/jpeg', 'image/png', etc.

  // Optional: You might want to keep some file metadata
  // @Prop()
  // filename?: string;
  
  // @Prop()
  // originalName?: string;
  
  // @Prop()
  // size?: number;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);