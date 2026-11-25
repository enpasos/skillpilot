#!/bin/bash
set -euo pipefail
variant=${1:?candidate or predecessor}
repo=/home/enpasos/projects/skillpilot-e1-direkteinstieg
expected=4f963b4b78922d11fea4029e15fa8183e572dd35
base=19c14af91ec51f184ce14d7e19980b5c96175f7f
here=$(cd "$(dirname "$0")" && pwd)
raw=$(cd "$here/../../raw/native" && pwd)
test "$(git -C "$repo" rev-parse HEAD)" = "$expected"
test -z "$(git -C "$repo" status --porcelain --untracked-files=no)"
case "$variant" in candidate|predecessor) ;; *) exit 2 ;; esac
scratch=$(mktemp -d /tmp/e2-confirm-native-XXXXXX)
mkdir -p "$scratch/testjava" "$scratch/baseviews"
export CUT_PROBE_SOURCES="$scratch/testjava" SKILLPILOT_BACKEND_BUILD_DIR="$scratch/build"
export JAVA_HOME=/home/enpasos/projects/skillpilot/tmp/ci-tools/amazon-corretto-25.0.2.10.1
export PATH="$JAVA_HOME/bin:/home/enpasos/projects/skillpilot/tmp/ci-tools/node-v20.20.2-linux-x64/bin:$PATH" GRADLE_USER_HOME=/home/enpasos/.gradle
export CUT_EVIDENCE="$here" CUT_SCRATCH="$scratch" CUT_REPO="$repo" CUT_VARIANT="$variant"
git -C "$repo" archive "$expected" backend .java-version | tar x -C "$scratch"
git -C "$scratch" init -q
git -C "$repo" rev-parse --path-format=absolute --git-path objects > "$scratch/.git/objects/info/alternates"
git -C "$scratch" update-ref refs/heads/review "$expected"
git -C "$scratch" symbolic-ref HEAD refs/heads/review
for entry in curricula app contracts scripts ai docs content; do mkdir "$scratch/$entry"; done
if [ "$variant" = predecessor ]; then
 while IFS= read -r view; do git -C "$repo" show "$base:$view" > "$scratch/baseviews/${view##*/}"; done < <(git -C "$repo" diff --name-only "$base" "$expected" -- 'curricula/DE/Gymnasium/composition-views/physik/*')
fi
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
 sha256sum "$here/probe.method.java" "$here"/captured-*.json "$scratch/testjava/E2ContextProbe.java"
 java -version
} > "$raw/$variant.environment.txt" 2>&1
set +e
unshare -Ur -m bash -euo pipefail -c '
 mount --make-rprivate /
 for entry in curricula app contracts scripts ai docs content; do mount --bind "$CUT_REPO/$entry" "$CUT_SCRATCH/$entry"; mount -o remount,ro,bind "$CUT_SCRATCH/$entry"; done
 if [ "$CUT_VARIANT" = predecessor ]; then
  for view in "$CUT_SCRATCH/baseviews/"*; do dest="$CUT_SCRATCH/curricula/DE/Gymnasium/composition-views/physik/${view##*/}"; mount --bind "$view" "$dest"; mount -o remount,ro,bind "$dest"; done
 fi
 cd "$CUT_SCRATCH/backend"
 checks=(--tests "*.E2ContextProbe.independentDatedOldPlanCaptureAndReplay")
 if [ "$CUT_VARIANT" = candidate ]; then checks+=(--tests "*.E2ContextProbe.independentStoredE2GoalReadAndAuthenticatedPass" --tests "*.ClaudeV1CompletionRouteIntegrationTest.goalInProgressSurvivesTheCutOfForces" --tests "*.ClaudeV1CompletionRouteIntegrationTest.planStoredForForcesBeforeTheCutKeepsTheGravitationGoals"); fi
 ./gradlew --offline --no-daemon --project-cache-dir "$CUT_SCRATCH/.gradle-local" -PbackendTestForks=1 --max-workers=2 --console=plain -I "$CUT_EVIDENCE/coach-init.gradle" test "${checks[@]}"
' > "$raw/$variant.log" 2>&1
ret=$?
set -e
for xml in "$scratch"/build/test-results/test/*.xml; do if [ -f "$xml" ]; then cp "$xml" "$raw/$variant-${xml##*/}"; fi; done
python3 - "$raw/$variant.exit.json" "$variant" "$ret" "$scratch" <<'PY'
import json,sys,datetime
from pathlib import Path
p,v,ret,scratch=sys.argv[1:]
Path(p).write_text(json.dumps({'variant':v,'exitCode':int(ret),'scratch':scratch,'endedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2)+'\n')
PY
exit "$ret"
