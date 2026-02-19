import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrescriptionForm } from '../PrescriptionForm';
import type { Patient, Medication, PrescriptionCreate } from '../../types/api';

const mockPatients: Patient[] = [
  {
    id: 1,
    last_name: 'Doe',
    first_name: 'John',
    birth_date: '1990-01-01',
  },
];

const mockMedications: Medication[] = [
  {
    id: 1,
    code: 'ASPIRIN',
    label: 'Aspirin 500mg',
    status: 'actif',
  },
];

describe('PrescriptionForm', () => {
  it('renders form with all fields', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <PrescriptionForm
        patients={mockPatients}
        medications={mockMedications}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Labels contiennent un <span>*</span> : le nom accessible est "Patient *"
    expect(screen.getByLabelText(/Patient/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Médicament/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date de début/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date de fin/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Statut/)).toBeInTheDocument();
    expect(screen.getByLabelText('Commentaire (optionnel)')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <PrescriptionForm
        patients={mockPatients}
        medications={mockMedications}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Annuler');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <PrescriptionForm
        patients={mockPatients}
        medications={mockMedications}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Créer');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('shows date validation error when end_date < start_date', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <PrescriptionForm
        patients={mockPatients}
        medications={mockMedications}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const patientSelect = screen.getByLabelText(/Patient/);
    const medicationSelect = screen.getByLabelText(/Médicament/);
    const startDateInput = screen.getByLabelText(/Date de début/);
    const endDateInput = screen.getByLabelText(/Date de fin/);

    await user.selectOptions(patientSelect, '1');
    await user.selectOptions(medicationSelect, '1');
    await user.type(startDateInput, '2024-02-01');
    await user.type(endDateInput, '2024-01-01');

    const submitButton = screen.getByText('Créer');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('calls onSubmit with form data when valid', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <PrescriptionForm
        patients={mockPatients}
        medications={mockMedications}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const patientSelect = screen.getByLabelText(/Patient/);
    const medicationSelect = screen.getByLabelText(/Médicament/);
    const startDateInput = screen.getByLabelText(/Date de début/);
    const endDateInput = screen.getByLabelText(/Date de fin/);

    await user.selectOptions(patientSelect, '1');
    await user.selectOptions(medicationSelect, '1');
    await user.type(startDateInput, '2024-01-01');
    await user.type(endDateInput, '2024-01-31');

    const submitButton = screen.getByText('Créer');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(mockOnSubmit.mock.calls[0][0]).toMatchObject({
        patient: 1,
        medication: 1,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });
    });
  });

  it('renders with initial data in edit mode', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    const initialData = {
      patient: 1,
      medication: 1,
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      status: 'valide' as const,
      comment: 'Test comment',
    };

    render(
      <PrescriptionForm
        patients={mockPatients}
        medications={mockMedications}
        initialData={initialData}
        isEditing={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // En mode édition le bouton affiche "Mettre à jour" et le titre "Modifier prescription"
    expect(screen.getByText('Mettre à jour')).toBeInTheDocument();
    expect(screen.getByText('Modifier prescription')).toBeInTheDocument();
  });

  it('disables submit button when isLoading is true', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <PrescriptionForm
        patients={mockPatients}
        medications={mockMedications}
        isLoading={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // isLoading=true : le bouton affiche "En cours..." et est désactivé
    const submitButton = screen.getByText('En cours...');
    expect(submitButton).toBeDisabled();
  });
});
