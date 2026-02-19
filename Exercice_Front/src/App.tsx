/**
 * Composant principal de l'application — orchestrateur avec routing
 * Version refactorisée pour éviter props drilling et logique excessive
 */

import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  usePrescriptions,
  usePatients,
  useMedications,
} from './hooks/useApi';
import { usePrescriptionsContext } from './context/PrescriptionsContext';
import { usePrescriptionLogic } from './hooks/usePrescriptionLogic';
import { AppHeader } from './layout/AppHeader';
import { AppFooter } from './layout/AppFooter';
import { ConfirmModal } from './components/ConfirmModal';
import { PrescriptionsListPage } from './pages/PrescriptionsListPage';
import { PrescriptionFormPage } from './pages/PrescriptionFormPage';

/**
 * AppContent - Composant interne pour réduire complexité App
 * Utilise les hooks et context pour la logique
 */
const AppContent = () => {
  const {
    page,
    pageSize,
    filters,
    setPage,
    setPageSize,
    setFilters,
    errorMessage,
    setErrorMessage,
    deleteConfirmId,
    setDeleteConfirmId,
    editingPrescription,
  } = usePrescriptionsContext();

  const {
    data: prescriptionsPage,
    isLoading: loadingPrescriptions,
    error: prescriptionsError,
  } = usePrescriptions({ ...filters, page, page_size: pageSize });

  const { data: patients = [], isLoading: loadingPatients, error: patientsError } = usePatients();
  const { data: medications = [], isLoading: loadingMedications, error: medicationsError } = useMedications();

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    handleSubmitPrescription,
    handleCancelForm,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = usePrescriptionLogic();

  const formIsLoading = createMutation.isPending || updateMutation.isPending;

  const isLoading = loadingPatients || loadingMedications;
  const globalError = patientsError ?? medicationsError;

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader
        isLoading={isLoading}
        onCreateNew={() => navigate('/prescriptions/create')}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {globalError && (
          <div
            role="alert"
            className="mb-6 rounded-md bg-red-50 border border-red-200 p-4 text-red-700"
          >
            <strong>Erreur de chargement :</strong>{' '}
            {globalError.message || 'Impossible de récupérer les données. Veuillez recharger la page.'}
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between rounded-md bg-red-50 border border-red-200 p-4 text-red-700"
          >
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-4 text-red-500 hover:text-red-700 font-bold"
              aria-label="Fermer le message d'erreur"
            >
              ✕
            </button>
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <PrescriptionsListPage
                prescriptions={prescriptionsPage?.results ?? []}
                count={prescriptionsPage?.count ?? 0}
                loadingPrescriptions={loadingPrescriptions}
                prescriptionsError={prescriptionsError}
                patients={patients}
                medications={medications}
                isLoading={isLoading}
              />
            }
          />
          <Route
            path="/prescriptions/create"
            element={
              <PrescriptionFormPage
                patients={patients}
                medications={medications}
                editingPrescription={null}
                isLoading={formIsLoading}
                onSubmit={handleSubmitPrescription}
                onCancel={handleCancelForm}
              />
            }
          />
          <Route
            path="/prescriptions/:id/edit"
            element={
              <PrescriptionFormPage
                patients={patients}
                medications={medications}
                editingPrescription={editingPrescription}
                isLoading={formIsLoading}
                onSubmit={handleSubmitPrescription}
                onCancel={handleCancelForm}
              />
            }
          />
        </Routes>
      </main>

      <AppFooter />

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Supprimer la prescription"
        message="Êtes-vous sûr de vouloir supprimer cette prescription ? Cette action est irréversible."
        confirmLabel="Confirmer la suppression"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

/**
 * App - Composant racine mince
 * Fournit les providers et renders le contenu
 */
export const App = () => {
  return <AppContent />;
};
