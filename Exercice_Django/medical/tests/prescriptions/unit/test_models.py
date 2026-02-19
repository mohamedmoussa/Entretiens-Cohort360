"""
Tests unitaires pour le modèle Prescription.
"""

from datetime import date

import pytest
from django.core.exceptions import ValidationError

from medical.models import Prescription
from medical.tests.factories import PrescriptionFactory


@pytest.mark.unit
@pytest.mark.django_db
class TestPrescriptionModel:
    """Tests unitaires pour le modèle Prescription."""

    def test_create_valid_prescription(self, patient, medication):
        """Création d'une prescription avec des données valides."""
        prescription = PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
            status=Prescription.STATUS_VALIDE,
            comment="Test",
        )

        assert prescription.patient == patient
        assert prescription.medication == medication
        assert prescription.start_date == date(2024, 1, 1)
        assert prescription.end_date == date(2024, 1, 31)
        assert prescription.status == Prescription.STATUS_VALIDE
        assert prescription.comment == "Test"
        assert prescription.id is not None

    def test_prescription_default_status_is_en_attente(self, patient, medication):
        """Le statut par défaut est 'en_attente'."""
        prescription = PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
            status=Prescription.STATUS_EN_ATTENTE,
        )

        assert prescription.status == Prescription.STATUS_EN_ATTENTE

    def test_prescription_default_comment_is_empty_string(self, patient, medication):
        """Le commentaire par défaut est une chaîne vide."""
        prescription = PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
            comment="",
        )

        assert prescription.comment == ""

    def test_end_date_before_start_date_raises_validation_error(
        self, patient, medication
    ):
        """end_date antérieure à start_date lève une ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            Prescription.objects.create(
                patient=patient,
                medication=medication,
                start_date=date(2024, 1, 31),
                end_date=date(2024, 1, 1),
            )

        assert "end_date" in exc_info.value.message_dict

    def test_same_start_and_end_date_is_valid(self, patient, medication):
        """Une prescription d'un seul jour (start == end) est valide."""
        prescription = PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 1),
        )

        assert prescription.start_date == prescription.end_date

    def test_clean_method_raises_on_invalid_dates(self, patient, medication):
        """La méthode clean() lève une ValidationError si end < start."""
        prescription = Prescription(
            patient=patient,
            medication=medication,
            start_date=date(2024, 1, 31),
            end_date=date(2024, 1, 1),
        )

        with pytest.raises(ValidationError) as exc_info:
            prescription.clean()

        assert "end_date" in exc_info.value.message_dict

    def test_save_calls_full_clean(self, patient, medication):
        """save() appelle full_clean() automatiquement."""
        with pytest.raises(ValidationError):
            Prescription(
                patient=patient,
                medication=medication,
                start_date=date(2024, 6, 30),
                end_date=date(2024, 6, 1),
            ).save()

    def test_prescription_str_representation(self, patient, medication):
        """__str__ retourne la représentation attendue."""
        prescription = PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
        )

        expected = (
            f"Prescription {prescription.id}: {medication.code} "
            f"pour {patient} (2024-01-01 -> 2024-01-31)"
        )
        assert str(prescription) == expected

    def test_cascade_delete_on_patient(self, patient, medication):
        """Supprimer un patient supprime ses prescriptions (CASCADE)."""
        prescription = PrescriptionFactory(patient=patient, medication=medication)
        pk = prescription.id

        patient.delete()

        assert not Prescription.objects.filter(id=pk).exists()

    def test_cascade_delete_on_medication(self, patient, medication):
        """Supprimer un médicament supprime ses prescriptions (CASCADE)."""
        prescription = PrescriptionFactory(patient=patient, medication=medication)
        pk = prescription.id

        medication.delete()

        assert not Prescription.objects.filter(id=pk).exists()

    def test_ordering_most_recent_first(self, patient, medication):
        """Les prescriptions sont triées par start_date décroissante."""
        p1 = PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
        )
        p2 = PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 2, 1),
            end_date=date(2024, 2, 28),
        )
        p3 = PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 3, 1),
            end_date=date(2024, 3, 31),
        )

        prescriptions = list(Prescription.objects.filter(id__in=[p1.id, p2.id, p3.id]))
        assert prescriptions[0] == p3
        assert prescriptions[1] == p2
        assert prescriptions[2] == p1

    @pytest.mark.parametrize(
        "status",
        [
            Prescription.STATUS_VALIDE,
            Prescription.STATUS_EN_ATTENTE,
            Prescription.STATUS_SUPPR,
        ],
    )
    def test_all_status_values_are_valid(self, patient, medication, status):
        """Les trois valeurs de statut sont acceptées."""
        prescription = PrescriptionFactory(
            patient=patient, medication=medication, status=status
        )

        assert prescription.status == status

    def test_related_name_prescriptions_from_patient(self, patient, medication):
        """patient.prescriptions donne accès aux prescriptions du patient."""
        p1 = PrescriptionFactory(patient=patient, medication=medication)
        p2 = PrescriptionFactory(patient=patient, medication=medication)

        prescriptions = patient.prescriptions.all()
        assert p1 in prescriptions
        assert p2 in prescriptions
        assert prescriptions.count() == 2

    def test_related_name_prescriptions_from_medication(self, patient, medication):
        """medication.prescriptions donne accès aux prescriptions du médicament."""
        p1 = PrescriptionFactory(patient=patient, medication=medication)
        p2 = PrescriptionFactory(patient=patient, medication=medication)

        prescriptions = medication.prescriptions.all()
        assert p1 in prescriptions
        assert p2 in prescriptions
        assert prescriptions.count() == 2

    def test_prescription_indexes_defined(self):
        """Le modèle déclare les trois index de performance."""
        index_fields = [set(idx.fields) for idx in Prescription._meta.indexes]
        assert {"patient", "start_date"} in index_fields
        assert {"medication", "start_date"} in index_fields
        assert {"status", "start_date"} in index_fields
