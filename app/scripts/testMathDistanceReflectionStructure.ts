import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../src/utils/authoring/compositionViewAuthoring'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
type MappingEdge = { legacyGoalId: string; canonicalGoalId: string; matchType?: string }
type ExamData = { coveredGoalIds: string[] }
const landscape = normalizeCanonicalLandscape(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'))
const byId = new Map(landscape.goals.map(goal => [goal.id, goal]))
const legacy = '0a846521-edcc-5c3c-a844-eac061e053ce'
const lot = 'c2c49659-5917-5be5-a3bd-e46f1b17126f'
const point = '68d4faef-1a56-5898-9c31-80b7d5d2e430'
const pointLine = '3256476b-ec65-4038-9f5a-a8808fbcf207'
const pointPlane = '79c4cd21-af64-5925-968e-9bc1f74cd0ad'
const lineLine = '509ae03b-96b1-4bb1-b015-b83d14569dae'
const parallelObjects = '8eb14d81-353a-4909-9464-61be7b1ba5b8'
const trio = ['fcd1d180-ddce-5408-8c5d-70e417b179e7', 'a97c7cce-1343-5d04-926f-4a4f323b3c21', '985d5529-a586-50eb-bd7f-2db2be8906d1']
const bwLine = '976def9e-c81c-5875-9d87-a1024318ce48'
const heExam = 'a7896fa5-993e-52b9-8aa4-10420b35bfd9'
const bwExam = '440edf01-1824-597a-9afa-2f23f5becfba'
const ownedGoalIds = new Set([legacy, lot, ...trio, bwLine, heExam, bwExam, '1e77bb2f-0cd6-5961-b0fb-230317c73fce', '288633c1-f61c-5b48-af7e-a80357f96cad', '944dd479-9f30-5acb-ab32-3ea0b6dc8e06', 'c71ae268-f28e-59f0-982d-91db8f963378', 'e8237315-654e-5150-97de-49c4cb49b3d1', '2f2c9f1a-07f0-59e4-b84a-60648c3b0bda'])
// The separate validate:graph command owns whole-landscape validation.
assert.deepEqual(validateCanonicalLandscape(landscape).filter(finding => finding.severity === 'error' && ownedGoalIds.has(finding.goalId ?? '')), [])
assert.equal(byId.get(legacy)?.extendedData?.compatibilityOnly, true)
assert.equal(byId.get(legacy)?.extendedData?.applicabilityProjection, 'excluded')
assert.deepEqual(new Set(byId.get(lot)?.contains), new Set([pointLine, pointPlane, lineLine, parallelObjects]))
for (const goal of landscape.goals) {
  assert.ok(!goal.requires?.includes(legacy), `${goal.id} still requires the ambiguous retired aggregate`)
  assert.ok(!goal.requires?.includes(lot), `${goal.id} still requires the multi-skill cluster`)
}
const dir = 'curricula/DE/Gymnasium/composition-views/mathematik'
let views = 0
const actualScopes = new Map<string, string[]>()
for (const file of readdirSync(resolve(root, dir)).filter(file => file.endsWith('.view.json'))) {
  const view = normalizeCompositionView(read(`${dir}/${file}`))
  const { targetGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId)
  assert.ok(!targetGoalIds.has(legacy), `${file} exposes retired distance mastery as target`)
  const heLk = view.scope.jurisdiction === 'DE-HE' && view.scope.courseProfile === 'LK' && view.scope.stage !== 'SekI'
  const bwLk = view.scope.jurisdiction === 'DE-BW' && view.scope.courseProfile === 'LK' && view.scope.stage !== 'SekI'
  for (const id of [...trio, heExam, bwLine, bwExam]) {
    if (targetGoalIds.has(id)) (actualScopes.get(id) ?? actualScopes.set(id, []).get(id)!).push(file)
    assert.equal(targetGoalIds.has(id), [bwLine, bwExam].includes(id) ? bwLk : heLk, `${file}: incorrect authored scope for ${id}`)
  }
  if (heLk) for (const id of [pointLine, pointPlane, lineLine, parallelObjects]) assert.ok(targetGoalIds.has(id), `${file} lost a former c2 distance skill`)
  if (['DE-BB', 'DE-BE'].includes(view.scope.jurisdiction ?? '') && view.scope.stage !== 'SekI') {
    for (const id of [point, pointPlane, parallelObjects]) assert.ok(targetGoalIds.has(id), `${file} lost common distance content`)
    for (const id of [pointLine, lineLine]) assert.equal(targetGoalIds.has(id), view.scope.courseProfile === 'LK', `${file} violates the official GK/LK object-pair boundary`)
  }
  const errors = compileCompositionView(view, landscape).findings.filter(finding => finding.severity === 'error')
  assert.deepEqual(errors, [], `${file} duplicates goals or contains an invalid reference`)
  views++
}
for (const id of [...trio, heExam, bwLine, bwExam]) assert.ok(actualScopes.get(id)?.length, `No target route for ${id}`)
for (const state of ['BB', 'BE']) {
  const mapping = read(`curricula/DE/Gymnasium/mapping/DE-${state}/upper-secondary/${state.toLowerCase()}_math_upper_secondary_source_extraction_to_canonical_math.review.json`)
  assert.ok(mapping.mappings.every((edge: MappingEdge) => edge.canonicalGoalId !== legacy))
  const common = `${state.toLowerCase()}-math-sekii-rlp-gost-q3-04-3bea88ab`
  assert.ok(mapping.mappings.every((edge: MappingEdge) => edge.legacyGoalId !== common || ![pointLine, lineLine].includes(edge.canonicalGoalId)))
  for (const id of [point, pointPlane, parallelObjects]) assert.ok(mapping.mappings.some((edge: MappingEdge) => edge.legacyGoalId === common && edge.canonicalGoalId === id))
}
const heMapping = read('curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json')
for (const id of trio) assert.ok(heMapping.mappings.some((edge: MappingEdge) => edge.legacyGoalId === 'he-math-sekii-q2-3-b13-a04-374666eb' && edge.canonicalGoalId === id && edge.matchType === 'partial'))
const oldExam = byId.get('2f8a3a90-717d-5ac1-b54e-facca26e9008')!
for (const id of [...trio, lot]) assert.ok(!(oldExam.examData as ExamData).coveredGoalIds.includes(id), 'Old exam must not claim unasked reflections or the whole distance bundle')
assert.deepEqual(new Set((byId.get(heExam)?.examData as ExamData).coveredGoalIds), new Set(trio))
assert.deepEqual((byId.get(bwExam)?.examData as ExamData).coveredGoalIds, [bwLine])

// Independently calculate the published assessment examples; this catches a
// wrong reflection sign, carrier, image plane, or alleged pointwise identity.
type V = [number, number, number]
const reflectCentre = (p: V, c: V): V => p.map((x, i) => 2 * c[i] - x) as V
const reflectPlane = (p: V): V => [2 - p[1], 2 - p[0], p[2]]
const halfTurn = (p: V): V => [p[0], -p[1], -p[2]]
assert.deepEqual(reflectCentre([2, 3, 4], [1, 0, 0]), [0, -3, -4])
assert.deepEqual(halfTurn([2, 3, 4]), [2, -3, -4])
assert.deepEqual(reflectPlane([2, 3, 4]), [-1, 0, 4])
for (const p of [[3, 0, 0], [3, 1, 0], [3, 0, 1], [3, 2, 2]] as V[]) {
  assert.equal(reflectPlane(p)[1], -1)
  assert.equal(halfTurn(p)[0], 3)
  assert.deepEqual(reflectPlane(reflectPlane(p)), p)
}
assert.notDeepEqual(halfTurn([3, 1, 0]), [3, 1, 0])
assert.deepEqual(reflectCentre([2, 1, 3], [1, 0, 0]), [0, -1, -3])
console.log(`Distance/reflection structure verified across ${views} views; exact carrier calculations and source boundaries pass.`)
