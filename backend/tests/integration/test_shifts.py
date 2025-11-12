from fastapi.testclient import TestClient
import pytest


@pytest.mark.integration
def test_create_shift_success(client: TestClient, seeded_data):
    """Should create shift with valid data."""
    week_id = seeded_data["week_id"]
    response = client.post(
        f"/api/v1/weeks/{week_id}/shifts",
        json={
            "weekday": 0,
            "start_time": "08:00",
            "end_time": "12:00",
            "min_staff": 2,
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["weekday"] == 0
    assert data["start_time"] == "08:00:00"
    assert data["end_time"] == "12:00:00"
    assert data["min_staff"] == 2
    assert data["week_id"] == week_id
    assert "local_date" in data
    assert "Location" in response.headers


@pytest.mark.integration
def test_create_shift_default_min_staff(client: TestClient, seeded_data):
    """Should default min_staff to 1 when not provided."""
    week_id = seeded_data["week_id"]
    response = client.post(
        f"/api/v1/weeks/{week_id}/shifts",
        json={
            "weekday": 1,
            "start_time": "14:00",
            "end_time": "18:00",
        },
    )

    assert response.status_code == 201
    assert response.json()["min_staff"] == 1


@pytest.mark.integration
def test_create_shift_end_before_start(client: TestClient, seeded_data):
    """Should reject shift with end_time before start_time."""
    week_id = seeded_data["week_id"]
    response = client.post(
        f"/api/v1/weeks/{week_id}/shifts",
        json={
            "weekday": 0,
            "start_time": "18:00",
            "end_time": "12:00",
            "min_staff": 1,
        },
    )

    assert response.status_code == 422


@pytest.mark.integration
def test_create_shift_end_equals_start(client: TestClient, seeded_data):
    """Should reject shift with end_time equal to start_time."""
    week_id = seeded_data["week_id"]
    response = client.post(
        f"/api/v1/weeks/{week_id}/shifts",
        json={
            "weekday": 0,
            "start_time": "12:00",
            "end_time": "12:00",
            "min_staff": 1,
        },
    )

    assert response.status_code == 422


@pytest.mark.integration
def test_create_shift_invalid_weekday_negative(client: TestClient, seeded_data):
    """Should reject shift with negative weekday."""
    week_id = seeded_data["week_id"]
    response = client.post(
        f"/api/v1/weeks/{week_id}/shifts",
        json={
            "weekday": -1,
            "start_time": "09:00",
            "end_time": "17:00",
            "min_staff": 1,
        },
    )

    assert response.status_code == 422


@pytest.mark.integration
def test_create_shift_invalid_weekday_too_high(client: TestClient, seeded_data):
    """Should reject shift with weekday > 6."""
    week_id = seeded_data["week_id"]
    response = client.post(
        f"/api/v1/weeks/{week_id}/shifts",
        json={
            "weekday": 7,
            "start_time": "09:00",
            "end_time": "17:00",
            "min_staff": 1,
        },
    )

    assert response.status_code == 422


@pytest.mark.integration
def test_create_shift_min_staff_zero(client: TestClient, seeded_data):
    """Should reject shift with min_staff = 0."""
    week_id = seeded_data["week_id"]
    response = client.post(
        f"/api/v1/weeks/{week_id}/shifts",
        json={
            "weekday": 0,
            "start_time": "09:00",
            "end_time": "17:00",
            "min_staff": 0,
        },
    )

    assert response.status_code == 422


@pytest.mark.integration
def test_create_shift_min_staff_negative(client: TestClient, seeded_data):
    """Should reject shift with negative min_staff."""
    week_id = seeded_data["week_id"]
    response = client.post(
        f"/api/v1/weeks/{week_id}/shifts",
        json={
            "weekday": 0,
            "start_time": "09:00",
            "end_time": "17:00",
            "min_staff": -1,
        },
    )

    assert response.status_code == 422


@pytest.mark.integration
def test_create_shift_week_not_found(client: TestClient, seeded_data):
    """Should return 404 when creating shift for non-existent week."""
    fake_week_id = "00000000-0000-0000-0000-000000000999"
    response = client.post(
        f"/api/v1/weeks/{fake_week_id}/shifts",
        json={
            "weekday": 0,
            "start_time": "09:00",
            "end_time": "17:00",
            "min_staff": 1,
        },
    )

    assert response.status_code == 404


@pytest.mark.integration
def test_create_shift_duplicate(client: TestClient, seeded_data):
    """Should reject duplicate shift (same week, weekday, times)."""
    week_id = seeded_data["week_id"]
    shift_data = {
        "weekday": 2,
        "start_time": "10:00",
        "end_time": "14:00",
        "min_staff": 1,
    }

    first_response = client.post(f"/api/v1/weeks/{week_id}/shifts", json=shift_data)
    assert first_response.status_code == 201

    second_response = client.post(f"/api/v1/weeks/{week_id}/shifts", json=shift_data)
    assert second_response.status_code == 400


@pytest.mark.integration
def test_list_shifts_success(client: TestClient, seeded_data):
    """Should list all shifts for a week."""
    week_id = seeded_data["week_id"]
    response = client.get(f"/api/v1/weeks/{week_id}/shifts")

    assert response.status_code == 200
    shifts = response.json()
    assert len(shifts) > 0
    assert all("weekday" in s for s in shifts)
    assert all("start_time" in s for s in shifts)


@pytest.mark.integration
def test_list_shifts_ordered(client: TestClient, seeded_data):
    """Should return shifts ordered by weekday and start_time."""
    week_id = seeded_data["week_id"]
    response = client.get(f"/api/v1/weeks/{week_id}/shifts")

    assert response.status_code == 200
    shifts = response.json()
    for i in range(len(shifts) - 1):
        current = shifts[i]
        next_shift = shifts[i + 1]
        assert (current["weekday"], current["start_time"]) <= (
            next_shift["weekday"],
            next_shift["start_time"],
        )


@pytest.mark.integration
def test_list_shifts_filter_by_weekday(client: TestClient, seeded_data):
    """Should filter shifts by weekday."""
    week_id = seeded_data["week_id"]
    response = client.get(f"/api/v1/weeks/{week_id}/shifts?weekday=0")

    assert response.status_code == 200
    shifts = response.json()
    assert all(s["weekday"] == 0 for s in shifts)


@pytest.mark.integration
def test_list_shifts_week_not_found(client: TestClient, seeded_data):
    """Should return 404 when listing shifts for non-existent week."""
    fake_week_id = "00000000-0000-0000-0000-000000000999"
    response = client.get(f"/api/v1/weeks/{fake_week_id}/shifts")

    assert response.status_code == 404


@pytest.mark.integration
def test_read_shift_success(client: TestClient, seeded_data):
    """Should return shift by id."""
    week_id = seeded_data["week_id"]
    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    shift_id = shifts[0]["id"]

    response = client.get(f"/api/v1/weeks/{week_id}/shifts/{shift_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == shift_id


@pytest.mark.integration
def test_read_shift_not_found(client: TestClient, seeded_data):
    """Should return 404 for non-existent shift."""
    week_id = seeded_data["week_id"]
    fake_shift_id = "00000000-0000-0000-0000-000000000999"
    response = client.get(f"/api/v1/weeks/{week_id}/shifts/{fake_shift_id}")

    assert response.status_code == 404


@pytest.mark.integration
def test_update_shift_times(client: TestClient, seeded_data):
    """Should update shift times."""
    week_id = seeded_data["week_id"]
    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    shift_id = shifts[0]["id"]

    response = client.patch(
        f"/api/v1/weeks/{week_id}/shifts/{shift_id}",
        json={"start_time": "10:00", "end_time": "14:00"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["start_time"] == "10:00:00"
    assert data["end_time"] == "14:00:00"


@pytest.mark.integration
def test_update_shift_weekday(client: TestClient, seeded_data):
    """Should update shift weekday and recalculate local_date."""
    week_id = seeded_data["week_id"]
    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    
    shift_to_update = shifts[0]
    shift_id = shift_to_update["id"]
    original_local_date = shift_to_update["local_date"]

    conflicting_shift = next(
        s for s in shifts
        if s["weekday"] == 3
        and s["start_time"] == shift_to_update["start_time"]
        and s["end_time"] == shift_to_update["end_time"]
    )
    client.delete(f"/api/v1/weeks/{week_id}/shifts/{conflicting_shift['id']}")

    response = client.patch(
        f"/api/v1/weeks/{week_id}/shifts/{shift_id}",
        json={"weekday": 3},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["weekday"] == 3
    assert data["local_date"] != original_local_date


@pytest.mark.integration
def test_update_shift_min_staff(client: TestClient, seeded_data):
    """Should update shift min_staff."""
    week_id = seeded_data["week_id"]
    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    shift_id = shifts[0]["id"]

    response = client.patch(
        f"/api/v1/weeks/{week_id}/shifts/{shift_id}",
        json={"min_staff": 5},
    )

    assert response.status_code == 200
    assert response.json()["min_staff"] == 5


@pytest.mark.integration
def test_update_shift_empty_payload(client: TestClient, seeded_data):
    """Should return unchanged shift when payload is empty."""
    week_id = seeded_data["week_id"]
    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    shift_id = shifts[0]["id"]
    original = shifts[0]

    response = client.patch(f"/api/v1/weeks/{week_id}/shifts/{shift_id}", json={})

    assert response.status_code == 200
    data = response.json()
    assert data["start_time"] == original["start_time"]
    assert data["end_time"] == original["end_time"]


@pytest.mark.integration
def test_update_shift_invalid_times(client: TestClient, seeded_data):
    """Should reject update with invalid times."""
    week_id = seeded_data["week_id"]
    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    shift_id = shifts[0]["id"]

    response = client.patch(
        f"/api/v1/weeks/{week_id}/shifts/{shift_id}",
        json={"start_time": "18:00", "end_time": "12:00"},
    )

    assert response.status_code == 422


@pytest.mark.integration
def test_update_shift_not_found(client: TestClient, seeded_data):
    """Should return 404 when updating non-existent shift."""
    week_id = seeded_data["week_id"]
    fake_shift_id = "00000000-0000-0000-0000-000000000999"
    response = client.patch(
        f"/api/v1/weeks/{week_id}/shifts/{fake_shift_id}",
        json={"min_staff": 3},
    )

    assert response.status_code == 404


@pytest.mark.integration
def test_delete_shift_success(client: TestClient, seeded_data):
    """Should delete shift successfully."""
    week_id = seeded_data["week_id"]
    create_response = client.post(
        f"/api/v1/weeks/{week_id}/shifts",
        json={
            "weekday": 3,
            "start_time": "20:00",
            "end_time": "23:00",
            "min_staff": 1,
        },
    )
    shift_id = create_response.json()["id"]

    response = client.delete(f"/api/v1/weeks/{week_id}/shifts/{shift_id}")

    assert response.status_code == 204

    get_response = client.get(f"/api/v1/weeks/{week_id}/shifts/{shift_id}")
    assert get_response.status_code == 404


@pytest.mark.integration
def test_delete_shift_not_found(client: TestClient, seeded_data):
    """Should return 404 when deleting non-existent shift."""
    week_id = seeded_data["week_id"]
    fake_shift_id = "00000000-0000-0000-0000-000000000999"
    response = client.delete(f"/api/v1/weeks/{week_id}/shifts/{fake_shift_id}")

    assert response.status_code == 404

