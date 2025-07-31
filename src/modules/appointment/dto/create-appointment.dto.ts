import { IsDateString, IsNotEmpty, IsMongoId, Matches } from 'class-validator';

export class CreateAppointmentDto {
  @IsMongoId({ message: 'Invalid patient ID' })
  patientId: string;

  // Uncomment if doctorId is needed
  // @IsMongoId({ message: 'Invalid doctor ID' })
  // doctorId: string;

  @IsDateString({}, { message: 'Date must be in ISO format (YYYY-MM-DD)' })
  date: string; // e.g., '2025-06-10'

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:mm format',
  })
  time: string; // e.g., '14:30'

  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';

  notes?: string;

  @IsNotEmpty({ message: 'Type is required' })
  type: 'consultation' | 'follow-up';
}


// dto/create-appointment.dto.ts
// import { IsDateString, IsNotEmpty, IsMongoId, Matches, isString } from 'class-validator';

// export class CreateAppointmentDto {
//   @IsMongoId({ message: 'Invalid patient ID' })
//   patientId: string;

//   // @IsMongoId({ message: 'Invalid doctor ID' })
//   // doctorId: string;

//   @IsDateString({}, { message: 'Date must be in ISO format (YYYY-MM-DD)' })
//   date: string; // e.g., '2025-06-10'

//   @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
//     message: 'Time must be in HH:mm format',
//   })
//   time: string; // e.g., '14:30'

//   status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';

//   notes?: string;



//   // dto/create-appointment.dto.ts
// @IsNotEmpty({ message: 'Type is required' })
// type: 'consultation' | 'follow-up'; // Remove the ? to make it required

 
// }
