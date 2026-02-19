from django.db import models


class Medication(models.Model):
    """Représente un médicament disponible pour les prescriptions.

    Attributes:
        code (str): Code unique du médicament (max 64 caractères).
        label (str): Nom ou libellé du médicament (max 255 caractères).
        status (str): Statut parmi ``STATUS_ACTIF`` ou ``STATUS_SUPPR``.
    """

    STATUS_ACTIF = "actif"
    STATUS_SUPPR = "suppr"
    STATUS_CHOICES = (
        (STATUS_ACTIF, "actif"),
        (STATUS_SUPPR, "suppr"),
    )

    code = models.CharField(max_length=64, unique=True)
    label = models.CharField(max_length=255)
    status = models.CharField(
        max_length=16, choices=STATUS_CHOICES, default=STATUS_ACTIF
    )

    class Meta:
        verbose_name = "médicament"
        verbose_name_plural = "médicaments"
        ordering = ["code"]

    def __str__(self) -> str:  # pragma: no cover
        """Retourne la représentation textuelle du médicament."""
        return f"{self.code} - {self.label} ({self.status})"
