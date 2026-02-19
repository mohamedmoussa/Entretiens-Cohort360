import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrescriptionFilters } from '../PrescriptionFilters';
import type { Patient, Medication } from '../../types/api';

const mockPatients: Patient[] = [
  { id: 1, last_name: 'Doe', first_name: 'John', birth_date: '1990-01-01' },
  { id: 2, last_name: 'Smith', first_name: 'Jane', birth_date: '1985-05-15' },
];

const mockMedications: Medication[] = [
  { id: 1, code: 'ASPIRIN', label: 'Aspirin 500mg', status: 'actif' },
  { id: 2, code: 'IBUPROFEN', label: 'Ibuprofen 400mg', status: 'actif' },
];

describe('PrescriptionFilters', () => {
  it('renders filter form with all fields', () => {
    const mockOnFilterChange = vi.fn();

    render(
      <PrescriptionFilters
        onFilterChange={mockOnFilterChange}
        patients={mockPatients}
        medications={mockMedications}
      />
    );

    expect(screen.getByLabelText('Patient')).toBeInTheDocument();
    expect(screen.getByLabelText('Médicament')).toBeInTheDocument();
    expect(screen.getByLabelText('Statut')).toBeInTheDocument();
    // Les labels de date affichent "Date de début" et "Date de fin"
    expect(screen.getByText('Date de début')).toBeInTheDocument();
    expect(screen.getByText('Date de fin')).toBeInTheDocument();
  });

  it('calls onFilterChange when patient filter changes', async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = vi.fn();

    render(
      <PrescriptionFilters
        onFilterChange={mockOnFilterChange}
        patients={mockPatients}
        medications={mockMedications}
      />
    );

    const patientSelect = screen.getByLabelText('Patient');
    await user.selectOptions(patientSelect, '1');

    await waitFor(
      () => {
        expect(mockOnFilterChange).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('calls onFilterChange when status filter changes', async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = vi.fn();

    render(
      <PrescriptionFilters
        onFilterChange={mockOnFilterChange}
        patients={mockPatients}
        medications={mockMedications}
      />
    );

    const statusSelect = screen.getByLabelText('Statut');
    await user.selectOptions(statusSelect, 'valide');

    await waitFor(
      () => {
        expect(mockOnFilterChange).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('allows filtering by date ranges', async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = vi.fn();

    const { container } = render(
      <PrescriptionFilters
        onFilterChange={mockOnFilterChange}
        patients={mockPatients}
        medications={mockMedications}
      />
    );

    // Saisir une date dans le premier input date
    const dateInputs = container.querySelectorAll('input[type="date"]');
    await user.type(dateInputs[0] as HTMLElement, '2024-01-01');

    await waitFor(
      () => {
        expect(mockOnFilterChange).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('shows reset button that clears filters', async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = vi.fn();

    render(
      <PrescriptionFilters
        onFilterChange={mockOnFilterChange}
        patients={mockPatients}
        medications={mockMedications}
      />
    );

    const patientSelect = screen.getByLabelText('Patient');
    await user.selectOptions(patientSelect, '1');

    await waitFor(
      () => {
        expect(mockOnFilterChange).toHaveBeenCalled();
      },
      { timeout: 500 }
    );

    // Le bouton s'appelle "Réinitialiser les filtres"
    const resetButton = screen.getByText('Réinitialiser les filtres');
    await user.click(resetButton);

    await waitFor(
      () => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({});
      },
      { timeout: 500 }
    );
  });

  it('supports interval date filtering', async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = vi.fn();

    const { container } = render(
      <PrescriptionFilters
        onFilterChange={mockOnFilterChange}
        patients={mockPatients}
        medications={mockMedications}
      />
    );

    // Passer le premier opérateur de date en mode "intervalle"
    const opSelects = container.querySelectorAll('select.input.w-32');
    await user.selectOptions(opSelects[0] as HTMLElement, 'interval');

    // En mode intervalle, 2 inputs date de début apparaissent
    const dateInputs = container.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBeGreaterThan(1);
  });
});
