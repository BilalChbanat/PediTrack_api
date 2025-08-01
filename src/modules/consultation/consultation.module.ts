import { forwardRef, Module } from "@nestjs/common";
import { AppointmentModule } from "../appointment/appointment.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Consultation, ConsultationSchema } from "./schemas/consultation.schema";
import { ConsultationController } from "./consultation.controller";
import { ConsultationService } from "./consultation.service";
import { DoctorFinderService } from "./find-doctor";
import { use } from "passport";
import { AuthModule } from "../auth/auth.module";
import { User, UserSchema } from "../auth/schema/user.schema";
import { Appointment, AppointmentSchema } from "../appointment/appointment.schema";

@Module({
  imports: [
    forwardRef(() => AppointmentModule),
    forwardRef(() => AuthModule),

    MongooseModule.forFeature([
      { name: Consultation.name, schema: ConsultationSchema },
      { name: User.name, schema: UserSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  controllers: [
    ConsultationController
  ],
  providers: [
    ConsultationService,
    DoctorFinderService
  ],
})
export class ConsultationModule {}