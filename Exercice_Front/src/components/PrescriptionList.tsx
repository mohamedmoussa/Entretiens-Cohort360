/**
 * Composant d'affichage de la liste des prescriptions
 */

import { Pencil, Trash2 } from 'lucide-react';
import type { Prescription } from '../types/api';
import { formatDate, getStatusLabel, getStatusColor } from '../utils/formatters';

interface Props {
  prescriptions: Prescription[];
  onDelete?: (id: number) => void;
  onEdit?: (prescription: Prescription) => void;
  isLoading?: boolean;
}

export const PrescriptionList = ({ prescriptions, onDelete, onEdit, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">
          Aucune prescription trouvée
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Médicament
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date début
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date fin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commentaire
              </th>
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prescriptions.map((prescription) => (
              <tr key={prescription.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {prescription.patient_details.last_name} {prescription.patient_details.first_name}
                  </div>
                  {prescription.patient_details.birth_date && (
                    <div className="text-sm text-gray-500">
                      Né(e) le {formatDate(prescription.patient_details.birth_date)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {prescription.medication_details.code}
                  </div>
                  <div className="text-sm text-gray-500">
                    {prescription.medication_details.label}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(prescription.start_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(prescription.end_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      prescription.status
                    )}`}
                  >
                    {getStatusLabel(prescription.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {prescription.comment || '-'}
                </td>
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-3">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(prescription)}
                          className="text-blue-600 hover:text-blue-900"
                          aria-label="Modifier la prescription"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(prescription.id)}
                          className="text-red-600 hover:text-red-900"
                          aria-label="Supprimer la prescription"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500">
        {prescriptions.length} prescription{prescriptions.length > 1 ? 's' : ''}
      </div>
    </div>
  );
};
