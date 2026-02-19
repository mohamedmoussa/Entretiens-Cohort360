/**
 * Types TypeScript pour l'API Backend Django
 */

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Patient {
  id: number;
  last_name: string;
  first_name: string;
  birth_date: string | null;
}

export interface Medication {
  id: number;
  code: string;
  label: string;
  status: 'actif' | 'suppr';
}

export type PrescriptionStatus = 'valide' | 'en_attente' | 'suppr';

export interface Prescription {
  id: number;
  patient: number;
  patient_details: Patient;
  medication: number;
  medication_details: Medication;
  start_date: string;
  end_date: string;
  status: PrescriptionStatus;
  comment: string;
}

export interface PrescriptionCreate {
  patient: number;
  medication: number;
  start_date: string;
  end_date: string;
  status: PrescriptionStatus;
  comment?: string;
}

export interface PrescriptionFilters {
  patient?: number;
  medication?: number;
  status?: PrescriptionStatus;
  start_date?: string;
  start_date_gte?: string;
  start_date_lte?: string;
  start_date_gt?: string;
  start_date_lt?: string;
  end_date?: string;
  end_date_gte?: string;
  end_date_lte?: string;
  end_date_gt?: string;
  end_date_lt?: string;
  page?: number;
  page_size?: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
