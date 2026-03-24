#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 매시 정각에 launchd가 호출하고, 여기서 한국 시간 10:00일 때만 실행 (시스템 시간대 무관)
NOW_KST=$(TZ=Asia/Seoul date +%H:%M)
if [[ "$NOW_KST" != "10:00" ]]; then
  exit 0
fi

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin"
exec node index.js
