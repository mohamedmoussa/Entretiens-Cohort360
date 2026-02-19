"""
Configuration pytest et fixtures pour les tests des médicaments.
"""

import pytest

from medical.tests.factories import MedicationFactory


@pytest.fixture
def medication():
    return MedicationFactory()


@pytest.fixture
def medications_batch():
    return MedicationFactory.create_batch(5)
