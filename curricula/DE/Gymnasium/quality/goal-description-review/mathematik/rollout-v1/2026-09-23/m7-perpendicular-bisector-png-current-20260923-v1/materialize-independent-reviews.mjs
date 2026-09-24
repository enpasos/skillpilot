// Materialize the two independently performed, current-image-bound AI candidate reviews.
// This file records their separate judgments; it does not grant human approval.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const expectedGoalId = '34200b88-c616-58f6-aa03-efb9fd766f88';
const expectedBundle = 'sha256:b60188593b5d77e1d2138711d7494e831b761ab242cb5b9faddc492c10ec2c20';
const expectedImage = 'sha256:2575b6288f6931529bd63d167a9e7fe4af21bd2ace9052fb8d3261c4b4b07db6';

const judgments = {
  a: {
    understandingEvidence: {
      essentialUnderstandingDe: 'Die Mittelsenkrechte einer Strecke mit verschiedenen Endpunkten ist die ganze Gerade durch deren Mittelpunkt, senkrecht zur Strecke. Genau ihre Punkte sind von beiden Endpunkten gleich weit entfernt; Zirkel- und Geodreieckkonstruktion führen zu derselben Geraden.',
      essentialUnderstandingEn: 'For a segment with distinct endpoints, its perpendicular bisector is the entire line through its midpoint, perpendicular to the segment. Exactly its points are equidistant from both endpoints; compass and set-square constructions produce the same line.',
      observablePerformanceDe: 'Die lernende Person konstruiert an selbstständig bearbeiteten Strecken die ganze Mittelsenkrechte sowohl mit Zirkel als auch mit Geodreieck, prüft Mittelpunkt und rechten Winkel und begründet die gleichen Endpunktabstände.',
      observablePerformanceEn: 'The learner constructs the entire perpendicular bisector of independently presented segments using both a compass and a set square, checks the midpoint and right angle, and justifies equal distances to the endpoints.',
      transferExpectationDe: 'Bei veränderter Streckenlage oder einer umgekehrten Ortslinienfrage bestimmt und begründet die lernende Person erneut die ganze Gerade und schließt aus gleichen Endpunktabständen auf die Zugehörigkeit eines Punktes.',
      transferExpectationEn: 'With a differently oriented segment or a converse locus question, the learner again identifies and justifies the entire line and infers a point’s membership from equal distances to the endpoints.',
    },
    rationale: 'KEEP: Die deutsche und englische Beschreibung meinen dieselbe zusammenhängende Konstruktions- und Begründungskompetenz. Die Quelle nennt Mittelsenkrechtenkonstruktion; die Voraussetzungen decken Geraden- und Winkelkonstruktion. Im aktuellen PNG sind A–M–B, rechter Winkel und ein gleichabständiger Beispielpunkt korrekt, aber nicht die ganze Gerade oder Zirkelbögen. Das Bild ist Lehrhilfe, kein Leistungsnachweis. Der separat und im Kriterienblatt mit Digest gelieferte aktuelle P-v2-Kandidat prüft beide Werkzeugverfahren und die umgekehrte Ortslinienfrage in unabhängigen Fällen; X ist ausdrücklich vom Mittelpunkt verschieden. Empfehlung none bedeutet, dass kein zusätzliches Profil benötigt wird; der bestehende P-v2-Status bleibt AI candidate ohne menschliche Freigabe. Die J8-Buchplatzierung wurde hier nicht neu als kanonische J7-Alterszuordnung freigegeben.',
    evidenceProfileRecommendation: 'none',
  },
  b: {
    understandingEvidence: {
      essentialUnderstandingDe: 'Bei zwei verschiedenen Endpunkten A und B ist die Mittelsenkrechte die ganze Gerade durch den Mittelpunkt von AB, die senkrecht auf AB steht. Genau ihre Punkte sind von A und B gleich weit entfernt; gleiche Zirkelradien größer als die halbe Streckenlänge beziehungsweise Mittelpunkt und Senkrechte führen zu derselben Geraden.',
      essentialUnderstandingEn: 'For distinct endpoints A and B, the perpendicular bisector is the entire line through the midpoint of AB at right angles to AB. Exactly its points are equidistant from A and B; equal compass radii greater than half the segment length or a midpoint and perpendicular construction lead to the same line.',
      observablePerformanceDe: 'Die lernende Person konstruiert zu einer neuen Strecke die vollständige Mittelsenkrechte sowohl mit Zirkel und zwei Bogenschnittpunkten als auch mit Geodreieck über Mittelpunkt und Senkrechte und begründet die Lage der Geraden mithilfe gleicher Abstände zu den Endpunkten.',
      observablePerformanceEn: 'For a new segment, the learner constructs the entire perpendicular bisector both with a compass and two arc intersections and with a set square using the midpoint and perpendicular, then justifies the line’s position using equal distances from the endpoints.',
      transferExpectationDe: 'Bei anders orientierter Strecke oder einer neuen Frage nach allen gleich weit von A und B entfernten Orten bestimmt sie ohne Bildvorlage die ganze Mittelsenkrechte, begründet die Zugehörigkeit eines neuen Punktes und erklärt, warum ein einzelner Punkt oder ein kurzes Lotstück nicht genügt.',
      transferExpectationEn: 'For a differently oriented segment or a new question about every location equidistant from A and B, the learner identifies the whole perpendicular bisector without copying an image, justifies why a new point belongs to it, and explains why one point or a short perpendicular segment is insufficient.',
    },
    rationale: 'KEEP: Konstruktion mit beiden Werkzeugen und Begründung durch gleiche Endpunktabstände bilden ein kohärentes Ziel; beide Sprachfassungen stimmen überein. Das aktuelle PNG in Originalgröße zeigt ein korrektes geometrisches Beispiel, aber nur PM und einen Punkt P, nicht die ganze Mittelsenkrechte oder Konstruktionsschritte. Im aktuellen P-v2-Fall X≠M sind die begründenden Dreiecke nicht entartet. Das gebundene Book-Input enthält technisch evidenceProfile:null; deshalb empfiehlt dieser unabhängige Review formal create, obwohl der separate aktuelle P-v2-Kandidat in den Kriterien benannt ist. Weder Bild noch P-Kandidatur sind menschliche Freigabe oder Lernendenleistungsnachweis. Die J8-Buchplatzierung wird durch diesen D-Review nicht neu als J7-Quelle autorisiert.',
    evidenceProfileRecommendation: 'create',
  },
};

for (const round of ['a', 'b']) {
  const here = join(root, `round-${round}`);
  const campaign = JSON.parse(readFileSync(join(here, 'description-review-campaign.json'), 'utf8'));
  const batch = campaign.batches[0];
  const [item] = readFileSync(join(here, 'batches', `${batch.batchId}.input.jsonl`), 'utf8').trim().split('\n').map(JSON.parse);
  if (campaign.goalCount !== 1 || item.goal.goalId !== expectedGoalId || item.bundleFingerprint !== expectedBundle ||
      item.goal.reviewContext.page.visualization?.originalDigest !== expectedImage) {
    throw new Error(`Unexpected ${round} campaign, goal, or image binding`);
  }
  const runId = `${campaign.campaignId}.run-001`;
  const goal = item.goal;
  const review = judgments[round];
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
    understandingEvidence: review.understandingEvidence,
    rationale: review.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: review.evidenceProfileRecommendation,
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  };
  const recordsBytes = Buffer.from(`${JSON.stringify(record)}\n`, 'utf8');
  const inputArtifacts = [
    ['book_pdf', join(root, 'bundle/book.pdf')],
    ['book_model', join(root, 'bundle/book-model.json')],
    ['review_input_json', join(root, 'bundle/review-input.json')],
    ['review_prompt', join(here, 'prompt.md')],
    ['review_criteria', join(here, 'criteria.md')],
    ['description_review_batch_input_jsonl', join(here, 'batches', `${batch.batchId}.input.jsonl`)],
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
    model: 'Codex subagent (runtime model ID not exposed)',
    role: 'subject_reviewer',
    promptFamilyId: 'goal-description-understanding-evidence-review-v2',
    promptFingerprint: campaign.promptFingerprint,
    criteriaFingerprint: campaign.criteriaFingerprint,
    generationParametersFingerprint: sha(Buffer.from(JSON.stringify({ campaign: campaign.campaignId, round, mode: 'independent-blind-review', output: 'ai_candidate' }))),
    independenceGroupId: campaign.independenceGroupId,
    blindToOtherRuns: true,
    goalIds: batch.goalIds,
    inputArtifacts: inputArtifacts.map(([role, path]) => ({ role, digest: sha(readFileSync(path)) })),
    startedAt: '2026-09-23T17:14:00.000Z',
    completedAt: new Date().toISOString(),
    status: 'completed',
    outputDigest: sha(recordsBytes),
    toolchainVersion: 'codex-api-review-v1',
  };
  const results = join(here, 'results');
  mkdirSync(results, { recursive: true });
  writeFileSync(join(results, `${batch.batchId}.records.jsonl`), recordsBytes);
  writeFileSync(join(results, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`);
  console.log(`${round}: ${runId}; ${record.decision}; ${record.evidenceProfileRecommendation}`);
}
