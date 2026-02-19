from django.db import models


class Patient(models.Model):
    """Représente un patient du système médical.

    Attributes:
        last_name (str): Nom de famille (max 150 caractères).
        first_name (str): Prénom (max 150 caractères).
        birth_date (date | None): Date de naissance, optionnelle.
    """

    last_name = models.CharField(max_length=150)
    first_name = models.CharField(max_length=150)
    birth_date = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = "patient"
        verbose_name_plural = "patients"
        ordering = ["last_name", "first_name", "id"]

    def __str__(self) -> str:  # pragma: no cover
        """Retourne la représentation textuelle du patient."""
        return f"{self.last_name} {self.first_name}"
