import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrescriptionFormPage } from '../PrescriptionFormPage';
import type { Patient, Medication, Prescription } from '../../types/api';

const mockPatients: Patient[] = [
  { id: 1, last_name: 'Doe', first_name: 'John', birth_date: '1990-01-01' },
];

const mockMedications: Medication[] = [
  { id: 1, code: 'ASPIRIN', label: 'Aspirin 500mg', status: 'actif' },
];

const mockPrescription: Prescription = {
  id: 10,
  patient: 1,
  patient_details: { id: 1, last_name: 'Doe', first_name: 'John', birth_date: '1990-01-01' },
  medication: 1,
  medication_details: { id: 1, code: 'ASPIRIN', label: 'Aspirin 500mg', status: 'actif' },
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  status: 'valide',
  comment: '',
};

describe('PrescriptionFormPage', () => {
  it('renders create form when no editingPrescription', () => {
    render(
      <PrescriptionFormPage
        patients={mockPatients}
        medications={mockMedications}
        editingPrescription={null}
        isLoading={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Créer')).toBeInTheDocument();
  });

  it('renders edit form when editingPrescription is provided', () => {
    render(
      <PrescriptionFormPage
        patients={mockPatients}
        medications={mockMedications}
        editingPrescription={mockPrescription}
        isLoading={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Mettre à jour')).toBeInTheDocument();
  });

  it('shows loading state on submit button', () => {
    render(
      <PrescriptionFormPage
        patients={mockPatients}
        medications={mockMedications}
        editingPrescription={null}
        isLoading={true}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('En cours...')).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnCancel = vi.fn();

    render(
      <PrescriptionFormPage
        patients={mockPatients}
        medications={mockMedications}
        editingPrescription={null}
        isLoading={false}
        onSubmit={vi.fn()}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByText('Annuler'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
