/**
 * Fonctions utilitaires pour le formatage des données
 */

import type { PrescriptionStatus } from '../types/api';

/**
 * Formate une date au format français
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Retourne le label français pour un statut
 */
export const getStatusLabel = (status: PrescriptionStatus): string => {
  const labels: Record<PrescriptionStatus, string> = {
    valide: 'Valide',
    en_attente: 'En attente',
    suppr: 'Supprimé',
  };
  return labels[status];
};

/**
 * Retourne les classes CSS pour la couleur d'un statut
 */
export const getStatusColor = (status: PrescriptionStatus): string => {
  const colors: Record<PrescriptionStatus, string> = {
    valide: 'bg-green-100 text-green-800',
    en_attente: 'bg-yellow-100 text-yellow-800',
    suppr: 'bg-red-100 text-red-800',
  };
  return colors[status];
};
