import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PrescriptionsListPage } from '../PrescriptionsListPage';
import { PrescriptionsProvider } from '../../context/PrescriptionsContext';
import type { Patient, Medication, Prescription } from '../../types/api';

const mockPatients: Patient[] = [
  { id: 1, last_name: 'Dupont', first_name: 'Marie', birth_date: '1980-03-15' },
];

const mockMedications: Medication[] = [
  { id: 1, code: 'ASPIRIN', label: 'Aspirin 500mg', status: 'actif' },
];

const mockPrescriptions: Prescription[] = [
  {
    id: 1,
    patient: 1,
    patient_details: { id: 1, last_name: 'Dupont', first_name: 'Marie', birth_date: '1980-03-15' },
    medication: 1,
    medication_details: { id: 1, code: 'ASPIRIN', label: 'Aspirin 500mg', status: 'actif' },
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    status: 'valide',
    comment: '',
  },
];

const renderPage = (props = {}) => {
  const defaults = {
    prescriptions: mockPrescriptions,
    count: 1,
    loadingPrescriptions: false,
    prescriptionsError: null,
    patients: mockPatients,
    medications: mockMedications,
    isLoading: false,
  };

  return render(
    <MemoryRouter>
      <PrescriptionsProvider>
        <PrescriptionsListPage {...defaults} {...props} />
      </PrescriptionsProvider>
    </MemoryRouter>
  );
};

describe('PrescriptionsListPage', () => {
  it('renders the prescriptions list', () => {
    renderPage();

    // "Dupont Marie" apparaît dans le filtre (option) ET dans le tableau
    expect(screen.getAllByText('Dupont Marie').length).toBeGreaterThan(0);
    expect(screen.getByText('Aspirin 500mg')).toBeInTheDocument();
  });

  it('renders the filters panel', () => {
    renderPage();

    expect(screen.getByLabelText('Patient')).toBeInTheDocument();
    expect(screen.getByLabelText('Statut')).toBeInTheDocument();
  });

  it('shows pagination info when count > 0', () => {
    renderPage({ count: 25 });

    expect(screen.getByText(/Page/)).toBeInTheDocument();
    expect(screen.getByText(/résultat/)).toBeInTheDocument();
  });

  it('shows error message when prescriptionsError is set', () => {
    renderPage({ prescriptionsError: new Error('Erreur réseau'), prescriptions: [] });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Impossible de charger/)).toBeInTheDocument();
  });

  it('shows loading text when isLoading is true and no error', () => {
    renderPage({ isLoading: true, count: 0 });

    expect(screen.getByText('Chargement des données...')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    renderPage({ count: 25 });

    expect(screen.getByText('← Précédent')).toBeDisabled();
  });
});
