#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT=3002
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"

# Add pnpm bin to PATH
export PATH="${COZE_WORKSPACE_PATH}/node_modules/.bin:${PATH}"

start_service() {
    cd "${COZE_WORKSPACE_PATH}"
    echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
    
    # Find next executable
    NEXT_BIN=$(find "${COZE_WORKSPACE_PATH}/node_modules/.pnpm" -path "*/next@*/node_modules/next/dist/bin/next" -type f 2>/dev/null | head -1)
    
    if [ -z "$NEXT_BIN" ]; then
        echo "Error: Next.js binary not found"
        exit 1
    fi
    
    node "$NEXT_BIN" start --port ${DEPLOY_RUN_PORT}
}

echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
start_service
