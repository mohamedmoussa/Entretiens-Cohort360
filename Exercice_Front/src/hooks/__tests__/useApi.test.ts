import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';

vi.mock('../../services/api', () => ({
  patientsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
  },
  medicationsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
  },
  prescriptionsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { patientsApi, medicationsApi, prescriptionsApi } from '../../services/api';
import {
  usePatients,
  useMedications,
  usePrescriptions,
  useCreatePrescription,
  useUpdatePrescription,
  useDeletePrescription,
} from '../useApi';

const makeWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('usePatients', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns patients on success', async () => {
    const patients = [{ id: 1, last_name: 'Dupont', first_name: 'Marie', birth_date: null }];
    vi.mocked(patientsApi.getAll).mockResolvedValue(patients);

    const { result } = renderHook(() => usePatients(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(patients);
  });

  it('returns error on failure', async () => {
    vi.mocked(patientsApi.getAll).mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => usePatients(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Network Error');
  });
});

describe('useMedications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns medications on success', async () => {
    const meds = [{ id: 1, code: 'ASP', label: 'Aspirin 500mg', status: 'actif' as const }];
    vi.mocked(medicationsApi.getAll).mockResolvedValue(meds);

    const { result } = renderHook(() => useMedications(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(meds);
  });

  it('returns error on failure', async () => {
    vi.mocked(medicationsApi.getAll).mockRejectedValue(new Error('Service unavailable'));

    const { result } = renderHook(() => useMedications(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Service unavailable');
  });
});

describe('usePrescriptions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns paginated prescriptions without filters', async () => {
    const page = { count: 1, next: null, previous: null, results: [{ id: 1 }] };
    vi.mocked(prescriptionsApi.getAll).mockResolvedValue(page as never);

    const { result } = renderHook(() => usePrescriptions(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(page);
    expect(prescriptionsApi.getAll).toHaveBeenCalledWith(undefined);
  });

  it('passes filters to the API', async () => {
    const page = { count: 0, next: null, previous: null, results: [] };
    vi.mocked(prescriptionsApi.getAll).mockResolvedValue(page as never);

    const filters = { patient: 2, status: 'valide' as const };
    const { result } = renderHook(() => usePrescriptions(filters), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(prescriptionsApi.getAll).toHaveBeenCalledWith(filters);
  });
});

describe('useCreatePrescription', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls prescriptionsApi.create and invalidates cache on success', async () => {
    const payload = { patient: 1, medication: 1, start_date: '2024-01-01', end_date: '2024-01-31', status: 'valide' as const };
    const created = { id: 99, ...payload, comment: '' };
    vi.mocked(prescriptionsApi.create).mockResolvedValue(created as never);

    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useCreatePrescription(), { wrapper });

    await result.current.mutateAsync(payload);

    expect(prescriptionsApi.create).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['prescriptions'] });
  });
});

describe('useUpdatePrescription', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls prescriptionsApi.update and invalidates cache on success', async () => {
    const updated = { id: 5, status: 'en_attente' as const };
    vi.mocked(prescriptionsApi.update).mockResolvedValue(updated as never);

    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useUpdatePrescription(), { wrapper });

    await result.current.mutateAsync({ id: 5, data: { status: 'en_attente' } });

    expect(prescriptionsApi.update).toHaveBeenCalledWith(5, { status: 'en_attente' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['prescriptions'] });
  });
});

describe('useDeletePrescription', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls prescriptionsApi.delete and invalidates cache on success', async () => {
    vi.mocked(prescriptionsApi.delete).mockResolvedValue(undefined);

    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useDeletePrescription(), { wrapper });

    await result.current.mutateAsync(42);

    expect(prescriptionsApi.delete).toHaveBeenCalledWith(42);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['prescriptions'] });
  });
});
