import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet    = vi.hoisted(() => vi.fn());
const mockPost   = vi.hoisted(() => vi.fn());
const mockPatch  = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());
const mockInterceptorUse = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get:    mockGet,
      post:   mockPost,
      patch:  mockPatch,
      delete: mockDelete,
      interceptors: { response: { use: mockInterceptorUse } },
    })),
  },
}));

import { patientsApi, medicationsApi, prescriptionsApi } from '../api';

describe('API error interceptor', () => {
  it('passes successful responses through unchanged', () => {
    const [successHandler] = mockInterceptorUse.mock.calls[0] as [(r: unknown) => unknown, unknown];
    const response = { data: { id: 1 } };
    expect(successHandler(response)).toBe(response);
  });

  it('transforms AxiosError with response data into ApiError', async () => {
    const [, errorHandler] = mockInterceptorUse.mock.calls[0] as [unknown, (e: unknown) => Promise<never>];
    const axiosError = {
      message: 'Request failed with status code 400',
      response: { data: { end_date: ['Date invalide'] } },
    };
    await expect(errorHandler(axiosError)).rejects.toMatchObject({
      message: 'Request failed with status code 400',
      errors: { end_date: ['Date invalide'] },
    });
  });

  it('transforms AxiosError without response data (network error)', async () => {
    const [, errorHandler] = mockInterceptorUse.mock.calls[0] as [unknown, (e: unknown) => Promise<never>];
    const axiosError = { message: 'Network Error', response: undefined };
    await expect(errorHandler(axiosError)).rejects.toMatchObject({
      message: 'Network Error',
      errors: undefined,
    });
  });

  it('ignores non-object response data', async () => {
    const [, errorHandler] = mockInterceptorUse.mock.calls[0] as [unknown, (e: unknown) => Promise<never>];
    const axiosError = { message: 'Server Error', response: { data: 'Internal Server Error' } };
    await expect(errorHandler(axiosError)).rejects.toMatchObject({
      message: 'Server Error',
      errors: undefined,
    });
  });
});

describe('patientsApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getAll fetches patients with page_size=1000', async () => {
    const patients = [{ id: 1, last_name: 'Dupont', first_name: 'Marie', birth_date: null }];
    mockGet.mockResolvedValueOnce({ data: { count: 1, results: patients } });

    const result = await patientsApi.getAll();

    expect(mockGet).toHaveBeenCalledWith('/patients', { params: { page_size: 1000 } });
    expect(result).toEqual(patients);
  });

  it('getById fetches a patient by id', async () => {
    const patient = { id: 2, last_name: 'Martin', first_name: 'Paul', birth_date: '1970-05-10' };
    mockGet.mockResolvedValueOnce({ data: patient });

    const result = await patientsApi.getById(2);

    expect(mockGet).toHaveBeenCalledWith('/patients/2');
    expect(result).toEqual(patient);
  });
});

describe('medicationsApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getAll fetches active medications with page_size=1000', async () => {
    const meds = [{ id: 1, code: 'ASP', label: 'Aspirin 500mg', status: 'actif' }];
    mockGet.mockResolvedValueOnce({ data: { count: 1, results: meds } });

    const result = await medicationsApi.getAll();

    expect(mockGet).toHaveBeenCalledWith('/medications', { params: { status: 'actif', page_size: 1000 } });
    expect(result).toEqual(meds);
  });

  it('getById fetches a medication by id', async () => {
    const med = { id: 3, code: 'PARA', label: 'Paracetamol', status: 'actif' };
    mockGet.mockResolvedValueOnce({ data: med });

    const result = await medicationsApi.getById(3);

    expect(mockGet).toHaveBeenCalledWith('/medications/3');
    expect(result).toEqual(med);
  });
});

describe('prescriptionsApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getAll fetches prescriptions without filters', async () => {
    const page = { count: 0, next: null, previous: null, results: [] };
    mockGet.mockResolvedValueOnce({ data: page });

    const result = await prescriptionsApi.getAll();

    expect(mockGet).toHaveBeenCalledWith('/prescriptions', { params: undefined });
    expect(result).toEqual(page);
  });

  it('getAll passes filters as query params', async () => {
    const page = { count: 0, next: null, previous: null, results: [] };
    mockGet.mockResolvedValueOnce({ data: page });

    await prescriptionsApi.getAll({ patient: 1, status: 'valide', page: 2, page_size: 10 });

    expect(mockGet).toHaveBeenCalledWith('/prescriptions', {
      params: { patient: 1, status: 'valide', page: 2, page_size: 10 },
    });
  });

  it('getById fetches a prescription by id', async () => {
    const prescription = { id: 5, patient: 1, medication: 1 };
    mockGet.mockResolvedValueOnce({ data: prescription });

    const result = await prescriptionsApi.getById(5);

    expect(mockGet).toHaveBeenCalledWith('/prescriptions/5');
    expect(result).toEqual(prescription);
  });

  it('create posts a new prescription', async () => {
    const payload = { patient: 1, medication: 1, start_date: '2024-01-01', end_date: '2024-01-31', status: 'valide' as const };
    const created = { id: 10, ...payload, comment: '' };
    mockPost.mockResolvedValueOnce({ data: created });

    const result = await prescriptionsApi.create(payload);

    expect(mockPost).toHaveBeenCalledWith('/prescriptions', payload);
    expect(result).toEqual(created);
  });

  it('update patches an existing prescription', async () => {
    const updated = { id: 10, status: 'en_attente' as const };
    mockPatch.mockResolvedValueOnce({ data: updated });

    const result = await prescriptionsApi.update(10, { status: 'en_attente' });

    expect(mockPatch).toHaveBeenCalledWith('/prescriptions/10', { status: 'en_attente' });
    expect(result).toEqual(updated);
  });

  it('delete removes a prescription', async () => {
    mockDelete.mockResolvedValueOnce({});

    await prescriptionsApi.delete(7);

    expect(mockDelete).toHaveBeenCalledWith('/prescriptions/7');
  });
});
