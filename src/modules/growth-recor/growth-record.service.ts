import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GrowthRecord, GrowthRecordDocument } from './growth-record.schema';
import { CreateGrowthRecordDto } from './create-growth-record.dto';
@Injectable()
export class GrowthRecordService {
  constructor(
    @InjectModel(GrowthRecord.name) private model: Model<GrowthRecordDocument>,
  ) {}

  private calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return +((weightKg / (heightM * heightM)).toFixed(2));
  }

  async create(dto: CreateGrowthRecordDto): Promise<GrowthRecord> {
    const bmi = this.calculateBMI(dto.weightKg, dto.heightCm);
    const newRecord = new this.model({
      ...dto,
      bmi,
    });
    return newRecord.save();
  }

  async findByPatient(patientId: string): Promise<GrowthRecord[]> {
    return this.model.find({ patientId }).sort({ date: 1 }).exec();
  }

  async delete(id: string): Promise<void> {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Record not found');
  }
}
