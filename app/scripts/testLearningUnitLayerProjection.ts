// SPDX-License-Identifier: Apache-2.0
// Conformance of the learning-unit layer projection that prerequisite-reduction proofs
// fingerprint. Each implementation is checked against the same committed references:
// TypeScript here (app/scripts/learningUnitLayerProjection.ts), Python in
// scripts/test_prerequisite_reduction_semantic_kind.py (scripts/curriculum_learning_units.py
// via scripts/prerequisite_reduction_semantic_kind.py) and Java in the backend
// (LearningUnitLayerProjectionConformanceTest).
//
// Usage: tsx scripts/testLearningUnitLayerProjection.ts [--write]
// --write regenerates the committed reference fingerprints after TypeScript and Python agree.
// Only --write starts Python; it needs scripts/curriculum_package_validation_requirements.txt,
// which the job that runs this test as part of test:transitive-minimality does not install.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  LearningUnitProjectionError, hasLearningUnitLayer, projectOutLearningUnits, sha256WithoutLearningUnitLayer,
} from './learningUnitLayerProjection'
import { PREREQUISITE_REDUCTION_REGISTRY_PATH, fingerprintPrerequisiteReductionDocument } from './prerequisiteReductionProof'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export const PROJECTION_CONFORMANCE_PATH = 'app/scripts/fixtures/learning-unit-layer-projection-conformance.json'
type Json = Record<string, unknown>
type Outcome = { fingerprint: string } | { error: true }
type Reference = { case: string; index: number; landscapeId: unknown } & Outcome
interface Conformance {
  schemaVersion: 1
  purpose: string
  casesPath: string
  casesSha256: string
  references: Reference[]
  canonicalMathematics: { path: string; landscapeId: string; pilotUnit: Json; pilotPlacements: Json[] }
}

const read = (path: string) => readFileSync(resolve(root, path))
const sha256 = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex')
const conformance = JSON.parse(read(PROJECTION_CONFORMANCE_PATH).toString('utf8')) as Conformance
const casesBytes = read(conformance.casesPath)
const cases = (JSON.parse(casesBytes.toString('utf8')) as { cases: Array<{ id: string; landscapes: unknown[] }> }).cases

function typescriptOutcome(landscape: unknown): Outcome {
  try {
    return { fingerprint: fingerprintPrerequisiteReductionDocument(landscape) }
  } catch (error) {
    if (error instanceof LearningUnitProjectionError) return { error: true }
    throw error
  }
}

/** The Python implementation, run as the package build runs it. */
function pythonOutcomes(landscapes: unknown[]): Outcome[] {
  const program = [
    'import json, sys',
    'import curriculum_learning_units as lu',
    'import prerequisite_reduction_semantic_kind as bridge',
    'result = []',
    'for landscape in json.load(sys.stdin):',
    '    try:',
    '        result.append({"fingerprint": bridge.fingerprint_prerequisite_reduction_document(landscape)})',
    '    except lu.LearningUnitError:',
    '        result.append({"error": True})',
    'json.dump(result, sys.stdout)',
  ].join('\n')
  const completed = spawnSync('python3', ['-B', '-c', program], {
    cwd: resolve(root, 'scripts'), input: JSON.stringify(landscapes), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  })
  assert.equal(completed.status, 0, `Python projection failed: ${completed.stderr}`)
  return JSON.parse(completed.stdout) as Outcome[]
}

function canonicalMathematicsWithPilot(): { document: Json; injected: boolean } {
  const { path, pilotUnit, pilotPlacements } = conformance.canonicalMathematics
  const document = JSON.parse(read(path).toString('utf8')) as Json
  if (hasLearningUnitLayer(document)) return { document, injected: false }
  const withPilot = structuredClone(document)
  ;(withPilot.programUnits as Json[]).push(structuredClone(pilotUnit))
  ;(withPilot.goalPlacements as Json[]).push(...structuredClone(pilotPlacements))
  return { document: withPilot, injected: true }
}

function projectionBehaviour() {
  const plain: Json = {
    landscapeId: 'L', title: 'T', goals: [{ id: 'a', requires: [] }], programUnits: [{ id: 'p', kind: 'program', label: 'P' }],
    goalPlacements: [{ goalId: 'a', unitId: 'p', relation: 'primary', context: { stage: 'SekI' } }],
  }
  assert.equal(hasLearningUnitLayer(plain), false)
  assert.deepEqual(projectOutLearningUnits(plain), plain, 'identity without a learning-unit layer')
  assert.equal(fingerprintPrerequisiteReductionDocument(plain),
    `sha256:${sha256('{"goalPlacements":[{"context":{"stage":"SekI"},"goalId":"a","relation":"primary","unitId":"p"}],"goals":[{"id":"a","requires":[]}],"landscapeId":"L","programUnits":[{"id":"p","kind":"program","label":"P"}],"title":"T"}')}`,
    'stable JSON of the unchanged document')
  const unit = { id: 'u', kind: 'learningUnit', label: 'U', labelEn: 'U', promise: 'P', promiseEn: 'P', revision: '2026-11-12-v1',
    coverageReviews: [{ assessmentGoalId: 'a' }] }
  const layered: Json = structuredClone(plain)
  ;(layered.programUnits as Json[]).push(unit)
  ;(layered.goalPlacements as Json[]).push({ goalId: 'a', unitId: 'u', relation: 'own' },
    { goalId: 'a', unitId: 'u', relation: 'primary' }, { goalId: 'a', unitId: 'elsewhere', relation: 'own' })
  layered.learningUnitCoverage = 'partial'
  const before = JSON.stringify(layered)
  assert.deepEqual(projectOutLearningUnits(layered), plain, 'units, own placements, placements towards a unit and the claim leave')
  assert.equal(JSON.stringify(layered), before, 'the input is not modified')
  assert.equal(fingerprintPrerequisiteReductionDocument(layered), fingerprintPrerequisiteReductionDocument(plain))
  const onlyLayer: Json = { landscapeId: 'L', goals: [], programUnits: [unit], goalPlacements: [{ goalId: 'a', unitId: 'u', relation: 'own' }] }
  assert.deepEqual(projectOutLearningUnits(onlyLayer), { landscapeId: 'L', goals: [] }, 'lists that existed only for units leave')
  const emptyLists: Json = { landscapeId: 'L', goals: [], programUnits: [], goalPlacements: [] }
  assert.deepEqual(projectOutLearningUnits(emptyLists), emptyLists, 'authored empty lists stay')
  assert.throws(() => projectOutLearningUnits({ ...onlyLayer, programUnits: [unit, { id: 'y', kind: 'year', label: 'Y', parentUnitId: 'u' }] }),
    LearningUnitProjectionError, 'a calendar unit below a learning unit cannot be projected')
  assert.throws(() => projectOutLearningUnits({ landscapeId: 'L', programUnits: [{ ...unit, id: 7 }] }), LearningUnitProjectionError)
  const list = [1, 2]
  assert.equal(projectOutLearningUnits(list), list, 'non-object values pass unchanged')
}

function rawPinBehaviour(math: Json, injected: boolean) {
  const { path } = conformance.canonicalMathematics
  const committed = read(path)
  const serialize = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
  const withLayer = injected ? serialize(math) : committed
  const without = injected ? committed : serialize(projectOutLearningUnits(math))
  assert.equal(sha256WithoutLearningUnitLayer(without), sha256(without), 'without a layer the pin is the raw file hash')
  assert.equal(sha256WithoutLearningUnitLayer(withLayer), sha256(without), 'a unit edit does not move the raw-file pin')
  const reformatted = Buffer.from(JSON.stringify(math))
  assert.throws(() => sha256WithoutLearningUnitLayer(reformatted), LearningUnitProjectionError,
    'a layered file outside the repository serialization fails closed')
  const goalEdit = structuredClone(math) as { goals: Json[] }
  goalEdit.goals[0].title = `${String(goalEdit.goals[0].title)} (changed)`
  assert.notEqual(sha256WithoutLearningUnitLayer(serialize(goalEdit)), sha256(without), 'a goal edit moves the pin')
}

function main() {
  const write = process.argv.includes('--write')
  projectionBehaviour()
  const inputs = cases.flatMap(entry => entry.landscapes.map((landscape, index) => ({ case: entry.id, index, landscape })))
  const typescript = inputs.map(({ landscape }) => typescriptOutcome(landscape))
  const { document: math, injected } = canonicalMathematicsWithPilot()
  // New references are written only after the package build's Python agrees. The check
  // compares TypeScript with the committed references; Python checks the same references
  // in its own test, so this test needs no Python packages.
  const python = write ? pythonOutcomes([...inputs.map(({ landscape }) => landscape), math]) : undefined
  const pythonMath = python?.pop()
  if (python)
    assert.deepEqual(typescript, python, 'TypeScript and Python project and fingerprint every fixture landscape identically')
  const references: Reference[] = inputs.map(({ case: id, index, landscape }, position) => ({
    case: id, index, landscapeId: (landscape as Json)?.landscapeId ?? null, ...typescript[position],
  }))
  const casesSha256 = sha256(casesBytes)
  if (write) {
    writeFileSync(resolve(root, PROJECTION_CONFORMANCE_PATH), `${JSON.stringify({ ...conformance, casesSha256, references }, null, 2)}\n`)
    console.log(`Wrote ${PROJECTION_CONFORMANCE_PATH}: ${references.length} reference fingerprints`)
  } else {
    assert.equal(conformance.casesSha256, casesSha256,
      `${conformance.casesPath} changed; regenerate with: npx tsx scripts/testLearningUnitLayerProjection.ts --write`)
    assert.deepEqual(references, conformance.references, 'committed reference fingerprints (shared with the Java test)')
  }

  // Canonical Mathematics with the pilot unit fingerprints exactly as the registry binds it.
  const registry = JSON.parse(read(PREREQUISITE_REDUCTION_REGISTRY_PATH).toString('utf8')) as {
    catalogSources: Array<{ path: string; landscapeId: string; currentDocumentDigest: string }> }
  const binding = registry.catalogSources.find(source => source.path === conformance.canonicalMathematics.path)
  assert.ok(binding && binding.landscapeId === conformance.canonicalMathematics.landscapeId)
  assert.ok(hasLearningUnitLayer(math))
  const mathFingerprint = fingerprintPrerequisiteReductionDocument(math)
  assert.equal(mathFingerprint, binding.currentDocumentDigest, 'Mathematics with its learning unit keeps the registry binding')
  if (python)
    assert.deepEqual(pythonMath, { fingerprint: mathFingerprint }, 'Python agrees on Mathematics with its learning unit')
  rawPinBehaviour(math, injected)
  const errors = references.filter(reference => 'error' in reference).length
  console.log(`Learning-unit layer projection conformance passed: ${references.length} fixture landscapes (${errors} unprojectable), `
    + `TypeScript = ${python ? 'Python = ' : ''}reference; Mathematics with ${injected ? 'an injected' : 'its'} pilot unit = registry ${mathFingerprint}.`)
}

main()
