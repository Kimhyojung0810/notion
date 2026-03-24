#!/usr/bin/env bash
set -euo pipefail

PLIST_NAME="com.notion.deadline-reminder.plist"
DEST="$HOME/Library/LaunchAgents/$PLIST_NAME"

if [[ -f "$DEST" ]]; then
  launchctl bootout "gui/$(id -u)" "$DEST" 2>/dev/null || true
  rm -f "$DEST"
  echo "제거했습니다: $DEST"
else
  echo "등록된 plist가 없습니다: $DEST"
fi
