from django.db.models import QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets

from medical.filters import PatientFilter
from medical.models import Patient
from medical.serializers import PatientSerializer


class PatientViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet en lecture seule pour les patients.

    Expose les endpoints ``list`` et ``retrieve`` avec filtrage via ``PatientFilter``.
    """

    serializer_class = PatientSerializer
    queryset: QuerySet[Patient] = Patient.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_class = PatientFilter
