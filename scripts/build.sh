#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
ELECTRON_SKIP_BINARY_DOWNLOAD=1 pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only

echo "Building the project..."
npx next build

echo "Build completed successfully!"
