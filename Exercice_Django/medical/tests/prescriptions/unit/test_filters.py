"""
Tests unitaires pour le filtre PrescriptionFilter.
"""

from datetime import date

import pytest

from medical.filters import PrescriptionFilter
from medical.tests.factories import (
    MedicationFactory,
    PatientFactory,
    PrescriptionFactory,
)


@pytest.mark.unit
@pytest.mark.django_db
class TestPrescriptionFilter:
    """Tests du filtre PrescriptionFilter."""

    def test_filter_by_patient_id(self, patient):
        """Le filtre 'patient' retourne les prescriptions du patient donné."""
        PrescriptionFactory.create_batch(3, patient=patient)
        PrescriptionFactory()

        qs = PrescriptionFilter(data={"patient": patient.id}).qs
        assert qs.count() == 3
        assert all(p.patient == patient for p in qs)

    def test_filter_by_medication_id(self, medication):
        """Le filtre 'medication' retourne les prescriptions du médicament donné."""
        PrescriptionFactory.create_batch(2, medication=medication)
        PrescriptionFactory()

        qs = PrescriptionFilter(data={"medication": medication.id}).qs
        assert qs.count() == 2
        assert all(p.medication == medication for p in qs)

    def test_filter_by_status_valide(self):
        """Le filtre 'status=valide' retourne uniquement les prescriptions valides."""
        PrescriptionFactory.create_batch(2, status="valide")
        PrescriptionFactory(status="en_attente")

        qs = PrescriptionFilter(data={"status": "valide"}).qs
        assert qs.count() == 2
        assert all(p.status == "valide" for p in qs)

    def test_filter_by_status_en_attente(self):
        """Le filtre 'status=en_attente' retourne uniquement les prescriptions en attente."""
        PrescriptionFactory(status="valide")
        p = PrescriptionFactory(status="en_attente")

        qs = PrescriptionFilter(data={"status": "en_attente"}).qs
        assert p in qs
        assert all(p.status == "en_attente" for p in qs)

    def test_filter_start_date_exact(self, patient, medication):
        """start_date filtre sur la date exacte de début."""
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
        )
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 2, 1),
            end_date=date(2024, 2, 28),
        )

        qs = PrescriptionFilter(data={"start_date": "2024-01-01"}).qs
        assert qs.count() == 1
        assert qs.first().start_date == date(2024, 1, 1)

    def test_filter_start_date_gte(self, patient, medication):
        """start_date_gte retourne les prescriptions commençant le ou après la date."""
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
        )
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 2, 1),
            end_date=date(2024, 2, 28),
        )
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 3, 1),
            end_date=date(2024, 3, 31),
        )

        qs = PrescriptionFilter(data={"start_date_gte": "2024-02-01"}).qs
        assert qs.count() == 2
        for p in qs:
            assert p.start_date >= date(2024, 2, 1)

    def test_filter_start_date_lte(self, patient, medication):
        """start_date_lte retourne les prescriptions commençant le ou avant la date."""
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
        )
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 2, 1),
            end_date=date(2024, 2, 28),
        )

        qs = PrescriptionFilter(data={"start_date_lte": "2024-01-31"}).qs
        assert qs.count() == 1
        assert qs.first().start_date == date(2024, 1, 1)

    def test_filter_start_date_gt(self, patient, medication):
        """start_date_gt retourne les prescriptions commençant strictement après la date."""
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
        )
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 2, 1),
            end_date=date(2024, 2, 28),
        )

        qs = PrescriptionFilter(data={"start_date_gt": "2024-01-01"}).qs
        assert qs.count() == 1
        assert qs.first().start_date == date(2024, 2, 1)

    def test_filter_start_date_lt(self, patient, medication):
        """start_date_lt retourne les prescriptions commençant strictement avant la date."""
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
        )
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 2, 1),
            end_date=date(2024, 2, 28),
        )

        qs = PrescriptionFilter(data={"start_date_lt": "2024-02-01"}).qs
        assert qs.count() == 1
        assert qs.first().start_date == date(2024, 1, 1)

    def test_filter_end_date_lte(self, patient, medication):
        """end_date_lte retourne les prescriptions se terminant le ou avant la date."""
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
        )
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 2, 1),
            end_date=date(2024, 3, 31),
        )

        qs = PrescriptionFilter(data={"end_date_lte": "2024-01-31"}).qs
        assert qs.count() == 1
        assert qs.first().end_date == date(2024, 1, 31)

    def test_filter_end_date_gte(self, patient, medication):
        """end_date_gte retourne les prescriptions se terminant le ou après la date."""
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
        )
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            start_date=date(2024, 2, 1),
            end_date=date(2024, 3, 31),
        )

        qs = PrescriptionFilter(data={"end_date_gte": "2024-02-01"}).qs
        assert qs.count() == 1
        assert qs.first().end_date == date(2024, 3, 31)

    def test_combined_filters_patient_and_status(self, patient, medication):
        """La combinaison de filtres patient + status fonctionne correctement."""
        other = PatientFactory()
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            status="valide",
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
        )
        PrescriptionFactory(
            patient=patient,
            medication=medication,
            status="en_attente",
            start_date=date(2024, 2, 1),
            end_date=date(2024, 2, 28),
        )
        PrescriptionFactory(
            patient=other,
            medication=medication,
            status="valide",
            start_date=date(2024, 3, 1),
            end_date=date(2024, 3, 31),
        )

        qs = PrescriptionFilter(data={"patient": patient.id, "status": "valide"}).qs
        assert qs.count() == 1
        assert qs.first().patient == patient
        assert qs.first().status == "valide"

    def test_no_filter_returns_all(self):
        """Sans filtre, toutes les prescriptions sont retournées."""
        PrescriptionFactory.create_batch(3)

        qs = PrescriptionFilter(data={}).qs
        assert qs.count() == 3
