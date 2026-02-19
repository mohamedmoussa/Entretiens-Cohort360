from django.db.models import QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets

from medical.filters import PrescriptionFilter
from medical.models import Prescription
from medical.serializers import PrescriptionSerializer


class PrescriptionViewSet(viewsets.ModelViewSet):
    """ViewSet CRUD complet pour les prescriptions médicamenteuses.

    Expose les endpoints ``list``, ``create``, ``retrieve``, ``update``,
    ``partial_update`` et ``destroy`` avec filtrage via ``PrescriptionFilter``.
    """

    serializer_class = PrescriptionSerializer
    queryset: QuerySet[Prescription] = Prescription.objects.select_related(
        "patient", "medication"
    ).all()
    filter_backends = [DjangoFilterBackend]
    filterset_class = PrescriptionFilter
