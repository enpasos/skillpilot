import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import { fingerprintDirectedQuantityArrowContract } from './lib/directedQuantityArrows'

/**
 * Typesetting correction of a canonical catalog (Product Owner, 27 November 2026: every
 * mathematical expression is written in TeX). A batch file lists, per goal field, passages
 * (old, new). Each new passage must read back to its old passage character by character
 * (`readBack`), so only the typesetting changes: notation, numbers, wording and demands stay.
 * The tool writes the catalog, renews the semantic-kind source fingerprints of the changed
 * goals and writes the batch record with the hash of every field before and after.
 * Without --write it checks that catalog, ledger and record hold exactly that result.
 *
 * Usage: tsx scripts/applyFormulaTypesetting.ts <batch.json> [--write]
 */
// Ledger and catalog payloads have no shared complete TypeScript interface.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>
const root = resolve(import.meta.dirname, '../..')
const args = process.argv.slice(2)
const write = args.includes('--write')
const batchPath = args.find(argument => argument !== '--write')
if (!batchPath || args.some(argument => argument !== '--write' && argument !== batchPath)) {
  throw new Error('Usage: applyFormulaTypesetting.ts <batch.json> [--write]')
}
const sha = (value: string) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const json = (path: string): Json => JSON.parse(read(path))
const serialize = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`

const SUB: Record<string, string> = Object.fromEntries([...'0123456789aehijklmnoprstuvx'].map((c, i) =>
  [c, '₀₁₂₃₄₅₆₇₈₉ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ'[i]]))
const SUP: Record<string, string> = Object.fromEntries([...'0123456789-+ni'].map((c, i) => [c, '⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ⁿⁱ'[i]]))
const script = (text: string, table: Record<string, string>, what: string) => [...text].map(c => {
  if (!table[c]) throw new Error(`No ${what} character for "${c}" in "${text}"`)
  return table[c]
}).join('')

/** The plain text a TeX passage stands for, written with the characters of the old catalog. */
export function readBack(passage: string): string {
  return passage.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/u).map(part => {
    const display = part.startsWith('$$')
    if (!part.startsWith('$') || part.length < 2) return part
    let tex = display ? part.slice(2, -2) : part.slice(1, -1)
    tex = tex
      .replace(/\\,\\mathrm\{([^{}]*)\}/gu, ' $1').replace(/\\mathrm\{([^{}]*)\}/gu, '$1').replace(/\\text\{([^{}]*)\}/gu, '$1')
      .replace(/\\tfrac\{1\}\{2\}/gu, '½').replace(/\^\{\\mathsf\s*T\}/gu, 'ᵀ')
      .replace(/\\cdot\s*/gu, '·').replace(/\\times\s*/gu, '×').replace(/\\Delta\s*/gu, 'Δ').replace(/\\leftarrow\s*/gu, '←')
      .replace(/\\to\s*/gu, '→').replace(/\\neq\s*/gu, '≠').replace(/\\approx\s*/gu, '≈').replace(/\\leq\s*/gu, '≤').replace(/\\geq\s*/gu, '≥')
      .replace(/\{,\}/gu, ',')
      .replace(/_\{([^{}]*)\}/gu, (_m, inner: string) => script(inner, SUB, 'subscript'))
      .replace(/_(\w)/gu, (_m, inner: string) => script(inner, SUB, 'subscript'))
      .replace(/\^\{([^{}]*)\}/gu, (_m, inner: string) => script(inner, SUP, 'superscript'))
      .replace(/\^(\w)/gu, (_m, inner: string) => script(inner, SUP, 'superscript'))
      .replace(/-/gu, '−')
    if (/[\\{}^_]/u.test(tex)) throw new Error(`Unmapped TeX in ${part}`)
    return tex
  }).join('')
}

interface Entry { goalId: string; field: string; reason: string; pairs: [string, string][]; beforeSha256?: string; afterSha256?: string }
interface Batch { batchId: string; catalog: string; semanticKinds: string; approvedBy: string; scope: string; entries: Entry[] }
const batch = json(batchPath) as Batch
const catalog = json(batch.catalog)
const before = new Map<string, Json>((catalog.goals as Json[]).map(goal => [goal.id, structuredClone(goal)]))
const goals = new Map<string, Json>((catalog.goals as Json[]).map(goal => [goal.id, goal]))
const at = (goal: Json, field: string) => {
  const keys = field.split('.')
  const parent = keys.slice(0, -1).reduce((node: Json, key) => node[key], goal)
  return { parent, key: keys.at(-1)! }
}
const changed = new Set<string>()
for (const entry of batch.entries) {
  const goal = goals.get(entry.goalId)
  if (!goal) throw new Error(`Unknown goal ${entry.goalId}`)
  if (!entry.reason) throw new Error(`Missing reason: ${entry.goalId} ${entry.field}`)
  const { parent, key } = at(goal, entry.field)
  const current: string = parent[key]
  if (typeof current !== 'string') throw new Error(`Not a text field: ${entry.goalId} ${entry.field}`)
  // The field holds either the old text (before --write) or the recorded result (check).
  let old = current
  if (entry.afterSha256 && sha(current) === entry.afterSha256) {
    for (const [oldPassage, newPassage] of entry.pairs) old = old.replace(newPassage, oldPassage)
  }
  if (entry.beforeSha256 && sha(old) !== entry.beforeSha256) throw new Error(`Field drift: ${entry.goalId} ${entry.field}`)
  let text = old
  for (const [oldPassage, newPassage] of entry.pairs) {
    if (readBack(newPassage) !== oldPassage) {
      throw new Error(`Not typesetting only: ${entry.goalId} ${entry.field}\n  old:       ${oldPassage}\n  read back: ${readBack(newPassage)}`)
    }
    if (text.split(oldPassage).length !== 2) throw new Error(`Passage not found exactly once: ${entry.goalId} ${entry.field}: ${oldPassage}`)
    text = text.replace(oldPassage, newPassage)
  }
  const original = at(before.get(entry.goalId)!, entry.field)
  original.parent[original.key] = old
  parent[key] = text
  entry.beforeSha256 = sha(old)
  entry.afterSha256 = sha(text)
  changed.add(entry.goalId)
}

const outputs = new Map<string, string>([[batch.catalog, serialize(catalog)]])
const semantics = json(batch.semanticKinds)
const semanticBindings: Json[] = []
// A directed-quantity-arrow usage decision binds the wording of its goal. The decision stands
// for a typesetting correction; a successor evidence row binds it to the corrected wording.
const arrowsPath = batchPath.replace(/\.review\.json$/u, '.arrows.actual.json')
const arrowRows: Json[] = []
const arrowSources = new Map<string, string>()
const arrowDecisions: Json[] = []
for (const id of changed) {
  const decision = (semantics.decisions as Json[]).find(item => item.goalId === id)
  if (!decision) continue
  const previous = fingerprintSemanticKindSourceGoal(before.get(id)!)
  const next = fingerprintSemanticKindSourceGoal(goals.get(id)!)
  if (![previous, next].includes(decision.sourceFingerprint)) throw new Error(`Stale semantic kind before correction: ${id}`)
  decision.sourceFingerprint = next
  semanticBindings.push({ goalId: id, semanticKind: decision.semanticKind, before: previous, after: next })
  const arrows = decision.directedQuantityArrows
  if (!arrows) continue
  // In check mode the decision already points at this batch's successor; follow it back.
  const evidencePath: string = arrows.evidence.path === arrowsPath ? json(arrowsPath).sourceBindings
    .find((source: Json) => source.entryFor?.includes(id))?.path : arrows.evidence.path
  const evidenceBytes = read(evidencePath)
  const row = (JSON.parse(evidenceBytes).rows as Json[]).find(item => item.goalId === id)
  if (!row) throw new Error(`No arrow evidence row for ${id} in ${evidencePath}`)
  const contractBefore = fingerprintDirectedQuantityArrowContract(before.get(id)!)
  if (row.contractFingerprint !== contractBefore) throw new Error(`Stale arrow contract before correction: ${id}`)
  if (!arrowSources.has(evidencePath)) arrowSources.set(evidencePath, sha(evidenceBytes))
  arrowRows.push({ goalId: id, contractFingerprint: fingerprintDirectedQuantityArrowContract(goals.get(id)!),
    usage: row.usage, representationKinds: row.representationKinds,
    basis: `typesetting-only successor of ${evidencePath} (${row.basis})`,
    rationale: `${row.rationale} Typesetting correction ${batch.batchId}: wording, numbers and demands are unchanged, so the usage decision stands.` })
  arrowDecisions.push(arrows)
}
if (arrowRows.length) {
  const sources = [...arrowSources].map(([path, digest]) => ({ path, sha256: digest,
    entryFor: arrowRows.filter(row => (JSON.parse(read(path)).rows as Json[]).some(item => item.goalId === row.goalId)).map(row => row.goalId) }))
  const bytes = serialize({ schemaVersion: 1, documentType: 'directed-quantity-arrow-decisions', sourceBindings: sources, rows: arrowRows })
  outputs.set(arrowsPath, bytes)
  for (const [index, arrows] of arrowDecisions.entries()) arrows.evidence = { path: arrowsPath, sha256: sha(bytes), entryId: arrowRows[index].goalId }
}
outputs.set(batch.semanticKinds, serialize(semantics))
outputs.set(batchPath, serialize({
  ...batch,
  rule: 'Each new passage reads back to its old passage character by character; the tool checks it with readBack in app/scripts/applyFormulaTypesetting.ts.',
  unchanged: ['goal ids, titles outside the listed passages and all edges', 'all numbers, units, notation, wording and demands',
    'pass marks, scoring weights and covered goals', 'images and their descriptions', 'historical review evidence'],
  followUp: 'A typesetting correction is not a substantive re-review or renewed approval of the goals or assessments.',
  semanticKindBindings: semanticBindings,
}))
for (const [path, bytes] of outputs) {
  if (write) { mkdirSync(dirname(resolve(root, path)), { recursive: true }); writeFileSync(resolve(root, path), bytes) }
  else if (read(path) !== bytes) throw new Error(`Typesetting correction missing or drifted: ${path}`)
}
console.log(`CHECK formula_typesetting ${batch.batchId} ${write ? 'WRITE' : 'PASS'} goals=${changed.size} fields=${batch.entries.length} `
  + `passages=${batch.entries.reduce((sum, entry) => sum + entry.pairs.length, 0)} semanticKinds=${semanticBindings.length}`)
