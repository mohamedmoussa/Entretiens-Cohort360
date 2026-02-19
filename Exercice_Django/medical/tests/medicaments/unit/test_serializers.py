"""
Tests unitaires pour le serializer Medication.
"""

import pytest

from medical.serializers import MedicationSerializer
from medical.tests.factories import MedicationFactory


@pytest.mark.unit
@pytest.mark.django_db
class TestMedicationSerializer:
    """Tests du serializer Medication."""

    def test_serializes_expected_fields(self):
        """Le serializer expose exactement les champs id, code, label, status."""
        medication = MedicationFactory(
            code="PARA500",
            label="Paracétamol 500mg",
            status="actif",
        )
        data = MedicationSerializer(medication).data

        assert set(data.keys()) == {"id", "code", "label", "status"}
        assert data["code"] == "PARA500"
        assert data["label"] == "Paracétamol 500mg"
        assert data["status"] == "actif"

    def test_deserializes_valid_data_and_saves(self):
        """Le serializer crée un Medication à partir de données valides."""
        payload = {"code": "IBU400", "label": "Ibuprofène 400mg", "status": "actif"}
        serializer = MedicationSerializer(data=payload)

        assert serializer.is_valid(), serializer.errors
        med = serializer.save()

        assert med.pk is not None
        assert med.code == "IBU400"

    def test_missing_code_is_invalid(self):
        """Le code est obligatoire."""
        serializer = MedicationSerializer(data={"label": "Test", "status": "actif"})

        assert not serializer.is_valid()
        assert "code" in serializer.errors
