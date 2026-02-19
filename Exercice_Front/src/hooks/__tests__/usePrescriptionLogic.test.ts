import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { PrescriptionsProvider } from '../../context/PrescriptionsContext';
import { usePrescriptionsContext } from '../../context/PrescriptionsContext';

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockCreateMutateAsync = vi.hoisted(() => vi.fn());
const mockUpdateMutateAsync = vi.hoisted(() => vi.fn());
const mockDeleteMutateAsync = vi.hoisted(() => vi.fn());

vi.mock('../useApi', () => ({
  useCreatePrescription: () => ({ mutateAsync: mockCreateMutateAsync, isPending: false }),
  useUpdatePrescription: () => ({ mutateAsync: mockUpdateMutateAsync, isPending: false }),
  useDeletePrescription: () => ({ mutateAsync: mockDeleteMutateAsync, isPending: false }),
}));

import { usePrescriptionLogic } from '../usePrescriptionLogic';

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(MemoryRouter, {}, createElement(PrescriptionsProvider, {}, children));

const newPrescription = {
  patient: 1,
  medication: 1,
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  status: 'valide' as const,
};

describe('handleCancelForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('navigates to / and clears editingPrescription and errorMessage', () => {
    const { result } = renderHook(
      () => ({ logic: usePrescriptionLogic(), ctx: usePrescriptionsContext() }),
      { wrapper }
    );

    act(() => result.current.logic.handleCancelForm());

    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(result.current.ctx.editingPrescription).toBeNull();
    expect(result.current.ctx.errorMessage).toBeNull();
  });
});

describe('handleDeleteRequest', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sets deleteConfirmId in context', () => {
    const { result } = renderHook(
      () => ({ logic: usePrescriptionLogic(), ctx: usePrescriptionsContext() }),
      { wrapper }
    );

    act(() => result.current.logic.handleDeleteRequest(42));

    expect(result.current.ctx.deleteConfirmId).toBe(42);
  });
});

describe('handleDeleteCancel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('resets deleteConfirmId to null', () => {
    const { result } = renderHook(
      () => ({ logic: usePrescriptionLogic(), ctx: usePrescriptionsContext() }),
      { wrapper }
    );

    act(() => result.current.logic.handleDeleteRequest(10));
    act(() => result.current.logic.handleDeleteCancel());

    expect(result.current.ctx.deleteConfirmId).toBeNull();
  });
});

describe('handleDeleteConfirm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteMutateAsync.mockResolvedValue(undefined);
  });

  it('does nothing when deleteConfirmId is null', async () => {
    const { result } = renderHook(() => usePrescriptionLogic(), { wrapper });

    await act(async () => result.current.handleDeleteConfirm());

    expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
  });

  it('calls deleteMutation with deleteConfirmId and clears it', async () => {
    const { result } = renderHook(
      () => ({ logic: usePrescriptionLogic(), ctx: usePrescriptionsContext() }),
      { wrapper }
    );

    act(() => result.current.logic.handleDeleteRequest(42));
    await act(async () => result.current.logic.handleDeleteConfirm());

    expect(mockDeleteMutateAsync).toHaveBeenCalledWith(42);
    expect(result.current.ctx.deleteConfirmId).toBeNull();
  });

  it('sets errorMessage when delete fails', async () => {
    mockDeleteMutateAsync.mockRejectedValueOnce(new Error('Delete failed'));

    const { result } = renderHook(
      () => ({ logic: usePrescriptionLogic(), ctx: usePrescriptionsContext() }),
      { wrapper }
    );

    act(() => result.current.logic.handleDeleteRequest(7));
    await act(async () => result.current.logic.handleDeleteConfirm());

    expect(result.current.ctx.errorMessage).toBe('Erreur lors de la suppression de la prescription.');
    expect(result.current.ctx.deleteConfirmId).toBeNull();
  });
});

describe('handleSubmitPrescription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateMutateAsync.mockResolvedValue({ id: 1, ...newPrescription });
    mockUpdateMutateAsync.mockResolvedValue({ id: 5, ...newPrescription });
  });

  it('calls createMutation and navigates on create (no editingPrescription)', async () => {
    const { result } = renderHook(() => usePrescriptionLogic(), { wrapper });

    await act(async () => result.current.handleSubmitPrescription(newPrescription));

    expect(mockCreateMutateAsync).toHaveBeenCalledWith(newPrescription);
    expect(mockUpdateMutateAsync).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('calls updateMutation when editingPrescription is set', async () => {
    const editing = { id: 5, patient: 1, medication: 1, start_date: '2024-01-01', end_date: '2024-01-31', status: 'valide' as const, comment: '', patient_details: { id: 1, last_name: 'A', first_name: 'B', birth_date: null }, medication_details: { id: 1, code: 'X', label: 'Y', status: 'actif' as const } };

    const { result } = renderHook(
      () => ({ logic: usePrescriptionLogic(), ctx: usePrescriptionsContext() }),
      { wrapper }
    );

    act(() => result.current.ctx.setEditingPrescription(editing));
    await act(async () => result.current.logic.handleSubmitPrescription(newPrescription));

    expect(mockUpdateMutateAsync).toHaveBeenCalledWith({ id: 5, data: newPrescription });
    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('sets errorMessage and does not navigate when submission fails', async () => {
    mockCreateMutateAsync.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(
      () => ({ logic: usePrescriptionLogic(), ctx: usePrescriptionsContext() }),
      { wrapper }
    );

    await act(async () => result.current.logic.handleSubmitPrescription(newPrescription));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.ctx.errorMessage).toBe(
      'Erreur lors de la sauvegarde de la prescription. Vérifiez les données.'
    );
  });
});
