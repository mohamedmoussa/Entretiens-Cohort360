/**
 * Composant de formulaire pour créer/éditer une prescription
 */

import { useForm } from 'react-hook-form';
import type { PrescriptionCreate, Patient, Medication } from '../types/api';
import { getStatusLabel } from '../utils/formatters';
import { PRESCRIPTION_STATUSES } from '../constants/prescriptions';

interface Props {
  patients: Patient[];
  medications: Medication[];
  onSubmit: (data: PrescriptionCreate) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: Partial<PrescriptionCreate>;
  isEditing?: boolean;
}

export const PrescriptionForm = ({
  patients,
  medications,
  onSubmit,
  onCancel,
  isLoading,
  initialData,
  isEditing = false,
}: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PrescriptionCreate>({
    defaultValues: initialData || {
      status: 'en_attente',
      comment: '',
    },
  });

  const startDate = watch('start_date');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? 'Modifier' : 'Nouvelle'} prescription
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Patient */}
        <div>
          <label htmlFor="patient" className="label">
            Patient <span className="text-red-500">*</span>
          </label>
          <select
            id="patient"
            {...register('patient', {
              required: 'Le patient est requis',
              valueAsNumber: true,
            })}
            className={`input ${errors.patient ? 'border-red-500' : ''}`}
            disabled={isLoading}
          >
            <option value="">Sélectionner un patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.last_name} {patient.first_name}
                {patient.birth_date && ` - Né(e) le ${patient.birth_date}`}
              </option>
            ))}
          </select>
          {errors.patient && (
            <p className="mt-1 text-sm text-red-500">{errors.patient.message}</p>
          )}
        </div>

        {/* Médicament */}
        <div>
          <label htmlFor="medication" className="label">
            Médicament <span className="text-red-500">*</span>
          </label>
          <select
            id="medication"
            {...register('medication', {
              required: 'Le médicament est requis',
              valueAsNumber: true,
            })}
            className={`input ${errors.medication ? 'border-red-500' : ''}`}
            disabled={isLoading}
          >
            <option value="">Sélectionner un médicament</option>
            {medications.map((med) => (
              <option key={med.id} value={med.id}>
                {med.code} - {med.label}
              </option>
            ))}
          </select>
          {errors.medication && (
            <p className="mt-1 text-sm text-red-500">{errors.medication.message}</p>
          )}
        </div>

        {/* Date de début */}
        <div>
          <label htmlFor="start_date" className="label">
            Date de début <span className="text-red-500">*</span>
          </label>
          <input
            id="start_date"
            type="date"
            {...register('start_date', {
              required: 'La date de début est requise',
            })}
            className={`input ${errors.start_date ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {errors.start_date && (
            <p className="mt-1 text-sm text-red-500">{errors.start_date.message}</p>
          )}
        </div>

        {/* Date de fin */}
        <div>
          <label htmlFor="end_date" className="label">
            Date de fin <span className="text-red-500">*</span>
          </label>
          <input
            id="end_date"
            type="date"
            {...register('end_date', {
              required: 'La date de fin est requise',
              validate: (value) => {
                if (startDate && value < startDate) {
                  return 'La date de fin doit être postérieure ou égale à la date de début';
                }
                return true;
              },
            })}
            className={`input ${errors.end_date ? 'border-red-500' : ''}`}
            disabled={isLoading}
            min={startDate}
          />
          {errors.end_date && (
            <p className="mt-1 text-sm text-red-500">{errors.end_date.message}</p>
          )}
        </div>

        {/* Statut */}
        <div>
          <label htmlFor="status" className="label">
            Statut <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            {...register('status', {
              required: 'Le statut est requis',
            })}
            className={`input ${errors.status ? 'border-red-500' : ''}`}
            disabled={isLoading}
          >
            {PRESCRIPTION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
          )}
        </div>

        {/* Commentaire */}
        <div className="md:col-span-2">
          <label htmlFor="comment" className="label">
            Commentaire (optionnel)
          </label>
          <textarea
            id="comment"
            {...register('comment')}
            className="input"
            rows={3}
            disabled={isLoading}
            placeholder="Ajouter un commentaire..."
          />
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'En cours...' : isEditing ? 'Mettre à jour' : 'Créer'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
};
