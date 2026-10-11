#!/usr/bin/env bash
# Run from the repository root. These checks use this inactive package only.
set -euo pipefail
TASK_PACKAGE="curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-v7-D2-P2-native31-integration-preparation-20261011-v1"
app/node_modules/.bin/tsx app/scripts/materializeGoalDescriptionRolloutBatch.ts check --config "${TASK_PACKAGE}/configs/native-D14.batch.config.json"
app/node_modules/.bin/tsx app/scripts/materializeGoalDescriptionRolloutBatch.ts summarize --config "${TASK_PACKAGE}/configs/native-D14.batch.config.json"
app/node_modules/.bin/tsx app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts --config "${TASK_PACKAGE}/configs/native-D14.batch.config.json" --authoring "${TASK_PACKAGE}/native-D14/synthesis-authoring.json"
app/node_modules/.bin/tsx app/scripts/materializeGoalDescriptionRolloutResolutions.ts --config "${TASK_PACKAGE}/configs/native-D14.batch.config.json" --synthesis-manifest "${TASK_PACKAGE}/native-D14/synthesis-decisions.json"
app/node_modules/.bin/tsx app/scripts/materializeGoalDescriptionRolloutBatch.ts finalize --config "${TASK_PACKAGE}/configs/native-D14.batch.config.json"
app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --config="${TASK_PACKAGE}/configs/P2-d2cc.inactive.config.json" --mode=check
app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --config="${TASK_PACKAGE}/configs/P2-ebaa.inactive.config.json" --mode=check
app/node_modules/.bin/tsx app/scripts/semanticAtomicityReview.ts --config="${TASK_PACKAGE}/configs/six-A.inactive.config.json" --mode=check
app/node_modules/.bin/tsx "${TASK_PACKAGE}/scripts/check-current31-and-owner-chains.ts"
# Future final native31 supplemental invocation, after root normal integration/render checks:
# python3 "${TASK_PACKAGE}/scripts/check-final-native31.py" --model <final-source382-model.json> --html <final-whole-book.html> --pdf <final-whole-book.pdf> --pdf-manifest <final-whole-book.pdf.render-manifest.json> --output <new-regular-binding.json>
# Root's later normal integration gates (not run by this preparation):
# npm --prefix app run check:goal-visualization-assets
# npm --prefix app run check:goal-visualization-qa
# python3 scripts/validate_schemas.py
# npm --prefix app run quality:deep-understanding-rollout:check
