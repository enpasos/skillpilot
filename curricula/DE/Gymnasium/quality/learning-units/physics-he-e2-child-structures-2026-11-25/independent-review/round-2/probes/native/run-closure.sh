#!/bin/bash
set -euo pipefail
repo=/home/enpasos/projects/skillpilot-e1-direkteinstieg
expected=4f963b4b78922d11fea4029e15fa8183e572dd35
here=$(cd "$(dirname "$0")" && pwd)
raw=$(cd "$here/../../raw/native" && pwd)
test "$(git -C "$repo" rev-parse HEAD)" = "$expected"
test -z "$(git -C "$repo" status --porcelain --untracked-files=no)"
scratch=$(python3 - "$raw/candidate.exit.json" <<'PY'
import json,sys
print(json.load(open(sys.argv[1]))['scratch'])
PY
)
export CUT_PROBE_SOURCES="$scratch/testjava" SKILLPILOT_BACKEND_BUILD_DIR="$scratch/build"
export JAVA_HOME=/home/enpasos/projects/skillpilot/tmp/ci-tools/amazon-corretto-25.0.2.10.1
export PATH="$JAVA_HOME/bin:/home/enpasos/projects/skillpilot/tmp/ci-tools/node-v20.20.2-linux-x64/bin:$PATH" GRADLE_USER_HOME=/home/enpasos/.gradle
export CUT_EVIDENCE="$here" CUT_SCRATCH="$scratch" CUT_REPO="$repo" CUT_VARIANT=closure
python3 - "$scratch" "$here" <<'PY'
from pathlib import Path
import sys
scratch,here=map(Path,sys.argv[1:])
s=next((scratch/'backend/src/test/java').rglob('ClaudeV1CompletionRouteIntegrationTest.java')).read_text()
s=s.replace('class ClaudeV1CompletionRouteIntegrationTest','class E2ContextProbe').replace('jdbc:h2:mem:completion-mcp;','jdbc:h2:mem:e2-confirm-native;')
(scratch/'testjava/E2ContextProbe.java').write_text(s[:s.rindex('}')]+(here/'probe.method.java').read_text()+'}\n')
PY
{
 date --iso-8601=seconds
 git -C "$repo" rev-parse HEAD 'HEAD^{tree}'
 sha256sum "$here/probe.method.java" "$scratch/testjava/E2ContextProbe.java"
 java -version
} > "$raw/closure.environment.txt" 2>&1
set +e
unshare -Ur -m bash -euo pipefail -c '
 mount --make-rprivate /
 for entry in curricula app contracts scripts ai docs content; do mount --bind "$CUT_REPO/$entry" "$CUT_SCRATCH/$entry"; mount -o remount,ro,bind "$CUT_SCRATCH/$entry"; done
 cd "$CUT_SCRATCH/backend"
 ./gradlew --offline --no-daemon --project-cache-dir "$CUT_SCRATCH/.gradle-local" -PbackendTestForks=1 --max-workers=2 --console=plain -I "$CUT_EVIDENCE/coach-init.gradle" test --tests "*.E2ContextProbe.independentActualUiClosure"
' > "$raw/closure.log" 2>&1
ret=$?
set -e
for xml in "$scratch"/build/test-results/test/*.xml; do if [ -f "$xml" ]; then cp "$xml" "$raw/closure-${xml##*/}"; fi; done
python3 - "$raw/closure.exit.json" "$ret" "$scratch" <<'PY'
import json,sys,datetime
from pathlib import Path
p,ret,scratch=sys.argv[1:]
Path(p).write_text(json.dumps({'variant':'closure','exitCode':int(ret),'scratch':scratch,'endedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2)+'\n')
PY
exit "$ret"
