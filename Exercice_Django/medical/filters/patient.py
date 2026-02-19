from django.db.models import QuerySet
import django_filters

from medical.models import Patient


class PatientFilter(django_filters.FilterSet):
    """FilterSet pour les patients.

    Paramètres de requête disponibles:
        nom: Correspondance partielle sur ``last_name`` (icontains).
        prenom: Correspondance partielle sur ``first_name`` (icontains).
        date_naissance: Date de naissance exacte.
        id: ID unique ou liste d'IDs séparés par virgule.
    """

    nom = django_filters.CharFilter(field_name="last_name", lookup_expr="icontains")
    prenom = django_filters.CharFilter(field_name="first_name", lookup_expr="icontains")
    date_naissance = django_filters.DateFilter(field_name="birth_date")
    id = django_filters.CharFilter(method="filter_ids")

    def filter_ids(self, queryset: QuerySet, name: str, value: str) -> QuerySet:
        """Filtre les patients par un ou plusieurs IDs séparés par virgule.

        Args:
            queryset: QuerySet de patients à filtrer.
            name: Nom du champ de filtre (non utilisé directement).
            value: Valeur(s) d'ID(s) sous forme de chaîne.

        Returns:
            QuerySet filtré sur ``id__in`` si des IDs valides sont trouvés,
            sinon le queryset original inchangé.
        """
        request = getattr(self, "request", None)
        values = []
        if request is not None:
            repeated = request.GET.getlist("id")
            for v in repeated:
                values.extend(v.split(","))
        if not values and value:
            values = value.split(",")
        ids = [int(v) for v in values if str(v).strip().isdigit()]
        return queryset.filter(id__in=ids) if ids else queryset

    class Meta:
        model = Patient
        fields: list[str] = []
