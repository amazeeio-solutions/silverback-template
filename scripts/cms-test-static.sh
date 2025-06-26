#!/bin/bash
# Wrapper script to run test:static commands from apps/cms directory
# Usage: ./scripts/cms-test-static.sh <path-to-package>

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path-to-package>"
    echo "Example: $0 ../../packages/drupal/custom/"
    exit 1
fi

PACKAGE_PATH="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CMS_DIR="$PROJECT_ROOT/apps/cms"

cd "$CMS_DIR"
exec pnpm cms:test:static "$PACKAGE_PATH"