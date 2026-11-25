#!/bin/bash
set -euo pipefail
# Usage: run-coach.sh candidate|parent|recovery CLEAN_CANDIDATE_CHECKOUT TOOL_DIR
variant=$1
repo=$(realpath "$2")
toolchain=$(realpath "$3")
evidence=$(cd "$(dirname "$0")"; pwd)
scratch=$(mktemp -d "/tmp/e2-review-b-${variant}-XXXXXX")
mkdir -p "$scratch/testjava" "$scratch/baseviews" "$evidence/../raw/reviewer-b"
export CUT_PROBE_SOURCES="$scratch/testjava" SKILLPILOT_BACKEND_BUILD_DIR="$scratch/build"
export JAVA_HOME="$toolchain/amazon-corretto-25.0.2.10.1" PATH="$toolchain/amazon-corretto-25.0.2.10.1/bin:$toolchain/node-v20.20.2-linux-x64/bin:$PATH"
test "$(git -C "$repo" rev-parse HEAD)" = a88f17523bbafd63a5b3d98b48cc3c8e8b6ed24d
# Private backend only, native resources from Git, all other required inputs shared read-only.
git -C "$repo" archive HEAD backend .java-version | tar x -C "$scratch"
git -C "$scratch" init -q
git -C "$repo" rev-parse --git-common-dir | xargs -I% sh -c 'git -C "$1" rev-parse --path-format=absolute --git-path objects' sh "$repo" > "$scratch/.git/objects/info/alternates"
git -C "$scratch" update-ref refs/heads/review "$(git -C "$repo" rev-parse HEAD)"
git -C "$scratch" symbolic-ref HEAD refs/heads/review
for entry in curricula app contracts scripts ai docs content; do mkdir "$scratch/$entry"; done
if [ "$variant" = parent ]; then
  for view in $(git -C "$repo" diff --name-only 948f2a419d a88f17523b -- 'curricula/DE/Gymnasium/composition-views/physik/*'); do
    git -C "$repo" show "948f2a419d:$view" > "$scratch/baseviews/${view##*/}"
  done
fi
export CUT_EVIDENCE="$evidence" CUT_SCRATCH="$scratch" CUT_REPO="$repo" CUT_VARIANT="$variant"
python3 - <<'PY'
import os
from pathlib import Path
scratch=Path(os.environ["CUT_SCRATCH"]); evidence=Path(os.environ["CUT_EVIDENCE"])
s=next((scratch/"backend/src/test/java").rglob("ClaudeV1CompletionRouteIntegrationTest.java")).read_text()
s=s.replace("class ClaudeV1CompletionRouteIntegrationTest", "class E2ContextProbe").replace("jdbc:h2:mem:completion-mcp;", "jdbc:h2:mem:e2-review-b;")
(scratch/"testjava/E2ContextProbe.java").write_text(s[:s.rindex("}")] + (evidence/"coach-probe.method.java").read_text() + (evidence/"old-plan-probe.method.java").read_text() + (evidence/"recovery.method.java").read_text()+"}\n")
PY
unshare -Ur -m bash -euo pipefail -c '
 mount --make-rprivate /
 for entry in curricula app contracts scripts ai docs content; do
    mount --bind "$CUT_REPO/$entry" "$CUT_SCRATCH/$entry"
    mount -o remount,ro,bind "$CUT_SCRATCH/$entry"
 done
 if [ "$CUT_VARIANT" = parent ]; then
  for view in "$CUT_SCRATCH/baseviews/"*; do
    dest="$CUT_SCRATCH/curricula/DE/Gymnasium/composition-views/physik/${view##*/}"
    mount --bind "$view" "$dest"
    mount -o remount,ro,bind "$dest"
  done
 fi
 cd "$CUT_SCRATCH/backend"
 checks=(--tests "*.E2ContextProbe.readStoredFocusAcrossE2Cut" --tests "*.E2ContextProbe.nativeOldPlanAndScopeReconciliation")
 if [ "$CUT_VARIANT" = recovery ]; then checks=(--tests "*.E2ContextProbe.publishedChatRecovery"); fi
 if [ "$CUT_VARIANT" = candidate ]; then checks+=(--tests "*.ClaudeV1CompletionRouteIntegrationTest.planStoredForForcesBeforeTheCutKeepsTheGravitationGoals"); fi
 export GRADLE_USER_HOME=/home/enpasos/.gradle
 ./gradlew --offline --no-daemon --project-cache-dir "$CUT_SCRATCH/.gradle-local" --max-workers=2 --console=plain -I "$CUT_EVIDENCE/coach-init.gradle" test "${checks[@]}"
' > "$evidence/../raw/reviewer-b/coach-$variant.log" 2>&1 || { cp -t "$evidence/../raw/reviewer-b" "$scratch"/build/test-results/test/*.xml 2>/dev/null || true; exit 1; }
for xml in "$scratch"/build/test-results/test/*.xml; do cp "$xml" "$evidence/../raw/reviewer-b/$variant-${xml##*/}"; done
