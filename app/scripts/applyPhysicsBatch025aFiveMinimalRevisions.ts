import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
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
type GoalRevision = {
  titleDe: string
  titleEn: string
  beforeDescriptionDe: string
  beforeDescriptionEn: string
  descriptionDe: string
  descriptionEn: string
  atomicityReason: string
  memoryReason: string
  visualCompatibilityNote: string
  promptCompatibilityNote: string
  historicalPromptFenceSha256: string
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const reviewedAt = '2026-08-29'
const reviewedAtIso = '2026-08-29T00:00:00.000Z'
const reviewer = 'codex-physics-b025a-five-minimal-revisions-2026-08-29'
const physicsLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const mechanicsDeckId = 'de_gymnasium_physics_mechanics_ephase'
const mechanicsMemoryGoalId = '9f2f5ab8-0ae4-5792-b831-82a05af5895c'

// Bound only after independent review of two byte-identical no-write plans.
const expectedPlanSha256 = '2a6512cfcaf147093d4140d4c9b7852f5e0decf213a099aeb17b002d32061239'

const batchRoot =
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-29/'
  + 'batch-025a-e-mechanics-energy-structural-follow-up-17-v1'
const roundPrefix =
  'physik-rollout-v1-batch-025a-e-mechanics-energy-structural-follow-up-17-v1-20260829'

const paths = {
  config: `${batchRoot}.config.json`,
  batchManifest: `${batchRoot}/batch-manifest.json`,
  bundleManifest: `${batchRoot}/bundle/manifest.json`,
  dualSummary: `${batchRoot}/dual-summary.json`,
  roundARun: `${batchRoot}/round-a/results/${roundPrefix}-first-pass-a.batch-001.run.json`,
  roundARecords: `${batchRoot}/round-a/results/${roundPrefix}-first-pass-a.batch-001.records.jsonl`,
  roundBRun: `${batchRoot}/round-b/results/${roundPrefix}-first-pass-b.batch-001.run.json`,
  roundBRecords: `${batchRoot}/round-b/results/${roundPrefix}-first-pass-b.batch-001.records.jsonl`,
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
  visualQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
} as const

const batchGoalIds = [
  'ce431132-dfc4-42c2-aff6-bd72035190f8',
  '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
  'bf8517a9-142b-5789-826a-767f3b277998',
  'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  '09029573-864f-40ca-bf8a-cee7bf6dcb73',
  '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
  'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
  '5f289cdc-fda1-4058-b44f-041ba1398e79',
  'ad984bb6-e225-432a-952d-d83cda40b7f8',
  'c1c71daa-042b-4f4c-8c31-0ac366f5149e',
  '6affc2ea-ecd2-4fcd-8877-3ffa15b0425b',
  '91c49019-ea51-4ce5-a919-c91c45b25e83',
  '253a71d2-e751-4c63-acbe-238b71463cd8',
  '839ecc8f-3a60-418b-bc92-64bfeef33824',
  'f524f05c-4456-4fc3-a1f7-f40741fc1f16',
  'e790de73-f8e5-4027-bc05-9f12a0e8c9cb',
] as const

const revisionGoalIds = [
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
  'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
  '253a71d2-e751-4c63-acbe-238b71463cd8',
  'f524f05c-4456-4fc3-a1f7-f40741fc1f16',
  'e790de73-f8e5-4027-bc05-9f12a0e8c9cb',
] as const

const revisions: Record<string, GoalRevision> = {
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759': {
    titleDe: 'Newtons 1. Axiom anwenden',
    titleEn: "Apply Newton's First Law",
    beforeDescriptionDe:
      'Die lernende Person kann das Trägheitsprinzip auf Alltagssituationen in Inertialsystemen anwenden und den Unterschied zwischen einer verschwindenden resultierenden Kraft und den Bewegungszuständen Ruhe beziehungsweise gleichförmig-geradlinige Bewegung erklären.',
    beforeDescriptionEn:
      'The learner can apply the principle of inertia to everyday situations in inertial frames and explain the distinction between zero net force and the states of rest and uniform rectilinear motion.',
    descriptionDe:
      'Die lernende Person kann das Trägheitsprinzip auf Alltagssituationen in Inertialsystemen anwenden und erklären, dass eine verschwindende resultierende äußere Kraft sowohl mit Ruhe als auch mit gleichförmig-geradliniger Bewegung vereinbar ist.',
    descriptionEn:
      'The learner can apply the principle of inertia to everyday situations in inertial frames and explain that zero net external force is compatible with both rest and uniform rectilinear motion.',
    atomicityReason:
      'Die Kraftbedingung und die beiden möglichen Bewegungsfälle bilden eine einzige Anwendungskompetenz zum Trägheitsprinzip.',
    memoryReason:
      'Karte 014 sichert die kompakte Beziehung zwischen verschwindender resultierender äußerer Kraft und konstantem Geschwindigkeitsvektor; die Situationsanalyse bleibt Verständnis und Aufgabenpraxis.',
    visualCompatibilityNote:
      'Das unveränderte Nano-Banana-Pro-Bild zeigt den direkten Zusammenhang zwischen verschwindender resultierender Kraft, Ruhe und gleichförmiger Bewegung fachlich korrekt.',
    promptCompatibilityNote:
      'Kompatibilitätsprüfung 2026-08-29: Das unveränderte Nano-Banana-Pro-Asset bleibt mit der präzisierten Beziehung zwischen Kraftbilanz, Ruhe und gleichförmiger Bewegung vereinbar. Assetbytes und Digest sowie der historische eingezäunte Generator-Prompt bleiben unverändert.',
    historicalPromptFenceSha256:
      '51a3ef70cc118bad7c35e874423f924ee341bc55587c01d2ce34ef07d5d85bb9',
  },
  'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20': {
    titleDe: 'Newtons 2. Axiom (Grundgleichung der Mechanik)',
    titleEn: "Newton's Second Law (Fundamental Equation of Mechanics)",
    beforeDescriptionDe: String.raw`Die lernende Person kann den vektoriellen Impuls $\vec p=m\vec v$ einführen, Newtons zweites Axiom im Inertialsystem für ein materiell abgeschlossenes System als $\sum \vec F_\mathrm{ext}=\mathrm d\vec p/\mathrm dt$ formulieren und deuten und für konstante Masse auf $\sum \vec F_\mathrm{ext}=m\vec a$ zurückführen.`,
    beforeDescriptionEn: String.raw`The learner can introduce vector momentum $\vec p=m\vec v$, formulate and interpret Newton's second law in an inertial frame for a materially closed system as $\sum \vec F_\mathrm{ext}=\mathrm d\vec p/\mathrm dt$, and reduce it to $\sum \vec F_\mathrm{ext}=m\vec a$ for constant mass.`,
    descriptionDe: String.raw`Die lernende Person kann den vektoriellen Impuls $\vec p=m\vec v$ einführen, Newtons zweites Axiom in einem Inertialsystem für ein materiell abgeschlossenes System als Zusammenhang zwischen der resultierenden äußeren Kraft und der zeitlichen Änderung des Impulses formulieren und deuten sowie für konstante Masse auf $\sum \vec F_\mathrm{ext}=m\vec a$ zurückführen.`,
    descriptionEn: String.raw`The learner can introduce vector momentum $\vec p=m\vec v$, formulate and interpret Newton's second law in an inertial frame for a materially closed system as the relationship between the net external force and the change of momentum over time, and reduce it to $\sum \vec F_\mathrm{ext}=m\vec a$ for constant mass.`,
    atomicityReason:
      'Vektorieller Impuls, zeitlicher Kraft-Impuls-Zusammenhang und Konstantmassen-Spezialisierung sind Teile einer einzigen Newton-II-Kompetenz.',
    memoryReason:
      'Die Karten 015 und 020 bewahren die formal korrekte E-Phasen-Fassung für konstante Masse; Deutung, Systemwahl und Anwendung bleiben im normalen Lernziel.',
    visualCompatibilityNote:
      'Das unveränderte Nano-Banana-Pro-Bild ist mit p⃗=m·v⃗, ΣF⃗_ext=dp⃗/dt und ΣF⃗_ext=m·a⃗ für konstante Masse fachlich korrekt; seine formale Darstellung ist anspruchsvoller, widerspricht der präzisierten Beschreibung aber nicht.',
    promptCompatibilityNote:
      'Kompatibilitätsprüfung 2026-08-29: Das unveränderte Nano-Banana-Pro-Asset zeigt die formal korrekte Impulsform und den Konstantmassen-Spezialfall. Der höhere Formalisierungsgrad ist kein fachlicher Fehler. Assetbytes und Digest sowie der historische eingezäunte Generator-Prompt bleiben unverändert.',
    historicalPromptFenceSha256:
      '819d924862d65e913bac8714ea748d84782afb019e8f01196c16c90b7bddcdef',
  },
  '253a71d2-e751-4c63-acbe-238b71463cd8': {
    titleDe: 'Reibungsenergie',
    titleEn: 'Frictional Energy',
    beforeDescriptionDe:
      'Die lernende Person kann Reibungsenergie als Umwandlung mechanischer Energie in innere Energie deuten und einfache Energieumwandlungen qualitativ beschreiben.',
    beforeDescriptionEn:
      'The learner can interpret frictional energy as the conversion of mechanical energy into internal energy and qualitatively describe simple energy conversions.',
    descriptionDe:
      'Die lernende Person kann den Begriff Reibungsenergie als Bilanzgröße für den Anteil mechanischer Energie deuten, der bei Reibung in innere Energie der beteiligten Körper umgewandelt wird, und diese Energieumwandlung für ein festgelegtes System qualitativ bilanzieren.',
    descriptionEn:
      'The learner can interpret the term frictional energy as a quantity used in energy accounting for the portion of mechanical energy converted by friction into the internal energy of the interacting bodies, and qualitatively account for this energy transformation for a defined system.',
    atomicityReason:
      'Begriffsdeutung und Bilanz für ein festgelegtes System prüfen dieselbe Energieumwandlungskompetenz bei Reibung.',
    memoryReason:
      'Die präzisierte Karte 025 sichert ausschließlich die Bedeutung der Bilanzgröße und die Energieerhaltung; Systemwahl und qualitative Bilanzierung bleiben Verständnisleistungen.',
    visualCompatibilityNote:
      'Das unveränderte Nano-Banana-Pro-Bild bilanziert E_mech von 100 J auf 70 J, E_innen von 0 J auf 30 J und E_ges=100 J korrekt; E_reib=30 J bezeichnet den umgewandelten Anteil und keine dritte gespeicherte Energieform.',
    promptCompatibilityNote:
      'Kompatibilitätsprüfung 2026-08-29: Das unveränderte Nano-Banana-Pro-Asset zeigt ausschließlich mechanische und innere Energie als Speichergrößen und E_reib=30 J als umgewandelten Bilanzanteil. Assetbytes und Digest sowie der historische eingezäunte Generator-Prompt bleiben unverändert.',
    historicalPromptFenceSha256:
      '6b7f3d3be2adfcf4add91f73a0aad7a214f7acb3f9795690685a95ebcc0625b3',
  },
  'f524f05c-4456-4fc3-a1f7-f40741fc1f16': {
    titleDe: 'Impulserhaltung aus Newtonschen Axiomen (LK)',
    titleEn: "Momentum Conservation from Newton's Laws (Advanced Course)",
    beforeDescriptionDe:
      'Die lernende Person kann die Impulserhaltung aus Newtonschen Axiomen herleiten und den Geltungsbereich diskutieren.',
    beforeDescriptionEn:
      "The learner can derive momentum conservation from Newton's laws and discuss its domain of validity.",
    descriptionDe:
      'Die lernende Person kann in einem Inertialsystem für ein materiell abgeschlossenes System aus Newtons zweitem und drittem Axiom herleiten, dass der Gesamtimpuls bei verschwindendem resultierendem äußerem Kraftstoß erhalten bleibt, und die Voraussetzungen dieser Herleitung diskutieren.',
    descriptionEn:
      "In an inertial frame, the learner can derive from Newton's second and third laws that total momentum is conserved in a materially closed system when the net external impulse is zero and discuss the assumptions of the derivation.",
    atomicityReason:
      'Herleitung aus Newton II und III sowie Diskussion ihrer Voraussetzungen sind Bestandteile eines einzigen Beweises der Impulserhaltung.',
    memoryReason:
      'Karte 029 sichert die kompakte Impulsbilanz mit äußeren Kräften; Herleitung, innere Kraftaufhebung und Geltungsbedingungen bleiben Verständnisleistungen.',
    visualCompatibilityNote:
      'Das unveränderte Nano-Banana-Pro-Bild verknüpft Newton II und III, die Aufhebung innerer Kräfte sowie abgeschlossenes System und Inertialsystem fachlich korrekt mit der Impulserhaltung.',
    promptCompatibilityNote:
      'Kompatibilitätsprüfung 2026-08-29: Das unveränderte Nano-Banana-Pro-Asset zeigt die Newton-II/III-Herleitung und die gebundenen Voraussetzungen weiterhin korrekt. Assetbytes und Digest sowie der historische eingezäunte Generator-Prompt bleiben unverändert.',
    historicalPromptFenceSha256:
      '27ef02472a86abbfd930771b75ac696805838ce6c721fbb1e61d0d0506cb766c',
  },
  'e790de73-f8e5-4027-bc05-9f12a0e8c9cb': {
    titleDe: 'Kraftstoß',
    titleEn: 'Impulse (Force-Time)',
    beforeDescriptionDe:
      'Die lernende Person kann den Kraftstoß als zeitliches Integral der resultierenden äußeren Kraft beziehungsweise in einer gewählten Richtung als vorzeichenbehaftete Fläche unter dem Kraft-Zeit-Diagramm beschreiben, ihn bei konstanter Kraft als Produkt aus Kraft und Einwirkdauer bestimmen und mit der Impulsänderung verknüpfen.',
    beforeDescriptionEn:
      'The learner can describe impulse as the time integral of the net external force or, along a chosen direction, as the signed area under the force-time graph, determine it for a constant force as the product of force and interaction time, and relate it to the change in momentum.',
    descriptionDe:
      'Die lernende Person kann den Kraftstoß als über die Einwirkdauer aufsummierte Wirkung der resultierenden äußeren Kraft beschreiben, ihn in einer gewählten Richtung als vorzeichenbehaftete Fläche unter einem Kraft-Zeit-Diagramm und bei konstanter Kraft als Produkt aus Kraft und Einwirkdauer bestimmen sowie mit der Impulsänderung verknüpfen.',
    descriptionEn:
      'The learner can describe impulse as the effect of the net external force accumulated over its duration, determine it along a chosen direction as the signed area under a force-time graph and, for constant force, as the product of force and interaction time, and relate it to the change in momentum.',
    atomicityReason:
      'Aufsummierte Kraftwirkung, vorzeichenbehaftete Fläche, Konstantkraftprodukt und Impulsänderung sind äquivalente Darstellungen einer einzigen Kraftstoß-Kompetenz.',
    memoryReason:
      'Karte 030 sichert die formale E-Phasen-Beziehung mit bestimmtem Integral; Flächendeutung, Vorzeichen und Anwendung bleiben Teil des normalen Lernziels.',
    visualCompatibilityNote:
      'Das unveränderte Nano-Banana-Pro-Bild zeigt die vorzeichenbehaftete Fläche, J=FΔt und Δp als fachlich korrekte, zugängliche Realisierung über ein endliches Zeitintervall.',
    promptCompatibilityNote:
      'Kompatibilitätsprüfung 2026-08-29: Das unveränderte Nano-Banana-Pro-Asset bleibt mit Fläche, konstantem Kraft-Zeit-Produkt und Impulsänderung vollständig kompatibel. Assetbytes und Digest sowie der historische eingezäunte Generator-Prompt bleiben unverändert.',
    historicalPromptFenceSha256:
      '3650da4ccd6561c0ffb79eddff3b04b34715af72a91fb312c183ecff0b102523',
  },
}

const promptPath = (goalId: string): string =>
  `curricula/DE/Gymnasium/visualizations/physik/${goalId}/prompt.de.md`

const deckPaths = [
  paths.canonicalDeckDe,
  paths.canonicalDeckEn,
  paths.publicDeckDe,
  paths.publicDeckEn,
  paths.backendDeckDe,
  paths.backendDeckEn,
] as const

const outputPaths = [
  paths.canonical,
  paths.semanticKinds,
  paths.atomicity,
  paths.goalMemory,
  paths.cardLedger,
  ...deckPaths,
  paths.visualQa,
  ...revisionGoalIds.map(promptPath),
] as const

const expectedInputHashes: Record<string, string> = {
  [paths.config]: '7c3f610555750be16dea5f242b001c6b4bdc2f71a0dea16ccb249401f6a522e1',
  [paths.batchManifest]: '739e068a7ac33103e4b0d09fc5d1b6765e166e816286c529f7d2addd424d0bb6',
  [paths.bundleManifest]: 'ab9aa27c9fdb38292074e65ceae55a77e5e997dd08212deaead2e6fb56ced77d',
  [paths.dualSummary]: '7c47d894654f9f24dd67212af5361ab59080f351b0978ebf173c480d417dd51c',
  [paths.roundARun]: 'dbf7bda526505ac444726c10c89a8b7741d7574de078a1382780883ae53bc1b2',
  [paths.roundARecords]: 'f4050489d29702d3e9b80a28ae3d9079da91e80efcadbada709745961af5689e',
  [paths.roundBRun]: 'bef87e512ce01e302d9e7d1255e9fa63a99611f085adf8f9bbe43d1fc3e715f5',
  [paths.roundBRecords]: '3b19b758f08f95a81c1e7f3ed9120a2999fc009f49073159a3f148086b0ebcfe',
  [paths.goalBookModel]: 'd8993c1270797f4e8406b2ef359eb0979768cc32078e5b988a32f50409207e60',
}

const expectedBeforeHashes: Record<string, string> = {
  [paths.canonical]: '98035bdfe2454e6a7d1bedd81ab4b73d2f34f4524e62c54a53c58797a332be58',
  [paths.semanticKinds]: '3187dafc990e5668b4ad7156fc159c1605221dd26716a0a3bde43f19a3459b14',
  [paths.atomicity]: '6d333d789f826410713944ada7f3802f775051d337cf59ea248431587854c850',
  [paths.goalMemory]: 'f4966e34861e4822e76f15b2f2e5b477cb5f8142e97b7cfbe62250efaf795112',
  [paths.cardLedger]: 'ac1e0c0878c94397b458adb4b812f02ff02d2d48402b9b23ea7a48b8b3503b1c',
  [paths.canonicalDeckDe]: '8ca9a6c241b40e58adb5ea544329c7846c0aac4faac2f66b55a387345ab9a7c8',
  [paths.canonicalDeckEn]: '66c7e596d9998203fcf017004621cb6430a8c1e4a71b8d3e210d943cd71cc99b',
  [paths.publicDeckDe]: '8ca9a6c241b40e58adb5ea544329c7846c0aac4faac2f66b55a387345ab9a7c8',
  [paths.publicDeckEn]: '66c7e596d9998203fcf017004621cb6430a8c1e4a71b8d3e210d943cd71cc99b',
  [paths.backendDeckDe]: '8ca9a6c241b40e58adb5ea544329c7846c0aac4faac2f66b55a387345ab9a7c8',
  [paths.backendDeckEn]: '66c7e596d9998203fcf017004621cb6430a8c1e4a71b8d3e210d943cd71cc99b',
  [paths.visualQa]: '5d9c290d8c70dda3e265b0c8c1dfe795f581ca1552e0d613aef11375f1f79afe',
  [promptPath(revisionGoalIds[0])]: '8b6720520874f9a6a7babf41e6bdbb66c52842089bfc565879e773ab8b922067',
  [promptPath(revisionGoalIds[1])]: 'a3e6bc51831caf7c6e54ea9b3a5a7c7140eb154dca9a576fa492ab2281dab1fc',
  [promptPath(revisionGoalIds[2])]: '42c487700b5e75fe5d93c6d771b20a7ff17443954f59630055c4beffcdcff627',
  [promptPath(revisionGoalIds[3])]: '9be0cdc2ab989006897ebcd70d23678aaaa2eb2a5a913722b3b629121aa331ed',
  [promptPath(revisionGoalIds[4])]: 'ee9617dbf10eb812ac29bf0dcc6d6ebaa3314539405d1f721dd1a6877091b0e5',
}

// Exact post-change digests, bound after independent inspection of the no-write plan.
const expectedAfterHashes: Record<string, string> = {
  [paths.canonical]: 'a8eb1398a6d11dcdbdb02ccb4bd3526a512ecac8743630d24ae2381b8041a64c',
  [paths.semanticKinds]: 'f880e255246c41aabc0ab346d43a074551cbd197b001905bfb46607d6639780f',
  [paths.atomicity]: 'd65dfe55f31308f33a66a0f0407aedd044622b4a7f7d8fc0aa42979b89b9b938',
  [paths.goalMemory]: '5efcde6212e79ad121231e56ad931fe47b2dbd27a8456a1322b65930b43b7888',
  [paths.cardLedger]: '4980b1f44563ffc92e254f9cc8d99a6f24f2b11ee5ddc00dbfca4dc91ec7a4f3',
  [paths.canonicalDeckDe]: '92105f6f7a40e591a1a520c02ea833e957431a4cd44ec5541f5d34617089323a',
  [paths.canonicalDeckEn]: '01c0fe2ed38fa2b433d62f936315f370879d44cc501c4202910eea9d604ed7e2',
  [paths.publicDeckDe]: '92105f6f7a40e591a1a520c02ea833e957431a4cd44ec5541f5d34617089323a',
  [paths.publicDeckEn]: '01c0fe2ed38fa2b433d62f936315f370879d44cc501c4202910eea9d604ed7e2',
  [paths.backendDeckDe]: '92105f6f7a40e591a1a520c02ea833e957431a4cd44ec5541f5d34617089323a',
  [paths.backendDeckEn]: '01c0fe2ed38fa2b433d62f936315f370879d44cc501c4202910eea9d604ed7e2',
  [paths.visualQa]: '1085087b6da351b60c2f316b7b755d600b26dbdecf56c1e39d7fea916d2a3ea3',
  [promptPath(revisionGoalIds[0])]: 'ecb07a9d709252e7b5ff8edd6f0cb9c468ff083ecf74768205ffaa295e13d2e8',
  [promptPath(revisionGoalIds[1])]: '32ea05cdddc88a40319d5ff938167b4631ee4808c95ec543d6b43808a90faf6d',
  [promptPath(revisionGoalIds[2])]: 'db8e563b74ba4179a9848ee3a660d299dd8cbbfbd175f9b55ed9e6c1449f67fe',
  [promptPath(revisionGoalIds[3])]: '0c63f35dfa5739b488d157ecf2fea60f92e235877565052db0cdccee239c2d0a',
  [promptPath(revisionGoalIds[4])]: '8dbe17d0005925bc65b6049661676fb9b4f625cd46a6ee26ddfeafe38f7dd895',
}

const assetHashes: Record<string, string> = {
  [revisionGoalIds[0]]: '27bfbb5b582578b28eebd768d810211f5ee8f295ea201e8c4535f28e736f4ee9',
  [revisionGoalIds[1]]: '57b21a77d205429a3b9a6905e19da7085020d160e252ddcfa2738161253a6817',
  [revisionGoalIds[2]]: 'f3e2fe93b1f1d22d100237a2d6839775f9a596b144d50bdcf3f30908f0e00b4d',
  [revisionGoalIds[3]]: '13b13ebf327ce3545960b7f979bc46c5608b66c0d31958740008328e78ef35c9',
  [revisionGoalIds[4]]: '0446ed6ce04feb2f6712863a54a3f290d94d79397865be28e5094db55abc0b03',
}

const assetBindings = revisionGoalIds.flatMap((goalId) => {
  const relativeAssetPath = `assets/goal-visualizations/physik/${goalId}/${goalId}.jpg`
  return [
    {
      goalId,
      path: `curricula/DE/Gymnasium/visualizations/physik/${goalId}/${goalId}.jpg`,
      sha256: assetHashes[goalId],
    },
    { goalId, path: `app/public/${relativeAssetPath}`, sha256: assetHashes[goalId] },
    {
      goalId,
      path: `backend/src/main/resources/static/${relativeAssetPath}`,
      sha256: assetHashes[goalId],
    },
  ]
})

const selectedDisagreements: Record<string, {
  firstDecision: string
  secondDecision: string
  disagreementFields: string[]
}> = {
  [revisionGoalIds[0]]: {
    firstDecision: 'keep',
    secondDecision: 'revise',
    disagreementFields: [
      'decision',
      'proposedDescriptionDe',
      'proposedDescriptionEn',
      'understandingEvidence',
      'rationale',
    ],
  },
  [revisionGoalIds[1]]: {
    firstDecision: 'block',
    secondDecision: 'revise',
    disagreementFields: [
      'decision',
      'proposedDescriptionDe',
      'proposedDescriptionEn',
      'understandingEvidence',
      'rationale',
    ],
  },
  [revisionGoalIds[2]]: {
    firstDecision: 'revise',
    secondDecision: 'revise',
    disagreementFields: [
      'proposedDescriptionDe',
      'proposedDescriptionEn',
      'understandingEvidence',
      'rationale',
    ],
  },
  [revisionGoalIds[3]]: {
    firstDecision: 'revise',
    secondDecision: 'revise',
    disagreementFields: [
      'proposedDescriptionDe',
      'proposedDescriptionEn',
      'understandingEvidence',
      'rationale',
    ],
  },
  [revisionGoalIds[4]]: {
    firstDecision: 'block',
    secondDecision: 'revise',
    disagreementFields: [
      'decision',
      'proposedDescriptionDe',
      'proposedDescriptionEn',
      'understandingEvidence',
      'rationale',
    ],
  },
}

const cardIds = [
  'physics_e_cov_014',
  'physics_e_cov_015',
  'physics_e_cov_020',
  'physics_e_cov_025',
  'physics_e_cov_029',
  'physics_e_cov_030',
] as const
const cardOrigins: Record<string, string[]> = {
  physics_e_cov_014: [revisionGoalIds[0]],
  physics_e_cov_015: [revisionGoalIds[1]],
  physics_e_cov_020: [
    '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
    revisionGoalIds[1],
    'ad984bb6-e225-432a-952d-d83cda40b7f8',
  ],
  physics_e_cov_025: [revisionGoalIds[2]],
  physics_e_cov_029: [revisionGoalIds[3]],
  physics_e_cov_030: [revisionGoalIds[4]],
}
const cardCourseTags: Record<string, string[]> = {
  physics_e_cov_014: ['GK', 'LK'],
  physics_e_cov_015: ['GK', 'LK'],
  physics_e_cov_020: ['GK', 'LK'],
  physics_e_cov_025: ['GK', 'LK'],
  physics_e_cov_029: ['LK'],
  physics_e_cov_030: ['GK', 'LK'],
}
const cardReasons: Record<string, string> = {
  physics_e_cov_014:
    'Behalten: Karte 014 bildet die direkte Beziehung zwischen verschwindender resultierender äußerer Kraft und konstantem Geschwindigkeitsvektor weiterhin exakt auf das revidierte Ursprungsziel ab.',
  physics_e_cov_015:
    'Behalten: Die formal korrekte E-Phasen-Form von Newton II für konstante Masse bleibt mit dem stufenoffener formulierten Ursprungsziel vereinbar.',
  physics_e_cov_020:
    'Behalten: Die kompakte gemeinsame Axiomenkarte bleibt mit allen drei unveränderten Ursprungskanten kompatibel; ihre Newton-II-Form ist ausdrücklich auf konstante Masse begrenzt.',
  physics_e_cov_025:
    'Behalten und präzisiert: Karte 025 definiert Reibungsenergie nun als umgewandelten Bilanzanteil, nennt innere Energie der beteiligten Körper und vermeidet die missverständliche Gleichsetzung mit Wärme.',
  physics_e_cov_029:
    'Behalten: Die kompakte Bilanz mit resultierender äußerer Kraft unterstützt weiterhin die gebundene Newton-II/III-Herleitung, ohne sie durch bloßen Abruf zu ersetzen.',
  physics_e_cov_030:
    'Behalten: Die formale E-Phasen-Karte mit bestimmtem Kraft-Zeit-Integral ist mit der zugänglicher formulierten aufsummierten Kraftwirkung des Ursprungsziels kompatibel.',
}
const expectedCardFingerprints: Record<string, string> = {
  physics_e_cov_014: 'sha256:5a91eed9b1962e1e1bcddd50e8b01a81806ebf11eb2181d8c1c1ecfe31429332',
  physics_e_cov_015: 'sha256:bc575aa2aed82d39678311d126c6620ff0afeb16f68aa9f664293230c22ae6e7',
  physics_e_cov_020: 'sha256:3bbd42a29e8c367c3916ee1302f1fd3de02a9b057dcbcf88786ee715c408877d',
  physics_e_cov_025: 'sha256:0887ebda129068fbef74ea3443a4c0aa5999912a877b7358fc089222812bb8f2',
  physics_e_cov_029: 'sha256:67d5af9e9610662ce62554419fd7f52a1173d639aae1978cb7aeea23081bcf89',
  physics_e_cov_030: 'sha256:dcb301bfdf83cb27d9a2347e625b543fdb4ebbdfdd0e1489b2d2f6e8ac89edde',
}
const oldCard025Fingerprint =
  'sha256:d7ccfc63e78528347eea4c6c6b5a7fb94e3792411f93cd7f251ce05d81108887'
const card025Text = {
  de: {
    beforeFront: 'Reibungsenergie: Merksatz?',
    beforeBack: 'Reibung wandelt mechanische Energie in innere Energie (Wärme) um',
    front: 'Was bedeutet „Reibungsenergie“ in einer Energiebilanz?',
    back:
      'Sie bezeichnet den Anteil mechanischer Energie, der bei Reibung in innere Energie der beteiligten Körper umgewandelt wird; die Gesamtenergie bleibt erhalten.',
  },
  en: {
    beforeFront: 'Frictional energy: mnemonic?',
    beforeBack: 'Friction converts mechanical energy into internal energy (heat)',
    front: 'What does “frictional energy” mean in an energy balance?',
    back:
      'It denotes the portion of mechanical energy converted by friction into the internal energy of the interacting bodies; total energy is conserved.',
  },
}

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256 = (value: string | Uint8Array): string =>
  createHash('sha256').update(value).digest('hex')
const sha256Digest = (value: string | Uint8Array): string => `sha256:${sha256(value)}`
const readJson = (path: string): JsonRecord =>
  JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] =>
  readFileSync(absolute(path), 'utf8')
    .split(/\r?\n/u)
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string =>
  `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const normalizeText = (value: unknown): string =>
  String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
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
const exactArray = (left: unknown, right: unknown): boolean =>
  JSON.stringify(left) === JSON.stringify(right)
const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message)
}

const goalReviewFingerprint = (goal: JsonRecord, ruleVersion: string): string =>
  sha256Digest(stableJson({
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

const cardReviewFingerprint = (card: JsonRecord): string =>
  sha256Digest(stableJson({
    ruleVersion: 'memory-card-review-v1',
    deckId: mechanicsDeckId,
    cardId: card.id,
    front: normalizeText(card.front),
    back: normalizeText(card.back),
    category: normalizeText(card.category),
    tags: (card.tags as unknown[]).map(normalizeText),
  }))

const assertBoundInputs = (): void => {
  for (const [path, expectedHash] of Object.entries(expectedInputHashes)) {
    assert(existsSync(absolute(path)), `Missing bound input: ${path}`)
    const actualHash = sha256(readFileSync(absolute(path)))
    assert(
      actualHash === expectedHash,
      `Bound input drifted: ${path}; expected ${expectedHash}, got ${actualHash}`,
    )
  }
  for (const binding of assetBindings) {
    assert(existsSync(absolute(binding.path)), `Missing bound NBP asset: ${binding.path}`)
    const actualHash = sha256(readFileSync(absolute(binding.path)))
    assert(
      actualHash === binding.sha256,
      `Bound NBP asset drifted: ${binding.path}; expected ${binding.sha256}, got ${actualHash}`,
    )
  }
}

const stagingPathFor = (path: string): string =>
  `${absolute(path)}.b025a-five-minimal-revisions.staging`
const lockPath = absolute('app/scripts/.applyPhysicsBatch025aFiveMinimalRevisions.lock')
assert(!existsSync(lockPath), `Existing or stale exclusive lock blocks all modes: ${lockPath}`)
for (const path of outputPaths) {
  const stagingPath = stagingPathFor(path)
  assert(!existsSync(stagingPath), `Stale staging file blocks all modes: ${stagingPath}`)
}

assertBoundInputs()

const config = readJson(paths.config)
const batchManifest = readJson(paths.batchManifest)
const bundleManifest = readJson(paths.bundleManifest)
const dualSummary = readJson(paths.dualSummary)
const roundARun = readJson(paths.roundARun)
const roundBRun = readJson(paths.roundBRun)
const roundARecords = readJsonl(paths.roundARecords)
const roundBRecords = readJsonl(paths.roundBRecords)

const expectedBatchId = `${roundPrefix}`
assert(config.schemaVersion === 1 && config.batchId === expectedBatchId, 'B025a config identity drifted')
assert(config.subject === 'physik' && exactArray(config.goalIds, batchGoalIds), 'B025a config scope drifted')
assert(
  batchManifest.schemaVersion === 1
    && batchManifest.batchId === expectedBatchId
    && exactArray(batchManifest.goalIds, batchGoalIds),
  'B025a batch manifest drifted',
)
assert(
  bundleManifest.schemaVersion === 1
    && bundleManifest.selectedGoalCount === batchGoalIds.length
    && exactArray(
      (bundleManifest.goals as JsonRecord[]).map((goal) => goal.goalId),
      batchGoalIds,
    ),
  'B025a bundle manifest scope drifted',
)
assert(
  dualSummary.schemaVersion === 1
    && dualSummary.goalCount === batchGoalIds.length
    && dualSummary.counts?.disagreement === batchGoalIds.length
    && dualSummary.counts?.requiresSynthesis === batchGoalIds.length,
  'B025a dual-summary counts drifted',
)
assert(
  Array.isArray(dualSummary.goals) && dualSummary.goals.length === batchGoalIds.length,
  'B025a dual-summary goal set drifted',
)

for (const [run, recordsHash, lane] of [
  [roundARun, expectedInputHashes[paths.roundARecords], 'a'],
  [roundBRun, expectedInputHashes[paths.roundBRecords], 'b'],
] as const) {
  assert(run.status === 'completed', `B025a round ${lane.toUpperCase()} is not completed`)
  assert(exactArray(run.goalIds, batchGoalIds), `B025a round ${lane.toUpperCase()} scope drifted`)
  assert(
    run.outputDigest === `sha256:${recordsHash}`,
    `B025a round ${lane.toUpperCase()} output binding drifted`,
  )
}
assert(
  roundARecords.length === batchGoalIds.length && roundBRecords.length === batchGoalIds.length,
  'Expected exactly seventeen B025a records in each lane',
)

const selectedGoalIdSet = new Set<string>(revisionGoalIds)
for (const [index, goalId] of batchGoalIds.entries()) {
  const firstRecord = roundARecords[index]
  const secondRecord = roundBRecords[index]
  const dual = dualSummary.goals[index] as JsonRecord
  assert(firstRecord.goalId === goalId && secondRecord.goalId === goalId, `${goalId}: review record order drifted`)
  assert(dual.goalId === goalId, `${goalId}: dual-summary order drifted`)
  assert(
    dual.firstRecordId === firstRecord.recordId
      && dual.secondRecordId === secondRecord.recordId
      && dual.firstDecision === firstRecord.decision
      && dual.secondDecision === secondRecord.decision,
    `${goalId}: review provenance drifted`,
  )
  assert(
    dual.agreement === 'disagreement'
      && dual.requiresSynthesis === true
      && dual.automaticAcceptance === false,
    `${goalId}: independent disagreement contract drifted`,
  )

  if (selectedGoalIdSet.has(goalId)) {
    const expected = selectedDisagreements[goalId]
    const revision = revisions[goalId]
    assert(
      dual.firstDecision === expected.firstDecision
        && dual.secondDecision === expected.secondDecision
        && exactArray(dual.disagreementFields, expected.disagreementFields),
      `${goalId}: selected disagreement decision drifted`,
    )
    for (const record of [firstRecord, secondRecord]) {
      assert(
        record.currentTitleDe === revision.titleDe
          && record.currentTitleEn === revision.titleEn
          && record.currentDescriptionDe === revision.beforeDescriptionDe
          && record.currentDescriptionEn === revision.beforeDescriptionEn,
        `${goalId}: bound review record no longer contains the adjudicated before text`,
      )
    }
  } else {
    assert(
      dual.firstDecision === 'keep'
        && dual.secondDecision === 'keep'
        && exactArray(dual.disagreementFields, ['understandingEvidence', 'rationale']),
      `${goalId}: one of the twelve stable carryover decisions drifted`,
    )
  }
}

const canonicalOriginal = readJson(paths.canonical)
const canonical = cloneJson(canonicalOriginal)
assert(canonical.landscapeId === physicsLandscapeId, 'Unexpected canonical Physics landscape')
const originalGoalById = new Map<string, JsonRecord>(
  (canonicalOriginal.goals as JsonRecord[]).map((goal) => [goal.id, goal]),
)
const goalById = new Map<string, JsonRecord>(
  (canonical.goals as JsonRecord[]).map((goal) => [goal.id, goal]),
)
const beforeGoalById = new Map<string, JsonRecord>()
const finalGoalById = new Map<string, JsonRecord>()

const memoryGoal = goalById.get(mechanicsMemoryGoalId)
assert(memoryGoal, 'Missing E-phase memory deck goal')
assert(
  memoryGoal.nodeKind === 'memory'
    && memoryGoal.dimensionTags?.phase === 'E'
    && (memoryGoal.tags as string[]).includes(`srs-deck:${mechanicsDeckId}`)
    && (memoryGoal.tags as string[]).includes('memorization'),
  'The unchanged memory node is no longer the E-phase deck node',
)

for (const goalId of revisionGoalIds) {
  const originalGoal = originalGoalById.get(goalId)
  const goal = goalById.get(goalId)
  const revision = revisions[goalId]
  assert(originalGoal && goal, `${goalId}: missing canonical goal`)
  assert(
    goal.title === revision.titleDe && goal.titleEn === revision.titleEn,
    `${goalId}: title drifted; all five titles must remain unchanged`,
  )
  const descriptions = [goal.description, goal.descriptionEn]
  assert(
    exactArray(descriptions, [revision.beforeDescriptionDe, revision.beforeDescriptionEn])
      || exactArray(descriptions, [revision.descriptionDe, revision.descriptionEn]),
    `${goalId}: descriptions match neither the bounded before nor final text`,
  )

  const resources = (goal.resourceLinks as JsonRecord[] | undefined) ?? []
  const visualResources = resources.filter((resource) => resource.type === 'goal-visualization')
  assert(visualResources.length === 1, `${goalId}: expected exactly one goal visualization resource`)
  const resource = visualResources[0]
  const expectedUrl = `/assets/goal-visualizations/physik/${goalId}/${goalId}.jpg`
  assert(
    resource.skillpilotId === goalId
      && resource.title === `Visualisierung: ${revision.titleDe}`
      && resource.description === `Visualisierung zum Lernziel: ${revision.titleDe}.`
      && resource.url === expectedUrl
      && resource.provider === 'Google Gemini / Nano Banana Pro'
      && resource.reviewStatus === 'pilot',
    `${goalId}: visualization resource identity drifted`,
  )
  const beforeAlt =
    `Didaktische Visualisierung zum Lernziel "${revision.titleDe}". ${revision.beforeDescriptionDe}`
  const finalAlt =
    `Didaktische Visualisierung zum Lernziel "${revision.titleDe}". ${revision.descriptionDe}`
  assert(
    resource.altText === beforeAlt || resource.altText === finalAlt,
    `${goalId}: visualization alt text is outside the bounded states`,
  )

  const beforeGoal = cloneJson(goal)
  beforeGoal.description = revision.beforeDescriptionDe
  beforeGoal.descriptionEn = revision.beforeDescriptionEn
  const finalGoal = cloneJson(goal)
  finalGoal.description = revision.descriptionDe
  finalGoal.descriptionEn = revision.descriptionEn
  beforeGoalById.set(goalId, beforeGoal)
  finalGoalById.set(goalId, finalGoal)

  goal.description = revision.descriptionDe
  goal.descriptionEn = revision.descriptionEn
  resource.altText = finalAlt
}

const semanticKinds = cloneJson(readJson(paths.semanticKinds))
for (const goalId of revisionGoalIds) {
  const record = (semanticKinds.decisions as JsonRecord[])
    .find((candidate) => candidate.goalId === goalId)
  const beforeGoal = beforeGoalById.get(goalId)
  const finalGoal = finalGoalById.get(goalId)
  assert(record && beforeGoal && finalGoal, `${goalId}: missing semantic-kind binding`)
  assert(
    record.semanticKind === 'curricularAtomic' && record.decisionStatus === 'authoritative',
    `${goalId}: semantic-kind authority drifted`,
  )
  const beforeFingerprint = fingerprintSemanticKindSourceGoal(beforeGoal)
  const finalFingerprint = fingerprintSemanticKindSourceGoal(finalGoal)
  assert(
    record.sourceFingerprint === beforeFingerprint || record.sourceFingerprint === finalFingerprint,
    `${goalId}: semantic-kind fingerprint is outside the bounded states`,
  )
  record.sourceFingerprint = finalFingerprint
}

const atomicity = cloneJson(readJsonl(paths.atomicity))
const goalMemory = cloneJson(readJsonl(paths.goalMemory))
for (const goalId of revisionGoalIds) {
  const revision = revisions[goalId]
  const beforeGoal = beforeGoalById.get(goalId)!
  const finalGoal = finalGoalById.get(goalId)!
  const atomicityRecord = atomicity.find((candidate) => candidate.goalId === goalId)
  const memoryRecord = goalMemory.find((candidate) => candidate.goalId === goalId)
  assert(atomicityRecord && memoryRecord, `${goalId}: missing atomicity or goal-memory review`)

  assert(atomicityRecord.ruleVersion === 'semantic-atomicity-v1', `${goalId}: atomicity rule drifted`)
  assert(
    atomicityRecord.status === 'atomic'
      && atomicityRecord.semanticAtomic === true
      && exactArray(atomicityRecord.suggestedSplit, []),
    `${goalId}: atomicity decision drifted`,
  )
  const beforeAtomicityFingerprint =
    goalReviewFingerprint(beforeGoal, atomicityRecord.ruleVersion)
  const finalAtomicityFingerprint =
    goalReviewFingerprint(finalGoal, atomicityRecord.ruleVersion)
  assert(
    atomicityRecord.fingerprint === beforeAtomicityFingerprint
      || atomicityRecord.fingerprint === finalAtomicityFingerprint,
    `${goalId}: atomicity fingerprint is outside the bounded states`,
  )
  Object.assign(atomicityRecord, {
    fingerprint: finalAtomicityFingerprint,
    reviewedAt,
    reviewer,
    reason: revision.atomicityReason,
  })

  assert(memoryRecord.ruleVersion === 'memory-card-review-v1', `${goalId}: memory rule drifted`)
  assert(
    memoryRecord.status === 'memory_required'
      && memoryRecord.memoryUseful === true
      && exactArray(memoryRecord.memoryGoalIds, [mechanicsMemoryGoalId])
      && exactArray(memoryRecord.deckIds, [mechanicsDeckId]),
    `${goalId}: goal-memory decision or E-phase deck binding drifted`,
  )
  const beforeMemoryFingerprint = goalReviewFingerprint(beforeGoal, memoryRecord.ruleVersion)
  const finalMemoryFingerprint = goalReviewFingerprint(finalGoal, memoryRecord.ruleVersion)
  assert(
    memoryRecord.fingerprint === beforeMemoryFingerprint
      || memoryRecord.fingerprint === finalMemoryFingerprint,
    `${goalId}: goal-memory fingerprint is outside the bounded states`,
  )
  Object.assign(memoryRecord, {
    fingerprint: finalMemoryFingerprint,
    reviewedAt,
    reviewer,
    reason: revision.memoryReason,
  })
}

const plannedDecks = new Map<string, JsonRecord>()
for (const path of deckPaths) {
  const deck = readJson(path)
  assert(deck.deckId === mechanicsDeckId, `${path}: unexpected deck ID`)
  const locale = path.endsWith('.de.json') ? 'de' : 'en'
  for (const cardId of cardIds) {
    const matches = (deck.cards as JsonRecord[]).filter((candidate) => candidate.id === cardId)
    assert(matches.length === 1, `${path}: expected exactly one ${cardId}`)
    const card = matches[0]
    const expectedCategory = locale === 'de' ? 'E-Phase Mechanik' : 'E-Phase Mechanics'
    const expectedTags = [
      ...cardCourseTags[cardId],
      ...(locale === 'en' ? ['coverage:auto'] : []),
      ...cardOrigins[cardId].map((goalId) => `goal:${goalId}`),
    ]
    assert(card.category === expectedCategory, `${path}: ${cardId} category drifted`)
    assert(exactArray(card.tags, expectedTags), `${path}: ${cardId} tags or origins drifted`)
  }
  const card025 = (deck.cards as JsonRecord[])
    .find((candidate) => candidate.id === 'physics_e_cov_025')!
  const text = card025Text[locale]
  assert(
    (card025.front === text.beforeFront && card025.back === text.beforeBack)
      || (card025.front === text.front && card025.back === text.back),
    `${path}: card 025 text is outside the bounded states`,
  )
  card025.front = text.front
  card025.back = text.back
  plannedDecks.set(path, deck)
}
assert(
  serializeJson(plannedDecks.get(paths.canonicalDeckDe))
    === serializeJson(plannedDecks.get(paths.publicDeckDe))
    && serializeJson(plannedDecks.get(paths.canonicalDeckDe))
      === serializeJson(plannedDecks.get(paths.backendDeckDe)),
  'The three planned German deck copies would differ',
)
assert(
  serializeJson(plannedDecks.get(paths.canonicalDeckEn))
    === serializeJson(plannedDecks.get(paths.publicDeckEn))
    && serializeJson(plannedDecks.get(paths.canonicalDeckEn))
      === serializeJson(plannedDecks.get(paths.backendDeckEn)),
  'The three planned English deck copies would differ',
)

const primaryDeDeck = plannedDecks.get(paths.canonicalDeckDe)!
const cardLedger = cloneJson(readJsonl(paths.cardLedger))
for (const cardId of cardIds) {
  const card = (primaryDeDeck.cards as JsonRecord[])
    .find((candidate) => candidate.id === cardId)
  const record = cardLedger.find(
    (candidate) => candidate.deckId === mechanicsDeckId && candidate.cardId === cardId,
  )
  assert(card && record, `${cardId}: missing primary card or card-ledger record`)
  assert(
    record.ruleVersion === 'memory-card-review-v1'
      && record.status === 'kept'
      && record.necessary === true
      && exactArray(record.originGoalIds, cardOrigins[cardId]),
    `${cardId}: card-ledger decision or origin binding drifted`,
  )
  const fingerprint = cardReviewFingerprint(card)
  assert(
    fingerprint === expectedCardFingerprints[cardId],
    `${cardId}: planned card fingerprint mismatch; expected ${expectedCardFingerprints[cardId]}, got ${fingerprint}`,
  )
  const allowedCurrentFingerprints = cardId === 'physics_e_cov_025'
    ? [oldCard025Fingerprint, expectedCardFingerprints[cardId]]
    : [expectedCardFingerprints[cardId]]
  assert(
    allowedCurrentFingerprints.includes(record.fingerprint),
    `${cardId}: current card-ledger fingerprint is outside the bounded states`,
  )
  Object.assign(record, {
    fingerprint,
    reviewedAt,
    reviewer,
    reason: cardReasons[cardId],
  })
}

const visualQa = cloneJson(readJson(paths.visualQa))
assert(
  visualQa.schemaVersion === 1 && visualQa.subject === 'physik',
  'Unexpected Physics visualization-QA ledger',
)
for (const goalId of revisionGoalIds) {
  const revision = revisions[goalId]
  const records = (visualQa.records as JsonRecord[])
    .filter((candidate) => candidate.goalId === goalId)
  assert(records.length === 1, `${goalId}: expected exactly one visualization-QA record`)
  const record = records[0]
  const boundAssetDigest = `sha256:${assetHashes[goalId]}`
  assert(
    record.title === revision.titleDe
      && (record.description === revision.beforeDescriptionDe
        || record.description === revision.descriptionDe)
      && record.visualizationState === 'available'
      && record.assetSha256 === boundAssetDigest
      && record.aiApprovedAssetSha256 === boundAssetDigest
      && record.contentApprovedChatGpt === 'yes'
      && record.umlautsCorrectChatGpt === 'yes'
      && record.aiApproved === 'yes',
    `${goalId}: visualization-QA identity, approval, or immutable asset digest drifted`,
  )
  Object.assign(record, {
    description: revision.descriptionDe,
    chatGptReviewedAt: reviewedAtIso,
    chatGptReviewer: reviewer,
    chatGptNotes: revision.visualCompatibilityNote,
    aiReviewedAt: reviewedAtIso,
    aiReviewer: reviewer,
    aiNotes: revision.visualCompatibilityNote,
  })
}

const plannedPrompts = new Map<string, string>()
for (const goalId of revisionGoalIds) {
  const path = promptPath(goalId)
  const revision = revisions[goalId]
  const current = readFileSync(absolute(path), 'utf8')
  const generatorIndex = current.indexOf('## Generator\n')
  const reviewIndex = current.indexOf('\n## Review-Notiz\n', generatorIndex)
  assert(generatorIndex > 0 && reviewIndex > generatorIndex, `${goalId}: prompt section boundary drifted`)
  const historicalGeneratorAndPrompt = current.slice(generatorIndex, reviewIndex)
  const fenceMatches = historicalGeneratorAndPrompt.match(/```text\n[\s\S]*?\n```/gu)
  assert(fenceMatches?.length === 1, `${goalId}: expected exactly one historical fenced prompt`)
  assert(
    sha256(fenceMatches[0]) === revision.historicalPromptFenceSha256,
    `${goalId}: historical fenced generator prompt drifted`,
  )
  const metadata =
    `# Lernzielvisualisierung: ${revision.titleDe}\n\n`
    + '## SkillPilot-Ziel\n\n'
    + `- SkillPilot-ID: \`${goalId}\`\n`
    + `- Titel: ${revision.titleDe}\n`
    + `- Beschreibung: ${revision.descriptionDe}\n\n`
  const planned =
    `${metadata}${historicalGeneratorAndPrompt}\n## Review-Notiz\n\n`
    + `${revision.promptCompatibilityNote}\n`
  const plannedGeneratorIndex = planned.indexOf('## Generator\n')
  const plannedReviewIndex = planned.indexOf('\n## Review-Notiz\n', plannedGeneratorIndex)
  assert(
    planned.slice(plannedGeneratorIndex, plannedReviewIndex) === historicalGeneratorAndPrompt,
    `${goalId}: historical Generator/Prompt section would be rewritten`,
  )
  plannedPrompts.set(path, planned)
}

const outputBytes = new Map<string, string>([
  [paths.canonical, serializeJson(canonical)],
  [paths.semanticKinds, serializeJson(semanticKinds)],
  [paths.atomicity, serializeJsonl(atomicity)],
  [paths.goalMemory, serializeJsonl(goalMemory)],
  [paths.cardLedger, serializeJsonl(cardLedger)],
  ...deckPaths.map((path) => [path, serializeJson(plannedDecks.get(path))] as [string, string]),
  [paths.visualQa, serializeJson(visualQa)],
  ...revisionGoalIds.map((goalId) => {
    const path = promptPath(goalId)
    return [path, plannedPrompts.get(path)!] as [string, string]
  }),
])
assert(outputBytes.size === 17, `Expected exactly seventeen output files, got ${outputBytes.size}`)
assert(exactArray([...outputBytes.keys()], outputPaths), 'Output boundary or ordering drifted')
assert(
  outputPaths.every((path) => expectedBeforeHashes[path] && expectedAfterHashes[path]),
  'Before/after hash table does not cover the exact output boundary',
)

const plan: PlannedFile[] = []
for (const path of outputPaths) {
  const bytes = outputBytes.get(path)!
  const currentSha256 = sha256(readFileSync(absolute(path)))
  const beforeSha256 = expectedBeforeHashes[path]
  const calculatedAfterSha256 = sha256(bytes)
  const boundAfterSha256 = expectedAfterHashes[path]
  if (boundAfterSha256 !== 'PENDING') {
    assert(
      calculatedAfterSha256 === boundAfterSha256,
      `${path}: planned after digest drifted; expected ${boundAfterSha256}, got ${calculatedAfterSha256}`,
    )
  }
  assert(
    currentSha256 === beforeSha256 || currentSha256 === calculatedAfterSha256,
    `${path}: current output is neither the exact bounded before-state nor the exact planned after-state`,
  )
  plan.push({
    path,
    bytes,
    beforeSha256,
    afterSha256: calculatedAfterSha256,
    state: currentSha256 === calculatedAfterSha256 ? 'after' : 'before',
  })
}

const disagreementResolutions = revisionGoalIds.map((goalId) => ({
  goalId,
  ...selectedDisagreements[goalId],
  resolutionDecision: 'minimal_bilingual_description_revision',
  titleDecision: 'keep',
  titleDe: revisions[goalId].titleDe,
  titleEn: revisions[goalId].titleEn,
  descriptionDe: revisions[goalId].descriptionDe,
  descriptionEn: revisions[goalId].descriptionEn,
  visualizationDecision: 'keep_current_nano_banana_pro_bytes_and_digests',
  cardDecision: goalId === revisionGoalIds[2]
    ? 'revise_only_physics_e_cov_025_bilingually'
    : 'keep_card_bytes_and_refresh_origin_compatibility_review',
}))

const boundedPlan = {
  schemaVersion: 1,
  contract: 'physics-b025a-five-minimal-revisions-plan-v1',
  inputBindings: Object.entries(expectedInputHashes)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([path, hash]) => ({ path, sha256: hash })),
  outputBindings: plan.map(({ path, beforeSha256, afterSha256 }) => ({
    path,
    beforeSha256,
    afterSha256,
  })),
  batchGoalIds,
  revisionGoalIds,
  disagreementResolutions,
  cardOriginCompatibilityReviewIds: cardIds,
  deckMutationCardIds: ['physics_e_cov_025'],
  deckPaths,
  assetBindings,
  promptHistoricalFenceBindings: revisionGoalIds.map((goalId) => ({
    goalId,
    path: promptPath(goalId),
    sha256: revisions[goalId].historicalPromptFenceSha256,
  })),
  memoryVisibilityInvariant: {
    goalId: mechanicsMemoryGoalId,
    deckId: mechanicsDeckId,
    phase: 'E',
    stage: 'SekII',
    mutation: 'none',
  },
  exclusions: [
    'source mapping files and provenance',
    'composition views and placement bytes',
    'NBP asset bytes and asset digests',
    'goal IDs, contains edges, requires edges, and titles',
    'historical fenced generator prompts',
    'generated views and curriculum-quality status reports',
  ],
}
const boundedPlanSha256 = sha256(stableJson(boundedPlan))

console.log(`MODE ${writeMode ? 'WRITE' : checkMode ? 'CHECK' : 'PLAN'}`)
console.log(`PLAN_SHA256 ${boundedPlanSha256}`)
console.log(
  `SCOPE goals=5 outputs=17 cardsReviewed=6 deckCardMutations=1 assetsBoundAndKept=15`,
)
for (const resolution of disagreementResolutions) {
  console.log(
    `DECISION ${resolution.goalId} ${resolution.firstDecision}/${resolution.secondDecision}`
      + ` -> minimal-bilingual-description-revision title=KEEP asset=KEEP`
      + ` card=${resolution.cardDecision}`,
  )
}
for (const item of plan) {
  console.log(
    `${item.state === 'after' ? 'KEEP' : 'UPDATE'} ${item.path} `
      + `${item.beforeSha256} -> ${item.afterSha256}`,
  )
}

if (checkMode) {
  assert(
    Object.values(expectedAfterHashes).every((hash) => hash !== 'PENDING'),
    'CHECK failed: exact after hashes are still PENDING',
  )
  assert(expectedPlanSha256 !== 'PENDING', 'CHECK failed: expectedPlanSha256 is still PENDING')
  assert(
    boundedPlanSha256 === expectedPlanSha256,
    `CHECK plan digest mismatch: expected ${expectedPlanSha256}, got ${boundedPlanSha256}`,
  )
  const incomplete = plan.filter((item) => item.state !== 'after')
  assert(
    incomplete.length === 0,
    `CHECK failed: ${incomplete.length} bounded output file(s) are not materialized`,
  )
  console.log('CHECK PASS')
} else if (writeMode) {
  assert(
    Object.values(expectedAfterHashes).every((hash) => hash !== 'PENDING'),
    'Refusing --write: exact after hashes are still PENDING',
  )
  assert(
    expectedPlanSha256 !== 'PENDING',
    `Refusing --write: bind expectedPlanSha256 to ${boundedPlanSha256} after independent plan review`,
  )
  assert(
    boundedPlanSha256 === expectedPlanSha256,
    `Refusing --write: expected plan ${expectedPlanSha256}, got ${boundedPlanSha256}`,
  )
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })

  const lockPayload = `pid=${process.pid}\nplan=${boundedPlanSha256}\n`
  let lockOwned = false
  let activeStagingPath: string | undefined
  try {
    writeFileSync(lockPath, lockPayload, { encoding: 'utf8', flag: 'wx', mode: 0o600 })
    lockOwned = true
    assertBoundInputs()
    for (const item of plan) {
      const currentSha256 = sha256(readFileSync(absolute(item.path)))
      const expectedCurrentSha256 =
        item.state === 'before' ? item.beforeSha256 : item.afterSha256
      assert(
        currentSha256 === expectedCurrentSha256,
        `${item.path}: output changed between planning and exclusive lock acquisition`,
      )
    }

    const updates = plan.filter((item) => item.state === 'before')
    for (const item of updates) {
      const targetPath = absolute(item.path)
      activeStagingPath = stagingPathFor(item.path)
      assert(
        sha256(readFileSync(targetPath)) === item.beforeSha256,
        `${item.path}: target no longer matches its bounded before-state`,
      )
      writeFileSync(activeStagingPath, item.bytes, {
        encoding: 'utf8',
        flag: 'wx',
        mode: 0o600,
      })
      assert(
        sha256(readFileSync(activeStagingPath)) === item.afterSha256,
        `${item.path}: staging digest mismatch`,
      )
      assert(
        sha256(readFileSync(targetPath)) === item.beforeSha256,
        `${item.path}: target changed while staging`,
      )
      renameSync(activeStagingPath, targetPath)
      activeStagingPath = undefined
      assert(
        sha256(readFileSync(targetPath)) === item.afterSha256,
        `${item.path}: post-rename digest mismatch`,
      )
    }
    console.log(
      `WRITE PASS ${updates.length} file(s) replaced sequentially; completed files are resumable after-states`,
    )
  } finally {
    if (activeStagingPath && existsSync(activeStagingPath)) {
      rmSync(activeStagingPath)
    }
    if (lockOwned) {
      assert(existsSync(lockPath), 'Exclusive lock disappeared during write')
      assert(
        readFileSync(lockPath, 'utf8') === lockPayload,
        'Exclusive lock ownership changed during write; stale lock retained fail-closed',
      )
      rmSync(lockPath)
    }
  }
} else {
  console.log('PLAN ONLY; no files written.')
}
