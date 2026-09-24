// Blind independent Round B candidate review for the current four-image Math bundle.
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const bundleRoot = resolve(here, '..', 'bundle');
const repoRoot = resolve(here, ...Array(10).fill('..'));
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const campaign = readJson(join(here, 'description-review-campaign.json'));
const batch = campaign.batches[0];
const batchInputPath = join(here, 'batches', `${batch.batchId}.input.jsonl`);
const items = readFileSync(batchInputPath, 'utf8').trim().split('\n').map((line) => JSON.parse(line));

if (
  campaign.bundleFingerprint !== 'sha256:c2ec5163962e7d3b4204fb8966258e055c9b7da5fc609e96dbb6a5bb8e926396' ||
  campaign.goalCount !== 4 || items.length !== 4 || batch.goalIds.length !== 4 ||
  sha(readFileSync(join(here, 'criteria.md'))) !== campaign.criteriaFingerprint ||
  sha(readFileSync(join(here, 'prompt.md'))) !== campaign.promptFingerprint ||
  sha(readFileSync(join(here, 'contracts/goal-description-review-record.schema.json'))) !== campaign.recordSchemaDigest ||
  sha(readFileSync(join(repoRoot, 'curricula/DE/Gymnasium/quality/goal-evidence/m7-four-comic-png-current-20260923-v1.review.jsonl'))) !== 'sha256:35cbc14e52971ea917d90204424beb7b6cbd55e036da511dd4e75f96a2be8ee1'
) {
  throw new Error('Round B bundle, criteria, schema, or P-v2 binding changed');
}

const expectedImages = [
  ['e495fa38-b198-5280-a405-9e41cafd6d17', 'sha256:165fb00a213aa4f21401a2e4a121c1121cce7dc27ed28ab047c932520e01152b'],
  ['5a2371fd-74ce-5013-932e-35d3713aeaf7', 'sha256:aa578a6d6fddbd68fdb3a91ba4e535a481880cbc69092bbab7e2c6dc8c894fec'],
  ['f17935b0-189f-5e0c-988d-ce508b710097', 'sha256:4d800383ced84863c26e5d832e95b0a451c98434d46c41c6c6e387ab97008ca2'],
  ['740ab443-776a-5c7a-8f1d-2b0b59a5ed32', 'sha256:75f3b4f6f85a9ab593641eebeca408c486ff16510c0ff18a62927a50856bf522']
];
for (const [index, [goalId, digest]] of expectedImages.entries()) {
  const item = items[index];
  if (
    batch.goalIds[index] !== goalId || item.goal.goalId !== goalId ||
    item.bundleFingerprint !== campaign.bundleFingerprint ||
    item.bookDigest !== campaign.bookDigest ||
    item.reviewInputFingerprint !== campaign.reviewInputFingerprint ||
    item.goal.reviewContext.page.visualization?.originalDigest !== digest
  ) {
    throw new Error(`Stale Round B batch binding at ${goalId}`);
  }
  const imagePath = join(repoRoot, 'curricula/DE/Gymnasium/visualizations/mathematik', goalId, `${goalId}.png`);
  if (sha(readFileSync(imagePath)) !== digest) throw new Error(`Current PNG changed at ${goalId}`);
}

const decisions = [
  {
    decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann Bernoulli-Versuche an festgelegtem Treffer und Nichttreffer erkennen, unabhängige Wiederholungen mit gleicher Trefferwahrscheinlichkeit als Bernoulli-Kette identifizieren und dafür $n$ und $p$ aus dem Kontext bestimmen.',
    proposedDescriptionEn: 'The learner can identify Bernoulli trials by specified success and failure, recognise independent repetitions with the same success probability as a Bernoulli chain, and determine $n$ and $p$ from context.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Ein festgelegtes Trefferereignis und sein Gegenereignis bilden die zwei Ausgänge eines Bernoulli-Versuchs; eine Bernoulli-Kette wiederholt solche Versuche unabhängig mit unveränderter Trefferwahrscheinlichkeit. Dabei zählt $n$ die Versuche und $p$ bezeichnet die Trefferwahrscheinlichkeit pro Versuch, nicht eine beobachtete Quote.',
      essentialUnderstandingEn: 'A specified success event and its complement form the two outcomes of a Bernoulli trial; a Bernoulli chain repeats such trials independently with an unchanged success probability. Here $n$ counts trials and $p$ denotes the per-trial success probability, not an observed proportion.',
      observablePerformanceDe: 'Die lernende Person legt in einem neuen Zufallskontext Treffer und Nichttreffer fest, prüft Unabhängigkeit und gleiches $p$ für die Wiederholungen, begründet die Modellentscheidung und bestimmt $n$ und $p$ aus den Angaben.',
      observablePerformanceEn: 'In a new random context, the learner defines success and failure, checks independence and a constant $p$ across repetitions, justifies the model decision, and determines $n$ and $p$ from the information given.',
      transferExpectationDe: 'Bei einer Folge von Ziehungen mit mehreren elementaren Ergebnissen fasst die lernende Person diese zu Treffer/Nichttreffer zusammen und unterscheidet eine Wiederholung mit Zurücklegen von einer ohne Zurücklegen, bei der die Kettenvoraussetzungen scheitern können.',
      transferExpectationEn: 'For repeated draws with several elementary outcomes, the learner groups them into success/failure and distinguishes sampling with replacement from sampling without replacement, where the chain assumptions may fail.'
    },
    rationale: 'REVISE: Die aktuelle kurze Beschreibung nennt die definierenden „Voraussetzungen“ nur pauschal. Damit bleibt gerade der Unterschied zwischen einem binär gefassten Einzelversuch und einer Kette mit Unabhängigkeit und gleichem p verborgen; das ist Kompetenzkern und nicht erst eine Detailregel für P-v2. Der Ersatz benennt nur diese bereits von Titel, Q3.2-Kontext, n/p und der aktuellen Bildbindung beanspruchten Bedingungen; Binomialformel oder Berechnungen kommen nicht hinzu. Die gerenderte Zielseite und das Münzwurf-PNG zeigen einen korrekten Spezialfall, aber keinen eigenständigen Lernnachweis. Das gebundene P-v2-Profil deckt unabhängige Varianten ab, bleibt jedoch KI-Kandidat ohne menschliche Freigabe. Der rohe Quellverweis ist keine Prüfung externer Quellenabdeckung.',
    evidenceProfileRecommendation: 'none'
  },
  {
    decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann eine theoretische Laplace-Wahrscheinlichkeit bei gleichwahrscheinlichen Elementarergebnissen mit beobachteten relativen Häufigkeiten vergleichen und Abweichungen bei unterschiedlichen Versuchszahlen einordnen, ohne für längere Reihen eine genauere Übereinstimmung vorauszusetzen.',
    proposedDescriptionEn: 'The learner can compare a theoretical Laplace probability based on equally likely elementary outcomes with observed relative frequencies and interpret deviations at different trial counts without assuming that longer series must agree more closely.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Eine Laplace-Wahrscheinlichkeit setzt gleichwahrscheinliche Elementarergebnisse voraus und beschreibt einen Modellwert für ein Ereignis. Die relative Häufigkeit stammt dagegen aus einer endlichen Beobachtungsreihe; sie darf abweichen, und eine längere Reihe muss nicht jeweils näher am Modellwert liegen.',
      essentialUnderstandingEn: 'A Laplace probability requires equally likely elementary outcomes and gives a model value for an event. A relative frequency instead comes from a finite observational series; it may differ, and a longer series need not always be closer to the model value.',
      observablePerformanceDe: 'Die lernende Person begründet den geeigneten Laplace-Grundraum, bestimmt für dasselbe Ereignis den Modellwert und beobachtete Anteile, vergleicht die Abstände und erläutert die Aussagekraft der jeweiligen Versuchszahlen ohne Ausgleichsgarantie.',
      observablePerformanceEn: 'The learner justifies a suitable Laplace sample space, determines the model value and observed proportions for the same event, compares their distances, and explains what the respective trial counts do and do not warrant without claiming guaranteed compensation.',
      transferExpectationDe: 'In einer neuen Tabelle mit verschieden langen Reihen zu einer anders gruppierten Ereignismenge erkennt die lernende Person die gleichwahrscheinlichen Elementarergebnisse, vergleicht Modell und Daten und ordnet auch den Fall ein, dass die längere Reihe zufällig weiter entfernt liegt.',
      transferExpectationEn: 'In a fresh table with series of different lengths for a differently grouped event, the learner identifies the equally likely elementary outcomes, compares model and data, and also interprets a case in which the longer series happens to be farther away.'
    },
    rationale: 'REVISE: „Abweichungen in Abhängigkeit von der Versuchszahl einordnen“ ist als Kurzbeschreibung mathematisch zu offen: Nach dem gezeigten Beispiel könnte man eine automatische Verbesserung bei mehr Versuchen hineinlesen; zugleich bleibt die Laplace-Bedingung nur im Fachwort verborgen. Die lokale Präzisierung nennt Modellbedingung und die Grenze einer endlichen Datenfolge, ohne eine neue statistische Methode oder einen höheren Anspruch einzuführen. Die Vorgängerziele decken Laplace-Auswertung, Häufigkeit und das empirische Gesetz der großen Zahlen ab. Das aktuelle Würfel-PNG zeigt korrekt nur 19/120 näher an 1/6 als 3/12 und ist kein Beweis für jede längere Serie. Das gebundene P-v2-Profil enthält passende unabhängige Fälle, ist aber keine menschliche Freigabe; der rohe Quellverweis belegt keine vollständige Quellenprüfung.',
    evidenceProfileRecommendation: 'none'
  },
  {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Äquivalenzumformungen erhalten die Lösungsmenge einer linearen Ungleichung; Multiplikation oder Division mit einer negativen Zahl kehrt die Ordnung um. Die Art des Vergleichszeichens bestimmt, ob der Randwert zur Lösungsmenge gehört.',
      essentialUnderstandingEn: 'Equivalent transformations preserve the solution set of a linear inequality; multiplying or dividing by a negative number reverses the order. The type of inequality sign determines whether the boundary value belongs to the solution set.',
      observablePerformanceDe: 'Die lernende Person löst eine neue lineare Ungleichung, begründet den Richtungswechsel am negativen Faktor, stellt die Lösungsmenge korrekt auf einer Zahlengeraden oder als Intervall dar und prüft Rand- und Probewerte.',
      observablePerformanceEn: 'The learner solves a new linear inequality, justifies the direction reversal at the negative factor, represents the solution set correctly on a number line or as an interval, and checks boundary and test values.',
      transferExpectationDe: 'Bei einer nicht strengen Ungleichung mit Variablentermen auf beiden Seiten überträgt die lernende Person die Umformung auf einen eingeschlossenen Rand und wählt eine dazu passende Darstellung, statt den offenen Rand des Bildbeispiels zu kopieren.',
      transferExpectationEn: 'For a non-strict inequality with variable terms on both sides, the learner transfers the transformation to an included boundary and chooses a matching representation instead of copying the image example’s open boundary.'
    },
    rationale: 'KEEP: Die aktuelle DE/EN-Beschreibung benennt eine kohärente Kompetenz aus äquivalentem Lösen, korrekter Vorzeichenumkehr und Darstellung derselben Lösungsmenge. Sie verlangt ausdrücklich Zahlengerade oder Intervallschreibweise, nicht beide; das entspricht dem gebundenen P-v2-Profil und bleibt für Jahrgang 8 passend. Die gerenderte Seite und das PNG zeigen −2x < 6, korrektes Teilen durch −2, x > −3 und einen offenen Rand bei −3. Dieses Einzelbeispiel ist Lernhilfe, nicht Nachweis einer selbstständigen Lösung. Die P-v2-Variante mit geschlossenem Rand und Fehlerdiagnose deckt den erforderlichen Transfer ab, bleibt aber KI-Kandidat ohne menschliche Freigabe. Der knappe sourceRef „KC G9“ wird nicht als verifizierte externe Quellenabbildung ausgegeben.',
    evidenceProfileRecommendation: 'none'
  },
  {
    decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann zu einer mathematischen Implikation Umkehrung und Kontraposition korrekt formulieren und unterscheiden, dass nur die Kontraposition stets logisch gleichwertig zur Ausgangsaussage ist.',
    proposedDescriptionEn: 'The learner can correctly formulate the converse and contrapositive of a mathematical implication and distinguish that only the contrapositive is always logically equivalent to the original statement.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Aus $P\\Rightarrow Q$ entsteht die Umkehrung $Q\\Rightarrow P$ durch Vertauschen ohne Negation; ihre Wahrheit folgt nicht allgemein aus der Ausgangsaussage. Die Kontraposition $\\neg Q\\Rightarrow\\neg P$ vertauscht und negiert beide Teilaussagen und ist stets logisch gleichwertig zur Ausgangsaussage.',
      essentialUnderstandingEn: 'The converse $Q\\Rightarrow P$ of $P\\Rightarrow Q$ swaps premise and conclusion without negation; its truth does not generally follow from the original. The contrapositive $\\neg Q\\Rightarrow\\neg P$ swaps and negates both component statements and is always logically equivalent to the original.',
      observablePerformanceDe: 'Die lernende Person formuliert zu einem neuen mathematischen Wenn-dann-Satz Umkehrung und Kontraposition mit korrekten Negationen, benennt jeweils Voraussetzung und Folgerung und erklärt den Unterschied zwischen Vertauschen und Vertauschen mit Negation sowie die stets bestehende Gleichwertigkeit der Kontraposition.',
      observablePerformanceEn: 'For a new mathematical if-then statement, the learner formulates the converse and contrapositive with correct negations, identifies premise and conclusion in each, and explains the difference between swapping and swapping with negation as well as the contrapositive’s invariant equivalence.',
      transferExpectationDe: 'Bei einer geometrischen Aussage statt einer reinen Symbolform überträgt die lernende Person Rollenwechsel und Negation auf ganze Sätze; bei einer Aussage mit $x>a$ erkennt sie insbesondere $x\\le a$ als korrekte Negation.',
      transferExpectationEn: 'For a geometric statement rather than a bare symbolic form, the learner transfers role reversal and negation to full sentences; for a statement containing $x>a$, the learner recognises $x\\le a$ as its correct negation.'
    },
    rationale: 'REVISE: Die derzeitige Beschreibung verlangt zwar, Umkehrung und Kontraposition von der Ausgangsaussage zu unterscheiden, lässt aber offen, dass nur die Kontraposition stets logisch gleichwertig ist. Diese Unterscheidung gehört zum beanspruchten Formen und Unterscheiden im Kapitel „Implikation und Äquivalenz unterscheiden“, nicht erst zu einer P-v2-Bewertungsregel. Der Ersatz verlangt weder Gültigkeitsprüfung noch Gegenbeispiel zur Umkehrung; dies bleibt beim Geschwisterziel. Auch ein Beweis durch Kontraposition des Nachfolgeziels wird nicht verlangt. Die gerenderte Seite und das PNG zeigen formal korrekte Pfeilrichtungen, aber keine eigenständige Satzbildung. Das enggefasste aktuelle P-v2-Profil deckt passende unabhängige sprachlich-mathematische Fälle ab und bleibt KI-Kandidat ohne menschliche Freigabe. Ein direkter sourceRef ist nicht geliefert; externe Quellenabdeckung wird nicht behauptet.',
    evidenceProfileRecommendation: 'none'
  }
];

const runId = `${campaign.campaignId}.run-001`;
const records = items.map((item, index) => {
  const goal = item.goal;
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}.${String(index + 1).padStart(3, '0')}`,
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
    ...decisions[index],
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate'
  };
});

const recordBytes = Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf8');
const inputPaths = [
  ['book_pdf', join(bundleRoot, 'book.pdf')],
  ['book_model', join(bundleRoot, 'book-model.json')],
  ['review_input_json', join(bundleRoot, 'review-input.json')],
  ['review_prompt', join(here, 'prompt.md')],
  ['review_criteria', join(here, 'criteria.md')],
  ['description_review_batch_input_jsonl', batchInputPath],
  ['run_manifest_schema', join(bundleRoot, 'contracts/goal-evidence-ai-run-manifest.schema.json')]
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
  generationParametersFingerprint: sha(Buffer.from(JSON.stringify({ campaign: campaign.campaignId, round: 'b', mode: 'blind-first-pass', output: 'candidate', runtimeModelId: 'not-exposed' }))),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: inputPaths.map(([role, path]) => ({ role, digest: sha(readFileSync(path)) })),
  startedAt: '2026-09-23T18:06:26.000Z',
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha(recordBytes),
  toolchainVersion: 'codex-api-review-v1'
};
const results = join(here, 'results');
mkdirSync(results, { recursive: true });
writeFileSync(join(results, `${batch.batchId}.records.jsonl`), recordBytes);
writeFileSync(join(results, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`);
console.log(JSON.stringify({ runId, decisions: records.map(({ goalId, decision }) => ({ goalId, decision })), outputDigest: run.outputDigest }));
