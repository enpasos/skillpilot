#!/bin/bash
set -euo pipefail
# Compare the two persisted state values on the pinned successor of PR 199.
checkout=$(realpath "$1")
commit=$(git -C "$checkout" rev-parse "$2^{commit}")
case "$commit" in
  4f963b4b78922d11fea4029e15fa8183e572dd35) ;;
  *) exit 2 ;;
esac
dir=$(cd "$(dirname "$0")" && pwd)
out="$dir/../raw/projection"
test "$(git -C "$checkout" rev-parse HEAD)" = "$commit"
test -z "$(git -C "$checkout" status --porcelain --untracked-files=no)"
scratch=$(mktemp -d /tmp/e2-projection.XXXXXX)
export GRADLE_USER_HOME=/home/enpasos/.gradle
export CUT_PROBE_SOURCES="$scratch/testjava" SKILLPILOT_BACKEND_BUILD_DIR="$scratch/build"
export JAVA_HOME=/home/enpasos/projects/skillpilot/tmp/ci-tools/amazon-corretto-25.0.2.10.1
export PATH="$JAVA_HOME/bin:/home/enpasos/projects/skillpilot/tmp/ci-tools/node-v20.20.2-linux-x64/bin:$PATH"
mkdir -p "$CUT_PROBE_SOURCES" "$out"
git -C "$checkout" archive "$commit" backend .java-version | tar x -C "$scratch"
git -C "$scratch" init -q
git -C "$checkout" rev-parse --path-format=absolute --git-path objects > "$scratch/.git/objects/info/alternates"
git -C "$scratch" update-ref refs/heads/review "$commit"
git -C "$scratch" symbolic-ref HEAD refs/heads/review
for entry in app ai scripts curricula contracts docs content; do mkdir -p "$scratch/$entry"; done
python3 - "$scratch" "$dir" <<'PY'
import pathlib, sys
work,panel=map(pathlib.Path,sys.argv[1:])
s=next((work/'backend/src/test/java').rglob('LearnerServiceCanonicalProjectionTest.java')).read_text()
s=s.replace('class LearnerServiceCanonicalProjectionTest','class ProjectionStateProbe')
(work/'testjava/ProjectionStateProbe.java').write_text(s[:s.rindex('}')]+(panel/'projection.method.java').read_text()+'}\n')
PY
export checkout dir scratch
set +e
unshare -Ur -m bash -euo pipefail -c '
mount --make-rprivate /
for entry in app ai scripts curricula contracts docs content; do mount --bind "$checkout/$entry" "$scratch/$entry"; mount -o remount,ro,bind "$scratch/$entry"; done
cd "$scratch/backend"
./gradlew --offline --no-daemon --max-workers=2 --project-cache-dir "$scratch/.gradle-local" -PbackendTestForks=1 -I "$dir/projection.gradle" test --tests "*.ProjectionStateProbe.readWithStoredCursor" --tests "*.ProjectionStateProbe.getLearnerStateKeepsAnOrdinaryGoalInProgressOutsideTheChosenFocus" --console=plain
' > "$out/$commit.log" 2>&1
ret=$?
set -e
for xml in "$scratch"/build/test-results/test/*.xml; do if [ -f "$xml" ]; then cp "$xml" "$out/"; fi; done
exit "$ret"
