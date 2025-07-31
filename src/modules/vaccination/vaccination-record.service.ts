import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { VaccinationRecord, VaccinationRecordDocument } from './vaccination-record.schema';
import { Model } from 'mongoose';

@Injectable()
export class VaccinationRecordService {
  constructor(
    @InjectModel(VaccinationRecord.name)
    private vaccinationModel: Model<VaccinationRecordDocument>,
  ) {}

  create(data: Partial<VaccinationRecord>) {
    return this.vaccinationModel.create(data);
  }

  findAll(patientId?: string) {
    if (patientId) {
      return this.vaccinationModel.find({ patientId }).sort({ dueDate: 1 }).exec();
    }
    return this.vaccinationModel.find().sort({ dueDate: 1 }).exec();
  }

  findOne(id: string) {
    return this.vaccinationModel.findById(id).exec();
  }

  update(id: string, updateData: Partial<VaccinationRecord>) {
    return this.vaccinationModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  delete(id: string) {
    return this.vaccinationModel.findByIdAndDelete(id).exec();
  }

  // Pour le cron job : vaccins à rappeler
  async findUpcomingDueVaccinations(daysAhead: number = 3) {
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(now.getDate() + daysAhead);

    return this.vaccinationModel.find({
      status: 'pending',
      notified: false,
      dueDate: { $gte: now, $lte: maxDate },
    }).exec();
  }
}
