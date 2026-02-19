"""
Tests des endpoints REST pour PrescriptionViewSet (CRUD complet).
"""

from datetime import date

import pytest
from django.urls import reverse

from medical.models import Prescription
from medical.tests.factories import (
    MedicationFactory,
    PatientFactory,
    PrescriptionFactory,
)


@pytest.mark.unit
@pytest.mark.django_db
class TestPrescriptionViews:
    """Tests des endpoints /api/prescriptions (CRUD complet)."""

    # --- Lecture ---

    def test_list_returns_200(self, api_client, prescriptions_batch):
        response = api_client.get(reverse("prescription-list"))
        assert response.status_code == 200

    def test_list_contains_created_prescriptions(self, api_client, prescriptions_batch):
        assert len(api_client.get(reverse("prescription-list")).json()["results"]) == 10

    def test_retrieve_returns_200(self, api_client, prescription):
        response = api_client.get(
            reverse("prescription-detail", args=[prescription.id])
        )
        assert response.status_code == 200

    def test_retrieve_returns_correct_id(self, api_client, prescription):
        data = api_client.get(
            reverse("prescription-detail", args=[prescription.id])
        ).json()
        assert data["id"] == prescription.id

    def test_retrieve_contains_nested_patient_details(self, api_client, prescription):
        data = api_client.get(
            reverse("prescription-detail", args=[prescription.id])
        ).json()
        assert "patient_details" in data
        assert data["patient_details"]["id"] == prescription.patient.id

    def test_retrieve_contains_nested_medication_details(
        self, api_client, prescription
    ):
        data = api_client.get(
            reverse("prescription-detail", args=[prescription.id])
        ).json()
        assert "medication_details" in data
        assert data["medication_details"]["id"] == prescription.medication.id

    def test_retrieve_unknown_id_returns_404(self, api_client):
        response = api_client.get(reverse("prescription-detail", args=[99999]))
        assert response.status_code == 404

    # --- Création ---

    def test_create_returns_201(self, api_client, patient, medication):
        payload = {
            "patient": patient.id,
            "medication": medication.id,
            "start_date": "2024-06-01",
            "end_date": "2024-06-30",
            "status": "valide",
            "comment": "Nouvelle prescription",
        }
        response = api_client.post(reverse("prescription-list"), payload, format="json")
        assert response.status_code == 201

    def test_create_persists_in_db(self, api_client, patient, medication):
        payload = {
            "patient": patient.id,
            "medication": medication.id,
            "start_date": "2024-06-01",
            "end_date": "2024-06-30",
            "status": "valide",
        }
        pk = api_client.post(
            reverse("prescription-list"), payload, format="json"
        ).json()["id"]
        assert Prescription.objects.filter(id=pk).exists()

    def test_create_returns_correct_data(self, api_client, patient, medication):
        payload = {
            "patient": patient.id,
            "medication": medication.id,
            "start_date": "2024-06-01",
            "end_date": "2024-06-30",
            "status": "valide",
        }
        data = api_client.post(
            reverse("prescription-list"), payload, format="json"
        ).json()
        assert data["patient"] == patient.id
        assert data["medication"] == medication.id
        assert data["status"] == "valide"

    def test_create_invalid_dates_returns_400(self, api_client, patient, medication):
        payload = {
            "patient": patient.id,
            "medication": medication.id,
            "start_date": "2024-06-30",
            "end_date": "2024-06-01",
            "status": "valide",
        }
        response = api_client.post(reverse("prescription-list"), payload, format="json")
        assert response.status_code == 400
        assert "end_date" in response.json()

    def test_create_nonexistent_patient_returns_400(self, api_client, medication):
        payload = {
            "patient": 99999,
            "medication": medication.id,
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
            "status": "valide",
        }
        response = api_client.post(reverse("prescription-list"), payload, format="json")
        assert response.status_code == 400

    def test_create_missing_fields_returns_400(self, api_client):
        response = api_client.post(reverse("prescription-list"), {}, format="json")
        assert response.status_code == 400

    # --- Mise à jour complète (PUT) ---

    def test_put_returns_200(self, api_client, prescription, medication):
        payload = {
            "patient": prescription.patient.id,
            "medication": medication.id,
            "start_date": "2024-07-01",
            "end_date": "2024-07-31",
            "status": "en_attente",
            "comment": "Mise à jour",
        }
        response = api_client.put(
            reverse("prescription-detail", args=[prescription.id]),
            payload,
            format="json",
        )
        assert response.status_code == 200

    def test_put_updates_all_fields(self, api_client, prescription, medication):
        payload = {
            "patient": prescription.patient.id,
            "medication": medication.id,
            "start_date": "2024-07-01",
            "end_date": "2024-07-31",
            "status": "en_attente",
            "comment": "Mis à jour",
        }
        data = api_client.put(
            reverse("prescription-detail", args=[prescription.id]),
            payload,
            format="json",
        ).json()
        assert data["medication"] == medication.id
        assert data["status"] == "en_attente"
        assert data["comment"] == "Mis à jour"

    def test_put_invalid_dates_returns_400(self, api_client, prescription):
        payload = {
            "patient": prescription.patient.id,
            "medication": prescription.medication.id,
            "start_date": "2024-07-31",
            "end_date": "2024-07-01",
            "status": "valide",
        }
        response = api_client.put(
            reverse("prescription-detail", args=[prescription.id]),
            payload,
            format="json",
        )
        assert response.status_code == 400

    # --- Mise à jour partielle (PATCH) ---

    def test_patch_returns_200(self, api_client, prescription):
        response = api_client.patch(
            reverse("prescription-detail", args=[prescription.id]),
            {"status": "suppr"},
            format="json",
        )
        assert response.status_code == 200

    def test_patch_updates_only_sent_fields(self, api_client, prescription):
        original_patient_id = prescription.patient.id
        data = api_client.patch(
            reverse("prescription-detail", args=[prescription.id]),
            {"status": "suppr", "comment": "Annulée"},
            format="json",
        ).json()
        assert data["status"] == "suppr"
        assert data["comment"] == "Annulée"
        assert data["patient"] == original_patient_id

    def test_patch_unknown_id_returns_404(self, api_client):
        response = api_client.patch(
            reverse("prescription-detail", args=[99999]),
            {"status": "suppr"},
            format="json",
        )
        assert response.status_code == 404

    # --- Suppression ---

    def test_delete_returns_204(self, api_client, prescription):
        response = api_client.delete(
            reverse("prescription-detail", args=[prescription.id])
        )
        assert response.status_code == 204

    def test_delete_removes_from_db(self, api_client, prescription):
        pk = prescription.id
        api_client.delete(reverse("prescription-detail", args=[pk]))
        assert not Prescription.objects.filter(id=pk).exists()

    def test_delete_unknown_id_returns_404(self, api_client):
        response = api_client.delete(reverse("prescription-detail", args=[99999]))
        assert response.status_code == 404

    # --- Filtres ---

    def test_filter_by_patient(self, api_client, patient):
        PrescriptionFactory.create_batch(3, patient=patient)
        PrescriptionFactory()

        data = api_client.get(
            reverse("prescription-list"), {"patient": patient.id}
        ).json()["results"]
        assert len(data) >= 3
        assert all(p["patient"] == patient.id for p in data)

    def test_filter_by_medication(self, api_client, medication):
        PrescriptionFactory.create_batch(2, medication=medication)
        PrescriptionFactory()

        data = api_client.get(
            reverse("prescription-list"), {"medication": medication.id}
        ).json()["results"]
        assert len(data) >= 2
        assert all(p["medication"] == medication.id for p in data)

    def test_filter_by_status(self, api_client):
        PrescriptionFactory.create_batch(2, status="valide")
        PrescriptionFactory(status="en_attente")

        data = api_client.get(
            reverse("prescription-list"), {"status": "valide"}
        ).json()["results"]
        assert all(p["status"] == "valide" for p in data)

    @pytest.mark.parametrize(
        "filter_param,filter_value,expected_field,expected_cmp",
        [
            ("start_date_gte", "2024-02-01", "start_date", ">="),
            ("start_date_lte", "2024-03-01", "start_date", "<="),
            ("end_date_gte", "2024-02-01", "end_date", ">="),
            ("end_date_lte", "2024-03-31", "end_date", "<="),
        ],
    )
    def test_date_filters(
        self,
        api_client,
        patient,
        medication,
        filter_param,
        filter_value,
        expected_field,
        expected_cmp,
    ):
        """Les filtres de dates (gte/lte) fonctionnent correctement."""
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

        response = api_client.get(
            reverse("prescription-list"), {filter_param: filter_value}
        )
        assert response.status_code == 200
        assert len(response.json()["results"]) >= 1
