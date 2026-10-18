import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeCanonicalLandscape } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts';
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts';
import { convertLearningGoal } from '/home/enpasos/projects/skillpilot/app/src/goalTypes.ts';
import { goalMatchesGlobalStageScope } from '/home/enpasos/projects/skillpilot/app/src/utils/personalCurriculumStageScope.ts';

const root = '/home/enpasos/projects/skillpilot';
const out = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = resolve(out, 'INPUTS.exact-technical-assembly.json');
const inputs = JSON.parse(readFileSync(inputPath, 'utf8'));
const canonicalPath = resolve(root, inputs.canonical.path);
const rawCanonical = JSON.parse(readFileSync(canonicalPath, 'utf8'));
const canonical = normalizeCanonicalLandscape(rawCanonical);
const goals = new Map(canonical.goals.map(g => [g.id, g]));
const rawGoals = new Map(rawCanonical.goals.map((g: any) => [g.id, g]));
const selectorPath = resolve(out, 'VIEWS41.whole-current653-Lower14-eight-priors.PENDING-final-context.json');
const views = JSON.parse(readFileSync(selectorPath, 'utf8'));
const hash = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');
const pin = (p: string) => ({ path: relative(root, p), sha256: hash(p), bytes: readFileSync(p).length });
const results: any[] = [];

for (let i = 0; i < views.length; i++) {
  const raw = views[i];
  const view = normalizeCompositionView(raw);
  const compiled = compileCompositionView(view, canonical);
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals);
  const visible = new Set<string>();
  const paths: any[] = [];
  const walk = (nodes: any[], parents: string[]) => {
    for (const node of nodes) {
      if (node.sourceGoalId) {
        visible.add(node.sourceGoalId);
        if (['04ebfc99-dbac-539e-95db-642addcaca8c', '3899edf4-a809-54b1-8ee7-4e67aa82dc7c', '31cce65a-480a-5111-ab3c-da2feb3d4065', '42391b16-bbae-5c77-84e1-d488e714167b'].includes(node.sourceGoalId)) {
          paths.push({ goalId: node.sourceGoalId, path: [...parents, node.label] });
        }
      }
      walk(node.children ?? [], [...parents, node.label]);
    }
  };
  walk(compiled.compiledRootNodes, []);
  const selected = new Set([...roles.targetGoalIds, ...roles.prerequisiteOnlyGoalIds]);
  const directMissingPriors: any[] = [];
  for (const id of roles.targetGoalIds) {
    const g = goals.get(id);
    for (const priorId of g?.requires ?? []) {
      if (!selected.has(priorId)) directMissingPriors.push({ consumerGoalId: id, priorGoalId: priorId });
    }
  }
  const supportsVisible = [...roles.prerequisiteOnlyGoalIds].filter(id => visible.has(id));
  const targetsNotVisible = [...roles.targetGoalIds].filter(id => !visible.has(id));
  const isHB = view.scope.jurisdiction === 'DE-HB';
  const rejectedHBStageTargets = isHB ? [...roles.targetGoalIds].filter(id => !goalMatchesGlobalStageScope(convertLearningGoal(rawGoals.get(id) as any), { 'a0e13c56-c25f-4742-9272-3a1a603ee52e': { selected: true, stage: view.scope.stage } })) : [];
  results.push({
    viewId: view.viewId, pointer: '/' + i, scope: view.scope,
    stockCompileErrors: compiled.findings.filter(f => f.severity === 'error'),
    stockCompileWarnings: compiled.findings.filter(f => f.severity === 'warning'),
    targetGoalCount: roles.targetGoalIds.size,
    prerequisiteOnlyGoalCount: roles.prerequisiteOnlyGoalIds.size,
    targetGoalIds: [...roles.targetGoalIds].sort(),
    prerequisiteOnlyGoalIds: [...roles.prerequisiteOnlyGoalIds].sort(),
    supportGoalIdsVisibleInTree: supportsVisible,
    targetGoalIdsMissingInTree: targetsNotVisible,
    directMissingPriorRows: directMissingPriors,
    directPriorCheckBoundary: 'Finite membership diagnostic only. No requires imports or scientific judgments inferred.',
    rejectedHBStageTargets, importantHBPaths: isHB ? paths : [],
    newOwnTarget3899: isHB ? roles.targetGoalIds.has('3899edf4-a809-54b1-8ee7-4e67aa82dc7c') : undefined,
    lower04ebTarget: isHB ? roles.targetGoalIds.has('04ebfc99-dbac-539e-95db-642addcaca8c') : undefined,
  });
}

const report = {
  artifactType: 'actual stock whole41 composition compilation against exact paired C653',
  canonical: pin(canonicalPath), selector: pin(selectorPath),
  stockFunctions: ['normalizeCompositionView', 'compileCompositionView', 'collectCompositionProjectionRoleGoalIds', 'goalMatchesGlobalStageScope for four HB scopes only'],
  codePins: ['app/src/utils/authoring/compositionViewAuthoring.ts', 'app/src/utils/authoring/canonicalAuthoring.ts', 'app/src/utils/personalCurriculumStageScope.ts', 'app/src/goalTypes.ts'].map(p => pin(resolve(root, p))),
  views: results,
  all41StockCompileWithoutErrors: results.every(r => r.stockCompileErrors.length === 0),
  all41SupportRolesExcludedFromVisibleTree: results.every(r => r.supportGoalIdsVisibleInTree.length === 0),
  all41TargetsPresentInCompiledTree: results.every(r => r.targetGoalIdsMissingInTree.length === 0),
  allFourHBDirectPriorsResolved: results.filter(r => r.scope.jurisdiction === 'DE-HB').every(r => r.directMissingPriorRows.length === 0),
  allFourHBStockStagePredicatePass: results.filter(r => r.scope.jurisdiction === 'DE-HB').every(r => r.rejectedHBStageTargets.length === 0),
  noNormalFilesChanged: true, runtimeCodeChanges: false, buildsOrFullQA: false,
  actualFinalApplicabilityCompilerPass: false, nativeBindingsClosed: false,
  newScienceReview: false, whole41ScientificActivationApprovedByThisCheck: false,
  M7Claim: false, HumanApproval: false, HumanTrial: false,
};
writeFileSync(resolve(out, 'CHECK.actual-stock-whole41-compilation.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  all41StockCompileWithoutErrors: report.all41StockCompileWithoutErrors,
  all41SupportRolesExcludedFromVisibleTree: report.all41SupportRolesExcludedFromVisibleTree,
  all41TargetsPresentInCompiledTree: report.all41TargetsPresentInCompiledTree,
  allFourHBDirectPriorsResolved: report.allFourHBDirectPriorsResolved,
  allFourHBStockStagePredicatePass: report.allFourHBStockStagePredicatePass,
  errors: results.flatMap(r => r.stockCompileErrors.map((e: any) => ({ viewId: r.viewId, ...e }))),
  warningCount: results.reduce((n, r) => n + r.stockCompileWarnings.length, 0),
  remainingDirectPriorMembershipCounts: results.filter(r => r.directMissingPriorRows.length).map(r => ({ viewId: r.viewId, count: r.directMissingPriorRows.length })),
  HB: results.filter(r => r.scope.jurisdiction === 'DE-HB').map(r => ({ viewId: r.viewId, targets: r.targetGoalCount, supports: r.prerequisiteOnlyGoalCount, importantPaths: r.importantHBPaths })),
}, null, 2));
if (!report.all41StockCompileWithoutErrors || !report.all41SupportRolesExcludedFromVisibleTree || !report.all41TargetsPresentInCompiledTree || !report.allFourHBDirectPriorsResolved || !report.allFourHBStockStagePredicatePass) process.exitCode = 1;
