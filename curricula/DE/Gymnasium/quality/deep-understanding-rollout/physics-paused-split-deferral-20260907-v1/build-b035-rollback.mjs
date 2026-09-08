// Read-only, field-leased inverse of the deferred B035 structural rollout.
// The caller owns any guarded application. This module never writes files.
import { readFileSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { pathToFileURL } from 'node:url';

const PLAN = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-035-quantum-models-particles-20-v1/physics100-quantum-consolidation-v1/field-leased-plan.json';
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const RETAIN = new Set([
  ...range(0, 6), // Hydrogen/Pauli text plus the independent Pauli prerequisite correction.
  21, 22, // Assessment probability-density correction, not the split coverage IDs.
  ...range(23, 28), ...range(49, 54), ...range(67, 71), // HE/BW/BY Pauli source corrections.
  72, 76, 79, // The corresponding durable generator corrections.
  97, 99, // BW LK direct Pauli placements.
  ...range(201, 204), 222, 223, // Existing individual A/M/K decisions for the retained text.
]);
const sha = s => 'sha256:' + createHash('sha256').update(s).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const state = value => value === undefined ? { state: 'missing' } : { state: 'value', value };

function location(doc, pointer) {
  assert(Array.isArray(pointer) && pointer.length > 0, 'Nonempty leased JSON path required');
  let parent = doc;
  function selected(array, selector) {
    assert(Array.isArray(array), 'Selector requires an array: ' + JSON.stringify(pointer));
    const matches = array.flatMap((row, i) => row && Object.entries(selector)
      .every(([key, value]) => isDeepStrictEqual(row[key], value)) ? [i] : []);
    assert(matches.length <= 1, 'Ambiguous selector: ' + JSON.stringify(selector));
    return matches[0];
  }
  for (const step of pointer.slice(0, -1)) {
    const key = typeof step === 'object' ? selected(parent, step) : step;
    assert(parent != null && key !== undefined && Object.hasOwn(parent, key),
      'Missing intermediate leased path: ' + JSON.stringify(pointer));
    parent = parent[key];
  }
  const last = pointer.at(-1);
  const key = typeof last === 'object' ? selected(parent, last) : last;
  const present = key !== undefined && Object.hasOwn(parent, key);
  return { parent, key: key === undefined ? parent.length : key,
    present, value: present ? parent[key] : undefined };
}

function put(doc, pointer, next) {
  const loc = location(doc, pointer);
  assert(next.state === 'value' || next.state === 'missing', 'Invalid lease state');
  if (next.state === 'missing') {
    if (loc.present && Array.isArray(loc.parent)) loc.parent.splice(loc.key, 1);
    else if (loc.present) delete loc.parent[loc.key];
  } else loc.parent[loc.key] = structuredClone(next.value);
}

export async function buildB035Rollback({ root, files = new Map() }) {
  assert(typeof root === 'string' && files instanceof Map, 'Expected root and optional staged Map');
  const stagedInput = new Map();
  for (const [path, text] of files) {
    const key = isAbsolute(path) ? relative(root, path) : path;
    assert(!key.startsWith('../') && !isAbsolute(key), 'Staged path outside root: ' + path);
    assert(!stagedInput.has(key) || stagedInput.get(key) === text, 'Conflicting staged aliases: ' + key);
    stagedInput.set(key, text);
  }
  const read = path => stagedInput.has(path) ? stagedInput.get(path) : readFileSync(resolve(root, path), 'utf8');
  const planText = read(PLAN);
  const plan = JSON.parse(planText);
  assert(sha(planText) === 'sha256:0dffad609831d7aa9d1c168c2bd21aaee63d0aca7d4856a8e1b28decc7d047fa',
    'Pinned B035 field-lease plan bytes changed');
  assert(plan.schemaVersion === 1 && plan.packageId === 'physics100-quantum-consolidation-v1'
    && plan.operations.length === 232, 'Unexpected B035 field-lease plan identity');
  const originals = new Map(), texts = new Map(), docs = new Map(), removedCurrentGoals = [];
  const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href);
  const get = path => {
    if (!originals.has(path)) {
      const text = read(path);
      assert(typeof text === 'string', 'Required B035 input is not a text file: ' + path);
      originals.set(path, text); texts.set(path, text);
    }
    return texts.get(path);
  };
  const getDoc = path => {
    if (!docs.has(path)) docs.set(path, path.endsWith('.jsonl')
      ? get(path).split('\n').filter(line => line.trim()).map(JSON.parse) : JSON.parse(get(path)));
    return docs.get(path);
  };
  const checkLease = (op, index, expected) => {
    if (op.kind === 'json-field') {
      const actual = state(location(getDoc(op.file), op.path).value);
      if ((index === 17 || index === 18) && actual.state === 'value' && expected.state === 'value') {
        // Root-authorized image additions on the two deferred new goals are
        // archived with their exact current objects. No semantic delta is allowed.
        const stripLinks = goal => { const copy = structuredClone(goal); delete copy.resourceLinks; return copy; };
        assert(isDeepStrictEqual(stripLinks(actual.value), stripLinks(expected.value)),
          'B035 new goal differs outside resourceLinks: operation ' + index);
        assert(fingerprintSemanticKindSourceGoal(actual.value) === fingerprintSemanticKindSourceGoal(expected.value),
          'B035 new goal native semantic fingerprint changed: operation ' + index);
        removedCurrentGoals.push({ goalId: actual.value.id, currentGoal: structuredClone(actual.value),
          currentObjectSha256: sha(JSON.stringify(actual.value)),
          nativeSemanticFingerprint: fingerprintSemanticKindSourceGoal(actual.value),
          additionalAllowedField: 'resourceLinks' });
        return;
      }
      assert(isDeepStrictEqual(actual, expected), 'B035 operation ' + index + ' after lease mismatch: '
        + op.file + ' ' + JSON.stringify(op.path));
    } else {
      assert(op.kind === 'text-span', 'Unknown B035 operation kind ' + op.kind);
      assert(typeof expected === 'string' && expected.length > 0, 'Nonempty text span required');
      const text = get(op.file), start = text.indexOf(expected);
      assert(start >= 0 && text.indexOf(expected, start + expected.length) < 0,
        'B035 operation ' + index + ' requires one exact text span: ' + op.file);
    }
  };
  // Check retained leases too: their preservation must be evidenced, not assumed.
  for (const index of RETAIN) checkLease(plan.operations[index], index, plan.operations[index].after);
  const invertedOperationIndexes = [];
  for (let index = plan.operations.length - 1; index >= 0; index--) {
    if (RETAIN.has(index)) continue;
    const op = plan.operations[index];
    checkLease(op, index, op.after);
    if (op.kind === 'json-field') put(getDoc(op.file), op.path, op.before);
    else texts.set(op.file, get(op.file).replace(op.after, () => op.before));
    invertedOperationIndexes.push(index);
  }

  // Retain the pre-split K decision, changing only its native source fingerprint
  // to bind restored coverage and the explicitly retained density correction.
  const canonicalPath = plan.operations[19].file;
  const canonical = getDoc(canonicalPath);
  const assessment = canonical.goals.find(goal => goal.id === plan.ids.quantumAssessment);
  assert(assessment, 'Missing restored quantum assessment');
  const kOp = plan.operations[227], kDoc = getDoc(kOp.file);
  const previousDecision = structuredClone(location(kDoc, kOp.path).value);
  assert(isDeepStrictEqual(previousDecision, kOp.before.value), 'Assessment K prior decision not restored');
  for (const index of [19, 20]) checkLease(plan.operations[index], index, plan.operations[index].before);
  for (const index of [21, 22]) checkLease(plan.operations[index], index, plan.operations[index].after);
  const nextDecision = { ...previousDecision, sourceFingerprint: fingerprintSemanticKindSourceGoal(assessment) };
  put(kDoc, kOp.path, { state: 'value', value: nextDecision });
  assert(isDeepStrictEqual(
    { ...previousDecision, sourceFingerprint: null }, { ...nextDecision, sourceFingerprint: null }),
  'Technical K binding must not alter kind, decision status, basis, or other decision fields');

  for (const index of RETAIN) checkLease(plan.operations[index], index, plan.operations[index].after);
  for (const id of [plan.ids.energy, plan.ids.probability]) {
    assert(!canonical.goals.some(goal => goal.id === id), 'Split goal was not removed: ' + id);
  }
  for (const [kind, count] of Object.entries(kDoc.counts)) {
    const actual = kind === 'total' ? kDoc.decisions.length : kDoc.decisions.filter(row => row.semanticKind === kind).length;
    assert(actual === count, 'Restored K count mismatch: ' + kind + ' actual ' + actual + ' expected ' + count);
  }
  for (const [path, doc] of docs) {
    // Keep exact untouched JSONL line bytes; restored rows append because the
    // original field leases store row identity but do not store insertion index.
    if (path.endsWith('.jsonl')) {
      const originalLines = originals.get(path).split('\n').filter(line => line.trim());
      const originalRows = originalLines.map(line => ({ line, row: JSON.parse(line) }));
      texts.set(path, doc.map(row => originalRows.find(old => isDeepStrictEqual(old.row, row))?.line
        ?? JSON.stringify(row)).join('\n') + '\n');
    } else texts.set(path, JSON.stringify(doc, null, 2) + '\n');
  }
  const outputFiles = [...texts].filter(([path, after]) => after !== originals.get(path))
    .map(([path, after]) => ({ path, before: originals.get(path), after }));
  return {
    files: outputFiles,
    receipt: {
      status: 'PAUSED_DEFERRED_CANDIDATE_NOT_APPLIED',
      sourcePlan: PLAN, sourcePlanSha256: sha(planText),
      retainedOperationIndexes: [...RETAIN].sort((a, b) => a - b),
      invertedOperationIndexes,
      removedGoalIds: [plan.ids.energy, plan.ids.probability],
      removedCurrentGoals,
      retainedCorrections: ['Hydrogen and Pauli descriptions', 'Pauli prerequisite operation 6',
        'Direct HE/BW/BY Pauli source and generator corrections', 'BW LK Pauli placement',
        'Existing hydrogen/Pauli A/M/K decisions', 'Assessment density task and solution correction'],
      assessmentTechnicalBinding: { goalId: assessment.id, nativeFunction: 'fingerprintSemanticKindSourceGoal',
        basis: 'Restored pre-split decision; only native source fingerprint binds restored coverage with retained density text',
        restoredDecision: previousDecision, emittedDecision: nextDecision, newSubjectApproval: false },
      restoredCounts: structuredClone(kDoc.counts),
      fileDigests: outputFiles.map(file => ({ path: file.path,
        beforeSha256: sha(file.before), afterSha256: sha(file.after) })),
      noOperativeWrites: true, noNewReviews: true,
      historicalDecisionsRestoredNotReapproved: [plan.ids.historicWell],
    },
  };
}
