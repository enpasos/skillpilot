import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// Legacy ledger payloads have no shared complete TypeScript interface.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>
const root = resolve(import.meta.dirname, '../..')
const write = process.argv.includes('--write')
if (process.argv.slice(2).some(argument => argument !== '--write')) throw new Error('Only --write is supported')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const sha = (value: string) => createHash('sha256').update(value).digest('hex')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const json = (path: string): Json => JSON.parse(read(path))
const serialize = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`

// Every field and complete original text hash was inspected individually.
// This is NOT an ae/oe/ue normalizer or a recursive replacement operation.
const fields: ReadonlyArray<readonly [string, string, string, number, string?, string?]> = [
  ['9fd26b99-b790-5efd-8858-c7e6c20b005e', 'description', '5cf8ec39e9d70e44cf265941851ab5ab2d3d70a5ef673a423e179c8fddf557b9', 1],
  ['cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f', 'title', '8dc66fe1671ae47b9fdaf0218b2b06eb900ea043e9a4daea24d3425f5e8f50aa', 1],
  ['cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f', 'description', 'c858f4143f91c3cced44d455ddb451720b7324de49e635a4b4e177d96014edec', 1],
  ['cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f', 'resourceLinks.0.title', 'aa0d4e21f54e08c085f3d631966859fc1fb7d25658b5a847398b8ee2b761cfce', 1],
  ['cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f', 'resourceLinks.0.description', '3dfc1254867caa0d0cafcb9e3bbafca7dd4469870710541115f5e4147595c4f1', 1],
  ['cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f', 'resourceLinks.0.altText', 'fb7c4614eb6fcde26c288a5a29839c40bdb24bf4ddf998d92c0f4f828d7ccaff', 2],
  ['22bdd29e-00d3-5d43-97d6-8b442b8bfc8c', 'title', '002b8bab165c1d8246cdad47ce2db9b6644e8cc41a676fa0d174481186f91daa', 1],
  ['22bdd29e-00d3-5d43-97d6-8b442b8bfc8c', 'description', '936260b69695b6a00c3013dfd2c3a5c958fc0b7905afbccf013455cecd7241d6', 1],
  ['22bdd29e-00d3-5d43-97d6-8b442b8bfc8c', 'examData.taskContent', 'ac82938180e441b5fcff7043a162efdb4eb4efaac848f8ed6ae6087fe1ce1879', 2],
  ['22bdd29e-00d3-5d43-97d6-8b442b8bfc8c', 'examData.solutionContent', '635b5237cee888366ba8ca29455e53e174931ba96129aff728f1fa8e6ba5471b', 1],
  ['22bdd29e-00d3-5d43-97d6-8b442b8bfc8c', 'examData.scoring.steps.0.description', 'f15c5211bee854d96d0bae16e171ca6f00700e441b0b8728f845084fd08672d7', 1],
  ['706703af-b936-5e64-8fe2-ab1128feaf49', 'title', 'ecdde4634a8e3ae0de127bcc2e07718bd41cfa31c0d6da48322a23d659e5e485', 1],
  ['706703af-b936-5e64-8fe2-ab1128feaf49', 'examData.taskContent', 'c1400cd137fb1e890a5a6640c8d90a13bdfb18302868bd87617ea67ef8b44747', 2],
  ['706703af-b936-5e64-8fe2-ab1128feaf49', 'examData.solutionContent', 'ea9aaa5f9944a51205c902a34333cc8476f6f4f0ede343251b24bcfd1cf386db', 1],
  ['706703af-b936-5e64-8fe2-ab1128feaf49', 'examData.scoring.steps.0.description', '1288b0986a36fa4d3296647b2a1c75cf954377753c503f201a7d681a4b4a5ac1', 1],
  ['e73de7c5-5f09-5e84-8a95-8d764b422ec3', 'examData.taskContent', '0459c7f2812b98c6e78c47388492c37aa4e5b76c3a4947508bf53e32552b8ae0', 3],
  ['e73de7c5-5f09-5e84-8a95-8d764b422ec3', 'examData.scoring.steps.0.description', '81927212dfebd023fd97bb2c7164b51926df74cd0843930724593a3d2b9e2544', 1],
  ['22561c66-3957-5d55-b07a-25de1f359930', 'examData.taskContent', 'f002ddd86df983be4ac5d861c1a82283f0d520e7ba8814d2b7427419ca71f337', 2, 'köffizient', 'koeffizient'],
  ['5773ccbe-cd20-5ba0-99a5-7ccd5f42be51', 'examData.taskContent', 'da5aa5cd25a2df8893ace96573781d1a80b406a3704e01b7765219e29003cb74', 1, 'köffizient', 'koeffizient'],
  ['8320bb17-e6ab-50ea-a965-aa331bfd33e1', 'examData.taskContent', '697505760fe64f8d9072c8040780f3e2700c0fe2b487ed944709bc78db0c3b13', 1, 'köffizient', 'koeffizient'],
  ['8320bb17-e6ab-50ea-a965-aa331bfd33e1', 'examData.solutionContent', '905761db306790686834d2aca0e6169d818026769e8b221c75dadc5000bb5f03', 1, 'köffizient', 'koeffizient'],
  ['8320bb17-e6ab-50ea-a965-aa331bfd33e1', 'examData.scoring.steps.3.description', '1d9020c7f66c57b6aaedc53f3d2081a5dbfc917b843aca691bbef5dca364dfc5', 1, 'köffizient', 'koeffizient'],
  ['5733c2c5-be2d-5879-89db-4ed4e5f3eff3', 'examData.taskContent', '039864450db655a5fdabdd9233dad69737fc4f47e77ce1c1bab6f9b3e8c8d33b', 1, 'köffizient', 'koeffizient'],
  ['5733c2c5-be2d-5879-89db-4ed4e5f3eff3', 'examData.scoring.steps.1.description', '07b609dccb1cbb49e7d317f5db563f0dd6041a0287ed29386e7f44115c6d478f', 1, 'köffizient', 'koeffizient'],
  ['5c6d2ec8-d692-5ad2-a72a-8a9e5544a6c7', 'examData.taskContent', '75b30ade95a6699e6bd95fb18c3196fede4d1cbd98542663f75a8d3a77f973e7', 1, 'köffizient', 'koeffizient'],
  ['5c6d2ec8-d692-5ad2-a72a-8a9e5544a6c7', 'examData.scoring.steps.1.description', 'c33b1e1bf2bdcf905d07cb349a33415460586deed251df457f8606ab276e2683', 1, 'köffizient', 'koeffizient'],
  ['dd99528a-bae5-5b78-89e6-c6092c927f8d', 'examData.taskContent', '2af5fc0836c80bdb4b656e25ef5e359f083f15515997b042cbbb7a3b8871a497', 2, 'köffizient', 'koeffizient'],
] as const

const caseReasons: Record<string, string> = {
  '9fd26b99-b790-5efd-8858-c7e6c20b005e': 'Die Beschreibung nennt den Fotoeffekt als Teilchenmodell-Evidenz; Foto und Effekt behalten getrennte Buchstaben o/e.',
  'cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f': 'Lernziel und Bildbeschriftungs-Metadaten bezeichnen den Fotoeffekt und seine Einstein-Deutung; Fotoeffekt ist die richtige Fachschreibung.',
  '22bdd29e-00d3-5d43-97d6-8b442b8bfc8c': 'Die Aufgabe, Lösung und Bewertung behandeln das Photonenmodell des Fotoeffekts; nur dessen Fachschreibung wird berichtigt.',
  '706703af-b936-5e64-8fe2-ab1128feaf49': 'Der GK-Prüfungsvorschlag bezeichnet den Fotoeffekt, auch in Teilaufgabe und Bewertung; getrenntes o/e ist fachsprachlich korrekt.',
  'e73de7c5-5f09-5e84-8a95-8d764b422ec3': 'Die LK-Quantenanalyse bezieht sich in Aufgabenstellung und Bewertung auf den Fotoeffekt; kein Umlaut gehört in diesen Fachbegriff.',
  '22561c66-3957-5d55-b07a-25de1f359930': 'Die Kräftebilanz nennt Haftreibungs- und Gleitreibungskoeffizient als Reibungsparameter; Koeffizient behält o/e auch im Kompositum.',
  '5773ccbe-cd20-5ba0-99a5-7ccd5f42be51': 'Der Reibungsparameter der Kreisbewegungsaufgabe heißt Reibungskoeffizient; die physikalische Größe und ihr Zahlenwert bleiben unverändert.',
  '8320bb17-e6ab-50ea-a965-aa331bfd33e1': 'Aufgabe, Lösung und Bewertung der überhöhten Kurve meinen den Haftreibungs- beziehungsweise Reibungskoeffizienten; nur Koeffizient wird richtig geschrieben.',
  '5733c2c5-be2d-5879-89db-4ed4e5f3eff3': 'Röntgen-CT und Werkstoffprüfung verwenden einen Schwächungskoeffizienten; Aufgabe und Bewertung müssen denselben korrekt geschriebenen Fachbegriff verwenden.',
  '5c6d2ec8-d692-5ad2-a72a-8a9e5544a6c7': 'Die Röntgenprüfung der Batteriezellen nennt den Schwächungskoeffizienten in Aufgabe und Bewertung; o/e bleiben getrennt.',
  'dd99528a-bae5-5b78-89e6-c6092c927f8d': 'Das Bewegungsmodell unterscheidet Reibungs- und Haftreibungskoeffizienten; die zusammengesetzten Fachbegriffe behalten die Schreibung Koeffizient.',
}

const landscape = json(canonicalPath)
const beforeGoals = new Map<string, Json>((landscape.goals as Json[]).map(goal => [goal.id, structuredClone(goal)]))
const goals = new Map<string, Json>((landscape.goals as Json[]).map(goal => [goal.id, goal]))
const auditFields: Json[] = []
for (const [goalId, path, beforeHash, count, incorrect = 'Fotöffekt', corrected = 'Fotoeffekt'] of fields) {
  const keys = path.split('.')
  const target = keys.slice(0, -1).reduce((value: Json, key) => value[key] as Json, goals.get(goalId)!)
  const key = keys.at(-1)!
  const value: string = target[key]
  const before = value.includes(incorrect) ? value : value.replaceAll(corrected, incorrect)
  if (sha(before) !== beforeHash || before.split(incorrect).length - 1 !== count) {
    throw new Error(`Unreviewed field drift: ${goalId} ${path}`)
  }
  const after = before.replaceAll(incorrect, corrected)
  const originalTarget = keys.slice(0, -1).reduce((value: Json, key) => value[key] as Json, beforeGoals.get(goalId)!)
  originalTarget[key] = before
  target[key] = after
  const reason = caseReasons[goalId]
  if (!reason) throw new Error(`Missing individual case rationale: ${goalId}`)
  auditFields.push({ goalId, field: path, reason, incorrect, corrected, before, after, beforeSha256: `sha256:${beforeHash}`, afterSha256: `sha256:${sha(after)}`, occurrences: count })
}

const outputs = new Map<string, string>([[canonicalPath, serialize(landscape)]])
const changedIds = new Set(fields.map(([id]) => id))
const semanticPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const semantics = json(semanticPath)
for (const id of changedIds) {
  const decision = (semantics.decisions as Json[]).find(item => item.goalId === id)!
  const before = fingerprintSemanticKindSourceGoal(beforeGoals.get(id)!)
  const after = fingerprintSemanticKindSourceGoal(goals.get(id)!)
  if (![before, after].includes(decision.sourceFingerprint)) throw new Error(`Stale semantic kind before correction: ${id}`)
  decision.sourceFingerprint = after
}
outputs.set(semanticPath, serialize(semantics))

const normalize = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const stableJson = (value: Json) => `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${JSON.stringify(child)}`).join(',')}}`
const fingerprint = (goal: Json, ruleVersion: string) => `sha256:${sha(stableJson({
  ruleVersion, goalId: goal.id, shortKey: goal.shortKey ?? '', title: normalize(goal.title), titleEn: normalize(goal.titleEn),
  description: normalize(goal.description), descriptionEn: normalize(goal.descriptionEn), phase: normalize(goal.dimensionTags?.phase),
  area: normalize(goal.dimensionTags?.area), topicCode: normalize(goal.dimensionTags?.topicCode), nodeKind: normalize(goal.nodeKind),
}))}`
const id = 'cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f'
const correctionNote = 'Orthografischer Einzelfall 2026-09-07: Fotoeffekt statt Fotöffekt; Kompetenzumfang und vorhandene fachliche Entscheidung unverändert, keine neue Gesamt-QS-Freigabe.'
for (const [folder, ruleVersion] of [['semantic-atomicity', 'semantic-atomicity-v1'], ['memory-card-review', 'memory-card-review-v1']]) {
  const path = `curricula/DE/Gymnasium/quality/${folder}/canonical-physics-full.review.jsonl`
  const records: Json[] = read(path).trim().split('\n').map(line => JSON.parse(line))
  const record = records.find(item => item.goalId === id)!
  const before = fingerprint(beforeGoals.get(id)!, ruleVersion)
  const after = fingerprint(goals.get(id)!, ruleVersion)
  if (![before, after].includes(record.fingerprint)) throw new Error(`Stale ${folder} before correction`)
  record.fingerprint = after
  record.reviewedAt = '2026-09-07'
  record.reviewer = 'codex-fotoeffekt-orthography-case-review-2026-09-07'
  if (!record.reason.includes(correctionNote)) record.reason += ` ${correctionNote}`
  outputs.set(path, `${records.map(record => JSON.stringify(record)).join('\n')}\n`)
}
const qaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json'
const qa = json(qaPath)
const qaRecord = (qa.records as Json[]).find(record => record.goalId === id)!
qaRecord.title = goals.get(id)!.title
qaRecord.description = goals.get(id)!.description
qa.records.sort((left: Json, right: Json) => left.title.localeCompare(right.title, 'de-DE', { numeric: true, sensitivity: 'base' }) || left.goalId.localeCompare(right.goalId))
outputs.set(qaPath, serialize(qa))

const promptPath = `curricula/DE/Gymnasium/visualizations/physik/${id}/prompt.de.md`
const prompt = read(promptPath)
if (!prompt.includes(`SkillPilot-ID: \`${id}\``)) throw new Error('Unbound visualization prompt')
const promptBefore = prompt.includes('Fotöffekt') ? prompt : prompt
  .replace('# Lernzielvisualisierung: Fotoeffekt', '# Lernzielvisualisierung: Fotöffekt')
  .replaceAll('Titel: Fotoeffekt', 'Titel: Fotöffekt')
  .replaceAll('kann den Fotoeffekt beschreiben', 'kann den Fotöffekt beschreiben')
if (promptBefore.split('Fotöffekt').length - 1 !== 5) throw new Error('Unexpected active prompt binding')
outputs.set(promptPath, promptBefore.replaceAll('Fotöffekt', 'Fotoeffekt'))

const auditPath = 'curricula/DE/Gymnasium/quality/orthography/physics-fotoeffekt-2026-09-07.review.json'
outputs.set(auditPath, serialize({
  schemaVersion: 1, reviewId: 'physics-fotoeffekt-spelling-2026-09-07', reviewedAt: '2026-09-07',
  reviewer: 'codex-fotoeffekt-orthography-case-review-2026-09-07', sourcePath: canonicalPath,
  reason: 'Foto + Effekt and Reibungs-/Schwächungskoeffizient retain separate o/e. The 2026-03-13 curriculum update introduced the Fotoeffekt corruption. Every listed scientific term and full field was inspected; no general umlaut conversion is performed.',
  approvedBy: 'product-owner-explicit-user-correction-2026-09-07',
  unchanged: ['all goal IDs and edges', 'all assessment numbers, formulas and demands', 'all English text', 'all images and image approval decisions', 'historical review evidence and source archives'],
  followUp: 'This spelling correction is not a substantive re-review or renewed approval of the bundled assessment tasks.',
  visualizationPrompt: { path: promptPath, titleAndDescriptionBindings: 5, beforeSha256: `sha256:${sha(promptBefore)}`, afterSha256: `sha256:${sha(outputs.get(promptPath)!)}` },
  semanticKindBindings: [...changedIds].map(goalId => ({ goalId, before: fingerprintSemanticKindSourceGoal(beforeGoals.get(goalId)!), after: fingerprintSemanticKindSourceGoal(goals.get(goalId)!) })),
  fields: auditFields,
}))
for (const [path, bytes] of outputs) {
  if (write) { mkdirSync(dirname(resolve(root, path)), { recursive: true }); writeFileSync(resolve(root, path), bytes) }
  else if (read(path) !== bytes) throw new Error(`Correction missing or drifted: ${path}`)
}
console.log(`CHECK physics_fotoeffekt_spelling ${write ? 'WRITE' : 'PASS'} goals=${changedIds.size} fields=${fields.length} files=${outputs.size}`)
