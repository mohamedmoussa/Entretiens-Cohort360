"""
Tests unitaires pour le modèle Medication.
"""

import pytest

from medical.models import Medication
from medical.tests.factories import MedicationFactory


@pytest.mark.unit
@pytest.mark.django_db
class TestMedicationModel:
    """Tests unitaires pour le modèle Medication."""

    def test_create_medication_with_all_fields(self):
        """Création d'un médicament avec tous les champs."""
        medication = MedicationFactory(
            code="PARA500",
            label="Paracétamol 500mg",
            status=Medication.STATUS_ACTIF,
        )

        assert medication.code == "PARA500"
        assert medication.label == "Paracétamol 500mg"
        assert medication.status == Medication.STATUS_ACTIF

    def test_medication_default_status_is_actif(self):
        """Le statut par défaut d'un médicament est 'actif'."""
        medication = MedicationFactory(code="TEST001", label="Test medication")

        assert medication.status == Medication.STATUS_ACTIF

    def test_medication_code_is_unique(self):
        """Deux médicaments ne peuvent pas avoir le même code."""
        MedicationFactory(code="UNIQUE123")

        with pytest.raises(Exception):
            MedicationFactory(code="UNIQUE123")

    def test_medication_str_representation(self):
        """__str__ retourne 'CODE - Label (status)'."""
        medication = MedicationFactory(
            code="IBU400",
            label="Ibuprofène 400mg",
            status=Medication.STATUS_ACTIF,
        )

        assert str(medication) == "IBU400 - Ibuprofène 400mg (actif)"

    def test_medication_ordering_by_code(self):
        """Les médicaments sont triés par code alphabétique."""
        m1 = MedicationFactory(code="AAA001", label="Alpha")
        m2 = MedicationFactory(code="BBB002", label="Beta")
        m3 = MedicationFactory(code="CCC003", label="Gamma")

        medications = list(Medication.objects.filter(id__in=[m1.id, m2.id, m3.id]))
        assert medications[0] == m1
        assert medications[1] == m2
        assert medications[2] == m3

    def test_medication_status_choices(self):
        """Les deux valeurs de statut sont valides."""
        actif = MedicationFactory(status=Medication.STATUS_ACTIF)
        suppr = MedicationFactory(status=Medication.STATUS_SUPPR)

        assert actif.status == "actif"
        assert suppr.status == "suppr"
