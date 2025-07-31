import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { UpdatePrescriptionDto } from './update-prescription.dto';

@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly service: PrescriptionService) {}

  @Post()
  create(@Body() dto: CreatePrescriptionDto) {
    return this.service.create(dto);
  }

  @Get(':patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.service.findByPatient(patientId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePrescriptionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
