// Read-only reconstruction: retain original field leases and report every conflict.
// Never writes or silently refreshes a lease, review decision, or fingerprint.
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const root = 'curricula/DE/Gymnasium/quality/'
const receiptPath = root + 'deep-understanding-rollout/physics-paused-split-deferral-20260907-v1/PAUSED_DEFERRED.receipt.json'
const read = path => JSON.parse(readFileSync(path, 'utf8'))
const receipt = read(receiptPath)
const planBytes = readFileSync(receipt.B035.sourcePlan)
const sha = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
if (sha(planBytes) !== receipt.B035.sourcePlanSha256) throw Error('Historical plan changed')
const plan = JSON.parse(planBytes)
const stable = v => JSON.stringify(v, (_, x) => x && typeof x === 'object' && !Array.isArray(x)
  ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x)
const state = value => value === undefined ? { state: 'missing' } : { state: 'value', value }
const documents = new Map()
const originals = new Map()
const conflicts = []
const reconciliations = []
function location(document, path) {
  let parent = document
  for (const part of path.slice(0, -1)) {
    if (typeof part === 'object') {
      const matches = parent.filter(row => Object.entries(part).every(([key, value]) => row[key] === value))
      if (matches.length !== 1) throw Error('Missing/duplicate selector: ' + JSON.stringify(path))
      parent = matches[0]
    } else parent = parent[part]
  }
  const last = path.at(-1)
  if (typeof last !== 'object') return { parent, key: last, value: parent[last] }
  const matches = parent.map((row, index) => Object.entries(last).every(([key, value]) => row[key] === value) ? index : -1).filter(index => index >= 0)
  if (matches.length > 1) throw Error('Duplicate final selector')
  const key = matches[0] ?? parent.length
  return { parent, key, value: parent[key] }
}
for (const index of [...receipt.B035.invertedOperationIndexes].sort((a, b) => a - b)) {
  const operation = plan.operations[index]
  const { file } = operation
  if (!documents.has(file)) {
    const bytes = readFileSync(file, 'utf8')
    originals.set(file, bytes)
    documents.set(file, operation.kind === 'text-span' ? bytes : file.endsWith('.jsonl')
      ? bytes.trim().split('\n').map(line => JSON.parse(line)) : JSON.parse(bytes))
  }
  const document = documents.get(file)
  if (operation.kind === 'text-span') {
    if (document.split(operation.before).length !== 2) conflicts.push({ index, file, kind: 'text-span' })
    else documents.set(file, document.replace(operation.before, operation.after))
    continue
  }
  const found = location(document, operation.path)
  // The pause retained a separately reviewed density correction in b585. The
  // receipt binds its exact restored decision; do not revert the task text.
  const reconciled = index === 227
    && stable(found.value) === stable(receipt.B035.assessmentTechnicalBinding.emittedDecision)
  if (reconciled) reconciliations.push({ index, reason: 'Retained density correction; exact pause receipt decision matches', before: found.value })
  if (!reconciled && stable(state(found.value)) !== stable(operation.before)) {
    conflicts.push({ index, file, path: operation.path, expected: operation.before, actual: state(found.value) })
    continue
  }
  if (operation.after.state === 'missing') {
    if (Array.isArray(found.parent)) { if (found.value !== undefined) found.parent.splice(found.key, 1) }
    else delete found.parent[found.key]
  } else found.parent[found.key] = structuredClone(operation.after.value)
}
const summary = { status: conflicts.length ? 'EXPLICIT_RECONCILIATION_REQUIRED' : 'LEASES_MATCH',
  appliesChanges: false, originalPlanSha256: sha(planBytes), operationCount: receipt.B035.invertedOperationIndexes.length,
  files: [...originals].map(([path, bytes]) => ({ path, sha256: sha(bytes) })), reconciliations, conflicts }
if (process.argv[2] !== '--outputs-json') {
  console.log(JSON.stringify(summary, null, 2))
  process.exit(conflicts.length ? 1 : 0)
}
if (conflicts.length) throw Error('Unresolved original field leases')
const own = root + 'goal-description-review/physik/rollout-v1/2026-09-08/physics100-quantum-completion-v1/'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const kindPath = root + 'release-model/physik.semantic-kinds.json'
const canonical = documents.get(canonicalPath)
const goal = id => canonical.goals.find(entry => entry.id === id)
const childIds = receipt.B035.removedGoalIds
for (const id of childIds) {
  const archived = receipt.archivedGoals.find(entry => entry.id === id)
  const current = goal(id)
  const { resourceLinks, ...archivedCore } = archived
  if (stable(current) !== stable(archivedCore)) throw Error('Archived child content differs: ' + id)
  current.resourceLinks = structuredClone(resourceLinks)
}
// Scope overrides for these upper-stage children belong inside the upper-stage
// structure in mixed-stage views. No target set is widened by this placement.
for (const [path, document] of documents) {
  if (!path.includes('/composition-views/physik/')) continue
  const structures = []
  function visit(node) {
    if (node.kind === 'structure' && /^physics-sekii-(gk|lk)$/.test(node.id)) structures.push(node)
    for (const child of node.children ?? []) visit(child)
  }
  document.rootNodes.forEach(visit)
  if (structures.length > 1) throw Error('Ambiguous upper-stage parent: ' + path)
  if (!structures.length) continue
  const moving = document.rootNodes.filter(node => node.kind === 'goalEntry'
    && childIds.includes(node.goalId) && node.projectionRole === 'prerequisiteOnly')
  document.rootNodes = document.rootNodes.filter(node => !moving.includes(node))
  structures[0].children.push(...moving)
}
const assessment = read(own + 'interval-assessment.candidate.json')
const assessmentReview = read(own + 'interval-assessment-review.json')
if (assessmentReview.status !== 'PASS' || assessmentReview.candidateSha256 !== sha(readFileSync(own + 'interval-assessment.candidate.json')))
  throw Error('Missing or stale independent assessment review')
if (goal(assessment.id)) throw Error('Assessment ID already exists')
assessment.examData.reviewStatus = 'released'
assessment.examData.reviewNote = 'Released after internal AI author review and independent content counterreview on 2026-09-08; no human or external validation claimed. Evidence: ' + own + 'interval-assessment-review.json'
canonical.goals.push(assessment)
const folder = goal('85bbad98-2f48-5d64-85c4-ab6cf67f24c2')
folder.contains.push(assessment.id)
folder.weight = folder.contains.length
const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(resolve('app/scripts/goalBookModel.ts')))
const kinds = documents.get(kindPath)
for (const id of [...childIds, 'ad021f2e-6b94-5e6e-a264-3d1110094b87', 'b585ff81-6332-5d11-ae63-ee6a9928c00d', folder.id, assessment.id]) {
  const entry = kinds.decisions.find(decision => decision.goalId === id)
  if (entry) entry.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal(id))
  else kinds.decisions.push({ goalId: id, sourceFingerprint: fingerprintSemanticKindSourceGoal(goal(id)),
    semanticKind: 'practiceAssessment', decisionStatus: 'authoritative',
    decisionBasis: 'reviewed-current-pilot-practice-assessment' })
}
kinds.counts.practiceAssessment += 1
kinds.counts.total += 1
const qaPath = root + 'goal-visualization-qa/physik.qa.json'
const qaBytes = readFileSync(qaPath, 'utf8')
const qa = JSON.parse(qaBytes)
const assetArchive = read(root + 'goal-visualization-review/physik-20260907-deferred-split-assets/move-and-qa-receipt.json')
for (const id of childIds) {
  if (qa.records.some(record => record.goalId === id)) throw Error('QA child already active')
  const record = assetArchive.records.find(record => record.goalId === id)
  if (!record) throw Error('Missing archived reviewed image: ' + id)
  qa.records.push(record)
}
originals.set(qaPath, qaBytes)
documents.set(qaPath, qa)
const outputs = [...documents].map(([file, document]) => ({ file, beforeSha256: sha(originals.get(file)),
  text: typeof document === 'string' ? document : file.endsWith('.jsonl')
    ? document.map(row => JSON.stringify(row)).join('\n') + '\n' : JSON.stringify(document, null, 2) + '\n' }))
console.log(JSON.stringify({ summary, outputs }, null, 2))
