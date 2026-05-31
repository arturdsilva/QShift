#!/usr/bin/env bash

# Runs both the core API (port 8000) and the schedule generator API (port 8001).
# Use run_core.sh or run_generator.sh to start each service individually.

DIR="$(cd "$(dirname "$0")" && pwd)"

"$DIR/run_core.sh" &
CORE_PID=$!

"$DIR/run_generator.sh" &
GEN_PID=$!

trap 'echo; echo "Stopping services..."; kill "$CORE_PID" "$GEN_PID" 2>/dev/null; wait' SIGINT SIGTERM EXIT

wait "$CORE_PID" "$GEN_PID"
