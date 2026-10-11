import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const out = join(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-fourteen-qualified-source-context-native-owner-followers-AUTHOR-INERT-v1');
const plan = JSON.parse(readFileSync(join(out, 'actual-current-qualified14-native-groups-and-C-source-context-plan.INERT.json'), 'utf8'));
const native = await import(pathToFileURL(join(root, 'app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href);
const checks: any[] = [];
for (const group of plan.groups) {
  const startedAtUtc = new Date().toISOString();
  const prepared = await native.prepareGoalDescriptionRolloutBatch(group.configPath);
  const checked = await native.validatePreparedGoalDescriptionRolloutBatch(group.configPath);
  checks.push({ groupNumber: group.groupNumber, configPath: group.configPath, goalIds: group.goalIds,
    startedAtUtc, finishedAtUtc: new Date().toISOString(),
    originalFunctions: ['prepareGoalDescriptionRolloutBatch', 'validatePreparedGoalDescriptionRolloutBatch'],
    nativePreparedAndChecked: true, baseBookDigest: checked.manifest.source.baseBookDigest,
    subsetModelDigest: prepared.model.digest, reviewInputFingerprint: checked.manifest.artifacts.reviewInputFingerprint,
    currentDenominator: checked.manifest.curriculumAtomicDenominatorAtPreparation,
    newDScience: 0, activeWrites: 0 });
  console.log(JSON.stringify({ group: group.groupNumber, nativePrepareCheck: 'PASS', goals: group.goalIds.length }));
}
writeFileSync(join(out, 'actual-current14-native-prepare-and-check-original-functions.AUTHOR-INERT.json'),
  JSON.stringify({ status: 'AUTHOR_INERT_NATIVE_CURRENT_INPUTS_ONLY', checks,
    groups: checks.length, selectedGoals: checks.reduce((n, check) => n + check.goalIds.length, 0),
    newDReviews: 0, activeWrites: 0 }, null, 2) + '\n', { flag: 'wx' });
