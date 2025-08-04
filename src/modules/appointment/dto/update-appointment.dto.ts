// update-appointment.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto';
import { appointmentStatusEnum, AppointmentStatus } from '../appointment.schema';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsOptional()
  @IsEnum(appointmentStatusEnum, { 
    message: `Status must be one of: ${appointmentStatusEnum.join(', ')}` 
  })
  status?: AppointmentStatus;
}
