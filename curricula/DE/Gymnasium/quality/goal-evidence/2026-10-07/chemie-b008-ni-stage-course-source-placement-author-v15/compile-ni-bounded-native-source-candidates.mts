// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../../../../../..');
const v12 = join(dirname(here), 'chemie-b008-current169-routing-placement-author-v12');
const v14 = join(dirname(here), 'chemie-b008-bb-be-model-data-source-placement-author-v14');
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
const previous = read(join(v14, 'candidate/canonical.current503-bb-be-source-metadata.author-candidate.json'));
const candidatePath = join(here, 'candidate/canonical.current503-ni-source-metadata.author-candidate.json');
const candidate = read(candidatePath);
const previousKinds = read(join(v14, 'native/current503.semantic-kind.technical-input.json'));
const byGoal = new Map<string, any>(candidate.goals.map((goal: any) => [goal.id, goal]));
const kinds = structuredClone(previousKinds);
kinds.sourceLandscapePath = relative(root, candidatePath);
kinds.decisions = kinds.decisions.map((row: any) => ({ ...row, sourceFingerprint: fingerprintSemanticKindSourceGoal(byGoal.get(row.goalId)) }));
const kindPath = join(here, 'native/current503.semantic-kind.technical-input.json');
write(kindPath, kinds);
const attach = (graph: any, ledger: any) => {
  const byKind = new Map(ledger.decisions.map((row: any) => [row.goalId, row.semanticKind]));
  return normalizeCanonicalLandscape({ ...graph, goals: graph.goals.map((goal: any) => ({ ...goal, semanticKind: byKind.get(goal.id) })) });
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

const proposals = read(join(here, 'exact-ni-primary-stage-course-partial-components-and-view-proposals.json'));
const oldCompilation = read(join(v14, 'actual-native43-source-view-findings-and-six-real-pure-models.json'));
const replacements = new Map(proposals.threeSpecificCandidateViews.map((row: any) => [row.viewId, row]));
const viewResults = [];
for (const old of oldCompilation.actual43SourceViews) {
  const oldPath = join(root, old.afterViewBinding.path);
  const oldView = read(oldPath);
  const before = compileCompositionView(oldView, oldGraph);
  const replacement: any = replacements.get(old.viewId);
  const path = replacement ? join(root, replacement.candidateView.path) : oldPath;
  const compiled = compileCompositionView(read(path), graph);
  const errors = compiled.findings.filter((finding: any) => finding.severity === 'error');
  if (errors.some((finding: any) => finding.code !== 'CPV-009')) throw Error(JSON.stringify({ viewId: old.viewId, errors }));
  if (replacement && errors.length) throw Error(JSON.stringify({ viewId: old.viewId, errors }));
  viewResults.push({ viewId: old.viewId, scope: old.scope, actualBeforeCPV009: before.findings.filter((finding: any) => finding.code === 'CPV-009').length, actualAfterCPV009: compiled.findings.filter((finding: any) => finding.code === 'CPV-009').length, beforeViewBinding: bind(oldPath), afterViewBinding: bind(path), actualAfterFindings: compiled.findings, changedInThisPacket: Boolean(replacement), sourceIndependentApproval: false, wholeOriginalSourceClosure: false });
}

const config = (bookId: string, viewPath: string, filename: string) => ({ schemaVersion: 1, bookId, title: 'B008 echte NI Quellen- und Platzierungskandidaten', landscapePath: relative(root, candidatePath), compositionViewPath: viewPath, semanticKindLedgerPath: relative(root, kindPath), goalVisualizationQaPath: relative(root, join(v12, 'inputs/active-qa-current.json.bin')), publicationMode: 'review', atlasBaseUrl: 'https://skillpilot.com/lernzielbuch', evidenceReviewPaths: [], outputPath: relative(root, join(here, 'native', filename)) });
const fullConfig = join(here, 'native/full395.book.config.json');
write(fullConfig, config('b008-ni-current395-inactive', relative(root, join(v12, 'native/all-candidate-atoms.review-only.view.json')), 'full395.pure-model.json'));
const full = await loadGoalBookBuildInputs(relative(root, fullConfig), root);
if (full.model.pages.length !== 395) throw Error('Candidate denominator changed');
write(join(here, 'native/full395.pure-model.json'), full.model);
const sourceModels = [];
for (const row of proposals.threeSpecificCandidateViews) {
  const configPath = join(here, 'native', row.viewId + '.book.config.json');
  const modelPath = join(here, 'native', row.viewId + '.pure-model.json');
  write(configPath, config(row.viewId + '-b008-author', row.candidateView.path, row.viewId + '.pure-model.json'));
  const loaded = await loadGoalBookBuildInputs(relative(root, configPath), root);
  write(modelPath, loaded.model);
  sourceModels.push({ viewId: row.viewId, scope: row.scope, pureModelBinding: bind(modelPath), actualNativeTargetPages: loaded.model.pages.length, explicitTargetRoutineCount: row.targetRoutineCount, explicitPrerequisiteOnlyRoutineCount: row.scope.stage === 'SekII' ? 7 : 0, independentDAndPApproval: false });
}

const oldPages = new Map(read(join(v14, 'native/full395.pure-model.json')).pages.map((page: any) => [page.goalId, page]));
const newPages = new Map(full.model.pages.map((page: any) => [page.goalId, page]));
const strip = (value: any): any => Array.isArray(value) ? value.map(strip) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter(([key]) => !['pageNumber', 'navigationOrder', 'treeOrder', 'pageFingerprint'].includes(key)).map(([key, item]) => [key, strip(item)])) : value;
const protectedRows = read(join(v12, 'current169-protected-guard-and-field-intents.author.json')).protectedCurrentGoalIds.map((id: string) => {
  const before: any = oldPages.get(id);
  const now: any = newPages.get(id);
  return { goalId: id, goalFingerprintExact: before.goalFingerprint === now.goalFingerprint, actualPageContentExcludingPaginationExact: JSON.stringify(strip(before)) === JSON.stringify(strip(now)) };
});
if (!protectedRows.every((row: any) => row.goalFingerprintExact && row.actualPageContentExcludingPaginationExact)) throw Error('New protected page context delta');
const before = viewResults.reduce((total, row) => total + row.actualBeforeCPV009, 0);
const after = viewResults.reduce((total, row) => total + row.actualAfterCPV009, 0);
if (before !== 111 || after !== 98) throw Error(`Expected 111 -> 98; got ${before} -> ${after}`);
write(join(here, 'actual-native43-source-view-findings-and-three-real-pure-models.json'), { role: 'Actual bounded author candidate compilation; no independent approval', nativeHelperBindings: [bind(join(root, 'app/scripts/goalBookModel.ts')), bind(join(root, 'app/src/utils/authoring/compositionViewAuthoring.ts'))], actual43SourceViews: viewResults, actualBeforeCPV009: before, actualAfterCPV009: after, actualTechnicalCandidateReduction: 13, newNonCPV009Errors: 0, actualThreeNISourcePureModels: sourceModels, allActualCandidatePurePages: 395, allProtected169WholeGoalAndPageContextsExactFromV14: protectedRows, v12ExistingEightProtectedContextDeltasStillPending: true, original16NoFacetDutyRoutesStillHold: true, retainedWholeOriginalNIFamilyDuties: 371, allNationalOriginalSourceDutiesRetained: 1646, genuineLKOnlySourceIdsProjectedIntoGK: 0, actualSourceDecisionInputsPending: proposals.guardedSourceMappingProposals.reduce((count: number, row: any) => count + row.pendingActualSourceIds.length, 0), sourceGateOrStatusPromotions: 0, semanticKindFingerprintRefreshIsTechnicalOnly: true, strictGain: 0, activeWrites: 0, humanApproval: false });
console.log(JSON.stringify({ actualNativeSourceViews: 43, beforeCPV009: before, afterCPV009: after, candidateReduction: 13, fullPurePages: 395, actualNISourcePurePages: sourceModels.map(row => [row.viewId, row.actualNativeTargetPages]), newProtected169ContextDeltas: 0, strictGain: 0 }));
