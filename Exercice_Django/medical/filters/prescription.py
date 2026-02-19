import django_filters

from medical.models import Prescription


class PrescriptionFilter(django_filters.FilterSet):
    """FilterSet pour les prescriptions avec filtres de dates avancés.

    Paramètres de requête disponibles:
        patient: ID exact du patient.
        medication: ID exact du médicament.
        status: Statut exact (``valide``, ``en_attente``, ``suppr``).
        start_date / start_date_gte / start_date_lte / start_date_gt / start_date_lt:
            Filtres sur la date de début.
        end_date / end_date_gte / end_date_lte / end_date_gt / end_date_lt:
            Filtres sur la date de fin.

    Example:
        GET /api/prescriptions?start_date_gte=2026-01-01&status=valide
    """

    patient = django_filters.NumberFilter(field_name="patient__id")
    medication = django_filters.NumberFilter(field_name="medication__id")

    status = django_filters.ChoiceFilter(
        field_name="status",
        choices=Prescription.STATUS_CHOICES,
    )

    start_date = django_filters.DateFilter(field_name="start_date", lookup_expr="exact")
    start_date_gte = django_filters.DateFilter(
        field_name="start_date", lookup_expr="gte"
    )
    start_date_lte = django_filters.DateFilter(
        field_name="start_date", lookup_expr="lte"
    )
    start_date_gt = django_filters.DateFilter(field_name="start_date", lookup_expr="gt")
    start_date_lt = django_filters.DateFilter(field_name="start_date", lookup_expr="lt")

    end_date = django_filters.DateFilter(field_name="end_date", lookup_expr="exact")
    end_date_gte = django_filters.DateFilter(field_name="end_date", lookup_expr="gte")
    end_date_lte = django_filters.DateFilter(field_name="end_date", lookup_expr="lte")
    end_date_gt = django_filters.DateFilter(field_name="end_date", lookup_expr="gt")
    end_date_lt = django_filters.DateFilter(field_name="end_date", lookup_expr="lt")

    class Meta:
        model = Prescription
        fields = [
            "patient",
            "medication",
            "status",
            "start_date",
            "end_date",
        ]
