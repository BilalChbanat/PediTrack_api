import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { VaccinationRecordService } from './vaccination-record.service';
import { VaccinationRecord } from './vaccination-record.schema';

@Controller('vaccinations')
export class VaccinationRecordController {
  constructor(private readonly vaccinationService: VaccinationRecordService) {}

  @Post()
  create(@Body() data: Partial<VaccinationRecord>) {
    return this.vaccinationService.create(data);
  }

  @Get()
  findAll(@Query('patientId') patientId?: string) {
    return this.vaccinationService.findAll(patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vaccinationService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<VaccinationRecord>) {
    return this.vaccinationService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vaccinationService.delete(id);
  }
}
