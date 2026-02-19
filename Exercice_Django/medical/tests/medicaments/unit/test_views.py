"""
Tests des endpoints REST pour MedicationViewSet (lecture seule).
"""

import pytest
from django.urls import reverse

from medical.tests.factories import MedicationFactory


@pytest.mark.unit
@pytest.mark.django_db
class TestMedicationViews:
    """Tests des endpoints GET /api/medications."""

    def test_list_returns_200(self, api_client, medications_batch):
        response = api_client.get(reverse("medication-list"))
        assert response.status_code == 200

    def test_list_contains_created_medications(self, api_client, medications_batch):
        response = api_client.get(reverse("medication-list"))
        assert len(response.json()["results"]) == 5

    def test_retrieve_returns_200(self, api_client, medication):
        response = api_client.get(reverse("medication-detail", args=[medication.id]))
        assert response.status_code == 200

    def test_retrieve_returns_correct_medication(self, api_client, medication):
        data = api_client.get(reverse("medication-detail", args=[medication.id])).json()
        assert data["id"] == medication.id
        assert data["code"] == medication.code
        assert data["label"] == medication.label

    def test_retrieve_unknown_id_returns_404(self, api_client):
        response = api_client.get(reverse("medication-detail", args=[99999]))
        assert response.status_code == 404

    def test_post_not_allowed(self, api_client):
        """Le ViewSet est en lecture seule : POST doit retourner 405."""
        response = api_client.post(
            reverse("medication-list"),
            {"code": "X", "label": "Y", "status": "actif"},
            format="json",
        )
        assert response.status_code == 405

    def test_delete_not_allowed(self, api_client, medication):
        response = api_client.delete(reverse("medication-detail", args=[medication.id]))
        assert response.status_code == 405

    def test_filter_by_status(self, api_client):
        MedicationFactory(status="actif")
        MedicationFactory(status="suppr")

        data = api_client.get(reverse("medication-list"), {"status": "actif"}).json()[
            "results"
        ]
        assert all(m["status"] == "actif" for m in data)

    def test_filter_by_code(self, api_client):
        MedicationFactory(code="PARA500", label="Paracétamol 500mg")
        MedicationFactory(code="IBU400", label="Ibuprofène 400mg")

        data = api_client.get(reverse("medication-list"), {"code": "para"}).json()[
            "results"
        ]
        assert len(data) >= 1
        assert all("para" in m["code"].lower() for m in data)

    def test_filter_by_label(self, api_client):
        MedicationFactory(code="MED001", label="Paracétamol 500mg")
        MedicationFactory(code="MED002", label="Ibuprofène 400mg")

        data = api_client.get(reverse("medication-list"), {"label": "ibupro"}).json()[
            "results"
        ]
        assert len(data) >= 1
        assert all("ibupro" in m["label"].lower() for m in data)
