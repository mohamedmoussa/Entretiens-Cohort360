/**
 * Error Boundary component pour capturer les erreurs React
 * Standard 2026 pour la robustesse
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="max-w-md w-full bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Oups! Une erreur est survenue
            </h1>
            <p className="text-gray-600 mb-4">
              L'application a rencontré une erreur inattendue. Veuillez recharger la page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-4 bg-red-50 rounded text-sm text-red-700">
                <summary className="cursor-pointer font-semibold">
                  Détails de l'erreur (développement)
                </summary>
                <pre className="mt-2 overflow-auto">{this.state.error.toString()}</pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full btn btn-primary"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
