import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../../app/scripts/goalBookSourceAtlasInputs';
import { buildGoalBookModel, parseAndValidateGoalBookModel } from '../../../../../../../../app/scripts/goalBookModel';
import { buildGoalBookOriginalSources } from '../../../../../../../../app/scripts/goalBookOriginalSources';
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign';
import { goalEvidenceReviewInputPayload } from '../../../../../../../../app/scripts/goalEvidenceProfileModel';

const own = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repo = path.resolve(own, ...Array(7).fill('..'));
const relativeOwn = path.relative(repo, own);
const parentRelative = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-q3-remaining-current402-bounded-source-P-author-20261011-v1';
const parent = path.join(repo, parentRelative);
const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));
const save = (p: string, d: unknown) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
};
const digest = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const landscape = read(path.join(own, 'inputs/current523.author-successor.de.json'));
const semantic = read(path.join(own, 'inputs/current523.semantic-kinds.author.json'));
const qa = read(path.join(own, 'visualization/chemie.qa.inactive-author.json'));
const whole = parseAndValidateGoalBookModel(fs.readFileSync(path.join(own, 'native/whole402.neutral.normal-model.author.actual.json'), 'utf8'));
const native = parseAndValidateGoalBookModel(fs.readFileSync(path.join(own, 'native/thirteen.normal-model.author.actual.json'), 'utf8'));
const atlasConfig = read(path.join(parent, 'sources/normal-source-atlas.inactive.inputs.json'));
atlasConfig.landscapePath = path.join(relativeOwn, 'inputs/current523.author-successor.de.json');
atlasConfig.semanticKindLedgerPath = path.join(relativeOwn, 'inputs/current523.semantic-kinds.author.json');
save(path.join(own, 'sources/current-live.normal-source-atlas.inactive.inputs.json'), atlasConfig);
const atlas = buildGoalBookSourceAtlasInputs(atlasConfig, repo);
for (const [logicalPath, bytes] of Object.entries(atlas.outputs)) {
  const output = path.join(own, 'sources/normal-current-output', logicalPath);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, bytes);
}
const prefix = path.join(relativeOwn, 'sources/normal-current-output');
const manifest = JSON.parse(atlas.outputs[atlasConfig.manifestPath]);
manifest.sourcePaths = manifest.sourcePaths.map((p: string) => path.join(prefix, p));
manifest.navigationViewPath = path.join(prefix, manifest.navigationViewPath);
save(path.join(own, 'native/composition-sources.current-live.inactive.json'), manifest);
const sourceConfig = read(path.join(parent, 'native/source381.proposed-source.normal-book.author.inactive.config.json'));
sourceConfig.landscapePath = atlasConfig.landscapePath;
sourceConfig.semanticKindLedgerPath = atlasConfig.semanticKindLedgerPath;
sourceConfig.goalVisualizationQaPath = path.join(relativeOwn, 'visualization/chemie.qa.inactive-author.json');
sourceConfig.compositionViewManifestPath = path.join(relativeOwn, 'native/composition-sources.current-live.inactive.json');
sourceConfig.outputPath = path.join(relativeOwn, 'native/source381.current-live.normal-model.author.actual.json');
save(path.join(own, 'native/source381.current-live.author.inactive.config.json'), sourceConfig);
const capsule = path.join(repo, 'tmp/chemie-q3-thirteen-author-v2-execution-capsule');
const assetDigests = Object.fromEntries(qa.records.filter((r: any) => r.visualizationState === 'available')
  .map((r: any) => [r.imageUrl, digest(fs.readFileSync(path.join(capsule, r.publicAssetPath)))]));
const sourceModel = buildGoalBookModel({
  landscape, semanticKindLedger: semantic, goalVisualizationQa: qa,
  goalVisualizationAssetDigests: assetDigests, evidenceReviewSources: [], config: sourceConfig,
  compositionViewManifest: manifest,
  compositionViewSources: manifest.sourcePaths.map((p: string) => ({ path: p, view: read(path.join(repo, p)) })),
  navigationView: read(path.join(repo, manifest.navigationViewPath)),
  durationModelPolicy: read(path.join(repo, manifest.durationModelPolicyPath)),
});
parseAndValidateGoalBookModel(JSON.stringify(sourceModel));
save(path.join(repo, sourceConfig.outputPath), sourceModel);
const sourceIndex = buildGoalBookOriginalSources(sourceModel, repo, atlasConfig.mappingPaths);
save(path.join(own, 'sources/source381.current-live.normal-original-sources.actual.json'), sourceIndex);
save(path.join(own, 'checks/current-live-normal-source-routing.actual.json'), {
  normalFunctions: ['buildGoalBookSourceAtlasInputs', 'buildGoalBookModel', 'buildGoalBookOriginalSources'],
  actualCounts: atlas.receipt.counts, currentNativeSourceModelPages: sourceModel.pages.length,
  currentCanonicalWhole402Pages: whole.pages.length, wholeSourceUnionApproval: false,
  outputWritesOnlyOwnAuthorPackage: true, activeWrites: false,
});
const records = new Map(fs.readFileSync(path.join(own, 'positive/P13.author.review.jsonl'), 'utf8').trim().split('\n').map(l => { const r = JSON.parse(l); return [r.goalId, r]; }));
const parentJoin = read(path.join(parent, 'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json'));
const currentGoals = new Map(landscape.goals.map((g: any) => [g.id, g]));
const currentPages = new Map(whole.pages.map(p => [p.goalId, p]));
const nativePages = new Map(native.pages.map(p => [p.goalId, p]));
const centralPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-current402-M7-resumption-root-20261012-v1/checks/central-current402.normal-resumption.actual.json';
const central = read(path.join(repo, centralPath));
const strict = new Set(central.subjects.find((s: any) => s.subject === 'chemie').strictCompleteGoalIds);
const sourceGoalPayload = (gid: string) => {
  const applicability = sourceIndex.goals[gid] ?? [];
  const evidenceIds = new Set(applicability.flatMap((r: any) => r.evidenceIds));
  const evidence = sourceIndex.evidence.filter((r: any) => evidenceIds.has(r.id));
  const documentIds = new Set(evidence.map((r: any) => r.documentId));
  return { applicability, documents: sourceIndex.documents.filter((r: any) => documentIds.has(r.id)),
    evidence, role: 'actual_current_citation_payload_not_whole_normative_union' };
};
const refresh = (t: any) => {
  const g: any = currentGoals.get(t.goalId);
  const p = currentPages.get(t.goalId);
  const visual = p?.visualization;
  const digests = visual ? { [visual.url]: visual.originalDigest } : {};
  return {
    ...t, wholeGoal: g, wholeCurrentNormalPage: p,
    wholeCurrentScope13NativePage: nativePages.get(t.goalId) ?? null,
    wholeCanonicalDContext: buildGoalDescriptionCanonicalContext(g),
    normalPInput: goalEvidenceReviewInputPayload(g, 'goal-evidence-v1', digests, 'curricularAtomic'),
    positiveRecord: records.get(t.goalId) ?? t.positiveRecord,
    normalOriginalSourcePayload: sourceGoalPayload(t.goalId),
    imageKeepBinding: { originalRetained: !t.goalId.startsWith('96fd'), currentUrl: visual?.url,
      currentDigest: visual?.originalDigest, currentActualAssetPath: t.goalId.startsWith('96fd')
        ? path.join(relativeOwn, 'visualization/staged/curricula/DE/Gymnasium/visualizations/chemie', t.goalId, t.goalId + '.png')
        : 'app/public' + visual?.url,
      newWholeTupleIndependentVisualizationReview: false,
    },
    actualPrerequisiteWholeGoals: (g.requires ?? []).map((id: string) => currentGoals.get(id)),
    actualParentWholeGoals: landscape.goals.filter((x: any) => (x.contains ?? []).includes(g.id)),
    actualReverseRequiresWholeGoals: landscape.goals.filter((x: any) => (x.requires ?? []).includes(g.id)),
    currentStrictProtected: strict.has(g.id),
  };
};
const join = {
  ...parentJoin, role: 'sealed_current_live_author_neutral_input_not_independent_QA',
  whole523Path: path.join(relativeOwn, 'inputs/current523.author-successor.de.json'),
  whole402NormalModelPath: path.join(relativeOwn, 'native/whole402.neutral.normal-model.author.actual.json'),
  whole402NormalModelDigest: whole.digest,
  scope13NativeModelPath: path.join(relativeOwn, 'native/thirteen.normal-model.author.actual.json'),
  nativeHtmlPath: path.join(relativeOwn, 'native/thirteen.html'), nativePdfPath: path.join(relativeOwn, 'native/thirteen.pdf'),
  centralCurrentReportPath: centralPath, centralCurrentReportSha256: digest(fs.readFileSync(path.join(repo, centralPath))),
  selected13WholeTuples: parentJoin.selected13WholeTuples.map(refresh),
  directChangedContextNeighbours: parentJoin.directChangedContextNeighbours.map(refresh),
  wholeSourceDutyContextPath: path.join(relativeOwn, 'sources/selected13-whole-direct-source-duty-contexts.author.actual.json'),
  boundedHoldsPath: path.join(relativeOwn, 'sources/bounded-source-and-operator-holds.author.json'),
  newIndependentReview: false, newHumanApproval: false, newHumanTrial: false, strictGain: 0,
};
save(path.join(own, 'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json'), join);
console.log(`Current routing: ${JSON.stringify(atlas.receipt.counts)}. Neutral13+15 actual current tuples exported.`);
