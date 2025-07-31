
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
  Req,
  HttpStatus,
  HttpCode,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/JwtAuthGuard.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PatientService } from './patient.service';
import {
  CreatePatientDto,
  PatientQueryDto,
  UpdatePatientDto,
} from './patient.dto';

@ApiTags('Patients')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('doctor', 'assistant')
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()

  async create(@Body() createPatientDto, @Req() req: any) {
    return await this.patientService.create(
      createPatientDto,
     
    );
  }


  @Post('create-parent')
  async createParent(@Body() createPatientDto: CreatePatientDto, @Req() req: any) {
    return await this.patientService.createParent(
      createPatientDto,
    );
  }

 @Get('parents')
  getParent() {
    return this.patientService.getParent();
  }

  @Get()
  async findAll() {
    try {
      return await this.patientService.findAll();
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw new InternalServerErrorException('Failed to retrieve patients');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a patient by ID' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found',
  })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return await this.patientService.findOne(
      id,
      // ,
      //  req.user.id, req.user.role
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: any,
    @Req() req: any,
  ) {
    console.log('Update Patient DTO:', updatePatientDto);
    return await this.patientService.update(
      id,
      updatePatientDto,
    );
  }

@Delete(':id')
async remove(@Param('id') id: string) {
  if (!id) {
    throw new InternalServerErrorException('Patient ID is required');
  }
  return await this.patientService.remove(id);
}


  @Get('parent/:parentId')
  @ApiOperation({ summary: 'Get patients by parent ID' })
  @ApiParam({ name: 'parentId', description: 'Parent ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patients retrieved successfully',
  })
  async getPatientsByParent(@Param('parentId') parentId: string) {
    return await this.patientService.getPatientsByParent(parentId);
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get patients by doctor ID' })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patients retrieved successfully',
  })
  async getPatientsByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return await this.patientService.getPatientsByDoctor(doctorId, page, limit);
  }
}
