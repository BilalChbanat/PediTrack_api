import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prescription } from './prescription.schema';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { UpdatePrescriptionDto } from './update-prescription.dto';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectModel(Prescription.name) private prescriptionModel: Model<Prescription>,
  ) {}

  async create(dto: CreatePrescriptionDto): Promise<Prescription> {
    return new this.prescriptionModel(dto).save();
  }

  async findByPatient(patientId: string): Promise<Prescription[]> {
    return this.prescriptionModel.find({ patientId }).sort({ startDate: -1 }).exec();
  }

  async update(id: string, dto: UpdatePrescriptionDto): Promise<Prescription> {
    const updated = await this.prescriptionModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Prescription not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.prescriptionModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Prescription not found');
  }
}
