#!/usr/bin/env bash
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
original=$(cd "$here/../../../reviewer-a" && pwd)
raw=$(cd "$here/../../raw/native-a" && pwd)
repo=${CANDIDATE_REPO:-/home/enpasos/projects/skillpilot-e1-direkteinstieg}
expected=fc7cab9ca11e795a982081af293eff3e357f5551
test "$(git -C "$repo" rev-parse HEAD)" = "$expected"
test -z "$(git -C "$repo" status --short --untracked-files=no)"
test "$(sha256sum "$original/bench.method.java" | cut -d' ' -f1)" = d0396c59dedcda7fce5e15e85c41b3fa15002859a388c2c244b5f40881a55f26
test "$(sha256sum "$original/bench-init.gradle" | cut -d' ' -f1)" = f39116e9a6d7a91214b8ee150c78847e25948273aa4d1e92de6009e862a8ffbb
work=$(mktemp -d "/tmp/task-e-a-round2-XXXXXX")
mkdir -p "$work/repo" "$work/testjava"
export PROBE_SOURCES=$work/testjava SKILLPILOT_BACKEND_BUILD_DIR=$work/build
export RUN_VARIANT=candidate RUN_REPEAT=${1:-fresh48} REVIEW_A_SAMPLES=${2:-48}
test ! -e "$raw/$RUN_REPEAT.log"
export JAVA_HOME=/home/enpasos/projects/skillpilot/tmp/ci-tools/amazon-corretto-25.0.2.10.1
export PATH="$JAVA_HOME/bin:/home/enpasos/projects/skillpilot/tmp/ci-tools/node-v20.20.2-linux-x64/bin:$PATH"
export GRADLE_USER_HOME=/home/enpasos/.gradle
export REVIEW_A_WORK=$work REVIEW_A_REPO=$repo REVIEW_A_EVIDENCE=$original
python3 - "$repo" "$work" "$original" <<'PY'
import sys
from pathlib import Path
repo,work,evidence=map(Path,sys.argv[1:])
s=(repo/'backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java').read_text()
assert s.count('"skillpilot.completion.unit-assessment-pilot-enabled=true",') == 1
s=s.replace('"skillpilot.completion.unit-assessment-pilot-enabled=true",','"skillpilot.completion.unit-assessment-pilot-enabled=true", "skillpilot.claude.connector.v1.max-tool-calls-per-connection-per-minute=600",')
s=s.replace('class ClaudeV1CompletionRouteIntegrationTest','class GoalInProgressProbe').replace('jdbc:h2:mem:completion-mcp;','jdbc:h2:mem:goal-progress-a;')
(work/'testjava/GoalInProgressProbe.java').write_text(s[:s.rindex('}')]+(evidence/'bench.method.java').read_text()+'}'+chr(10))
PY
git -C "$repo" archive HEAD backend .java-version | tar x -C "$work/repo"
for entry in curricula app contracts scripts ai docs content; do mkdir -p "$work/repo/$entry"; done
ln -sfn "$repo/.git" "$work/repo/.git"
{
 date --iso-8601=seconds
 git -C "$repo" rev-parse HEAD 'HEAD^{tree}'
 sha256sum "$original/bench.method.java" "$original/bench-init.gradle" "$work/testjava/GoalInProgressProbe.java"
 uname -a
 lscpu | rg '^CPU\(s\):|^Model name'
 uptime
 free -h
 java -version
} > "$raw/$RUN_REPEAT-environment.txt" 2>&1
unshare -Ur -m bash -euo pipefail -c '
 mount --make-rprivate /
 for entry in curricula app contracts scripts ai docs content; do
  mount --bind "$REVIEW_A_REPO/$entry" "$REVIEW_A_WORK/repo/$entry"
  mount -o remount,ro,bind "$REVIEW_A_WORK/repo/$entry"
 done
 cd "$REVIEW_A_WORK/repo/backend"
 ./gradlew --offline --no-daemon --project-cache-dir "$REVIEW_A_WORK/gradle-local" --max-workers=2 --console=plain -I "$REVIEW_A_EVIDENCE/bench-init.gradle" test --tests "*.GoalInProgressProbe.independentReadCost" --tests "*.GoalInProgressProbe.expiredDirectAssessmentOrigin" --tests "*.GoalInProgressProbe.goalInProgressSurvivesARegroupingOutOfTheFocusedSection"
' > "$raw/$RUN_REPEAT.log" 2>&1 || { cp "$work"/build/test-results/test/*.xml "$raw/" 2>/dev/null || true; tail -60 "$raw/$RUN_REPEAT.log"; exit 1; }
for xml in "$work"/build/test-results/test/*.xml; do cp "$xml" "$raw/$RUN_REPEAT-${xml##*/}"; done
