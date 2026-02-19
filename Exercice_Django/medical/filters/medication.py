import django_filters

from medical.models import Medication


class MedicationFilter(django_filters.FilterSet):
    """FilterSet pour les médicaments.

    Paramètres de requête disponibles:
        code: Correspondance partielle sur ``code`` (icontains).
        label: Correspondance partielle sur ``label`` (icontains).
        status: Statut exact parmi ``actif`` ou ``suppr``.
    """

    code = django_filters.CharFilter(field_name="code", lookup_expr="icontains")
    label = django_filters.CharFilter(field_name="label", lookup_expr="icontains")
    status = django_filters.ChoiceFilter(
        field_name="status",
        choices=Medication.STATUS_CHOICES,
    )

    class Meta:
        model = Medication
        fields = ["code", "label", "status"]
