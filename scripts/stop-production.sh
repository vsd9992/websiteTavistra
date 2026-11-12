#!/usr/bin/env bash
set -euo pipefail

SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}")"
ROOT_DIR="$(cd "$(dirname "$SCRIPT_PATH")/.." && pwd)"

kill_port_listeners() {
  local port="$1"
  local label="$2"
  local pids=""

  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  elif command -v ss >/dev/null 2>&1; then
    pids="$(ss -tulpn "sport = :$port" 2>/dev/null | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u || true)"
  fi

  if [ -n "$pids" ]; then
    echo "Stopping $label on port $port (PID(s): $pids)..."
    # shellcheck disable=SC2086
    kill -TERM $pids 2>/dev/null || true

    for _ in $(seq 1 20); do
      sleep 0.25
      local remaining=""
      if command -v lsof >/dev/null 2>&1; then
        remaining="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
      fi
      if [ -z "$remaining" ]; then
        break
      fi
    done

    local stubborn=""
    if command -v lsof >/dev/null 2>&1; then
      stubborn="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    fi
    if [ -n "$stubborn" ]; then
      echo "Force-killing remaining $label process(es) on port $port: $stubborn"
      # shellcheck disable=SC2086
      kill -KILL $stubborn 2>/dev/null || true
      sleep 0.5
    fi
  fi
}

kill_pid_file() {
  local pid_file="$1"
  if [ -f "$pid_file" ]; then
    local pid
    pid="$(tr -d '[:space:]' < "$pid_file" || true)"
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      # Terminate child processes spawned by pnpm/sh wrapper if any
      pkill -TERM -P "$pid" 2>/dev/null || true
      kill -TERM "$pid" 2>/dev/null || true
    fi
    rm -f "$pid_file"
  fi
}

kill_pid_file "$ROOT_DIR/storefront.pid"
kill_pid_file "$ROOT_DIR/admin.pid"
kill_port_listeners 3001 "Tavistra Storefront"
kill_port_listeners 3002 "Tavistra Admin"

# Hard verification: confirm both ports are genuinely closed before reporting success
still_open=""
if command -v lsof >/dev/null 2>&1; then
  if lsof -tiTCP:3001 -sTCP:LISTEN >/dev/null 2>&1; then
    still_open="$still_open 3001"
  fi
  if lsof -tiTCP:3002 -sTCP:LISTEN >/dev/null 2>&1; then
    still_open="$still_open 3002"
  fi
elif command -v ss >/dev/null 2>&1; then
  if ss -tln "sport = :3001" | grep -q LISTEN; then
    still_open="$still_open 3001"
  fi
  if ss -tln "sport = :3002" | grep -q LISTEN; then
    still_open="$still_open 3002"
  fi
fi

if [ -n "$still_open" ]; then
  echo "ERROR: Port(s)$still_open are still listening after stop attempt!" >&2
  exit 1
fi

echo "Verified: Tavistra Storefront (3001) and Admin (3002) are stopped."
