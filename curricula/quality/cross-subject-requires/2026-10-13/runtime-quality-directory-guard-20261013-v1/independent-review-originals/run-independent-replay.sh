#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0
# Fresh reviewer-owned source, build and project-cache directories only.
set -euo pipefail
variant=${1:-candidate}
case "$variant" in candidate|original-control) ;; *) exit 2 ;; esac
repo_root=$(git rev-parse --show-toplevel)
review_dir=$(cd -- "$(dirname -- "$0")" && pwd)
export JAVA_HOME="$repo_root/tmp/ci-tools/amazon-corretto-25.0.2.10.1"
export PATH="$JAVA_HOME/bin:$repo_root/tmp/ci-tools/node-v20.20.2-linux-x64/bin:$PATH"
export QUALITY_GUARD_CANDIDATE_DIR="$review_dir"
export QUALITY_GUARD_TEST_VARIANT="$variant"
export SKILLPILOT_BACKEND_BUILD_DIR="$review_dir/build-$variant"
tests=(--tests com.skillpilot.backend.landscape.CurriculumDirectoryScanTest)
if [[ "$variant" == candidate ]]; then
    tests+=(--tests com.skillpilot.backend.landscape.PrunedFileTreeTest)
fi
"$repo_root/backend/gradlew" -p "$repo_root/backend" --no-daemon --console=plain --max-workers=2 \
    --project-cache-dir "$review_dir/gradle-project-cache-$variant" \
    -I "$review_dir/isolated.init.gradle" test "${tests[@]}"
