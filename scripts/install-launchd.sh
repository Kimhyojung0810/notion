#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT="$ROOT/scripts/run-deadline-reminder.sh"
PLIST_NAME="com.notion.deadline-reminder.plist"
DEST="$HOME/Library/LaunchAgents/$PLIST_NAME"

chmod +x "$SCRIPT"

cat >"$DEST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.notion.deadline-reminder</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$SCRIPT</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$ROOT</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string>
  </dict>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Minute</key>
    <integer>0</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>$ROOT/reminder.log</string>
  <key>StandardErrorPath</key>
  <string>$ROOT/reminder.error.log</string>
</dict>
</plist>
PLIST

launchctl bootout "gui/$(id -u)" "$DEST" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$DEST"

echo "등록 완료: $DEST"
echo "매시 정각에 스크립트가 실행되며, 한국 시간 10:00일 때만 알림을 보냅니다."
echo "로그: $ROOT/reminder.log / $ROOT/reminder.error.log"
echo "해제: launchctl bootout gui/\$(id -u) \"$DEST\""
