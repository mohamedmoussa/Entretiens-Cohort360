import { useLocation, useNavigate } from 'react-router-dom';

interface AppHeaderProps {
  isLoading: boolean;
  onCreateNew: () => void;
}

export const AppHeader = ({ isLoading, onCreateNew }: AppHeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isFormPage = location.pathname.startsWith('/prescriptions');

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des Prescriptions
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Système de gestion des prescriptions médicamenteuses
            </p>
          </div>
          <button
            onClick={isFormPage ? () => navigate('/') : onCreateNew}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isFormPage ? 'Annuler' : '+ Nouvelle prescription'}
          </button>
        </div>
      </div>
    </header>
  );
};
