from fastapi.testclient import TestClient
from datetime import date, timedelta
import pytest


def next_monday(d: date = None) -> date:
    """Return the next Monday from given date (or today)."""
    if d is None:
        d = date.today()
    days_ahead = (7 - d.weekday()) % 7
    if days_ahead == 0:
        days_ahead = 7
    return d + timedelta(days=days_ahead)


def next_tuesday(d: date = None) -> date:
    """Return the next Tuesday from given date (or today)."""
    monday = next_monday(d)
    return monday + timedelta(days=1)


@pytest.mark.integration
def test_create_week_success(client: TestClient, seeded_data):
    """Should create week with valid Monday date."""
    monday = next_monday() + timedelta(days=7)
    response = client.post(
        "/api/v1/weeks",
        json={
            "start_date": monday.isoformat(),
            "open_days": [0, 1, 2, 3, 4, 5, 6],
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["start_date"] == monday.isoformat()
    assert data["open_days"] == [0, 1, 2, 3, 4, 5, 6]
    assert data["approved"] is False
    assert data["approved_at"] is None
    assert "Location" in response.headers


@pytest.mark.integration
def test_create_week_custom_open_days(client: TestClient, seeded_data):
    """Should create week with custom open days."""
    monday = next_monday() + timedelta(days=14)
    response = client.post(
        "/api/v1/weeks",
        json={
            "start_date": monday.isoformat(),
            "open_days": [0, 2, 4],
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["open_days"] == [0, 2, 4]


@pytest.mark.integration
def test_create_week_not_monday(client: TestClient, seeded_data):
    """Should reject week that does not start on Monday."""
    tuesday = next_tuesday()
    response = client.post(
        "/api/v1/weeks",
        json={
            "start_date": tuesday.isoformat(),
            "open_days": [0, 1, 2, 3, 4, 5, 6],
        },
    )

    assert response.status_code == 422


@pytest.mark.integration
def test_create_week_empty_open_days(client: TestClient, seeded_data):
    """Should reject week with empty open_days."""
    monday = next_monday() + timedelta(days=21)
    response = client.post(
        "/api/v1/weeks",
        json={
            "start_date": monday.isoformat(),
            "open_days": [],
        },
    )

    assert response.status_code == 422


@pytest.mark.integration
def test_create_week_invalid_open_days_range(client: TestClient, seeded_data):
    """Should reject week with open_days outside [0-6] range."""
    monday = next_monday() + timedelta(days=28)
    response = client.post(
        "/api/v1/weeks",
        json={
            "start_date": monday.isoformat(),
            "open_days": [0, 1, 7],
        },
    )

    assert response.status_code == 422


@pytest.mark.integration
def test_create_week_negative_open_days(client: TestClient, seeded_data):
    """Should reject week with negative open_days values."""
    monday = next_monday() + timedelta(days=35)
    response = client.post(
        "/api/v1/weeks",
        json={
            "start_date": monday.isoformat(),
            "open_days": [-1, 0, 1],
        },
    )

    assert response.status_code == 422


@pytest.mark.integration
def test_create_week_duplicate_open_days(client: TestClient, seeded_data):
    """Should normalize duplicate open_days values."""
    monday = next_monday() + timedelta(days=42)
    response = client.post(
        "/api/v1/weeks",
        json={
            "start_date": monday.isoformat(),
            "open_days": [0, 1, 1, 2, 2, 3],
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["open_days"] == [0, 1, 2, 3]


@pytest.mark.integration
def test_create_week_duplicate_start_date(client: TestClient, seeded_data):
    """Should reject duplicate week with same start_date."""
    monday = next_monday() + timedelta(days=49)
    client.post(
        "/api/v1/weeks",
        json={
            "start_date": monday.isoformat(),
            "open_days": [0, 1, 2],
        },
    )

    response = client.post(
        "/api/v1/weeks",
        json={
            "start_date": monday.isoformat(),
            "open_days": [3, 4, 5],
        },
    )

    assert response.status_code == 400


@pytest.mark.integration
def test_list_weeks_empty(client: TestClient):
    """Should return empty list when no weeks exist."""
    client.post("/api/v1/dev/seed")
    weeks = client.get("/api/v1/weeks").json()
    for week in weeks:
        client.delete(f"/api/v1/weeks/{week['id']}")

    response = client.get("/api/v1/weeks")

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.integration
def test_list_weeks_ordered_by_start_date_desc(client: TestClient, seeded_data):
    """Should return weeks ordered by start_date descending."""
    monday1 = next_monday() + timedelta(days=56)
    monday2 = next_monday() + timedelta(days=63)
    monday3 = next_monday() + timedelta(days=70)

    client.post("/api/v1/weeks", json={"start_date": monday2.isoformat(), "open_days": [0]})
    client.post("/api/v1/weeks", json={"start_date": monday1.isoformat(), "open_days": [0]})
    client.post("/api/v1/weeks", json={"start_date": monday3.isoformat(), "open_days": [0]})

    response = client.get("/api/v1/weeks")

    assert response.status_code == 200
    weeks = response.json()
    dates = [w["start_date"] for w in weeks]
    assert dates == sorted(dates, reverse=True)


@pytest.mark.integration
def test_read_week_success(client: TestClient, seeded_data):
    """Should return week by id."""
    week_id = seeded_data["week_id"]
    response = client.get(f"/api/v1/weeks/{week_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == week_id
    assert "start_date" in data
    assert "open_days" in data


@pytest.mark.integration
def test_read_week_not_found(client: TestClient, seeded_data):
    """Should return 404 for non-existent week."""
    fake_id = "00000000-0000-0000-0000-000000000999"
    response = client.get(f"/api/v1/weeks/{fake_id}")

    assert response.status_code == 404


@pytest.mark.integration
def test_update_week_open_days(client: TestClient, seeded_data):
    """Should update week open_days."""
    week_id = seeded_data["week_id"]
    response = client.patch(
        f"/api/v1/weeks/{week_id}",
        json={"open_days": [0, 1, 2]},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["open_days"] == [0, 1, 2]


@pytest.mark.integration
def test_update_week_empty_open_days(client: TestClient, seeded_data):
    """Should reject update with empty open_days."""
    week_id = seeded_data["week_id"]
    response = client.patch(
        f"/api/v1/weeks/{week_id}",
        json={"open_days": []},
    )

    assert response.status_code == 422


@pytest.mark.integration
def test_update_week_invalid_open_days(client: TestClient, seeded_data):
    """Should reject update with invalid open_days values."""
    week_id = seeded_data["week_id"]
    response = client.patch(
        f"/api/v1/weeks/{week_id}",
        json={"open_days": [0, 1, 8]},
    )

    assert response.status_code == 422


@pytest.mark.integration
def test_update_week_empty_payload(client: TestClient, seeded_data):
    """Should return unchanged week when payload is empty."""
    week_id = seeded_data["week_id"]
    original = client.get(f"/api/v1/weeks/{week_id}").json()

    response = client.patch(f"/api/v1/weeks/{week_id}", json={})

    assert response.status_code == 200
    data = response.json()
    assert data["open_days"] == original["open_days"]


@pytest.mark.integration
def test_update_week_not_found(client: TestClient, seeded_data):
    """Should return 404 when updating non-existent week."""
    fake_id = "00000000-0000-0000-0000-000000000999"
    response = client.patch(
        f"/api/v1/weeks/{fake_id}",
        json={"open_days": [0, 1]},
    )

    assert response.status_code == 404


@pytest.mark.integration
def test_delete_week_success(client: TestClient, seeded_data):
    """Should delete week successfully."""
    monday = next_monday() + timedelta(days=77)
    create_response = client.post(
        "/api/v1/weeks",
        json={"start_date": monday.isoformat(), "open_days": [0, 1]},
    )
    week_id = create_response.json()["id"]

    response = client.delete(f"/api/v1/weeks/{week_id}")

    assert response.status_code == 204

    get_response = client.get(f"/api/v1/weeks/{week_id}")
    assert get_response.status_code == 404


@pytest.mark.integration
def test_delete_week_not_found(client: TestClient, seeded_data):
    """Should return 404 when deleting non-existent week."""
    fake_id = "00000000-0000-0000-0000-000000000999"
    response = client.delete(f"/api/v1/weeks/{fake_id}")

    assert response.status_code == 404


@pytest.mark.integration
def test_delete_week_cascades_shifts(client: TestClient, seeded_data):
    """Should cascade delete week shifts."""
    week_id = seeded_data["week_id"]

    shifts_before = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    assert len(shifts_before) > 0

    delete_response = client.delete(f"/api/v1/weeks/{week_id}")
    assert delete_response.status_code == 204

    shifts_after = client.get(f"/api/v1/weeks/{week_id}/shifts")
    assert shifts_after.status_code == 404

