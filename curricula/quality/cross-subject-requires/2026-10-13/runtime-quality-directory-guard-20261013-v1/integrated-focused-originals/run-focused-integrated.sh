#!/usr/bin/env bash
# Apache-2.0. Corretto25 active-code checks; all generated outputs remain in this TMP directory.
set -euo pipefail
repo_root=$(git rev-parse --show-toplevel)
integrated_dir="$repo_root/tmp/cross-subject-requires/runtime-quality-directory-guard-integrated-20261013-v1"
export JAVA_HOME="$repo_root/tmp/ci-tools/amazon-corretto-25.0.2.10.1"
export PATH="$JAVA_HOME/bin:$repo_root/tmp/ci-tools/node-v20.20.2-linux-x64/bin:$PATH"
export QUALITY_GUARD_INTEGRATED_DIR="$integrated_dir"
export SKILLPILOT_BACKEND_BUILD_DIR="$integrated_dir/build"
"$repo_root/backend/gradlew" -p "$repo_root/backend" --no-daemon --console=plain --max-workers=2 \
    --project-cache-dir "$integrated_dir/gradle-project-cache" \
    -I "$integrated_dir/focused-integrated.init.gradle" test \
    --tests com.skillpilot.backend.landscape.CurriculumDirectoryScanTest \
    --tests com.skillpilot.backend.landscape.PrunedFileTreeTest \
    --tests com.skillpilot.backend.landscape.LandscapeServiceTest \
    --tests com.skillpilot.backend.openai.de.OpenAiDeEmbeddedServerBuildTest
