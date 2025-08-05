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
import { DoctorFinderService } from './find-doctor';

import { CreateConsultationDto } from './dto/reate-consultation.dto';
import { ConsultationQueryDto } from './dto/consultation-query.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';


@Controller('consultations')
// @UseGuards(JwtAuthGuard) // Add your auth guard
export class ConsultationController {
  constructor(
    private readonly consultationService: ConsultationService,
    private readonly doctorFinderService: DoctorFinderService
  ) {}

  // ===== SIMPLE TEST ENDPOINT =====
  @Get('ping')
  async ping() {
    return { message: 'Consultation service is working!', timestamp: new Date().toISOString() };
  }

  // ===== TEST ENDPOINT =====
  @Get('test')
  async test() {
    return { message: 'Consultation service is working', timestamp: new Date() };
  }

  // ===== DEBUG ENDPOINT =====
  @Post('debug')
  async debug(@Body() body: any, @Request() req: any) {
    return {
      receivedPayload: body,
      userFromRequest: req.user,
      headers: req.headers,
      timestamp: new Date()
    };
  }

  // ===== CREATE CONSULTATION WITH DOCTOR ID =====
  @Post('with-doctor')
  async createWithDoctor(@Body() body: any) {
    // Accept the exact payload from frontend including doctorId
    const { doctorId, ...consultationData } = body;
    
    // Use the doctorId from payload or create a default one
    const finalDoctorId = doctorId || await this.doctorFinderService.createDefaultDoctorIfNotExists();
    
    return await this.consultationService.create(consultationData, finalDoctorId);
  }

  // ===== CREATE OR UPDATE CONSULTATION =====
  @Post('create-or-update')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createOrUpdate(
    @Body() createConsultationDto: CreateConsultationDto,
    @Request() req: any
  ) {
    let doctorId = req.user?.id;
    
    // If no authenticated user, find or create a default doctor
    if (!doctorId) {
      doctorId = await this.doctorFinderService.createDefaultDoctorIfNotExists();
    }
    
    // Remove doctorId and consultationDate from payload if they exist (for security)
    const { doctorId: payloadDoctorId, consultationDate: payloadConsultationDate, ...cleanPayload } = createConsultationDto as any;
    
    // Check if consultation already exists for this appointment
    const existingConsultation = await this.consultationService.findByAppointment(cleanPayload.appointmentId);
    
    if (existingConsultation) {
      // Update existing consultation
      return await this.consultationService.update(existingConsultation._id.toString(), cleanPayload, doctorId);
    } else {
      // Create new consultation
      return await this.consultationService.create(cleanPayload, doctorId);
    }
  }

  // ===== CREATE CONSULTATION (TEMP - FOR TESTING) =====
  @Post('temp')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createTemp(
    @Body() createConsultationDto: CreateConsultationDto,
  ) {
    // Remove doctorId from payload if it exists
    const { doctorId: payloadDoctorId, ...cleanPayload } = createConsultationDto as any;
    
    // For testing purposes, find or create a default doctor
    const doctorId = await this.doctorFinderService.createDefaultDoctorIfNotExists();
    return await this.consultationService.create(cleanPayload, doctorId);
  }

  // ===== CREATE CONSULTATION =====
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Body() createConsultationDto: CreateConsultationDto,
    @Request() req: any
  ) {
    // Extract doctorId from session, ignore if sent in payload
    let doctorId = req.user?.id;
    
    // If no authenticated user, find or create a default doctor
    if (!doctorId) {
      doctorId = await this.doctorFinderService.createDefaultDoctorIfNotExists();
    }
    
    // Remove doctorId and consultationDate from payload if they exist (for security)
    const { doctorId: payloadDoctorId, consultationDate: payloadConsultationDate, ...cleanPayload } = createConsultationDto as any;
    
    return await this.consultationService.create(cleanPayload, doctorId);
  }

  // ===== GET ALL CONSULTATIONS =====
  @Get()
  async getAllConsultations(@Request() req: any) {
    const doctorId = req.user?.id;
    // If no authenticated user, don't filter by doctor
    const filter = doctorId ? { doctorId } : {};
    
    return await this.consultationService.findAllConsultations(filter);
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

  // ===== GET ALL CONSULTATIONS OF A PATIENT =====
  @Get('filter/:patientId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findAll(
    @Query() queryDto: ConsultationQueryDto,
    @Param('patientId') patientId: string,
    @Request() req: any
  ) {
    const doctorId = req.user?.id;
    return await this.consultationService.findAll(queryDto, patientId, doctorId);
  }

  // ===== GET CONSULTATIONS BY PATIENT =====
  @Get('patient/:patientId')
  async findByPatient(
    @Param('patientId') patientId: string,
    @Request() req: any
  ) {
    console.log('Finding consultations for patient:', patientId);           
    const doctorId = req.user?.id;
    return await this.consultationService.findByPatient(patientId, doctorId);
  }

  // ===== GET ALL CONSULTATIONS BY PATIENT ID (ENHANCED) =====
  @Get('by-patient/:patientId')
  async getAllConsultationsByPatient(
    @Param('patientId') patientId: string,
    @Request() req: any
  ) {
    console.log('Getting all consultations for patient:', patientId);
    const doctorId = req.user?.id;
    
    // Get consultations with full population
    const consultations = await this.consultationService.findAllConsultationsByPatient(patientId, doctorId);
    
    return {
      patientId,
      totalConsultations: consultations.length,
      consultations
    };
  }

  // ===== GET ALL CONSULTATIONS BY PATIENT ID (NO AUTH) =====
  @Get('patient-all/:patientId')
  async getAllConsultationsByPatientNoAuth(
    @Param('patientId') patientId: string
  ) {
    console.log('Getting all consultations for patient (no auth):', patientId);
    
    // Get all consultations for patient without doctor filter
    const consultations = await this.consultationService.findAllConsultationsByPatient(patientId);
    
    return {
      patientId,
      totalConsultations: consultations.length,
      consultations
    };
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
    const doctorId = req.user?.id;
    return await this.consultationService.update(id, updateConsultationDto, doctorId);
  }

  // ===== DELETE CONSULTATION =====
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const doctorId = req.user?.id;
    await this.consultationService.remove(id, doctorId);
    return { message: 'Consultation deleted successfully' };
  }
}