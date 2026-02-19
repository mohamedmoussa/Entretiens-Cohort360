/**
 * Context API pour l'état partagé des prescriptions
 * Évite le props drilling excessif
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import type { PrescriptionFilters as Filters, Prescription } from '../types/api';

interface PrescriptionsContextType {
  // Pagination
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;

  // Filters
  filters: Filters;
  setFilters: (filters: Filters) => void;

  // Messages
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;

  // Delete confirmation
  deleteConfirmId: number | null;
  setDeleteConfirmId: (id: number | null) => void;

  // Editing
  editingPrescription: Prescription | null;
  setEditingPrescription: (prescription: Prescription | null) => void;
}

const PrescriptionsContext = createContext<PrescriptionsContextType | undefined>(undefined);

export const PrescriptionsProvider = ({ children }: { children: ReactNode }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Filters>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);

  const value: PrescriptionsContextType = {
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    errorMessage,
    setErrorMessage,
    deleteConfirmId,
    setDeleteConfirmId,
    editingPrescription,
    setEditingPrescription,
  };

  return (
    <PrescriptionsContext.Provider value={value}>
      {children}
    </PrescriptionsContext.Provider>
  );
};

export const usePrescriptionsContext = () => {
  const context = useContext(PrescriptionsContext);
  if (!context) {
    throw new Error('usePrescriptionsContext must be used within PrescriptionsProvider');
  }
  return context;
};
