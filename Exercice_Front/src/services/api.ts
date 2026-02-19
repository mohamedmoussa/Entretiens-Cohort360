/**
 * Service API pour communiquer avec le backend Django
 */

import axios, { AxiosError } from 'axios';
import type {
  Patient,
  Medication,
  Prescription,
  PrescriptionCreate,
  PrescriptionFilters,
  PaginatedResponse,
  ApiError,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Fix 5 : utilisation d'un type guard pour éviter le cast `as` non sécurisé.
    // error.response?.data est de type `unknown` côté runtime ; on vérifie
    // qu'il s'agit bien d'un objet avant de l'affecter à errors.
    const rawData: unknown = error.response?.data;
    const apiError: ApiError = {
      message: error.message,
      errors:
        typeof rawData === 'object' && rawData !== null
          ? (rawData as Record<string, string[]>)
          : undefined,
    };
    return Promise.reject(apiError);
  }
);

/**
 * Service pour gérer les patients
 */
export const patientsApi = {
  /**
   * Récupère la liste de tous les patients
   */
  getAll: async (): Promise<Patient[]> => {
    const response = await apiClient.get<PaginatedResponse<Patient>>('/patients', {
      params: { page_size: 1000 },
    });
    return response.data.results;
  },

  /**
   * Récupère un patient par son ID
   */
  getById: async (id: number): Promise<Patient> => {
    const response = await apiClient.get<Patient>(`/patients/${id}`);
    return response.data;
  },
};

/**
 * Service pour gérer les médicaments
 */
export const medicationsApi = {
  /**
   * Récupère la liste de tous les médicaments actifs
   */
  getAll: async (): Promise<Medication[]> => {
    const response = await apiClient.get<PaginatedResponse<Medication>>('/medications', {
      params: { status: 'actif', page_size: 1000 },
    });
    return response.data.results;
  },

  /**
   * Récupère un médicament par son ID
   */
  getById: async (id: number): Promise<Medication> => {
    const response = await apiClient.get<Medication>(`/medications/${id}`);
    return response.data;
  },
};

/**
 * Service pour gérer les prescriptions
 */
export const prescriptionsApi = {
  /**
   * Récupère la liste des prescriptions avec filtres optionnels
   */
  getAll: async (filters?: PrescriptionFilters): Promise<PaginatedResponse<Prescription>> => {
    const response = await apiClient.get<PaginatedResponse<Prescription>>('/prescriptions', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Récupère une prescription par son ID
   */
  getById: async (id: number): Promise<Prescription> => {
    const response = await apiClient.get<Prescription>(`/prescriptions/${id}`);
    return response.data;
  },

  /**
   * Crée une nouvelle prescription
   */
  create: async (data: PrescriptionCreate): Promise<Prescription> => {
    const response = await apiClient.post<Prescription>('/prescriptions', data);
    return response.data;
  },

  /**
   * Met à jour une prescription existante
   */
  update: async (id: number, data: Partial<PrescriptionCreate>): Promise<Prescription> => {
    const response = await apiClient.patch<Prescription>(`/prescriptions/${id}`, data);
    return response.data;
  },

  /**
   * Supprime une prescription
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/prescriptions/${id}`);
  },
};
