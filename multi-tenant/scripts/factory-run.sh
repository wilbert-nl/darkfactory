#!/usr/bin/env bash
# Run the factory orchestrator manually.
# Usage: ./scripts/factory-run.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "${SCRIPT_DIR}")"

cd "${PROJECT_DIR}"

echo "=== Multi-Tenant SaaS Dark Factory ==="
echo "Date: $(date)"
echo ""

# Check Archon is installed
if ! command -v archon &>/dev/null; then
  echo "ERROR: archon CLI not found."
  echo "Install with: curl -fsSL https://archon.sh/install.sh | sh"
  echo "Or: brew install coleam00/tap/archon"
  exit 1
fi

echo "Running orchestrator..."
archon workflow run orchestrator

echo ""
echo "=== Factory run complete ==="
