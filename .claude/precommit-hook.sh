#!/bin/bash

# Claude Hook Script for Precommit
# Automatically runs precommit for the specific pnpm workspace package containing the edited file

set -e

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

# Find the project root (where pnpm-workspace.yaml exists)
PROJECT_ROOT="$(pwd)"
while [[ "$PROJECT_ROOT" != "/" ]]; do
    if [[ -f "$PROJECT_ROOT/pnpm-workspace.yaml" ]]; then
        break
    fi
    PROJECT_ROOT="$(dirname "$PROJECT_ROOT")"
done

if [[ ! -f "$PROJECT_ROOT/pnpm-workspace.yaml" ]]; then
    output_json false "Could not find pnpm-workspace.yaml in any parent directory" ""
    exit 1
fi

cd "$PROJECT_ROOT"

# Use the package detection utility to find the package
if [[ -f ".claude/scripts/detect-package.js" ]]; then
    PACKAGE_INFO=$(node .claude/scripts/detect-package.js "$FILE_PATH" 2>/dev/null)
    
    if [[ $? -eq 0 ]]; then
        # Parse package name from JSON output
        PACKAGE_NAME=$(echo "$PACKAGE_INFO" | node -e "
            const pkg = JSON.parse(require('fs').readFileSync(0, 'utf8'));
            console.log(pkg.name || '');
        ")
        
        if [[ -n "$PACKAGE_NAME" ]]; then
            # Run precommit for the specific package using pnpm --filter
            PRECOMMIT_OUTPUT=$(pnpm --filter "$PACKAGE_NAME" precommit 2>&1)
            EXIT_CODE=$?
            
            if [[ $EXIT_CODE -eq 0 ]]; then
                output_json true "Precommit passed successfully for package: $PACKAGE_NAME" "$PRECOMMIT_OUTPUT"
            else
                # Escape output for JSON
                ESCAPED_OUTPUT=$(echo "$PRECOMMIT_OUTPUT" | sed 's/"/\\"/g' | sed 's/\\/\\\\/g' | tr '\n' '\\n')
                output_json false "Precommit failed for package: $PACKAGE_NAME" "$ESCAPED_OUTPUT"
                exit 1
            fi
            exit 0
        fi
    fi
fi

# Fallback: use the old approach (find nearest package.json)
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
    output_json true "Precommit passed successfully (fallback mode)" "$PRECOMMIT_OUTPUT"
else
    # Escape output for JSON
    ESCAPED_OUTPUT=$(echo "$PRECOMMIT_OUTPUT" | sed 's/"/\\"/g' | sed 's/\\/\\\\/g' | tr '\n' '\\n')
    output_json false "Precommit failed (fallback mode)" "$ESCAPED_OUTPUT"
    exit 1
fi