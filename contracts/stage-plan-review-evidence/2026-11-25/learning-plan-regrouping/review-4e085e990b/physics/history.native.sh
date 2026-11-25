#!/usr/bin/env bash
set -euo pipefail
p=/tmp/e1-regroup-r2-runtime
test "$(df --output=avail -BG "$p" | tail -1 | tr -dc '0-9')" -gt 10
export JAVA_HOME=/home/enpasos/projects/skillpilot/tmp/ci-tools/amazon-corretto-25.0.2.10.1
export PATH="$JAVA_HOME/bin:/home/enpasos/projects/skillpilot/tmp/ci-tools/node-v20.20.2-linux-x64/bin:$PATH"
export SKILLPILOT_BACKEND_BUILD_DIR="$p/build"
cd "$p/snapshot/backend"
test "$(git rev-parse HEAD)" = 4e085e990ba4a05053904ee5cb34f5dd82418358
set +e
./gradlew --offline --no-daemon --project-cache-dir "$p/gradle-cache" --max-workers=2 -PbackendTestForks=1 --console=plain -I "$p/probe.init.gradle" test --tests '*.Round2HistoryIntegrationTest.observeHistoricalTwoEditRefocusing' > "$p/history.log" 2>&1
ret=$?
echo "$ret" > "$p/history.exit"
exit "$ret"
