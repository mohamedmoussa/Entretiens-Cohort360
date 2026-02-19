/**
 * Hooks React Query pour gérer les requêtes API
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { patientsApi, medicationsApi, prescriptionsApi } from '../services/api';
import type {
  Patient,
  Medication,
  Prescription,
  PrescriptionCreate,
  PrescriptionFilters,
  PaginatedResponse,
} from '../types/api';

/**
 * Hook pour récupérer la liste des patients
 */
export const usePatients = (): UseQueryResult<Patient[], Error> => {
  return useQuery({
    queryKey: ['patients'],
    queryFn: patientsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook pour récupérer la liste des médicaments
 */
export const useMedications = (): UseQueryResult<Medication[], Error> => {
  return useQuery({
    queryKey: ['medications'],
    queryFn: medicationsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook pour récupérer la liste des prescriptions avec filtres et pagination
 */
export const usePrescriptions = (filters?: PrescriptionFilters): UseQueryResult<PaginatedResponse<Prescription>, Error> => {
  return useQuery({
    queryKey: ['prescriptions', filters],
    queryFn: () => prescriptionsApi.getAll(filters),
  });
};

/**
 * Hook pour créer une nouvelle prescription
 */
export const useCreatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PrescriptionCreate) => prescriptionsApi.create(data),
    onSuccess: () => {
      // Invalider le cache des prescriptions pour forcer un rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
};

/**
 * Hook pour mettre à jour une prescription
 */
export const useUpdatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PrescriptionCreate> }) =>
      prescriptionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
};

/**
 * Hook pour supprimer une prescription
 */
export const useDeletePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => prescriptionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
};
