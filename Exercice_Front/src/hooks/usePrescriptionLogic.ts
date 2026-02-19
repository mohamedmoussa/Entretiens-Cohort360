/**
 * Custom hook pour la logique métier des prescriptions
 * Centralise mutations et handlers
 */

import { useNavigate } from 'react-router-dom';
import {
  useCreatePrescription,
  useUpdatePrescription,
  useDeletePrescription,
} from './useApi';
import { usePrescriptionsContext } from '../context/PrescriptionsContext';
import type { PrescriptionCreate } from '../types/api';

export const usePrescriptionLogic = () => {
  const navigate = useNavigate();
  const {
    setErrorMessage,
    setEditingPrescription,
    setDeleteConfirmId,
    deleteConfirmId,
    editingPrescription,
  } = usePrescriptionsContext();

  const createMutation = useCreatePrescription();
  const updateMutation = useUpdatePrescription();
  const deleteMutation = useDeletePrescription();

  const handleSubmitPrescription = async (data: PrescriptionCreate) => {
    setErrorMessage(null);
    try {
      if (editingPrescription) {
        await updateMutation.mutateAsync({ id: editingPrescription.id, data });
        setEditingPrescription(null);
      } else {
        await createMutation.mutateAsync(data);
      }
      navigate('/');
    } catch {
      setErrorMessage('Erreur lors de la sauvegarde de la prescription. Vérifiez les données.');
    }
  };

  const handleCancelForm = () => {
    navigate('/');
    setEditingPrescription(null);
    setErrorMessage(null);
  };

  const handleDeleteRequest = (id: number) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId === null) return;
    setErrorMessage(null);
    try {
      await deleteMutation.mutateAsync(deleteConfirmId);
    } catch {
      setErrorMessage('Erreur lors de la suppression de la prescription.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    handleSubmitPrescription,
    handleCancelForm,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};
