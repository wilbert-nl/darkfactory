#!/usr/bin/env bash
# Create a new issue file in issues/untriaged/.
# Usage: ./scripts/issue-new.sh "Issue title" "Description" [phase] [task_id] [priority] [hours]
#
# Example:
#   ./scripts/issue-new.sh \
#     "Add product image upload" \
#     "Products need image upload support. Acceptance: file upload endpoint, stored in product.imageUrl" \
#     "P5" "P5-T2" "medium" 4

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "${SCRIPT_DIR}")"
ISSUES_DIR="${PROJECT_DIR}/issues"

# Arguments
TITLE="${1:-}"
DESCRIPTION="${2:-}"
PHASE="${3:-manual}"
TASK_ID="${4:-MANUAL}"
PRIORITY="${5:-medium}"
HOURS="${6:-0}"

if [ -z "${TITLE}" ]; then
  echo "Usage: $0 \"Issue title\" \"Description\" [phase] [task_id] [priority] [hours]"
  exit 1
fi

# Find next ID
NEXT_ID=1
for dir in "${ISSUES_DIR}"/*/; do
  for f in "${dir}"*.md 2>/dev/null; do
    [ -f "${f}" ] || continue
    NUM=$(basename "${f}" | grep -oE '^[0-9]+' || echo 0)
    if [ "${NUM}" -gt "${NEXT_ID}" ]; then
      NEXT_ID=$((NUM + 1))
    fi
  done
done
NEXT_ID=$(printf "%03d" "${NEXT_ID}")

# Build filename
SLUG=$(echo "${TITLE}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//' | cut -c1-60)
FILENAME="${NEXT_ID}-${SLUG}.md"
FILEPATH="${ISSUES_DIR}/untriaged/${FILENAME}"

TODAY=$(date +%Y-%m-%d)

cat > "${FILEPATH}" << EOF
---
id: "${NEXT_ID}"
title: "${TITLE}"
phase: "${PHASE}"
task_id: "${TASK_ID}"
priority: "${PRIORITY}"
estimated_hours: ${HOURS}
status: "untriaged"
created_at: "${TODAY}"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

${DESCRIPTION}

## Acceptance Criteria

- [ ] (fill in acceptance criteria)

## Context

(fill in context)
EOF

echo "Created: ${FILEPATH}"
echo ""
echo "Edit the file to add acceptance criteria and context, then run:"
echo "  ./scripts/factory-run.sh"
