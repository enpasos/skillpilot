#!/usr/bin/env bash
set -euo pipefail
variant=$1
revision=$2
repo=$(realpath "$3")
tools=$(realpath "$4")
evidence=$(cd "$(dirname "$0")" && pwd)
out="$evidence/../raw/reviewer-b"
mkdir -p "$out"
include_pattern=${5:-primary}
export B_PATTERN="$include_pattern"
scratch=$(mktemp -d "/tmp/task-e-b-${variant}-XXXXXX")
git -C "$repo" archive "$revision" backend .java-version | tar -x -C "$scratch"
git -C "$scratch" init -q
git -C "$repo" rev-parse --path-format=absolute --git-path objects > "$scratch/.git/objects/info/alternates"
git -C "$scratch" update-ref refs/heads/review "$(git -C "$repo" rev-parse "$revision")"
git -C "$scratch" symbolic-ref HEAD refs/heads/review
export B_REVIEW_SOURCES="$scratch/probe" B_EVIDENCE="$evidence" B_SCRATCH="$scratch" B_REPO="$repo" SKILLPILOT_BACKEND_BUILD_DIR="$scratch/build"
export JAVA_HOME="$tools/amazon-corretto-25.0.2.10.1" PATH="$tools/amazon-corretto-25.0.2.10.1/bin:$tools/node-v20.20.2-linux-x64/bin:$PATH"
export GRADLE_USER_HOME=/home/enpasos/.gradle
mkdir "$scratch"/{probe,curricula,app,contracts,scripts,ai,docs,content}
# Only the backend and top-level instructions differ in the requested pair. Shared assets match both blobs.
test -z "$(git -C "$repo" diff --name-only "$revision" HEAD -- curricula app contracts scripts ai docs content)"
python3 - <<'PY'
from pathlib import Path
import os
root=Path(os.environ['B_SCRATCH'])
text=next((root/'backend/src/test/java').rglob('ClaudeV1CompletionRouteIntegrationTest.java')).read_text().replace('class ClaudeV1CompletionRouteIntegrationTest','class ProgressReviewProbe').replace('jdbc:h2:mem:completion-mcp;', 'jdbc:h2:mem:progress-b;')
(root/'probe/ProgressReviewProbe.java').write_text(text[:text.rindex('}')]+(Path(os.environ['B_EVIDENCE'])/'probe.method.java').read_text()+'}\n')
PY
set +e
unshare -Ur -m bash -euo pipefail -c '
 mount --make-rprivate /
 for entry in curricula app contracts scripts ai docs content; do
    mount --bind "$B_REPO/$entry" "$B_SCRATCH/$entry"
    mount -o remount,ro,bind "$B_SCRATCH/$entry"
 done
 cd "$B_SCRATCH/backend"
 checks=(--tests "*.ProgressReviewProbe.$B_PATTERN")
 if [ "$B_PATTERN" = primary ]; then
   checks=(--tests "*.ProgressReviewProbe.reviewMoved" --tests "*.ProgressReviewProbe.reviewDirectAndBackup")
 fi
 ./gradlew --offline --no-daemon --project-cache-dir "$B_SCRATCH/cache" --max-workers=2 -PbackendTestForks=1 --console=plain -I "$B_EVIDENCE/probe.gradle" test "${checks[@]}"
' > "$out/$variant.log" 2>&1
ret=$?
set -e
for xml in "$scratch"/build/test-results/test/*.xml; do
    if [ -f "$xml" ]; then cp "$xml" "$out/$variant-${xml##*/}"; fi
done
exit "$ret"
