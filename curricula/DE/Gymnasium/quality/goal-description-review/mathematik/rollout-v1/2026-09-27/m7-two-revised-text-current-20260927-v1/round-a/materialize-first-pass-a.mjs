import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const round = dirname(fileURLToPath(import.meta.url));
const results = join(round, 'results');
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const campaign = readJson(join(round, 'description-review-campaign.json'));
const input = readJson(join(round, 'description-review-input.json'));
const bundle = readJson(join(round, 'review-bundle-manifest.json'));
const batch = campaign.batches[0];
const batchBytes = readFileSync(join(round, 'batches', `${batch.batchId}.input.jsonl`));
const recordSchemaBytes = readFileSync(join(round, 'contracts/goal-description-review-record.schema.json'));
const promptBytes = readFileSync(join(round, 'prompt.md'));
const criteriaBytes = readFileSync(join(round, 'criteria.md'));

assert.equal(campaign.goalCount, 2);
assert.equal(campaign.batches.length, 1);
assert.equal(input.goals.length, 2);
assert.deepEqual(input.goals.map((goal) => goal.goalId), batch.goalIds);
assert.equal(sha(batchBytes), batch.batchInputFingerprint);
assert.equal(sha(recordSchemaBytes), campaign.recordSchemaDigest);
assert.equal(sha(promptBytes), campaign.promptFingerprint);
assert.equal(sha(criteriaBytes), campaign.criteriaFingerprint);
assert.equal(campaign.bundleFingerprint, bundle.bundleFingerprint);
assert.equal(campaign.bookDigest, bundle.bookModelDigest);
assert.equal(campaign.reviewInputFingerprint, input.reviewInputFingerprint);

// Authored blind first-pass decisions for the two bound, current-state goals.
const decisions = {
  '09f47964-2cd0-410e-93ee-9632b582fc91': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Eine reellwertige Funktion ordnet jedem zulässigen Eingabewert genau einen reellen Funktionswert zu. Term, Wertetabelle und Graph zeigen dieselben Eingabe-Ausgabe-Paare der gegebenen Funktion innerhalb ihrer Definitionsmenge.',
      essentialUnderstandingEn: 'A real-valued function assigns exactly one real output to each permitted input. Its expression, value table, and graph show the same input-output pairs of the given function within its domain.',
      observablePerformanceDe: 'Die lernende Person erklärt an einer gegebenen Funktion selbstständig die eindeutige Zuordnung und gleicht für ausgewählte zulässige Eingaben die Funktionswerte im Term, in der Wertetabelle und im Graphen ab.',
      observablePerformanceEn: 'For a given function, the learner independently explains the unique assignment and matches the function values for selected permitted inputs in its expression, value table, and graph.',
      transferExpectationDe: 'Bei einer neuen Zuordnung mit eingeschränkter Definitionsmenge, die zuerst als Graph statt als Term vorliegt, prüft die lernende Person die Eindeutigkeit der Werte und ordnet passende Punkte einer Wertetabelle den zulässigen Eingaben zu.',
      transferExpectationEn: 'For a new assignment with a restricted domain, presented first as a graph rather than an expression, the learner checks whether outputs are unique and matches suitable value-table entries to the permitted inputs.',
    },
    rationale: 'Die aktuelle deutsche und englische Beschreibung verbinden den Funktionsbegriff mit der Koordination seiner drei Darstellungen als eine zusammenhängende AB1-Kompetenz. Sie fordern weder eine allgemeine Bestimmung der Definitions- oder Wertemenge noch spätere Graphenanalysen. Der Hessen-KC 2024 nennt in E.1 grundlegende Begriffe und Darstellungen anhand ganzrationaler Funktionen; die allgemeine Definition einer reellwertigen Funktion ist mathematisch korrekt. Ein direkter sourceRef fehlt hier. Die raw applicability über mehrere Länder und die wirksame learner-facing Projektion sind mit dem gebundenen Paket nicht als Quellenzuordnung belegt; diese keep-Entscheidung bestätigt sie nicht.',
  },
  '0e8417d7-effb-5314-93ba-a571b01726ce': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Bei geeigneten Verknüpfungen von Exponential- und ganzrationalen Funktionen muss eine verwendete Stammfunktion beim Ableiten genau den Integranden ergeben. Die Verknüpfungsstruktur bestimmt, wie ein passender Ansatz gefunden und geprüft wird.',
      essentialUnderstandingEn: 'For suitable combinations of exponential and polynomial functions, differentiating an antiderivative used must reproduce the integrand exactly. The structure of the combination determines how a suitable candidate is found and checked.',
      observablePerformanceDe: 'Die lernende Person berechnet selbstständig ein Integral einer geeigneten Exponential-Polynom-Verknüpfung, erläutert die für ihren Lösungsweg maßgebliche Verknüpfung und weist die verwendete Stammfunktion durch Ableiten nach.',
      observablePerformanceEn: 'The learner independently computes an integral of a suitable exponential-polynomial combination, explains the combination relevant to their chosen approach, and verifies the antiderivative used by differentiating it.',
      transferExpectationDe: 'Bei einem unabhängig gestellten Integral, dessen geeignete Verknüpfung sich strukturell ändert, etwa von einer Summe zu einer Verkettung mit linearem innerem Term, passt die lernende Person ihren Lösungsweg an und bestätigt die neue Stammfunktion durch Ableiten.',
      transferExpectationEn: 'For an independently presented integral whose suitable combination changes in structure, for example from a sum to a composition with a linear inner expression, the learner adapts the approach and confirms the new antiderivative by differentiating it.',
    },
    rationale: 'Die aktuelle DE/EN-Formulierung ist knapp, mathematisch kohärent und nennt den Stammfunktionsnachweis als Teil derselben Integral-Kompetenz. Geeignete Verknüpfungen begrenzt die Aufgabe auf Fälle mit einem im Unterricht zugänglichen Stammfunktionsweg; der Text behauptet nicht, jede beliebige Produkt- oder Verkettungsform sei elementar integrierbar. Der zitierte Hessen-KC 2024, Q4.1 S. 51, nennt Addition, Multiplikation und Verkettung sowie Integralberechnung mit Stammfunktionsnachweis durch Ableiten auf grundlegendem GK/LK-Niveau. Die Nachbarleistung Untersuchung von Funktionenscharen wird damit nicht zusätzlich eingefordert. Die raw applicability außerhalb Hessens und die effektive Projektion sind ohne gesonderte Mapping- und View-Belege nicht bestätigt.',
  },
};

const runId = `${batch.batchId}.codex-review`;
const records = input.goals.map((goal, index) => {
  const decision = decisions[goal.goalId];
  assert.ok(decision, `Missing decision for ${goal.goalId}`);
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${campaign.campaignId}.${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    goalId: goal.goalId,
    goalFingerprint: goal.goalFingerprint,
    pageFingerprint: goal.pageFingerprint,
    currentTitleDe: goal.currentTitleDe,
    currentTitleEn: goal.currentTitleEn,
    currentDescriptionDe: goal.currentDescriptionDe,
    currentDescriptionEn: goal.currentDescriptionEn,
    ...decision,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: goal.reviewContext.evidenceProfile === null ? 'create' : 'revise',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  };
});
assert.equal(Object.keys(decisions).length, records.length);

const recordsBytes = Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`);
const runtimeDisclosure = {
  provider: 'OpenAI',
  model: 'Codex (exact model not exposed)',
  generationParameters: 'not exposed in this interactive session',
  fingerprintMeaning: 'Digest of this disclosure, not a claim that hidden generation parameters are known',
};
const runtimeDisclosureBytes = Buffer.from(`${JSON.stringify(runtimeDisclosure, null, 2)}\n`);
const timestamp = new Date().toISOString();
const artifactDigest = (role) => {
  const artifact = bundle.artifacts.find((entry) => entry.role === role);
  assert.ok(artifact, `Missing bundle artifact ${role}`);
  return { role, digest: artifact.digest };
};
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
  provider: runtimeDisclosure.provider,
  model: runtimeDisclosure.model,
  role: 'subject_reviewer',
  promptFamilyId: 'skillpilot-goal-description-understanding-evidence-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha(runtimeDisclosureBytes),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    artifactDigest('review_prompt'),
    artifactDigest('review_criteria'),
    artifactDigest('review_input_json'),
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt: timestamp,
  completedAt: timestamp,
  status: 'completed',
  outputDigest: sha(recordsBytes),
  toolchainVersion: 'codex-math-description-review-a-v1',
};

mkdirSync(results, { recursive: true });
writeFileSync(join(results, `${batch.batchId}.records.jsonl`), recordsBytes);
writeFileSync(join(results, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`);
writeFileSync(join(round, 'runtime-disclosure.json'), runtimeDisclosureBytes);
console.log(`Materialized ${records.length} candidate records for ${batch.batchId}`);
