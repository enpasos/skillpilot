import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

// Version-local mechanical reuse only. Human/AI observations are authored in
// reuse-notes.json; native P fingerprints/statuses are NOT produced here.
const base = dirname(fileURLToPath(import.meta.url));
const root = resolve(base, '../../../../../..');
const oldBase = resolve(base, '../m7-statistics-next20-20260920-v1');
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const hash = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const repoPath = path => relative(root, path).replaceAll('\\', '/');
const binding = path => ({ path: repoPath(path), sha256: hash(readFileSync(path)) });
const notes = read(resolve(base, 'reuse-notes.json'));
const oldConfig = read(resolve(oldBase, 'positive-evidence.config.json'));
const oldCandidates = read(resolve(oldBase, 'positive-evidence.candidates.json'));
const oldScope = read(resolve(oldBase, 'scope.candidate.json'));
const oldReviews = readFileSync(resolve(oldBase, 'positive-evidence.review.jsonl'), 'utf8')
  .trim().split('\n').map(line => JSON.parse(line));
const oldKeep = read(resolve(oldBase, 'root-keep-eight.review.json'));
const oldVisual = read(resolve(oldBase, 'visualization.candidate-review.json'));
const oldSource = read(resolve(oldBase, 'confidence-diagram-source-audit.receipt.json'));
const landscape = read(resolve(root, oldConfig.landscapePath));
const byId = new Map(landscape.goals.map(goal => [goal.id, goal]));
const kinds = new Map(read(resolve(root, oldConfig.semanticKindLedgerPath)).decisions
  .map(decision => [decision.goalId, decision]));
const batchPath = resolve(root, notes.descriptionBatchPath);
const batchManifest = read(resolve(batchPath, 'batch-manifest.json'));
const book = read(resolve(batchPath, 'bundle/book-model.json'));
const pages = new Map(book.pages.map(page => [page.goalId, page]));
const orderedIds = oldConfig.scope.goalIds;
for (const ids of [notes.goals, oldCandidates.goals, oldScope.goals, oldReviews]) {
  assert.deepEqual(ids.map(goal => goal.goalId), orderedIds);
}
assert.deepEqual(batchManifest.goalIds, orderedIds);
assert.equal(orderedIds.length, 20);
assert.equal(book.digest, batchManifest.artifacts.bookModelDigest);
assert.equal(notes.status, 'ai_candidate');
assert.equal(notes.humanApproved, false);

const sourceReuse = [
  [oldSource.bindings.sourceExtractionPath, oldSource.bindings.sourceExtractionSha256],
  [oldSource.bindings.mappingPath, oldSource.bindings.mappingFileSha256],
  [oldSource.compositionCheck.lkView, oldSource.compositionCheck.lkViewSha256],
  [oldSource.compositionCheck.gkView, oldSource.compositionCheck.gkViewSha256],
].map(([path, digest]) => {
  const current = binding(resolve(root, path));
  assert.equal(current.sha256, `sha256:${digest}`, `source reuse is stale: ${path}`);
  return { ...current, unchanged: true };
});

const records = orderedIds.map((goalId, index) => {
  const goal = byId.get(goalId);
  const previous = oldScope.goals[index];
  const note = notes.goals[index];
  const page = pages.get(goalId);
  const changedFields = [...new Set([...Object.keys(previous.goal), ...Object.keys(goal)])]
    .filter(key => JSON.stringify(previous.goal[key]) !== JSON.stringify(goal[key]));
  const delta = note.imageReview === 'changed_image_delta';
  assert.deepEqual(changedFields, delta ? ['resourceLinks'] : [], `unexpected semantic change: ${goalId}`);
  assert.equal(kinds.get(goalId).semanticKind, 'curricularAtomic');
  assert.equal(kinds.get(goalId).decisionStatus, 'authoritative');
  for (const prerequisite of previous.requires) {
    const current = byId.get(prerequisite.id);
    for (const key of Object.keys(prerequisite)) assert.deepEqual(current[key], prerequisite[key]);
  }
  assert.deepEqual(landscape.goals.filter(candidate => candidate.requires?.includes(goalId))
    .map(candidate => ({ id: candidate.id, title: candidate.title })), previous.reverseRequires);
  assert.equal(page.title, goal.title);
  assert.equal(page.description, goal.description);
  assert.deepEqual([...page.requires, ...page.externalPrerequisites].map(item => item.goalId).sort(), [...goal.requires].sort());
  const visual = goal.resourceLinks.find(link => link.type === 'goal-visualization');
  assert.equal(page.visualization.url, visual.url);
  const raster = binding(resolve(root, `app/public${visual.url}`));
  assert.equal(raster.sha256, page.visualization.originalDigest);
  if (delta) {
    assert.notEqual(raster.sha256, previous.assetSha256);
    assert.match(raster.path, /\.png$/);
    assert.ok(note.observation.length > 100);
    assert.ok(oldCandidates.goals[index].dissent.length > 0);
  } else {
    const keep = oldKeep.records.find(record => record.goalId === goalId);
    const author = oldVisual.goals.find(record => record.goalId === goalId);
    assert.equal(raster.sha256, previous.assetSha256);
    assert.equal(raster.sha256, keep.assetSha256);
    assert.equal(raster.sha256, author.assetSha256);
    assert.equal(hash(JSON.stringify(goal)), keep.goalSnapshotSha256);
    assert.equal(keep.decision, 'accept_current_asset');
    assert.equal(keep.inspected, true);
    assert.equal(author.inspected, true);
    assert.deepEqual(oldCandidates.goals[index].dissent, []);
  }
  assert.equal(oldCandidates.goals[index].profile.applicationCaseBriefs.length, 2);
  return {
    goalId, title: goal.title, imageReview: note.imageReview,
    semanticAuthorTextUnchanged: true, authorProfileUnchanged: true,
    directPrerequisiteContextUnchanged: true, reverseRequiresContextUnchanged: true,
    changedCanonicalFields: changedFields,
    previousAsset: { path: previous.assetPath, sha256: previous.assetSha256 },
    currentAsset: raster,
    currentPage: {
      pageNumber: page.pageNumber, physicalPdfPage: page.pageNumber + 2,
      goalFingerprint: page.goalFingerprint, pageFingerprint: page.pageFingerprint,
      contextJsonSha256: hash(JSON.stringify({
        breadcrumbs: page.breadcrumbs, applicability: page.applicability,
        requires: page.requires, externalPrerequisites: page.externalPrerequisites,
        reverseRequires: page.reverseRequires, externalReverseRequires: page.externalReverseRequires,
      })),
      actualRasterAndPdfPageViewedThisPass: delta,
    },
    originalPProfileFingerprint: oldReviews[index].profileFingerprint,
    exactAuthorProfileJsonSha256: hash(JSON.stringify(oldCandidates.goals[index].profile)),
    profileCheck: note.profileCheck,
    imageAndPageObservation: note.observation ?? 'Unchanged valid two-pass KEEP reused; no new visual inspection claimed.',
    resolvedHistoricalDissent: delta ? oldCandidates.goals[index].dissent : [],
    resolutionEvidence: delta && goalId === oldSource.goalId
      ? 'Actual scalar p/h_n replacement inspection plus unchanged historical source-audit bindings.'
      : delta ? 'Actual current raster and corresponding PDF page inspected; concrete observation above.' : null,
  };
});
assert.equal(records.filter(record => record.imageReview === 'changed_image_delta').length, 12);
assert.equal(records.filter(record => record.imageReview === 'unchanged_keep_reuse').length, 8);

const candidates = {
  ...oldCandidates, reviewId: notes.reviewId, reviewedAt: notes.reviewedAt,
  reviewer: notes.reviewer,
  goals: oldCandidates.goals.map((goal, index) => ({
    ...goal,
    reason: `${goal.reason} Reuse/Delta 2026-09-21: ${notes.goals[index].profileCheck} Unveränderter Autorentext; aktuelle Bild-/Kontextbindung geprüft bzw. gültiges KEEP wiederverwendet. Keine Freigabe.`,
    dissent: [],
  })),
};
const config = {
  ...oldConfig, reviewId: notes.reviewId,
  reviewPath: repoPath(resolve(base, 'positive-evidence.review.jsonl')),
  scope: { ...oldConfig.scope, label: 'Statistics next20: unchanged bilingual P author profiles, twelve current-image/context deltas and eight valid KEEP reuses; AI candidates only' },
};

// Reuse only the audited arithmetic section. Its obsolete full-snapshot and
// registry assumptions are deliberately not executed or carried forward.
const arithmeticPath = resolve(oldBase, 'verify-author-arithmetic.mjs');
const arithmeticSource = readFileSync(arithmeticPath, 'utf8');
assert.equal(hash(arithmeticSource), 'sha256:81e05d51eb4df3893b8481c57fe359d7799aa7cef10daf203662af36fa1e2c18');
const start = arithmeticSource.indexOf('const close =');
const end = arithmeticSource.indexOf('console.log(JSON.stringify({', start);
assert.ok(start > 0 && end > start);
const caseChecks = runInNewContext(`${arithmeticSource.slice(start, end)}\nresults;`, { assert, candidates });
assert.equal(caseChecks.length, 40);
// Also verify the actual numerical claims that changed in the PNG corrections.
const choose = (n, k) => { let value = 1; for (let i = 1; i <= k; i++) value *= (n-i+1)/i; return value; };
const pmf = (n, p, k) => choose(n,k)*p**k*(1-p)**(n-k);
const beta = Array.from({length:5}, (_,k) => pmf(20,.25,k)).reduce((a,b) => a+b,0);
const alpha = Array.from({length:16}, (_,i) => pmf(20,.1,i+5)).reduce((a,b) => a+b,0);
assert.equal(beta.toFixed(3), '0.415');
assert.equal(alpha.toFixed(3), '0.043');
assert.ok(pmf(20,.1,2) > pmf(20,.1,1));
assert.equal((2+3+3+4+8)/5, 4);
assert.equal(8+6+7+3, 24);
assert.equal((4+5+5+6+10)/5, 6);
assert.equal((6-4)+(6-5)+(6-5), 10-6);

const report = {
  schemaVersion: 1, reviewId: notes.reviewId, reviewedAt: notes.reviewedAt,
  reviewer: notes.reviewer, status: 'ai_candidate', humanApproved: false,
  method: notes.method,
  outcome: { unchangedProfiles: 20, retainedConcreteCases: 40, currentImageDeltaInspections: 12, validKeepReuses: 8, newSubstantiveProfileCompletions: 0, humanApprovals: 0, descriptionReviewsPerformed: 0 },
  inputs: ['positive-evidence.candidates.json', 'positive-evidence.review.jsonl', 'scope.candidate.json', 'visualization.candidate-review.json', 'root-keep-eight.review.json', 'confidence-diagram-source-audit.receipt.json']
    .map(name => binding(resolve(oldBase, name))),
  nativeDescriptionPreparation: {
    configPath: batchManifest.configPath, batchManifest: binding(resolve(batchPath, 'batch-manifest.json')),
    model: binding(resolve(batchPath, 'bundle/book-model.json')),
    modelDigest: book.digest, bundleFingerprint: batchManifest.artifacts.bundleFingerprint,
    pdf: binding(resolve(batchPath, 'bundle/book.pdf')),
    descriptionReviewBoundary: 'Preparation and P context inspection only; independent D reviews and integration remain outside this artifact.',
  },
  reusedSourceAudit: { receipt: binding(resolve(oldBase, 'confidence-diagram-source-audit.receipt.json')), unchangedSourceFiles: sourceReuse, officialPdfViewedThisPass: false },
  arithmeticVerification: { reusedSource: binding(arithmeticPath), caseChecks, changedImageNumbers: { alpha, beta, betaRounded: beta.toFixed(3), alphaRounded: alpha.toFixed(3), result: 'passed' }, boundary: 'Arithmetic and finite consistency only, not learner execution, review approval or whole-curriculum validation.' },
  outOfScopeObservations: notes.outOfScopeObservations,
  records,
  completionBoundary: 'Native P materializer must generate current fingerprints with needs_human_review/ai_candidate. No D decisions, central registry/ledger edits, canonical edits, global report/build, human approval or M7 closure is performed or claimed.',
};
const outputs = {
  'positive-evidence.config.json': config,
  'positive-evidence.candidates.json': candidates,
  'reuse-delta-review.receipt.json': report,
};
for (const [name, value] of Object.entries(outputs)) {
  const path = resolve(base, name);
  const bytes = `${JSON.stringify(value, null, 2)}\n`;
  if (existsSync(path)) assert.equal(readFileSync(path, 'utf8'), bytes, `refusing to overwrite changed versioned artifact: ${path}`);
  else {
    assert.ok(process.argv.includes('--write'), `missing ${path}; use --write once`);
    writeFileSync(path, bytes, { flag: 'wx' });
  }
}
const nativePath = resolve(base, 'positive-evidence.review.jsonl');
if (existsSync(nativePath)) {
  const native = readFileSync(nativePath, 'utf8').trim().split('\n').map(line => JSON.parse(line));
  assert.deepEqual(native.map(record => record.goalId), orderedIds);
  for (const [index, record] of native.entries()) {
    assert.equal(record.status, 'needs_human_review');
    assert.equal(record.reviewAuthority, 'ai_candidate');
    assert.equal(record.evidenceLevel, 'E1');
    assert.equal(record.maximumClaimScope, 'G1');
    assert.deepEqual(record.profile, oldCandidates.goals[index].profile);
    assert.equal(record.profileFingerprint, oldReviews[index].profileFingerprint);
    assert.equal(record.goalFingerprint, oldReviews[index].goalFingerprint);
    if (records[index].imageReview === 'unchanged_keep_reuse') assert.equal(record.reviewInputFingerprint, oldReviews[index].reviewInputFingerprint);
    else assert.notEqual(record.reviewInputFingerprint, oldReviews[index].reviewInputFingerprint);
  }
}
console.log(JSON.stringify({ result: 'passed', profilesPreserved: 20, caseChecks: caseChecks.length, inspectedImagePageDeltas: 12, reusedKeep: 8, nativeRecordsPresent: existsSync(nativePath), approvalGranted: false }, null, 2));
