import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const require = createRequire(resolve('app/package.json'));
const ts = require('typescript');
const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(resolve('app/scripts/goalBookModel.ts')).href);
const paths = {
  before: 'tmp/math-m7-before-seven-holds-20260921.json',
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  atomic: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  kind: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
};
const prefixes = ['efc3506a','f84ea3d8','01217f4a','a288231e','f14e1643','78bfbde4','77d607e0','1e164a09'];
const textPrefixes = ['f84ea3d8','78bfbde4','77d607e0'];
const sha = (value) => 'sha256:' + createHash('sha256').update(value).digest('hex');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const lines = (p) => readFileSync(p, 'utf8').trimEnd().split('\n');
const before = json(paths.before), canonical = json(paths.canonical), kind = json(paths.kind);
const rawA = lines(paths.atomic), rawM = lines(paths.memory);
const recordsA = rawA.map(JSON.parse), recordsM = rawM.map(JSON.parse);

// Execute the native fingerprint functions from the current tool source, not
// a separately reimplemented payload or the write-fingerprints command.
function nativeFingerprint(sourcePath, nextFunction) {
  const source = readFileSync(sourcePath, 'utf8');
  const start = source.indexOf('function normalizeText(');
  const end = source.indexOf('\nfunction ' + nextFunction + '(');
  assert(start >= 0 && end > start);
  const fragment = source.slice(start, end);
  assert(fragment.includes('function fingerprintGoal('));
  const js = ts.transpile(fragment);
  return { sourcePath, sourceSha256: sha(source), fingerprint: Function('createHash', js + '\nreturn fingerprintGoal;')(createHash) };
}
const nativeA = nativeFingerprint('app/scripts/semanticAtomicityReview.ts', 'isLeaf');
const nativeM = nativeFingerprint('app/scripts/memoryCardReview.ts', 'fingerprintMemoryCard');
const rows = prefixes.map(prefix => {
  const matches = canonical.goals.filter(g => g.id.startsWith(prefix)); assert.equal(matches.length, 1);
  const after = matches[0], prior = before.goals.find(g => g.id === after.id);
  assert(prior);
  const atomicRecord = recordsA.find(r => r.goalId === after.id), memoryRecord = recordsM.find(r => r.goalId === after.id), kindRecord = kind.decisions.find(r => r.goalId === after.id);
  assert(atomicRecord && memoryRecord && kindRecord);
  return {
    goalId: after.id, textChanged: textPrefixes.includes(prefix),
    atomicBefore: nativeA.fingerprint(prior, atomicRecord.ruleVersion), atomicAfter: nativeA.fingerprint(after, atomicRecord.ruleVersion),
    memoryBefore: nativeM.fingerprint(prior, memoryRecord.ruleVersion), memoryAfter: nativeM.fingerprint(after, memoryRecord.ruleVersion),
    kindBefore: fingerprintSemanticKindSourceGoal(prior), kindAfter: fingerprintSemanticKindSourceGoal(after),
    atomicRecord, memoryRecord, kindRecord,
    atomicRawLine: rawA.find(line => JSON.parse(line).goalId === after.id),
    memoryRawLine: rawM.find(line => JSON.parse(line).goalId === after.id),
  };
});
const untouchedLineHash = (all) => sha(all.filter(line => !textPrefixes.some(prefix => JSON.parse(line).goalId.startsWith(prefix))).join('\n') + '\n');
const output = {
  paths,
  nativeGenerators: [nativeA, nativeM].map(({sourcePath,sourceSha256}) => ({sourcePath,sourceSha256})),
  canonicalSha256: sha(readFileSync(paths.canonical)),
  beforeCanonicalSha256: sha(readFileSync(paths.before)),
  atomicUnselectedLinesSha256: untouchedLineHash(rawA),
  memoryUnselectedLinesSha256: untouchedLineHash(rawM),
  counts: kind.counts,
  rows,
};
if (process.argv.includes('--check')) {
  const receiptPath = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-21/m7-proof-statistics-hold-repairs-v1/am-semantic-kind-review.json';
  const receipt = json(receiptPath);
  assert.deepEqual(kind.counts, receipt.countsBefore);
  assert.equal(output.atomicUnselectedLinesSha256, receipt.atomicUnselectedLinesSha256);
  assert.equal(output.memoryUnselectedLinesSha256, receipt.memoryUnselectedLinesSha256);
  for (const row of rows) {
    assert.equal(row.atomicRecord.fingerprint, row.atomicAfter);
    assert.equal(row.memoryRecord.fingerprint, row.memoryAfter);
    assert.equal(row.kindRecord.sourceFingerprint, row.kindAfter);
    assert.equal(row.kindRecord.semanticKind, 'curricularAtomic');
    assert.equal(row.atomicRecord.status, 'atomic');
    assert.equal(row.memoryRecord.status, 'no_memory_needed');
    const reviewed = receipt.records.find(r => r.goalId === row.goalId);
    assert.deepEqual(canonical.goals.find(g => g.id === row.goalId), reviewed.afterGoal);
  }
  console.log(JSON.stringify({status:'pass',checkedGoals:rows.length,atomicUpdates:3,memoryUpdates:3,semanticKindUpdates:7,counts:kind.counts,unselectedAtomicMemoryLinesUnchanged:true}));
} else console.log(JSON.stringify(output));

