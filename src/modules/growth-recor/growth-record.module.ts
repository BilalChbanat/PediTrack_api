import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GrowthRecordController } from './growth-record.controller';
import { GrowthRecordService } from './growth-record.service';
import { GrowthRecord, GrowthRecordSchema } from './growth-record.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GrowthRecord.name, schema: GrowthRecordSchema },
    ]),
  ],
  controllers: [GrowthRecordController],
  providers: [GrowthRecordService],
})
export class GrowthRecordModule {}
