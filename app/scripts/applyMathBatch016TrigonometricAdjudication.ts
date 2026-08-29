import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// The bounded source/ledger schemas predate a shared TypeScript model and are
// validated field by field below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>
type PlannedFile = { path: string; bytes: string; appendOnly?: boolean }

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) {
  throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
}
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const reviewedAt = '2026-08-28'
const reviewer = 'codex-math-batch-016-trigonometric-adjudication-2026-08-28'
const visualizationReviewedAt = '2026-08-28T15:57:12.000Z'
const visualizationReviewer = 'codex-math-batch016-visual-compatibility-2026-08-28'
const mathLandscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const expectedAdjudicationSha256 = 'a1795706651c1e85e4b9d4c00c2d80c2df0ce0aff22a17bafebc7af7fbed915c'

// This second digest is deliberately bound only after Product-Owner review of
// the complete planned payload. --write stays fail-closed while it is PENDING.
const expectedBoundedPlanSha256 = '6590d3850d4011a9de5deefb3c280f24b8ac845b5b526c4011a909ef28fe7489'

const ids = {
  radianMeasure: 'cdf49335-cebf-54b4-9f52-50d5badabe2f',
  orientation: '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2',
  elementaryDerivatives: '858113c5-e53b-57bb-b01f-ba95c3ddcb6f',
  differenceQuotientLimit: 'b42bdfcc-3db7-5697-8b3e-69e50962ca86',
  sineCosineUnderstanding: 'bbef7cf2-90fa-59fa-a115-8b651aab9231',
  parameterInterpretation: 'ea8e3dfb-7fd7-5d49-ae07-01864e6aa464',
  characteristicPoints: 'eda3a298-4965-525e-878d-f05b9e2d4503',
  derivativeDerivation: 'e28e906e-e4f4-5cb1-b4b1-9bdc67d2ef32',
  graphicalDerivatives: '2411b2e9-75d7-5e8f-8eb4-f37c4ac555c2',
  derivativeApplication: '3401d95d-2191-5929-ac78-4de51d71a6be',
  chainRule: '58d2f963-4fb9-550d-a832-f5ac60808900',
  trigonometricEquations: 'ecd13e54-ab0e-550f-9400-66e13306635d',
  periodicModeling: '56fba457-ab98-5b96-963e-ec284458c17f',
  derivativeContext: '6acd79f5-9447-5ea1-8127-6dbb72bd057d',
  modelComparison: '2919b3f3-aca2-5add-beeb-de1b9e0eafd8',
  tangentNormal: 'f042385e-f772-42db-9c96-f21a792ac5ea',
  existingModelAssessment: '3b1f0646-fd0e-5d9d-b515-a5a45417a005',
  existingDerivativeAssessment: '6634ef12-0e88-584e-8e45-9e60eafc0951',
  ePracticeCluster: '28b45b93-11e1-5a96-97a1-4cfee171802b',
  newAssessment: '2c30949d-0381-5d32-81cf-c6eac7711399',
} as const

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  visualizationReview:
    'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-batch-214.md',
  adjudication:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-016-e-trigonometric-functions-12-v1/third-adjudication/adjudication.json',
  roundAInputDirectory:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-016-e-trigonometric-functions-12-v1/round-a/batches',
  assessmentDraft:
    'curricula/DE/Gymnasium/assessments/mathematik/sekii/e/'
    + 'trigonometric-understanding-model-derivative/draft_v1.md',
  assessmentSolution:
    'curricula/DE/Gymnasium/assessments/mathematik/sekii/e/'
    + 'trigonometric-understanding-model-derivative/solution_v1.md',
  assessmentReview:
    'curricula/DE/Gymnasium/assessments/mathematik/sekii/e/'
    + 'trigonometric-understanding-model-derivative/simulated_review_v1.md',
  compositionRoot: 'curricula/DE/Gymnasium/composition-views/mathematik',
} as const

const compositionViewPaths = [
  `${paths.compositionRoot}/de-by-gk.view.json`,
  `${paths.compositionRoot}/de-by-lk.view.json`,
  `${paths.compositionRoot}/de-by-sekii-gk.view.json`,
  `${paths.compositionRoot}/de-by-sekii-lk.view.json`,
] as const

const allJurisdictions = [
  'DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV',
  'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
] as const

const revisedGoalIds = [
  ids.sineCosineUnderstanding,
  ids.derivativeDerivation,
  ids.periodicModeling,
] as const

const requiredFollowUpGoalIds = [
  ids.differenceQuotientLimit,
  ids.elementaryDerivatives,
  ids.sineCosineUnderstanding,
  ids.parameterInterpretation,
  ids.derivativeDerivation,
  ids.derivativeApplication,
  ids.trigonometricEquations,
  ids.periodicModeling,
] as const

const existingAssessmentCoverage = {
  [ids.existingModelAssessment]: [
    ids.parameterInterpretation,
    ids.trigonometricEquations,
  ],
  [ids.existingDerivativeAssessment]: [
    ids.radianMeasure,
    ids.parameterInterpretation,
    ids.characteristicPoints,
    ids.trigonometricEquations,
    ids.modelComparison,
    ids.graphicalDerivatives,
    ids.chainRule,
    ids.derivativeContext,
    ids.tangentNormal,
  ],
} as const

const newAssessmentCoverage = [
  ids.sineCosineUnderstanding,
  ids.derivativeDerivation,
  ids.derivativeApplication,
  ids.periodicModeling,
] as const

const expectedExistingAssessmentPayloadHashes: Record<string, string> = {
  [ids.existingModelAssessment]: 'd29d4abcd64a7f98e882a4b8fca67e9de265ab163f59542bf64ff863a4972524',
  [ids.existingDerivativeAssessment]: 'c97abd28baf1caa128e5f7ede6b293d2427cdf551d194af807af30dbf5f5ad8a',
}

const protectedVisualizationFiles: Record<string, string> = {
  [`curricula/DE/Gymnasium/visualizations/mathematik/${ids.sineCosineUnderstanding}/${ids.sineCosineUnderstanding}.jpg`]:
    '8fb29bd003dd02771a3115d392a99aa87252a6d8fbe2d81be27d793aa8c9b750',
  [`app/public/assets/goal-visualizations/mathematik/${ids.sineCosineUnderstanding}/${ids.sineCosineUnderstanding}.jpg`]:
    '8fb29bd003dd02771a3115d392a99aa87252a6d8fbe2d81be27d793aa8c9b750',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${ids.sineCosineUnderstanding}/prompt.de.md`]:
    '555163cc9c02d6fa98e78c02ebceadbfcd1aa06d3e9cd93909d1c98301773ae0',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${ids.derivativeDerivation}/${ids.derivativeDerivation}.jpg`]:
    '96933056dc90a03f22ad469787213a303a32a4d8889135887cd67dcdf30874af',
  [`app/public/assets/goal-visualizations/mathematik/${ids.derivativeDerivation}/${ids.derivativeDerivation}.jpg`]:
    '96933056dc90a03f22ad469787213a303a32a4d8889135887cd67dcdf30874af',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${ids.derivativeDerivation}/prompt.de.md`]:
    '2475adaf8316aaf3299f87de1592c8201e999f617c63f2efaa85e1ddeb85ecc3',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${ids.derivativeDerivation}/image-reconstruction-prompt.de.md`]:
    '99ca43f8628654bcc6bf41b587fe353a56e22ea80602a3a65eafb0d736931902',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${ids.periodicModeling}/${ids.periodicModeling}.jpg`]:
    '6c88901fda888fe3eafa76f64e7a56e30515aa3f1dbe270089b43abbd6c8b2e6',
  [`app/public/assets/goal-visualizations/mathematik/${ids.periodicModeling}/${ids.periodicModeling}.jpg`]:
    '6c88901fda888fe3eafa76f64e7a56e30515aa3f1dbe270089b43abbd6c8b2e6',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${ids.periodicModeling}/prompt.de.md`]:
    'ee2465a35f0da6f662837298370ff4b41cde5a7d50df1a3eb615c46f6e6bb1b1',
}

const assessmentShortKey = 'canonical_math_e_practice_trigonometric_understanding_model_derivative'
const assessmentTitle = 'Kreisbewegung, periodische Modellierung und trigonometrische Ableitungen verknüpfen'
const assessmentDescription = 'Die lernende Person kann in einer E-Phasen-Klausuraufgabe Sinus und Kosinus aus der Kreisbewegung erklären, ihre Ableitungsregeln im Bogenmaß herleiten, ein periodisches Modell aus Messdaten entwickeln und prüfen sowie das Modell mithilfe der Ableitung untersuchen.'

const assessmentTaskContent = String.raw`Ein Punkt bewegt sich mit konstanter Winkelgeschwindigkeit auf einem Kreis. Für die Modellierung wird der Kreis auf den Einheitskreis normiert. Außerdem wurden bei einer vollständigen Umdrehung eines Riesenrads folgende Höhen einer Gondel gemessen:

| $t$ in s | 0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| $h$ in m | 2,0 | 4,9 | 12,0 | 19,1 | 22,0 | 19,1 | 12,0 | 4,9 | 2,0 |

Eine weitere, zunächst nicht für die Modellbildung verwendete Messung ergab $h(12)=15{,}1\,\mathrm m$.

1. Erläutern Sie am Einheitskreis, warum bei einem Winkel $\varphi$ die $x$-Koordinate durch $\cos(\varphi)$ und die $y$-Koordinate durch $\sin(\varphi)$ beschrieben wird. Skizzieren Sie anschließend die Graphen von Sinus und Kosinus für $0\le \varphi\le 2\pi$ und kennzeichnen Sie jeweils Amplitude und Nullstellen. (5 BE)
2. Leiten Sie im Bogenmaß mit den Additionstheoremen und den Grenzwerten
   $$
   \lim_{u\to0}\frac{\sin u}{u}=1,\qquad
   \lim_{u\to0}\frac{\cos u-1}{u}=0
   $$
   die Regeln $(\sin x)'=\cos x$ und $(\cos x)'=-\sin x$ her. Begründen Sie insbesondere das Minuszeichen und erläutern Sie, weshalb das Bogenmaß für die erste Grenzwertgleichung entscheidend ist. (6 BE)
3. Bestimmen Sie aus den Messdaten ein geeignetes Sinus- oder Kosinusmodell für $h(t)$. Deuten Sie die Modellparameter im Kontext, begründen Sie mindestens zwei Annahmen des Modells, prüfen Sie es an der zusätzlichen Messung bei $t=12$ und nennen Sie eine konkrete Grenze seiner Gültigkeit. (7 BE)
4. Bestimmen Sie für Ihr Modell $h'(t)$. Ermitteln Sie damit innerhalb einer Umdrehung die Monotonieintervalle und die Extremstellen, geben Sie die zugehörigen Höhen an und prüfen Sie die Ergebnisse am Verlauf der Messdaten. (6 BE)`

const assessmentSolutionContent = String.raw`1. Ein Punkt des Einheitskreises hat beim Winkel $\varphi$ die Koordinaten
$$
P(\varphi)=(\cos\varphi,\sin\varphi).
$$
Der Kosinus ist daher die waagerechte, der Sinus die senkrechte Projektion des Radiusvektors. Beide Funktionen haben Amplitude $1$ und Periode $2\pi$. Im Intervall $[0,2\pi]$ hat der Sinus die Nullstellen $0$, $\pi$ und $2\pi$, der Kosinus die Nullstellen $\frac{\pi}{2}$ und $\frac{3\pi}{2}$. Die Skizzen müssen außerdem die korrekte Phasenlage zeigen. (2 BE für den Kreis-Koordinaten-Zusammenhang, 2 BE für beide korrekten Skizzen, 1 BE für Amplituden und Nullstellen)

2. Mit $\sin(x+u)=\sin x\cos u+\cos x\sin u$ erhält man
$$
\frac{\sin(x+u)-\sin x}{u}
=\sin x\frac{\cos u-1}{u}+\cos x\frac{\sin u}{u}
\longrightarrow \cos x.
$$
Mit $\cos(x+u)=\cos x\cos u-\sin x\sin u$ folgt
$$
\frac{\cos(x+u)-\cos x}{u}
=\cos x\frac{\cos u-1}{u}-\sin x\frac{\sin u}{u}
\longrightarrow-\sin x.
$$
Das Minuszeichen stammt aus dem Term $-\sin x\sin u$ im Additionstheorem des Kosinus. Der Grenzwert $\sin u/u=1$ gilt in dieser Form nur im Bogenmaß; bei Gradmaß entstünde der zusätzliche Faktor $\pi/180$. (je 2 BE für die beiden Herleitungen, je 1 BE für Minuszeichen und Rolle des Bogenmaßes)

3. Aus Minimum $2\,\mathrm m$ und Maximum $22\,\mathrm m$ folgen Mittellinie $12\,\mathrm m$ und Amplitude $10\,\mathrm m$. Eine Umdrehung dauert $40\,\mathrm s$, also ist
$$
\omega=\frac{2\pi}{40}=\frac{\pi}{20}.
$$
Da die Gondel bei $t=0$ im Tiefpunkt startet, passt
$$
h(t)=12-10\cos\left(\frac{\pi}{20}t\right).
$$
Äquivalente Sinusdarstellungen sind ebenfalls richtig. Die $12$ beschreibt die Höhe der Radachse, $10$ den Radius und $40\,\mathrm s$ die Umlaufdauer. Mögliche Modellannahmen sind eine annähernd konstante Winkelgeschwindigkeit, ein fester Radius und eine konstante Höhe der Radachse sowie ein stabiler Bewegungsablauf während der betrachteten Umdrehung. Für die Kontrollmessung gilt
$$
h(12)=12-10\cos\left(\frac{3\pi}{5}\right)\approx15{,}09\,\mathrm m,
$$
also stimmt das Modell bis auf die Messrundung mit $15{,}1\,\mathrm m$ überein. Eine konkrete Grenze ist beispielsweise, dass Anfahr-, Brems- oder Geschwindigkeitsschwankungen und Messfehler nicht erfasst werden; außerhalb eines stabilen Umlaufs ist die Prognose daher nur eingeschränkt verlässlich. (3 BE für datenbasierte Parameter und Modellterm, 1 BE für die Kontextdeutung, 1 BE für mindestens zwei begründete Annahmen, 1 BE für die unabhängige Prüfung, 1 BE für eine konkrete Modellgrenze)

4. Für
$$
h(t)=12-10\cos\left(\frac{\pi}{20}t\right)
$$
ist
$$
h'(t)=\frac{\pi}{2}\sin\left(\frac{\pi}{20}t\right).
$$
Auf $0<t<20$ ist $h'(t)>0$, also steigt die Gondel; auf $20<t<40$ ist $h'(t)<0$, also fällt sie. Bei $t=20$ liegt das Maximum mit $h(20)=22\,\mathrm m$. Bei $t=0$ und $t=40$ liegen die periodisch aufeinanderfolgenden Minima mit $h=2\,\mathrm m$. Das stimmt mit den Messwerten überein. (2 BE für $h'$, 2 BE für Vorzeichen und Monotonie, 1 BE für Extremstellen und Höhen, 1 BE für den Datenabgleich)`

const scoringSteps = [
  {
    id: 'e_trig_deep_1',
    points: 5,
    description: 'Kreis-Koordinaten-Zusammenhang, Sinus- und Kosinusgraphen, Amplituden und Nullstellen korrekt erklärt beziehungsweise dargestellt',
  },
  {
    id: 'e_trig_deep_2',
    points: 6,
    description: 'Beide trigonometrischen Ableitungsregeln im Bogenmaß hergeleitet sowie Minuszeichen und Rolle des Bogenmaßes begründet',
  },
  {
    id: 'e_trig_deep_3',
    points: 7,
    description: 'Periodisches Modell aus Messdaten entwickelt, Parameter gedeutet, Annahmen begründet, unabhängig geprüft und eine Modellgrenze benannt',
  },
  {
    id: 'e_trig_deep_4',
    points: 6,
    description: 'Modell abgeleitet, Monotonie und Extremstellen untersucht und die Ergebnisse mit den Messdaten abgeglichen',
  },
] as const

const assessmentDraftMarkdown = `# Prüfungsaufgabe: ${assessmentTitle}

Status: released after focused simulated internal review on 2026-08-28

SkillPilot-ID: \`${ids.newAssessment}\`

Bewertungseinheiten: 24 BE

## Aufgabe

${assessmentTaskContent}
`

const assessmentSolutionMarkdown = `# Lösung: ${assessmentTitle}

${assessmentSolutionContent}

## Bewertungsraster

| Teil | BE | Kriterium |
| --- | ---: | --- |
${scoringSteps.map((step) => `| \`${step.id}\` | ${step.points} | ${step.description} |`).join('\n')}

Maximal: 24 BE. Bestehensgrenze: 12 BE.
`

const assessmentReviewMarkdown = String.raw`# Simulierte Fachreview: E-Trigonometrie vertieft verknüpfen

Review date: 2026-08-28

Reviewer: internal focused mathematics review

Decision: \`released\`

## Fachliche Prüfung

- Die Einheitskreisaufgabe fordert ausdrücklich den Kreis-Koordinaten-Zusammenhang,
  beide Graphen, Amplituden und Nullstellen; reine Formelwiedergabe genügt nicht.
- Beide Ableitungsidentitäten werden im Bogenmaß aus Additionstheoremen und den
  angegebenen Grenzwerten hergeleitet. Das Minuszeichen und die Rolle des
  Bogenmaßes werden gesondert begründet.
- Minimum, Maximum und Umlaufdauer der Messreihe liefern widerspruchsfrei
  \(h(t)=12-10\cos(\pi t/20)\). Die unabhängige Kontrollmessung ergibt
  \(h(12)\approx15{,}09\,\mathrm m\) und stimmt mit \(15{,}1\,\mathrm m\)
  bis auf Rundung überein.
- Aus \(h'(t)=\frac{\pi}{2}\sin(\pi t/20)\) folgen Anstieg auf \((0,20)\),
  Abstieg auf \((20,40)\), das Maximum \(22\,\mathrm m\) bei \(t=20\) und
  die Minima \(2\,\mathrm m\) bei \(t=0,40\); dies stimmt mit den Messdaten
  überein.
- Die Aufgabe verlangt begründete Modellannahmen, eine unabhängige Prüfung und
  eine konkrete Gültigkeitsgrenze. Sie deckt damit den vollständigen
  Modellierungszyklus ab, ohne ein Modell vorzugeben.
- \`requires\` und \`examData.coveredGoalIds\` sind bytegleich und enthalten
  ausschließlich \`${newAssessmentCoverage.join('`, `')}\`.
- Maximalpunktzahl 24, Bestehensgrenze 12 und die vier Teilrubriken summieren
  sich widerspruchsfrei.

## Freigabegrenze

Der Assessment-Knoten darf nur gemeinsam mit dieser materialisierten Review,
dem Aufgabenartefakt und der vollständigen Lösung den Status \`released\`
tragen. Der Apply-Skriptlauf prüft diese Kopplung fail-closed.
`

const visualizationReviewMarkdown = `# Goal Visualization Review - Mathematik Batch 214

Review date: 2026-08-28

Scope: Metadaten-Rebinding für genau drei akzeptierte Textrevisionen aus Math
Batch 016. Die bestehenden Nano-Banana-Pro-Bilder sowie alle historischen
\`prompt.de.md\`- und \`image-reconstruction-prompt.de.md\`-Dateien bleiben
bytegleich.

Status: \`accepted_existing_assets_metadata_rebound\`

## Entscheidung

| Goal ID | Lernziel | Entscheidung | Begründung |
| --- | --- | --- | --- |
| \`${ids.sineCosineUnderstanding}\` | Sinus- und Kosinusfunktionen verstehen | \`accepted_existing_asset\` | Einheitskreis, Koordinatenprojektionen, beide Graphen, Amplitude und Nullstellen sind sichtbar fachlich korrekt. Die Revision korrigiert gerade die frühere sprachliche Einordnung der Amplitude als Punkt; das Bild stellt sie korrekt als Größe dar. |
| \`${ids.derivativeDerivation}\` | Ableitungen von Sinus- und Kosinusfunktionen herleiten | \`accepted_existing_asset\` | Beide Ableitungsidentitäten einschließlich des Minuszeichens sind korrekt dargestellt. Das Bild bleibt eine Orientierung und ersetzt nicht die im Lernziel geforderte geometrische oder grenzwertige Herleitung. |
| \`${ids.periodicModeling}\` | Periodische Prozesse modellieren | \`accepted_existing_asset\` | Messdaten, Modellkurve, Mittellinie, Amplitude, Periode und eine sichtbare Prognosegrenze unterstützen den revidierten Modellierungszyklus ohne fachlichen Widerspruch. |

## Byte-Schutz

- \`${ids.sineCosineUnderstanding}\`: JPG SHA-256
  \`8fb29bd003dd02771a3115d392a99aa87252a6d8fbe2d81be27d793aa8c9b750\`;
  historischer Prompt SHA-256
  \`555163cc9c02d6fa98e78c02ebceadbfcd1aa06d3e9cd93909d1c98301773ae0\`.
- \`${ids.derivativeDerivation}\`: JPG SHA-256
  \`96933056dc90a03f22ad469787213a303a32a4d8889135887cd67dcdf30874af\`;
  historischer Prompt SHA-256
  \`2475adaf8316aaf3299f87de1592c8201e999f617c63f2efaa85e1ddeb85ecc3\`;
  historischer Rekonstruktionsprompt SHA-256
  \`99ca43f8628654bcc6bf41b587fe353a56e22ea80602a3a65eafb0d736931902\`.
- \`${ids.periodicModeling}\`: JPG SHA-256
  \`6c88901fda888fe3eafa76f64e7a56e30515aa3f1dbe270089b43abbd6c8b2e6\`;
  historischer Prompt SHA-256
  \`ee2465a35f0da6f662837298370ff4b41cde5a7d50df1a3eb615c46f6e6bb1b1\`.
- Kanonische und öffentliche JPG-Kopien sind je Ziel byteidentisch. Weder
  Bildbytes noch historische Promptbytes werden vom Apply-Skript ausgegeben.
- Bestehende Human-/AI-Freigabefelder bleiben unverändert; ausschließlich
  Titel und Beschreibungsbindung der QA-Metadaten werden aktualisiert.
`

const atomicityReasons: Record<string, string> = {
  [ids.sineCosineUnderstanding]:
    'Kreis-Koordinaten-Erklärung, Graphskizzen sowie Amplitude und Nullstellen sind aufeinander bezogene Darstellungen und Merkmale desselben Sinus-/Kosinusbegriffs und gemeinsam in einer Aufgabe prüfbar.',
  [ids.derivativeDerivation]:
    'Die beiden gekoppelten Ableitungsidentitäten werden unter derselben Bogenmaß-, Additions- und Grenzwertgrundlage hergeleitet; die Begründung des Minuszeichens ist ein notwendiger Teil genau dieser Herleitungskompetenz.',
  [ids.periodicModeling]:
    'Begründete Annahmen, datenbasierte Parameterbestimmung und Kontextinterpretation sind zusammengehörige Phasen eines einzigen Modellierungszyklus für periodische Realsituationen.',
}

const memoryReasons: Record<string, string> = {
  [ids.sineCosineUnderstanding]:
    'Das Ziel verlangt die verständige Verknüpfung von Kreisbewegung, Koordinaten und Graphmerkmalen; isoliertes Erinnern einzelner Werte ersetzt diese Erklärungs- und Darstellungsleistung nicht.',
  [ids.derivativeDerivation]:
    'Die Ableitungsidentitäten sollen im Bogenmaß geometrisch oder über Grenzwerte hergeleitet und das Minuszeichen begründet werden; bloßes Auswendiglernen der Formeln genügt nicht.',
  [ids.periodicModeling]:
    'Annahmen, Modellwahl, Parameterbestimmung aus Messdaten und Kontextprüfung erfordern einen zusammenhängenden Modellierungsprozess; ein separates Memory-Deck ist dafür nicht notwendig.',
}

const visualizationReviewNotes: Record<string, string> = {
  [ids.sineCosineUnderstanding]:
    'Batch 214: Existing Nano Banana Pro asset remains compatible with the revised goal. Unit-circle coordinate projections, both graphs, amplitude, and zeros are visibly coherent; image and historical prompt bytes remain unchanged.',
  [ids.derivativeDerivation]:
    'Batch 214: Existing Nano Banana Pro asset remains compatible with the revised goal. Both derivative identities and the negative sign are visibly correct; the image remains an orientation and does not replace the required derivation. Image and historical prompt bytes remain unchanged.',
  [ids.periodicModeling]:
    'Batch 214: Existing Nano Banana Pro asset remains compatible with the revised goal. Measured data, fitted curve, amplitude, period, midline, and bounded prediction are coherent with the full modeling cycle; image and historical prompt bytes remain unchanged.',
}

const absolute = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim() !== '')
  .map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string => `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const sha256Digest = (value: string | Uint8Array): string => `sha256:${sha256(value)}`
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value) ?? 'null'
}
const same = (left: unknown, right: unknown): boolean => stableJson(left) === stableJson(right)
const unique = <T>(values: T[]): T[] => [...new Set(values)]

const normalizeText = (value: unknown): string =>
  String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()

const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => sha256Digest(stableJson({
  ruleVersion,
  goalId: goal.id,
  shortKey: goal.shortKey ?? '',
  title: normalizeText(goal.title),
  titleEn: normalizeText(goal.titleEn),
  description: normalizeText(goal.description),
  descriptionEn: normalizeText(goal.descriptionEn),
  phase: normalizeText(goal.dimensionTags?.phase),
  area: normalizeText(goal.dimensionTags?.area),
  topicCode: normalizeText(goal.dimensionTags?.topicCode),
  nodeKind: normalizeText(goal.nodeKind),
}))

const deterministicGoalId = (shortKey: string): string => {
  const value = createHash('sha1').update(`DE-GYM-CANONICAL-MATH:${shortKey}`).digest('hex')
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-5${value.slice(13, 16)}-8${value.slice(17, 20)}-${value.slice(20, 32)}`
}

function assertProtectedVisualizationFiles(): void {
  for (const [path, expected] of Object.entries(protectedVisualizationFiles)) {
    if (!existsSync(absolute(path))) throw new Error(`Missing protected visualization file ${path}`)
    const actual = sha256(readFileSync(absolute(path)))
    if (actual !== expected) {
      throw new Error(`Protected visualization/prompt bytes drifted at ${path}: ${actual} != ${expected}`)
    }
  }
}

function loadAdjudication(): JsonRecord {
  const bytes = readFileSync(absolute(paths.adjudication))
  const actualDigest = sha256(bytes)
  if (actualDigest !== expectedAdjudicationSha256) {
    throw new Error(`Batch016 adjudication digest changed: ${actualDigest} != ${expectedAdjudicationSha256}`)
  }
  const adjudication = JSON.parse(bytes.toString('utf8')) as JsonRecord
  const expectedFollowUp = [...requiredFollowUpGoalIds]
  if (
    adjudication.schemaVersion !== 1
    || adjudication.subject !== 'mathematik'
    || adjudication.materialized !== false
    || adjudication.noProgressClaim !== true
    || adjudication.counts?.total !== 12
    || adjudication.counts?.keep_current !== 9
    || adjudication.counts?.accepted_revision !== 3
    || adjudication.counts?.structural_split !== 0
    || adjudication.counts?.requiresCanonicalReworkAndFreshBlindReview !== 8
    || adjudication.counts?.requiresFullContextRecheck !== 8
    || !same(adjudication.requiredFollowUpGoalIds, expectedFollowUp)
    || !Array.isArray(adjudication.decisions)
    || adjudication.decisions.length !== 12
  ) throw new Error('Unexpected Batch016 adjudication contract')

  const acceptedIds = adjudication.decisions
    .filter((decision: JsonRecord) => decision.resolutionDecision === 'accepted_revision')
    .map((decision: JsonRecord) => decision.goalId)
  if (!same(acceptedIds, [...revisedGoalIds])) throw new Error('Unexpected Batch016 accepted-revision set')

  const topologyByGoalId = new Map(
    (adjudication.topologyDecisions as JsonRecord[]).map((decision) => [decision.goalId, decision]),
  )
  if (
    topologyByGoalId.size !== 2
    || !same(topologyByGoalId.get(ids.sineCosineUnderstanding)?.requiresBefore, [
      ids.radianMeasure, ids.orientation, ids.elementaryDerivatives,
    ])
    || !same(topologyByGoalId.get(ids.sineCosineUnderstanding)?.requiresAfter, [
      ids.radianMeasure, ids.orientation,
    ])
    || !same(topologyByGoalId.get(ids.derivativeDerivation)?.requiresBefore, [
      ids.parameterInterpretation,
    ])
    || !same(topologyByGoalId.get(ids.derivativeDerivation)?.requiresAfter, [
      ids.parameterInterpretation, ids.differenceQuotientLimit,
    ])
  ) throw new Error('Unexpected Batch016 topology decision')

  const remediation = adjudication.assessmentRemediation as JsonRecord
  const existingCoverageByGoalId = new Map(
    (remediation.existingAssessmentCoverage as JsonRecord[]).map((entry) => [entry.goalId, entry]),
  )
  if (
    remediation.decision !== 'correct_overclaims_and_add_canonical_follow_up'
    || !same(
      existingCoverageByGoalId.get(ids.existingModelAssessment)?.requiresAndCoveredGoalIdsAfter,
      existingAssessmentCoverage[ids.existingModelAssessment],
    )
    || !same(
      existingCoverageByGoalId.get(ids.existingDerivativeAssessment)?.requiresAndCoveredGoalIdsAfter,
      existingAssessmentCoverage[ids.existingDerivativeAssessment],
    )
    || remediation.newAssessment?.goalId !== ids.newAssessment
    || remediation.newAssessment?.shortKey !== assessmentShortKey
    || !same(remediation.newAssessment?.coveredGoalIds, [...newAssessmentCoverage])
  ) throw new Error('Unexpected Batch016 assessment remediation')
  return adjudication
}

function loadBoundReviewInputs(adjudication: JsonRecord): Map<string, JsonRecord> {
  const fileNames = readdirSync(absolute(paths.roundAInputDirectory))
    .filter((name) => name.endsWith('.input.jsonl'))
  if (fileNames.length !== 1) throw new Error(`Expected one Batch016 round-A input, found ${fileNames.length}`)
  const records = readJsonl(`${paths.roundAInputDirectory}/${fileNames[0]}`)
  if (records.length !== 12) throw new Error(`Expected 12 Batch016 review inputs, found ${records.length}`)
  const byId = new Map<string, JsonRecord>()
  for (const record of records) {
    if (record.reviewInputFingerprint !== adjudication.inputBinding.reviewInputFingerprint) {
      throw new Error(`${record.goal?.goalId ?? 'unknown'}: review-input fingerprint is not adjudication-bound`)
    }
    const goal = record.goal as JsonRecord
    if (!goal?.goalId || byId.has(goal.goalId)) throw new Error('Duplicate or missing Batch016 review-input goal')
    byId.set(goal.goalId, goal)
  }
  const decisionIds = (adjudication.decisions as JsonRecord[]).map((decision) => decision.goalId)
  if (!same([...byId.keys()], decisionIds)) throw new Error('Batch016 review-input order differs from adjudication')
  return byId
}

const assessmentGoal = (): JsonRecord => ({
  id: ids.newAssessment,
  title: assessmentTitle,
  description: assessmentDescription,
  core: true,
  weight: 1,
  tags: ['GK', 'LK', 'Practice', 'Assessment', 'canonical', 'phase:E', 'ExamTask'],
  applicability: { jurisdiction: [...allJurisdictions] },
  extendedData: {
    applicabilityFromRequires: true,
    applicabilityMappingInheritance: 'boundary',
  },
  sourceRef: `${paths.assessmentDraft}#aufgabe`,
  dimensionTags: {
    framework: 'canonical-gymnasium-math',
    demandLevel: 'AB3',
    processCompetencies: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6'],
    guidingIdeas: ['L1', 'L2', 'L4'],
    phase: 'E',
    area: 'Analysis',
    topicCode: 'CANONICAL.MATH.E.PRACTICE.TRIGONOMETRIC_UNDERSTANDING_MODEL_DERIVATIVE',
  },
  shortKey: assessmentShortKey,
  contains: [],
  requires: [...newAssessmentCoverage],
  examples: [],
  resourceLinks: [],
  phase: 'E',
  type: 'atomic',
  nodeKind: 'exam',
  examData: {
    reviewStatus: 'released',
    reviewNote: 'released after focused simulated internal review on 2026-08-28 for the Batch-016 trigonometric understanding, modeling and derivative route',
    coveredGoalIds: [...newAssessmentCoverage],
    coveredStrands: ['L1', 'L2', 'L4'],
    demandLevels: ['AB1', 'AB2', 'AB3'],
    sourceArtifactPath: paths.assessmentDraft,
    taskContent: assessmentTaskContent,
    solutionContent: assessmentSolutionContent,
    scoring: {
      maxPoints: 24,
      passingPoints: 12,
      steps: structuredClone(scoringSteps),
    },
  },
})

function assessmentPayloadWithoutCoverage(goal: JsonRecord): JsonRecord {
  const payload = structuredClone(goal)
  delete payload.requires
  if (!payload.examData) throw new Error(`${goal.id}: existing assessment lacks examData`)
  delete payload.examData.coveredGoalIds
  return payload
}

function assertGraph(goals: JsonRecord[]): void {
  const byId = new Map<string, JsonRecord>()
  for (const goal of goals) {
    if (typeof goal.id !== 'string' || byId.has(goal.id)) throw new Error(`Duplicate or invalid goal ID ${String(goal.id)}`)
    byId.set(goal.id, goal)
  }
  for (const field of ['contains', 'requires'] as const) {
    for (const goal of goals) {
      const targets = goal[field] ?? []
      if (!Array.isArray(targets) || new Set(targets).size !== targets.length) {
        throw new Error(`${goal.id}: invalid or duplicate ${field}`)
      }
      for (const targetId of targets) {
        if (!byId.has(targetId)) throw new Error(`${goal.id}: missing ${field} target ${targetId}`)
      }
    }
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const visit = (goalId: string): void => {
      if (visited.has(goalId)) return
      if (visiting.has(goalId)) throw new Error(`${field} cycle at ${goalId}`)
      visiting.add(goalId)
      for (const targetId of byId.get(goalId)?.[field] ?? []) visit(targetId)
      visiting.delete(goalId)
      visited.add(goalId)
    }
    for (const goalId of byId.keys()) visit(goalId)
  }
}

function updateRecursiveWeights(goals: JsonRecord[], startId: string): string[] {
  const byId = new Map(goals.map((goal) => [String(goal.id), goal]))
  const parentsByChild = new Map<string, string[]>()
  for (const goal of goals) for (const childId of goal.contains ?? []) {
    parentsByChild.set(childId, [...(parentsByChild.get(childId) ?? []), goal.id])
  }
  const affected = new Set<string>([startId])
  const queue = [...(parentsByChild.get(startId) ?? [])]
  while (queue.length > 0) {
    const goalId = queue.shift()!
    if (affected.has(goalId)) continue
    affected.add(goalId)
    queue.push(...(parentsByChild.get(goalId) ?? []))
  }
  const collectAtomicDescendants = (rootId: string, visiting = new Set<string>()): Set<string> => {
    if (visiting.has(rootId)) throw new Error(`Contains cycle while counting ${rootId}`)
    const goal = byId.get(rootId)
    if (!goal) throw new Error(`Missing contains target ${rootId}`)
    if ((goal.contains ?? []).length === 0) return new Set([rootId])
    const nextVisiting = new Set(visiting).add(rootId)
    return new Set((goal.contains as string[]).flatMap((childId) => (
      [...collectAtomicDescendants(childId, nextVisiting)]
    )))
  }
  for (const goalId of affected) byId.get(goalId)!.weight = collectAtomicDescendants(goalId).size
  return [...affected]
}

function buildCanonical(adjudication: JsonRecord, reviewInputs: Map<string, JsonRecord>): {
  canonical: JsonRecord
  weightRefreshGoalIds: string[]
} {
  const canonical = readJson(paths.canonical)
  if (canonical.landscapeId !== mathLandscapeId || !Array.isArray(canonical.goals)) {
    throw new Error('Unexpected canonical mathematics landscape')
  }
  const goals = canonical.goals as JsonRecord[]
  const byId = new Map(goals.map((goal) => [String(goal.id), goal]))
  const decisionsById = new Map(
    (adjudication.decisions as JsonRecord[]).map((decision) => [decision.goalId as string, decision]),
  )
  for (const goalId of revisedGoalIds) {
    const goal = byId.get(goalId)
    const input = reviewInputs.get(goalId)
    const finalText = decisionsById.get(goalId)?.finalText as JsonRecord
    if (!goal || !input || !finalText) throw new Error(`${goalId}: missing goal, review input, or final text`)
    const currentText = [goal.title, goal.titleEn, goal.description, goal.descriptionEn]
    const inputText = [input.currentTitleDe, input.currentTitleEn, input.currentDescriptionDe, input.currentDescriptionEn]
    const finalTuple = [finalText.titleDe, finalText.titleEn, finalText.descriptionDe, finalText.descriptionEn]
    if (!same(currentText, inputText) && !same(currentText, finalTuple)) {
      throw new Error(`${goalId}: bilingual text drifted from review input and adjudication`)
    }
    Object.assign(goal, {
      title: finalText.titleDe,
      titleEn: finalText.titleEn,
      description: finalText.descriptionDe,
      descriptionEn: finalText.descriptionEn,
    })
    const visualizationLinks = (goal.resourceLinks ?? []).filter(
      (link: JsonRecord) => link.type === 'goal-visualization',
    )
    if (visualizationLinks.length !== 1) throw new Error(`${goalId}: expected one goal-visualization link`)
    Object.assign(visualizationLinks[0], {
      title: `Visualisierung: ${goal.title}`,
      description: `Visualisierung zum Lernziel: ${goal.title}.`,
      altText: `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`,
    })
  }

  const topologyById = new Map(
    (adjudication.topologyDecisions as JsonRecord[]).map((decision) => [decision.goalId as string, decision]),
  )
  for (const goalId of [ids.sineCosineUnderstanding, ids.derivativeDerivation]) {
    const goal = byId.get(goalId)!
    const decision = topologyById.get(goalId)!
    if (!same(goal.requires, decision.requiresBefore) && !same(goal.requires, decision.requiresAfter)) {
      throw new Error(`${goalId}: requires drifted from bounded Batch016 topology states`)
    }
    goal.requires = [...decision.requiresAfter]
  }

  for (const [goalId, coverage] of Object.entries(existingAssessmentCoverage)) {
    const goal = byId.get(goalId)
    if (!goal) throw new Error(`${goalId}: missing existing assessment`)
    const payloadHash = sha256(stableJson(assessmentPayloadWithoutCoverage(goal)))
    if (payloadHash !== expectedExistingAssessmentPayloadHashes[goalId]) {
      throw new Error(`${goalId}: task/solution/scoring or non-coverage metadata drifted (${payloadHash})`)
    }
    const inputCoverage = goalId === ids.existingModelAssessment
      ? [ids.derivativeDerivation, ids.derivativeApplication, ids.periodicModeling]
      : [
          ids.radianMeasure, ids.sineCosineUnderstanding, ids.parameterInterpretation,
          ids.characteristicPoints, ids.trigonometricEquations, ids.periodicModeling,
          ids.modelComparison, ids.derivativeDerivation, ids.graphicalDerivatives,
          ids.derivativeApplication, ids.chainRule, ids.derivativeContext, ids.tangentNormal,
        ]
    for (const [field, current] of [
      ['requires', goal.requires],
      ['examData.coveredGoalIds', goal.examData?.coveredGoalIds],
    ] as const) {
      if (!same(current, inputCoverage) && !same(current, coverage)) {
        throw new Error(`${goalId}: ${field} drifted from bounded pre/post-remediation states`)
      }
    }
    goal.requires = [...coverage]
    goal.examData.coveredGoalIds = [...coverage]
    if (!same(goal.requires, goal.examData.coveredGoalIds)) {
      throw new Error(`${goalId}: requires and coveredGoalIds are not byte-identical`)
    }
  }

  const expectedAssessment = assessmentGoal()
  const existingAssessment = byId.get(ids.newAssessment)
  if (existingAssessment && !same(existingAssessment, expectedAssessment)) {
    throw new Error(`${ids.newAssessment}: existing assessment differs from the reviewed Batch016 payload`)
  }
  byId.set(ids.newAssessment, expectedAssessment)
  const existingAssessmentIndex = goals.findIndex((goal) => goal.id === ids.newAssessment)
  if (existingAssessmentIndex >= 0) goals.splice(existingAssessmentIndex, 1)
  const derivativeAssessmentIndex = goals.findIndex((goal) => goal.id === ids.existingDerivativeAssessment)
  if (derivativeAssessmentIndex < 0) throw new Error('Missing canonical insertion anchor for Batch016 assessment')
  goals.splice(derivativeAssessmentIndex + 1, 0, expectedAssessment)

  const practiceCluster = byId.get(ids.ePracticeCluster)
  if (!practiceCluster || practiceCluster.type !== 'cluster' || !Array.isArray(practiceCluster.contains)) {
    throw new Error(`Missing E-practice cluster ${ids.ePracticeCluster}`)
  }
  if (
    practiceCluster.contains.filter((goalId: string) => goalId === ids.existingModelAssessment).length !== 1
    || practiceCluster.contains.filter((goalId: string) => goalId === ids.existingDerivativeAssessment).length !== 1
    || practiceCluster.contains.filter((goalId: string) => goalId === ids.newAssessment).length > 1
  ) throw new Error('Unexpected E-practice assessment anchors')
  practiceCluster.contains = practiceCluster.contains.filter((goalId: string) => goalId !== ids.newAssessment)
  const clusterAnchorIndex = practiceCluster.contains.indexOf(ids.existingDerivativeAssessment)
  if (clusterAnchorIndex < 0) throw new Error('Missing E-practice cluster insertion anchor')
  practiceCluster.contains.splice(clusterAnchorIndex + 1, 0, ids.newAssessment)

  const weightRefreshGoalIds = updateRecursiveWeights(goals, ids.ePracticeCluster)
  if (practiceCluster.weight !== 11) {
    throw new Error(`Expected E-practice weight 11 after Batch016, found ${String(practiceCluster.weight)}`)
  }
  assertGraph(goals)
  canonical.goals = goals
  return { canonical, weightRefreshGoalIds }
}

function buildSemanticKinds(canonical: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const decisions = ledger.decisions as JsonRecord[]
  const byId = new Map(decisions.map((decision) => [String(decision.goalId), decision]))
  const refreshIds = unique([
    ...requiredFollowUpGoalIds,
    ids.existingModelAssessment,
    ids.existingDerivativeAssessment,
    ids.ePracticeCluster,
    ids.newAssessment,
  ])
  const curricularAtomicIds = new Set(requiredFollowUpGoalIds)
  for (const goalId of refreshIds) {
    const goal = goalById.get(goalId)
    const existing = byId.get(goalId)
    if (!goal) throw new Error(`${goalId}: missing semantic-kind source goal`)
    const expectedKind = curricularAtomicIds.has(goalId) ? 'curricularAtomic' : 'practiceAssessment'
    if (existing && (
      existing.semanticKind !== expectedKind || existing.decisionStatus !== 'authoritative'
    )) throw new Error(`${goalId}: unexpected existing semantic-kind decision`)
    if (!existing && goalId !== ids.newAssessment) throw new Error(`${goalId}: missing semantic-kind decision`)
    byId.set(goalId, {
      ...(existing ?? {}),
      goalId,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
      semanticKind: expectedKind,
      decisionStatus: 'authoritative',
      decisionBasis: goalId === ids.newAssessment
        ? 'reviewed-current-pilot-practice-assessment'
        : existing.decisionBasis,
    })
  }
  ledger.decisions = [...byId.values()].sort((left, right) => {
    const a = String(left.goalId)
    const b = String(right.goalId)
    return a < b ? -1 : a > b ? 1 : 0
  })
  const counts: Record<string, number> = {}
  for (const decision of ledger.decisions as JsonRecord[]) {
    counts[decision.semanticKind] = (counts[decision.semanticKind] ?? 0) + 1
  }
  const order = [
    'curricularAtomic', 'curricularArea', 'practiceAssessment', 'programStructure',
    'memory', 'runtimeSupport', 'orientation',
  ]
  ledger.counts = Object.fromEntries(order.map((kind) => [kind, counts[kind] ?? 0]))
  ledger.counts.total = ledger.decisions.length
  return ledger
}

function buildReviewLedger(
  canonical: JsonRecord,
  path: string,
  kind: 'atomicity' | 'memory',
): JsonRecord[] {
  const records = readJsonl(path)
  const byGoalId = new Map(records.map((record) => [String(record.goalId), record]))
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  for (const goalId of revisedGoalIds) {
    const record = byGoalId.get(goalId)
    const goal = goalById.get(goalId)
    if (!record || !goal) throw new Error(`${goalId}: missing ${kind} record or goal`)
    if (kind === 'atomicity') {
      if (record.ruleVersion !== 'semantic-atomicity-v1') throw new Error(`${goalId}: atomicity rule drift`)
      Object.assign(record, {
        fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
        status: 'atomic',
        semanticAtomic: true,
        reviewedAt,
        reviewer,
        reason: atomicityReasons[goalId],
        suggestedSplit: [],
      })
    } else {
      if (record.ruleVersion !== 'memory-card-review-v1' || record.status !== 'no_memory_needed') {
        throw new Error(`${goalId}: memory decision is not the bounded no_memory_needed state`)
      }
      Object.assign(record, {
        fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
        status: 'no_memory_needed',
        memoryUseful: false,
        reviewedAt,
        reviewer,
        reason: memoryReasons[goalId],
      })
      delete record.memoryGoalIds
      delete record.deckIds
    }
  }
  return records
}

function buildVisualizationQa(canonical: JsonRecord): JsonRecord {
  const qa = readJson(paths.visualizationQa)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  for (const goalId of revisedGoalIds) {
    const goal = goalById.get(goalId)
    const records = (qa.records as JsonRecord[]).filter((record) => record.goalId === goalId)
    if (!goal || records.length !== 1) throw new Error(`${goalId}: missing or duplicate visualization-QA binding`)
    const record = records[0]
    const protectedAssetPath = String(record.canonicalAssetPath)
    const expectedHash = protectedVisualizationFiles[protectedAssetPath]
    if (!expectedHash || record.assetSha256 !== `sha256:${expectedHash}`) {
      throw new Error(`${goalId}: visualization-QA asset binding drifted`)
    }
    record.title = goal.title
    record.description = goal.description
    Object.assign(record, {
      umlautsCorrectChatGpt: 'yes',
      contentApprovedChatGpt: 'yes',
      chatGptReviewedAt: visualizationReviewedAt,
      chatGptReviewer: visualizationReviewer,
      chatGptNotes: visualizationReviewNotes[goalId],
      aiApproved: 'yes',
      aiApprovedAssetSha256: record.assetSha256,
      aiReviewedAt: visualizationReviewedAt,
      aiReviewer: visualizationReviewer,
      aiNotes: visualizationReviewNotes[goalId],
    })
  }
  return qa
}

function countGoalReferences(value: unknown, goalId: string): number {
  if (Array.isArray(value)) return value.reduce((sum, entry) => sum + countGoalReferences(entry, goalId), 0)
  if (!value || typeof value !== 'object') return 0
  const record = value as JsonRecord
  return (record.goalId === goalId ? 1 : 0)
    + Object.values(record).reduce((sum, entry) => sum + countGoalReferences(entry, goalId), 0)
}

function buildCompositionViews(): Map<string, JsonRecord> {
  const result = new Map<string, JsonRecord>()
  for (const path of compositionViewPaths) {
    const view = readJson(path)
    const candidates: JsonRecord[][] = []
    const visit = (value: unknown): void => {
      if (Array.isArray(value)) {
        const idsInArray = value
          .filter((entry): entry is JsonRecord => Boolean(entry) && typeof entry === 'object')
          .map((entry) => entry.goalId)
        if (
          idsInArray.includes(ids.existingModelAssessment)
          && idsInArray.includes(ids.existingDerivativeAssessment)
        ) candidates.push(value as JsonRecord[])
        value.forEach(visit)
        return
      }
      if (value && typeof value === 'object') Object.values(value as JsonRecord).forEach(visit)
    }
    visit(view)
    if (candidates.length !== 1) throw new Error(`${path}: expected one flat E-assessment list, found ${candidates.length}`)
    const entries = candidates[0]
    const anchorIndex = entries.findIndex((entry) => entry.goalId === ids.existingModelAssessment)
    if (anchorIndex < 0) throw new Error(`${path}: missing E-assessment insertion anchor`)
    const anchor = entries[anchorIndex]
    if (anchor.kind !== 'goalEntry') throw new Error(`${path}: assessment anchor is not a goalEntry`)
    const expectedEntry = { ...structuredClone(anchor), goalId: ids.newAssessment }
    const existingIndexes = entries
      .map((entry, index) => entry.goalId === ids.newAssessment ? index : -1)
      .filter((index) => index >= 0)
    if (existingIndexes.length > 1 || countGoalReferences(view, ids.newAssessment) > 1) {
      throw new Error(`${path}: duplicate Batch016 assessment reference`)
    }
    if (existingIndexes.length === 1) {
      if (existingIndexes[0] !== anchorIndex + 1 || !same(entries[existingIndexes[0]], expectedEntry)) {
        throw new Error(`${path}: existing Batch016 assessment reference has wrong placement or projection shape`)
      }
    } else {
      entries.splice(anchorIndex + 1, 0, expectedEntry)
    }
    if (countGoalReferences(view, ids.newAssessment) !== 1) {
      throw new Error(`${path}: Batch016 assessment reference was not inserted exactly once`)
    }
    result.set(path, view)
  }

  const selected = new Set<string>(compositionViewPaths)
  for (const fileName of readdirSync(absolute(paths.compositionRoot))) {
    if (!fileName.endsWith('.view.json')) continue
    const path = `${paths.compositionRoot}/${fileName}`
    if (selected.has(path)) continue
    const view = readJson(path)
    if (countGoalReferences(view, ids.newAssessment) !== 0) {
      throw new Error(`${path}: unexpected explicit Batch016 assessment reference`)
    }
  }
  return result
}

function changedPlannedFiles(files: PlannedFile[]): PlannedFile[] {
  return files.filter(({ path, bytes }) => !existsSync(absolute(path)) || readFileSync(absolute(path), 'utf8') !== bytes)
}

function assertOutputBoundary(files: PlannedFile[]): void {
  const expected = new Set([
    paths.canonical,
    paths.semanticKinds,
    paths.atomicity,
    paths.memory,
    paths.visualizationQa,
    paths.visualizationReview,
    paths.assessmentDraft,
    paths.assessmentSolution,
    paths.assessmentReview,
    ...compositionViewPaths,
  ])
  const actual = new Set(files.map(({ path }) => path))
  if (actual.size !== expected.size || [...actual].some((path) => !expected.has(path))) {
    throw new Error('Batch016 planned outputs escaped the exact canonical/QA/assessment/four-view boundary')
  }
}

function assertAppendOnlyStates(files: PlannedFile[]): void {
  for (const { path, bytes, appendOnly } of files) {
    if (!appendOnly || !existsSync(absolute(path))) continue
    if (readFileSync(absolute(path), 'utf8') !== bytes) {
      throw new Error(`Refusing to overwrite append-only artifact ${path}`)
    }
  }
}

function assertReleasedAssessmentMaterialized(): void {
  for (const [path, expectedBytes] of [
    [paths.assessmentDraft, assessmentDraftMarkdown],
    [paths.assessmentSolution, assessmentSolutionMarkdown],
    [paths.assessmentReview, assessmentReviewMarkdown],
  ] as const) {
    if (!existsSync(absolute(path)) || readFileSync(absolute(path), 'utf8') !== expectedBytes) {
      throw new Error(`Released Batch016 assessment is not review-materialized at ${path}`)
    }
  }
}

if (deterministicGoalId(assessmentShortKey) !== ids.newAssessment) {
  throw new Error(`Deterministic ID mismatch for ${assessmentShortKey}`)
}
assertProtectedVisualizationFiles()
const adjudication = loadAdjudication()
const reviewInputs = loadBoundReviewInputs(adjudication)
const { canonical, weightRefreshGoalIds } = buildCanonical(adjudication, reviewInputs)
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = buildReviewLedger(canonical, paths.atomicity, 'atomicity')
const memory = buildReviewLedger(canonical, paths.memory, 'memory')
const visualizationQa = buildVisualizationQa(canonical)
const compositionViews = buildCompositionViews()

const plannedFiles: PlannedFile[] = [
  { path: paths.canonical, bytes: serializeJson(canonical) },
  { path: paths.semanticKinds, bytes: serializeJson(semanticKinds) },
  { path: paths.atomicity, bytes: serializeJsonl(atomicity) },
  { path: paths.memory, bytes: serializeJsonl(memory) },
  { path: paths.visualizationQa, bytes: serializeJson(visualizationQa) },
  ...[...compositionViews].map(([path, view]) => ({ path, bytes: serializeJson(view) })),
  { path: paths.assessmentDraft, bytes: assessmentDraftMarkdown, appendOnly: true },
  { path: paths.assessmentSolution, bytes: assessmentSolutionMarkdown, appendOnly: true },
  { path: paths.assessmentReview, bytes: assessmentReviewMarkdown, appendOnly: true },
  { path: paths.visualizationReview, bytes: visualizationReviewMarkdown, appendOnly: true },
]
assertOutputBoundary(plannedFiles)
assertAppendOnlyStates(plannedFiles)

const boundedPlanSha256 = sha256(stableJson({
  adjudicationSha256: expectedAdjudicationSha256,
  revisedDecisions: (adjudication.decisions as JsonRecord[])
    .filter((decision) => decision.resolutionDecision === 'accepted_revision')
    .map((decision) => ({ goalId: decision.goalId, finalText: decision.finalText })),
  topologyDecisions: adjudication.topologyDecisions,
  assessmentRemediation: adjudication.assessmentRemediation,
  assessmentGoal: assessmentGoal(),
  assessmentArtifacts: {
    draft: sha256(assessmentDraftMarkdown),
    solution: sha256(assessmentSolutionMarkdown),
    review: sha256(assessmentReviewMarkdown),
  },
  visualizationReview: sha256(visualizationReviewMarkdown),
  protectedVisualizationFiles,
  compositionViewPaths,
  atomicityReasons,
  memoryReasons,
  visualizationReviewNotes,
  plannedOutputBindings: plannedFiles.map(({ path, bytes, appendOnly }) => ({
    path,
    sha256: sha256(bytes),
    appendOnly: appendOnly === true,
  })),
}))
if (expectedBoundedPlanSha256 !== 'PENDING' && boundedPlanSha256 !== expectedBoundedPlanSha256) {
  throw new Error(`Batch016 bounded plan drift: ${boundedPlanSha256} != ${expectedBoundedPlanSha256}`)
}

const changed = changedPlannedFiles(plannedFiles)
if (checkMode && changed.length > 0) {
  throw new Error(`Batch016 is not applied; ${changed.length} planned files differ`)
}

if (writeMode) {
  if (expectedBoundedPlanSha256 === 'PENDING') {
    throw new Error(`Refusing --write until expectedBoundedPlanSha256 is bound to ${boundedPlanSha256}`)
  }
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })

  // Materialize reviewed assessment evidence before publishing its released node.
  const assessmentArtifactPaths = new Set<string>([
    paths.assessmentDraft,
    paths.assessmentSolution,
    paths.assessmentReview,
  ])
  for (const path of assessmentArtifactPaths) {
    const planned = plannedFiles.find((file) => file.path === path)!
    if (!existsSync(absolute(path))) {
      mkdirSync(dirname(absolute(path)), { recursive: true })
      writeFileSync(absolute(path), planned.bytes, { flag: 'wx' })
    }
  }
  assertReleasedAssessmentMaterialized()

  for (const { path, bytes, appendOnly } of changed) {
    if (assessmentArtifactPaths.has(path)) continue
    mkdirSync(dirname(absolute(path)), { recursive: true })
    if (appendOnly) writeFileSync(absolute(path), bytes, { flag: 'wx' })
    else writeFileSync(absolute(path), bytes)
  }
  assertProtectedVisualizationFiles()
  assertReleasedAssessmentMaterialized()
}

const status = writeMode ? 'WRITE' : changed.length === 0 ? 'PASS' : 'PLAN'
console.log(
  `CHECK apply_math_batch016_trigonometric_adjudication ${status} revisions=3 topology=2 `
  + `existingAssessments=2 newAssessments=1 staleFollowUp=8 views=4 `
  + `recursiveWeights=${weightRefreshGoalIds.length} plannedWrites=${changed.length} `
  + `files=${changed.map(({ path }) => basename(path)).join(',') || '-'}`,
)
console.log(`BOUNDED_PLAN_SHA256 ${boundedPlanSha256}`)
