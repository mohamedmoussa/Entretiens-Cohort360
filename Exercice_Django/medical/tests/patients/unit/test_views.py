"""
Tests des endpoints REST pour PatientViewSet (lecture seule).
"""

from datetime import date

import pytest
from django.urls import reverse

from medical.tests.factories import PatientFactory


@pytest.mark.unit
@pytest.mark.django_db
class TestPatientViews:
    """Tests des endpoints GET /api/patients."""

    def test_list_returns_200(self, api_client, patients_batch):
        response = api_client.get(reverse("patient-list"))
        assert response.status_code == 200

    def test_list_contains_created_patients(self, api_client, patients_batch):
        response = api_client.get(reverse("patient-list"))
        assert len(response.json()["results"]) == 5

    def test_retrieve_returns_200(self, api_client, patient):
        response = api_client.get(reverse("patient-detail", args=[patient.id]))
        assert response.status_code == 200

    def test_retrieve_returns_correct_patient(self, api_client, patient):
        data = api_client.get(reverse("patient-detail", args=[patient.id])).json()
        assert data["id"] == patient.id
        assert data["last_name"] == patient.last_name
        assert data["first_name"] == patient.first_name

    def test_retrieve_unknown_id_returns_404(self, api_client):
        response = api_client.get(reverse("patient-detail", args=[99999]))
        assert response.status_code == 404

    def test_post_not_allowed(self, api_client):
        """Le ViewSet est en lecture seule : POST doit retourner 405."""
        response = api_client.post(
            reverse("patient-list"),
            {"last_name": "X", "first_name": "Y"},
            format="json",
        )
        assert response.status_code == 405

    def test_put_not_allowed(self, api_client, patient):
        response = api_client.put(
            reverse("patient-detail", args=[patient.id]),
            {"last_name": "X", "first_name": "Y"},
            format="json",
        )
        assert response.status_code == 405

    def test_delete_not_allowed(self, api_client, patient):
        response = api_client.delete(reverse("patient-detail", args=[patient.id]))
        assert response.status_code == 405

    def test_filter_by_nom(self, api_client):
        PatientFactory(last_name="Martin", first_name="Jean")
        PatientFactory(last_name="Dupont", first_name="Alice")

        data = api_client.get(reverse("patient-list"), {"nom": "mart"}).json()[
            "results"
        ]
        assert len(data) >= 1
        assert all("mart" in p["last_name"].lower() for p in data)

    def test_filter_by_prenom(self, api_client):
        PatientFactory(last_name="Bernard", first_name="Alice")
        PatientFactory(last_name="Durand", first_name="Bob")

        data = api_client.get(reverse("patient-list"), {"prenom": "ali"}).json()[
            "results"
        ]
        assert all("ali" in p["first_name"].lower() for p in data)

    def test_filter_by_date_naissance(self, api_client):
        PatientFactory(birth_date=date(1980, 5, 20))
        PatientFactory(birth_date=date(1990, 3, 20))

        data = api_client.get(
            reverse("patient-list"), {"date_naissance": "1980-05-20"}
        ).json()["results"]
        assert all(p["birth_date"] == "1980-05-20" for p in data)
