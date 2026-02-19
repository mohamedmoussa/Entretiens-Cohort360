from typing import Any

from rest_framework import serializers

from medical.models import Prescription
from medical.serializers.medication import MedicationSerializer
from medical.serializers.patient import PatientSerializer


class PrescriptionSerializer(serializers.ModelSerializer):
    """Serializer pour les prescriptions médicamenteuses.

    Inclut ``patient_details`` et ``medication_details`` en lecture seule pour
    exposer les objets imbriqués sans modifier les clés étrangères d'écriture.
    """

    patient_details = PatientSerializer(source="patient", read_only=True)
    medication_details = MedicationSerializer(source="medication", read_only=True)

    class Meta:
        model = Prescription
        fields = [
            "id",
            "patient",
            "patient_details",
            "medication",
            "medication_details",
            "start_date",
            "end_date",
            "status",
            "comment",
        ]
        read_only_fields = ["id", "patient_details", "medication_details"]

    def validate(self, data: dict[str, Any]) -> dict[str, Any]:
        """Valide que la date de fin est postérieure ou égale à la date de début.

        Args:
            data: Dictionnaire des données de la prescription.

        Returns:
            dict[str, Any]: Les données validées.

        Raises:
            serializers.ValidationError: Si end_date < start_date.
        """
        start_date = data.get("start_date")
        end_date = data.get("end_date")

        if self.instance:
            start_date = start_date or self.instance.start_date
            end_date = end_date or self.instance.end_date

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                {
                    "end_date": "La date de fin doit être postérieure ou égale à la date de début."
                }
            )

        return data
