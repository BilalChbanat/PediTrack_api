import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  Query,
  Put,
  //   UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { User } from '../auth/decorators/user.decorator';
// import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Appointments')
@Controller('appointments')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  //   @Roles('doctor')
  @ApiOperation({ summary: 'Create a new appointment (Doctor only)' })
  @ApiResponse({ status: 201, description: 'Appointment created' })
  async create(
    @Body() dto: any,
    // @User() doctor: CurrentUserDto,
  ) {
    console.log('Creating appointment with data:', dto);
    return this.appointmentService.create({
      ...dto,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments ' })
  async findAll() {
    return this.appointmentService.findAllForDoctor();
  }

  @Get(':id')
  //   @Roles('doctor')
  @ApiOperation({ summary: 'Get appointment by ID' })
  async findOne(@Param('id') id: string) {
    return this.appointmentService.findById(id);
  }

  @Put(':id')
  //   @Roles('doctor')
  @ApiOperation({ summary: 'Update an appointment' })
  async update(@Param('id') id: string, @Body() dto:any) {
    return this.appointmentService.update(id, dto);
  }

  @Delete(':id')
  //   @Roles('doctor')
  @ApiOperation({ summary: 'Cancel an appointment' })
  async cancel(@Param('id') id: string) {
    return this.appointmentService.cancel(id);
  }

  @Patch(':id/complete')
  //   @Roles('doctor')
  @ApiOperation({ summary: 'Mark appointment as completed' })
  async complete(@Param('id') id: string) {
    return this.appointmentService.complete(id);
  }

  @Get('/available/slots')
  //   @Roles('doctor')
  @ApiOperation({ summary: 'Get available time slots for a day' })
  async getAvailableSlots(@Query('date') date: string) {
    return this.appointmentService.getAvailableSlots(date);
  }
}