"""
Configuration pytest et fixtures pour les tests des prescriptions.
"""

import pytest

from medical.tests.factories import (
    MedicationFactory,
    PatientFactory,
    PrescriptionFactory,
)


@pytest.fixture
def patient():
    """Fixture pour créer un patient de test."""
    return PatientFactory()


@pytest.fixture
def medication():
    """Fixture pour créer un médicament de test."""
    return MedicationFactory()


@pytest.fixture
def prescription(patient, medication):
    """Fixture pour créer une prescription de test."""
    return PrescriptionFactory(patient=patient, medication=medication)


@pytest.fixture
def patients_batch():
    """Fixture pour créer plusieurs patients."""
    return PatientFactory.create_batch(5)


@pytest.fixture
def medications_batch():
    """Fixture pour créer plusieurs médicaments."""
    return MedicationFactory.create_batch(5)


@pytest.fixture
def prescriptions_batch(patients_batch, medications_batch):
    """Fixture pour créer plusieurs prescriptions."""
    prescriptions = []
    for i in range(10):
        prescriptions.append(
            PrescriptionFactory(
                patient=patients_batch[i % len(patients_batch)],
                medication=medications_batch[i % len(medications_batch)],
            )
        )
    return prescriptions
