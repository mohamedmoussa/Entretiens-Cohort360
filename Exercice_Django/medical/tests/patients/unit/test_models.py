"""
Tests unitaires pour le modèle Patient.
"""

from datetime import date

import pytest

from medical.models import Patient
from medical.tests.factories import PatientFactory


@pytest.mark.unit
@pytest.mark.django_db
class TestPatientModel:
    """Tests unitaires pour le modèle Patient."""

    def test_create_patient_with_all_fields(self):
        """Création d'un patient avec tous les champs renseignés."""
        patient = PatientFactory(
            last_name="Dupont",
            first_name="Jean",
            birth_date=date(1980, 5, 15),
        )

        assert patient.last_name == "Dupont"
        assert patient.first_name == "Jean"
        assert patient.birth_date == date(1980, 5, 15)
        assert patient.id is not None

    def test_create_patient_without_birth_date(self):
        """La date de naissance est optionnelle."""
        patient = PatientFactory(birth_date=None)

        assert patient.birth_date is None
        assert patient.last_name
        assert patient.first_name

    def test_patient_str_representation(self):
        """__str__ retourne 'NOM Prénom'."""
        patient = PatientFactory(last_name="Martin", first_name="Sophie")

        assert str(patient) == "Martin Sophie"

    def test_patient_ordering_by_last_name_then_first_name(self):
        """Les patients sont triés par nom, prénom puis id."""
        p1 = PatientFactory(last_name="Dupont", first_name="Alice")
        p2 = PatientFactory(last_name="Dupont", first_name="Bob")
        p3 = PatientFactory(last_name="Martin", first_name="Alice")

        patients = list(Patient.objects.filter(id__in=[p1.id, p2.id, p3.id]))
        assert patients[0] == p1
        assert patients[1] == p2
        assert patients[2] == p3

    def test_patient_last_name_max_length(self):
        """last_name accepte jusqu'à 150 caractères."""
        long_name = "A" * 150
        patient = PatientFactory(last_name=long_name)
        assert len(patient.last_name) == 150

    def test_patient_first_name_max_length(self):
        """first_name accepte jusqu'à 150 caractères."""
        long_name = "B" * 150
        patient = PatientFactory(first_name=long_name)
        assert len(patient.first_name) == 150
