#!/usr/bin/env bash
set -euo pipefail
p=/tmp/e1-regroup-r2-runtime
material=/home/enpasos/projects/skillpilot-e1-bilder
test "$(id -u)" = 0
mount --make-rprivate /
mount --bind "$material" "$material"
mount -o remount,bind,ro "$material"
mount --bind /home/enpasos/projects/skillpilot /home/enpasos/projects/skillpilot
mount -o remount,bind,ro /home/enpasos/projects/skillpilot
for directory in curricula app contracts scripts ai docs content; do
  mount --bind "$material/$directory" "$p/snapshot/$directory"
  mount -o remount,bind,ro "$p/snapshot/$directory"
done
export GRADLE_USER_HOME=/home/enpasos/.gradle
export HOME=/home/enpasos
test "$(findmnt -T "$material/backend/src/main/resources/static" -no OPTIONS | cut -d, -f1)" = ro
test "$(findmnt -T /home/enpasos/projects/skillpilot/backend/src/main -no OPTIONS | cut -d, -f1)" = ro
test "$(realpath "$p/snapshot/backend/src/main/resources/static")" = "$p/snapshot/backend/src/main/resources/static"
test "$(realpath "$p/build/resources/main/static")" = "$p/build/resources/main/static"
exec bash "$1"
