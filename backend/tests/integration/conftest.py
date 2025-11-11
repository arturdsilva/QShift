from fastapi.testclient import TestClient
import pytest

from app.main import app


@pytest.fixture
def client():
    """HTTP client for testing the API."""
    return TestClient(app)


@pytest.fixture
def seeded_data(client):
    """Populate database with seed data and return metadata."""
    response = client.post("/api/v1/dev/seed")
    assert response.status_code == 200
    return response.json()

