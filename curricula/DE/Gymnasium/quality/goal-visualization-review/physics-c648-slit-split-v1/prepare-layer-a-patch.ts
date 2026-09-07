import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../app/scripts/goalBookModel'
import { compileCompositionView } from '../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { findExamMarkdownTableIssues } from '../../../../../../app/scripts/lib/examMarkdownValidation'

// Read-only emitter. It never applies its returned activePatch and never writes files.
const base = 'curricula/DE/Gymnasium/'
const stage = base + 'quality/goal-visualization-review/physics-c648-slit-split-v1/'
const parentId = 'c64820e1-c0ee-4342-9225-f981650f0c52'
const ids = ['55dbede5-2fee-51e7-ac13-e3b0227c502e', 'df4acb52-b700-5b44-bc1e-11d73f24d061', '6e4faa1f-bccf-574e-bdb9-544f44c1d7f7']
const oldDoubleId = '6270e558-d657-5363-a6b2-e49a032a453b'
const capstoneId = 'a94f9b05-ecb1-5a13-8364-44c1c98be8e4'
const practiceId = 'b47a2a23-b56d-5433-9036-075d6bb7c782'
const paths = {
  canonical: base + 'canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  atomic: base + 'quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: base + 'quality/memory-card-review/canonical-physics-full.review.jsonl',
  kinds: base + 'quality/release-model/physik.semantic-kinds.json',
  provenance: base + 'provenance/canonical-goal-provenance-registry.json',
}
const inputBytes = new Map<string, string>(), outputBytes = new Map<string, string>()
const read = (path: string) => { const value = readFileSync(path, 'utf8'); inputBytes.set(path, value); return value }
const readJson = (path: string) => JSON.parse(read(path))
const sha = (v: string | Buffer) => 'sha256:' + createHash('sha256').update(v).digest('hex')
const json = (v: any) => JSON.stringify(v, null, 2) + '\n'
const same = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)
const unique = (rows: any[], key: string, value: string) => { const found = rows.filter(r => r[key] === value); assert.equal(found.length, 1, key + ':' + value); return found[0] }
const proposal = readJson(stage + 'proposed-goals.json.snapshot')
const assessment = readJson(stage + 'proposed-lk-assessment.json')
assert.deepEqual(proposal.goals.map((g: any) => g.id), ids)
assert.equal(assessment.cases.length, 3)
const checkedInput = assessment.cases.map((c: any) => {
  const s = c.taskContentEn, aperture = s.match(/[dgb]=(\d+\.\d+) (mm|µm)/)
  return { wavelength: +s.match(/λ=(\d+) nm/)[1] * 1e-9, distance: +s.match(/L=(\d+\.\d+) m/)[1], aperture: +aperture[1] * (aperture[2] === 'mm' ? 1e-3 : 1e-6) }
})
const geometry = (ratio: number, distance: number) => ({ degrees: Math.asin(ratio) * 180 / Math.PI, metres: distance * ratio / Math.sqrt(1 - ratio * ratio) })
const near = (actual: number, expected: number, tolerance = 1e-6) => assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), actual + ' != ' + expected)
const numerical: any[] = []
numerical[0] = [2, .5].map(m => geometry(m * checkedInput[0].wavelength / checkedInput[0].aperture, checkedInput[0].distance))
numerical[1] = [1, 2].map(m => geometry(m * checkedInput[1].wavelength / checkedInput[1].aperture, checkedInput[1].distance))
numerical[2] = [1, 2, 1.43].map(m => geometry(m * checkedInput[2].wavelength / checkedInput[2].aperture, checkedInput[2].distance))
near(numerical[0][0].metres * 1000, 8.000100); near(numerical[0][1].metres * 1000, 2.00000156)
near(numerical[1][0].degrees, 25.6793); near(numerical[1][1].degrees, 60.0736)
near(numerical[1][0].metres, .192329); near(numerical[1][1].metres, .694879)
near(numerical[2][0].metres * 1000, 7.000056); near(numerical[2][1].metres * 1000, 14.000448); near(numerical[2][2].metres * 1000, 10.010164)
const tableRows = [...assessment.cases[2].taskContentEn.matchAll(/\| (\d+\.\d+) \| (\d+\.\d+) \|/g)].map((m: any) => [+m[1], +m[2]])
assert.equal(tableRows.length, 10)
for (const [u, intensity] of tableRows) near(intensity, +(u === 0 ? 1 : (Math.sin(Math.PI * u) / (Math.PI * u)) ** 2).toFixed(5), 1e-12)
assert.equal(Math.floor(checkedInput[1].aperture / checkedInput[1].wavelength), 2)
assert.equal([1, -1, 1, -1, 1, -1, 1].reduce((a, b) => a + b), 1)
const canonical = readJson(paths.canonical), beforeCanonical = structuredClone(canonical)
const goal = (id: string) => unique(canonical.goals, 'id', id)
const parent = goal(parentId), beforeParent = structuredClone(parent)
assert.equal(parent.type, 'atomic'); assert.deepEqual(parent.contains, [])
assert.equal(parent.description, 'Die lernende Person kann die Lage von Interferenzminima beziehungsweise Interferenzmaxima bei ausgewaehlten Beugungsvorgaengen in Fernfeldnaeherung fuer Einzelspalt, Doppelspalt und Gitter berechnen.')
assert.deepEqual(parent.requires, ['2c6af966-7703-4176-a117-5ddb8295bedf'])
for (const id of ids) assert.equal(canonical.goals.some((g: any) => g.id === id), false)
const observedAt = new Date().toISOString()
const childScopes = [ ['DE-BW', 'DE-BY'], ['DE-BW', 'DE-BY', 'DE-HE'], ['DE-BW', 'DE-BY', 'DE-HE'] ]
const childTags = [['LK'], ['GK', 'LK'], ['LK']]
const children = proposal.goals.map((p: any, i: number) => ({
  ...structuredClone(p), type: 'atomic', weight: 1, tags: childTags[i],
  dimensionTags: { framework: 'hessen-kc-2024-physics', demandLevel: 'AB2', processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'], guidingIdeas: ['LI_WELLEN'], phase: 'Q3' },
  applicability: { jurisdiction: childScopes[i] },
  extendedData: { applicabilityMappingInheritance: 'boundary' },
}))
// No splitFromCanonicalGoalId, sourceGoalId or any other mastery-fanout hint in goals.
for (const child of children) assert.deepEqual(Object.keys(child.extendedData), ['applicabilityMappingInheritance'])
parent.title = 'Interferenzlagen an Einzelspalt, Doppelspalt und Gitter'
parent.titleEn = 'Interference positions for single slit, double slit and grating'
parent.description = 'Dieser Bereich bündelt drei getrennte Lernziele zur Lagebestimmung bei Einzelspaltbeugung, Doppelspaltinterferenz und optischen Gittern; der jeweilige Kursumfang wird an den Teilzielen ausgewiesen.'
parent.descriptionEn = 'This area groups three separate learning goals for positions in single-slit diffraction, double-slit interference and optical gratings; course applicability is specified for each constituent goal.'
parent.type = 'cluster'; parent.contains = [...ids]; parent.requires = []; parent.weight = 3
parent.extendedData = { ...(parent.extendedData ?? {}), applicabilityMappingInheritance: 'boundary' }
delete parent.resourceLinks
const capstone = goal(capstoneId), beforeCapstone = structuredClone(capstone)
assert.equal(capstone.requires.length, 40); assert.equal(capstone.examData.coveredGoalIds.length, 40)
assert.equal(capstone.requires.filter((id: string) => id === parentId).length, 1)
assert.equal(capstone.examData.coveredGoalIds.filter((id: string) => id === parentId).length, 1)
capstone.requires = capstone.requires.filter((id: string) => id !== parentId)
capstone.examData.coveredGoalIds = capstone.examData.coveredGoalIds.filter((id: string) => id !== parentId)
assert.equal(capstone.requires.length, 39); assert.equal(capstone.examData.coveredGoalIds.length, 39)
const uuidV5 = (name: string) => {
  const ns = Buffer.from('6ba7b8119dad11d180b400c04fd430c8', 'hex')
  const bytes = createHash('sha1').update(ns).update(name).digest().subarray(0, 16)
  bytes[6] = (bytes[6] & 15) | 80; bytes[8] = (bytes[8] & 63) | 128
  const h = bytes.toString('hex'); return [h.slice(0, 8), h.slice(8, 12), h.slice(12, 16), h.slice(16, 20), h.slice(20)].join('-')
}
const exams = children.map((child: any, i: number) => {
  const c = unique(assessment.cases, 'goalId', child.id)
  assert.equal(c.rubric.reduce((s: number, r: any) => s + r.points, 0), 10)
  assert.ok(c.rubric.every((r: any) => r.goalId === child.id))
  for (const field of ['taskContent', 'taskContentEn', 'solutionContent', 'solutionContentEn']) {
    assert.ok(c[field].length > 300); assert.deepEqual(findExamMarkdownTableIssues(c[field]), [])
  }
  return {
    id: uuidV5('https://skillpilot.com/canonical/physics/assessment/slit-split-v1/' + child.id),
    title: 'Prüfungsaufgabe: ' + c.title, titleEn: 'Assessment task: ' + c.titleEn,
    description: 'Die lernende Person kann eine eigenständige materialgebundene Prüfungsaufgabe zu diesem optischen Modell bearbeiten, ihre Rechnung begründen und die Modellgrenzen beurteilen.',
    descriptionEn: 'The learner can independently solve a material-based assessment task about this optical model, justify the calculation and assess the model limitations.',
    weight: 1, tags: [...childTags[i], 'Practice', 'Assessment'], contains: [], requires: [child.id], type: 'atomic',
    dimensionTags: { framework: 'canonical-gymnasium-physics', demandLevel: 'AB3', processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK5_BEWERTEN'], guidingIdeas: ['LI_WELLEN'], phase: 'Q3', area: 'Klausurtraining' },
    applicability: { jurisdiction: childScopes[i] },
    extendedData: { applicabilityFromRequires: true, applicabilityMappingInheritance: 'boundary' },
    examData: { reviewStatus: 'needs_review', coveredGoalIds: [child.id], coveredStrands: ['LI_WELLEN'], demandLevels: ['AB1', 'AB2', 'AB3'],
      taskContent: c.taskContent, taskContentEn: c.taskContentEn, solutionContent: c.solutionContent + '\n\nBewertungshinweis: ' + assessment.scoringNotes.description, solutionContentEn: c.solutionContentEn + '\n\nScoring note: ' + assessment.scoringNotes.descriptionEn,
      scoring: { maxPoints: 10, passingPoints: 6, steps: c.rubric.map((r: any) => ({ id: r.id, points: r.points, description: r.description })) },
    },
  }
})
for (const exam of exams) assert.equal(canonical.goals.some((g: any) => g.id === exam.id), false)
const practice = goal(practiceId), beforePractice = structuredClone(practice)
practice.contains.push(...exams.map((e: any) => e.id))
canonical.goals.splice(canonical.goals.findIndex((g: any) => g.id === parentId) + 1, 0, ...children, ...exams)
for (const old of beforeCanonical.goals) if (![parentId, capstoneId, practiceId].includes(old.id)) assert.deepEqual(goal(old.id), old)
assert.deepEqual(goal('36d5b915-1cb8-5a05-b64a-5f9497a33d1f'), beforeCanonical.goals.find((g: any) => g.id === '36d5b915-1cb8-5a05-b64a-5f9497a33d1f'))
assert.deepEqual(goal(oldDoubleId), beforeCanonical.goals.find((g: any) => g.id === oldDoubleId))
assert.deepEqual(goal('f6a3a602-1e45-5018-b0ff-3d49933cf634'), beforeCanonical.goals.find((g: any) => g.id === 'f6a3a602-1e45-5018-b0ff-3d49933cf634'))
outputBytes.set(paths.canonical, json(canonical))

// These are individual content judgements, not bulk green flags.
const aReasons = [
  'Eine geometrische Doppelspaltoperation: zwei kohärente Beiträge über ihren Gangunterschied zu hellen/dunklen Streifen zuordnen und in Winkel/Schirmorte übersetzen. Maxima/Minima sind komplementäre Ausgänge desselben Modells; 627 bleibt unveränderter Maxima-/Kleinwinkel-Basiseinstieg. Die neue vollständige Hell/Dunkel-Anforderung wird nicht als HE-/BW-Basisfachpflicht ausgegeben.',
  'Eine Gitteroperation: Gleichphasigkeit benachbarter Beiträge bestimmt Hauptmaximrichtungen und zulässige Ordnungen. Die ausdrückliche Grenze gegenüber Minima/Nebenmaxima schützt vor einer falschen Doppelspaltübertragung; 916 bleibt der eigenständige polychromatische Spektren-/Wellenlängenanwendungskontext.',
  'Eine Auswertung des Einzelspaltbeugungsbildes: Minima begründet berechnen, daraus Zentralbreite bestimmen und Nebenmaxima aus einem vorgegebenen Verlauf lokalisieren. Kein eigenständiges Aufstellen der Intensitätsverteilung; diese Modellierung bleibt beim unveränderten LK-Ziel f6a3a602. Datenablesung mit Fehlergrenze ersetzt keine exakte Halbordnungsregel.',
]
const mReasons = [
  'Keine zusätzliche Karte erforderlich: Die ganz-/halbzahligen Gangunterschiede werden aus Gleich-/Gegenphasigkeit begründet und in einer frischen Geometrie geprüft; eine auswendig gelernte Formel allein genügt nicht.',
  'Keine zusätzliche Karte erforderlich: Hauptmaximabedingung und Ordnungsgrenze werden im Aufgabenmodell aus der Gleichphasigkeit begründet. Die Unterscheidung von Spaltabstand und -breite sowie ein Gegenbeispiel zur Halbordnungsregel tragen das Verständnis.',
  'Keine zusätzliche Karte erforderlich: Paarweise Auslöschung begründet die Minima; Nebenmaxima werden ausdrücklich aus bereitgestellten Daten gelesen. Es besteht kein Bedarf, numerische Nebenmaximastellen oder eine Intensitätsformel auswendig zu speichern.',
]
const norm = (v: any) => String(v ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const stable = (v: any): string => Array.isArray(v) ? '[' + v.map(stable).join(',') + ']' : v && typeof v === 'object' ? '{' + Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => JSON.stringify(k) + ':' + stable(x)).join(',') + '}' : JSON.stringify(v)
const amFingerprint = (g: any, ruleVersion: string) => sha(stable({ ruleVersion, goalId: g.id, shortKey: g.shortKey ?? '', title: norm(g.title), titleEn: norm(g.titleEn), description: norm(g.description), descriptionEn: norm(g.descriptionEn), phase: norm(g.dimensionTags?.phase), area: norm(g.dimensionTags?.area), topicCode: norm(g.dimensionTags?.topicCode), nodeKind: norm(g.nodeKind) }))
const archive: any = { observedAt, parentGoal: beforeParent, records: {} }
for (const lane of ['atomic', 'memory'] as const) {
  const rows = read(paths[lane]).trimEnd().split('\n').map(line => JSON.parse(line))
  const prior = unique(rows, 'goalId', parentId)
  assert.equal(prior.fingerprint, amFingerprint(beforeParent, prior.ruleVersion))
  if (lane === 'memory') assert.equal(prior.status, 'no_memory_needed')
  archive.records[lane] = structuredClone(prior)
  const index = rows.indexOf(prior)
  rows.splice(index, 1, ...children.map((g: any, i: number) => {
    const shared = { schemaVersion: 1, reviewId: prior.reviewId, ruleVersion: prior.ruleVersion, landscapeId: canonical.landscapeId, goalId: g.id, fingerprint: amFingerprint(g, prior.ruleVersion), reviewedAt: observedAt.slice(0, 10), reviewer: 'OpenAI Codex c648 individual split author; AI, model unknown' }
    return lane === 'atomic' ? { ...shared, status: 'atomic', semanticAtomic: true, reason: aReasons[i], suggestedSplit: [] }
      : { ...shared, status: 'no_memory_needed', memoryUseful: false, reason: mReasons[i] }
  }))
  outputBytes.set(paths[lane], rows.map(r => JSON.stringify(r)).join('\n') + '\n')
}
const kinds = readJson(paths.kinds)
archive.records.kind = structuredClone(unique(kinds.decisions, 'goalId', parentId))
for (const id of [parentId, capstoneId, practiceId]) {
  const record = unique(kinds.decisions, 'goalId', id)
  const oldGoal = unique(beforeCanonical.goals, 'id', id)
  assert.equal(record.sourceFingerprint, fingerprintSemanticKindSourceGoal(oldGoal))
  record.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal(id))
  if (id === parentId) { record.semanticKind = 'curricularArea'; record.decisionBasis = 'reviewed-current-structural-split-curricular-area' }
}
for (const g of [...children, ...exams]) kinds.decisions.push({ goalId: g.id, sourceFingerprint: fingerprintSemanticKindSourceGoal(g), semanticKind: ids.includes(g.id) ? 'curricularAtomic' : 'practiceAssessment', decisionStatus: 'authoritative', decisionBasis: ids.includes(g.id) ? 'reviewed-current-structural-split-curricular-atomic' : 'reviewed-current-post-split-practice-assessment' })
kinds.decisions.sort((a: any, b: any) => a.goalId < b.goalId ? -1 : a.goalId > b.goalId ? 1 : 0)
for (const key of Object.keys(kinds.counts)) kinds.counts[key] = key === 'total' ? kinds.decisions.length : kinds.decisions.filter((r: any) => r.semanticKind === key).length
outputBytes.set(paths.kinds, json(kinds))

// Source mappings remain partial: a source bullet is not a mastery-transfer instruction.
const sourcePlan: any[] = []
const sourceConfigs = [
  { state: 'DE-BW', path: base + 'mapping/DE-BW/upper-secondary/bw_physics_upper_secondary_source_extraction_to_canonical_physics.review.json', replacements: {
    'bw-phys-sekii-3-4-5-b04-a01-4fb610f5': [oldDoubleId, ids[1]],
    'bw-phys-sekii-3-5-5-b04-a01-48bddaad': [oldDoubleId, ids[1]],
    'bw-phys-sekii-3-6-5-b06-a01-e3aa9020': ids,
  } },
  { state: 'DE-HE', path: base + 'mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json', replacements: {
    'he-phys-sekii-q3-1-b07-a01-7bb1b8cb': [oldDoubleId],
    'he-phys-sekii-q3-1-b13-a01-03a9ca89': [ids[2]],
    'he-phys-sekii-q3-1-b08-a01-1c9d7aa6': [ids[1]],
  } },
  { state: 'DE-BY', path: base + 'mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json', replacements: {
    '56801db7-c4d5-53ca-a765-73945bce4ff0': [],
    'b47189a1-27b3-5986-a29b-f7f4d43a59ac': [ids[1]],
    'b44c5542-925f-5bea-bbda-b641d0ee3ae7': [ids[2]],
    'd12fd0f2-4d61-5c9f-9824-ed03f7e3b2ea': [ids[1]],
    'b4193da7-ad13-5a31-9a3a-7c1afd8dedd4': [ids[0]],
    'e7949f0c-c726-59e7-9a1e-a2978b55c177': [ids[1]],
  } },
]
for (const config of sourceConfigs) {
  const doc = readJson(config.path), extraction = readJson(doc.sourceExtractionPath)
  for (const [sourceId, replacements] of Object.entries(config.replacements) as [string, string[]][]) {
    const decision = unique(doc.decisions, 'sourceGoalId', sourceId), sourceGoal = unique(extraction.sourceGoals, 'id', sourceId)
    const before = structuredClone(decision)
    decision.canonicalGoalIds = [...new Set(decision.canonicalGoalIds.filter((id: string) => id !== parentId).concat(replacements))]
    decision.rationale = 'Individuelle c648-Aufteilung anhand des vollständigen Originalaspekts: ' + (config.state === 'DE-BW' ? 'Basisfach nur Doppelspaltmaxima und Gitterhauptmaxima; Leistungsfach zusätzlich Doppelspaltminima und Einzelspaltminima. Originaldruckseiten 31/37/45 (PDF 33/39/47), nicht die fehlerhaften alten Extraktions-Seitenzahlen. ' : config.state === 'DE-HE' ? 'Q3.1 Originaldruckseite 41: Doppelspaltmaxima und Gitter-Wellenlängenanwendung GK/LK; Einzelspalt nur LK. Keine allgemeine GK-Minimapflicht. ' : 'Ph12 GA/EA unterscheiden: Gitteranwendung auch GA; vollständiges Doppelspaltmodell und Einzelspaltverlauf hier nur EA. ') + 'Die neuen Teilziele tragen nur den benannten fachlichen Teil; bestehende weitere Experiment-/Spektren-/Modellziele bleiben erhalten. Partielle Zuordnung, keine Masteryübertragung.'
    decision.reviewedAt = observedAt.slice(0, 10); decision.reviewer = 'OpenAI Codex c648 source author; AI, model unknown'
    doc.mappings = doc.mappings.filter((m: any) => !(m.legacyGoalId === sourceId && m.canonicalGoalId === parentId))
    for (const target of replacements) if (!doc.mappings.some((m: any) => m.legacyGoalId === sourceId && m.canonicalGoalId === target)) doc.mappings.push({ legacyGoalId: sourceId, canonicalGoalId: target, matchType: 'partial', reviewDecisionId: sourceId })
    sourcePlan.push({ path: config.path, source: sourceGoal, before, after: structuredClone(decision) })
  }
  assert.equal(doc.mappings.some((m: any) => m.canonicalGoalId === parentId), false)
  outputBytes.set(config.path, json(doc))
}
const legacyPath = base + 'mapping/DE-BW/upper-secondary/bw_physics_upper_secondary_to_canonical_physics.json'
const legacy = readJson(legacyPath)
const legacyReplacements: Record<string, string[]> = { '7b93414b-dd50-41c2-8f49-10778158e070': ids, '5562f1bb-ff4c-4fca-8230-fca0bcd1870d': [oldDoubleId, ids[1]] }
legacy.mappings = legacy.mappings.flatMap((m: any) => m.canonicalGoalId === parentId ? (legacyReplacements[m.legacyGoalId] ?? assert.fail('Unexpected legacy c648 mapping')).map(id => ({ ...m, canonicalGoalId: id, matchType: 'partial' })) : [m])
assert.ok(legacy.mappings.filter((m: any) => ids.includes(m.canonicalGoalId)).every((m: any) => m.matchType === 'partial'))
outputBytes.set(legacyPath, json(legacy))
const provenance = readJson(paths.provenance), provenanceGoals = unique(provenance.landscapes, 'landscapeId', canonical.landscapeId).goalProvenance
for (const [i, id] of ids.entries()) {
  assert.equal(provenanceGoals[id], undefined)
  provenanceGoals[id] = { sourceLandscapeId: 'eee2dc63-f96b-42c3-a2c9-b906432ccf5d', sourceGoalId: i === 1 ? 'bw-phys-sekii-3-4-5-b04-a01-4fb610f5' : 'bw-phys-sekii-3-6-5-b06-a01-e3aa9020' }
  assert.deepEqual(Object.keys(provenanceGoals[id]).sort(), ['sourceGoalId', 'sourceLandscapeId'])
}
outputBytes.set(paths.provenance, json(provenance))

const viewChecks: any[] = []
const withKinds = (doc: any, ledger: any) => ({ ...doc, goals: doc.goals.map((g: any) => ({ ...g, semanticKind: ledger.decisions.find((r: any) => r.goalId === g.id)?.semanticKind })) })
const oldKinds = JSON.parse(inputBytes.get(paths.kinds)!)
for (const name of readdirSync(base + 'composition-views/physik').filter(f => f.endsWith('.json'))) {
  const path = base + 'composition-views/physik/' + name
  const raw = readFileSync(path, 'utf8'); if (!raw.includes(parentId)) continue
  const doc = readJson(path), before = structuredClone(doc)
  const isGK = doc.scope.courseProfile === 'GK'
  const gkReplacement = JSON.stringify(before).includes(oldDoubleId) ? [ids[1]] : [oldDoubleId, ids[1]]
  let count = 0
  const rewrite = (nodes: any[]): any[] => nodes.flatMap(node => {
    if (node.kind === 'goalEntry' && node.goalId === parentId) {
      count++
      const contentNodes = isGK ? gkReplacement.map(id => ({ kind: 'goalEntry', goalId: id })) : [{ kind: 'canonicalSubtree', goalId: parentId }]
      const examIds = isGK ? [exams[1].id] : exams.map((e: any) => e.id)
      return [...contentNodes, { kind: 'structure', id: doc.viewId + '-slit-model-assessments', label: 'Prüfungsaufgaben zu Spaltmodellen', children: examIds.map((id: string) => ({ kind: 'goalEntry', goalId: id })) }]
    }
    if (Array.isArray(node.children)) node.children = rewrite(node.children)
    return [node]
  })
  doc.rootNodes = rewrite(doc.rootNodes); assert.equal(count, 1)
  const beforeFindings = compileCompositionView(before, withKinds(beforeCanonical, oldKinds)).findings
  const afterFindings = compileCompositionView(doc, withKinds(canonical, kinds)).findings
  const newErrors = afterFindings.filter((f: any) => f.severity === 'error' && !beforeFindings.some((b: any) => same(b, f)))
  assert.deepEqual(newErrors, [], name)
  viewChecks.push({ path, courseProfile: doc.scope.courseProfile, substitution: isGK ? gkReplacement : ['canonicalSubtree:' + parentId], existingDoubleSlitPlacementRetained: isGK && !gkReplacement.includes(oldDoubleId), nativeNewErrors: newErrors })
  outputBytes.set(path, json(doc))
}
assert.equal(viewChecks.length, 8)

// Pure in-memory DAG checks; no runtime or aggregate-QA invocation.
for (const relation of ['contains', 'requires']) {
  const visited = new Set<string>(), active = new Set<string>()
  const visit = (id: string) => { if (visited.has(id)) return; assert.equal(active.has(id), false, relation + ' cycle:' + id); active.add(id)
    for (const ref of goal(id)[relation] ?? []) { const local = typeof ref === 'string' ? ref.replace(canonical.landscapeId + ':', '') : ref.id ?? ref.goalId; if (canonical.goals.some((g: any) => g.id === local)) visit(local) }
    active.delete(id); visited.add(id)
  }; canonical.goals.forEach((g: any) => visit(g.id))
}
for (const exam of exams) { assert.equal(exam.requires.length, 1); assert.deepEqual(exam.requires, exam.examData.coveredGoalIds); assert.ok(practice.contains.includes(exam.id)) }
const kindById = new Map(kinds.decisions.map((r: any) => [r.goalId, r]))
for (const g of [parent, capstone, practice, ...children, ...exams]) assert.equal((kindById.get(g.id) as any).sourceFingerprint, fingerprintSemanticKindSourceGoal(g))

// Patience diff: small contextual apply_patch hunks without temporary filesystem writes.
function diffBlocks(a: string[], b: string[]) {
  const blocks: any[] = []
  const recurse = (a0: number, a1: number, b0: number, b1: number) => {
    while (a0 < a1 && b0 < b1 && a[a0] === b[b0]) { a0++; b0++ }
    while (a0 < a1 && b0 < b1 && a[a1 - 1] === b[b1 - 1]) { a1--; b1-- }
    if (a0 === a1 && b0 === b1) return
    const am = new Map<string, number[]>(), bm = new Map<string, number[]>()
    for (let i = a0; i < a1; i++) am.set(a[i], [...(am.get(a[i]) ?? []), i])
    for (let j = b0; j < b1; j++) bm.set(b[j], [...(bm.get(b[j]) ?? []), j])
    const pairs = [...am].filter(([line, pos]) => pos.length === 1 && bm.get(line)?.length === 1).map(([line, pos]) => [pos[0], bm.get(line)![0]])
    const tails: number[] = [], previous: number[] = []
    for (let k = 0; k < pairs.length; k++) { let lo = 0, hi = tails.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (pairs[tails[mid]][1] < pairs[k][1]) lo = mid + 1; else hi = mid }; previous[k] = lo ? tails[lo - 1] : -1; tails[lo] = k }
    if (!tails.length) { blocks.push({ a0, a1, b0, b1 }); return }
    const anchors: number[][] = []; for (let k = tails[tails.length - 1]; k >= 0; k = previous[k]) anchors.push(pairs[k]); anchors.reverse()
    for (const [x, y] of anchors) { recurse(a0, x, b0, y); a0 = x + 1; b0 = y + 1 }; recurse(a0, a1, b0, b1)
  }; recurse(0, a.length, 0, b.length)
  const merged: any[] = []; for (const block of blocks) { const last = merged.at(-1); if (last && block.a0 - last.a1 <= 10 && block.b0 - last.b1 <= 10) { last.a1 = block.a1; last.b1 = block.b1 } else merged.push({ ...block }) }; return merged
}
let activePatch = '*** Begin Patch\n'
for (const [path, after] of outputBytes) {
  const before = inputBytes.get(path)!; if (before === after) continue
  const a = before.trimEnd().split('\n'), b = after.trimEnd().split('\n')
  activePatch += '*** Update File: ' + path + '\n'
  const blocks = diffBlocks(a, b), rebuilt: string[] = []; let cursor = 0
  for (const block of blocks) { rebuilt.push(...a.slice(cursor, block.a0), ...b.slice(block.b0, block.b1)); cursor = block.a1 }; rebuilt.push(...a.slice(cursor)); assert.deepEqual(rebuilt, b, 'Diff reconstruction:' + path)
  for (const block of blocks) {
    const left = Math.min(5, block.a0, block.b0), right = Math.min(5, a.length - block.a1, b.length - block.b1)
    activePatch += '@@\n' + a.slice(block.a0 - left, block.a0).map(x => ' ' + x).join('\n') + (left ? '\n' : '')
    activePatch += a.slice(block.a0, block.a1).map(x => '-' + x).join('\n') + (block.a1 > block.a0 ? '\n' : '')
    activePatch += b.slice(block.b0, block.b1).map(x => '+' + x).join('\n') + (block.b1 > block.b0 ? '\n' : '')
    activePatch += a.slice(block.a1, block.a1 + right).map(x => ' ' + x).join('\n') + (right ? '\n' : '')
  }
}
const receipt = {
  artifactType: 'physics-c648-source-bound-split-proposed-change-v1', status: 'proposed_not_applied', observedAt,
  authority: { provider: 'OpenAI', model: 'unknown', modelVersion: 'unknown', humanApprovalClaimed: false },
  parentBefore: beforeParent, parentAfter: parent, newGoals: children, newAssessments: exams,
  capstoneDelta: { beforeRequires: beforeCapstone.requires, afterRequires: capstone.requires, beforeCovered: beforeCapstone.examData.coveredGoalIds, afterCovered: capstone.examData.coveredGoalIds, other39AndBodyUnchanged: same({ ...capstone, requires: beforeCapstone.requires, examData: beforeCapstone.examData }, beforeCapstone) },
  sourcePlan, viewChecks, atomicityReasons: aReasons, memoryReasons: mReasons,
  mainAuthorCountercheck: { status: 'pass', completeAssessmentFileRead: true, completeBilingualTasksSolutionsAndThirtyRubricItemsRead: true, actualEnglishInputsReparsed: checkedInput, recomputedGeometry: numerical, independentlyRecomputedTableRows: tableRows, distinction: 'The main integrating author independently recalculated the actual task values and intensity table; this is an AI countercheck, not human or learner evidence.' },
  originalSourceInspection: { HE: { path: base + 'input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-physik.pdf', printedPage: 41, originalPdfTextRead: true }, BW: { path: base + 'input/BW/BP2016BW_ALLG_GYM_PH_V2.pdf', printedPages: [31, 37, 45], physicalPdfPages: [33, 39, 47], originalPdfTextRead: true, warning: 'Extracted sourceRef page labels 29/35/43 are inaccurate for this retained revised PDF; original content and section identities were checked directly.' }, BY: { path: base + 'input/BY/gymnasium/Physik.json', originalRetainedGoalTextsRead: true, passages: ['Ph12-GA.3.2', 'Ph12-GA.3.3', 'Ph12-EA.3.6', 'Ph12-EA.3.7', 'Ph12-EA.3.8', 'Ph12-EA.3.10', 'Ph12-EA.4.10'] } },
  files: [...outputBytes].map(([path, after]) => ({ path, beforeSha256: sha(inputBytes.get(path)!), afterSha256: sha(after) })),
  sourceInputs: [...inputBytes].filter(([path]) => !outputBytes.has(path)).map(([path, bytes]) => ({ path, sha256: sha(bytes) })),
  assumptionsAndHolds: ['Only staging emission; no native M6, D, P or V release is claimed.', 'Three real mini-assessments each carry one goal, 10 points and proposed pass threshold 6; total points do not automatically establish goal mastery.', 'GK source scope uses existing max-only 627 plus grating; no GK single-slit or full double-slit minimum requirement.', 'Existing 627/f6 descriptions, existing36d5 and all other assessment bodies stay byte-semantically unchanged.', 'New source mappings are partial; no splitFromCanonicalGoalId, legacyMasterySourceGoalIds, parentGoalId mastery hint, aliases or state migration are written.', 'Parent A/M decisions and active image link are archived; old JPG files, D/P histories and V records are not overwritten.', 'Root must reconcile active D/P/V configuration and review children after images are imported, then run native source/view/route/M6 protected-floor gates before completion.', 'The old39 capstone body remains a known generic placeholder; preserved structural endpoints are not new semantic assessment approval.'],
}
const archivePath = stage + 'archived-parent-bindings.json', receiptPath = stage + 'layer-a-adoption-receipt.json'
assert.equal(existsSync(archivePath), false); assert.equal(existsSync(receiptPath), false)
for (const [path, value] of [[archivePath, archive], [receiptPath, { ...receipt, status: 'emitted_for_explicit_apply_patch_not_execution_attestation' }]] as [string, any][]) activePatch += '*** Add File: ' + path + '\n' + json(value).trimEnd().split('\n').map(line => '+' + line).join('\n') + '\n'
activePatch += '*** End Patch\n'
for (const [path, before] of inputBytes) assert.equal(readFileSync(path, 'utf8'), before, 'Concurrent input change:' + path)
process.stdout.write(JSON.stringify({ activePatch, receipt, summary: { status: 'proposal_checks_pass', observedAt, changedActiveFiles: outputBytes.size, canonicalNew: children.length + exams.length, newContentIds: ids, newAssessmentIds: exams.map((e: any) => e.id), capstoneRemainingCount: 39, activePatchSha256: sha(activePatch) } }))
