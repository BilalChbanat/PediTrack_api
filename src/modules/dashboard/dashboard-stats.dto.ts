// ===== DTOs =====

// dto/dashboard-stats.dto.ts
export class DashboardStatsDto {
  totalPatients: number;
  appointmentsToday: number;
  vaccinesThisMonth: number;
  vaccinesLastMonth: number;
  revenue: any;
  recentPatients: {
    id: string;
    name: string;
    age: string;
    lastVisit: string;
    status: string;
  }[];
  upcomingAppointments: {
    id: string;
    patient: string;
    time: string;
    type: string;
    urgent: boolean;
  }[];
  vaccineAlerts: {
    patient: string;
    vaccine: string;
    dueDate: string;
  }[];
  monthlyStats: {
    consultations: number[];
    vaccinations: number[];
    months: string[];
  };
}

export class MonthlyStatsDto {
  consultations: number[];
  vaccinations: number[];
  newPatients: number[];
  months: string[];
}
