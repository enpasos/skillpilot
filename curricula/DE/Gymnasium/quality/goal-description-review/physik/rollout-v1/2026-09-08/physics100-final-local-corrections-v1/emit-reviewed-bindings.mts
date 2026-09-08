// Read-only patch emitter. Four individually read profiles and viewed original rasters;
// no blind D review, human approval, generated image, or blanket fingerprint refresh.
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
const root = process.cwd()
const m = await import(pathToFileURL(root + '/app/scripts/positiveGoalEvidenceProfileModel.ts').href)
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-final-local-corrections-v1'
const { corrections } = await import(pathToFileURL(root + '/' + base + '/authoring-spec.mjs').href)
const oldConfigPath = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-047-current-nuclear-electronics-mechanics-15-v1.retained-after-final-context-v1.config.json'
const old = JSON.parse(fs.readFileSync(oldConfigPath, 'utf8'))
const oldRows = fs.readFileSync(old.reviewPath, 'utf8').trim().split('\n').map(JSON.parse)
const goals = JSON.parse(fs.readFileSync(old.landscapePath, 'utf8')).goals
const kinds = JSON.parse(fs.readFileSync(old.semanticKindLedgerPath, 'utf8')).decisions
const qaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json'
const qa = JSON.parse(fs.readFileSync(qaPath, 'utf8'))
const reviewedAt = new Date().toISOString()
const reasons = {
  '6e7c35e0-7a38-5996-a42e-005038eff0db': 'DE/EN-Profil vollständig gegengelesen: Zustand -8 bei Schwelle 0 benötigt 8 und nicht die Topftiefe 40; angehobenes Niveau -3 benötigt 3; gemeinsame Nullpunktverschiebung ändert keinen Abstand. Originalbild vollständig gesichtet: Topf -10, Zustand -4, Schwelle 0 und Bindungsabstand 4 sind konsistent. Einteilchenmodell, keine Vielteilchen-Gesamtbindung.',
  '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2': 'DE/EN-Profil vollständig gegengelesen: eigener beaufsichtigter niedrig gelegener Video-Versuch mit kalibrierten Messpunkten, Unsicherheit und verändertem vx bleibt erforderlich; gegebene Daten ersetzen die Durchführung nicht. Originalbild vollständig gesichtet: vx=2, g=10, positive Fallrichtung und Punkte (0,0),(2,5),(4,20),(6,45) stimmen einschließlich beider Zeitgesetze und Parabel überein. Die jetzt expliziten Modellannahmen tragen Bild und beide Profilfälle bereits.',
  '12260012-cf04-5409-b57d-f5b3a46d9126': 'DE/EN-Profil vollständig gegengelesen: m=0,2 und g=10 ergeben Gewicht 2 N, k=0,02 führt zu vT=10, vierfaches k zu vT=5; beim Wechsel entsteht eine nach oben gerichtete resultierende Kraft 6 N trotz weiter nach unten gerichteter Geschwindigkeit. Originalbild vollständig gesichtet: drei gleiche Gewichtspfeile, wachsender Gegenpfeil, Kräftegleichgewicht bei konstanter positiver Geschwindigkeit und ausdrücklich vernachlässigter Auftrieb. Der korrigierte Titel vermeidet den Widerspruch freier Fall mit Luftwiderstand.',
  '853dbe54-85b0-59ab-8f3a-000c2b7746ec': 'DE/EN-Profil vollständig gegengelesen: idealisiertes Tc=90 K trennt 80 K und 95 K unter passenden Feld-/Strombedingungen; Messauflösung ist kein Nullwiderstandsbeweis. Dokumentierter Meißner-Zustand wird von einem bloßen Schwebevideo unterschieden. Originalbild vollständig gesichtet: qualitative Levitation und R(T)=0 unter Tc sind als begrenztes Zustandsmodell konsistent, keine Behauptung universeller Feldverdrängung bei jedem Feld. Kein Kryogenik-Selbstversuch.'
}
const records = corrections.map(c => {
  const g = goals.find(g => g.id === c.goalId)
  if (g.description !== c.description) throw Error('Unexpected authored goal ' + c.goalId)
  const kind = kinds.find(k => k.goalId === c.goalId)?.semanticKind
  if (kind !== 'curricularAtomic') throw Error('Unexpected kind ' + c.goalId)
  const r = structuredClone(oldRows.find(r => r.goalId === c.goalId))
  if (!r || r.reviewAuthority !== 'ai_candidate') throw Error('Missing AI profile ' + c.goalId)
  Object.assign(r, { reviewId: 'physics-four-local-model-corrections-current-20260908-v1', goalFingerprint: m.fingerprintGoalForPositiveEvidence(g, kind), reviewInputFingerprint: m.fingerprintPositiveGoalEvidenceReviewInput(g, r.reviewCriteriaFingerprint, {}, kind), reviewedAt, reviewer: 'OpenAI Codex /root; informed individual current-text/profile recheck', reason: reasons[c.goalId] + ' Unveränderter Profilkörper nach tatsächlicher Einzelprüfung; AI E1/G1, keine menschliche Freigabe und keine neue unabhängige D-Runde.' })
  const errors = m.validatePositiveGoalEvidenceRecordSemantics(r, g, {}, kind)
  if (errors.length) throw Error(errors.join('\n'))
  const q = qa.records.find(r => r.goalId === c.goalId)
  const digest = 'sha256:' + createHash('sha256').update(fs.readFileSync(q.canonicalAssetPath)).digest('hex')
  if (digest !== q.assetSha256 || q.aiApprovedAssetSha256 !== digest) throw Error('Unexpected image bytes ' + c.goalId)
  Object.assign(q, { title: g.title, description: g.description, aiApproved: 'yes', aiApprovedAssetSha256: digest, aiReviewedAt: reviewedAt, aiReviewer: 'codex-root-informed-current-text-original-image-review-20260908', aiNotes: reasons[c.goalId] + ' Originalbild unverändert behalten; tatsächliche informierte AI-Sichtung, keine Human- oder D-Freigabe.' })
  return r
})
const config = { ...old, reviewId: records[0].reviewId, reviewPath: base + '/positive-evidence.review.jsonl', scope: { label: 'Four individually reread model descriptions and unchanged positive-evidence bodies; informed AI E1/G1 only', goalIds: records.map(r => r.goalId) } }
const files = new Map([
  [base + '/positive-evidence.config.json', JSON.stringify(config, null, 2) + '\n'],
  [config.reviewPath, records.map(r => JSON.stringify(r)).join('\n') + '\n'],
  [base + '/reviewed-profile-image-bindings.receipt.json', JSON.stringify({ schemaVersion: 1, reviewedAt, method: 'Root personally read every DE/EN profile and viewed all four original full rasters; informed review, not blind', unchangedProfileBodies: true, unchangedImageBytes: true, humanApproval: false, newDescriptionReviewRounds: 0, sourceConfig: oldConfigPath, records: records.map(r => ({ goalId: r.goalId, goalFingerprint: r.goalFingerprint, profileFingerprint: r.profileFingerprint, imageSha256: qa.records.find(q => q.goalId === r.goalId).assetSha256, reason: r.reason })) }, null, 2) + '\n']
])
let patch = '*** Begin Patch\n'
for (const [p, body] of files) {
  if (fs.existsSync(p)) throw Error('Refuse overwrite ' + p)
  patch += '*** Add File: ' + p + '\n' + body.trimEnd().split('\n').map(l => '+' + l).join('\n') + '\n'
}
const d = spawnSync('diff', ['-u', qaPath, '-'], { input: JSON.stringify(qa, null, 2) + '\n', encoding: 'utf8', maxBuffer: 4000000 })
if (d.status !== 1) throw Error('Expected four QA binding updates')
patch += '*** Update File: ' + qaPath + '\n' + d.stdout.trimEnd().split('\n').slice(2).map(l => /^@@ .* @@/u.test(l) ? '@@' : l).join('\n') + '\n*** End Patch\n'
process.stdout.write(patch)
