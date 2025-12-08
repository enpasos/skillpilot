#!/usr/bin/env bash
set -euo pipefail
PORT=${PORT:-8787}
HOST=${HOST:-localhost}
URL_BASE="http://${HOST}:${PORT}"
LOG_FILE=${LOG_FILE:-/tmp/skillpilot-bench.log}
RUNS=${RUNS:-5}
PARALLEL=${PARALLEL:-1}

echo "Starting benchmark against ${URL_BASE} (runs=${RUNS})"

# stop any old server
pkill -f "server/mcpServer.ts" 2>/dev/null || true

# start fresh server
node_modules/.bin/tsx server/mcpServer.ts >"$LOG_FILE" 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
sleep 2

# quick health check
if ! curl -s -o /dev/null "$URL_BASE/openapi.json"; then
  echo "Server did not respond to /openapi.json. Check $LOG_FILE"
  exit 1
fi

measure() {
  local url="$1"; local method="$2"; local data="${3:-}"; local n=${4:-$RUNS}
  local times
  times=$(
    URL="$url" METHOD="$method" PAYLOAD="$data" \
      xargs -n1 -P "$PARALLEL" sh -c '
        if [ "$METHOD" = "GET" ]; then
          curl -s -o /dev/null -w "%{time_total}\n" "$URL"
        else
          curl -s -o /dev/null -w "%{time_total}\n" -X "$METHOD" \
            -H "Content-Type: application/json" -d "$PAYLOAD" "$URL"
        fi
      ' <<EOF
$(seq 1 "$n")
EOF
  )
  printf "%s\n" "$times" | python -c "import sys, statistics as st
xs=[float(x) for x in sys.stdin.read().split() if x.strip()]
xs.sort()
if not xs:
    print('no data'); sys.exit(1)
avg=sum(xs)/len(xs)
p50=st.median(xs)
p95=xs[int(0.95*(len(xs)-1))]
p99=xs[int(0.99*(len(xs)-1))]
print(f'count={len(xs)} avg={avg:.4f}s p50={p50:.4f}s p95={p95:.4f}s p99={p99:.4f}s raw={\",\".join(f\"{x:.4f}\" for x in xs)}')"
}

echo "Requesting SkillPilot-ID from server..."
SKILLPILOT_ID=$(
  curl -s -X POST "$URL_BASE/learners" \
    | python -c "import sys, json
data=sys.stdin.read()
try:
    obj=json.loads(data) if data.strip() else {}
    print(obj.get('learnerId') or obj.get('skillpilotId') or '')
except Exception:
    print('')"
)

if [ -z "$SKILLPILOT_ID" ]; then
  echo "Failed to obtain SkillPilot-ID. Check $LOG_FILE"
  exit 1
fi

OPENAPI_STATS=$(measure "$URL_BASE/openapi.json" GET "" "$RUNS")
FRONTIER_STATS=$(measure "$URL_BASE/frontier" POST "{\"learnerId\":\"$SKILLPILOT_ID\"}" "$RUNS")

kill $PID 2>/dev/null || true
trap - EXIT

cat <<REPORT
SkillPilot ID: $SKILLPILOT_ID
OpenAPI: $OPENAPI_STATS
Frontier: $FRONTIER_STATS
REPORT
