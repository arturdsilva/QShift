# Integration Tests

This directory contains integration tests for the QShift API. These tests verify the complete flow from HTTP requests through validation, business logic, and database operations.

## Test Files

### `conftest.py`
Shared fixtures for all integration tests:
- `client`: HTTP test client
- `seeded_data`: Pre-populated database with demo data

### `test_employees.py` (21 tests)
Tests for employee CRUD operations:
- ✅ Create employee (success, inactive, defaults)
- ❌ Validation errors (empty name, too long, whitespace)
- ✅ List employees (empty, ordered by name)
- ✅ Read employee (success, not found, invalid UUID)
- ✅ Update employee (name, active, both, empty payload)
- ❌ Update validation errors
- ✅ Delete employee (success, cascade availabilities)

### `test_weeks.py` (22 tests)
Tests for week CRUD operations:
- ✅ Create week (success, custom open_days, duplicate normalization)
- ❌ Validation errors (not Monday, empty/invalid open_days)
- ❌ Duplicate week constraint
- ✅ List weeks (empty, ordered by date desc)
- ✅ Read week (success, not found)
- ✅ Update week (open_days, empty payload)
- ❌ Update validation errors
- ✅ Delete week (success, cascade shifts)

### `test_shifts.py` (29 tests)
Tests for shift CRUD operations:
- ✅ Create shift (success, defaults, duplicate)
- ❌ Validation errors (invalid times, weekday, min_staff)
- ❌ Week not found
- ✅ List shifts (success, ordered, filtered by weekday)
- ✅ Read shift (success, not found)
- ✅ Update shift (times, weekday, min_staff, empty payload)
- ❌ Update validation errors
- ✅ Delete shift (success, not found)

### `test_availabilities.py` (17 tests)
Tests for availability CRUD operations:
- ✅ Create availability (success, duplicate)
- ❌ Validation errors (invalid times, weekday)
- ❌ Employee not found
- ✅ List availabilities (success, ordered)
- ✅ Update availability (times, weekday)
- ❌ Update validation errors
- ✅ Delete availability (success, not found)

### `test_schedule.py` (16 tests)
Tests for schedule generation and management:
- ✅ Create schedule (success, multiple employees)
- ❌ Shift/employee not found
- ✅ Read schedule (success, empty, structure validation)
- ✅ Preview schedule (feasible, not persisted, structure)
- ❌ Preview not possible (no employees, no availabilities)
- ✅ Preview respects availabilities

### `test_edge_cases.py` (20 tests)
Tests for edge cases and special scenarios:
- ✅ Cascade deletes (employee→availabilities/assignments, week→shifts, shift→assignments)
- ❌ Duplicate constraints (week, shift, availability)
- ✅ Assignment edge cases (inactive employee, no availability)
- ✅ Preview edge cases (inactive employees excluded)
- ✅ Shift/availability overlaps allowed
- ✅ Large min_staff with few employees
- ✅ Empty schedules

### `test_seed.py` (1 test)
Tests for seed endpoint:
- ✅ Seed happy flow (creates users, employees, weeks, shifts, availabilities)

## Total Coverage

**125 integration tests** covering:
- ✅ All CRUD operations for 5 main entities
- ✅ Input validation (Pydantic schemas)
- ✅ Database constraints (unique, foreign keys, checks)
- ✅ Cascade deletes
- ✅ Business logic (schedule generation)
- ✅ Edge cases and error handling

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

