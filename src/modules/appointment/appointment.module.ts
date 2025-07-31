// appointment.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { Appointment, AppointmentSchema } from './appointment.schema';
import { Patient, PatientSchema } from '../patient/patient.schema';
import { User, UserSchema } from '../auth/schema/user.schema';
import { PatientDocument } from '../patient/patient.schema';
import { ConsultationModule } from '../consultation/consultation.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => ConsultationModule),
  ],

  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [MongooseModule], 

})
export class AppointmentModule {}
