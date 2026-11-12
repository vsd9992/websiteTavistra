#!/usr/bin/env bash
set -euo pipefail

SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}")"
ROOT_DIR="$(cd "$(dirname "$SCRIPT_PATH")/.." && pwd)"

get_port_pids() {
  local port="$1"
  local ss_pids=""
  local lsof_pids=""

  if command -v ss >/dev/null 2>&1; then
    ss_pids="$(ss -ltnp "sport = :$port" 2>/dev/null | grep -oE 'pid=[0-9]+' | cut -d= -f2 || true)"
  fi
  if command -v lsof >/dev/null 2>&1; then
    lsof_pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  fi

  printf "%s\n%s\n" "$ss_pids" "$lsof_pids" | grep -E '^[0-9]+$' | sort -u | tr '\n' ' '
}

port_is_listening() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    if ss -ltn "sport = :$port" 2>/dev/null | grep -q LISTEN; then
      return 0
    fi
  fi
  if command -v lsof >/dev/null 2>&1; then
    if lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      return 0
    fi
  fi
  return 1
}

kill_pid_file() {
  local pid_file="$1"
  if [ -f "$pid_file" ]; then
    local pid
    pid="$(tr -d '[:space:]' < "$pid_file" || true)"
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      pkill -TERM -P "$pid" 2>/dev/null || true
      kill -TERM "$pid" 2>/dev/null || true
    fi
    rm -f "$pid_file"
  fi
}

stop_port_service() {
  local port="$1"
  local label="$2"
  local pids
  pids="$(get_port_pids "$port" || true)"

  if [ -n "${pids// }" ]; then
    echo "Stopping $label on port $port (PID(s): $pids)..."
    # shellcheck disable=SC2086
    kill -TERM $pids 2>/dev/null || true

    for _ in $(seq 1 20); do
      sleep 0.25
      if ! port_is_listening "$port"; then
        return 0
      fi
    done

    local stubborn
    stubborn="$(get_port_pids "$port" || true)"
    if [ -n "${stubborn// }" ]; then
      echo "Force-killing remaining $label process(es) on port $port: $stubborn"
      # shellcheck disable=SC2086
      kill -KILL $stubborn 2>/dev/null || true
      sleep 0.5
    fi
  fi
}

kill_pid_file "$ROOT_DIR/storefront.pid"
kill_pid_file "$ROOT_DIR/admin.pid"
stop_port_service 3001 "Tavistra Storefront"
stop_port_service 3002 "Tavistra Admin"

still_open=""
if port_is_listening 3001; then
  still_open="$still_open 3001"
fi
if port_is_listening 3002; then
  still_open="$still_open 3002"
fi

if [ -n "$still_open" ]; then
  echo "ERROR: Port(s)$still_open are still listening after stop attempt!" >&2
  exit 1
fi

echo "Verified: Tavistra Storefront (3001) and Admin (3002) are stopped."
