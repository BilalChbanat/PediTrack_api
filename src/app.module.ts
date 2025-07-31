// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { databaseConfig, jwtConfig, mailConfig } from './common/config/index';
import { RateLimiterModule } from 'nestjs-rate-limiter';
import { PatientModule } from './modules/patient/patient.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { VaccinationRecordModule } from './modules/vaccination/vaccination-record.module';
import { GrowthRecordModule } from './modules/growth-recor/growth-record.module';
import { PrescriptionModule } from './modules/prescription/prescription.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FamiliesModule } from './modules/families/families.module';
import { ConsultationModule } from './modules/consultation/consultation.module';
// import { SuperAdminModule } from './modules/super_admin/super-admin.module';

@Module({
  imports: [
      ScheduleModule.forRoot(),
    RateLimiterModule.register({
      points: 5, // 5 requests
      duration: 60, // per 60 seconds
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, mailConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        ...configService.get('database.options'),
        retryAttempts: configService.get<number>('database.retryAttempts'),
        retryDelay: configService.get<number>('database.retryDelay'),
      }),
    }),
    AuthModule,
    PatientModule,
    AppointmentModule,
    VaccinationRecordModule,
    GrowthRecordModule,
    PrescriptionModule,
    DocumentsModule,
    DashboardModule,
    FamiliesModule,
    ConsultationModule
  ],
})
export class AppModule {}
