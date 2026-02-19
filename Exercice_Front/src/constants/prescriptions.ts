/**
 * Constantes partagées pour les prescriptions
 */

import { PrescriptionStatus } from '../types/api';

/** Statuts possibles d'une prescription */
export const PRESCRIPTION_STATUSES: PrescriptionStatus[] = [
  'valide',
  'en_attente',
  'suppr',
];

/** Options de taille de page pour la pagination */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
