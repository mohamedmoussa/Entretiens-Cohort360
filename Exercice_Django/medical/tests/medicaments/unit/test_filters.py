"""
Tests unitaires pour le filtre MedicationFilter.
"""

import pytest

from medical.filters import MedicationFilter
from medical.tests.factories import MedicationFactory


@pytest.mark.unit
@pytest.mark.django_db
class TestMedicationFilter:
    """Tests du filtre MedicationFilter."""

    def test_filter_status_actif(self):
        """Le filtre 'status' retourne uniquement les médicaments actifs."""
        m = MedicationFactory(status="actif")
        MedicationFactory(status="suppr")

        qs = MedicationFilter(data={"status": "actif"}).qs
        assert qs.count() == 1
        assert qs.first() == m

    def test_filter_status_suppr(self):
        """Le filtre 'status' retourne uniquement les médicaments supprimés."""
        MedicationFactory(status="actif")
        m = MedicationFactory(status="suppr")

        qs = MedicationFilter(data={"status": "suppr"}).qs
        assert qs.count() == 1
        assert qs.first() == m

    def test_filter_code_icontains(self):
        """Le filtre 'code' est insensible à la casse et partiel."""
        m = MedicationFactory(code="PARA500", label="Paracétamol 500mg")
        MedicationFactory(code="IBU400", label="Ibuprofène 400mg")

        qs = MedicationFilter(data={"code": "para"}).qs
        assert qs.count() == 1
        assert qs.first() == m

    def test_filter_label_icontains(self):
        """Le filtre 'label' est insensible à la casse et partiel."""
        MedicationFactory(code="MED001", label="Paracétamol 500mg")
        m = MedicationFactory(code="MED002", label="Ibuprofène 400mg")

        qs = MedicationFilter(data={"label": "ibupro"}).qs
        assert qs.count() == 1
        assert qs.first() == m

    def test_no_filter_returns_all(self):
        """Sans filtre, tous les médicaments sont retournés."""
        MedicationFactory.create_batch(3)

        qs = MedicationFilter(data={}).qs
        assert qs.count() == 3

    def test_filter_code_no_match_returns_empty(self):
        """Un filtre sans correspondance retourne un queryset vide."""
        MedicationFactory(code="PARA500")

        qs = MedicationFilter(data={"code": "zzzzz"}).qs
        assert qs.count() == 0
