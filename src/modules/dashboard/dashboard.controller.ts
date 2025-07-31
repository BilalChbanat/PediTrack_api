
// controllers/dashboard.controller.ts
import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dashboard-stats.dto';
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return await this.dashboardService.getDashboardStats();
  }

  @Get('patients')
  async getPatientsList(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return await this.dashboardService.getPatientsList( page, limit);
  }

  @Get('patients/:id')
  async getPatientDetails(@Param('id') patientId: string) {
    return await this.dashboardService.getPatientDetails(patientId);
  }

//   @Get('monthly-stats')
//   async getMonthlyStats(@Query('doctorId') doctorId: string) {
//     return await this.dashboardService.getMonthlyStats(doctorId);
//   }
}