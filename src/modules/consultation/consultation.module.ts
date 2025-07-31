import { forwardRef, Module } from "@nestjs/common";
import { AppointmentModule } from "../appointment/appointment.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Consultation, ConsultationSchema } from "./schemas/consultation.schema";
import { ConsultationController } from "./consultation.controller";
import { ConsultationService } from "./consultation.service";
import { use } from "passport";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    forwardRef(() => AppointmentModule),
    forwardRef(() => AuthModule),

    MongooseModule.forFeature([
      { name: Consultation.name, schema: ConsultationSchema },
    ]),
  ],
  controllers: [
    ConsultationController
  ],
  providers: [
    ConsultationService
  ],
})
export class ConsultationModule {}