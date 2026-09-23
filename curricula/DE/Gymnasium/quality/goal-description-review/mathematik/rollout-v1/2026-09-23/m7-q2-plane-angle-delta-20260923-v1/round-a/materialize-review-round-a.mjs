// Independent candidate D review of the current, PNG-bound single-goal batch.
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const batchRoot = resolve(here, '..');
const campaign = JSON.parse(readFileSync(join(here, 'description-review-campaign.json'), 'utf8'));
const batch = campaign.batches[0];
const batchInputPath = join(here, 'batches', `${batch.batchId}.input.jsonl`);
const [item] = readFileSync(batchInputPath, 'utf8').trim().split('\n').map((line) => JSON.parse(line));
if (campaign.goalCount !== 1 || batch.goalIds.length !== 1 || item.goal.goalId !== 'bda6a659-9640-53a5-8be0-24705ab623ef') {
  throw new Error('Unexpected single-goal batch binding');
}
if (item.goal.reviewContext.page.visualization?.originalDigest !== 'sha256:b18fe49e4af4129c45e5ed9adf33745e0c8e2fe53a9b91553caeb6a2515cdda4') {
  throw new Error('Review must bind the independently inspected corrected PNG');
}
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const runId = `${campaign.campaignId}.run-001`;
const goal = item.goal;
const record = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  recordId: `${runId}.001`,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  bundleFingerprint: item.bundleFingerprint,
  bookDigest: item.bookDigest,
  goalId: goal.goalId,
  goalFingerprint: goal.goalFingerprint,
  pageFingerprint: goal.pageFingerprint,
  currentTitleDe: goal.currentTitleDe,
  currentTitleEn: goal.currentTitleEn,
  currentDescriptionDe: goal.currentDescriptionDe,
  currentDescriptionEn: goal.currentDescriptionEn,
  decision: 'keep',
  understandingEvidence: {
    essentialUnderstandingDe: 'Zwei sich schneidende Ebenen bilden einen Schnittwinkel, der sich über beliebige von null verschiedene Normalenvektoren ermitteln lässt. Der Betrag des normierten Skalarprodukts macht den kleineren Ebenenwinkel unabhängig von der Orientierung der gewählten Normalen.',
    essentialUnderstandingEn: 'Two intersecting planes form an intersection angle that can be determined from any nonzero normal vectors. The absolute value of their normalized dot product makes the smaller plane angle independent of the chosen normals’ orientations.',
    observablePerformanceDe: 'Die lernende Person bestimmt oder verwendet passende Normalenvektoren, berechnet aus Skalarprodukt und Beträgen den kleineren Winkel, erläutert die Wirkung des Betrags und deutet das Ergebnis geometrisch als Schnittwinkel statt als Lage der Schnittgeraden.',
    observablePerformanceEn: 'The learner finds or uses suitable normal vectors, calculates the smaller angle from their dot product and magnitudes, explains the role of the absolute value, and interprets the result geometrically as the angle of intersection rather than the position of the intersection line.',
    transferExpectationDe: 'In einer unabhängig gegebenen Konfiguration wird einer der Normalenvektoren umgekehrt; die lernende Person berechnet denselben Ebenenwinkel erneut und begründet, warum die Änderung der Normalenorientierung den Winkel nicht verändert.',
    transferExpectationEn: 'In an independently presented configuration, one normal vector is reversed; the learner recalculates the same plane angle and explains why changing the normal orientation does not change that angle.'
  },
  rationale: 'KEEP: Die aktuelle DE/EN-Beschreibung verbindet eine einzige fachlich korrekte Kompetenz — Winkelberechnung über Normalen mit geometrischer Deutung. Das HMKB-Q2.3-Quellensegment nennt den Winkel Ebene–Ebene ausdrücklich und trennt ihn vom Winkel Gerade–Ebene; die beiden unmittelbaren Voraussetzungen liefern Normalenvektor und Skalarprodukt. Die aktuelle PNG mit SHA-256 b18fe49e… wurde eigenständig in Originalauflösung betrachtet: n_E=(1,0,0), n_F=(1,1,0), Betrag im Skalarprodukt und 45-Grad-Beispiel stimmen; der frühere falsche pauschale „spitze Winkel“-Satz steht dort nicht mehr. Die eingezeichnete Schnittgerade g ist nur für entsprechend durch den Ursprung gewählte Ebenen ein passendes Beispiel und folgt nicht allein aus den beiden Normalen; der Review leitet sie ausdrücklich nicht aus den Normalen ab. Kein neuer Bildfehler zwingt hier zu einer Textrevision. Die Grafik ist Lernhilfe, kein Leistungsnachweis; die positive Evidenz verlangt unabhängige Rechnung samt orientierungsinvariantem Transfer.',
  evidenceProfileContract: 'positive-understanding-evidence-v2',
  evidenceProfileRecommendation: 'create',
  recordStatus: 'candidate',
  reviewAuthority: 'ai_candidate'
};

const recordsBytes = Buffer.from(`${JSON.stringify(record)}\n`, 'utf8');
const artifactPaths = [
  ['book_pdf', join(batchRoot, 'bundle/book.pdf')],
  ['book_model', join(batchRoot, 'bundle/book-model.json')],
  ['review_input_json', join(batchRoot, 'bundle/review-input.json')],
  ['review_prompt', join(here, 'prompt.md')],
  ['review_criteria', join(here, 'criteria.md')],
  ['description_review_batch_input_jsonl', batchInputPath]
];
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint: campaign.bundleFingerprint,
  bookDigest: campaign.bookDigest,
  provider: 'openai',
  model: 'gpt-6',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha(Buffer.from(JSON.stringify({ campaign: campaign.campaignId, round: 'a', mode: 'blind-first-pass', output: 'candidate' }))),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: artifactPaths.map(([role, path]) => ({ role, digest: sha(readFileSync(path)) })),
  startedAt: '2026-09-23T02:01:00.000Z',
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha(recordsBytes),
  toolchainVersion: 'codex-api-review-v1'
};
const results = join(here, 'results');
mkdirSync(results, { recursive: true });
writeFileSync(join(results, `${batch.batchId}.records.jsonl`), recordsBytes);
writeFileSync(join(results, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`);
console.log(JSON.stringify({ runId, goalId: goal.goalId, decision: record.decision, pageFingerprint: record.pageFingerprint }));
