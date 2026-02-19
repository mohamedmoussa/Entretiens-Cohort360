/**
 * Page de liste des prescriptions
 */

import { useNavigate } from 'react-router-dom';
import { PrescriptionFilters } from '../components/PrescriptionFilters';
import { PrescriptionList } from '../components/PrescriptionList';
import { usePrescriptionsContext } from '../context/PrescriptionsContext';
import { PAGE_SIZE_OPTIONS } from '../constants/prescriptions';
import type { Patient, Medication, Prescription, PrescriptionFilters as Filters } from '../types/api';

interface PrescriptionsListPageProps {
  prescriptions: Prescription[];
  count: number;
  loadingPrescriptions: boolean;
  prescriptionsError: Error | null;
  patients: Patient[];
  medications: Medication[];
  isLoading: boolean;
}

export const PrescriptionsListPage = ({
  prescriptions,
  count,
  loadingPrescriptions,
  prescriptionsError,
  patients,
  medications,
  isLoading,
}: PrescriptionsListPageProps) => {
  const navigate = useNavigate();
  const { page, pageSize, setPage, setPageSize, setFilters, setEditingPrescription, setDeleteConfirmId } = usePrescriptionsContext();
  const totalPages = Math.ceil(count / pageSize);

  const handleFilterChange = (newFilters: Filters) => {
    setPage(1);
    setFilters(newFilters);
  };

  const handlePageSizeChange = (size: number) => {
    setPage(1);
    setPageSize(size);
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    navigate(`/prescriptions/${prescription.id}/edit`);
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmId(id);
  };

  return (
    <>
      <PrescriptionFilters
        patients={patients}
        medications={medications}
        onFilterChange={handleFilterChange}
      />

      {prescriptionsError && (
        <div role="alert" className="card text-center py-8 text-red-600">
          Impossible de charger les prescriptions : {prescriptionsError.message}
        </div>
      )}

      {!prescriptionsError && (
        <PrescriptionList
          prescriptions={prescriptions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={loadingPrescriptions}
        />
      )}

      {/* Contrôles de pagination */}
      {!prescriptionsError && count > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            Page <span className="font-medium">{page}</span> sur{' '}
            <span className="font-medium">{totalPages}</span> —{' '}
            <span className="font-medium">{count}</span> résultat{count > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-3">
            {/* Sélecteur de taille de page */}
            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-sm text-gray-600 whitespace-nowrap">
                Lignes par page :
              </label>
              <select
                id="page-size"
                className="input py-1 w-20"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            {/* Boutons navigation */}
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="btn btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Précédent
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="btn btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicateurs de chargement des données de référence */}
      {isLoading && !prescriptionsError && (
        <div className="card text-center py-8">
          <p className="text-gray-500">Chargement des données...</p>
        </div>
      )}
    </>
  );
};
