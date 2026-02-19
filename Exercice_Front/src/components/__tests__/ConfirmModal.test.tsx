import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmModal } from '../ConfirmModal';

describe('ConfirmModal', () => {
  it('does not render when isOpen is false', () => {
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    const { container } = render(
      <ConfirmModal
        isOpen={false}
        title="Delete Item"
        message="Are you sure?"
        confirmLabel="Delete"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders modal when isOpen is true', () => {
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        confirmLabel="Delete"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        confirmLabel="Delete"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByText('Delete');
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        confirmLabel="Delete"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Annuler');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables confirm button when isLoading is true', () => {
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        confirmLabel="Delete"
        isLoading={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // isLoading=true : le bouton affiche "Suppression..." (non le confirmLabel)
    const confirmButton = screen.getByText('Suppression...');
    expect(confirmButton).toBeDisabled();
  });

});
