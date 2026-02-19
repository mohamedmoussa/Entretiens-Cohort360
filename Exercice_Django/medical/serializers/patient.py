from rest_framework import serializers

from medical.models import Patient


class PatientSerializer(serializers.ModelSerializer):
    """Serializer pour sérialiser et valider les données des patients.

    Expose les champs id, last_name, first_name, et birth_date.
    Le champ birth_date est optionnel lors de la création et la mise à jour.

    Attributes:
        id: Identifiant unique du patient (lecture seule).
        last_name: Nom de famille du patient.
        first_name: Prénom du patient.
        birth_date: Date de naissance optionnelle du patient.
    """

    class Meta:
        model = Patient
        fields = ["id", "last_name", "first_name", "birth_date"]
        read_only_fields = ["id"]
