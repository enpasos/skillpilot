#!/bin/bash
set -euo pipefail
checkout=$(realpath "$1")
commit=fc7cab9ca11e795a982081af293eff3e357f5551
dir=$(cd "$(dirname "$0")" && pwd)
out="$dir/../../raw/explicit-write"
test "$(git -C "$checkout" rev-parse HEAD)" = "$commit"
test -z "$(git -C "$checkout" status --porcelain --untracked-files=no)"
scratch=$(mktemp -d /tmp/e1-explicit-focus-write.XXXXXX)
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
s=s[:s.rindex('}')].replace('class ClaudeV1CompletionRouteIntegrationTest','class ExplicitFocusWriteProbe').replace('jdbc:h2:mem:completion-mcp;', 'jdbc:h2:mem:explicit-focus-write;')
(work/'testjava'/'ExplicitFocusWriteProbe.java').write_text(s+(panel/'probe.method.java').read_text()+'}\n')
PY
{
    date --iso-8601=seconds
    printf 'commit=%s\ncheckout=%s\nscratch=%s\n' "$commit" "$checkout" "$scratch"
    "$JAVA_HOME/bin/java" -version
} > "$out/environment.txt" 2>&1
export checkout dir scratch
set +e
unshare -Ur -m bash -euo pipefail -c '
mount --make-rprivate /
for entry in app ai scripts curricula contracts docs content; do mount --bind "$checkout/$entry" "$scratch/$entry"; mount -o remount,ro,bind "$scratch/$entry"; done
cd "$scratch/backend"
./gradlew --offline --no-daemon --max-workers=2 --project-cache-dir "$scratch/.gradle-local" -PbackendTestForks=1 -I "$dir/probe.gradle" test --tests "*.ExplicitFocusWriteProbe.identicalExplicitFocusWriteEndsMovedOrdinaryGoal" --console=plain
' > "$out/$commit.log" 2>&1
ret=$?
set -e
printf '%s\n' "$ret" > "$out/exit-code.txt"
for xml in "$scratch"/build/test-results/test/*.xml; do if [ -f "$xml" ]; then cp "$xml" "$out/"; fi; done
test "$(git -C "$checkout" rev-parse HEAD)" = "$commit"
test -z "$(git -C "$checkout" status --porcelain --untracked-files=no)"
exit "$ret"
