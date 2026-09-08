import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../app/scripts/goalBookModel'

// Emits exact, content-reviewed apply_patch changes, not a bulk spelling or
// approval operation. No D/P, image, human, learner-state or runtime mutation.
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/'
const read = (p: string) => readFileSync(p, 'utf8')
const sha = (s: string) => 'sha256:' + createHash('sha256').update(s).digest('hex')
const format = (x: unknown) => JSON.stringify(x, null, 2) + '\n'
const proposal = JSON.parse(read(base + 'milestone-local-wording-four-v1.json'))
const cp = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const kp = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const ap = 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl'
const mp = 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl'
const planned = new Map<string, { before: string; after: string }>()
const before = read(cp), landscape = JSON.parse(before)
const goals = new Map<string, any>(landscape.goals.map((g: any) => [g.id, g]))
const changes: any[] = []
for (const row of proposal.changes) {
  const g = goals.get(row.goalId)
  assert.ok(g)
  for (const [field, pair] of Object.entries(row.fields) as [string, any][]) {
    assert.equal(g[field], pair.before, row.goalId + '/' + field)
    g[field] = pair.after
    changes.push({ goalId: g.id, field, ...pair })
  }
  for (const link of g.resourceLinks ?? []) {
    if (link.type !== 'goal-visualization' || link.lang !== 'de') continue
    for (const [field, value] of Object.entries({ title: `Visualisierung: ${g.title}`, description: `Visualisierung zum Lernziel: ${g.title}.`, altText: `Didaktische Visualisierung zum Lernziel "${g.title}". ${g.description}` })) {
      if (link[field] === value) continue
      changes.push({ goalId: g.id, field: 'primaryVisualization/' + field, before: link[field], after: value })
      link[field] = value
    }
  }
}
assert.equal(proposal.changes.length, 4)
planned.set(cp, { before, after: format(landscape) })
const kbefore = read(kp), kinds = JSON.parse(kbefore)
const classificationChanges: any[] = []
for (const row of proposal.changes) {
  const record = kinds.decisions.find((r: any) => r.goalId === row.goalId)
  assert.equal(record.semanticKind, 'curricularAtomic')
  assert.equal(record.decisionBasis, 'reviewed-current-pilot-curricular-atomic')
  const old = structuredClone(record)
  record.sourceFingerprint = fingerprintSemanticKindSourceGoal(goals.get(row.goalId))
  classificationChanges.push({ path: kp, before: old, after: record, reason: row.atomicReason })
}
planned.set(kp, { before: kbefore, after: format(kinds) })
const stable = (v: any): string => v === undefined ? 'null' : Array.isArray(v) ? '[' + v.map(stable).join(',') + ']' : v !== null && typeof v === 'object' ? '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}' : JSON.stringify(v)
const norm = (v: any) => String(v ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
for (const [p, ruleVersion, reasonField] of [[ap, 'semantic-atomicity-v1', 'atomicReason'], [mp, 'memory-card-review-v1', 'memoryReason']]) {
  const old = read(p)
  const lines = old.trimEnd().split('\n').map(line => {
    const r = JSON.parse(line), authored = proposal.changes.find((x: any) => x.goalId === r.goalId)
    if (!authored) return line
    const g = goals.get(r.goalId), previous = structuredClone(r)
    r.fingerprint = sha(stable({ ruleVersion, goalId: g.id, shortKey: g.shortKey ?? '', title: norm(g.title), titleEn: norm(g.titleEn), description: norm(g.description), descriptionEn: norm(g.descriptionEn), phase: norm(g.dimensionTags?.phase), area: norm(g.dimensionTags?.area), topicCode: norm(g.dimensionTags?.topicCode), nodeKind: norm(g.nodeKind) }))
    r.reviewedAt = '2026-09-07'
    r.reviewer = 'codex-physics-milestone-local-wording-four-v1'
    r.reason = authored[reasonField]
    if (p === ap) { assert.equal(r.status, 'atomic'); assert.equal(r.semanticAtomic, true) }
    else assert.equal(r.status, ['1232febe-868a-4dac-b4c2-e35789434601', 'fbecbd60-5db3-51e8-94be-d66b066ffa06'].includes(r.goalId) ? 'memory_required' : 'no_memory_needed')
    classificationChanges.push({ path: p, before: previous, after: r, reason: r.reason })
    return JSON.stringify(r)
  })
  planned.set(p, { before: old, after: lines.join('\n') + '\n' })
}
const mappingNotes = [
  { path: 'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_source_extraction_to_canonical_physics.review.json', entries: [
    { id: 'rp-phys-sek2-continuity-bernoulli-stokes-reynolds', reason: 'RP-Original Strömungsphysik S.45/75: Die Auswahl der Gesetze richtet sich nach den gewählten Beispielen. Ziel333 bildet deren qualitative Aussage und Voraussetzungen im jeweiligen Beispiel ab, nicht einen verpflichtenden vollständigen Vier-Gesetze-Katalog. Die vorhandene partial-Zuordnung wird nicht zu einer exact-Abdeckung hochgestuft.' },
    { id: 'rp-phys-sek2-sinking-velocities-practicum', reason: 'Partielle fachliche Zuordnung: Ziel333 unterstützt die qualitative Erklärung des gewählten Sink-/Strömungsmodells. Die Durchführung eines Praktikums zur Messung von Sinkgeschwindigkeiten und dessen eigenständige Messauswertung werden dadurch nicht nachgewiesen. Keine Vollabdeckung oder praktische Lernleistung behauptet.' },
  ] },
  { path: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json', entries: [
    { id: '9ebc77ee-90cf-5540-aed7-02d9b4140f4c', reason: 'BY LehrplanPLUS Ph12-GA-BIO.4.2: Ziel282 behandelt die Eignung eines vorgegebenen Messverfahrens mit Feldabschätzungen und einer Erklärung der Induktionsspannung. Die übrigen genannten Grundlagenziele tragen elektrische Feldmodelle und quantitative Fluss-/Induktionsbeziehungen bei. partial-Mappings bleiben erhalten: die integrierte Beurteilung ist keine selbst ausgeführte Untersuchung an Personen; ihre qualitative Induktionsaussage allein deckt den quantitativen Quellenteil nicht vollständig ab.' },
  ] },
]
const mappingChanges: any[] = []
for (const entry of mappingNotes) {
  const old = read(entry.path), data = JSON.parse(old)
  for (const note of entry.entries) {
    const r = data.decisions.find((x: any) => x.sourceGoalId === note.id)
    assert.ok(r)
    const previous = structuredClone(r)
    r.rationale = note.reason; r.reviewedAt = '2026-09-07'; r.reviewer = 'codex-physics-milestone-local-wording-four-v1'
    mappingChanges.push({ path: entry.path, before: previous, after: r })
  }
  planned.set(entry.path, { before: old, after: format(data) })
}
assert.equal(classificationChanges.length, 12)
const receipt = { schemaVersion: 1, status: 'applied_layer_a_wording_no_D_P_or_image_approval', reviewedAt: '2026-09-07', reviewer: '/root', humanApprovalClaimed: false, proposalSha256: sha(read(base + 'milestone-local-wording-four-v1.json')), changes, classificationChanges, mappingChanges, files: [...planned].map(([path, pair]) => ({ path, beforeSha256: sha(pair.before), afterSha256: sha(pair.after) })), invariants: { idsEdgesAssessmentsAndRuntimeUnchanged: true, memoryCardsUnchanged: true, mathUnchangedByThisOperation: true, oldReviewSealsUnchanged: true } }
const patch = '*** Begin Patch\n' + [...planned].map(([p, pair]) => {
  const delta = execFileSync('python3', ['-c', 'import json,sys,difflib\na,b=json.load(sys.stdin)\ns=list(difflib.unified_diff(a.splitlines(True),b.splitlines(True),n=3))[2:]\nsys.stdout.write("".join("@@\\n" if l.startswith("@@ ") else l for l in s))'], { input: JSON.stringify([pair.before, pair.after]), encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })
  return '*** Update File: ' + p + '\n' + delta
}).join('') + '*** Add File: ' + base + 'milestone-local-wording-four-v1.receipt.json\n' + format(receipt).trimEnd().split('\n').map(l => '+' + l).join('\n') + '\n*** End Patch\n'
console.log(JSON.stringify({ patch, summary: { files: planned.size, goals: 4, changedFields: changes.length, classificationRecords: classificationChanges.length, mappingNotes: mappingChanges.length } }))
