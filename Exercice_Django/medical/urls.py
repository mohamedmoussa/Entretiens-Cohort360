from django.urls import include, path
from rest_framework.routers import SimpleRouter

from medical.views import MedicationViewSet, PatientViewSet, PrescriptionViewSet

router = SimpleRouter(trailing_slash=False)
router.register(r"patients", PatientViewSet, basename="patient")
router.register(r"medications", MedicationViewSet, basename="medication")
router.register(r"prescriptions", PrescriptionViewSet, basename="prescription")

urlpatterns = [
    path("", include(router.urls)),
]
