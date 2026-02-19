import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppFooter } from '../AppFooter';

describe('AppFooter', () => {
  it('renders footer text', () => {
    render(<AppFooter />);

    expect(
      screen.getByText('Application de gestion des prescriptions - React + TypeScript')
    ).toBeInTheDocument();
  });

  it('renders a footer element', () => {
    const { container } = render(<AppFooter />);

    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
