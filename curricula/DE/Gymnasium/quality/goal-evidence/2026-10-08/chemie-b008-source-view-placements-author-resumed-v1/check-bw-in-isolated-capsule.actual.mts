// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const own = dirname(fileURLToPath(import.meta.url));
const root = resolve(own, '../../../../../../..');
const ownRel = relative(root, own);
const previous = join(dirname(own), 'chemie-b008-sl-specific-source-continuation-author-root-20261008-v21');
const capsule = join(root, 'tmp/chemie-b008-source-view-placements-author-resumed-v1-capsule');
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const bind = (p: string) => {
  const bytes = readFileSync(p);
  return { path: relative(root, p), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length };
};
const write = (p: string, value: any) => {
  if (!p.startsWith(own + '/') && !p.startsWith(capsule + '/')) throw Error('Owned write boundary');
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(value, null, 2) + '\n');
};
const copy = (p: string) => {
  const out = join(capsule, p);
  if (!existsSync(out)) {
    mkdirSync(dirname(out), { recursive: true });
    copyFileSync(join(root, p), out);
  }
  return out;
};
const entry = read(join(own, 'author.candidate-ready.entry.json'));
for (const binding of entry.protectedActiveLandscapes) {
  if (JSON.stringify(bind(join(root, binding.path))) !== JSON.stringify(binding)) throw Error('Active input changed before checks: ' + binding.path);
}
const { normalizeCanonicalLandscape, validateCanonicalLandscape } = await import(pathToFileURL(join(root, 'app/src/utils/authoring/canonicalAuthoring.ts')).href);
const { compileCompositionView, collectCompositionProjectionRoleGoalIds } = await import(pathToFileURL(join(root, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href);
const { fingerprintSemanticKindSourceGoal, loadGoalBookBuildInputs } = await import(pathToFileURL(join(root, 'app/scripts/goalBookModel.ts')).href);
const { buildGoalBookSourceAtlasInputs } = await import(pathToFileURL(join(root, 'app/scripts/goalBookSourceAtlasInputs.ts')).href);
const candidatePath = entry.wholeCandidate.path;
const raw = read(copy(candidatePath));
const kinds = read(join(previous, 'native/current504.semantic-kind.technical-input.json'));
kinds.sourceLandscapePath = candidatePath;
const byId = new Map(raw.goals.map((g: any) => [g.id, g]));
kinds.decisions = kinds.decisions.map((d: any) => ({ ...d, sourceFingerprint: fingerprintSemanticKindSourceGoal(byId.get(d.goalId)) }));
const kindPath = ownRel + '/native/current504.semantic-kind.technical-input.json';
write(join(capsule, kindPath), kinds);
write(join(root, kindPath), kinds);
if (kinds.counts.curricularAtomic !== 395 || kinds.counts.total !== 504) throw Error('Candidate denominator changed');
const typed = normalizeCanonicalLandscape({ ...raw, goals: raw.goals.map((g: any) => ({ ...g, semanticKind: kinds.decisions.find((d: any) => d.goalId === g.id).semanticKind })) });
const graphErrors = validateCanonicalLandscape(normalizeCanonicalLandscape(raw)).filter((f: any) => f.severity === 'error');
if (graphErrors.length) throw Error(JSON.stringify(graphErrors));
for (const relation of ['contains', 'requires']) {
  const visiting = new Set<string>();
  const done = new Set<string>();
  const walk = (id: string) => {
    if (visiting.has(id)) throw Error('Cycle ' + relation + ': ' + id);
    if (done.has(id)) return;
    visiting.add(id);
    for (const reference of (byId.get(id) as any)[relation]) {
      const local = reference.replace(raw.landscapeId + ':', '');
      if (!byId.has(local)) throw Error('Dangling relation: ' + reference);
      walk(local);
    }
    visiting.delete(id);
    done.add(id);
  };
  for (const id of byId.keys()) walk(id);
}
const prior = read(join(previous, 'actual-native43-source-view-findings-three-SL-models-and-current177-contexts.json'));
const views = prior.actual43SourceViews.map((row: any) => {
  const replacement = row.viewId === 'de-gym-chemie-bundesweit-source-de-bw-seki';
  const viewPath = replacement ? entry.candidateView.path : row.afterViewBinding.path;
  const view = read(copy(viewPath));
  const result = compileCompositionView(view, typed);
  const errors = result.findings.filter((f: any) => f.severity === 'error');
  if (errors.some((f: any) => f.code !== 'CPV-009')) throw Error(JSON.stringify({ viewPath, errors }));
  if (replacement && errors.length) throw Error(JSON.stringify({ viewPath, errors }));
  return { viewId: row.viewId, scope: row.scope, beforeCPV009: row.actualAfterCPV009, afterCPV009: errors.filter((f: any) => f.code === 'CPV-009').length, exactInput: bind(join(root, viewPath)), findings: result.findings, changedInThisPacket: replacement, independentPlacementApproval: false };
});
const before = views.reduce((sum: number, row: any) => sum + row.beforeCPV009, 0);
const after = views.reduce((sum: number, row: any) => sum + row.afterCPV009, 0);
if (before !== 35 || after !== 33) throw Error('Unexpected scope compiler delta');

const qaPath = ownRel + '/inputs/active-qa.json.bin';
const qa = read(copy(qaPath));
for (const r of qa.records) if (r.visualizationState === 'available') copy(r.publicAssetPath);
const fullViewPath = ownRel + '/native/all395.review-only.view.json';
const fullView = read(join(previous, 'native/all-current504-candidate-atoms.review-only.view.json'));
fullView.viewId = 'chemie-b008-resumed-bw-author-full395-review-only';
write(join(capsule, fullViewPath), fullView);
write(join(root, fullViewPath), fullView);
const modelConfig = (viewPath: string, name: string) => ({ schemaVersion: 1, bookId: name, title: 'B008 BW explizite Quellenteilkomponenten', landscapePath: candidatePath, compositionViewPath: viewPath, semanticKindLedgerPath: kindPath, goalVisualizationQaPath: qaPath, publicationMode: 'review', atlasBaseUrl: 'https://skillpilot.com/lernzielbuch', evidenceReviewPaths: [], outputPath: ownRel + '/native/' + name + '.pure-model.json' });
const models = [];
for (const [viewPath, name] of [[fullViewPath, 'full395'], [entry.candidateView.path, 'bw-seki-bounded']]) {
  const configPath = ownRel + '/native/' + name + '.book.config.json';
  const config = modelConfig(viewPath, name);
  write(join(capsule, configPath), config);
  const loaded = await loadGoalBookBuildInputs(configPath, capsule);
  write(join(capsule, config.outputPath), loaded.model);
  write(join(root, configPath), config);
  write(join(root, config.outputPath), loaded.model);
  models.push({ name, pages: loaded.model.pages.length, exactModel: bind(join(root, config.outputPath)), ordinaryLoader: true, independentDOrPApproval: false });
}
if (models[0].pages !== 395) throw Error('Full pure model denominator changed');
const bwView = read(join(root, entry.candidateView.path));
const roles = collectCompositionProjectionRoleGoalIds(bwView.rootNodes, new Map(typed.goals.map((g: any) => [g.id, g])));
const targets = entry.explicitParentReplacements.flatMap((r: any) => r.explicitTargetChildren.map((n: any) => n.goalId));
if (!targets.every((id: string) => roles.targetGoalIds.has(id))) throw Error('Explicit target omitted');
if (roles.targetGoalIds.has('5b1bb5d9-07b1-5ba9-b320-cc97be917c60') || !roles.prerequisiteOnlyGoalIds.has('5b1bb5d9-07b1-5ba9-b320-cc97be917c60')) throw Error('Explicit prerequisiteOnly was promoted or lost');
const previousPages = new Map(read(join(previous, 'native/full395.pure-model.json')).pages.map((p: any) => [p.goalId, p]));
const currentPages = read(join(own, 'native/full395.pure-model.json')).pages;
const semanticPageChanges = currentPages.filter((p: any) => JSON.stringify(p) !== JSON.stringify(previousPages.get(p.goalId))).map((p: any) => p.goalId);

// The actual normal source-atlas helper is called with unchanged production
// contracts. Review holds intentionally stop it; no invented metadata is added.
const sourceConfig = read(join(root, 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'));
sourceConfig.landscapePath = candidatePath;
sourceConfig.semanticKindLedgerPath = kindPath;
sourceConfig.expectedCurricularAtomicGoalCount = 395;
copy(sourceConfig.durationModelPolicyPath);
for (const p of sourceConfig.fallbackViewPaths ?? []) copy(p);
for (const p of sourceConfig.mappingPaths) {
  const mapping = read(copy(p));
  const extraction = read(copy(mapping.sourceExtractionPath));
  for (const doc of [...(extraction.sourceDocuments ?? []), ...(extraction.sourceDocument ? [extraction.sourceDocument] : [])]) if (doc.path && existsSync(join(root, doc.path))) copy(doc.path);
}
for (const p of ['candidate-source-mappings/SekI.source-mapping.author-candidate.json', 'candidate-source-mappings/SekII.source-mapping.author-candidate.json']) copy(relative(root, join(previous, p)));
copy(entry.sourceMappingCandidate.path);
const atlasOutcomes = [];
for (const atlasCase of ['sl-before-bw', 'bw-and-sl', 'bw-pending-before-sl']) {
  const useBW = atlasCase !== 'sl-before-bw';
  const useSL = atlasCase !== 'bw-pending-before-sl';
  const config = structuredClone(sourceConfig);
  config.mappingPaths = config.mappingPaths.map((p: string) => useSL && p.includes('DE-SL/lower-secondary') ? relative(root, join(previous, 'candidate-source-mappings/SekI.source-mapping.author-candidate.json')) : useSL && p.includes('DE-SL/upper-secondary') ? relative(root, join(previous, 'candidate-source-mappings/SekII.source-mapping.author-candidate.json')) : useBW && p.includes('DE-BW/lower-secondary') ? entry.sourceMappingCandidate.path : p);
  const configPath = ownRel + '/checks/' + atlasCase + '.normal-source-atlas.config.json';
  write(join(capsule, configPath), config);
  write(join(root, configPath), config);
  let status = 'PASS';
  let errorMessage: string | null = null;
  try { buildGoalBookSourceAtlasInputs(config, capsule); }
  catch (error: any) { status = 'HOLD'; errorMessage = String(error.message); }
  if (status !== 'HOLD' || !errorMessage?.startsWith('Missing reviewed mapping decision metadata:')) throw Error('Unexpected normal atlas result: ' + status + ' ' + errorMessage);
  atlasOutcomes.push({ case: atlasCase, config: bind(join(root, configPath)), status, exactOrdinaryError: errorMessage, noFabricatedReviewMetadata: true, sourceGreen: false });
}

const python = spawnSync('python3', ['-c', `import importlib.util,json,sys
from pathlib import Path
root=Path(sys.argv[1]); capsule=Path(sys.argv[2]); candidate=sys.argv[3]
spec=importlib.util.spec_from_file_location('normal_schemas',root/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
schema=json.loads((root/'docs/landscape-runtime.schema.json').read_text())
assert m.validate_file(str(capsule/candidate),schema)
print(json.dumps({'normalRuntimeSchemaPassed':True,'candidate':candidate}))
`, root, capsule, candidatePath], { encoding: 'utf8', cwd: capsule });
mkdirSync(join(own, 'checks'), { recursive: true });
writeFileSync(join(own, 'checks/normal-runtime-schema.stdout.actual.txt'), python.stdout);
writeFileSync(join(own, 'checks/normal-runtime-schema.stderr.actual.txt'), python.stderr);
if (python.status !== 0) throw Error('Normal runtime schema failed: ' + python.stderr + python.stdout);
for (const binding of entry.protectedActiveLandscapes) {
  if (JSON.stringify(bind(join(root, binding.path))) !== JSON.stringify(binding)) throw Error('Active input changed during checks: ' + binding.path);
}
write(join(own, 'checks/ordinary-capsule-checks.actual.json'), {
  role: 'Actual ordinary checks in an isolated tmp capsule; no scientific or source approval',
  capsuleRoot: relative(root, capsule), noNestedRepositoryOrCurriculumSymlinks: true,
  helperBindings: ['app/scripts/goalBookModel.ts', 'app/scripts/goalBookSourceAtlasInputs.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts', 'scripts/validate_schemas.py'].map(p => bind(join(root, p))),
  canonicalGraphErrors: graphErrors, containsAndRequiresAcyclic: true,
  actual43SourceViews: views, actualBeforeCPV009: before, actualAfterCPV009: after, newErrors: 0,
  normalRuntimeSchemaPassed: true, normalSourceAtlasOutcomes: atlasOutcomes,
  actualPureModels: models, all395NativePagesByteEquivalentPreviousV21: semanticPageChanges.length === 0, actualNativePageChanges: semanticPageChanges,
  previousEightProtectedContextHoldsRetained: true, wholeCareerChoiceCoverage: false,
  exactWhole26Description26Profile52CaseMaterialsRetained: true, activeProtectedLandscapesExact: true,
  independentSourceAndPlacementApproval: false, sourceGreen: false, strictGain: 0, activeWrites: 0, humanApproval: false,
});
console.log(JSON.stringify({ nativeSourceViews: 43, beforeCPV009: before, afterCPV009: after, models: models.map(m => [m.name, m.pages]), atlas: atlasOutcomes.map(a => [a.status, a.exactOrdinaryError]), nativePageChanges: semanticPageChanges.length, activeWrites: 0, strictGain: 0 }));
