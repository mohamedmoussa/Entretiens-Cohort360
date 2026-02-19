import { PrescriptionForm } from '../components/PrescriptionForm';
import type { Patient, Medication, Prescription, PrescriptionCreate } from '../types/api';

interface PrescriptionFormPageProps {
  patients: Patient[];
  medications: Medication[];
  editingPrescription: Prescription | null;
  isLoading: boolean;
  onSubmit: (data: PrescriptionCreate) => Promise<void>;
  onCancel: () => void;
}

export const PrescriptionFormPage = ({
  patients,
  medications,
  editingPrescription,
  isLoading,
  onSubmit,
  onCancel,
}: PrescriptionFormPageProps) => (
  <div className="mb-6">
    <PrescriptionForm
      patients={patients}
      medications={medications}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      initialData={
        editingPrescription
          ? {
              patient: editingPrescription.patient,
              medication: editingPrescription.medication,
              start_date: editingPrescription.start_date,
              end_date: editingPrescription.end_date,
              status: editingPrescription.status,
              comment: editingPrescription.comment,
            }
          : undefined
      }
      isEditing={!!editingPrescription}
    />
  </div>
);
