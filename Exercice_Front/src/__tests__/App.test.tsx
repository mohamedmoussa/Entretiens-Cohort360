import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';
import { PrescriptionsProvider } from '../context/PrescriptionsContext';

const mockUsePatients      = vi.hoisted(() => vi.fn());
const mockUseMedications   = vi.hoisted(() => vi.fn());
const mockUsePrescriptions = vi.hoisted(() => vi.fn());

vi.mock('../hooks/useApi', () => ({
  usePatients:      mockUsePatients,
  useMedications:   mockUseMedications,
  usePrescriptions: mockUsePrescriptions,
}));

const mockHandleSubmit       = vi.hoisted(() => vi.fn());
const mockHandleCancel       = vi.hoisted(() => vi.fn());
const mockHandleDeleteConfirm = vi.hoisted(() => vi.fn());
const mockHandleDeleteCancel  = vi.hoisted(() => vi.fn());

vi.mock('../hooks/usePrescriptionLogic', () => ({
  usePrescriptionLogic: () => ({
    createMutation:           { isPending: false },
    updateMutation:           { isPending: false },
    deleteMutation:           { isPending: false },
    handleSubmitPrescription: mockHandleSubmit,
    handleCancelForm:         mockHandleCancel,
    handleDeleteConfirm:      mockHandleDeleteConfirm,
    handleDeleteCancel:       mockHandleDeleteCancel,
  }),
}));

const renderApp = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <PrescriptionsProvider>
        <App />
      </PrescriptionsProvider>
    </MemoryRouter>
  );

const noError = { data: undefined, isLoading: false, error: null };
const emptyPage = { count: 0, next: null, previous: null, results: [] };

beforeEach(() => {
  vi.clearAllMocks();
  mockUsePatients.mockReturnValue({ data: [], isLoading: false, error: null });
  mockUseMedications.mockReturnValue({ data: [], isLoading: false, error: null });
  mockUsePrescriptions.mockReturnValue({ data: emptyPage, isLoading: false, error: null });
});

describe('App', () => {
  it('renders the header', () => {
    renderApp();
    expect(screen.getByText('Gestion des Prescriptions')).toBeInTheDocument();
  });

  it('renders the footer', () => {
    renderApp();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the list page at /', () => {
    renderApp('/');
    expect(screen.getByLabelText('Patient')).toBeInTheDocument();
  });

  it('renders the create form at /prescriptions/create', () => {
    renderApp('/prescriptions/create');
    expect(screen.getByRole('heading', { name: /nouvelle prescription/i })).toBeInTheDocument();
  });

  it('shows global error banner when patients fail to load', () => {
    mockUsePatients.mockReturnValue({ ...noError, error: new Error('Erreur réseau') });

    renderApp();

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Erreur de chargement/)).toBeInTheDocument();
  });

  it('shows global error banner when medications fail to load', () => {
    mockUseMedications.mockReturnValue({ ...noError, error: new Error('Service down') });

    renderApp();

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Service down')).toBeInTheDocument();
  });

  it('navigates to create form when "+ Nouvelle prescription" is clicked', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.click(screen.getByText('+ Nouvelle prescription'));

    expect(screen.getByRole('heading', { name: /nouvelle prescription/i })).toBeInTheDocument();
  });

  it('shows delete confirmation modal when deleteConfirmId is set in context', () => {
    const prescription = {
      id: 1,
      patient: 1,
      medication: 1,
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      status: 'valide' as const,
      comment: '',
      patient_details: { id: 1, last_name: 'Doe', first_name: 'John', birth_date: null },
      medication_details: { id: 1, code: 'ASP', label: 'Aspirin', status: 'actif' as const },
    };
    mockUsePrescriptions.mockReturnValue({
      data: { count: 1, next: null, previous: null, results: [prescription] },
      isLoading: false,
      error: null,
    });

    renderApp('/');

    expect(screen.queryByText('Supprimer la prescription')).not.toBeInTheDocument();
  });
});
