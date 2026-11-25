#!/bin/bash
set -euo pipefail
d=/tmp/e1-regroup-r2-math
s=/tmp/e1-regroup-r2-runtime/snapshot
material=/home/enpasos/projects/skillpilot-e1-bilder
mount --make-rprivate /
for t in "$material" /home/enpasos/projects/skillpilot "$s"; do
 mount --bind "$t" "$t"; mount -o remount,bind,ro "$t"
done
mount -t overlay overlay -o "lowerdir=$s/backend,upperdir=$d/upper,workdir=$d/work,userxattr" "$s/backend"
for t in curricula app contracts scripts ai docs content; do
 mount --bind "$material/$t" "$s/$t"; mount -o remount,bind,ro "$s/$t"
done
export JAVA_HOME=/home/enpasos/projects/skillpilot/tmp/ci-tools/amazon-corretto-25.0.2.10.1
export PATH="$JAVA_HOME/bin:/home/enpasos/projects/skillpilot/tmp/ci-tools/node-v20.20.2-linux-x64/bin:$PATH"
export GRADLE_USER_HOME=/home/enpasos/.gradle
export SKILLPILOT_BACKEND_BUILD_DIR="$d/build"
export GIT_DISCOVERY_ACROSS_FILESYSTEM=1
cd "$s/backend"
test "$(git rev-parse HEAD)" = 4e085e990ba4a05053904ee5cb34f5dd82418358
./gradlew --offline --no-daemon --project-cache-dir "$d/cache" --max-workers=2 -PbackendTestForks=1 --console=plain -I "$d/init.gradle" test --tests '*.MathRegroupTest.math*'
