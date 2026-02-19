import { describe, it, expect } from 'vitest';
import { formatDate, getStatusLabel, getStatusColor } from '../formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('should format date correctly in French format', () => {
      expect(formatDate('2024-01-15')).toBe('15/01/2024');
      expect(formatDate('2024-12-31')).toBe('31/12/2024');
    });

    it('should handle different date formats', () => {
      expect(formatDate('2024-01-01')).toBe('01/01/2024');
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct label for each status', () => {
      expect(getStatusLabel('valide')).toBe('Valide');
      expect(getStatusLabel('en_attente')).toBe('En attente');
      expect(getStatusLabel('suppr')).toBe('Supprimé');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color classes for each status', () => {
      expect(getStatusColor('valide')).toContain('green');
      expect(getStatusColor('en_attente')).toContain('yellow');
      expect(getStatusColor('suppr')).toContain('red');
    });
  });
});
