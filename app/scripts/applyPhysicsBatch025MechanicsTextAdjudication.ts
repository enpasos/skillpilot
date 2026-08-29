import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// These bounded curriculum ledgers predate a shared TypeScript schema and are
// therefore checked field by field below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>
type PlannedFile = {
  path: string
  bytes: string
  beforeSha256: string
  afterSha256: string
  state: 'before' | 'after'
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const reviewedAt = '2026-08-29'
const reviewer = 'codex-physics-b025-mechanics-text-adjudication-2026-08-29'
const physicsLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const mechanicsDeckId = 'de_gymnasium_physics_mechanics_ephase'
const mechanicsMemoryGoalId = '9f2f5ab8-0ae4-5792-b831-82a05af5895c'
const f524ProjectionPlanSha256 = '935899b9c5c2ab41c8d769b9c489975c8bb9e849815a84971ef2b2360c583c24'
const expectedAdjudicationSha256 = '5351bba08ffbb83590ce530eb9d026dfb35cea1c6d9da8b8adaef4b9c50b0003'

// This value is deliberately bound only after an independent review of the
// complete no-write plan. PENDING makes --write impossible.
const expectedBoundedPlanSha256 = 'cd499ceb70a5736995648a9e97f6680297b52b4f73d04a92327683ea0b94eaac'

const batchRoot =
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/'
  + 'batch-025-e-mechanics-energy-current-20-v1'

const paths = {
  adjudication: `${batchRoot}/third-adjudication/adjudication.json`,
  config: `${batchRoot}.config.json`,
  batchManifest: `${batchRoot}/batch-manifest.json`,
  bookModel: `${batchRoot}/bundle/book-model.json`,
  bundleManifest: `${batchRoot}/bundle/manifest.json`,
  bundleReviewInput: `${batchRoot}/bundle/review-input.json`,
  bundleReviewInputJsonl: `${batchRoot}/bundle/review-input.jsonl`,
  dualSummary: `${batchRoot}/dual-summary.json`,
  roundAReviewInput: `${batchRoot}/round-a/description-review-input.json`,
  roundABatchInput:
    `${batchRoot}/round-a/batches/`
    + 'physik-rollout-v1-batch-025-e-mechanics-energy-current-20-v1-20260828-first-pass-a.batch-001.input.jsonl',
  roundARun:
    `${batchRoot}/round-a/results/`
    + 'physik-rollout-v1-batch-025-e-mechanics-energy-current-20-v1-20260828-first-pass-a.batch-001.run.json',
  roundARecords:
    `${batchRoot}/round-a/results/`
    + 'physik-rollout-v1-batch-025-e-mechanics-energy-current-20-v1-20260828-first-pass-a.batch-001.records.jsonl',
  roundBReviewInput: `${batchRoot}/round-b/description-review-input.json`,
  roundBBatchInput:
    `${batchRoot}/round-b/batches/`
    + 'physik-rollout-v1-batch-025-e-mechanics-energy-current-20-v1-20260828-first-pass-b.batch-001.input.jsonl',
  roundBRun:
    `${batchRoot}/round-b/results/`
    + 'physik-rollout-v1-batch-025-e-mechanics-energy-current-20-v1-20260828-first-pass-b.batch-001.run.json',
  roundBRecords:
    `${batchRoot}/round-b/results/`
    + 'physik-rollout-v1-batch-025-e-mechanics-energy-current-20-v1-20260828-first-pass-b.batch-001.records.jsonl',
  f524ProjectionScript: 'app/scripts/applyPhysicsF524CourseProjection.ts',
  goalBookModel: 'app/scripts/goalBookModel.ts',
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  goalMemory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  cardLedger: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.cards.review.jsonl',
  canonicalDeckDe: 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.de.json',
  canonicalDeckEn: 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.en.json',
  publicDeckDe: 'app/public/data/de_gymnasium_physics_flashcards_mechanics_ephase.de.json',
  publicDeckEn: 'app/public/data/de_gymnasium_physics_flashcards_mechanics_ephase.en.json',
  backendDeckDe: 'backend/src/main/resources/static/data/de_gymnasium_physics_flashcards_mechanics_ephase.de.json',
  backendDeckEn: 'backend/src/main/resources/static/data/de_gymnasium_physics_flashcards_mechanics_ephase.en.json',
} as const

const expectedInputHashes: Record<string, string> = {
  [paths.adjudication]: expectedAdjudicationSha256,
  [paths.config]: 'b60924ec6896316c1fb3259370a656e19180d0490620453b5bae342d74c8d1f7',
  [paths.batchManifest]: '7b92d30ad287b6f9fea4e95297d8e7fe683f9becd14955ca8565da972e65a692',
  [paths.bookModel]: '820423ca81e6a61d77bc7e77b1a27d2f5dbd03ecbf6fc5b9904182c3632fa710',
  [paths.bundleManifest]: '3ed1f14cf9c334ea5e9b6a7ef2601d4da8451fd89f355447a6c66887c174d186',
  [paths.bundleReviewInput]: 'e5b48a806f373811119de2da7110433c9d632fae4aba9f6cae600a11601f1e9c',
  [paths.bundleReviewInputJsonl]: '6ad2b2a890236bfd9aabaf41a0f4c333aa92a3d87add46f4d5423f68648dee03',
  [paths.dualSummary]: '384c0f4cf154cfe9558e3d885e094e396a5290bf75afe9b3b47718645617fb24',
  [paths.roundAReviewInput]: '73d1035534da56680a2209a5b0b2b9a949eb41e8899ac496dc410dded01dc061',
  [paths.roundABatchInput]: '49dfe8b71d3add23bc40bb53d71da6157d9c4a0f4af8c197e083aa6d97e1d4ed',
  [paths.roundARun]: '721e1a263acaa8fca11bc2ff3e5e53d5533fcb636e916aaf2e61d8fef3036650',
  [paths.roundARecords]: 'ec3e9fc0c6d94c342ff96ee09ea58a98061832cc06976da610aa2ed134a9b5a6',
  [paths.roundBReviewInput]: '73d1035534da56680a2209a5b0b2b9a949eb41e8899ac496dc410dded01dc061',
  [paths.roundBBatchInput]: '9a51eec891f4266ddc712259c823016fd6c48a2916f8915170ca931efdf0f700',
  [paths.roundBRun]: '79cc0a73a3c1ff0fdbe17293259722635e073675854c23e1b327c42e73bbadc2',
  [paths.roundBRecords]: 'f08e7206b82cb6b1fe525463c1e0e7f8f99127d6cd1049f3e3bb43df4dc05793',
  [paths.f524ProjectionScript]: '07989f663d3af05fd06d4ea4890c5de7efb9a2541c4b874616a8e34eb766bc4f',
  [paths.goalBookModel]: 'd8993c1270797f4e8406b2ef359eb0979768cc32078e5b988a32f50409207e60',
}

const expectedBeforeHashes: Record<string, string> = {
  [paths.canonical]: '1cd096e078a8878da47e4a432aa078c770119349312788d6f1bb31761aea6c4c',
  [paths.semanticKinds]: '2de25f00336068060d0389605e821a3c4fecd5e54500dcf1fcf766a60675b06a',
  [paths.atomicity]: '570c31c1805c69c191dcbf89cef7cb510dd37ea498da1e4b029c3a3f26b7fb47',
  [paths.goalMemory]: 'f59229ecf5f11756efa5b0efe23add1b5523c5f60d6b9185f8f5c1e69fd36385',
  [paths.cardLedger]: 'a242603cf1bbd06bead51c323db92ef66a00fc532809e5e871049664501ac699',
  [paths.canonicalDeckDe]: '088809107576ac1838910ecc9050225ee43d6c99fafc35d1ec243a0706ead7c6',
  [paths.canonicalDeckEn]: '9c5cca283059a2c1341765a61c45d62dd51aaabdd380dcbfba993a52eeb88f9f',
  [paths.publicDeckDe]: '088809107576ac1838910ecc9050225ee43d6c99fafc35d1ec243a0706ead7c6',
  [paths.publicDeckEn]: '9c5cca283059a2c1341765a61c45d62dd51aaabdd380dcbfba993a52eeb88f9f',
  [paths.backendDeckDe]: '088809107576ac1838910ecc9050225ee43d6c99fafc35d1ec243a0706ead7c6',
  [paths.backendDeckEn]: '9c5cca283059a2c1341765a61c45d62dd51aaabdd380dcbfba993a52eeb88f9f',
}

const batchGoalIds = [
  'ce431132-dfc4-42c2-aff6-bd72035190f8',
  '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
  'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  '09029573-864f-40ca-bf8a-cee7bf6dcb73',
  '4a2bf015-052b-4af0-aed7-324259fa1a8a',
  '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
  'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
  '5f289cdc-fda1-4058-b44f-041ba1398e79',
  'ad984bb6-e225-432a-952d-d83cda40b7f8',
  '00245a43-eb89-47d2-92d7-21799dbec9f3',
  'c1c71daa-042b-4f4c-8c31-0ac366f5149e',
  '94784e0a-7ddc-48be-91fb-dc82b78eb322',
  '7eeff2de-6015-49a6-a96e-a488d886dc9f',
  '6affc2ea-ecd2-4fcd-8877-3ffa15b0425b',
  '91c49019-ea51-4ce5-a919-c91c45b25e83',
  '253a71d2-e751-4c63-acbe-238b71463cd8',
  '839ecc8f-3a60-418b-bc92-64bfeef33824',
  'f524f05c-4456-4fc3-a1f7-f40741fc1f16',
  'e790de73-f8e5-4027-bc05-9f12a0e8c9cb',
] as const

const acceptedRevisionGoalIds = [
  '09029573-864f-40ca-bf8a-cee7bf6dcb73',
  '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
  '5f289cdc-fda1-4058-b44f-041ba1398e79',
  'ad984bb6-e225-432a-952d-d83cda40b7f8',
  'c1c71daa-042b-4f4c-8c31-0ac366f5149e',
  '6affc2ea-ecd2-4fcd-8877-3ffa15b0425b',
  '91c49019-ea51-4ce5-a919-c91c45b25e83',
  '839ecc8f-3a60-418b-bc92-64bfeef33824',
  'e790de73-f8e5-4027-bc05-9f12a0e8c9cb',
] as const
const noProgressCorrectionGoalId = 'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20'
const canonicalTextMutationGoalIds = [
  '09029573-864f-40ca-bf8a-cee7bf6dcb73',
  '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
  noProgressCorrectionGoalId,
  '5f289cdc-fda1-4058-b44f-041ba1398e79',
  'ad984bb6-e225-432a-952d-d83cda40b7f8',
  'c1c71daa-042b-4f4c-8c31-0ac366f5149e',
  '6affc2ea-ecd2-4fcd-8877-3ffa15b0425b',
  '91c49019-ea51-4ce5-a919-c91c45b25e83',
  '839ecc8f-3a60-418b-bc92-64bfeef33824',
  'e790de73-f8e5-4027-bc05-9f12a0e8c9cb',
] as const

type CardRevision = {
  de: { front: string; back: string }
  en: { front: string; back: string }
}

const cardRevisions: Record<string, CardRevision> = {
  physics_e_cov_013: {
    de: {
      front: '1. Newtonsches Axiom (Trägheitsprinzip) im Inertialsystem?',
      back: String.raw`Ist die resultierende äußere Kraft null, bleibt ein Körper in Ruhe oder bewegt sich geradlinig mit konstantem Geschwindigkeitsvektor:

$\sum \vec F_\mathrm{ext}=0 \Rightarrow \vec v=\text{konstant}$`,
    },
    en: {
      front: 'Newton’s first law (law of inertia) in an inertial frame?',
      back: String.raw`If the net external force is zero, a body remains at rest or moves in a straight line with constant velocity:

$\sum \vec F_\mathrm{ext}=0 \Rightarrow \vec v=\text{constant}$`,
    },
  },
  physics_e_cov_014: {
    de: {
      front: String.raw`Was folgt im Inertialsystem aus $\sum \vec F_\mathrm{ext}=0$?`,
      back: String.raw`$\vec a=0$ und damit $\vec v=\text{konstant}$. Kräftegleichgewicht bedeutet keine Beschleunigung, aber nicht zwingend Ruhe.`,
    },
    en: {
      front: String.raw`What follows in an inertial frame from $\sum \vec F_\mathrm{ext}=0$?`,
      back: String.raw`$\vec a=0$ and therefore $\vec v=\text{constant}$. Force equilibrium means no acceleration, but not necessarily rest.`,
    },
  },
  physics_e_cov_015: {
    de: {
      front: '2. Newtonsches Axiom für einen Körper konstanter Masse im Inertialsystem?',
      back: String.raw`Mit $\vec p=m\vec v$ gilt:

$\sum \vec F_\mathrm{ext}=\frac{\mathrm d\vec p}{\mathrm dt}=m\vec a$`,
    },
    en: {
      front: 'Newton’s second law for a constant-mass body in an inertial frame?',
      back: String.raw`With $\vec p=m\vec v$:

$\sum \vec F_\mathrm{ext}=\frac{\mathrm d\vec p}{\mathrm dt}=m\vec a$`,
    },
  },
  physics_e_cov_017: {
    de: {
      front: '3. Newtonsches Axiom (Wechselwirkungsprinzip)?',
      back: String.raw`Üben zwei Körper A und B Kräfte aufeinander aus, so gilt gleichzeitig:

$\vec F_{A\to B}=-\vec F_{B\to A}$

Die gleich großen, entgegengesetzt gerichteten Kräfte wirken auf verschiedene Körper.`,
    },
    en: {
      front: 'Newton’s third law (action–reaction law)?',
      back: String.raw`When two bodies A and B exert forces on each other, simultaneously:

$\vec F_{A\to B}=-\vec F_{B\to A}$

The equal-magnitude, oppositely directed forces act on different bodies.`,
    },
  },
  physics_e_cov_020: {
    de: {
      front: 'Die drei Newtonschen Axiome in Kurzform?',
      back: String.raw`1: Im Inertialsystem gilt $\sum \vec F_\mathrm{ext}=0 \Rightarrow \vec v=\text{konstant}$.

2: Für einen Körper konstanter Masse gilt $\sum \vec F_\mathrm{ext}=\frac{\mathrm d\vec p}{\mathrm dt}=m\vec a$.

3: $\vec F_{A\to B}=-\vec F_{B\to A}$; beide Kräfte wirken gleichzeitig auf verschiedene Körper.`,
    },
    en: {
      front: 'The three Newtonian laws in short form?',
      back: String.raw`1: In an inertial frame, $\sum \vec F_\mathrm{ext}=0 \Rightarrow \vec v=\text{constant}$.

2: For a constant-mass body, $\sum \vec F_\mathrm{ext}=\frac{\mathrm d\vec p}{\mathrm dt}=m\vec a$.

3: $\vec F_{A\to B}=-\vec F_{B\to A}$; both forces act simultaneously on different bodies.`,
    },
  },
  physics_e_cov_021: {
    de: {
      front: 'Mechanische Arbeit als Energieübertragung?',
      back: String.raw`Arbeit ist vorzeichenbehaftete Energieübertragung über die Grenze eines gewählten Systems. Ist sie die einzige Übertragung, entspricht die am System verrichtete Arbeit seiner Energieänderung.

Für die am System verrichtete Arbeit gilt $W=\int_C \vec F\cdot \mathrm d\vec s$.

Bei konstanter Kraft und geradliniger Verschiebung gilt $W=Fs\cos\alpha$; für gleichgerichtete Kraft gilt $W=Fs$.`,
    },
    en: {
      front: 'Mechanical work as energy transfer?',
      back: String.raw`Work is signed energy transfer across the boundary of a chosen system. If it is the only transfer, the work done on the system equals its change in energy.

For work done on the system, $W=\int_C \vec F\cdot \mathrm d\vec s$.

For a constant force and straight-line displacement, $W=Fs\cos\alpha$; for force in the same direction as the displacement, $W=Fs$.`,
    },
  },
  physics_e_cov_024: {
    de: {
      front: 'Gravitative potenzielle Energie nahe der Erdoberfläche?',
      back: String.raw`Für das System Körper–Erde gilt bei annähernd konstantem $g$ relativ zu einer gewählten Bezugshöhe $h=0$:

$E_\mathrm{pot}=mgh$

Unabhängig vom Nullniveau ist $\Delta E_\mathrm{pot}=mg\,\Delta h$.`,
    },
    en: {
      front: 'Gravitational potential energy near Earth’s surface?',
      back: String.raw`For the object–Earth system with approximately constant $g$, relative to a chosen reference height $h=0$:

$E_\mathrm{pot}=mgh$

Independent of the zero level, $\Delta E_\mathrm{pot}=mg\,\Delta h$.`,
    },
  },
  physics_e_cov_026: {
    de: {
      front: 'Wann bleibt die Gesamtenergie eines Systems konstant?',
      back: String.raw`Wenn über die Systemgrenze keine Energie übertragen wird (isoliertes System), gilt:

$E_\mathrm{ges}=\text{konstant}$

Jede Energieübertragung muss in der Energiebilanz berücksichtigt werden.`,
    },
    en: {
      front: 'When does a system’s total energy remain constant?',
      back: String.raw`If no energy is transferred across the system boundary (isolated system):

$E_\mathrm{tot}=\text{constant}$

Any energy transfer must be included in the energy balance.`,
    },
  },
  physics_e_cov_028: {
    de: {
      front: 'Wann ist der Gesamtimpuls eines Systems erhalten?',
      back: String.raw`Ist der resultierende äußere Kraftstoß im betrachteten Zeitintervall null, gilt vektoriell:

$\vec J_\mathrm{ext}=\int \sum \vec F_\mathrm{ext}\,\mathrm dt=0 \Rightarrow \sum_i \vec p_i=\text{konstant}$`,
    },
    en: {
      front: 'When is a system’s total momentum conserved?',
      back: String.raw`If the net external impulse over the time interval is zero, then vectorially:

$\vec J_\mathrm{ext}=\int \sum \vec F_\mathrm{ext}\,\mathrm dt=0 \Rightarrow \sum_i \vec p_i=\text{constant}$`,
    },
  },
}

const expectedCardFingerprints: Record<string, string> = {
  physics_e_cov_013: 'sha256:f8f759a1bb9c289d392ee154ef8b11b75ee70fa42233d858a05b6d0eaec88616',
  physics_e_cov_014: 'sha256:5a91eed9b1962e1e1bcddd50e8b01a81806ebf11eb2181d8c1c1ecfe31429332',
  physics_e_cov_015: 'sha256:bc575aa2aed82d39678311d126c6620ff0afeb16f68aa9f664293230c22ae6e7',
  physics_e_cov_017: 'sha256:fd68239cfdc013f0d6a29b7e6e670ecfec553fe40acb5c5341d7a50e56d5b574',
  physics_e_cov_020: 'sha256:3bbd42a29e8c367c3916ee1302f1fd3de02a9b057dcbcf88786ee715c408877d',
  physics_e_cov_021: 'sha256:50aa70b9624c796776bf3752fb18ab69cbba2730a290249e35d464587eb8f828',
  physics_e_cov_024: 'sha256:438be013e5eb2570e57e1b1fb84a3acc8dcdb6952fa4573c45da78f4ce8f80ab',
  physics_e_cov_026: 'sha256:5207015b93de5277efbb083162860b32dea3624643b1b335e59c36cf29fcbed5',
  physics_e_cov_028: 'sha256:e6fc00f894ac907a7272b9bfc7b71c5c84dd80aae523405ffded27188a8d30a2',
}

const cardOrigins: Record<string, string[]> = {
  physics_e_cov_013: ['31a2ef52-114b-4d2c-a720-6ef5a390b6dc'],
  physics_e_cov_014: ['32b896b9-f2f1-4d4e-96ad-e869ac3d3759'],
  physics_e_cov_015: ['a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20'],
  physics_e_cov_017: ['ad984bb6-e225-432a-952d-d83cda40b7f8'],
  physics_e_cov_020: [
    '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
    'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
    'ad984bb6-e225-432a-952d-d83cda40b7f8',
  ],
  physics_e_cov_021: ['c1c71daa-042b-4f4c-8c31-0ac366f5149e'],
  physics_e_cov_024: ['6affc2ea-ecd2-4fcd-8877-3ffa15b0425b'],
  physics_e_cov_026: ['91c49019-ea51-4ce5-a919-c91c45b25e83'],
  physics_e_cov_028: ['839ecc8f-3a60-418b-bc92-64bfeef33824'],
}

const atomicityReasons: Record<string, string> = {
  '09029573-864f-40ca-bf8a-cee7bf6dcb73':
    'Versuch, Diagrammauswertung und Modellinferenz bilden die zusammenhängende Bestimmung von g und eines Zeit-Ort-Gesetzes für denselben freien Fall.',
  '31a2ef52-114b-4d2c-a720-6ef5a390b6dc':
    'Formulierung und Situationsdeutung prüfen ein einziges physikalisches Gesetz unter derselben Inertialsystem-Bedingung.',
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759':
    'Bedingung, Bewegungszustände und Zusammenhang gehören zur einen Anwendungskompetenz des Trägheitsprinzips.',
  'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20':
    'Impulsdefinition, Systemgrenze, allgemeine Gesetzesform und Konstantmassenreduktion bilden eine zusammenhängende Newton-II-Kompetenz.',
  '5f289cdc-fda1-4058-b44f-041ba1398e79':
    'Vorzeichenwahl, resultierende Kraft und Bewegungsentscheidung sind Schritte derselben eindimensionalen Kraftbilanz.',
  'ad984bb6-e225-432a-952d-d83cda40b7f8':
    'Gesetzesformulierung und Beispieldarstellung prüfen dieselbe Wechselwirkungskompetenz zwischen zwei Körpern.',
  'c1c71daa-042b-4f4c-8c31-0ac366f5149e':
    'Systemgrenze, Vorzeichen und konsistente Energiebilanz sind zusammenhängende Aspekte derselben Energieübertragung durch mechanische Arbeit.',
  '6affc2ea-ecd2-4fcd-8877-3ffa15b0425b':
    'Beschreibung und Berechnung betreffen dasselbe nahe Erdoberfläche begrenzte Modell gravitativer potenzieller Energie.',
  '91c49019-ea51-4ce5-a919-c91c45b25e83':
    'Bilanz und Erhaltungsbegründung bilden dieselbe Kompetenz für ein gewähltes isoliertes System.',
  '839ecc8f-3a60-418b-bc92-64bfeef33824':
    'Erhaltung, Rückstoßbeschreibung und Begründung betreffen dieselbe vektorielle Systemimpulsbilanz.',
  'e790de73-f8e5-4027-bc05-9f12a0e8c9cb':
    'Integral, Konstantkraft-Sonderfall und Impulsänderung sind Darstellungen derselben Kraftstoß-Kompetenz.',
}

const memoryReasons: Record<string, string> = {
  '09029573-864f-40ca-bf8a-cee7bf6dcb73':
    'Die bestehende Mechanik-Karte hält nur die kompakte Freifallbeziehung verfügbar; sichere Durchführung, Diagrammauswertung und Modellgrenzen bleiben Aufgabenpraxis.',
  '31a2ef52-114b-4d2c-a720-6ef5a390b6dc':
    'Die Karten 013 und 020 sichern die knappe Gesetzesaussage; Situationsdeutung bleibt Teil des normalen Lernziels.',
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759':
    'Karte 014 sichert die Beziehung zwischen verschwindender resultierender Kraft und konstantem Geschwindigkeitsvektor; Anwendung bleibt aufgabenbasiert.',
  'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20':
    'Die Karten 015 und 020 begrenzen den Abruf ausdrücklich auf den Körper konstanter Masse; Herleitung und Deutung bleiben Verständnisleistungen.',
  '5f289cdc-fda1-4058-b44f-041ba1398e79':
    'Vorzeichenwahl, Kraftbilanz und Bewegungsentscheidung müssen an Situationen geübt werden; eine zusätzliche isolierte Merkkarte ist nicht erforderlich.',
  'ad984bb6-e225-432a-952d-d83cda40b7f8':
    'Die Karten 017 und 020 sichern die kompakte Wechselwirkungsaussage; korrekte Körperzuordnung bleibt Anwendungskompetenz.',
  'c1c71daa-042b-4f4c-8c31-0ac366f5149e':
    'Karte 021 sichert Arbeitsintegral, Vorzeichen- und Sonderfallwissen; Systemwahl und Energiebilanz bleiben Aufgabenpraxis.',
  '6affc2ea-ecd2-4fcd-8877-3ffa15b0425b':
    'Karte 024 sichert Formel, Bezugshöhe und Änderung; Modellwahl und Berechnung bleiben im Lernziel.',
  '91c49019-ea51-4ce5-a919-c91c45b25e83':
    'Karte 026 sichert die präzise Isolationsbedingung; konkrete Energieübertragungsbilanzen bleiben Verständnis- und Aufgabenpraxis.',
  '839ecc8f-3a60-418b-bc92-64bfeef33824':
    'Karte 028 sichert die Bedingung des verschwindenden äußeren Kraftstoßes; Rückstoßanalyse und Begründung bleiben Aufgabenpraxis.',
  'e790de73-f8e5-4027-bc05-9f12a0e8c9cb':
    'Die vorhandene Mechanik-Karte hält die kompakte Kraftstoß-Impuls-Beziehung verfügbar; Diagrammauswertung und Vektordeutung bleiben Aufgabenpraxis.',
}

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const sha256Digest = (value: string | Uint8Array): string => `sha256:${sha256(value)}`
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim() !== '')
  .map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string => `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const normalizeText = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}
const exactArray = (left: unknown, right: unknown): boolean => JSON.stringify(left) === JSON.stringify(right)
const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message)
}

const goalReviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => sha256Digest(stableJson({
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

const cardReviewFingerprint = (card: JsonRecord): string => sha256Digest(stableJson({
  ruleVersion: 'memory-card-review-v1',
  deckId: mechanicsDeckId,
  cardId: card.id,
  front: normalizeText(card.front),
  back: normalizeText(card.back),
  category: normalizeText(card.category),
  tags: (card.tags as unknown[]).map(normalizeText),
}))

for (const [path, expectedHash] of Object.entries(expectedInputHashes)) {
  assert(existsSync(absolute(path)), `Missing bound input: ${path}`)
  const actualHash = sha256(readFileSync(absolute(path)))
  assert(actualHash === expectedHash, `Bound input drifted: ${path}; expected ${expectedHash}, got ${actualHash}`)
}

const adjudication = readJson(paths.adjudication)
assert(adjudication.schemaVersion === 1, 'Unexpected adjudication schemaVersion')
assert(adjudication.validationContract === 'goal-description-third-adjudication-v1', 'Unexpected adjudication contract')
assert(adjudication.batchId === 'physik-rollout-v1-batch-025-e-mechanics-energy-current-20-v1-20260828', 'Unexpected adjudication batchId')
assert(adjudication.subject === 'physik', 'Unexpected adjudication subject')
assert(adjudication.landscapeId === physicsLandscapeId, 'Unexpected adjudication landscapeId')
assert(adjudication.materialized === false && adjudication.noProgressClaim === true, 'Adjudication must remain an unapplied no-progress plan')
assert(adjudication.campaignGoalCount === 20 && adjudication.resolvedGoalCount === 0, 'Adjudication progress must remain zero before fresh review')
assert(adjudication.progressAccounting?.strictProgressGoalCount === 0, 'Strict progress must remain zero before fresh review')
assert(
  adjudication.progressAccounting?.acceptedRevisionImplementationDecisionCount === acceptedRevisionGoalIds.length,
  'Accepted-revision implementation-decision count drifted',
)
assert(exactArray(adjudication.progressAccounting?.excludedFromProgressGoalIds, batchGoalIds), 'All Batch-025 goals must remain excluded from progress')
assert(Array.isArray(adjudication.decisions) && adjudication.decisions.length === 20, 'Expected exactly twenty adjudication decisions')
assert(exactArray(adjudication.acceptedRevisionGoalIds, acceptedRevisionGoalIds), 'Accepted-revision implementation goal IDs drifted')
assert(exactArray(adjudication.strictProgressGoalIds, []), 'Strict progress goal IDs must remain empty before fresh review')
assert(exactArray(adjudication.canonicalTextMutationGoalIds, canonicalTextMutationGoalIds), 'Canonical text mutation goal IDs drifted')
assert(exactArray(adjudication.memoryCardRevisionIds, Object.keys(cardRevisions)), 'Memory-card revision IDs drifted')

const decisionByGoalId = new Map<string, JsonRecord>()
for (const [index, decision] of (adjudication.decisions as JsonRecord[]).entries()) {
  assert(decision.position === index + 1, `Adjudication position drift at index ${index}`)
  assert(decision.goalId === batchGoalIds[index], `Adjudication goal order drift at position ${index + 1}`)
  assert(!decisionByGoalId.has(decision.goalId), `Duplicate adjudication goal: ${decision.goalId}`)
  assert(decision.progressCounted === false, `${decision.goalId}: no Batch-025 decision may count before fresh review`)
  decisionByGoalId.set(decision.goalId, decision)
}
assert(
  acceptedRevisionGoalIds.every((goalId) => decisionByGoalId.get(goalId)?.resolutionDecision === 'accepted_revision'),
  'Accepted-revision decision set drifted',
)
assert(decisionByGoalId.get(noProgressCorrectionGoalId)?.resolutionDecision === 'no_progress_correction', 'a94 correction classification drifted')
assert(decisionByGoalId.get(noProgressCorrectionGoalId)?.progressCounted === false, 'a94 correction must not count as progress')
assert(
  decisionByGoalId.get(noProgressCorrectionGoalId)?.independentReplacementVisualization?.candidateSha256
    === '57b21a77d205429a3b9a6905e19da7085020d160e252ddcfa2738161253a6817',
  'a94 independently audited replacement candidate digest drifted',
)
assert(decisionByGoalId.get('e4b38061-1f28-43ad-8371-a3e7c0e81856')?.resolutionDecision === 'external_structural_split_required', 'e4 split must remain external')
assert(decisionByGoalId.get('e4b38061-1f28-43ad-8371-a3e7c0e81856')?.externalDecisionContract?.retainCurrentGoalAsCurricularAtomic === true, 'e4 must remain curricularAtomic')
assert(decisionByGoalId.get('e4b38061-1f28-43ad-8371-a3e7c0e81856')?.externalDecisionContract?.newSiblingGoalIdPrefix === 'bf8517', 'e4 sibling goal prefix drifted')
assert(decisionByGoalId.get('e4b38061-1f28-43ad-8371-a3e7c0e81856')?.externalDecisionContract?.sharedParentGoalId === '65ddd780-0323-45d1-8f94-5e31bf28da23', 'e4 sibling parent drifted')
assert(decisionByGoalId.get('e4b38061-1f28-43ad-8371-a3e7c0e81856')?.externalDecisionContract?.copyExistingVisualizationAsClusterOverview === true, 'e4 cluster-overview copy contract drifted')
assert(decisionByGoalId.get('f524f05c-4456-4fc3-a1f7-f40741fc1f16')?.resolutionDecision === 'keep_current_with_external_lk_projection', 'f524 LK projection decision drifted')
assert(decisionByGoalId.get('f524f05c-4456-4fc3-a1f7-f40741fc1f16')?.externalDecisionContract?.expectedDirectGkGoalEntryCount === 30, 'f524 GK projection count drifted')
assert(decisionByGoalId.get('f524f05c-4456-4fc3-a1f7-f40741fc1f16')?.externalDecisionContract?.materialization === 'materialized_external_check_pass', 'f524 materialization status drifted')
assert(decisionByGoalId.get('f524f05c-4456-4fc3-a1f7-f40741fc1f16')?.externalDecisionContract?.verificationPlanSha256 === f524ProjectionPlanSha256, 'f524 verification plan digest drifted')
const f524Integration = (adjudication.externalIntegrations as JsonRecord[])
  .find((integration) => integration.integrationId === 'b025-f524-lk-projection')
assert(f524Integration?.status === 'materialized_external_check_pass', 'f524 external integration must be materialized and checked')
assert(f524Integration?.verifiedDirectGkGoalEntryCount === 30, 'f524 verified GK projection count drifted')
assert(f524Integration?.verificationPlanSha256 === f524ProjectionPlanSha256, 'f524 external integration plan digest drifted')

const f524ProjectionCheckOutput = execFileSync(
  absolute('app/node_modules/.bin/tsx'),
  ['scripts/applyPhysicsF524CourseProjection.ts', '--check'],
  { cwd: absolute('app'), encoding: 'utf8' },
).trim()
assert(
  f524ProjectionCheckOutput
    === `CHECK physics_f524_course_projection views=30 inserted=0 alreadyCurrent=30 planSha256=${f524ProjectionPlanSha256}`,
  `f524 read-only projection check failed: ${f524ProjectionCheckOutput}`,
)

const batchManifest = readJson(paths.batchManifest)
assert(exactArray(batchManifest.goalIds, batchGoalIds), 'Batch manifest goal order drifted')
const dualSummary = readJson(paths.dualSummary)
assert(dualSummary.goalCount === 20 && dualSummary.counts?.requiresSynthesis === 20, 'Dual-summary counts drifted')
assert(Array.isArray(dualSummary.goals) && dualSummary.goals.length === 20, 'Dual-summary goals drifted')
for (const [index, summaryGoal] of (dualSummary.goals as JsonRecord[]).entries()) {
  const decision = adjudication.decisions[index] as JsonRecord
  assert(summaryGoal.goalId === batchGoalIds[index], `Dual-summary goal order drift at position ${index + 1}`)
  assert(summaryGoal.firstRecordId === decision.roundA?.recordId, `${summaryGoal.goalId}: Round-A provenance drifted`)
  assert(summaryGoal.secondRecordId === decision.roundB?.recordId, `${summaryGoal.goalId}: Round-B provenance drifted`)
  assert(summaryGoal.firstDecision === decision.roundA?.decision, `${summaryGoal.goalId}: Round-A decision drifted`)
  assert(summaryGoal.secondDecision === decision.roundB?.decision, `${summaryGoal.goalId}: Round-B decision drifted`)
  assert(summaryGoal.requiresSynthesis === true && summaryGoal.automaticAcceptance === false, `${summaryGoal.goalId}: synthesis contract drifted`)
}

const roundAInputs = readJsonl(paths.roundABatchInput)
const roundBInputs = readJsonl(paths.roundBBatchInput)
assert(roundAInputs.length === 20 && roundBInputs.length === 20, 'Expected twenty review inputs in each independent round')
const reviewInputByGoalId = new Map<string, JsonRecord>()
for (const [index, entry] of roundAInputs.entries()) {
  const goal = entry.goal as JsonRecord
  const otherGoal = roundBInputs[index]?.goal as JsonRecord
  assert(goal?.goalId === batchGoalIds[index], `Round-A review-input order drift at position ${index + 1}`)
  assert(otherGoal?.goalId === batchGoalIds[index], `Round-B review-input order drift at position ${index + 1}`)
  for (const field of ['currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']) {
    assert(goal[field] === otherGoal[field], `${goal.goalId}: independent review inputs disagree on ${field}`)
  }
  reviewInputByGoalId.set(goal.goalId, goal)
}

const canonicalOriginal = readJson(paths.canonical)
const canonical = cloneJson(canonicalOriginal)
assert(canonical.landscapeId === physicsLandscapeId, 'Unexpected canonical Physics landscape')
const originalGoalById = new Map<string, JsonRecord>((canonicalOriginal.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
const goalById = new Map<string, JsonRecord>((canonical.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
for (const goalId of canonicalTextMutationGoalIds) {
  const goal = goalById.get(goalId)
  const originalGoal = originalGoalById.get(goalId)
  const input = reviewInputByGoalId.get(goalId)
  const finalText = decisionByGoalId.get(goalId)?.finalText as JsonRecord | undefined
  assert(goal && originalGoal && input && finalText, `${goalId}: missing canonical goal, review input, or final text`)
  assert(finalText.titleDe === input.currentTitleDe && finalText.titleEn === input.currentTitleEn, `${goalId}: title mutation is outside scope`)
  assert(goal.title === finalText.titleDe && goal.titleEn === finalText.titleEn, `${goalId}: canonical title drifted`)
  const currentDescriptions = [goal.description, goal.descriptionEn]
  const inputDescriptions = [input.currentDescriptionDe, input.currentDescriptionEn]
  const finalDescriptions = [finalText.descriptionDe, finalText.descriptionEn]
  assert(
    exactArray(currentDescriptions, inputDescriptions) || exactArray(currentDescriptions, finalDescriptions),
    `${goalId}: canonical descriptions match neither the bound review input nor adjudicated final text`,
  )
  goal.description = finalText.descriptionDe
  goal.descriptionEn = finalText.descriptionEn
}

const semanticKindsOriginal = readJson(paths.semanticKinds)
const semanticKinds = cloneJson(semanticKindsOriginal)
for (const goalId of canonicalTextMutationGoalIds) {
  const record = (semanticKinds.decisions as JsonRecord[]).find((candidate) => candidate.goalId === goalId)
  const oldGoal = originalGoalById.get(goalId)
  const newGoal = goalById.get(goalId)
  assert(record && oldGoal && newGoal, `${goalId}: missing semantic-kind decision or goal`)
  assert(record.semanticKind === 'curricularAtomic' && record.decisionStatus === 'authoritative', `${goalId}: semantic-kind authority drifted`)
  const oldFingerprint = fingerprintSemanticKindSourceGoal(oldGoal)
  const newFingerprint = fingerprintSemanticKindSourceGoal(newGoal)
  assert(record.sourceFingerprint === oldFingerprint || record.sourceFingerprint === newFingerprint, `${goalId}: semantic-kind fingerprint drifted`)
  record.sourceFingerprint = newFingerprint
}

const atomicityOriginal = readJsonl(paths.atomicity)
const atomicity = cloneJson(atomicityOriginal)
const goalMemoryOriginal = readJsonl(paths.goalMemory)
const goalMemory = cloneJson(goalMemoryOriginal)
for (const goalId of canonicalTextMutationGoalIds) {
  const oldGoal = originalGoalById.get(goalId)!
  const newGoal = goalById.get(goalId)!
  const atomicityRecord = atomicity.find((candidate) => candidate.goalId === goalId)
  const memoryRecord = goalMemory.find((candidate) => candidate.goalId === goalId)
  assert(atomicityRecord && memoryRecord, `${goalId}: missing atomicity or goal-memory review record`)
  assert(atomicityRecord.ruleVersion === 'semantic-atomicity-v1', `${goalId}: atomicity rule version drifted`)
  assert(atomicityRecord.status === 'atomic' && atomicityRecord.semanticAtomic === true, `${goalId}: atomicity decision drifted`)
  assert(exactArray(atomicityRecord.suggestedSplit, []), `${goalId}: unexpected atomicity split`)
  const oldAtomicityFingerprint = goalReviewFingerprint(oldGoal, atomicityRecord.ruleVersion)
  const newAtomicityFingerprint = goalReviewFingerprint(newGoal, atomicityRecord.ruleVersion)
  assert(
    atomicityRecord.fingerprint === oldAtomicityFingerprint || atomicityRecord.fingerprint === newAtomicityFingerprint,
    `${goalId}: atomicity fingerprint drifted`,
  )
  Object.assign(atomicityRecord, {
    fingerprint: newAtomicityFingerprint,
    reviewedAt,
    reviewer,
    reason: atomicityReasons[goalId],
  })

  assert(memoryRecord.ruleVersion === 'memory-card-review-v1', `${goalId}: goal-memory rule version drifted`)
  const oldMemoryFingerprint = goalReviewFingerprint(oldGoal, memoryRecord.ruleVersion)
  const newMemoryFingerprint = goalReviewFingerprint(newGoal, memoryRecord.ruleVersion)
  assert(
    memoryRecord.fingerprint === oldMemoryFingerprint || memoryRecord.fingerprint === newMemoryFingerprint,
    `${goalId}: goal-memory fingerprint drifted`,
  )
  if (goalId === '5f289cdc-fda1-4058-b44f-041ba1398e79') {
    assert(memoryRecord.status === 'no_memory_needed' && memoryRecord.memoryUseful === false, `${goalId}: no-memory decision drifted`)
    assert(memoryRecord.memoryGoalIds === undefined && memoryRecord.deckIds === undefined, `${goalId}: unexpected memory references`)
  } else {
    assert(memoryRecord.status === 'memory_required' && memoryRecord.memoryUseful === true, `${goalId}: memory-required decision drifted`)
    assert(exactArray(memoryRecord.memoryGoalIds, [mechanicsMemoryGoalId]), `${goalId}: memory-goal reference drifted`)
    assert(exactArray(memoryRecord.deckIds, [mechanicsDeckId]), `${goalId}: memory-deck reference drifted`)
  }
  Object.assign(memoryRecord, {
    fingerprint: newMemoryFingerprint,
    reviewedAt,
    reviewer,
    reason: memoryReasons[goalId],
  })
}

const deckPaths = [
  paths.canonicalDeckDe,
  paths.canonicalDeckEn,
  paths.publicDeckDe,
  paths.publicDeckEn,
  paths.backendDeckDe,
  paths.backendDeckEn,
] as const
const plannedDecks = new Map<string, JsonRecord>()
for (const path of deckPaths) {
  const deck = readJson(path)
  assert(deck.deckId === mechanicsDeckId, `${path}: unexpected deck ID`)
  const locale = path.endsWith('.de.json') ? 'de' : 'en'
  for (const [cardId, revision] of Object.entries(cardRevisions)) {
    const card = (deck.cards as JsonRecord[]).find((candidate) => candidate.id === cardId)
    assert(card, `${path}: missing card ${cardId}`)
    const expectedCategory = locale === 'de' ? 'E-Phase Mechanik' : 'E-Phase Mechanics'
    const expectedTags = locale === 'de'
      ? ['GK', 'LK', ...cardOrigins[cardId].map((goalId) => `goal:${goalId}`)]
      : ['GK', 'LK', 'coverage:auto', ...cardOrigins[cardId].map((goalId) => `goal:${goalId}`)]
    assert(card.category === expectedCategory, `${path}: ${cardId} category drifted`)
    assert(exactArray(card.tags, expectedTags), `${path}: ${cardId} tags drifted`)
    card.front = revision[locale].front
    card.back = revision[locale].back
  }
  plannedDecks.set(path, deck)
}
assert(serializeJson(plannedDecks.get(paths.canonicalDeckDe)) === serializeJson(plannedDecks.get(paths.publicDeckDe)), 'DE canonical/public deck copies would differ')
assert(serializeJson(plannedDecks.get(paths.canonicalDeckDe)) === serializeJson(plannedDecks.get(paths.backendDeckDe)), 'DE canonical/backend deck copies would differ')
assert(serializeJson(plannedDecks.get(paths.canonicalDeckEn)) === serializeJson(plannedDecks.get(paths.publicDeckEn)), 'EN canonical/public deck copies would differ')
assert(serializeJson(plannedDecks.get(paths.canonicalDeckEn)) === serializeJson(plannedDecks.get(paths.backendDeckEn)), 'EN canonical/backend deck copies would differ')

const primaryDeDeck = plannedDecks.get(paths.canonicalDeckDe)!
const cardLedgerOriginal = readJsonl(paths.cardLedger)
const cardLedger = cloneJson(cardLedgerOriginal)
for (const cardId of Object.keys(cardRevisions)) {
  const card = (primaryDeDeck.cards as JsonRecord[]).find((candidate) => candidate.id === cardId)
  const record = cardLedger.find((candidate) => candidate.deckId === mechanicsDeckId && candidate.cardId === cardId)
  assert(card && record, `${cardId}: missing primary card or card-ledger record`)
  assert(record.ruleVersion === 'memory-card-review-v1', `${cardId}: card-ledger rule version drifted`)
  assert(record.status === 'kept' && record.necessary === true, `${cardId}: kept-card decision drifted`)
  assert(exactArray(record.originGoalIds, cardOrigins[cardId]), `${cardId}: card origins drifted`)
  const fingerprint = cardReviewFingerprint(card)
  assert(fingerprint === expectedCardFingerprints[cardId], `${cardId}: final card fingerprint mismatch; expected ${expectedCardFingerprints[cardId]}, got ${fingerprint}`)
  Object.assign(record, {
    fingerprint,
    reviewedAt,
    reviewer,
    reason: 'Behalten: präzise, fachlich begrenzte Mechanik-Merkkarte mit aktueller kanonischer Lernzielherkunft; Herleitung, Deutung und Anwendung bleiben im normalen Lernziel.',
  })
}

const outputBytes = new Map<string, string>([
  [paths.canonical, serializeJson(canonical)],
  [paths.semanticKinds, serializeJson(semanticKinds)],
  [paths.atomicity, serializeJsonl(atomicity)],
  [paths.goalMemory, serializeJsonl(goalMemory)],
  [paths.cardLedger, serializeJsonl(cardLedger)],
  ...deckPaths.map((path) => [path, serializeJson(plannedDecks.get(path))] as [string, string]),
])
assert(outputBytes.size === 11, `Expected exactly eleven output files, got ${outputBytes.size}`)
assert(exactArray([...outputBytes.keys()], Object.keys(expectedBeforeHashes)), 'Output boundary drifted')

const plan: PlannedFile[] = []
for (const [path, bytes] of outputBytes) {
  const currentBytes = readFileSync(absolute(path))
  const currentSha256 = sha256(currentBytes)
  const beforeSha256 = expectedBeforeHashes[path]
  const afterSha256 = sha256(bytes)
  assert(
    currentSha256 === beforeSha256 || currentSha256 === afterSha256,
    `${path}: output is neither the exact bounded before-state nor the exact planned after-state`,
  )
  plan.push({
    path,
    bytes,
    beforeSha256,
    afterSha256,
    state: currentSha256 === afterSha256 ? 'after' : 'before',
  })
}

const boundedPlan = {
  schemaVersion: 1,
  contract: 'physics-b025-mechanics-text-cards-plan-v1',
  adjudicationSha256: expectedAdjudicationSha256,
  inputBindings: Object.entries(expectedInputHashes)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([path, sha256Value]) => ({ path, sha256: sha256Value })),
  outputBindings: plan.map(({ path, beforeSha256, afterSha256 }) => ({ path, beforeSha256, afterSha256 })),
  canonicalTextMutationGoalIds,
  acceptedRevisionGoalIds,
  strictProgressGoalIds: [],
  noProgressCorrectionGoalId,
  memoryCardRevisionIds: Object.keys(cardRevisions),
  externalIntegrationPoints: [
    'retain e4b38061 as curricularAtomic; add bf8517 sibling under 65ddd780; copy old image as cluster overview',
    `f524f05c GK prerequisiteOnly/LK target projection materialized and checked with plan ${f524ProjectionPlanSha256}`,
    'a94cfe1c replacement visualization candidate sha256:57b21a77d205429a3b9a6905e19da7085020d160e252ddcfa2738161253a6817',
    'ResourceLink alt text, prompt metadata and visualization QA for retained/replaced images',
  ],
}
const boundedPlanSha256 = sha256(stableJson(boundedPlan))

for (const item of plan) {
  const stagingPath = `${absolute(item.path)}.b025-staging`
  assert(!existsSync(stagingPath), `Stale staging file blocks all modes: ${stagingPath}`)
}

console.log(`MODE ${writeMode ? 'WRITE' : checkMode ? 'CHECK' : 'PLAN'}`)
console.log(`PLAN_SHA256 ${boundedPlanSha256}`)
console.log(`PROGRESS campaignGoalCount=20 resolvedGoalCount=0 strictProgressGoalCount=0 acceptedRevisionImplementationDecisionCount=10`)
console.log(`EXTERNAL e4-split f524-course-projection=materialized-check-pass:${f524ProjectionPlanSha256} a94-visual-replacement retained-visual-metadata`)
for (const item of plan) {
  console.log(`${item.state === 'after' ? 'KEEP' : 'UPDATE'} ${item.path} ${item.beforeSha256} -> ${item.afterSha256}`)
}

if (checkMode) {
  const incomplete = plan.filter((item) => item.state !== 'after')
  assert(incomplete.length === 0, `CHECK failed: ${incomplete.length} bounded output file(s) are not materialized`)
  assert(expectedBoundedPlanSha256 !== 'PENDING', 'CHECK failed: bounded plan hash is still PENDING')
  assert(boundedPlanSha256 === expectedBoundedPlanSha256, `CHECK plan digest mismatch: expected ${expectedBoundedPlanSha256}, got ${boundedPlanSha256}`)
  console.log('CHECK PASS')
} else if (writeMode) {
  assert(expectedBoundedPlanSha256 !== 'PENDING', `Refusing --write: bind expectedBoundedPlanSha256 to ${boundedPlanSha256} after independent plan review`)
  assert(boundedPlanSha256 === expectedBoundedPlanSha256, `Refusing --write: expected plan ${expectedBoundedPlanSha256}, got ${boundedPlanSha256}`)
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], { cwd: repoRoot, stdio: 'inherit' })
  const updates = plan.filter((item) => item.state === 'before')
  const stagedPaths: string[] = []
  try {
    for (const item of updates) {
      const targetPath = absolute(item.path)
      const stagingPath = `${targetPath}.b025-staging`
      mkdirSync(dirname(targetPath), { recursive: true })
      writeFileSync(stagingPath, item.bytes, { encoding: 'utf8', flag: 'wx' })
      assert(sha256(readFileSync(stagingPath)) === item.afterSha256, `${item.path}: staging digest mismatch`)
      stagedPaths.push(stagingPath)
    }
    for (const item of updates) {
      const targetPath = absolute(item.path)
      const stagingPath = `${targetPath}.b025-staging`
      renameSync(stagingPath, targetPath)
      const stagedIndex = stagedPaths.indexOf(stagingPath)
      if (stagedIndex >= 0) stagedPaths.splice(stagedIndex, 1)
      assert(sha256(readFileSync(targetPath)) === item.afterSha256, `${item.path}: post-rename digest mismatch`)
    }
  } finally {
    for (const stagingPath of stagedPaths) rmSync(stagingPath, { force: true })
  }
  console.log(`WRITE PASS ${updates.length} file(s) atomically replaced from preverified staging files`)
} else {
  console.log('PLAN ONLY; no files written. --write is fail-closed while expectedBoundedPlanSha256 is PENDING.')
}
