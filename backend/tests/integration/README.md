# Integration Tests

This directory contains integration tests for the QShift API. These tests verify the complete flow from HTTP requests through validation, business logic, and database operations.

## Test Files

### `conftest.py`
Shared fixtures for all integration tests:
- `client`: HTTP test client with database cleanup
- `clean_db`: Ensures clean database state before tests
- `seeded_data`: Pre-populated database with demo data (user, employees, week, shifts, availabilities)
- `sample_employee`: Creates a single employee for isolated tests

---

### `test_employees.py` (21 tests)
Tests for employee CRUD operations (`/api/v1/employees`):

**Create Operations:**
- ✅ Create employee with valid data (name + active status)
- ✅ Create inactive employee (active=False)
- ✅ Create employee with defaults (active=True by default)
- ❌ Reject empty name
- ❌ Reject name exceeding max length (100 chars)
- ❌ Reject name with only whitespace

**Read Operations:**
- ✅ List all employees (empty list when none exist)
- ✅ List employees ordered by name (case-insensitive)
- ✅ Read single employee by ID
- ❌ Return 404 for non-existent employee
- ❌ Return 422 for invalid UUID format

**Update Operations:**
- ✅ Update employee name
- ✅ Update employee active status
- ✅ Update both name and active status
- ✅ Handle empty PATCH payload (no changes)
- ❌ Reject invalid name on update
- ❌ Reject invalid active value

**Delete Operations:**
- ✅ Delete employee successfully
- ✅ Cascade delete employee's availabilities
- ❌ Return 404 when deleting non-existent employee

---

### `test_weeks.py` (22 tests)
Tests for week CRUD operations (`/api/v1/weeks`):

**Create Operations:**
- ✅ Create week with valid start_date (Monday)
- ✅ Create week with custom open_days [0,1,2,3,4] (Mon-Fri)
- ✅ Normalize duplicate open_days [0,0,1,1] → [0,1]
- ❌ Reject start_date not on Monday
- ❌ Reject empty open_days list
- ❌ Reject open_days with invalid weekday (>6 or <0)
- ❌ Reject duplicate week (same user + start_date)

**Read Operations:**
- ✅ List all weeks (empty list when none exist)
- ✅ List weeks ordered by start_date descending (newest first)
- ✅ Read single week by ID
- ❌ Return 404 for non-existent week

**Update Operations:**
- ✅ Update week's open_days
- ✅ Handle empty PATCH payload (no changes)
- ❌ Reject empty open_days on update
- ❌ Reject invalid open_days on update

**Delete Operations:**
- ✅ Delete week successfully
- ✅ Cascade delete week's shifts
- ❌ Return 404 when deleting non-existent week

---

### `test_shifts.py` (29 tests)
Tests for shift CRUD operations (`/api/v1/weeks/{week_id}/shifts`):

**Create Operations:**
- ✅ Create shift with valid data (weekday, times, min_staff)
- ✅ Create shift with default min_staff (1)
- ✅ Allow duplicate shifts (same weekday/times)
- ✅ Calculate local_date from week.start_date + weekday
- ❌ Reject shift when week not found
- ❌ Reject invalid weekday (<0 or >6)
- ❌ Reject invalid time format
- ❌ Reject end_time before start_time
- ❌ Reject min_staff < 1

**Read Operations:**
- ✅ List all shifts for a week
- ✅ List shifts ordered by weekday, start_time, end_time
- ✅ Filter shifts by weekday query parameter
- ✅ Read single shift by ID
- ❌ Return 404 for non-existent shift

**Update Operations:**
- ✅ Update shift times (recalculates duration)
- ✅ Update shift weekday (recalculates local_date)
- ✅ Update shift min_staff
- ✅ Handle empty PATCH payload (no changes)
- ❌ Reject invalid times on update
- ❌ Reject invalid weekday on update
- ❌ Reject invalid min_staff on update

**Delete Operations:**
- ✅ Delete shift successfully
- ❌ Return 404 when deleting non-existent shift

---

### `test_availabilities.py` (17 tests)
Tests for availability CRUD operations (`/api/v1/employees/{employee_id}/availabilities`):

**Create Operations:**
- ✅ Create availability with valid data (weekday, times)
- ✅ Allow duplicate availabilities (same weekday/times)
- ❌ Reject availability when employee not found
- ❌ Reject invalid weekday
- ❌ Reject invalid time format
- ❌ Reject end_time before start_time

**Read Operations:**
- ✅ List all availabilities for an employee
- ✅ List availabilities ordered by weekday, start_time

**Update Operations:**
- ✅ Update availability times
- ✅ Update availability weekday
- ❌ Reject invalid times on update
- ❌ Reject invalid weekday on update

**Delete Operations:**
- ✅ Delete availability successfully
- ❌ Return 404 when deleting non-existent availability

---

### `test_schedule.py` (16 tests)
Tests for schedule generation and management (`/api/v1/weeks/{week_id}/schedule`):

**Create Operations:**
- ✅ Create schedule with valid shift assignments
- ✅ Create schedule with multiple employees per shift
- ❌ Reject when shift not found
- ❌ Reject when employee not found

**Read Operations:**
- ✅ Read existing schedule with assignments
- ✅ Read empty schedule (no assignments)
- ✅ Validate schedule structure (shifts, employees, times)

**Preview Operations:**
- ✅ Generate preview schedule (not persisted)
- ✅ Preview returns feasible assignments
- ✅ Preview respects employee availabilities
- ✅ Validate preview structure matches schema
- ❌ Return not possible when no employees exist
- ❌ Return not possible when no availabilities exist
- ✅ Exclude inactive employees from preview

---

### `test_edge_cases.py` (20 tests)
Tests for edge cases and cross-cutting concerns:

**Cascade Deletes:**
- ✅ Deleting employee cascades to availabilities
- ✅ Deleting employee cascades to shift assignments
- ✅ Deleting week cascades to shifts
- ✅ Deleting shift cascades to shift assignments

**Duplicate Constraints:**
- ❌ Reject duplicate week (same user + start_date)
- ❌ Reject duplicate shift (same week + weekday + times via uq_shift_slot)
- ❌ Reject duplicate availability (same employee + weekday + times)

**Assignment Edge Cases:**
- ✅ Allow assigning inactive employee to shift
- ✅ Allow assigning employee without availability to shift

**Preview Edge Cases:**
- ✅ Preview excludes inactive employees from generation
- ✅ Preview handles large min_staff with few employees

**Overlap Scenarios:**
- ✅ Allow overlapping shifts (same weekday, overlapping times)
- ✅ Allow overlapping availabilities (same weekday, overlapping times)

**Empty Data:**
- ✅ Handle empty schedule (no shifts)
- ✅ Handle week with no shifts

---

### `test_seed.py` (1 test)
Tests for development seed endpoint (`/dev/seed`):
- ✅ Seed creates complete demo data (users, employees, weeks, shifts, availabilities)

---

### `test_requirements_flows.py` (5 tests)
End-to-end tests validating complete functional requirements:

**RF-001: Employee Registration Flow**
- ✅ Create employee → verify in list → read details → update → verify changes → deactivate → verify status

**RF-002: Week Configuration Flow**
- ✅ Create week → add shifts → verify shifts → update week open_days → verify changes → delete week → verify cascade

**RF-003: Availability Management Flow**
- ✅ Create employee → add multiple availabilities → verify list → update availability → delete availability → verify changes

**RF-004: Schedule Preview Flow**
- ✅ Create week + shifts → create employees + availabilities → preview schedule → verify not persisted → verify respects availabilities

**RF-005: Schedule Generation Flow**
- ✅ Create week + shifts → create employees + availabilities → preview schedule → save schedule → verify persistence → verify assignments match preview

---

## Total Coverage

**131 integration tests** covering:
- ✅ All CRUD operations for 5 main entities (Employee, Week, Shift, Availability, Schedule)
- ✅ Input validation (Pydantic schemas)
- ✅ Database constraints (unique, foreign keys, checks)
- ✅ Cascade deletes and referential integrity
- ✅ Business logic (schedule generation with OR-Tools)
- ✅ Edge cases and error handling
- ✅ Complete end-to-end requirement flows

## Running Tests

Run all integration tests:
```bash
pytest tests/integration/ -v
```

Run specific test file:
```bash
pytest tests/integration/test_employees.py -v
```

Run tests with integration marker:
```bash
pytest -m integration -v
```

## Test Patterns

All tests follow this structure:
1. **Arrange**: Set up test data using fixtures
2. **Act**: Execute HTTP request via test client
3. **Assert**: Verify response status and data

Example:
```python
@pytest.mark.integration
def test_create_employee_success(client: TestClient, seeded_data):
    """Should create employee with valid data."""
    response = client.post(
        "/api/v1/employees",
        json={"name": "João Silva", "active": True},
    )
    
    assert response.status_code == 201
    assert response.json()["name"] == "João Silva"
```

