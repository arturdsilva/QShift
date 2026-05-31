#!/usr/bin/env bash

# Runs the core API (port 8000)

pushd "$(dirname "$0")/.."
uvicorn core_api.main:app --reload --port 8000
popd
