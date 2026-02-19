import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppHeader } from '../AppHeader';

describe('AppHeader', () => {
  it('renders the application title', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppHeader isLoading={false} onCreateNew={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Gestion des Prescriptions')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppHeader isLoading={false} onCreateNew={vi.fn()} />
      </MemoryRouter>
    );

    expect(
      screen.getByText('Système de gestion des prescriptions médicamenteuses')
    ).toBeInTheDocument();
  });

  it('shows "+ Nouvelle prescription" button on home page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppHeader isLoading={false} onCreateNew={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('+ Nouvelle prescription')).toBeInTheDocument();
  });

  it('shows "Annuler" button on form page', () => {
    render(
      <MemoryRouter initialEntries={['/prescriptions/new']}>
        <AppHeader isLoading={false} onCreateNew={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Annuler')).toBeInTheDocument();
  });

  it('calls onCreateNew when button clicked on home page', async () => {
    const user = userEvent.setup();
    const mockOnCreateNew = vi.fn();

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppHeader isLoading={false} onCreateNew={mockOnCreateNew} />
      </MemoryRouter>
    );

    await user.click(screen.getByText('+ Nouvelle prescription'));
    expect(mockOnCreateNew).toHaveBeenCalled();
  });

  it('disables button when isLoading is true', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppHeader isLoading={true} onCreateNew={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('+ Nouvelle prescription')).toBeDisabled();
  });
});
