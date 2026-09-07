import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-040-gravitation-and-cosmology-20-v1/';
const paths = { landscape: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json', kinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json', plan: base + 'layer-a-split-authoring-plan.blind-b.json', native: 'app/scripts/generateCurriculumQualityStatus.ts' };
const bytes = Object.fromEntries(Object.entries(paths).map(([key, path]) => [key, readFileSync(path, 'utf8')]));
const landscape = JSON.parse(bytes.landscape), kinds = JSON.parse(bytes.kinds), plan = JSON.parse(bytes.plan);
const sha = value => 'sha256:' + createHash('sha256').update(value).digest('hex');
const unique = (rows, key, id) => { const found = rows.filter(row => row[key] === id); assert.equal(found.length, 1); return found[0]; };
const sourceFunctions = ['isAtomicGoal', 'parseReference', 'buildParentByChild', 'buildDirectRequiresEdges', 'buildAtomicDirectRequiresEdges', 'buildEffectiveRequiresEdges', 'createPathChecker'];
const exactNativeSnippets = sourceFunctions.map(name => { const start = bytes.native.indexOf('function ' + name + '('); assert.ok(start >= 0); const end = bytes.native.indexOf('\n}\n', start); assert.ok(end > start); return { name, source: bytes.native.slice(start, end + 3), firstLine: bytes.native.slice(0, start).split('\n').length }; });
const ts = createRequire(resolve('app/package.json'))('typescript');
const nativeCode = ts.transpileModule(exactNativeSnippets.map(entry => entry.source).join('\n'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
const native = vm.runInNewContext(nativeCode + '\n({buildAtomicDirectRequiresEdges,buildEffectiveRequiresEdges,createPathChecker})');
const terminalConstant = bytes.native.match(/const CANONICAL_GYM_PHYSICS_SEK2_PRACTICE_CLUSTER_IDS = (\[[\s\S]*?\n\])/);
assert.ok(terminalConstant);
const clusterIds = vm.runInNewContext(terminalConstant[1]);
const targets = ['335a75b0-f691-5867-8ce3-3c971d541b9f', '4a58df57-f791-502f-8b8d-9ba155e46035'];
const proposedCoverage = {
  [targets[0]]: ['af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93', '497f1311-17d6-56ff-afb1-422a738e5c16', '37013646-f13a-5faf-954c-940f2fd7502f'],
  [targets[1]]: ['1b060e79-dc2d-5e4e-abb5-42eca39f9cc7', 'c52d55c3-b687-586c-b0f9-8ffcd1069424', 'db0394ca-297c-5892-b414-525ec186f928'],
};
const split = structuredClone(landscape);
for (const child of plan.newGoals) { assert.ok(!split.goals.some(g => g.id === child.id)); split.goals.push(structuredClone(child)); }
for (const update of plan.clusterUpdates) { const goal = unique(split.goals, 'id', update.goalId); for (const [key, value] of Object.entries(update.before)) assert.deepEqual(goal[key], value); Object.assign(goal, structuredClone(update.after)); }
for (const update of plan.edgeUpdates) { const goal = unique(split.goals, 'id', update.goalId); assert.deepEqual(goal.requires, update.before); goal.requires = [...update.after]; }
const proposed = structuredClone(split);
for (const id of targets) { const goal = unique(proposed.goals, 'id', id); goal.requires = [...proposedCoverage[id]]; goal.examData.coveredGoalIds = [...proposedCoverage[id]]; }
const kindMap = new Map(kinds.decisions.map(k => [k.goalId, k.semanticKind]));
const futureKindMap = new Map(kindMap);
for (const child of plan.newGoals) futureKindMap.set(child.id, 'curricularAtomic');
for (const update of plan.clusterUpdates) futureKindMap.set(update.goalId, 'curricularArea');
const terminalIds = (scopeLandscape, q4Only = false) => [...new Set(clusterIds.filter(id => !q4Only || id === '85bbad98-2f48-5d64-85c4-ab6cf67f24c2').flatMap(id => unique(scopeLandscape.goals, 'id', id).contains).filter(id => !(unique(scopeLandscape.goals, 'id', id).contains?.length)))];
const compute = graph => {
  const direct = native.createPathChecker(native.buildAtomicDirectRequiresEdges(graph));
  const effective = native.createPathChecker(native.buildEffectiveRequiresEdges(graph));
  return { direct, effective, terminals: terminalIds(graph), q4Terminals: terminalIds(graph, true) };
};
const states = { baseline: compute(landscape), splitOnly: compute(split), proposed: compute(proposed) };
const describe = (goal, routes) => ({
  directSek2TerminalIds: routes.terminals.filter(id => routes.direct(id, goal.id)),
  effectiveSek2TerminalIds: routes.terminals.filter(id => routes.effective(id, goal.id)),
  directQ4TerminalIds: routes.q4Terminals.filter(id => routes.direct(id, goal.id)),
  effectiveQ4TerminalIds: routes.q4Terminals.filter(id => routes.effective(id, goal.id)),
  hasDirectMotivationPath: routes.direct(goal.id, '5c44b9ba-9b05-4774-95d5-073230d3fc4f'),
  hasEffectiveMotivationPath: routes.effective(goal.id, '5c44b9ba-9b05-4774-95d5-073230d3fc4f'),
});
const oldGoals = targets.map(id => unique(landscape.goals, 'id', id));
assert.deepEqual(oldGoals.map(g => g.examData.coveredGoalIds.length), [14, 65]);
for (const goal of oldGoals) assert.deepEqual(goal.requires, goal.examData.coveredGoalIds);
const oldDirectIds = [...new Set(oldGoals.flatMap(goal => [...goal.requires, ...goal.examData.coveredGoalIds]))];
const remainingTerminals = states.proposed.terminals.filter(id => !targets.includes(id));
const matrix = proposed.goals.filter(goal => futureKindMap.get(goal.id) === 'curricularAtomic').map(goal => ({
  goalId: goal.id, title: goal.title, phase: goal.dimensionTags?.phase ?? goal.phase ?? null,
  inNativeSek2GoalSelector: ['E', 'Q1', 'Q2', 'Q3', 'Q4'].includes(goal.dimensionTags?.phase ?? goal.phase ?? ''),
  existedBefore: kindMap.has(goal.id), explicitlyClaimedByOldTarget: oldDirectIds.includes(goal.id),
  baseline: kindMap.has(goal.id) ? describe(goal, states.baseline) : null,
  splitOnly: describe(goal, states.splitOnly), proposed: describe(goal, states.proposed),
  remainingDirectCoveredClaims: remainingTerminals.filter(id => (unique(proposed.goals, 'id', id).examData?.coveredGoalIds ?? []).includes(goal.id)),
}));
const lost = field => matrix.filter(row => row.baseline?.[field].length > 0 && row.proposed[field].length === 0);
const keyFields = ['directSek2TerminalIds', 'effectiveSek2TerminalIds', 'directQ4TerminalIds', 'effectiveQ4TerminalIds'];
const losses = Object.fromEntries(keyFields.map(field => [field, lost(field).map(row => row.goalId)]));
const newUnrouted = matrix.filter(row => !row.existedBefore && (!row.proposed.directSek2TerminalIds.length || !row.proposed.hasDirectMotivationPath));
const removedParents = plan.clusterUpdates.map(update => ({ goalId: update.goalId, status: 'retired content leaf becomes curricularArea; not counted as a lost future curricularAtomic endpoint' }));
const report = {
  schemaVersion: 1, artifactType: 'physics-b040-proposed-assessments-readonly-route-diff-v1', observedAt: new Date().toISOString(), status: 'proposal_only_not_applied',
  author: { provider: 'OpenAI', model: 'unknown', modelVersion: 'unknown', humanApprovalClaimed: false },
  sources: Object.entries(paths).map(([key, path]) => ({ path, sha256: sha(bytes[key]) })),
  nativeExecution: { mechanism: 'Exact selected native functions transpiled in memory and invoked, without importing/executing the aggregate status generator or writing a snapshot.', node: process.versions.node, typescript: ts.version, functions: exactNativeSnippets.map(entry => ({ name: entry.name, firstLine: entry.firstLine, sha256: sha(entry.source) })), terminalClusterIds: Array.from(clusterIds), criteria: 'CQR-101 effective and CQR-102 direct terminal reachability are reverse requires paths to direct atomic children of the five configured SekII practice clusters. They do not independently prove actual task coverage. Q4-only endpoints are additionally reported, not mislabeled as the whole native SekII rule.' },
  scenarios: { baseline: 'Current canonical graph and authoritative kinds.', splitOnly: 'All seven planned goals, three cluster conversions and 13 edge changes in memory; two old placeholder assessment lists retained solely as an intermediate diagnostic, not a valid adoption candidate.', proposed: 'Split plan plus exactly the two narrow three-goal assessment lists. Prospective child kinds are assumptions of the proposal, not new authoritative K decisions.' },
  targetAssessmentBeforeAfter: oldGoals.map(goal => ({ goalId: goal.id, beforeRequires: goal.requires, beforeCoveredGoalIds: goal.examData.coveredGoalIds, proposedRequires: proposedCoverage[goal.id], proposedCoveredGoalIds: proposedCoverage[goal.id] })),
  retiredParentLeaves: removedParents,
  losses, newlyPlannedGoalsWithMissingSegments: newUnrouted,
  oldDirectGoalMatrix: oldDirectIds.filter(id => futureKindMap.get(id) === 'curricularAtomic').map(id => unique(matrix, 'goalId', id)),
  allFutureCurricularAtomicGoalsChecked: matrix.length,
  additionalAffectedOrNewGoalMatrix: matrix.filter(row => !oldDirectIds.includes(row.goalId) && (!row.existedBefore || keyFields.some(field => losses[field].includes(row.goalId)))),
  remainingLocalAssessments: remainingTerminals.map(id => { const goal = unique(proposed.goals, 'id', id); return { goalId: id, title: goal.title, phase: goal.dimensionTags?.phase, requires: goal.requires, coveredGoalIds: goal.examData?.coveredGoalIds ?? [], taskContent: goal.examData?.taskContent ?? null, solutionContent: goal.examData?.solutionContent ?? null, scoring: goal.examData?.scoring ?? null, semanticCoverageStatus: 'not inferred from graph or released metadata; see separate authored inspection' }; }),
  boundaries: ['Both replaced baseline tasks are known placeholders: no genuinely demonstrated competency coverage can be lost from those texts; structural routes can still be lost and must not be fabricated back.', 'Other existing terminal edges and coveredGoalIds are inventory claims until their concrete task content has been examined.', 'No canonical, assessment, ledger, runtime, aggregate quality status, registry, source, image or learner-state write. All calculations are in-memory counterfactuals.'],
};
for (const [key, path] of Object.entries(paths)) assert.equal(readFileSync(path, 'utf8'), bytes[key], 'Concurrent source drift');
if (!process.argv.includes('--emit')) {
  process.stdout.write(JSON.stringify({ losses: Object.fromEntries(Object.entries(losses).map(([key, ids]) => [key, matrix.filter(row => ids.includes(row.goalId)).map(row => ({ goalId: row.goalId, title: row.title, phase: row.phase, nativeSelected: row.inNativeSek2GoalSelector, oldClaim: row.explicitlyClaimedByOldTarget }))])), newUnrouted, oldDirectCount: oldDirectIds.length, remainingTerminals: remainingTerminals.length }, null, 2));
  process.exit(0);
}
const outputPath = base + 'proposed-assessments.route-diff.json'; assert.equal(existsSync(outputPath), false);
const outputBytes = JSON.stringify(report, null, 2) + '\n';
const patch = '*** Begin Patch\n*** Add File: ' + outputPath + '\n' + outputBytes.trimEnd().split('\n').map(line => '+' + line).join('\n') + '\n*** End Patch\n';
process.stdout.write(JSON.stringify({ patch, summary: { observedAt: report.observedAt, sha256: sha(outputBytes), losses: Object.fromEntries(Object.entries(losses).map(([key, ids]) => [key, ids.length])), oldDirectCount: oldDirectIds.length } }));
