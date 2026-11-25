#!/bin/bash
set -euo pipefail
# Run the unchanged first-round native panels on the pinned confirmation commit.
checkout=$(realpath "$1")
commit=$(git -C "$checkout" rev-parse "$2^{commit}")
case "$commit" in
  fc7cab9ca11e795a982081af293eff3e357f5551) ;;
  *) exit 2 ;;
esac
dir=$(cd "$(dirname "$0")" && pwd)
out="$dir/../raw/functional"
test "$(git -C "$checkout" rev-parse HEAD)" = "$commit"
test -z "$(git -C "$checkout" status --porcelain --untracked-files=no)"
scratch=$(mktemp -d /tmp/e1-focus-surfaces.XXXXXX)
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
s=next((work/'backend/src/test/java').rglob('ClaudeV1CompletionRouteIntegrationTest.java')).read_text()
first=panel.parents[1]
for cls, database, probe in [('FocusSurfacesProbe','focus-surfaces',first/'probes/surfaces.method.java'),('ProgressReviewProbe','progress-b',first/'reviewer-b/probe.method.java')]:
    original_class=s[:s.rindex('}')].replace('class ClaudeV1CompletionRouteIntegrationTest','class '+cls).replace('jdbc:h2:mem:completion-mcp;', 'jdbc:h2:mem:'+database+';')
    (work/'testjava'/(cls+'.java')).write_text(original_class+probe.read_text()+'}\n')
PY
export checkout dir scratch
set +e
unshare -Ur -m bash -euo pipefail -c '
mount --make-rprivate /
for entry in app ai scripts curricula contracts docs content; do mount --bind "$checkout/$entry" "$scratch/$entry"; mount -o remount,ro,bind "$scratch/$entry"; done
cd "$scratch/backend"
./gradlew --offline --no-daemon --max-workers=2 --project-cache-dir "$scratch/.gradle-local" -PbackendTestForks=1 -I "$dir/functional.gradle" test --tests "*.FocusSurfacesProbe.navigationAndVisibleFocus" --tests "*.ProgressReviewProbe.reviewMoved" --tests "*.ProgressReviewProbe.reviewDirectAndBackup" --tests "*.ProgressReviewProbe.reviewGlobalAndOrdinaryBackup" --console=plain
' > "$out/$commit.log" 2>&1
ret=$?
set -e
for xml in "$scratch"/build/test-results/test/*.xml; do if [ -f "$xml" ]; then cp "$xml" "$out/"; fi; done
exit "$ret"
