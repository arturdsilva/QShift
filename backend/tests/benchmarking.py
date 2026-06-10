from __future__ import annotations

import math
import statistics
import time
from dataclasses import asdict, is_dataclass
from typing import Any, Callable


def p95(values: list[float]) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = max(0, math.ceil(len(ordered) * 0.95) - 1)
    return ordered[index]


def sample_stddev(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    return statistics.stdev(values)


def stats_row(label: str, samples_ms: list[float]) -> dict[str, float | int | str]:
    return {
        "label": label,
        "runs": len(samples_ms),
        "min_ms": min(samples_ms),
        "avg_ms": statistics.mean(samples_ms),
        "median_ms": statistics.median(samples_ms),
        "stddev_ms": sample_stddev(samples_ms),
        "p95_ms": p95(samples_ms),
    }


def measure_ms(runs: int, callback: Callable[[], Any]) -> list[float]:
    samples_ms: list[float] = []
    for _ in range(runs):
        start = time.perf_counter()
        callback()
        samples_ms.append((time.perf_counter() - start) * 1000)
    return samples_ms


def format_dataset_summary(dataset: Any) -> str:
    if dataset is None:
        return ""
    if isinstance(dataset, str):
        return dataset
    if is_dataclass(dataset):
        dataset = asdict(dataset)
    if isinstance(dataset, dict):
        return " ".join(f"{key}={value}" for key, value in dataset.items())
    return str(dataset)


def print_summary(
    label: str,
    samples_ms: list[float],
    *,
    dataset: Any = None,
) -> None:
    stats = stats_row(label, samples_ms)
    dataset_summary = format_dataset_summary(dataset)
    dataset_suffix = f" dataset={dataset_summary}" if dataset_summary else ""
    print(
        (
            f"\n[{label}] runs={stats['runs']} "
            f"min={stats['min_ms']:.2f}ms "
            f"avg={stats['avg_ms']:.2f}ms "
            f"median={stats['median_ms']:.2f}ms "
            f"stddev={stats['stddev_ms']:.2f}ms "
            f"p95={stats['p95_ms']:.2f}ms"
            f"{dataset_suffix}"
        )
    )


def print_final_summary(
    rows: list[dict[str, float | int | str]],
    *,
    dataset: Any = None,
    title: str = "FINAL LATENCY SUMMARY",
) -> None:
    print(f"\n=== {title} ===")
    dataset_summary = format_dataset_summary(dataset)
    if dataset_summary:
        print(f"dataset: {dataset_summary}")
    for row in rows:
        print(
            (
                f"{row['label']}: runs={row['runs']} "
                f"avg={row['avg_ms']:.2f}ms "
                f"median={row['median_ms']:.2f}ms "
                f"stddev={row['stddev_ms']:.2f}ms "
                f"min={row['min_ms']:.2f}ms "
                f"p95={row['p95_ms']:.2f}ms"
            )
        )
