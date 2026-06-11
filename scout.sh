#!/bin/zsh
# Dark Factory Scout — runs the scout agent via Claude Code CLI
# Called by crontab. Logs output to plans/scout/logs/

FACTORY_DIR="/Users/wilbertverayin/projects/darkfactory"
LOG_DIR="$FACTORY_DIR/plans/scout/logs"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d_%H-%M).log"

mkdir -p "$LOG_DIR"

cd "$FACTORY_DIR" || exit 1

/usr/local/bin/claude \
  --dangerously-skip-permissions \
  --print \
  "$(cat "$FACTORY_DIR/.claude/commands/scout-agent.md")" \
  >> "$LOG_FILE" 2>&1

echo "Scout run finished at $(date)" >> "$LOG_FILE"
