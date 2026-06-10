import pytest

from tests.benchmarking import format_dataset_summary, p95, sample_stddev, stats_row


@pytest.mark.unit
def test_p95_returns_last_value_for_small_sorted_sample():
    assert p95([1.0, 2.0, 3.0]) == 3.0


@pytest.mark.unit
def test_sample_stddev_handles_zero_or_one_sample():
    assert sample_stddev([]) == 0.0
    assert sample_stddev([10.0]) == 0.0


@pytest.mark.unit
def test_stats_row_exposes_expected_metrics():
    row = stats_row("endpoint", [10.0, 20.0, 30.0])

    assert row["label"] == "endpoint"
    assert row["runs"] == 3
    assert row["min_ms"] == 10.0
    assert row["avg_ms"] == 20.0
    assert row["median_ms"] == 20.0
    assert row["p95_ms"] == 30.0
    assert row["stddev_ms"] == pytest.approx(10.0)


@pytest.mark.unit
def test_format_dataset_summary_supports_dict_and_text():
    assert format_dataset_summary({"year": 2025, "weeks": 52}) == "year=2025 weeks=52"
    assert format_dataset_summary("weeks=52") == "weeks=52"
