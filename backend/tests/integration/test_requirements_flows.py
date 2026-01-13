from fastapi.testclient import TestClient
import pytest

@pytest.mark.integration
def test_rf001_register_availability_flow(client: TestClient, seeded_data):
    """
    RF001: Registrar disponibilidade dos funcionários.
    
    Fluxo completo:
    1. Criar funcionário
    2. Registrar disponibilidade (dias e horários)
    3. Verificar resposta HTTP
    4. Ler disponibilidade do banco de dados
    5. Confirmar persistência (NF001) e consistência (NF002)
    """
    employee_response = client.post(
        "/api/v1/employees",
        json={"name": "João Silva", "active": True},
    )
    assert employee_response.status_code == 201
    employee_id = employee_response.json()["id"]

    availability_response = client.post(
        f"/api/v1/employees/{employee_id}/availabilities",
        json={
            "weekday": 0,
            "start_time": "09:00",
            "end_time": "18:00",
        },
    )

    assert availability_response.status_code == 201
    assert "Location" in availability_response.headers

    availability_data = availability_response.json()
    assert availability_data["weekday"] == 0
    assert availability_data["start_time"] == "09:00:00"
    assert availability_data["end_time"] == "18:00:00"
    assert availability_data["employee_id"] == employee_id

    availability_id = availability_data["id"]

    read_response = client.get(f"/api/v1/employees/{employee_id}/availabilities")
    assert read_response.status_code == 200

    availabilities = read_response.json()
    saved_availability = next(
        (a for a in availabilities if a["id"] == availability_id), None
    )
    assert saved_availability is not None
    assert saved_availability["weekday"] == 0
    assert saved_availability["start_time"] == "09:00:00"
    assert saved_availability["end_time"] == "18:00:00"


@pytest.mark.integration
def test_rf005_generate_schedule_flow(client: TestClient):
    """
    RF005: Gerar automaticamente escalas semanais.
    
    Fluxo completo:
    1. Criar funcionários
    2. Registrar disponibilidades
    3. Criar semana (RF002 - dias de funcionamento)
    4. Criar turnos (RF003 - horários, RF004 - quantidade mínima)
    5. Gerar escala automaticamente
    6. Verificar que a escala foi gerada corretamente
    7. Salvar escala e verificar persistência (NF001, NF002)
    """
    client.post("/api/v1/dev/seed")

    employees = client.get("/api/v1/employees").json()
    assert len(employees) == 5

    for emp in employees:
        availabilities = client.get(
            f"/api/v1/employees/{emp['id']}/availabilities"
        ).json()
        assert len(availabilities) > 0

    weeks = client.get("/api/v1/weeks").json()
    assert len(weeks) > 0
    week_id = weeks[0]["id"]
    week = weeks[0]
    assert len(week["open_days"]) > 0

    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    assert len(shifts) > 0
    for shift in shifts:
        assert shift["min_staff"] >= 1

    preview_response = client.post(
        "/api/v1/preview-schedule",
        json={"shift_vector": shifts}
    )
    assert preview_response.status_code == 200

    preview_data = preview_response.json()
    assert preview_data["possible"] is True
    assert preview_data["schedule"] is not None

    schedule = preview_data["schedule"]
    assert "shifts" in schedule
    assert len(schedule["shifts"]) > 0

    shifts_with_employees = 0
    # Map back using index since preview shifts don't have shift_id
    schedule_payload_shifts = []

    for i, schedule_shift in enumerate(schedule["shifts"]):
        # Removed "shift_id" assertion as it's no longer in preview output
        assert "weekday" in schedule_shift
        assert "start_time" in schedule_shift
        assert "end_time" in schedule_shift
        assert "min_staff" in schedule_shift
        assert "employees" in schedule_shift
        
        if len(schedule_shift["employees"]) > 0:
            shifts_with_employees += 1
            original_shift_id = shifts[i]["id"]
            schedule_payload_shifts.append({
                "shift_id": original_shift_id,
                "employee_ids": [e["employee_id"] for e in schedule_shift["employees"]],
            })

    assert shifts_with_employees > 0

    schedule_payload = {
        "shifts": schedule_payload_shifts
    }

    save_response = client.post(
        f"/api/v1/weeks/{week_id}/schedule",
        json=schedule_payload,
    )
    assert save_response.status_code == 201

    read_schedule_response = client.get(f"/api/v1/weeks/{week_id}/schedule")
    assert read_schedule_response.status_code == 200

    saved_schedule = read_schedule_response.json()
    assert "shifts" in saved_schedule

    shifts_with_assignments = [s for s in saved_schedule["shifts"] if len(s["employees"]) > 0]
    assert len(shifts_with_assignments) > 0
    
    # Check consistency of saved schedule
    for saved_shift in shifts_with_assignments:
        # 1. Find the original shift info to identify which index in the preview it corresponds to
        matching_original_index = next(
            (i for i, s in enumerate(shifts) if s["id"] == saved_shift["shift_id"]),
            None
        )
        assert matching_original_index is not None, f"Saved shift {saved_shift['shift_id']} not found in original shifts"
        
        # 2. Get the previewed shift from the schedule output using the index
        preview_shift = schedule["shifts"][matching_original_index]
        
        # 3. Compare the saved assignment with the previewed assignment
        assert len(saved_shift["employees"]) == len(preview_shift["employees"])
        
        saved_emp_ids = set(e["employee_id"] for e in saved_shift["employees"])
        preview_emp_ids = set(e["employee_id"] for e in preview_shift["employees"])
        assert saved_emp_ids == preview_emp_ids


@pytest.mark.integration
def test_rf008_notify_unavailability_flow(client: TestClient):
    """
    RF008: Notificar indisponibilidade de funcionários.
    
    Fluxo completo:
    1. Criar cenário com funcionários insuficientes
    2. Tentar gerar escala
    3. Verificar que o sistema notifica a indisponibilidade
    4. Confirmar que API retorna possible=false
    5. Verificar consistência do sistema (NF002)
    """
    client.post("/api/v1/dev/seed")

    employees = client.get("/api/v1/employees").json()
    for emp in employees:
        client.delete(f"/api/v1/employees/{emp['id']}")

    weeks = client.get("/api/v1/weeks").json()
    week_id = weeks[0]["id"]

    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    assert len(shifts) > 0

    preview_response = client.post(
        "/api/v1/preview-schedule",
        json={"shift_vector": shifts}
    )
    assert preview_response.status_code == 200

    preview_data = preview_response.json()
    assert preview_data["possible"] is False
    assert preview_data["schedule"] is None


@pytest.mark.integration
def test_rf008_notify_unavailability_insufficient_staff(client: TestClient):
    """
    RF008: Notificar indisponibilidade - cenário de staff insuficiente.
    
    Cenário: Funcionários disponíveis, mas sem disponibilidade para turnos específicos.
    """
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

    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    preview_response = client.post(
        "/api/v1/preview-schedule",
        json={"shift_vector": shifts}
    )
    assert preview_response.status_code == 200

    preview_data = preview_response.json()
    assert preview_data["possible"] is False
    assert preview_data["schedule"] is None


@pytest.mark.integration
def test_rf008_notify_unavailability_inactive_employees(client: TestClient):
    """
    RF008: Notificar indisponibilidade - cenário de funcionários inativos.
    
    Cenário: Todos os funcionários marcados como inativos.
    """
    client.post("/api/v1/dev/seed")

    employees = client.get("/api/v1/employees").json()
    for emp in employees:
        client.patch(f"/api/v1/employees/{emp['id']}", json={"active": False})

    weeks = client.get("/api/v1/weeks").json()
    week_id = weeks[0]["id"]

    shifts = client.get(f"/api/v1/weeks/{week_id}/shifts").json()
    preview_response = client.post(
        "/api/v1/preview-schedule",
        json={"shift_vector": shifts}
    )
    assert preview_response.status_code == 200

    preview_data = preview_response.json()
    assert preview_data["possible"] is False
    assert preview_data["schedule"] is None

