#!/usr/bin/env bash
set -euo pipefail

# Start FastAPI backend
pushd backend >/dev/null
/workspaces/Video-Analyzer-MVP/.venv/bin/python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
popd >/dev/null

# Start Next.js frontend
pushd frontend >/dev/null
npm run dev &
FRONTEND_PID=$!
popd >/dev/null

echo "Backend PID: ${BACKEND_PID}"
echo "Frontend PID: ${FRONTEND_PID}"

echo "Servers running: http://localhost:8000 (API), http://localhost:3000 (Web)"

echo "Press Ctrl+C to stop both."
trap 'echo "Stopping..."; kill ${BACKEND_PID} ${FRONTEND_PID} 2>/dev/null || true' EXIT
wait