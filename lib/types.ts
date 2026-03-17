export type Role = 'admin' | 'patient' | 'receptionist' | 'doctor';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  clinicId: number;
  clinicName: string;
  clinicCode: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

// ---------- Appointments ----------
export interface QueueEntry {
  id: number;
  tokenNumber: number;
  status: 'waiting' | 'in_progress' | 'done' | 'skipped';
  queueDate: string;
  appointmentId: number;
  appointment?: {
    patient?: {
      name?: string;
      phone?: string;
    };
  };
}

export interface Appointment {
  id: number;
  appointmentDate: string;
  timeSlot: string;
  status: 'scheduled' | 'queued' | 'in_progress' | 'done' | 'cancelled';
  patientId: number;
  clinicId: number;
  createdAt: string;
  queueEntry?: QueueEntry;
  prescription?: Prescription;
  report?: Report;
}

// ---------- Doctor Queue ----------
export interface DoctorQueueItem {
  id: number;
  tokenNumber: number;
  status: string;
  patientName: string;
  patientId: number;
  appointmentId: number;
}

// ---------- Prescription ----------
export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  duration: string;
}

export interface Prescription {
  id: number;
  medicines: PrescriptionMedicine[];
  notes?: string;
  appointmentId: number;
  createdAt?: string;
  appointment?: Appointment;
}

// ---------- Report ----------
export interface Report {
  id: number;
  diagnosis: string;
  testRecommended?: string;
  remarks?: string;
  appointmentId: number;
  createdAt?: string;
  appointment?: Appointment;
}

// ---------- Admin ----------
export interface ClinicInfo {
  id: number;
  name: string;
  code: string;
  adminName?: string;
  totalDoctors?: number;
  totalReceptionists?: number;
  totalPatients?: number;
  [key: string]: unknown;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  createdAt?: string;
}

