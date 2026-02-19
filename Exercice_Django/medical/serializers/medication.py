from rest_framework import serializers

from medical.models import Medication


class MedicationSerializer(serializers.ModelSerializer):
    """Serializer pour les médicaments.

    Expose les champs ``id`` (lecture seule), ``code``, ``label`` et ``status``.
    """

    class Meta:
        model = Medication
        fields = ["id", "code", "label", "status"]
        read_only_fields = ["id"]
