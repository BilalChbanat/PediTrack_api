// modules/dashboard.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientSchema } from '../patient/patient.schema';
import { AppointmentSchema } from '../appointment/appointment.schema';
import { VaccinationRecordSchema } from '../vaccination/vaccination-record.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Patient', schema: PatientSchema },
      { name: 'Appointment', schema: AppointmentSchema },
      { name: 'VaccinationRecord', schema: VaccinationRecordSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}