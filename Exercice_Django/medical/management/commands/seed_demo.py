import random
import string
from datetime import date, timedelta
from typing import Any

from django.core.management.base import BaseCommand

from medical.models import Medication, Patient, Prescription


def random_date(start_year: int = 1940, end_year: int = 2025) -> date:
    """Génère une date aléatoire entre start_year et end_year.

    Args:
        start_year: Année de début (incluse). Par défaut 1940.
        end_year: Année de fin (incluse). Par défaut 2025.

    Returns:
        date: Une date aléatoire entre les deux années.
    """
    start_dt = date(start_year, 1, 1)
    end_dt = date(end_year, 12, 31)
    days = (end_dt - start_dt).days
    return start_dt + timedelta(days=random.randint(0, days))


class Command(BaseCommand):
    """Management command pour peupler la base avec des données de démonstration.

    Example:
        python manage.py seed_demo
        python manage.py seed_demo --patients 50 --medications 20 --prescriptions 200
    """

    help = "Seed the database with demo Patients, Medications, and Prescriptions"

    LAST_NAMES = [
        "Martin",
        "Bernard",
        "Thomas",
        "Petit",
        "Robert",
        "Richard",
        "Durand",
        "Dubois",
        "Moreau",
        "Laurent",
        "Michel",
        "Garcia",
        "David",
        "Bertrand",
        "Roux",
        "Vincent",
        "Fournier",
        "Morel",
        "Lefebvre",
        "Mercier",
        "Dupont",
        "Lambert",
        "Bonnet",
        "Francois",
        "Martinez",
        "Legrand",
        "Garnier",
        "Faure",
        "Andre",
        "Rousseau",
        "Simon",
        "Leroy",
        "Roux",
        "Girard",
        "Colin",
        "Lefevre",
        "Boyer",
        "Chevalier",
        "Robin",
        "Masson",
        "Picard",
        "Blanc",
        "Gautier",
        "Nicolas",
        "Henry",
        "Perrin",
        "Morin",
        "Mathieu",
        "Clement",
        "Gauthier",
        "Dumont",
        "Lopez",
        "Fontaine",
        "Schmitt",
        "Rodriguez",
        "Dufour",
        "Blanchard",
        "Meunier",
        "Brunet",
        "Roy",
    ]

    FIRST_NAMES = [
        "Jean",
        "Jeanne",
        "Marie",
        "Luc",
        "Lucie",
        "Paul",
        "Camille",
        "Pierre",
        "Sophie",
        "Emma",
        "Louis",
        "Louise",
        "Alice",
        "Gabriel",
        "Jules",
        "Lucas",
        "Hugo",
        "Arthur",
        "Adam",
        "Raphael",
        "Leo",
        "Nathan",
        "Tom",
        "Zoe",
        "Chloe",
        "Ines",
        "Lea",
        "Lena",
        "Eva",
        "Nina",
        "Ethan",
        "Noah",
        "Liam",
        "Rose",
        "Anna",
        "Jade",
        "Maeva",
        "Sarah",
        "Laura",
        "Clara",
        "Julie",
        "Nicolas",
        "Thomas",
        "Antoine",
        "Emilie",
        "Mathilde",
        "Charlotte",
        "Manon",
        "Julia",
        "Elise",
        "Victor",
        "Alex",
        "Samuel",
        "Valentin",
        "Axel",
        "Simon",
        "Romain",
        "Vincent",
        "Marc",
        "David",
    ]

    MEDICATION_LABELS = [
        "Paracetamol",
        "Ibuprofen",
        "Amoxicillin",
        "Aspirin",
        "Omeprazole",
        "Metformin",
        "Loratadine",
        "Cetirizine",
        "Azithromycin",
        "Atorvastatin",
        "Simvastatin",
        "Lisinopril",
        "Amlodipine",
        "Metoprolol",
        "Sertraline",
        "Fluoxetine",
        "Escitalopram",
        "Gabapentin",
        "Pregabalin",
        "Tramadol",
        "Oxycodone",
        "Hydrocodone",
        "Morphine",
        "Diazepam",
        "Alprazolam",
        "Clonazepam",
        "Zolpidem",
        "Trazodone",
        "Cyclobenzaprine",
        "Meloxicam",
        "Prednisone",
        "Methylprednisolone",
        "Hydrocortisone",
        "Fluticasone",
        "Montelukast",
        "Albuterol",
        "Fluconazole",
        "Terbinafine",
        "Metronidazole",
        "Ciprofloxacin",
        "Doxycycline",
        "Cephalexin",
        "Nitrofurantoin",
        "Pantoprazole",
        "Ranitidine",
        "Famotidine",
        "Dicyclomine",
        "Ondansetron",
        "Promethazine",
        "Meclizine",
    ]

    DOSAGES = [15, 20, 25, 50, 100, 200, 250, 300, 400, 500, 800, 1000]
    UNITS = ["mg", "g", "µg"]
    COMMENTS = [
        "À prendre pendant les repas",
        "Traitement à suivre rigoureusement",
        "En cas de douleur",
        "Renouvellement prévu",
        "Attention aux effets secondaires",
        "Dosage à surveiller",
        "",
        "",
        "",
    ]

    PRESCRIPTION_MIN_DAYS = 1
    PRESCRIPTION_MAX_DAYS = 180
    MEDICATION_CODE_MIN = 1000
    MEDICATION_CODE_MAX = 9999

    def add_arguments(self, parser: Any) -> None:
        """Déclare les arguments de la commande.

        Args:
            parser: Parseur d'arguments fourni par Django.
        """
        parser.add_argument("--patients", type=int, default=10)
        parser.add_argument("--medications", type=int, default=5)
        parser.add_argument("--prescriptions", type=int, default=30)

    def create_patients(self, n_patients: int) -> list[Patient]:
        """Crée n patients avec des données aléatoires.

        Args:
            n_patients: Nombre de patients à créer.

        Returns:
            Liste des instances ``Patient`` créées en base.
        """
        created_patients = []
        for _ in range(n_patients):
            patient = Patient.objects.create(
                last_name=random.choice(self.LAST_NAMES),
                first_name=random.choice(self.FIRST_NAMES),
                birth_date=random_date(),
            )
            created_patients.append(patient)
        return created_patients

    def create_medications(self, n_medications: int) -> list[Medication]:
        """Crée n médicaments avec des données aléatoires.

        Args:
            n_medications: Nombre de médicaments à créer.

        Returns:
            Liste des instances ``Medication`` créées en base.
        """
        created_medications = []
        for _ in range(n_medications):
            code = (
                f"MED{random.randint(self.MEDICATION_CODE_MIN, self.MEDICATION_CODE_MAX)}"
                f"{random.choice(string.ascii_uppercase)}"
            )
            label = (
                f"{random.choice(self.MEDICATION_LABELS)} "
                f"{random.choice(self.DOSAGES)}"
                f"{random.choice(self.UNITS)}"
            )
            status = random.choices(
                [Medication.STATUS_ACTIF, Medication.STATUS_SUPPR],
                weights=[0.8, 0.2],
            )[0]
            medication = Medication.objects.create(
                code=code, label=label, status=status
            )
            created_medications.append(medication)
        return created_medications

    def create_prescriptions(
        self,
        n_prescriptions: int,
        patients: list[Patient],
        medications: list[Medication],
    ) -> list[Prescription]:
        """Crée n prescriptions aléatoires à partir des listes fournies.

        Args:
            n_prescriptions: Nombre de prescriptions à créer.
            patients: Liste des patients disponibles.
            medications: Liste des médicaments disponibles.

        Returns:
            Liste des instances ``Prescription`` créées en base.
        """
        created_prescriptions = []
        for _ in range(n_prescriptions):
            patient = random.choice(patients)
            medication = random.choice(medications)
            start_date = random_date(start_year=2020, end_year=2026)
            duration_days = random.randint(
                self.PRESCRIPTION_MIN_DAYS, self.PRESCRIPTION_MAX_DAYS
            )
            end_date = start_date + timedelta(days=duration_days)
            status = random.choices(
                [
                    Prescription.STATUS_VALIDE,
                    Prescription.STATUS_EN_ATTENTE,
                    Prescription.STATUS_SUPPR,
                ],
                weights=[0.6, 0.3, 0.1],
            )[0]
            prescription = Prescription.objects.create(
                patient=patient,
                medication=medication,
                start_date=start_date,
                end_date=end_date,
                status=status,
                comment=random.choice(self.COMMENTS),
            )
            created_prescriptions.append(prescription)
        return created_prescriptions

    def handle(self, *args: Any, **options: Any) -> None:
        """Purge les données existantes puis insère les nouvelles données de démo.

        Args:
            *args: Arguments positionnels (non utilisés).
            **options: Options de la ligne de commande
                (``patients``, ``medications``, ``prescriptions``).
        """
        Prescription.objects.all().delete()
        Patient.objects.all().delete()
        Medication.objects.all().delete()

        n_patients = options["patients"]
        n_medications = options["medications"]
        n_prescriptions = options["prescriptions"]

        created_patients = self.create_patients(n_patients)
        created_medications = self.create_medications(n_medications)
        created_prescriptions = self.create_prescriptions(
            n_prescriptions, created_patients, created_medications
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {len(created_patients)} patients, "
                f"{len(created_medications)} medications, "
                f"and {len(created_prescriptions)} prescriptions."
            )
        )
