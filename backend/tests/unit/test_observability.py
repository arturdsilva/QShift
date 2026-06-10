from shared.observability import MetricsRegistry


def test_metrics_registry_renders_prometheus_http_metrics():
    registry = MetricsRegistry(service_name="test_service")
    registry.record_http_request(
        method="GET",
        route="/healthz",
        status_code=200,
        duration_seconds=0.012,
    )
    registry.record_http_request(
        method="POST",
        route="/api/v1/example",
        status_code=503,
        duration_seconds=0.2,
    )

    metrics = registry.render_prometheus(env="test")

    assert 'qshift_app_info{env="test",service="test_service"} 1' in metrics
    assert (
        'qshift_http_requests_total{method="GET",route="/healthz",service="test_service",status_class="2xx",status_code="200"} 1'
        in metrics
    )
    assert (
        'qshift_http_requests_total{method="POST",route="/api/v1/example",service="test_service",status_class="5xx",status_code="503"} 1'
        in metrics
    )
    assert "qshift_http_request_duration_seconds_bucket" in metrics


def test_metrics_registry_snapshot_summarizes_errors_and_latency():
    registry = MetricsRegistry(service_name="test_service")
    registry.record_http_request(
        method="GET",
        route="/healthz",
        status_code=200,
        duration_seconds=0.01,
    )
    registry.record_http_request(
        method="GET",
        route="/healthz",
        status_code=500,
        duration_seconds=0.03,
    )

    snapshot = registry.http_snapshot()

    assert snapshot["request_count"] == 2
    assert snapshot["error_count"] == 1
    assert snapshot["average_latency_ms"] == 20.0
    assert snapshot["routes"] == [
        {
            "method": "GET",
            "route": "/healthz",
            "request_count": 2,
            "error_count": 1,
            "average_latency_ms": 20.0,
        }
    ]
