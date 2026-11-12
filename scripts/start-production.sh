#!/usr/bin/env bash
set -euo pipefail

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/vishnu/.nvm/versions/node/v22.23.1/bin"
SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}")"
ROOT_DIR="$(cd "$(dirname "$SCRIPT_PATH")/.." && pwd)"
cd "$ROOT_DIR"

# Stop any running instances first and verify clean ports
"$ROOT_DIR/scripts/stop-production.sh"

STOREFRONT_BIN="$ROOT_DIR/apps/storefront/node_modules/.bin/next"
ADMIN_BIN="$ROOT_DIR/apps/admin/node_modules/.bin/vite"

if [ ! -x "$STOREFRONT_BIN" ] || [ ! -x "$ADMIN_BIN" ]; then
  echo "ERROR: Missing next/vite binaries. Ensure pnpm install && pnpm build ran." >&2
  exit 1
fi

echo "Starting Tavistra Storefront on port 3001..."
(
  cd "$ROOT_DIR/apps/storefront"
  nohup "$STOREFRONT_BIN" start -p 3001 -H 0.0.0.0 > "$ROOT_DIR/storefront.log" 2>&1 < /dev/null &
  echo $! > "$ROOT_DIR/storefront.pid"
)

echo "Starting Tavistra Admin on port 3002 (proxying /api -> 127.0.0.1:3001)..."
(
  cd "$ROOT_DIR/apps/admin"
  nohup env VITE_API_TARGET="http://127.0.0.1:3001" "$ADMIN_BIN" preview --host 0.0.0.0 --port 3002 --strictPort > "$ROOT_DIR/admin.log" 2>&1 < /dev/null &
  echo $! > "$ROOT_DIR/admin.pid"
)

# Wait for both HTTP endpoints to respond cleanly
wait_for_port() {
  local port="$1"
  local name="$2"
  local url="http://127.0.0.1:${port}/"
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null "$url" 2>/dev/null; then
      echo "READY: $name listening on port $port"
      return 0
    fi
    sleep 0.5
  done
  echo "ERROR: $name did not become ready on port $port. Check logs in $ROOT_DIR." >&2
  exit 1
}

wait_for_port 3001 "Tavistra Storefront"
wait_for_port 3002 "Tavistra Admin"

# Verify Admin proxy to Storefront API returns valid JSON (not 404 HTML)
if curl -fsS "http://127.0.0.1:3002/api/admin/settings" | grep -q "maintenanceMode"; then
  echo "VERIFIED: Admin -> Storefront /api proxy healthy."
else
  echo "WARNING: Admin /api proxy check did not return expected JSON!" >&2
  exit 1
fi

echo "Storefront PID: $(cat "$ROOT_DIR/storefront.pid"), Admin PID: $(cat "$ROOT_DIR/admin.pid")"
