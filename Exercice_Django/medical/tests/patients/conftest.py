import pytest

from medical.tests.factories import PatientFactory


@pytest.fixture
def patient():
    return PatientFactory()


@pytest.fixture
def patients_batch():
    return PatientFactory.create_batch(5)
