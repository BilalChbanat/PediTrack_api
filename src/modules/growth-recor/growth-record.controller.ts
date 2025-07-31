import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { GrowthRecordService } from './growth-record.service';
import { CreateGrowthRecordDto } from './create-growth-record.dto';


@Controller('growth-records')
export class GrowthRecordController {
  constructor(private readonly service: GrowthRecordService) {}

  @Post()
  create(@Body() dto: CreateGrowthRecordDto) {
    return this.service.create(dto);
  }

  @Get(':patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.service.findByPatient(patientId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
