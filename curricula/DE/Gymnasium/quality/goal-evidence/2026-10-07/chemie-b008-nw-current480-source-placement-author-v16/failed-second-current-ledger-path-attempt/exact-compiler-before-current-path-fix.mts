// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../../../../../..');
const v12 = join(dirname(here), 'chemie-b008-current169-routing-placement-author-v12');
const v15 = join(dirname(here), 'chemie-b008-ni-stage-course-source-placement-author-v15');
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const bind = (path: string) => {
  const bytes = readFileSync(path);
  return { path: relative(root, path), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length };
};
const write = (path: string, data: any) => {
  if (!path.startsWith(here + '/')) throw Error('Ownership boundary');
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
};

const { normalizeCanonicalLandscape, validateCanonicalLandscape } = await import(pathToFileURL(join(root, 'app/src/utils/authoring/canonicalAuthoring.ts')).href);
const { compileCompositionView } = await import(pathToFileURL(join(root, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href);
const { fingerprintSemanticKindSourceGoal, loadGoalBookBuildInputs } = await import(pathToFileURL(join(root, 'app/scripts/goalBookModel.ts')).href);
const currentPath = join(here, 'inputs/active-current480.json.bin');
const current = read(currentPath);
const oldPath = join(v15, 'candidate/canonical.current503-ni-source-metadata.author-candidate.json');
const previous = read(oldPath);
const candidatePath = join(here, 'candidate/canonical.current504-nw-source-metadata.author-candidate.json');
const candidate = read(candidatePath);
const byGoal = new Map<string, any>(candidate.goals.map((goal: any) => [goal.id, goal]));
const currentKinds = read(join(here, 'inputs/active-kinds-current480.json.bin'));
const previousKinds = read(join(v15, 'native/current503.semantic-kind.technical-input.json'));
const splitIds = new Set(read(join(v12, 'current169-protected-guard-and-field-intents.author.json')).convertedSevenClusterIds);
const previousByKind = new Map<string, any>(previousKinds.decisions.map((row: any) => [row.goalId, row]));
const currentByKind = new Map<string, any>(currentKinds.decisions.map((row: any) => [row.goalId, row]));
const kinds = structuredClone(currentKinds);
kinds.sourceLandscapePath = relative(root, candidatePath);
kinds.decisions = candidate.goals.map((goal: any) => {
  const row = splitIds.has(goal.id) || !currentByKind.has(goal.id) ? previousByKind.get(goal.id) : currentByKind.get(goal.id);
  if (!row) throw Error('Missing exact retained kind row: ' + goal.id);
  return { ...row, sourceFingerprint: fingerprintSemanticKindSourceGoal(goal) };
});
kinds.counts = Object.fromEntries(Object.keys(currentKinds.counts).map(kind => [kind, kind === 'total' ? kinds.decisions.length : kinds.decisions.filter((row: any) => row.semanticKind === kind).length]));
const kindPath = join(here, 'native/current504.semantic-kind.technical-input.json');
write(kindPath, kinds);
if (kinds.counts.curricularAtomic !== 395 || kinds.counts.memory !== 7) throw Error('Fresh current denominator/kind lost');
const attach = (value: any, ledger: any) => {
  const byKind = new Map(ledger.decisions.map((row: any) => [row.goalId, row.semanticKind]));
  return normalizeCanonicalLandscape({ ...value, goals: value.goals.map((goal: any) => ({ ...goal, semanticKind: byKind.get(goal.id) })) });
};
const oldGraph = attach(previous, previousKinds);
const graph = attach(candidate, kinds);
const diagnostics = validateCanonicalLandscape(normalizeCanonicalLandscape(candidate));
if (diagnostics.some((row: any) => row.severity === 'error')) throw Error(JSON.stringify(diagnostics));
for (const relation of ['contains', 'requires']) {
  const visiting = new Set<string>();
  const done = new Set<string>();
  const walk = (id: string) => {
    if (visiting.has(id)) throw Error('Cycle ' + relation + ': ' + id);
    if (done.has(id)) return;
    visiting.add(id);
    for (const reference of byGoal.get(id)[relation]) {
      const local = reference.includes(':') ? reference.split(':').at(-1) : reference;
      if (!byGoal.has(local)) throw Error('Dangling ' + reference);
      walk(local);
    }
    visiting.delete(id);
    done.add(id);
  };
  for (const id of byGoal.keys()) walk(id);
}

const proposals = read(join(here, 'exact-nw-primary-course-components-and-three-view-proposals.author.json'));
const oldCompilation = read(join(v15, 'actual-native43-source-view-findings-and-three-real-pure-models.json'));
const replacements = new Map(proposals.threeSpecificCandidateViews.map((row: any) => [row.viewId, row]));
const views = [];
for (const old of oldCompilation.actual43SourceViews) {
  const beforePath = join(root, old.afterViewBinding.path);
  const before = compileCompositionView(read(beforePath), oldGraph);
  const replacement: any = replacements.get(old.viewId);
  const afterPath = replacement ? join(root, replacement.candidateView.path) : beforePath;
  const compiled = compileCompositionView(read(afterPath), graph);
  const errors = compiled.findings.filter((finding: any) => finding.severity === 'error');
  if (errors.some((finding: any) => finding.code !== 'CPV-009')) throw Error(JSON.stringify({ viewId: old.viewId, errors }));
  if (replacement && errors.length) throw Error(JSON.stringify({ viewId: old.viewId, errors }));
  views.push({ viewId: old.viewId, scope: old.scope, actualBeforeCPV009: before.findings.filter((finding: any) => finding.code === 'CPV-009').length, actualAfterCPV009: compiled.findings.filter((finding: any) => finding.code === 'CPV-009').length, beforeViewBinding: bind(beforePath), afterViewBinding: bind(afterPath), actualAfterFindings: compiled.findings, changedInThisPacket: Boolean(replacement), sourceIndependentApproval: false, wholeOriginalSourceClosure: false });
}

const config = (id: string, landscapePath: string, viewPath: string, kindLedger: string, filename: string) => ({ schemaVersion: 1, bookId: id, title: 'B008 tatsächliche aktuelle NW Quellenteilkomponenten', landscapePath, compositionViewPath: viewPath, semanticKindLedgerPath: kindLedger, goalVisualizationQaPath: relative(root, join(here, 'inputs/active-qa-current.json.bin')), publicationMode: 'review', atlasBaseUrl: 'https://skillpilot.com/lernzielbuch', evidenceReviewPaths: [], outputPath: relative(root, join(here, 'native', filename)) });
const fullView = read(join(v12, 'native/all-candidate-atoms.review-only.view.json'));
fullView.viewId = 'chemie-b008-current504-native-author-review-universe-395-v16';
const fullViewPath = join(here, 'native/all-current504-candidate-atoms.review-only.view.json');
write(fullViewPath, fullView);
const fullConfigPath = join(here, 'native/full395.book.config.json');
write(fullConfigPath, config('b008-nw-current504-inactive', relative(root, candidatePath), relative(root, fullViewPath), relative(root, kindPath), 'full395.pure-model.json'));
const full = await loadGoalBookBuildInputs(relative(root, fullConfigPath), root);
if (full.model.pages.length !== 395) throw Error('Candidate denominator changed');
write(join(here, 'native/full395.pure-model.json'), full.model);
const currentViewPath = join(root, 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json');
const currentViewSnapshot = join(here, 'inputs/active-full-canonical-review.view.json.bin');
writeFileSync(currentViewSnapshot, readFileSync(currentViewPath));
const currentConfigPath = join(here, 'native/fresh-current378.baseline.book.config.json');
write(currentConfigPath, config('b008-current480-fresh-protected-baseline', relative(root, currentPath), relative(root, currentViewSnapshot), relative(root, join(here, 'inputs/active-kinds-current480.json.bin')), 'fresh-current378.baseline.pure-model.json'));
const currentFull = await loadGoalBookBuildInputs(relative(root, currentConfigPath), root);
if (currentFull.model.pages.length !== 378) throw Error('Actual active baseline denominator changed');
write(join(here, 'native/fresh-current378.baseline.pure-model.json'), currentFull.model);
const models = [];
for (const row of proposals.threeSpecificCandidateViews) {
  const configPath = join(here, 'native', row.viewId + '.book.config.json');
  const modelPath = join(here, 'native', row.viewId + '.pure-model.json');
  write(configPath, config(row.viewId + '-b008-author-v16', relative(root, candidatePath), row.candidateView.path, relative(root, kindPath), row.viewId + '.pure-model.json'));
  const loaded = await loadGoalBookBuildInputs(relative(root, configPath), root);
  write(modelPath, loaded.model);
  models.push({ viewId: row.viewId, scope: row.scope, actualPureModel: bind(modelPath), actualNativeTargetPages: loaded.model.pages.length, explicitTargetRoutines: row.targetRoutineCount, explicitPrerequisiteOnlyRoutines: row.prerequisiteOnlyRoutineCount, GKUsesLKOnlySourceIds: false, independentDAndPApproval: false });
}

const oldPages = new Map(currentFull.model.pages.map((page: any) => [page.goalId, page]));
const newPages = new Map(full.model.pages.map((page: any) => [page.goalId, page]));
const strip = (value: any): any => Array.isArray(value) ? value.map(strip) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter(([key]) => !['pageNumber', 'navigationOrder', 'treeOrder', 'pageFingerprint'].includes(key)).map(([key, item]) => [key, strip(item)])) : value;
const guard = read(join(here, 'current480-three-way-bounded-field-rebase.actual.json'));
const protectedRows = guard.all173ProtectedTextImageAndMetadataValuesExact.map((id: string) => {
  const before: any = oldPages.get(id);
  const after: any = newPages.get(id);
  if (!before || !after) throw Error('Protected current page omitted: ' + id);
  const fields = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(field => !['pageNumber', 'navigationOrder', 'treeOrder', 'pageFingerprint'].includes(field) && JSON.stringify(strip(before[field])) !== JSON.stringify(strip(after[field])));
  return { goalId: id, actualWholeGoalFingerprintExact: before.goalFingerprint === after.goalFingerprint, currentPageExcludingPaginationExact: fields.length === 0, actualChangedPageFields: fields.map(field => ({ field, wholeCurrentValue: before[field], wholeCandidateValue: after[field] })), reviewStatus: fields.length ? 'HOLD: actual affected page/context comparison and independent revalidation required; not a current closure' : 'UNCHANGED: current goal/page binding can be retained subject to final native campaign and actual source metadata merge' };
});
const protectedDeltaCount = protectedRows.filter((row: any) => !row.currentPageExcludingPaginationExact).length;
const before = views.reduce((sum, row) => sum + row.actualBeforeCPV009, 0);
const after = views.reduce((sum, row) => sum + row.actualAfterCPV009, 0);
if (before !== 98 || after !== 83) throw Error(`Expected 98 -> 83; got ${before} -> ${after}`);
const previousByGoal = new Map(previous.goals.map((goal: any) => [goal.id, goal]));
const routines = Object.entries(read(join(v12, 'current169-protected-guard-and-field-intents.author.json')).routineGoalIds).map(([key, id]: any) => ({ candidateKey: key, goalId: id, wholeDEENDescriptionsExactPriorV15: ['title', 'titleEn', 'description', 'descriptionEn'].every(field => byGoal.get(id)[field] === (previousByGoal.get(id) as any)[field]) }));
if (!routines.every(row => row.wholeDEENDescriptionsExactPriorV15)) throw Error('Unchanged whole routine text changed');
write(join(here, 'actual-native43-source-view-findings-three-NW-models-and-current173-contexts.json'), { role: 'Actual bounded technical author compilation, never independent scientific approval', nativeHelperBindings: [bind(join(root, 'app/scripts/goalBookModel.ts')), bind(join(root, 'app/src/utils/authoring/compositionViewAuthoring.ts'))], actual43SourceViews: views, actualBeforeCPV009: before, actualAfterCPV009: after, actualTechnicalCandidateReduction: 15, newNonCPV009Errors: 0, actualThreeNWSourcePureModels: models, actualFreshCurrentWholeGoals: 480, actualInactiveCandidateWholeGoals: 504, actualFreshCurrentCurricularAtomic: 378, actualCandidateCurricularAtomic: 395, exactRetainedFreshMemoryKind417e: kinds.decisions.find((row: any) => row.goalId === '417e65ec-68be-5f2e-9452-c3ba9b1d362f'), exact26WholeDescriptionsRetained: routines, all173ProtectedActualPageContextComparisons: protectedRows, actualProtectedContextHolds: protectedDeltaCount, oldV12EightContextHoldsNotPromoted: true, old16BYNoFacetSourceDutiesNotPromoted: true, nationalOriginalSourceDutyCountRetained: 1646, NWOriginalSourceDutyCountRetained: 192, partialNWChildComponents: proposals.specificPartialChildComponents.length, actualSelectedSourceAnchorCorrectionsPending: proposals.targetedWholeSourceGoalAnchorCorrections.length, sourceGateOrStatusPromotions: 0, semanticKindFingerprintRefreshIsTechnicalOnly: true, wholeSourceClosure: false, currentActiveStrictCompletionsRemain173: true, strictGain: 0, activeWrites: 0, humanApproval: false });
console.log(JSON.stringify({ actualNativeViews: 43, beforeCPV009: before, afterCPV009: after, inactiveWholeGoals: 504, freshCurrentPurePages: 378, candidatePurePages: 395, NWSourcePurePages: models.map(row => [row.viewId, row.actualNativeTargetPages]), actualProtectedContextHolds: protectedDeltaCount, strictGain: 0 }));
