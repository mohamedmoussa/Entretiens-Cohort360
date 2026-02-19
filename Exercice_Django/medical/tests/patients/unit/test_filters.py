"""
Tests unitaires pour le filtre PatientFilter.
"""

from datetime import date

import pytest

from medical.filters import PatientFilter
from medical.tests.factories import PatientFactory


@pytest.mark.unit
@pytest.mark.django_db
class TestPatientFilter:
    """Tests du filtre PatientFilter."""

    def test_filter_nom_icontains(self):
        """Le filtre 'nom' est insensible à la casse et partiel."""
        p = PatientFactory(last_name="Martin", first_name="Jean")
        PatientFactory(last_name="Dupont", first_name="Alice")

        qs = PatientFilter(data={"nom": "mart"}).qs
        assert qs.count() == 1
        assert qs.first() == p

    def test_filter_nom_case_insensitive(self):
        """Le filtre 'nom' est insensible à la casse (majuscules acceptées)."""
        PatientFactory(last_name="Martin", first_name="Jean")
        PatientFactory(last_name="Dupont", first_name="Alice")

        qs = PatientFilter(data={"nom": "MART"}).qs
        assert qs.count() == 1

    def test_filter_prenom_icontains(self):
        """Le filtre 'prenom' est insensible à la casse et partiel."""
        p = PatientFactory(last_name="Bernard", first_name="Alice")
        PatientFactory(last_name="Durand", first_name="Bob")

        qs = PatientFilter(data={"prenom": "ali"}).qs
        assert qs.count() == 1
        assert qs.first() == p

    def test_filter_date_naissance_exact(self):
        """Le filtre 'date_naissance' est une correspondance exacte."""
        p = PatientFactory(birth_date=date(1980, 5, 15))
        PatientFactory(birth_date=date(1990, 3, 20))

        qs = PatientFilter(data={"date_naissance": "1980-05-15"}).qs
        assert qs.count() == 1
        assert qs.first() == p

    def test_filter_id_single_value(self):
        """Le filtre 'id' accepte un ID unique."""
        p1 = PatientFactory()
        PatientFactory()

        qs = PatientFilter(data={"id": str(p1.id)}).qs
        assert qs.count() == 1
        assert qs.first() == p1

    def test_filter_id_comma_separated(self):
        """Le filtre 'id' accepte plusieurs IDs séparés par virgule."""
        p1 = PatientFactory()
        p2 = PatientFactory()
        PatientFactory()

        qs = PatientFilter(data={"id": f"{p1.id},{p2.id}"}).qs
        assert qs.count() == 2
        assert p1 in qs
        assert p2 in qs

    def test_no_filter_returns_all(self):
        """Sans aucun filtre, tous les patients sont retournés."""
        PatientFactory.create_batch(3)

        qs = PatientFilter(data={}).qs
        assert qs.count() == 3

    def test_filter_nom_no_match_returns_empty(self):
        """Un filtre sans correspondance retourne un queryset vide."""
        PatientFactory(last_name="Martin")

        qs = PatientFilter(data={"nom": "zzzzz"}).qs
        assert qs.count() == 0
