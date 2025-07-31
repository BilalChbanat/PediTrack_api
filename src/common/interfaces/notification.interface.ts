import { Document, Types } from 'mongoose';

export interface Notification extends Document {
  userId: Types.ObjectId;
  message: string;
  type: string;
  orderId?: Types.ObjectId;
  read: boolean;
  createdAt: Date;
}