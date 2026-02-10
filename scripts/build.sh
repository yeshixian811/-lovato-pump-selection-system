#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
ELECTRON_SKIP_BINARY_DOWNLOAD=1 \
ELECTRON_SKIP_NOTARIZATION=1 \
SKIP_S3_BINARY_DOWNLOAD=1 \
pnpm install --prefer-offline --frozen-lockfile=false --loglevel warn

echo "Building the project..."
npx next build

echo "Build completed successfully!"
