# Generated migration for Prescription model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("medical", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Prescription",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "start_date",
                    models.DateField(help_text="Date de début de la prescription"),
                ),
                (
                    "end_date",
                    models.DateField(help_text="Date de fin de la prescription"),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("valide", "valide"),
                            ("en_attente", "en_attente"),
                            ("suppr", "suppr"),
                        ],
                        default="en_attente",
                        help_text="Statut de la prescription",
                        max_length=16,
                    ),
                ),
                (
                    "comment",
                    models.TextField(
                        blank=True,
                        default="",
                        help_text="Commentaire optionnel sur la prescription",
                    ),
                ),
                (
                    "medication",
                    models.ForeignKey(
                        help_text="Médicament prescrit",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="prescriptions",
                        to="medical.medication",
                    ),
                ),
                (
                    "patient",
                    models.ForeignKey(
                        help_text="Patient concerné par la prescription",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="prescriptions",
                        to="medical.patient",
                    ),
                ),
            ],
            options={
                "ordering": ["-start_date", "id"],
            },
        ),
        migrations.AddIndex(
            model_name="prescription",
            index=models.Index(
                fields=["patient", "start_date"], name="medical_pre_patient_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="prescription",
            index=models.Index(
                fields=["medication", "start_date"], name="medical_pre_medicat_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="prescription",
            index=models.Index(
                fields=["status", "start_date"], name="medical_pre_status_idx"
            ),
        ),
    ]
