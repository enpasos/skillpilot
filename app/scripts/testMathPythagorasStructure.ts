import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../src/utils/authoring/compositionViewAuthoring'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
type MappingEdge = { legacyGoalId: string; canonicalGoalId: string; matchType?: string }
type ExamData = { coveredGoalIds: string[]; scoring: { maxPoints: number }; solutionContent: string }
const landscape = normalizeCanonicalLandscape(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'))
const byId = new Map(landscape.goals.map(goal => [goal.id, goal]))
const old = '80956a2c-5811-4021-863e-95675bec31f5'
const calculation = '4d78bbcc-89b8-47f0-aa45-516199e4da5d'
const construction = '3a69dab2-3fe8-5076-a980-5b7ac1bd1127'
const proof = '487ec508-f421-5a5a-a84c-98f88a8fb3e5'
const converseProof = '6a3502ee-b616-5db7-88fc-8951f33c9f63'
const criterion = '081c9802-6da7-5ae8-b78e-f99c2b2dbb14'
const scopes: Record<string, string[]> = {
  [construction]: ['DE-SL'],
  [proof]: ['DE-HE', 'DE-RP', 'DE-SH', 'DE-SL'],
  [converseProof]: ['DE-HE', 'DE-SH', 'DE-SL'],
  [criterion]: ['DE-BB', 'DE-BE', 'DE-BW', 'DE-HE', 'DE-SH', 'DE-SL'],
}
const exams: Record<string, string> = {
  [construction]: 'e086671c-9f55-5d8b-8467-b6390dc6a879',
  [proof]: '2686049c-2cb2-5595-be5b-4860c3ceb76b',
  [converseProof]: '5c00b06d-9644-5e23-ac29-6ff1499ee0ca',
  [criterion]: '241915f4-8d90-5542-ac9c-230aa98bee39',
}
assert.deepEqual(new Set(byId.get(old)?.contains), new Set([calculation, ...Object.keys(scopes)]))
for (const goal of landscape.goals) assert.ok(!goal.requires?.includes(old), `${goal.id} still requires the multi-skill Pythagoras cluster`)
const oldExam = byId.get('fbd97592-d8cc-5de9-a92d-ed2ca4278ce3')!
assert.ok(!(oldExam.examData as ExamData).coveredGoalIds.includes(old))
assert.ok((oldExam.examData as ExamData).coveredGoalIds.includes(calculation))
for (const [goal, exam] of Object.entries(exams)) {
  assert.deepEqual(byId.get(exam)?.requires, [goal])
  assert.deepEqual((byId.get(exam)?.examData as ExamData).coveredGoalIds, [goal])
  assert.equal((byId.get(exam)?.examData as ExamData).scoring.maxPoints, 10)
  assert.ok((byId.get(exam)?.examData as ExamData).solutionContent.includes('7/10'))
}
let views = 0
const viewErrors: Array<{ view: string; findings: unknown[] }> = []
const dir = 'curricula/DE/Gymnasium/composition-views/mathematik'
for (const file of readdirSync(resolve(root, dir)).filter(file => file.endsWith('.view.json'))) {
  const view = normalizeCompositionView(read(`${dir}/${file}`))
  const { targetGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId)
  const hasCalculation = targetGoalIds.has(calculation)
  for (const [id, states] of Object.entries(scopes)) {
    const expected = hasCalculation && states.includes(view.scope.jurisdiction ?? '') && view.scope.stage !== 'SekII'
    assert.equal(targetGoalIds.has(id), expected, `${file}: wrong source scope for ${id}`)
    assert.equal(targetGoalIds.has(exams[id]), expected, `${file}: missing or excess actual assessment for ${id}`)
  }
  const findings = compileCompositionView(view, landscape).findings.filter(finding => finding.severity === 'error')
  if (findings.length) viewErrors.push({ view: file, findings })
  views++
}
for (const state of ['BB', 'BE']) {
  const mapping = read(`curricula/DE/Gymnasium/mapping/DE-${state}/lower-secondary/${state.toLowerCase()}_math_lower_secondary_source_extraction_to_canonical_math.review.json`)
  const edges = mapping.mappings.filter((edge: MappingEdge) => edge.legacyGoalId === `${state.toLowerCase()}-math-seki-rlp-3-l2-detail-2456a47c03`)
  assert.deepEqual(edges.map((edge: MappingEdge) => [edge.canonicalGoalId, edge.matchType]), [[criterion, 'exact']])
}
const sl = read('curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_math_lower_secondary_source_extraction_to_canonical_math.review.json')
for (const [suffix, id] of [['b02-879e4434cc', proof], ['b06-34b91a0768', converseProof], ['b07-c8dc90b223', criterion]]) {
  const edges = sl.mappings.filter((edge: MappingEdge) => edge.legacyGoalId.endsWith(suffix))
  assert.deepEqual(edges.map((edge: MappingEdge) => edge.canonicalGoalId), [id])
}
// Independently check exact construction and the three assessment decisions.
assert.equal(2 ** 2 + 3 ** 2, 13)
const isRight = (sides: number[]) => {
  const [a, b, c] = [...sides].sort((a, b) => a - b)
  return a * a + b * b === c * c
}
assert.equal(isRight([13, 5, 12]), true)
assert.equal(isRight([5, 7, 9]), false)
assert.equal(isRight([1.5, 2, 2.5]), true)
// The dissection leaves a^2+b^2 for its inner square, with no numeric special case.
for (const [a, b] of [[2, 3], [3, 4], [1.5, 2], [5, 12]]) assert.equal((a + b) ** 2 - 4 * a * b / 2, a * a + b * b)
assert.deepEqual(viewErrors, [], 'Invalid or duplicate learner-visible goals in authored views')
console.log(`Pythagoras split verified: ${views} views, four independent competencies and assessments, exact source boundaries.`)
