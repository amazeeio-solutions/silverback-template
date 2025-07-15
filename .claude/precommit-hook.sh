#!/bin/bash

# Claude Hook Script for Precommit
# Automatically runs precommit in the package directory containing the edited file

set -e

# Function to find the nearest package.json file
find_package_root() {
    local dir="$1"
    while [[ "$dir" != "/" ]]; do
        if [[ -f "$dir/package.json" ]]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    return 1
}

# Function to output JSON response
output_json() {
    local success="$1"
    local message="$2"
    local output="$3"
    
    cat << EOF
{
    "success": $success,
    "message": "$message",
    "output": "$output"
}
EOF
}

# Check if file path is provided
if [[ $# -eq 0 ]]; then
    output_json false "No file path provided" ""
    exit 1
fi

FILE_PATH="$1"
ABSOLUTE_PATH=$(realpath "$FILE_PATH" 2>/dev/null || echo "$FILE_PATH")

# Find the package root
PACKAGE_ROOT=$(find_package_root "$(dirname "$ABSOLUTE_PATH")")

if [[ -z "$PACKAGE_ROOT" ]]; then
    output_json false "No package.json found in directory tree" ""
    exit 1
fi

# Check if package.json has precommit script
if ! grep -q '"precommit"' "$PACKAGE_ROOT/package.json"; then
    output_json true "No precommit script found in package.json, skipping" ""
    exit 0
fi

# Change to package directory and run precommit
cd "$PACKAGE_ROOT"

# Capture output and exit code
PRECOMMIT_OUTPUT=$(pnpm precommit 2>&1)
EXIT_CODE=$?

if [[ $EXIT_CODE -eq 0 ]]; then
    output_json true "Precommit passed successfully" "$PRECOMMIT_OUTPUT"
else
    # Escape output for JSON
    ESCAPED_OUTPUT=$(echo "$PRECOMMIT_OUTPUT" | sed 's/"/\\"/g' | sed 's/\\/\\\\/g' | tr '\n' '\\n')
    output_json false "Precommit failed" "$ESCAPED_OUTPUT"
    exit 1
fi