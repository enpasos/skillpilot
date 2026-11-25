#!/bin/bash
set -euo pipefail
variant=$1
repeat=${2:-1}
case "$variant" in baseline|candidate) ;; *) exit 2 ;; esac
repo=/home/enpasos/projects/skillpilot-e1-direkteinstieg
evidence=/home/enpasos/projects/skillpilot/tmp/e1-handover/reviews/goal-in-progress/reviewer-a
raw=$evidence/../raw/reviewer-a
test "$(git -C "$repo" rev-parse HEAD)" = 1431a79dbea806dfed00a268b0b2bec4e58f7faa
work=$(mktemp -d "/tmp/task-e-a-$variant-$repeat-XXXXXX")
mkdir -p "$work/repo" "$work/testjava" "$raw"
export PROBE_SOURCES=$work/testjava SKILLPILOT_BACKEND_BUILD_DIR=$work/build
export RUN_VARIANT=$variant RUN_REPEAT=$repeat
export JAVA_HOME=/home/enpasos/projects/skillpilot/tmp/ci-tools/amazon-corretto-25.0.2.10.1
export PATH="$JAVA_HOME/bin:/home/enpasos/projects/skillpilot/tmp/ci-tools/node-v20.20.2-linux-x64/bin:$PATH"
export GRADLE_USER_HOME=/home/enpasos/.gradle
export REVIEW_A_WORK=$work REVIEW_A_REPO=$repo REVIEW_A_EVIDENCE=$evidence
python3 - "$repo" "$work" "$evidence" <<'PYCODE'
import sys,subprocess
from pathlib import Path
repo,work,evidence=map(Path,sys.argv[1:])
s=(repo/'backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java').read_text()
s=s.replace('\"skillpilot.completion.unit-assessment-pilot-enabled=true\",', '\"skillpilot.completion.unit-assessment-pilot-enabled=true\", \"skillpilot.claude.connector.v1.max-tool-calls-per-connection-per-minute=600\",')
s=s.replace('class ClaudeV1CompletionRouteIntegrationTest','class GoalInProgressProbe').replace('jdbc:h2:mem:completion-mcp;','jdbc:h2:mem:goal-progress-a;')
(work/'testjava/GoalInProgressProbe.java').write_text(s[:s.rindex('}')]+(evidence/'bench.method.java').read_text()+'}'+chr(10))
base=subprocess.check_output(['git','-C',str(repo),'show','53fd44c88b:backend/src/main/java/com/skillpilot/backend/service/LearnerService.java'])
(work/'LearnerService.java').write_bytes(base)
PYCODE
git -C "$repo" archive HEAD backend .java-version | tar x -C "$work/repo"
for entry in curricula app contracts scripts ai docs content; do if [ -L "$work/repo/$entry" ]; then rm "$work/repo/$entry"; fi; mkdir -p "$work/repo/$entry"; done
ln -sfn "$repo/.git" "$work/repo/.git"
unshare -Ur -m bash -euo pipefail -c '
 mount --make-rprivate /
 for entry in curricula app contracts scripts ai docs content; do
  mount --bind "$REVIEW_A_REPO/$entry" "$REVIEW_A_WORK/repo/$entry"
  mount -o remount,ro,bind "$REVIEW_A_WORK/repo/$entry"
 done
 if [ "$RUN_VARIANT" = baseline ]; then
  mount --bind "$REVIEW_A_WORK/LearnerService.java" "$REVIEW_A_WORK/repo/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java"
  mount -o remount,ro,bind "$REVIEW_A_WORK/repo/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java"
 fi
 cd "$REVIEW_A_WORK/repo/backend"
 ./gradlew --offline --no-daemon --project-cache-dir "$REVIEW_A_WORK/gradle-local" --max-workers=2 --console=plain -I "$REVIEW_A_EVIDENCE/bench-init.gradle" test --tests "*.GoalInProgressProbe.${REVIEW_A_TEST:-independentReadCost}"
' > "$raw/bench-$variant-$repeat.log" 2>&1 || { cp "$work"/build/test-results/test/*.xml "$raw/" 2>/dev/null || true; tail -60 "$raw/bench-$variant-$repeat.log"; exit 1; }
for xml in "$work"/build/test-results/test/*.xml; do cp "$xml" "$raw/$variant-$repeat-${xml##*/}"; done
