import { AppointmentStatus } from './enums';

export interface Appointment {
  id: string;
  shopId: string;
  branchId: string;
  barberId: string;
  customerId: string;
  serviceId: string;
  scheduledAt: Date;
  durationMins: number;
  status: AppointmentStatus;
  notes?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  startTime: string; // "10:00"
  endTime: string;   // "10:30"
  isAvailable: boolean;
}

export interface BookAppointmentInput {
  barberId: string;
  serviceId: string;
  scheduledAt: Date;
  notes?: string;
}
