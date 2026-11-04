import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const repo = process.cwd();
const out = dirname(fileURLToPath(import.meta.url));
const h = 'tmp/approach-review-20261101';
const v1 = `${h}/space-geometry-four-whole-forms-20261103-v1`;
const v2 = `${h}/space-geometry-four-whole-forms-20261103-v2-plane-cap-only/replacements`;
const input = `${h}/space-geometry-four-integration-preparation-20261103-v1/eight-exact-am-row-bindings.actual.json`;
const load = p => JSON.parse(readFileSync(resolve(repo, p), 'utf8'));
const sha = p => createHash('sha256').update(readFileSync(resolve(repo, p))).digest('hex');
assert.equal(sha(input), '10a2fc12ff7efed67bf18098053eb8e94e2748989cd1b7246e73b465e5a327da');
const binding = load(input);
const ts = createRequire(resolve(repo, 'app/package.json'))('typescript');

function readExactFingerprintFunction(path) {
  const source = readFileSync(resolve(repo, path), 'utf8');
  const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const names = new Set(['normalizeText', 'stableJson', 'getSemanticPayload', 'fingerprintGoal']);
  const parts = ast.statements.filter(s => ts.isFunctionDeclaration(s) && names.has(s.name?.text));
  assert(parts.some(s => s.name.text === 'fingerprintGoal'));
  const code = ts.transpileModule(parts.map(s => s.getFullText(ast)).join('\n'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  let payload;
  const captureHash = algorithm => {
    const hash = createHash(algorithm);
    const wrapper = {
      update(text) { payload = JSON.parse(text); hash.update(text); return wrapper; },
      digest(encoding) { return hash.digest(encoding); },
    };
    return wrapper;
  };
  const fingerprint = new Function('createHash', `${code}\nreturn fingerprintGoal;`)(captureHash);
  return (goal, rule) => {
    const result = fingerprint(goal, rule);
    return { fingerprint: result, semanticPayload: payload };
  };
}

const rows = [];
for (const row of binding.currentConfigRows) {
  for (const entry of [row.registeredConfig, row.registeredReview, row.actualReader]) {
    assert.equal(sha(entry.path), entry.sha256);
  }
  const cfg = load(row.registeredConfig.path);
  assert.equal(cfg.reviewPath, row.registeredReview.path);
  const raw = readFileSync(resolve(repo, cfg.reviewPath), 'utf8').trimEnd().split(/\r?\n/);
  assert.equal(raw.length, 807);
  assert.equal(raw[row.lineNumber - 1], row.originalRawLine);
  assert.deepEqual(JSON.parse(raw[row.lineNumber - 1]), row.originalWholeRow);
  const oldPath = `${v1}/${row.goalId}/current-whole-goal.json`;
  const proposedPath = row.goalId.startsWith('fd4b7145')
    ? `${v2}/${row.goalId}/proposed-whole-goal.draft.json`
    : `${v1}/${row.goalId}/proposed-whole-goal.draft.json`;
  const oldGoal = load(oldPath), proposedGoal = load(proposedPath);
  const calc = readExactFingerprintFunction(row.actualReader.path);
  const before = calc(oldGoal, cfg.ruleVersion);
  const after = calc(proposedGoal, cfg.ruleVersion);
  assert.equal(before.fingerprint, row.beforeFingerprint);
  assert.equal(before.fingerprint, row.originalWholeRow.fingerprint);
  assert.equal(after.fingerprint, row.afterNodeKindExamFingerprint);
  const keys = Object.keys(before.semanticPayload).filter(k =>
    JSON.stringify(before.semanticPayload[k]) !== JSON.stringify(after.semanticPayload[k]));
  assert.deepEqual(keys, ['nodeKind']);
  assert.equal(before.semanticPayload.nodeKind, '');
  assert.equal(after.semanticPayload.nodeKind, 'exam');
  rows.push({
    lane: row.lane, goalId: row.goalId, lineNumber: row.lineNumber,
    originalRowBinding: row,
    originalWholeGoal: { path: oldPath, sha256: sha(oldPath) },
    reviewedWholeGoal: { path: proposedPath, sha256: sha(proposedPath) },
    independentlyComputedBefore: before,
    independentlyComputedAfter: after,
    changedSemanticPayloadFields: keys,
  });
}
const result = {
  status: 'EIGHT_INPUT_BINDINGS_INDEPENDENTLY_VERIFIED_NOT_A_SEMANTIC_VERDICT',
  preparation: { path: input, sha256: sha(input) },
  execution: 'Actual current reader function declarations selected with the TypeScript AST and executed without invoking reader main or any write mode.',
  rows,
};
writeFileSync(resolve(out, 'am-binding-verification.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ checkedRows: rows.length, currentFingerprintsMatched: 8,
  proposedFingerprintsMatched: 8, onlyChangedSemanticPayloadField: 'nodeKind',
  output: relative(repo, resolve(out, 'am-binding-verification.json')) }, null, 2));
