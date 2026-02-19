"""
Tests unitaires pour le serializer Patient.
"""

from datetime import date

import pytest

from medical.serializers import PatientSerializer
from medical.tests.factories import PatientFactory


@pytest.mark.unit
@pytest.mark.django_db
class TestPatientSerializer:
    """Tests du serializer Patient."""

    def test_serializes_expected_fields(self):
        """Le serializer expose exactement les champs id, last_name, first_name, birth_date."""
        patient = PatientFactory(
            last_name="Dupont",
            first_name="Jean",
            birth_date=date(1980, 5, 15),
        )
        data = PatientSerializer(patient).data

        assert set(data.keys()) == {"id", "last_name", "first_name", "birth_date"}
        assert data["last_name"] == "Dupont"
        assert data["first_name"] == "Jean"
        assert data["birth_date"] == "1980-05-15"
        assert data["id"] == patient.id

    def test_birth_date_is_none_when_not_set(self):
        """birth_date est null en JSON quand il n'est pas renseigné."""
        patient = PatientFactory(birth_date=None)
        data = PatientSerializer(patient).data

        assert data["birth_date"] is None

    def test_deserializes_valid_data_and_saves(self):
        """Le serializer crée un Patient à partir de données valides."""
        payload = {
            "last_name": "Martin",
            "first_name": "Sophie",
            "birth_date": "1990-03-20",
        }
        serializer = PatientSerializer(data=payload)

        assert serializer.is_valid(), serializer.errors
        patient = serializer.save()

        assert patient.pk is not None
        assert patient.last_name == "Martin"
        assert patient.birth_date == date(1990, 3, 20)

    def test_missing_required_fields_are_invalid(self):
        """last_name et first_name sont obligatoires."""
        serializer = PatientSerializer(data={"birth_date": "1990-01-01"})

        assert not serializer.is_valid()
        assert "last_name" in serializer.errors
        assert "first_name" in serializer.errors
