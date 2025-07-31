import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { ConsultationService } from './consultation.service';

import { CreateConsultationDto } from './dto/reate-consultation.dto';
import { ConsultationQueryDto } from './dto/consultation-query.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';


@Controller('consultations')
// @UseGuards(JwtAuthGuard) // Add your auth guard
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  // ===== CREATE CONSULTATION =====
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Body() createConsultationDto: CreateConsultationDto,
  ) {
    return await this.consultationService.create(createConsultationDto);
  }

  // ===== GET ALL CONSULTATIONS   of  a  patient  =====
 @Get('filter/:patientId')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
async findAll(
  @Query() queryDto: ConsultationQueryDto,
  @Param('patientId') patientId: string,
) {
  return await this.consultationService.findAll(queryDto, patientId);
}

  // ===== GET CONSULTATION STATISTICS =====
  @Get('stats')
  async getStats(@Request() req: any) {
    const doctorId = req.user?.id;
    return await this.consultationService.getStats(doctorId);
  }

  // ===== SEARCH CONSULTATIONS =====
  @Get('search')
  async search(
    @Query('q') searchTerm: string,
    @Request() req: any
  ) {
    const doctorId = req.user?.id;
    return await this.consultationService.search(searchTerm, doctorId);
  }

  // ===== GET CONSULTATIONS BY PATIENT =====
  @Get('patient/:patientId')
  async findByPatient(
    @Param('patientId') patientId: string,
    @Request() req: any
  ) {
    console.log('Finding consultations for patient:', patientId);           
    return await this.consultationService.findByPatient(patientId);
  }

  

  // ===== GET SINGLE CONSULTATION =====
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: any
  ) {
    return await this.consultationService.findOne(id);
  }

  // ===== UPDATE CONSULTATION =====
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
    @Request() req: any
  ) {
    return await this.consultationService.update(id, updateConsultationDto);
  }

  // ===== DELETE CONSULTATION =====
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: any
  ) {
    await this.consultationService.remove(id);
    return { message: 'Consultation deleted successfully' };
  }
}