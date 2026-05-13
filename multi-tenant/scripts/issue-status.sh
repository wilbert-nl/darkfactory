#!/usr/bin/env bash
# Show current factory state — count issues in each directory.
# Usage: ./scripts/issue-status.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "${SCRIPT_DIR}")"
ISSUES_DIR="${PROJECT_DIR}/issues"

count_dir() {
  ls "${ISSUES_DIR}/${1}"/*.md 2>/dev/null | wc -l | tr -d ' '
}

echo "=== Factory Issue Status ==="
echo ""
printf "%-20s %s\n" "State" "Count"
printf "%-20s %s\n" "-----" "-----"
printf "%-20s %s\n" "untriaged"   "$(count_dir untriaged)"
printf "%-20s %s\n" "accepted"    "$(count_dir accepted)"
printf "%-20s %s\n" "in-progress" "$(count_dir in-progress)"
printf "%-20s %s\n" "review"      "$(count_dir review)"
printf "%-20s %s\n" "done"        "$(count_dir done)"
printf "%-20s %s\n" "rejected"    "$(count_dir rejected)"
printf "%-20s %s\n" "needs-human" "$(count_dir needs-human)"
echo ""
echo "Run './scripts/factory-run.sh' to process work."
