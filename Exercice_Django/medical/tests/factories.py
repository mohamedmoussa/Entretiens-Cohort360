from datetime import date, timedelta

import factory
from factory.django import DjangoModelFactory

from medical.models import Medication, Patient, Prescription


class PatientFactory(DjangoModelFactory):
    """Factory pour créer des instances ``Patient`` avec des données Faker fr_FR."""

    class Meta:
        model = Patient

    last_name = factory.Faker("last_name", locale="fr_FR")
    first_name = factory.Faker("first_name", locale="fr_FR")
    birth_date = factory.Faker("date_of_birth", minimum_age=18, maximum_age=90)


class MedicationFactory(DjangoModelFactory):
    """Factory pour créer des instances ``Medication`` avec un code séquentiel."""

    class Meta:
        model = Medication

    code = factory.Sequence(lambda n: f"MED{n:04d}")
    label = factory.Faker("sentence", nb_words=3)
    status = Medication.STATUS_ACTIF


class PrescriptionFactory(DjangoModelFactory):
    """Factory pour créer des instances ``Prescription`` valides (status=valide, 30 jours)."""

    class Meta:
        model = Prescription

    patient = factory.SubFactory(PatientFactory)
    medication = factory.SubFactory(MedicationFactory)
    start_date = factory.LazyFunction(lambda: date.today())
    end_date = factory.LazyFunction(lambda: date.today() + timedelta(days=30))
    status = Prescription.STATUS_VALIDE
    comment = factory.Faker("sentence", nb_words=10)


class PrescriptionWithInvalidDatesFactory(PrescriptionFactory):
    """Prescriptions avec end_date < start_date. Ne pas appeler .save() (lève ValidationError)."""

    start_date = factory.LazyFunction(lambda: date.today())
    end_date = factory.LazyFunction(lambda: date.today() - timedelta(days=1))
