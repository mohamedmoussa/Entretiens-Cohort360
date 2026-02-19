from typing import Any

from django.core.exceptions import ValidationError
from django.db import models

from medical.models.medication import Medication
from medical.models.patient import Patient


class Prescription(models.Model):
    """Représente une prescription médicamenteuse pour un patient.

    Attributes:
        patient (Patient): Patient concerné par la prescription.
        medication (Medication): Médicament prescrit.
        start_date (date): Date de début de la prescription.
        end_date (date): Date de fin de la prescription.
        status (str): Statut parmi ``STATUS_VALIDE``, ``STATUS_EN_ATTENTE``, ``STATUS_SUPPR``.
        comment (str): Commentaire optionnel, vide par défaut.
    """

    STATUS_VALIDE = "valide"
    STATUS_EN_ATTENTE = "en_attente"
    STATUS_SUPPR = "suppr"
    STATUS_CHOICES = (
        (STATUS_VALIDE, "valide"),
        (STATUS_EN_ATTENTE, "en_attente"),
        (STATUS_SUPPR, "suppr"),
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="prescriptions",
        help_text="Patient concerné par la prescription",
    )
    medication = models.ForeignKey(
        Medication,
        on_delete=models.CASCADE,
        related_name="prescriptions",
        help_text="Médicament prescrit",
    )
    start_date = models.DateField(help_text="Date de début de la prescription")
    end_date = models.DateField(help_text="Date de fin de la prescription")
    status = models.CharField(
        max_length=16,
        choices=STATUS_CHOICES,
        default=STATUS_EN_ATTENTE,
        help_text="Statut de la prescription",
    )
    comment = models.TextField(
        blank=True,
        default="",
        help_text="Commentaire optionnel sur la prescription",
    )

    class Meta:
        verbose_name = "prescription"
        verbose_name_plural = "prescriptions"
        ordering = ["-start_date", "id"]
        indexes = [
            models.Index(fields=["patient", "start_date"]),
            models.Index(fields=["medication", "start_date"]),
            models.Index(fields=["status", "start_date"]),
        ]

    def __str__(self) -> str:
        """Retourne la représentation textuelle de la prescription."""
        return (
            f"Prescription {self.id}: {self.medication.code} "
            f"pour {self.patient} ({self.start_date} -> {self.end_date})"
        )

    def clean(self) -> None:
        """Valide que la date de fin est postérieure ou égale à la date de début.

        Raises:
            ValidationError: Si end_date < start_date.
        """
        super().clean()
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValidationError(
                {
                    "end_date": "La date de fin doit être postérieure ou égale à la date de début."
                }
            )

    def save(self, *args: Any, **kwargs: Any) -> None:
        """Sauvegarde la prescription en exécutant ``full_clean()`` au préalable.

        Args:
            *args: Arguments positionnels transmis à ``super().save()``.
            **kwargs: Arguments nommés transmis à ``super().save()``.
        """
        self.full_clean()
        super().save(*args, **kwargs)
