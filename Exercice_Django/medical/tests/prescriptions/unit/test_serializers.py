"""
Tests unitaires pour le serializer Prescription.
"""

from datetime import date, timedelta

import pytest

from medical.models import Prescription
from medical.serializers import PrescriptionSerializer
from medical.tests.factories import (
    MedicationFactory,
    PatientFactory,
    PrescriptionFactory,
)


@pytest.mark.unit
@pytest.mark.django_db
class TestPrescriptionSerializer:
    """Tests du serializer Prescription."""

    def test_serializes_expected_fields(self, prescription):
        """Le serializer expose exactement les champs attendus."""
        data = PrescriptionSerializer(prescription).data

        expected_fields = {
            "id",
            "patient",
            "patient_details",
            "medication",
            "medication_details",
            "start_date",
            "end_date",
            "status",
            "comment",
        }
        assert set(data.keys()) == expected_fields

    def test_patient_details_is_nested_object(self, prescription):
        """patient_details est un objet imbriqué avec les infos du patient."""
        data = PrescriptionSerializer(prescription).data
        details = data["patient_details"]

        assert isinstance(details, dict)
        assert details["id"] == prescription.patient.id
        assert details["last_name"] == prescription.patient.last_name
        assert details["first_name"] == prescription.patient.first_name

    def test_medication_details_is_nested_object(self, prescription):
        """medication_details est un objet imbriqué avec les infos du médicament."""
        data = PrescriptionSerializer(prescription).data
        details = data["medication_details"]

        assert isinstance(details, dict)
        assert details["id"] == prescription.medication.id
        assert details["code"] == prescription.medication.code

    def test_patient_details_is_read_only(self, patient, medication):
        """patient_details en lecture seule : le fournir en écriture est ignoré."""
        payload = {
            "patient": patient.id,
            "medication": medication.id,
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
            "status": "valide",
            "patient_details": {"last_name": "Hacker", "first_name": "X"},
        }
        serializer = PrescriptionSerializer(data=payload)

        assert serializer.is_valid(), serializer.errors
        assert "patient_details" not in serializer.validated_data

    def test_medication_details_is_read_only(self, patient, medication):
        """medication_details en lecture seule : le fournir en écriture est ignoré."""
        payload = {
            "patient": patient.id,
            "medication": medication.id,
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
            "status": "valide",
            "medication_details": {"code": "HACKED", "label": "X", "status": "actif"},
        }
        serializer = PrescriptionSerializer(data=payload)

        assert serializer.is_valid(), serializer.errors
        assert "medication_details" not in serializer.validated_data

    def test_id_is_read_only(self, patient, medication):
        """Le champ id ne peut pas être imposé à la création."""
        payload = {
            "id": 9999,
            "patient": patient.id,
            "medication": medication.id,
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
            "status": "valide",
        }
        serializer = PrescriptionSerializer(data=payload)

        assert serializer.is_valid(), serializer.errors
        assert "id" not in serializer.validated_data

    def test_validate_rejects_end_date_before_start_date(self, patient, medication):
        """La validation rejette end_date < start_date."""
        payload = {
            "patient": patient.id,
            "medication": medication.id,
            "start_date": "2024-06-30",
            "end_date": "2024-06-01",
            "status": "valide",
        }
        serializer = PrescriptionSerializer(data=payload)

        assert not serializer.is_valid()
        assert "end_date" in serializer.errors

    def test_validate_accepts_same_start_and_end_date(self, patient, medication):
        """Une prescription d'un jour (start == end) est valide."""
        payload = {
            "patient": patient.id,
            "medication": medication.id,
            "start_date": "2024-01-01",
            "end_date": "2024-01-01",
            "status": "valide",
        }
        serializer = PrescriptionSerializer(data=payload)

        assert serializer.is_valid(), serializer.errors

    def test_partial_update_uses_existing_start_date_for_validation(self, prescription):
        """PATCH : la validation compare end_date avec la start_date existante."""
        same_day = str(prescription.start_date)
        serializer = PrescriptionSerializer(
            prescription, data={"end_date": same_day}, partial=True
        )

        assert serializer.is_valid(), serializer.errors

    def test_partial_update_rejects_end_date_before_existing_start_date(
        self, prescription
    ):
        """PATCH : end_date < start_date existante est invalide."""
        invalid_end = str(prescription.start_date - timedelta(days=1))
        serializer = PrescriptionSerializer(
            prescription, data={"end_date": invalid_end}, partial=True
        )

        assert not serializer.is_valid()
        assert "end_date" in serializer.errors

    def test_default_status_is_en_attente_when_not_provided(self, patient, medication):
        """Sans status fourni, le modèle applique le défaut 'en_attente'."""
        payload = {
            "patient": patient.id,
            "medication": medication.id,
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
        }
        serializer = PrescriptionSerializer(data=payload)

        assert serializer.is_valid(), serializer.errors
        instance = serializer.save()
        assert instance.status == Prescription.STATUS_EN_ATTENTE

    def test_missing_required_fields_are_invalid(self):
        """patient, medication, start_date et end_date sont obligatoires."""
        serializer = PrescriptionSerializer(data={})

        assert not serializer.is_valid()
        for field in ("patient", "medication", "start_date", "end_date"):
            assert (
                field in serializer.errors
            ), f"Champ manquant dans les erreurs : {field}"
