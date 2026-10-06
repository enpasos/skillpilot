// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { collectCompositionProjectionRoleGoalIds, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring';
import { goalMatchesFilter } from '../../../../../../../app/src/utils/goalFilters';

const dossier = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-current-layer-a-inventory-projections-v2';
const label = process.argv[2];
if (!label || !/^[a-z0-9-]+$/.test(label)) throw new Error('An explicit safe output label is required');
const testPath = 'backend/src/test/java/com/skillpilot/backend/controller/LearnerControllerIntegrationTest.java';
const testText = readFileSync(testPath, 'utf8');
const fingerprint = (path: string) => ({ path, sha256: createHash('sha256').update(readFileSync(path)).digest('hex') });
const inputs: any[] = [fingerprint(testPath), fingerprint('app/src/utils/authoring/compositionViewAuthoring.ts'), fingerprint('app/src/utils/goalFilters.ts')];
const previous = JSON.parse(readFileSync('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-current-layer-a-inventory-projections-v1/projection-targets.native.actual.json', 'utf8'));
const rows: any[] = [];
const canonicalScopes: any[] = [];
const subjects = [['Biologie', 'BIOLOGIE', 'biologie/de-de-gym-seki-biology.view.json'], ['Chemie', 'CHEMIE', 'chemie/de-de-gym-seki-chemistry.view.json']];
for (const [subject, name, viewTail] of subjects) {
  const canonPath = `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${name}.de.json`;
  const viewPath = `curricula/DE/Gymnasium/composition-views/${viewTail}`;
  inputs.push(fingerprint(canonPath), fingerprint(viewPath));
  const raw = JSON.parse(readFileSync(canonPath, 'utf8'));
  const view = normalizeCompositionView(JSON.parse(readFileSync(viewPath, 'utf8')));
  const byId = new Map<string, any>(raw.goals.map((goal: any) => [goal.id, goal]));
  const { targetGoalIds, prerequisiteOnlyGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId);
  canonicalScopes.push({ subject, landscapeId: raw.landscapeId, wholeGoalRecords: raw.goals.length, targetRoleCount: targetGoalIds.size, prerequisiteOnlyRoleCount: prerequisiteOnlyGoalIds.size });
  const expectedRows = [...testText.matchAll(new RegExp(`\\{ "${subject}", CANONICAL_[A-Z]+_ID, "(DE-[A-Z]+)", "(\\d+)", "(\\d+)" \\}`, 'g'))];
  for (const row of expectedRows) {
    for (const duration of ['G8', 'G9']) {
      const currentTargetIds = [...targetGoalIds].filter((id) => {
        const goal = byId.get(id);
        if (!goal) throw new Error(`Missing projected goal ${id}`);
        const type = goal.type || ((goal.contains?.length ?? 0) > 0 ? 'cluster' : 'atomic');
        return type !== 'cluster' && goalMatchesFilter(goal, row[1]) && goalMatchesFilter(goal, duration) && goalMatchesFilter(goal, 'GK');
      }).sort();
      const prior = previous.rows.find((item: any) => item.subject === subject && item.jurisdiction === row[1] && item.durationModel === duration);
      if (!prior) throw new Error(`Missing previous measured scope ${subject}/${row[1]}/${duration}`);
      const javaExpected = Number(duration === 'G8' ? row[2] : row[3]);
      rows.push({ subject, landscapeId: raw.landscapeId, jurisdiction: row[1], durationModel: duration, courseProfile: 'GK', stage: 'SekI', javaExpected, nativeCurrentTargetAtomicTotal: currentTargetIds.length, differenceFromCurrentJavaExpected: currentTargetIds.length - javaExpected, previousMeasuredTargetAtomicTotal: prior.nativeCurrentTargetAtomicTotal, currentTargetIds, addedTargetGoalIds: currentTargetIds.filter((id) => !prior.currentTargetIds.includes(id)), removedTargetGoalIds: prior.currentTargetIds.filter((id: string) => !currentTargetIds.includes(id)), prerequisiteOnlyCount: prerequisiteOnlyGoalIds.size });
    }
  }
}
if (rows.length !== previous.rows.length || rows.length !== 46) throw new Error('The existing reviewed Chemistry/Biology contract must expose exactly 46 cases');
const result = { status: 'Actual native app pure-data projection measurement; no backend API or Java execution', atUTC: new Date().toISOString(), head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), inputs, canonicalScopes, measurementUses: 'Unmodified composition projection-role collector and goal filters over actual current data; all learner-facing target atomic goals, including orientation and local assessment goals; not the curricularAtomic M7 denominator', backendTestsRun: false, runtimeCodeChanged: false, allExpectedMatch: rows.every((row) => row.differenceFromCurrentJavaExpected === 0), rows };
writeFileSync(`${dossier}/${label}.actual.json`, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ status: result.status, canonicalScopes, allExpectedMatch: result.allExpectedMatch, rows: rows.map(({ currentTargetIds, ...row }) => row) }, null, 2));
