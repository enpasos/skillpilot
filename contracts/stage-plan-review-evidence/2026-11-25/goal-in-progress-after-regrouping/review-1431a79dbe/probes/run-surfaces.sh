#!/bin/bash
set -euo pipefail
# Call with the pinned checkout path and one of the two exact commit IDs.
checkout=$(realpath "$1")
commit=$(git -C "$checkout" rev-parse "$2^{commit}")
case "$commit" in
  1431a79dbea806dfed00a268b0b2bec4e58f7faa|53fd44c88b4da1380297112d3e2f67b1bab65980) ;;
  *) exit 2 ;;
esac
dir=$(cd "$(dirname "$0")" && pwd)
out="$dir/../raw/surfaces"
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
new=s[:s.rindex('}')].replace('class ClaudeV1CompletionRouteIntegrationTest','class FocusSurfacesProbe').replace('jdbc:h2:mem:completion-mcp;', 'jdbc:h2:mem:focus-surfaces;')
(work/'testjava/FocusSurfacesProbe.java').write_text(new+(panel/'surfaces.method.java').read_text()+'}\n')
PY
export checkout dir scratch
unshare -Ur -m bash -euo pipefail -c '
mount --make-rprivate /
for entry in app ai scripts curricula contracts docs content; do mount --bind "$checkout/$entry" "$scratch/$entry"; mount -o remount,ro,bind "$scratch/$entry"; done
cd "$scratch/backend"
./gradlew --offline --no-daemon --max-workers=2 --project-cache-dir "$scratch/.gradle-local" -I "$dir/surfaces.gradle" test --tests "*.FocusSurfacesProbe.navigationAndVisibleFocus" --console=plain
' > "$out/$commit.log" 2>&1
cp "$scratch/build/test-results/test/TEST-com.skillpilot.backend.connectors.claude.v1.mcp.FocusSurfacesProbe.xml" "$out/$commit.xml"
