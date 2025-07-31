// services/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DashboardStatsDto, MonthlyStatsDto } from './dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel('Patient') private readonly patientModel: Model<any>,
    @InjectModel('Appointment') private readonly appointmentModel: Model<any>,
    @InjectModel('VaccinationRecord') private readonly vaccinationModel: Model<any>,
  ) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
   const doctor = await this.patientModel.db.model('User').findOne({ role: 'doctor' }).exec();
   const doctorId = doctor._id;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Statistiques principales
    const [
      totalPatients,
      appointmentsToday,
      vaccinesThisMonth,
      vaccinesLastMonth,
      recentPatients,
      upcomingAppointments,
      vaccineAlerts,
      monthlyStats
    ] = await Promise.all([
      this.getTotalPatients(doctorId),
      this.getAppointmentsToday(doctorId, startOfDay, endOfDay),
      this.getVaccinesThisMonth(startOfMonth, endOfMonth),
      this.getVaccinesLastMonth(startOfMonth),
      this.getRecentPatients(doctorId),
      this.getUpcomingAppointments(doctorId, startOfDay, endOfDay),
      this.getVaccineAlerts(),
      this.getMonthlyStats()
    ]);

    // Revenus statiques basés sur les consultations
    const monthlyRevenue = this.calculateStaticRevenue(appointmentsToday, vaccinesThisMonth);

    return {
      totalPatients,
      appointmentsToday,
      vaccinesThisMonth,
     vaccinesLastMonth,
      revenue: monthlyRevenue,
      recentPatients,
      upcomingAppointments,
      vaccineAlerts,
      monthlyStats
    };
  }

  private async getTotalPatients(doctorId: string): Promise<number> {
    return await this.patientModel.countDocuments({ doctorId });
  }

  private async getAppointmentsToday(doctorId: string, startOfDay: Date, endOfDay: Date): Promise<number> {
    return await this.appointmentModel.countDocuments({
      doctorId,
      date: { $gte: startOfDay, $lt: endOfDay },
      status: { $ne: 'cancelled' }
    });
  }

private async getVaccinesThisMonth(startOfMonth: Date, endOfMonth: Date): Promise<number> {
    return await this.vaccinationModel.countDocuments({
        dateAdministered: { $gte: startOfMonth, $lt: endOfMonth },
        status: 'done'
    });
}

// Get vaccines count for last month
private async getVaccinesLastMonth(startOfMonth: Date): Promise<number> {
    const lastMonthStart = new Date(startOfMonth);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthEnd = new Date(startOfMonth);

    return await this.vaccinationModel.countDocuments({
        dateAdministered: { $gte: lastMonthStart, $lt: lastMonthEnd },
        status: 'done'
    });
}

  // Calcul statique des revenus basé sur l'activité
  private calculateStaticRevenue(appointmentsToday: number, vaccinesThisMonth: number):any[] {
  
    
    // Estimation des consultations du mois (approximation)
    const estimatedMonthlyConsultations = appointmentsToday * 22; // 22 jours ouvrables
    const consultationRevenue = estimatedMonthlyConsultations; // 45€ par consultation
    const vaccinationRevenue = vaccinesThisMonth;  // 25€ par vaccination

    return [consultationRevenue, vaccinationRevenue];
  }

private async getRecentPatients(doctorId: string) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentAppointments = await this.appointmentModel
        .find({
            doctorId,
            status: 'completed',
            date: { $gte: oneWeekAgo }
        })
        .populate('patientId')
        .sort({ date: -1 })
        .limit(4)
        .exec();

    return recentAppointments.map(apt => {
        const patient = apt.patientId;
        return {
            id: patient?._id?.toString() || '',
            name: patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu',
            age: patient ? this.formatAge(this.calculateAge(patient.birthDate)) : '',
            lastVisit: apt.date ? apt.date.toISOString().split('T')[0] : '',
            status: apt.status
        };
    });
}

  private async getUpcomingAppointments(doctorId: string, startOfDay: Date, endOfDay: Date) {
    const appointments = await this.appointmentModel
      .find({
        doctorId,
        date: { $gte: startOfDay, $lt: endOfDay },
        status: 'confirmed'
      })
      .populate('patientId')
      .sort({ time: 1 })
      .exec();

      console.log('Upcoming appointments:', appointments);

    return appointments.map(apt => {
      const patient = apt.patientId;
      const isUrgent = apt.type === 'consultation' && apt.notes?.includes('urgent');
      
      return {
        id: apt._id.toString(),
        patient: patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu',
        time: apt.time,
        type: this.formatAppointmentType(apt.type),
        urgent: isUrgent
      };
    });
  }

  private async getVaccineAlerts() {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    const alerts = await this.vaccinationModel
      .find({
        dueDate: { $lte: nextWeek },
        status: 'pending'
      })
      .populate('patientId')
      .sort({ dueDate: 1 })
      .limit(3)
      .exec();

    return alerts.map(alert => {
      const patient = alert.patientId;
      return {
        patient: patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu',
        vaccine: alert.vaccine,
        dueDate: alert.dueDate.toISOString().split('T')[0]
      };
    });
  }

  private async getMonthlyStats(): Promise<MonthlyStatsDto> {

    const doctor = await this.patientModel.db.model('User').findOne({ role: 'doctor' }).exec();
    const doctorId = doctor._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    
    const months = [];
    const consultations = [];
    const vaccinations = [];
    const newPatients = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      // Nom du mois
      const monthName = monthStart.toLocaleDateString('fr-FR', { month: 'short' });
      months.push(monthName);

      // Consultations
      const consultationsCount = await this.appointmentModel.countDocuments({
        doctorId,
        date: { $gte: monthStart, $lt: monthEnd },
        status: 'completed'
      });
      consultations.push(consultationsCount);


      // Vaccinations
      const vaccinationsCount = await this.vaccinationModel.countDocuments({
        dateAdministered: { $gte: monthStart, $lt: monthEnd },
        status: 'done'
      });
      vaccinations.push(vaccinationsCount);

      // Nouveaux patients
      const newPatientsCount = await this.patientModel.countDocuments({
        doctorId,
        createdAt: { $gte: monthStart, $lt: monthEnd }
      });
      newPatients.push(newPatientsCount);
    }

    return {
      consultations,
      vaccinations,
      newPatients,
      months
    };
  }

  // Méthodes utilitaires
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  private formatAge(age: number): string {
    if (age < 1) {
      const months = Math.floor((new Date().getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
      return `${months} mois`;
    }
    return `${age} an${age > 1 ? 's' : ''}`;
  }

  private formatAppointmentType(type: string): string {
    const types = {
      'consultation': 'Consultation',
      'follow-up': 'Suivi',
      'vaccination': 'Vaccination'
    };
    return types[type] || type;
  }

async getPatientsList( page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    // Find the doctor user by role
    const doctorUser = await this.patientModel.db.model('User').findOne({ role: 'doctor' }).exec();
    console.log('Doctor user found:', doctorUser);
    if (!doctorUser) {
        throw new Error('Doctor not found');
    }
    

    const patients = await this.patientModel
        .find({ doctorId: doctorUser._id })
        .populate('doctorId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

    const total = await this.patientModel.countDocuments({ doctorId: doctorUser._id });

    return {
        patients: patients.map(patient => ({
            id: patient._id,
            name: `${patient.firstName} ${patient.lastName}`,
            age: this.formatAge(this.calculateAge(patient.birthDate)),
            gender: patient.gender,
            parent: patient.parentId?.name,
            parentEmail: patient.parentId?.email,
            createdAt: patient.createdAt
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
}

  async getPatientDetails(patientId: string) {
    const patient = await this.patientModel
      .findById(patientId)
      .populate('parentId')
      .populate('doctorId')
      .exec();

    if (!patient) {
      throw new Error('Patient non trouvé');
    }

    // Derniers rendez-vous
    const recentAppointments = await this.appointmentModel
      .find({ patientId })
      .sort({ date: -1 })
      .limit(5)
      .exec();

    // Vaccinations
    const vaccinations = await this.vaccinationModel
      .find({ patientId })
      .sort({ dueDate: -1 })
      .exec();

    return {
      patient: {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        gender: patient.gender,
        birthDate: patient.birthDate,
        age: this.formatAge(this.calculateAge(patient.birthDate)),
        parent: patient.parentId,
        doctor: patient.doctorId
      },
      recentAppointments,
      vaccinations
    };
  }
}