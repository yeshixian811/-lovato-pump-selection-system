#!/bin/bash
set -Eeuo pipefail

PORT=3002
COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
NODE_ENV=development
DEPLOY_RUN_PORT=3002

# Add pnpm bin to PATH
export PATH="${COZE_WORKSPACE_PATH}/node_modules/.bin:${PATH}"

cd "${COZE_WORKSPACE_PATH}"

kill_port_if_listening() {
    local pids
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -z "${pids}" ]]; then
      echo "Port ${DEPLOY_RUN_PORT} is free."
      return
    fi
    echo "Port ${DEPLOY_RUN_PORT} in use by PIDs: ${pids} (SIGKILL)"
    echo "${pids}" | xargs -I {} kill -9 {}
    sleep 1
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -n "${pids}" ]]; then
      echo "Warning: port ${DEPLOY_RUN_PORT} still busy after SIGKILL, PIDs: ${pids}"
    else
      echo "Port ${DEPLOY_RUN_PORT} cleared."
    fi
}

echo "Clearing port ${PORT} before start."
kill_port_if_listening
echo "Starting HTTP service on port ${PORT} for dev..."

# Find next executable
NEXT_BIN=$(find "${COZE_WORKSPACE_PATH}/node_modules/.pnpm" -path "*/next@*/node_modules/next/dist/bin/next" -type f 2>/dev/null | head -1)

if [ -z "$NEXT_BIN" ]; then
    echo "Error: Next.js binary not found"
    exit 1
fi

node "$NEXT_BIN" dev --port $PORT
