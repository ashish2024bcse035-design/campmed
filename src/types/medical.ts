export type PatientType = 'student' | 'staff' | 'visitor';

export type StaffRole = 'guard' | 'faculty' | 'technical' | 'admin' | 'maintenance' | 'other';

export interface BasePatient {
  id: string;
  name: string;
  phone?: string;
  createdAt: string;
}

export interface StudentPatient extends BasePatient {
  type: 'student';
  enrollmentNo: string; // e.g. "2024BCSE001"
  branch: string; // e.g. "Computer Science & Engineering"
  year: string; // "1st Year", "2nd Year", "3rd Year", "4th Year"
}

export interface StaffPatient extends BasePatient {
  type: 'staff';
  employeeId: string; // e.g. "SEC-GD-018", "EMP-CSE-104"
  branch: string; // e.g. "Campus Security", "Computer Science"
  staffRole: StaffRole;
  designation?: string;
}

export interface VisitorPatient extends BasePatient {
  type: 'visitor';
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  purpose?: string;
}

export type Patient = StudentPatient | StaffPatient | VisitorPatient;

export interface MedicineItem {
  id: string;
  name: string;
  stockQuantity: number;
  unit: string;
  minStockThreshold: number;
}

export interface MedicalVisitRecord {
  id: string;
  patientId: string;
  patientType: PatientType;
  patientName: string;
  identifier: string; // Enrollment No, Employee ID, or Visitor Name/Badge
  branch: string;
  dateTime: string; // ISO
  formattedDateTime: string; // e.g. "Oct 18, 2026, 04:30 PM"
  medicineId: string;
  medicineName: string;
  quantity: number;
}
