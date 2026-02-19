from django.db.models import QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets

from medical.filters import MedicationFilter
from medical.models import Medication
from medical.serializers import MedicationSerializer


class MedicationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet en lecture seule pour les médicaments.

    Expose les endpoints ``list`` et ``retrieve`` avec filtrage via ``MedicationFilter``.
    """

    serializer_class = MedicationSerializer
    queryset: QuerySet[Medication] = Medication.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_class = MedicationFilter
