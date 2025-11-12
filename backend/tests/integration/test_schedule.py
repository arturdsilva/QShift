from fastapi.testclient import TestClient
import pytest


@pytest.mark.integration
def test_create_schedule_success(client: TestClient, seeded_data):
    """Should create schedule with valid assignments."""
    week_id = seeded_data["week_id"]
    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    employees = client.get("/api/v1/employees").json()

    shift_id = shifts[0]["id"]
    employee_id = employees[0]["id"]

    response = client.post(
        f"/api/v1/weeks/{week_id}/schedule",
        json={
            "shifts": [
                {"shift_id": shift_id, "employee_ids": [employee_id]},
            ]
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert "shifts" in data
    assert len(data["shifts"]) > 0


@pytest.mark.integration
def test_create_schedule_multiple_employees(client: TestClient, seeded_data):
    """Should create schedule with multiple employees per shift."""
    week_id = seeded_data["week_id"]
    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    employees = client.get("/api/v1/employees").json()

    shift_id = shifts[0]["id"]
    employee_ids = [employees[0]["id"], employees[1]["id"]]

    response = client.post(
        f"/api/v1/weeks/{week_id}/schedule",
        json={
            "shifts": [
                {"shift_id": shift_id, "employee_ids": employee_ids},
            ]
        },
    )

    assert response.status_code == 201
    data = response.json()
    shift_data = next(s for s in data["shifts"] if s["shift_id"] == shift_id)
    assert len(shift_data["employees"]) == 2


@pytest.mark.integration
def test_create_schedule_shift_not_found(client: TestClient, seeded_data):
    """Should return 404 when creating schedule with non-existent shift."""
    week_id = seeded_data["week_id"]
    employees = client.get("/api/v1/employees").json()
    fake_shift_id = "00000000-0000-0000-0000-000000000999"

    response = client.post(
        f"/api/v1/weeks/{week_id}/schedule",
        json={
            "shifts": [
                {"shift_id": fake_shift_id, "employee_ids": [employees[0]["id"]]},
            ]
        },
    )

    assert response.status_code == 404


@pytest.mark.integration
def test_create_schedule_employee_not_found(client: TestClient, seeded_data):
    """Should return 404 when creating schedule with non-existent employee."""
    week_id = seeded_data["week_id"]
    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    fake_employee_id = "00000000-0000-0000-0000-000000000999"

    response = client.post(
        f"/api/v1/weeks/{week_id}/schedule",
        json={
            "shifts": [
                {"shift_id": shifts[0]["id"], "employee_ids": [fake_employee_id]},
            ]
        },
    )

    assert response.status_code == 404


@pytest.mark.integration
def test_read_schedule_success(client: TestClient, seeded_data):
    """Should return existing schedule."""
    week_id = seeded_data["week_id"]
    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    employees = client.get("/api/v1/employees").json()

    client.post(
        f"/api/v1/weeks/{week_id}/schedule",
        json={
            "shifts": [
                {"shift_id": shifts[0]["id"], "employee_ids": [employees[0]["id"]]},
            ]
        },
    )

    response = client.get(f"/api/v1/weeks/{week_id}/schedule")

    assert response.status_code == 200
    data = response.json()
    assert "shifts" in data
    assert len(data["shifts"]) > 0


@pytest.mark.integration
def test_read_schedule_empty(client: TestClient, seeded_data):
    """Should return empty schedule when no assignments exist."""
    week_id = seeded_data["week_id"]
    response = client.get(f"/api/v1/weeks/{week_id}/schedule")

    assert response.status_code == 200
    data = response.json()
    assert "shifts" in data
    for shift in data["shifts"]:
        assert shift["employees"] == []


@pytest.mark.integration
def test_read_schedule_structure(client: TestClient, seeded_data):
    """Should return schedule with correct structure."""
    week_id = seeded_data["week_id"]
    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    employees = client.get("/api/v1/employees").json()

    client.post(
        f"/api/v1/weeks/{week_id}/schedule",
        json={
            "shifts": [
                {"shift_id": shifts[0]["id"], "employee_ids": [employees[0]["id"]]},
            ]
        },
    )

    response = client.get(f"/api/v1/weeks/{week_id}/schedule")

    assert response.status_code == 200
    data = response.json()
    assert "shifts" in data

    for shift in data["shifts"]:
        assert "shift_id" in shift
        assert "weekday" in shift
        assert "start_time" in shift
        assert "end_time" in shift
        assert "min_staff" in shift
        assert "employees" in shift

        for employee in shift["employees"]:
            assert "employee_id" in employee
            assert "name" in employee


@pytest.mark.integration
def test_preview_schedule_feasible(client: TestClient, seeded_data):
    """Should generate feasible schedule preview."""
    week_id = seeded_data["week_id"]
    response = client.get(f"/api/v1/weeks/{week_id}/schedule/preview")

    assert response.status_code == 200
    data = response.json()
    assert "possible" in data
    assert "schedule" in data
    assert data["possible"] is True
    assert data["schedule"] is not None
    assert len(data["schedule"]["shifts"]) > 0


@pytest.mark.integration
def test_preview_schedule_does_not_persist(client: TestClient, seeded_data):
    """Should not persist preview schedule to database."""
    week_id = seeded_data["week_id"]

    preview_response = client.get(f"/api/v1/weeks/{week_id}/schedule/preview")
    assert preview_response.status_code == 200
    assert preview_response.json()["possible"] is True

    schedule_response = client.get(f"/api/v1/weeks/{week_id}/schedule")
    assert schedule_response.status_code == 200
    schedule_data = schedule_response.json()

    for shift in schedule_data["shifts"]:
        assert shift["employees"] == []


@pytest.mark.integration
def test_preview_schedule_no_employees(client: TestClient):
    """Should return not possible when no employees exist."""
    client.post("/api/v1/dev/seed")
    employees = client.get("/api/v1/employees").json()
    for emp in employees:
        client.delete(f"/api/v1/employees/{emp['id']}")

    weeks = client.get("/api/v1/weeks").json()
    week_id = weeks[0]["id"]

    response = client.get(f"/api/v1/weeks/{week_id}/schedule/preview")

    assert response.status_code == 200
    data = response.json()
    assert data["possible"] is False
    assert data["schedule"] is None


@pytest.mark.integration
def test_preview_schedule_no_availabilities(client: TestClient):
    """Should return not possible when no availabilities exist."""
    client.post("/api/v1/dev/seed")
    employees = client.get("/api/v1/employees").json()
    for emp in employees:
        availabilities = client.get(
            f"/api/v1/employees/{emp['id']}/availabilities"
        ).json()
        for avail in availabilities:
            client.delete(
                f"/api/v1/employees/{emp['id']}/availabilities/{avail['id']}"
            )

    weeks = client.get("/api/v1/weeks").json()
    week_id = weeks[0]["id"]

    response = client.get(f"/api/v1/weeks/{week_id}/schedule/preview")

    assert response.status_code == 200
    data = response.json()
    assert data["possible"] is False
    assert data["schedule"] is None


@pytest.mark.integration
def test_preview_schedule_structure(client: TestClient, seeded_data):
    """Should return preview with correct structure."""
    week_id = seeded_data["week_id"]
    response = client.get(f"/api/v1/weeks/{week_id}/schedule/preview")

    assert response.status_code == 200
    data = response.json()
    assert "possible" in data
    assert "schedule" in data

    if data["possible"]:
        schedule = data["schedule"]
        assert "shifts" in schedule

        for shift in schedule["shifts"]:
            assert "shift_id" in shift
            assert "weekday" in shift
            assert "start_time" in shift
            assert "end_time" in shift
            assert "min_staff" in shift
            assert "employees" in shift

            for employee in shift["employees"]:
                assert "employee_id" in employee
                assert "name" in employee


@pytest.mark.integration
def test_preview_schedule_respects_availabilities(client: TestClient, seeded_data):
    """Should only assign employees to shifts they are available for."""
    week_id = seeded_data["week_id"]
    response = client.get(f"/api/v1/weeks/{week_id}/schedule/preview")

    assert response.status_code == 200
    data = response.json()

    if data["possible"]:
        schedule = data["schedule"]
        shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()

        for schedule_shift in schedule["shifts"]:
            shift = next(s for s in shifts if s["id"] == schedule_shift["shift_id"])

            for employee in schedule_shift["employees"]:
                availabilities = client.get(
                    f"/api/v1/employees/{employee['employee_id']}/availabilities"
                ).json()

                has_availability = any(
                    avail["weekday"] == shift["weekday"]
                    and avail["start_time"] <= shift["start_time"]
                    and avail["end_time"] >= shift["end_time"]
                    for avail in availabilities
                )
                assert has_availability, (
                    f"Employee {employee['name']} assigned to shift "
                    f"without proper availability"
                )

