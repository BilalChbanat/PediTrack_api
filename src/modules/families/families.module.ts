// src/families/families.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamiliesController } from './families.controller';
import { Family, FamilySchema } from './schemas/family.schema';
import { PatientSchema } from '../patient/patient.schema';
import { UserSchema } from '../auth/schema/user.schema';
import { FamiliesService } from './familes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Family.name, schema: FamilySchema },
      { name: 'User', schema: UserSchema },
      { name: 'Patient', schema: PatientSchema },
    ]),
  ],
  controllers: [FamiliesController],
  providers: [FamiliesService],
  exports: [FamiliesService],
   // Export if other modules need to use this service
})
export class FamiliesModule {}
     