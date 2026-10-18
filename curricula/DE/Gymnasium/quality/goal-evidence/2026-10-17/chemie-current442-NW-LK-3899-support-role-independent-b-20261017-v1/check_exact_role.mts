import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname, resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeCanonicalLandscape} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts';
import {normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts';
const root = '/home/enpasos/projects/skillpilot';
const out = dirname(fileURLToPath(import.meta.url));
const ap = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-NW-LK-3899-support-role-author-20261017-v1/AUTHOR.one-explicit-NW-LK-support-role.pending.json');
const a = JSON.parse(readFileSync(ap, 'utf8'));
const cp = resolve(root, a.wholeCurrentGoalsAndProfiles[0].wholeGoal.path);
const canonical = normalizeCanonicalLandscape(JSON.parse(readFileSync(cp, 'utf8')));
const goalMap = new Map(canonical.goals.map(g => [g.id, g]));
const before = JSON.parse(readFileSync(resolve(root, a.wholeCurrentView.path), 'utf8'));
const afterPath = resolve(root, a.proposal.candidateWholeView);
const after = JSON.parse(readFileSync(afterPath, 'utf8'));
const supportId = a.proposal.operation.value.goalId;
const consumerId = a.alreadyPairedCanonicalEdge.consumerGoalId;
const restored = structuredClone(after);
const appended = restored.rootNodes.pop();
if (JSON.stringify(restored) !== JSON.stringify(before) || JSON.stringify(appended) !== JSON.stringify(a.proposal.operation.value)) throw new Error('Unexpected whole-view delta');
const results: any[] = [];
for (const [label, raw] of [['before', before], ['after', after]] as const) {
  const v = normalizeCompositionView(raw);
  const compiled = compileCompositionView(v, canonical);
  const roles = collectCompositionProjectionRoleGoalIds(v.rootNodes, goalMap);
  const visible = new Set<string>();
  const walk = (nodes: any[]) => {for (const n of nodes) {if (n.sourceGoalId) visible.add(n.sourceGoalId); walk(n.children ?? []);}};
  walk(compiled.compiledRootNodes);
  const allRoles = new Set([...roles.targetGoalIds, ...roles.prerequisiteOnlyGoalIds]);
  const missing = [...roles.targetGoalIds].flatMap(id => (goalMap.get(id)?.requires ?? []).filter(p => !allRoles.has(p)).map(p => ({consumerGoalId: id, priorGoalId: p})));
  results.push({label, compileErrors: compiled.findings.filter(f => f.severity === 'error'), compileWarnings: compiled.findings.filter(f => f.severity === 'warning'), targetGoalIds: [...roles.targetGoalIds].sort(), prerequisiteOnlyGoalIds: [...roles.prerequisiteOnlyGoalIds].sort(), targetCount: roles.targetGoalIds.size, supportCount: roles.prerequisiteOnlyGoalIds.size, support3899IsTarget: roles.targetGoalIds.has(supportId), support3899IsPrerequisiteOnly: roles.prerequisiteOnlyGoalIds.has(supportId), support3899VisibleInCompiledTree: visible.has(supportId), consumerA4IsTarget: roles.targetGoalIds.has(consumerId), missingDirectPriorRows: missing});
}
const [b, c] = results;
const checks = {
  exactSingleRootAppend: true,
  targetSetAndProgressScopeUnchanged: JSON.stringify(b.targetGoalIds) === JSON.stringify(c.targetGoalIds),
  supportSetGrowsExactlyBy3899: JSON.stringify([...b.prerequisiteOnlyGoalIds, supportId].sort()) === JSON.stringify(c.prerequisiteOnlyGoalIds),
  supportNeverTarget: !c.support3899IsTarget,
  supportNotVisibleInCompiledTree: !c.support3899VisibleInCompiledTree,
  sameA4TargetRetained: b.consumerA4IsTarget && c.consumerA4IsTarget,
  missing3899PrerequisiteResolved: !c.missingDirectPriorRows.some((r: any) => r.consumerGoalId === consumerId && r.priorGoalId === supportId),
  noStockCompileErrors: results.every(r => r.compileErrors.length === 0),
};
const hash = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');
const report = {artifactType: 'actual bounded stock NW-LK support-role check, not science from hashes', author: {path: relative(root, ap), sha256: hash(ap)}, canonical: {path: relative(root, cp), sha256: hash(cp)}, candidate: {path: relative(root, afterPath), sha256: hash(afterPath)}, checks, results, actualMasteryWritten: false, normalFilesChanged: false, nativeRebindPerformed: false, M7Claim: false, HumanApproval: false, HumanTrial: false};
writeFileSync(resolve(out, 'CHECK.actual-single-role-stock-compilation.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({checks, beforeTargets: b.targetCount, afterTargets: c.targetCount, beforeSupports: b.supportCount, afterSupports: c.supportCount, beforeMissing: b.missingDirectPriorRows.length, afterMissing: c.missingDirectPriorRows.length}, null, 2));
if (!Object.values(checks).every(Boolean)) process.exitCode = 1;
