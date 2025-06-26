#!/bin/bash
# Wrapper script to run test:unit commands from apps/cms directory
# Usage: ./scripts/cms-test-unit.sh <filter>

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <filter>"
    echo "Example: $0 custom"
    exit 1
fi

FILTER="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CMS_DIR="$PROJECT_ROOT/apps/cms"

cd "$CMS_DIR"
exec pnpm cms:test:unit --filter="$FILTER"