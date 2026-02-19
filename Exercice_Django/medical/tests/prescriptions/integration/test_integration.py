"""
Tests d'intégration pour l'API Prescription.

Ces tests vérifient les flux complets utilisateur de bout en bout.
"""

from datetime import date, timedelta

import pytest
from django.urls import reverse

from medical.models import Prescription
from medical.tests.factories import (
    MedicationFactory,
    PatientFactory,
    PrescriptionFactory,
)


@pytest.mark.integration
@pytest.mark.django_db
class TestPrescriptionWorkflow:
    """Tests du workflow complet de gestion des prescriptions."""

    def test_complete_prescription_lifecycle(self, api_client):
        """
        Test du cycle de vie complet d'une prescription:
        1. Créer patient et médicament
        2. Créer une prescription
        3. Lister les prescriptions
        4. Modifier la prescription
        5. Supprimer la prescription
        """
        # Étape 1: Créer les données nécessaires
        patient = PatientFactory()
        medication = MedicationFactory()

        # Étape 2: Créer une prescription
        create_url = reverse("prescription-list")
        prescription_data = {
            "patient": patient.id,
            "medication": medication.id,
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
            "status": "en_attente",
            "comment": "Première prescription",
        }

        response = api_client.post(create_url, prescription_data, format="json")
        assert response.status_code == 201
        prescription_id = response.json()["id"]
        assert response.json()["patient"] == patient.id
        assert response.json()["medication"] == medication.id
        assert response.json()["status"] == "en_attente"

        # Étape 3: Vérifier que la prescription apparaît dans la liste
        list_response = api_client.get(create_url)
        assert list_response.status_code == 200
        prescriptions = list_response.json()["results"]
        assert len(prescriptions) >= 1
        assert any(p["id"] == prescription_id for p in prescriptions)

        # Étape 4: Modifier la prescription (validation)
        update_url = reverse("prescription-detail", args=[prescription_id])
        update_data = {
            "status": "valide",
            "comment": "Prescription validée par le médecin",
        }
        update_response = api_client.patch(update_url, update_data, format="json")
        assert update_response.status_code == 200
        assert update_response.json()["status"] == "valide"
        assert (
            update_response.json()["comment"] == "Prescription validée par le médecin"
        )

        # Étape 5: Supprimer la prescription
        delete_response = api_client.delete(update_url)
        assert delete_response.status_code == 204

        # Vérifier que la prescription n'existe plus
        assert not Prescription.objects.filter(id=prescription_id).exists()

    def test_create_multiple_prescriptions_for_patient(self, api_client):
        """Test de création de plusieurs prescriptions pour un même patient."""
        patient = PatientFactory()
        medications = MedicationFactory.create_batch(3)

        url = reverse("prescription-list")
        created_prescriptions = []

        # Créer 3 prescriptions différentes pour le même patient
        for i, medication in enumerate(medications):
            data = {
                "patient": patient.id,
                "medication": medication.id,
                "start_date": str(date.today() + timedelta(days=i * 30)),
                "end_date": str(date.today() + timedelta(days=(i + 1) * 30)),
                "status": "valide",
                "comment": f"Prescription {i + 1}",
            }
            response = api_client.post(url, data, format="json")
            assert response.status_code == 201
            created_prescriptions.append(response.json()["id"])

        # Vérifier qu'on peut filtrer par patient et obtenir les 3 prescriptions
        filter_response = api_client.get(url, {"patient": patient.id})
        assert filter_response.status_code == 200
        filtered = filter_response.json()["results"]
        assert len(filtered) == 3
        filtered_ids = [p["id"] for p in filtered]
        for prescription_id in created_prescriptions:
            assert prescription_id in filtered_ids

    def test_filter_prescriptions_by_date_range(self, api_client):
        """Test de filtrage par période de dates."""
        patient = PatientFactory()
        medication = MedicationFactory()

        # Créer des prescriptions à différentes périodes
        prescriptions_data = [
            {
                "start_date": "2024-01-01",
                "end_date": "2024-01-31",
                "status": "valide",
            },
            {
                "start_date": "2024-02-01",
                "end_date": "2024-02-28",
                "status": "valide",
            },
            {
                "start_date": "2024-03-01",
                "end_date": "2024-03-31",
                "status": "valide",
            },
        ]

        url = reverse("prescription-list")
        for data in prescriptions_data:
            full_data = {
                "patient": patient.id,
                "medication": medication.id,
                **data,
            }
            api_client.post(url, full_data, format="json")

        # Filtrer les prescriptions commençant après le 1er février
        response = api_client.get(url, {"start_date_gte": "2024-02-01"})
        assert response.status_code == 200
        results = response.json()["results"]
        assert len(results) >= 2  # Février et mars

        # Filtrer les prescriptions se terminant avant le 1er mars
        response = api_client.get(url, {"end_date_lte": "2024-02-29"})
        assert response.status_code == 200
        results = response.json()["results"]
        assert len(results) >= 2  # Janvier et février

    def test_validation_prevents_invalid_prescription(self, api_client):
        """Test que la validation empêche la création de prescriptions invalides."""
        patient = PatientFactory()
        medication = MedicationFactory()
        url = reverse("prescription-list")

        # Tenter de créer avec date fin < date début
        invalid_data = {
            "patient": patient.id,
            "medication": medication.id,
            "start_date": "2024-01-31",
            "end_date": "2024-01-01",
            "status": "valide",
        }

        response = api_client.post(url, invalid_data, format="json")
        assert response.status_code == 400
        assert "end_date" in response.json()

    def test_filter_by_medication_and_status(self, api_client):
        """Test de filtrage combiné par médicament et statut."""
        patient = PatientFactory()
        medication1 = MedicationFactory()
        medication2 = MedicationFactory()

        url = reverse("prescription-list")

        # Créer des prescriptions avec différents médicaments et statuts
        prescriptions_config = [
            {"medication": medication1, "status": "valide"},
            {"medication": medication1, "status": "en_attente"},
            {"medication": medication2, "status": "valide"},
            {"medication": medication2, "status": "suppr"},
        ]

        for config in prescriptions_config:
            data = {
                "patient": patient.id,
                "medication": config["medication"].id,
                "start_date": "2024-01-01",
                "end_date": "2024-01-31",
                "status": config["status"],
            }
            api_client.post(url, data, format="json")

        # Filtrer medication1 avec statut valide
        response = api_client.get(
            url, {"medication": medication1.id, "status": "valide"}
        )
        assert response.status_code == 200
        results = response.json()["results"]
        assert len(results) >= 1
        for prescription in results:
            assert prescription["medication"] == medication1.id
            assert prescription["status"] == "valide"


@pytest.mark.integration
@pytest.mark.django_db
class TestPrescriptionEdgeCases:
    """Tests des cas limites et erreurs."""

    def test_create_prescription_with_nonexistent_patient(self, api_client):
        """Test de création avec un patient inexistant."""
        medication = MedicationFactory()
        url = reverse("prescription-list")

        data = {
            "patient": 99999,  # ID inexistant
            "medication": medication.id,
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
            "status": "valide",
        }

        response = api_client.post(url, data, format="json")
        assert response.status_code == 400

    def test_same_start_and_end_date_is_valid(self, api_client):
        """Test qu'une prescription d'un jour est valide."""
        patient = PatientFactory()
        medication = MedicationFactory()
        url = reverse("prescription-list")

        data = {
            "patient": patient.id,
            "medication": medication.id,
            "start_date": "2024-01-01",
            "end_date": "2024-01-01",  # Même jour
            "status": "valide",
        }

        response = api_client.post(url, data, format="json")
        assert response.status_code == 201

    def test_partial_update_maintains_other_fields(self, api_client):
        """Test que la mise à jour partielle ne modifie pas les autres champs."""
        prescription = PrescriptionFactory(
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
            status="en_attente",
            comment="Original comment",
        )

        url = reverse("prescription-detail", args=[prescription.id])

        # Modifier seulement le statut
        update_data = {"status": "valide"}
        response = api_client.patch(url, update_data, format="json")

        assert response.status_code == 200
        result = response.json()
        assert result["status"] == "valide"
        assert result["comment"] == "Original comment"  # Non modifié
        assert result["start_date"] == "2024-01-01"  # Non modifié


@pytest.mark.integration
@pytest.mark.django_db
class TestPrescriptionPerformance:
    """Tests de performance et charge."""

    def test_list_many_prescriptions(self, api_client, prescriptions_batch):
        """Test de récupération d'une grande liste de prescriptions."""
        url = reverse("prescription-list")

        response = api_client.get(url)
        assert response.status_code == 200
        results = response.json()["results"]
        assert len(results) >= 10

    def test_filter_performance_with_many_records(self, api_client):
        """Test que les filtres fonctionnent correctement avec beaucoup de données."""
        patient = PatientFactory()
        medications = MedicationFactory.create_batch(5)

        # Créer 20 prescriptions
        url = reverse("prescription-list")
        for i in range(20):
            data = {
                "patient": patient.id,
                "medication": medications[i % 5].id,
                "start_date": str(date(2024, 1, 1) + timedelta(days=i)),
                "end_date": str(date(2024, 1, 1) + timedelta(days=i + 10)),
                "status": ["valide", "en_attente"][i % 2],
            }
            api_client.post(url, data, format="json")

        # Filtrer par patient
        response = api_client.get(url, {"patient": patient.id})
        assert response.status_code == 200
        assert response.json()["count"] >= 20
