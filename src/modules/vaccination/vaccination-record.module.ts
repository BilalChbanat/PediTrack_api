import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VaccinationRecord, VaccinationRecordSchema } from './vaccination-record.schema';
import { VaccinationRecordService } from './vaccination-record.service';
import { VaccinationRecordController } from './vaccination-record.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VaccinationRecord.name, schema: VaccinationRecordSchema },
    ]),
  ],
  providers: [VaccinationRecordService],
  controllers: [VaccinationRecordController],
})
export class VaccinationRecordModule {}