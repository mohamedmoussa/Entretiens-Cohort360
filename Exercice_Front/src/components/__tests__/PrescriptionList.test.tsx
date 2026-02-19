import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrescriptionList } from '../PrescriptionList';
import type { Prescription } from '../../types/api';

const mockPrescriptions: Prescription[] = [
  {
    id: 1,
    patient: 1,
    patient_details: {
      id: 1,
      last_name: 'Doe',
      first_name: 'John',
      birth_date: '1990-01-01',
    },
    medication: 1,
    medication_details: {
      id: 1,
      code: 'ASPIRIN',
      label: 'Aspirin 500mg',
      status: 'actif',
    },
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    status: 'valide' as const,
    comment: 'Take twice a day',
  },
];

describe('PrescriptionList', () => {
  it('renders prescription list correctly', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <PrescriptionList
        prescriptions={mockPrescriptions}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Doe John')).toBeInTheDocument();
    expect(screen.getByText('Aspirin 500mg')).toBeInTheDocument();
    expect(screen.getByText('Valide')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <PrescriptionList
        prescriptions={mockPrescriptions}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByLabelText('Modifier la prescription');
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockPrescriptions[0]);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <PrescriptionList
        prescriptions={mockPrescriptions}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByLabelText('Supprimer la prescription');
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('renders empty state when no prescriptions', () => {
    render(
      <PrescriptionList
        prescriptions={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Aucune prescription trouvée')).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    render(
      <PrescriptionList
        prescriptions={[]}
        isLoading={true}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });
});
