from fastapi.testclient import TestClient
from app.main import app
import pytest


@pytest.mark.integration
def test_seed_happy_flow():
    c = TestClient(app)

    API = "/api/v1"

    # 1) Seed
    r = c.post(f"{API}/dev/seed")
    print(r.json())
    assert r.status_code == 200
    meta = r.json()
    week_id = meta["week_id"]

    # 2) Employees
    r = c.get(f"{API}/employees")
    assert r.status_code == 200
    employees = r.json()
    assert len(employees) == 5

    # 3) Shifts
    r = c.get(f"{API}/weeks/{week_id}/shifts")
    assert r.status_code == 200
    shifts = r.json()
    assert len(shifts) == 13  # 6 days * 2 shifts

    # 4) Availabilities
    total_av = 0
    for e in employees:
        r = c.get(f"{API}/employees/{e['id']}/availabilities")
        assert r.status_code == 200
        total_av += len(r.json())
    expected_av = len(employees) * 5
    assert total_av == expected_av
