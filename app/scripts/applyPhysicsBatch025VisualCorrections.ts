import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'

type JsonRecord = Record<string, unknown>
type PlannedFile = {
  path: string
  bytes: Buffer
  purpose: string
  appendOnly?: boolean
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2)
  .filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) {
  throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
}
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const subject = 'physik'
const landscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const clusterId = '65ddd780-0323-45d1-8f94-5e31bf28da23'
const acceleratedMotionId = 'e4b38061-1f28-43ad-8371-a3e7c0e81856'
const secondLawId = 'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20'
const velocityChildId = 'bf8517a9-142b-5789-826a-767f3b277998'
const reviewedAt = '2026-08-29T00:00:00.000Z'
const reviewer = 'codex-physics-b025-independent-visual-audit-2026-08-29'

const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const qaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json'
const reviewPath = 'curricula/DE/Gymnasium/quality/goal-visualization-review/physik-batch-085.md'

const candidatePaths = {
  acceleratedMotion: (
    'tmp/goal-visualizations/e4b38061-1f28-43ad-8371-a3e7c0e81856/generated/'
    + 'e4b38061-1f28-43ad-8371-a3e7c0e81856.generated.2026-08-28T22-10-40-146Z.jpg'
  ),
  secondLaw: (
    'tmp/goal-visualizations/a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20/generated/'
    + 'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20.generated.2026-08-28T22-01-37-297Z.jpg'
  ),
} as const

const hashes = {
  oldAcceleratedMotion: 'aed034bd8eb6b248c898104282ee5fd1e5033106df042f9c82836c15caf03aaa',
  oldAcceleratedMotionPrompt: 'c688ae6d26f5d314bf2494fe2d54a1245d882c4c8296d1444d14776d59bca01c',
  oldSecondLaw: '29f84f44e7c9fb829371e34696e3d45ad4d4a5b4f4b1a0d06046acd2b201adc4',
  oldSecondLawPrompt: '9e27e50d69da37bbdc326f51918b162ca575d075b110d67af030faae156fdddc',
  candidateAcceleratedMotion: 'fd83544e329cc947ab46a9b49f4ab7a461a168a1c086b4624669a44679aa8fbf',
  candidateSecondLaw: '57b21a77d205429a3b9a6905e19da7085020d160e252ddcfa2738161253a6817',
  qaBeforeVisuals: '8509b203651185e17cbb461e4802e22b8b7432a31ecb34b590c64a3e80aa1861',
  canonicalAfterTextSplit: 'c54ad2bb8dff45e0dca73e981f5f7049c07ad2f696081e8614ebd94475fc4d30',
} as const

const compatibilityAssets = new Map<string, string>([
  ['09029573-864f-40ca-bf8a-cee7bf6dcb73', '814704c3c964ed3d7a1a78a9b8b7af66eda5741107a71e7d4f27f8385b15bace'],
  ['31a2ef52-114b-4d2c-a720-6ef5a390b6dc', '8cb7c5abdcff0c844793f0e85f816f5d022ee1f9286ad59596b850868ca28d0c'],
  ['32b896b9-f2f1-4d4e-96ad-e869ac3d3759', '27bfbb5b582578b28eebd768d810211f5ee8f295ea201e8c4535f28e736f4ee9'],
  ['5f289cdc-fda1-4058-b44f-041ba1398e79', 'e043b1e88d557268ace5a2e41396853faa595c85e22d30f0c6bc0f6e31ed4543'],
  ['ad984bb6-e225-432a-952d-d83cda40b7f8', '6d40f979fcfac1706667c51e46a431ae508c960129dd54114c7e14c954b2f6a8'],
  ['c1c71daa-042b-4f4c-8c31-0ac366f5149e', '39701f235a99c66e2aac6c694c7961a4e6178ab3ebb11b702f20d7390d3ee584'],
  ['6affc2ea-ecd2-4fcd-8877-3ffa15b0425b', 'd6000a3831a9bdae9fd5e15104335403801332e92219027996961dab74630692'],
  ['91c49019-ea51-4ce5-a919-c91c45b25e83', '83c9a6d28ef0ca59e6361c267b9e3eb52cf66a43a52c8d8df226ca3992b30afd'],
  ['839ecc8f-3a60-418b-bc92-64bfeef33824', '868e3c4ae01e72b7d8bcbf82d54f3785279c7d769f1948c9f8e43d11508e3ee1'],
  ['e790de73-f8e5-4027-bc05-9f12a0e8c9cb', '0446ed6ce04feb2f6712863a54a3f290d94d79397865be28e5094db55abc0b03'],
])

const compatibilityPromptHashes = new Map<string, string>([
  ['09029573-864f-40ca-bf8a-cee7bf6dcb73', '15920b80ec14e81b36c26667114379aec42a1c81f6a1cb542a5106692904ce3b'],
  ['31a2ef52-114b-4d2c-a720-6ef5a390b6dc', '1cce28634b15b2aaa0f9430bf553ce7e734de1e5e04e64276baf2832d9a79730'],
  ['32b896b9-f2f1-4d4e-96ad-e869ac3d3759', '492d6cb8389eff8744cd9972f6c698798b5d034739c773bbe5f08795defcab9d'],
  ['5f289cdc-fda1-4058-b44f-041ba1398e79', '00ac0e15ba52414f9777b09dbeb9049cf4fd67f0895a0cfd47cf36fec02f2bf7'],
  ['ad984bb6-e225-432a-952d-d83cda40b7f8', '0acccdcf1dce9e57855608fd9c8229a8a3e37e7e62fbe4802ce96c1ffd3dd778'],
  ['c1c71daa-042b-4f4c-8c31-0ac366f5149e', 'fc71469fdd1148fd1a0c3732153177cafffa137161ad456af9bb051519edc2c6'],
  ['6affc2ea-ecd2-4fcd-8877-3ffa15b0425b', '12802fac291dc95f7466b3fa5f6f5fbbb418a4c4cb9e70857c5ee0fa2ecb88e3'],
  ['91c49019-ea51-4ce5-a919-c91c45b25e83', '8401b153b107eb7b54362c580e3d88c4a732bcf65aa7be8be390ccfb7ad2b285'],
  ['839ecc8f-3a60-418b-bc92-64bfeef33824', 'b7c127437ced7925d815b8699f15923a695cce3c4dd45b46ce6cf0784f6317fb'],
  ['e790de73-f8e5-4027-bc05-9f12a0e8c9cb', '766a1e84bcfb0bc75711f8d3ba8138d0ccd331cdc02e897b885ebc2a09d2e01d'],
])
const thirdLawReconstructionPromptHash = (
  '2aea28882b77333c1252c92e0977a69a56102b4caecb3f8a086d10ae8b71dce8'
)

const expectedDescriptions = new Map<string, string>([
  [acceleratedMotionId, 'Die lernende Person kann das Modell der gleichmäßig beschleunigten Bewegung mit konstanter Beschleunigung erläutern und in t-s-, t-v- und t-a-Darstellungen beschreiben.'],
  [secondLawId, 'Die lernende Person kann den vektoriellen Impuls $\\vec p=m\\vec v$ einführen, Newtons zweites Axiom im Inertialsystem für ein materiell abgeschlossenes System als $\\sum \\vec F_\\mathrm{ext}=\\mathrm d\\vec p/\\mathrm dt$ formulieren und deuten und für konstante Masse auf $\\sum \\vec F_\\mathrm{ext}=m\\vec a$ zurückführen.'],
  [velocityChildId, 'Die lernende Person kann Durchschnittsgeschwindigkeit für ein endliches Zeitintervall und Momentangeschwindigkeit für einen Zeitpunkt bestimmen, vergleichen und im t-s-Diagramm als Sekanten- beziehungsweise Tangentensteigung deuten.'],
  ['09029573-864f-40ca-bf8a-cee7bf6dcb73', 'Die lernende Person kann den freien Fall nahe der Erdoberfläche experimentell untersuchen, Messdaten grafisch auswerten, daraus im Modell ohne Luftwiderstand die Gravitationsbeschleunigung bestimmen und unter Angabe der Anfangsbedingungen ein Zeit-Ort-Gesetz formulieren.'],
  ['31a2ef52-114b-4d2c-a720-6ef5a390b6dc', 'Die lernende Person kann Newtons erstes Axiom formulieren und einfache Situationen damit deuten: In einem Inertialsystem bleibt ein Körper bei verschwindender resultierender äußerer Kraft in Ruhe oder bewegt sich geradlinig mit konstanter Geschwindigkeit.'],
  ['32b896b9-f2f1-4d4e-96ad-e869ac3d3759', 'Die lernende Person kann das Trägheitsprinzip auf Alltagssituationen in Inertialsystemen anwenden und den Unterschied zwischen einer verschwindenden resultierenden Kraft und den Bewegungszuständen Ruhe beziehungsweise gleichförmig-geradlinige Bewegung erklären.'],
  ['5f289cdc-fda1-4058-b44f-041ba1398e79', 'Die lernende Person kann für einfache eindimensionale Bewegungen eines Körpers konstanter Masse in einem Inertialsystem die Beziehung $\\sum F_\\mathrm{ext}=m\\cdot a$ mit einer gewählten Vorzeichenrichtung anwenden und Kräftegleichgewicht ($\\sum F_\\mathrm{ext}=0$) von beschleunigter Bewegung unterscheiden.'],
  ['ad984bb6-e225-432a-952d-d83cda40b7f8', 'Die lernende Person kann Newtons drittes Axiom formulieren und an Beispielen erläutern, dass zwei wechselwirkende Körper gleichzeitig gleich große, entgegengesetzt gerichtete Kräfte aufeinander ausüben.'],
  ['c1c71daa-042b-4f4c-8c31-0ac366f5149e', 'Die lernende Person kann mechanische Arbeit als Energieübertragung über eine festgelegte Systemgrenze deuten, ihr Vorzeichen aus Kraft- und Wegrichtung bestimmen und die am System verrichtete Arbeit konsistent mit dessen Energieänderung bilanzieren.'],
  ['6affc2ea-ecd2-4fcd-8877-3ffa15b0425b', 'Die lernende Person kann in einfachen Situationen nahe der Erdoberfläche die gravitative potenzielle Energie des Systems Erde–Körper relativ zu einer gewählten Bezugshöhe beschreiben und ohne Feldbegriff berechnen.'],
  ['91c49019-ea51-4ce5-a919-c91c45b25e83', 'Die lernende Person kann für ein System, über dessen Grenze keine Energie übertragen wird, die Energieerhaltung formulieren und einfache Umwandlungen zwischen Energieformen bilanziell beschreiben.'],
  ['839ecc8f-3a60-418b-bc92-64bfeef33824', 'Die lernende Person kann in einem abgegrenzten System ohne resultierenden äußeren Kraftstoß den Gesamtimpuls als vektorielle Erhaltungsgröße nutzen und einfache Rückstoßsituationen damit qualitativ begründen.'],
  ['e790de73-f8e5-4027-bc05-9f12a0e8c9cb', 'Die lernende Person kann den Kraftstoß als zeitliches Integral der resultierenden äußeren Kraft beziehungsweise in einer gewählten Richtung als vorzeichenbehaftete Fläche unter dem Kraft-Zeit-Diagramm beschreiben, ihn bei konstanter Kraft als Produkt aus Kraft und Einwirkdauer bestimmen und mit der Impulsänderung verknüpfen.'],
])

const expectedDescriptionsEn = new Map<string, string>([
  [acceleratedMotionId, 'The learner can explain the model of uniformly accelerated motion with constant acceleration and describe it using time-position, time-velocity, and time-acceleration representations.'],
  [secondLawId, "The learner can introduce vector momentum $\\vec p=m\\vec v$, formulate and interpret Newton's second law in an inertial frame for a materially closed system as $\\sum \\vec F_\\mathrm{ext}=\\mathrm d\\vec p/\\mathrm dt$, and reduce it to $\\sum \\vec F_\\mathrm{ext}=m\\vec a$ for constant mass."],
  [velocityChildId, 'The learner can determine and compare average velocity over a finite interval and instantaneous velocity at an instant, interpreting them in a time-position graph as secant and tangent slopes, respectively.'],
  ['09029573-864f-40ca-bf8a-cee7bf6dcb73', "The learner can experimentally investigate free fall near Earth's surface, graphically analyze measurement data, use a model that neglects air resistance to determine gravitational acceleration, and formulate a time-position law with stated initial conditions."],
  ['31a2ef52-114b-4d2c-a720-6ef5a390b6dc', "The learner can state Newton's first law and use it to interpret simple situations: in an inertial frame, a body remains at rest or moves in a straight line at constant velocity when the net external force is zero."],
  ['32b896b9-f2f1-4d4e-96ad-e869ac3d3759', 'The learner can apply the principle of inertia to everyday situations in inertial frames and explain the distinction between zero net force and the states of rest and uniform rectilinear motion.'],
  ['5f289cdc-fda1-4058-b44f-041ba1398e79', 'The learner can apply the relation $\\sum F_\\mathrm{ext}=m\\cdot a$ using a chosen positive direction to simple one-dimensional motions of a constant-mass body in an inertial frame and distinguish force equilibrium ($\\sum F_\\mathrm{ext}=0$) from accelerated motion.'],
  ['ad984bb6-e225-432a-952d-d83cda40b7f8', "The learner can state Newton's third law and use examples to explain that two interacting bodies simultaneously exert equal-magnitude, oppositely directed forces on each other."],
  ['c1c71daa-042b-4f4c-8c31-0ac366f5149e', 'The learner can interpret mechanical work as energy transfer across a defined system boundary, determine its sign from the directions of force and displacement, and consistently relate work done on the system to its change in energy.'],
  ['6affc2ea-ecd2-4fcd-8877-3ffa15b0425b', "In simple situations near Earth's surface, the learner can describe the gravitational potential energy of the Earth–object system relative to a chosen reference height and calculate it without using the field concept."],
  ['91c49019-ea51-4ce5-a919-c91c45b25e83', 'The learner can formulate energy conservation for a system with no energy transfer across its boundary and use balances to describe simple transformations among forms of energy.'],
  ['839ecc8f-3a60-418b-bc92-64bfeef33824', 'In a defined system with no net external impulse, the learner can use total momentum as a conserved vector quantity and apply it to qualitatively justify simple recoil situations.'],
  ['e790de73-f8e5-4027-bc05-9f12a0e8c9cb', 'The learner can describe impulse as the time integral of the net external force or, along a chosen direction, as the signed area under the force-time graph, determine it for a constant force as the product of force and interaction time, and relate it to the change in momentum.'],
])

const compatibilityPromptRefinements = new Map<string, string>([
  ['09029573-864f-40ca-bf8a-cee7bf6dcb73', 'Ordne die Messdaten grafisch aus, bestimme daraus im Modell ohne Luftwiderstand die Gravitationsbeschleunigung und formuliere das Zeit-Ort-Gesetz mit den verwendeten Anfangsbedingungen.'],
  ['31a2ef52-114b-4d2c-a720-6ef5a390b6dc', 'Formuliere Newtons erstes Axiom für ein Inertialsystem und beziehe die unveränderte Ruhe beziehungsweise gleichförmig-geradlinige Bewegung ausdrücklich auf eine verschwindende resultierende äußere Kraft.'],
  ['32b896b9-f2f1-4d4e-96ad-e869ac3d3759', 'Wende das Trägheitsprinzip in einer Alltagssituation innerhalb eines Inertialsystems an und trenne klar zwischen verschwindender resultierender Kraft und den möglichen Bewegungszuständen Ruhe oder gleichförmig-geradliniger Bewegung.'],
  ['5f289cdc-fda1-4058-b44f-041ba1398e79', 'Nutze für einen Körper konstanter Masse in einem Inertialsystem eine klar gewählte eindimensionale Vorzeichenrichtung und unterscheide ΣF_ext=0 von ΣF_ext=m·a.'],
  ['ad984bb6-e225-432a-952d-d83cda40b7f8', 'Zeige an zwei wechselwirkenden Körpern, dass die beiden Kräfte gleichzeitig, gleich groß und entgegengesetzt gerichtet auftreten und jeweils auf den anderen Körper wirken.'],
  ['c1c71daa-042b-4f4c-8c31-0ac366f5149e', 'Deute mechanische Arbeit als Energieübertragung über eine festgelegte Systemgrenze, kennzeichne das Vorzeichen aus Kraft- und Wegrichtung und bilanziere die am System verrichtete Arbeit konsistent mit seiner Energieänderung.'],
  ['6affc2ea-ecd2-4fcd-8877-3ffa15b0425b', 'Stelle die gravitative potenzielle Energie des Systems Erde–Körper nahe der Erdoberfläche relativ zu einer gewählten Bezugshöhe dar und berechne sie ohne Feldbegriff.'],
  ['91c49019-ea51-4ce5-a919-c91c45b25e83', 'Kennzeichne ein abgegrenztes System, über dessen Grenze keine Energie übertragen wird, und zeige die konstante Gesamtenergie bei der Umwandlung zwischen Energieformen.'],
  ['839ecc8f-3a60-418b-bc92-64bfeef33824', 'Kennzeichne ein abgegrenztes System ohne resultierenden äußeren Kraftstoß und begründe die einfache Rückstoßsituation mit dem vektoriell konstanten Gesamtimpuls.'],
  ['e790de73-f8e5-4027-bc05-9f12a0e8c9cb', 'Deute den Kraftstoß allgemein als zeitliches Integral der resultierenden äußeren Kraft beziehungsweise in der gewählten Richtung als vorzeichenbehaftete Fläche; zeige den konstanten Spezialfall J=F·Δt und die Impulsänderung.'],
])

const compatibilityNotes = new Map<string, string>([
  ['09029573-864f-40ca-bf8a-cee7bf6dcb73', 'Das unveränderte Nano-Banana-Pro-Bild zeigt weiterhin eine konsistente Mess- und Auswertungskette für den freien Fall: s gegen t², Steigung 4,9 m/s² und g=9,8 m/s² passen zum luftwiderstandsfreien Modell und den benannten Anfangsbedingungen.'],
  ['31a2ef52-114b-4d2c-a720-6ef5a390b6dc', 'Das unveränderte Nano-Banana-Pro-Bild stellt verschwindende resultierende äußere Kraft und den unveränderten Bewegungszustand im Inertialsystem weiterhin korrekt dar.'],
  ['32b896b9-f2f1-4d4e-96ad-e869ac3d3759', 'Das unveränderte Nano-Banana-Pro-Bild trennt in der gezeigten Alltagssituation weiterhin korrekt Kraftbilanz und Bewegungszustand und bleibt mit der präzisierten Inertialsystem-Beschreibung vereinbar.'],
  ['5f289cdc-fda1-4058-b44f-041ba1398e79', 'Das unveränderte Nano-Banana-Pro-Bild rechnet das eindimensionale Beispiel 6 N/2 kg=3 m/s² korrekt und grenzt ΣF=0 ohne Beschleunigung passend vom beschleunigten Fall ab.'],
  ['ad984bb6-e225-432a-952d-d83cda40b7f8', 'Das unveränderte Nano-Banana-Pro-Bild ordnet die gleich großen, entgegengesetzten und gleichzeitig auftretenden Wechselwirkungskräfte korrekt zwei verschiedenen Körpern zu.'],
  ['c1c71daa-042b-4f4c-8c31-0ac366f5149e', 'Das unveränderte Nano-Banana-Pro-Bild verbindet Hubarbeit, Kraft, Weg und Zunahme der potenziellen Energie weiterhin konsistent als Energieübertragung auf das betrachtete System.'],
  ['6affc2ea-ecd2-4fcd-8877-3ffa15b0425b', 'Das unveränderte Nano-Banana-Pro-Bild zeigt Bezugshöhe, Erde–Körper-Situation und korrekt berechnete Lageenergie weiterhin passend zur präzisierten Nahfeldbeschreibung.'],
  ['91c49019-ea51-4ce5-a919-c91c45b25e83', 'Das unveränderte Nano-Banana-Pro-Bild bilanziert potenzielle und kinetische Energie in allen Zuständen zur konstanten Gesamtenergie und widerspricht keiner Energieübertragung über die gewählte Systemgrenze.'],
  ['839ecc8f-3a60-418b-bc92-64bfeef33824', 'Das unveränderte Nano-Banana-Pro-Bild zeigt eine abgegrenzte Rückstoßsituation mit entgegengesetzten Impulsen −2 und +2 kg m/s und konstantem Gesamtimpuls null.'],
  ['e790de73-f8e5-4027-bc05-9f12a0e8c9cb', 'Das unveränderte Nano-Banana-Pro-Bild zeigt die vorzeichenbehaftete Fläche im Kraft-Zeit-Diagramm sowie J=FΔt=10 Ns und Δp=10 kg m/s konsistent.'],
])

const expectedOutputSha256: Record<string, string> = {
  [canonicalPath]: '98035bdfe2454e6a7d1bedd81ab4b73d2f34f4524e62c54a53c58797a332be58',
  [qaPath]: '5d9c290d8c70dda3e265b0c8c1dfe795f581ca1552e0d613aef11375f1f79afe',
  [reviewPath]: '9c5541f5121d514cceb99268f867a7ae32abee666ba42dfbd22d9ebd673f6a87',
  'curricula/DE/Gymnasium/visualizations/physik/65ddd780-0323-45d1-8f94-5e31bf28da23/65ddd780-0323-45d1-8f94-5e31bf28da23.jpg': 'aed034bd8eb6b248c898104282ee5fd1e5033106df042f9c82836c15caf03aaa',
  'app/public/assets/goal-visualizations/physik/65ddd780-0323-45d1-8f94-5e31bf28da23/65ddd780-0323-45d1-8f94-5e31bf28da23.jpg': 'aed034bd8eb6b248c898104282ee5fd1e5033106df042f9c82836c15caf03aaa',
  'backend/src/main/resources/static/assets/goal-visualizations/physik/65ddd780-0323-45d1-8f94-5e31bf28da23/65ddd780-0323-45d1-8f94-5e31bf28da23.jpg': 'aed034bd8eb6b248c898104282ee5fd1e5033106df042f9c82836c15caf03aaa',
  'curricula/DE/Gymnasium/visualizations/physik/65ddd780-0323-45d1-8f94-5e31bf28da23/prompt.de.md': 'be4410798c0019b2d812254d0103521ea7f33d30b37bb666eabdbc25ec0ee764',
  'curricula/DE/Gymnasium/visualizations/physik/65ddd780-0323-45d1-8f94-5e31bf28da23/historical-e4b38061-prompt.de.md': 'c688ae6d26f5d314bf2494fe2d54a1245d882c4c8296d1444d14776d59bca01c',
  'curricula/DE/Gymnasium/visualizations/physik/e4b38061-1f28-43ad-8371-a3e7c0e81856/e4b38061-1f28-43ad-8371-a3e7c0e81856.jpg': 'fd83544e329cc947ab46a9b49f4ab7a461a168a1c086b4624669a44679aa8fbf',
  'app/public/assets/goal-visualizations/physik/e4b38061-1f28-43ad-8371-a3e7c0e81856/e4b38061-1f28-43ad-8371-a3e7c0e81856.jpg': 'fd83544e329cc947ab46a9b49f4ab7a461a168a1c086b4624669a44679aa8fbf',
  'backend/src/main/resources/static/assets/goal-visualizations/physik/e4b38061-1f28-43ad-8371-a3e7c0e81856/e4b38061-1f28-43ad-8371-a3e7c0e81856.jpg': 'fd83544e329cc947ab46a9b49f4ab7a461a168a1c086b4624669a44679aa8fbf',
  'curricula/DE/Gymnasium/visualizations/physik/e4b38061-1f28-43ad-8371-a3e7c0e81856/prompt.de.md': '28413fb0914afcf02d9a4154b4e03b9546b5408a5e0fc03df01f28879a835297',
  'curricula/DE/Gymnasium/visualizations/physik/a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20/a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20.jpg': '57b21a77d205429a3b9a6905e19da7085020d160e252ddcfa2738161253a6817',
  'app/public/assets/goal-visualizations/physik/a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20/a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20.jpg': '57b21a77d205429a3b9a6905e19da7085020d160e252ddcfa2738161253a6817',
  'backend/src/main/resources/static/assets/goal-visualizations/physik/a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20/a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20.jpg': '57b21a77d205429a3b9a6905e19da7085020d160e252ddcfa2738161253a6817',
  'curricula/DE/Gymnasium/visualizations/physik/a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20/prompt.de.md': 'a3e6bc51831caf7c6e54ea9b3a5a7c7140eb154dca9a576fa492ab2281dab1fc',
  'curricula/DE/Gymnasium/quality/goal-visualization-archive/2026-08-29-physics-b025-second-law-predecessor/a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20.jpg': '29f84f44e7c9fb829371e34696e3d45ad4d4a5b4f4b1a0d06046acd2b201adc4',
  'curricula/DE/Gymnasium/quality/goal-visualization-archive/2026-08-29-physics-b025-second-law-predecessor/prompt.de.md': '9e27e50d69da37bbdc326f51918b162ca575d075b110d67af030faae156fdddc',
  'curricula/DE/Gymnasium/quality/goal-visualization-archive/2026-08-29-physics-b025-second-law-predecessor/README.md': 'f4789da7670078aa2c91caab8c57c119c686542389587bcedd7c8b047a4fc2cd',
  'curricula/DE/Gymnasium/quality/goal-visualization-archive/2026-08-29-physics-b025-second-law-predecessor/archive-manifest.json': '3d82bcd4311dd5a0f3fe5f48d4c45f6038e15d83b54eaaef701fe27c3d7e9a1b',
  'curricula/DE/Gymnasium/visualizations/physik/09029573-864f-40ca-bf8a-cee7bf6dcb73/prompt.de.md': '3e749a72185d6a0b63c68b9c3437646fddadeaebcacb240b33da63249aea2a33',
  'curricula/DE/Gymnasium/visualizations/physik/31a2ef52-114b-4d2c-a720-6ef5a390b6dc/prompt.de.md': 'e046d9b05782db8c75b005139832eb2cef7b7f4f83a5601dcd77f1804f79a4cd',
  'curricula/DE/Gymnasium/visualizations/physik/32b896b9-f2f1-4d4e-96ad-e869ac3d3759/prompt.de.md': '8b6720520874f9a6a7babf41e6bdbb66c52842089bfc565879e773ab8b922067',
  'curricula/DE/Gymnasium/visualizations/physik/5f289cdc-fda1-4058-b44f-041ba1398e79/prompt.de.md': 'ab532f107524248d54eeea3faf58e0e4febc56ca29a6c026e17ee49035dff4cc',
  'curricula/DE/Gymnasium/visualizations/physik/ad984bb6-e225-432a-952d-d83cda40b7f8/prompt.de.md': 'cefa3643f8d99698198bef93e02b4f14ae71be36bdce8dcb4c71d850a59ef46f',
  'curricula/DE/Gymnasium/visualizations/physik/c1c71daa-042b-4f4c-8c31-0ac366f5149e/prompt.de.md': '90c514276d35962e1dcf22b4aee9b20a54ddb189d416c6b9fecc3ed617c47722',
  'curricula/DE/Gymnasium/visualizations/physik/6affc2ea-ecd2-4fcd-8877-3ffa15b0425b/prompt.de.md': '56b36ed28a86c39c22afac7863f3f322eab7ea220dbdbd7364d19516f34dad1f',
  'curricula/DE/Gymnasium/visualizations/physik/91c49019-ea51-4ce5-a919-c91c45b25e83/prompt.de.md': '1fe923305a60c4b0230caa1fa412d048c84a40179ab9fde70c29152dae281167',
  'curricula/DE/Gymnasium/visualizations/physik/839ecc8f-3a60-418b-bc92-64bfeef33824/prompt.de.md': 'ca3c496b5f21113a03891da2608dedbe967cfaf9b704b27c8f3a5ad8827b41ac',
  'curricula/DE/Gymnasium/visualizations/physik/e790de73-f8e5-4027-bc05-9f12a0e8c9cb/prompt.de.md': 'ee9617dbf10eb812ac29bf0dcc6d6ebaa3314539405d1f721dd1a6877091b0e5',
  'curricula/DE/Gymnasium/visualizations/physik/ad984bb6-e225-432a-952d-d83cda40b7f8/image-reconstruction-prompt.de.md': '60e1f4a558651b17088a11a91dcb5df83e1f59847b7fabc28e06adca9cc940b8',
}
const expectedPlanSha256 = '79c79531c15ed393e41a8c71ef6e8a63b1a05e048e691352514b45b2ced7c1c3'

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256 = (value: string | Uint8Array): string => (
  createHash('sha256').update(value).digest('hex')
)
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const textBytes = (value: string): Buffer => Buffer.from(value)
const read = (path: string): Buffer => readFileSync(absolute(path))
const fileHash = (path: string): string => sha256(read(path))
const assertHash = (path: string, expected: string, label: string): Buffer => {
  if (!existsSync(absolute(path))) throw new Error(`${label}: missing ${path}`)
  const bytes = read(path)
  const actual = sha256(bytes)
  if (actual !== expected) throw new Error(`${label}: ${path} has ${actual}, expected ${expected}`)
  return bytes
}
const assertHistoricalOrBoundOutput = (
  path: string,
  historicalHash: string,
  label: string,
): Buffer => {
  if (!existsSync(absolute(path))) throw new Error(`${label}: missing ${path}`)
  const bytes = read(path)
  const actual = sha256(bytes)
  const boundOutput = expectedOutputSha256[path]
  if (
    actual !== historicalHash
    && (boundOutput === undefined || boundOutput === 'PENDING' || actual !== boundOutput)
  ) {
    throw new Error(
      `${label}: ${path} has ${actual}, expected historical ${historicalHash}`
      + ` or bound output ${String(boundOutput)}`,
    )
  }
  return bytes
}
const assetPaths = (goalId: string) => ({
  canonical: `curricula/DE/Gymnasium/visualizations/physik/${goalId}/${goalId}.jpg`,
  public: `app/public/assets/goal-visualizations/physik/${goalId}/${goalId}.jpg`,
  backend: `backend/src/main/resources/static/assets/goal-visualizations/physik/${goalId}/${goalId}.jpg`,
  prompt: `curricula/DE/Gymnasium/visualizations/physik/${goalId}/prompt.de.md`,
})
const thirdLawReconstructionPromptPath = (
  `curricula/DE/Gymnasium/visualizations/physik/ad984bb6-e225-432a-952d-d83cda40b7f8/`
  + 'image-reconstruction-prompt.de.md'
)
const visualizationLink = (
  goalId: string,
  title: string,
  description: string,
  label = title,
): JsonRecord => ({
  type: 'goal-visualization',
  resourceType: 'image',
  role: 'primary',
  skillpilotId: goalId,
  title: `Visualisierung: ${label}`,
  url: `/assets/goal-visualizations/physik/${goalId}/${goalId}.jpg`,
  provider: 'Google Gemini / Nano Banana Pro',
  description: `Visualisierung zum Lernziel: ${label}.`,
  altText: `Didaktische Visualisierung zum Lernziel "${title}". ${description}`,
  lang: 'de',
  license: 'AI-generated, SkillPilot-curated',
  reviewStatus: 'pilot',
})

for (const [goalId, expected] of compatibilityAssets) {
  const paths = assetPaths(goalId)
  for (const [lane, path] of Object.entries(paths).filter(([key]) => key !== 'prompt')) {
    assertHash(path, expected, `${goalId}: byte-stable compatibility asset ${lane}`)
  }
}
const compatibilityPromptInputs = new Map<string, Buffer>()
for (const [goalId, expected] of compatibilityPromptHashes) {
  const promptPath = assetPaths(goalId).prompt
  compatibilityPromptInputs.set(
    goalId,
    assertHistoricalOrBoundOutput(promptPath, expected, `${goalId}: compatibility prompt input`),
  )
}
const thirdLawReconstructionPromptInput = assertHistoricalOrBoundOutput(
  thirdLawReconstructionPromptPath,
  thirdLawReconstructionPromptHash,
  'ad984 third-law reconstruction metadata input',
)

const canonicalBytes = read(canonicalPath)
const canonical = JSON.parse(canonicalBytes.toString('utf8')) as {
  landscapeId?: string
  goals?: JsonRecord[]
}
if (canonical.landscapeId !== landscapeId || !Array.isArray(canonical.goals)) {
  throw new Error('Canonical Physics landscape identity or goals changed')
}
const goalById = new Map(canonical.goals.map((goal) => [String(goal.id ?? ''), goal]))
const cluster = goalById.get(clusterId)
const acceleratedMotion = goalById.get(acceleratedMotionId)
const secondLaw = goalById.get(secondLawId)
const velocityChild = goalById.get(velocityChildId)
if (!cluster || !acceleratedMotion || !secondLaw) throw new Error('Required B025 visualization goals are missing')

const isGoalVisualizationLink = (value: unknown): value is JsonRecord => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
  && (
    (value as JsonRecord).type === 'goal-visualization'
    || (value as JsonRecord).resourceType === 'goal-visualization'
  )
)
const isPrimaryVisualizationLink = (value: unknown): value is JsonRecord => (
  isGoalVisualizationLink(value)
  && ((value as JsonRecord).role === undefined || (value as JsonRecord).role === 'primary')
)
const resourceLinks = (goal: JsonRecord, label: string): JsonRecord[] => {
  if (goal.resourceLinks === undefined) return []
  if (!Array.isArray(goal.resourceLinks)) throw new Error(`${label}: resourceLinks is not an array`)
  return goal.resourceLinks as JsonRecord[]
}
const currentLink = (goal: JsonRecord, label: string): JsonRecord | undefined => {
  const links = resourceLinks(goal, label).filter(isPrimaryVisualizationLink)
  if (links.length > 1) throw new Error(`${label}: multiple primary goal-visualization links`)
  return links[0]
}

const expectedAfterText = (
  velocityChild !== undefined
  && String(velocityChild.title ?? '') === 'Durchschnitts- und Momentangeschwindigkeit unterscheiden'
  && [...expectedDescriptions].every(([goalId, description]) => (
    String(goalById.get(goalId)?.description ?? '') === description
  ))
  && [...expectedDescriptionsEn].every(([goalId, description]) => (
    String(goalById.get(goalId)?.descriptionEn ?? '') === description
  ))
  && Array.isArray(cluster.contains)
  && cluster.contains.includes(velocityChildId)
)

const clusterLink = currentLink(cluster, clusterId)
const acceleratedMotionLink = currentLink(acceleratedMotion, acceleratedMotionId)
const secondLawLink = currentLink(secondLaw, secondLawId)
const finalClusterUrl = `/assets/goal-visualizations/physik/${clusterId}/${clusterId}.jpg`
const finalAcceleratedMotionUrl = (
  `/assets/goal-visualizations/physik/${acceleratedMotionId}/${acceleratedMotionId}.jpg`
)
const finalSecondLawUrl = `/assets/goal-visualizations/physik/${secondLawId}/${secondLawId}.jpg`

const acceleratedPaths = assetPaths(acceleratedMotionId)
const secondLawPaths = assetPaths(secondLawId)
const clusterPaths = assetPaths(clusterId)
const velocityChildPaths = assetPaths(velocityChildId)
const historicalAcceleratedPromptPath = (
  `curricula/DE/Gymnasium/visualizations/physik/${clusterId}/`
  + 'historical-e4b38061-prompt.de.md'
)
const archiveRoot = (
  'curricula/DE/Gymnasium/quality/goal-visualization-archive/'
  + '2026-08-29-physics-b025-second-law-predecessor'
)
const archivedSecondLawAssetPath = `${archiveRoot}/${secondLawId}.jpg`
const archivedSecondLawPromptPath = `${archiveRoot}/prompt.de.md`
const archiveReadmePath = `${archiveRoot}/README.md`
const archiveManifestPath = `${archiveRoot}/archive-manifest.json`

const linkHasIdentity = (
  link: JsonRecord | undefined,
  goalId: string,
  url: string,
): boolean => (
  link?.type === 'goal-visualization'
  && link.resourceType === 'image'
  && link.role === 'primary'
  && link.skillpilotId === goalId
  && link.url === url
  && link.provider === 'Google Gemini / Nano Banana Pro'
  && link.license === 'AI-generated, SkillPilot-curated'
)
const assetsHaveHash = (paths: ReturnType<typeof assetPaths>, expected: string): boolean => (
  [paths.canonical, paths.public, paths.backend].every((path) => (
    existsSync(absolute(path)) && fileHash(path) === expected
  ))
)
const childVisualizationAbsent = (
  velocityChild !== undefined
  && resourceLinks(velocityChild, velocityChildId).every((link) => !isGoalVisualizationLink(link))
  && [
    velocityChildPaths.canonical,
    velocityChildPaths.public,
    velocityChildPaths.backend,
    velocityChildPaths.prompt,
  ].every((path) => !existsSync(absolute(path)))
)
const additiveDestinationPaths = [
  reviewPath,
  clusterPaths.canonical,
  clusterPaths.public,
  clusterPaths.backend,
  clusterPaths.prompt,
  historicalAcceleratedPromptPath,
  archivedSecondLawAssetPath,
  archivedSecondLawPromptPath,
  archiveReadmePath,
  archiveManifestPath,
]
const compatibilityPromptsAreHistorical = [...compatibilityPromptHashes].every(([goalId, expected]) => (
  fileHash(assetPaths(goalId).prompt) === expected
))
const legacyVisualPreState = (
  expectedAfterText
  && childVisualizationAbsent
  && clusterLink === undefined
  && linkHasIdentity(
    acceleratedMotionLink,
    acceleratedMotionId,
    finalAcceleratedMotionUrl,
  )
  && linkHasIdentity(secondLawLink, secondLawId, finalSecondLawUrl)
  && assetsHaveHash(acceleratedPaths, hashes.oldAcceleratedMotion)
  && assetsHaveHash(secondLawPaths, hashes.oldSecondLaw)
  && fileHash(acceleratedPaths.prompt) === hashes.oldAcceleratedMotionPrompt
  && fileHash(secondLawPaths.prompt) === hashes.oldSecondLawPrompt
  && fileHash(qaPath) === hashes.qaBeforeVisuals
  && compatibilityPromptsAreHistorical
  && fileHash(thirdLawReconstructionPromptPath) === thirdLawReconstructionPromptHash
  && additiveDestinationPaths.every((path) => !existsSync(absolute(path)))
)

console.log(
  `CANDIDATE_SHA256 e4=${hashes.candidateAcceleratedMotion} a94=${hashes.candidateSecondLaw}`,
)
if (!expectedAfterText) {
  if (writeMode || checkMode) {
    throw new Error('Physics B025 text/split after-state is not present; refusing visual write/check')
  }
  console.log(
    'CHECK apply_physics_batch025_visual_corrections AWAITING_TEXT_SPLIT_AFTER_STATE '
    + `canonical=${sha256(canonicalBytes)} expectedBinding=${hashes.canonicalAfterTextSplit}`,
  )
  console.log('VISUAL_PLAN_SHA256 PENDING reason=text-split-after-state-not-present')
  process.exit(0)
}
if (!childVisualizationAbsent) {
  throw new Error(
    'Velocity child must have no visualization link, canonical/public/backend JPG, or prompt',
  )
}
if (legacyVisualPreState && hashes.canonicalAfterTextSplit !== 'PENDING') {
  assertHash(canonicalPath, hashes.canonicalAfterTextSplit, 'Bound B025 text/split after-state')
}

const approvedCandidate = (
  generatedPath: string,
  activeCanonicalPath: string,
  expectedHash: string,
  label: string,
): Buffer => {
  if (
    existsSync(absolute(activeCanonicalPath))
    && fileHash(activeCanonicalPath) === expectedHash
  ) return assertHash(activeCanonicalPath, expectedHash, `${label} active canonical asset`)
  return assertHash(generatedPath, expectedHash, `${label} generated candidate`)
}
const historicalOrPreserved = (
  activePath: string,
  preservedPath: string,
  expectedHash: string,
  label: string,
): Buffer => {
  if (existsSync(absolute(activePath)) && fileHash(activePath) === expectedHash) {
    return assertHash(activePath, expectedHash, `${label} active predecessor`)
  }
  return assertHash(preservedPath, expectedHash, `${label} preserved predecessor`)
}
const candidateAcceleratedMotion = approvedCandidate(
  candidatePaths.acceleratedMotion,
  acceleratedPaths.canonical,
  hashes.candidateAcceleratedMotion,
  'Independently approved accelerated-motion candidate',
)
const candidateSecondLaw = approvedCandidate(
  candidatePaths.secondLaw,
  secondLawPaths.canonical,
  hashes.candidateSecondLaw,
  'Independently approved second-law candidate',
)
const historicalAcceleratedAsset = historicalOrPreserved(
  acceleratedPaths.canonical,
  clusterPaths.canonical,
  hashes.oldAcceleratedMotion,
  'Historical e4 image',
)
const historicalAcceleratedPrompt = historicalOrPreserved(
  acceleratedPaths.prompt,
  historicalAcceleratedPromptPath,
  hashes.oldAcceleratedMotionPrompt,
  'Historical e4 prompt',
)
const historicalSecondLawAsset = historicalOrPreserved(
  secondLawPaths.canonical,
  archivedSecondLawAssetPath,
  hashes.oldSecondLaw,
  'Historical a94 image',
)
const historicalSecondLawPrompt = historicalOrPreserved(
  secondLawPaths.prompt,
  archivedSecondLawPromptPath,
  hashes.oldSecondLawPrompt,
  'Historical a94 prompt',
)

const nextCanonical = structuredClone(canonical)
const nextGoalById = new Map(nextCanonical.goals?.map((goal) => [String(goal.id ?? ''), goal]))
const nextCluster = nextGoalById.get(clusterId)!
const nextAcceleratedMotion = nextGoalById.get(acceleratedMotionId)!
const nextSecondLaw = nextGoalById.get(secondLawId)!
const nextVelocityChild = nextGoalById.get(velocityChildId)!
const replacePrimaryVisualizationLink = (
  goal: JsonRecord,
  replacement: JsonRecord,
  label: string,
): void => {
  const links = resourceLinks(goal, label)
  const existing = links.filter(isPrimaryVisualizationLink)
  if (existing.length > 1) throw new Error(`${label}: multiple primary visualization links`)
  goal.resourceLinks = existing.length === 0
    ? [...links, replacement]
    : links.map((link) => (link === existing[0] ? replacement : link))
}
replacePrimaryVisualizationLink(nextCluster, visualizationLink(
  clusterId,
  String(nextCluster.title ?? ''),
  String(nextCluster.description ?? ''),
  'E.1 Bewegungen und ihre Beschreibung – Überblick',
), clusterId)
replacePrimaryVisualizationLink(nextAcceleratedMotion, visualizationLink(
  acceleratedMotionId,
  String(nextAcceleratedMotion.title ?? ''),
  String(nextAcceleratedMotion.description ?? ''),
), acceleratedMotionId)
replacePrimaryVisualizationLink(nextSecondLaw, visualizationLink(
  secondLawId,
  String(nextSecondLaw.title ?? ''),
  String(nextSecondLaw.description ?? ''),
), secondLawId)
for (const [goalId] of compatibilityAssets) {
  const goal = nextGoalById.get(goalId)
  if (!goal || !Array.isArray(goal.resourceLinks)) {
    throw new Error(`${goalId}: compatibility goal or resourceLinks missing`)
  }
  const links = goal.resourceLinks as JsonRecord[]
  const primaryVisualizations = links.filter((link) => (
    link.type === 'goal-visualization' && link.role === 'primary'
  ))
  if (primaryVisualizations.length !== 1) {
    throw new Error(`${goalId}: expected exactly one primary goal-visualization link`)
  }
  const primary = primaryVisualizations[0]
  const expectedUrl = `/assets/goal-visualizations/physik/${goalId}/${goalId}.jpg`
  if (
    primary.skillpilotId !== goalId
    || primary.url !== expectedUrl
    || primary.provider !== 'Google Gemini / Nano Banana Pro'
  ) {
    throw new Error(`${goalId}: compatibility visualization identity, URL or provider drifted`)
  }
  const title = String(goal.title ?? '')
  const description = String(goal.description ?? '')
  goal.resourceLinks = links.map((link) => (
    link === primary
      ? {
          ...link,
          title: `Visualisierung: ${title}`,
          description: `Visualisierung zum Lernziel: ${title}.`,
          altText: `Didaktische Visualisierung zum Lernziel "${title}". ${description}`,
        }
      : link
  ))
}
const rewriteLines = (
  input: string,
  prefix: string,
  replacement: string,
  expectedCount: number,
  label: string,
): string => {
  let count = 0
  const output = input.split('\n').map((line) => {
    if (!line.startsWith(prefix)) return line
    count += 1
    return replacement
  }).join('\n')
  if (count !== expectedCount) {
    throw new Error(`${label}: found ${count} lines starting with ${prefix}, expected ${expectedCount}`)
  }
  return output
}
const replaceExactlyOnce = (
  input: string,
  search: string,
  replacement: string,
  label: string,
): string => {
  const parts = input.split(search)
  if (parts.length !== 2) throw new Error(`${label}: expected exactly one marker ${search}`)
  return `${parts[0]}${replacement}${parts[1]}`
}
const compatibilityPromptOutputs = new Map<string, Buffer>()
for (const [goalId, historicalHash] of compatibilityPromptHashes) {
  const goal = nextGoalById.get(goalId)
  const input = compatibilityPromptInputs.get(goalId)
  const refinement = compatibilityPromptRefinements.get(goalId)
  if (!goal || !input || !refinement) throw new Error(`${goalId}: prompt rewrite inputs missing`)
  const promptPath = assetPaths(goalId).prompt
  const boundOutput = expectedOutputSha256[promptPath]
  if (boundOutput !== undefined && boundOutput !== 'PENDING' && sha256(input) === boundOutput) {
    compatibilityPromptOutputs.set(goalId, input)
    continue
  }
  if (sha256(input) !== historicalHash) {
    throw new Error(`${goalId}: prompt is neither historical nor bound applied output`)
  }
  const title = String(goal.title ?? '')
  const description = String(goal.description ?? '')
  let output = input.toString('utf8')
  output = rewriteLines(output, '# Lernzielvisualisierung:', `# Lernzielvisualisierung: ${title}`, 1, goalId)
  output = rewriteLines(output, '- Titel:', `- Titel: ${title}`, 1, goalId)
  output = rewriteLines(output, '- Beschreibung:', `- Beschreibung: ${description}`, 1, goalId)
  output = rewriteLines(output, 'Titel:', `Titel: ${title}`, 1, goalId)
  output = rewriteLines(output, 'Beschreibung:', `Beschreibung: ${description}`, 1, goalId)
  output = replaceExactlyOnce(
    output,
    'Zusatzanweisung:\n',
    `Zusatzanweisung:\nZielpräzisierung:\n${refinement}\n\n`,
    goalId,
  )
  compatibilityPromptOutputs.set(goalId, textBytes(output))
}

const thirdLawGoal = nextGoalById.get('ad984bb6-e225-432a-952d-d83cda40b7f8')!
const reconstructionBoundOutput = expectedOutputSha256[thirdLawReconstructionPromptPath]
let thirdLawReconstructionPromptOutput = thirdLawReconstructionPromptInput
if (
  reconstructionBoundOutput === undefined
  || reconstructionBoundOutput === 'PENDING'
  || sha256(thirdLawReconstructionPromptInput) !== reconstructionBoundOutput
) {
  if (sha256(thirdLawReconstructionPromptInput) !== thirdLawReconstructionPromptHash) {
    throw new Error('ad984 reconstruction metadata is neither historical nor bound applied output')
  }
  let output = thirdLawReconstructionPromptInput.toString('utf8')
  output = rewriteLines(
    output,
    '# Bildrekonstruktionsprompt:',
    `# Bildrekonstruktionsprompt: ${String(thirdLawGoal.title ?? '')}`,
    1,
    'ad984 reconstruction metadata',
  )
  output = rewriteLines(
    output,
    '- Titel:',
    `- Titel: ${String(thirdLawGoal.title ?? '')}`,
    1,
    'ad984 reconstruction metadata',
  )
  output = rewriteLines(
    output,
    '- Beschreibung:',
    `- Beschreibung: ${String(thirdLawGoal.description ?? '')}`,
    1,
    'ad984 reconstruction metadata',
  )
  thirdLawReconstructionPromptOutput = textBytes(output)
}

const acceleratedPrompt = `# Lernzielvisualisierung: ${String(nextAcceleratedMotion.title)}

## SkillPilot-Ziel

- SkillPilot-ID: \`${acceleratedMotionId}\`
- Titel: ${String(nextAcceleratedMotion.title)}
- Beschreibung: ${String(nextAcceleratedMotion.description)}

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot, independently reviewed 2026-08-29
- Quellbild: \`${acceleratedMotionId}.jpg\`
- Asset SHA-256: \`sha256:${hashes.candidateAcceleratedMotion}\`
- Public Asset: \`${finalAcceleratedMotionUrl}\`

## Prompt

\`\`\`text
Erzeuge eine klare deutsche Physik-Infografik im lockeren Cartoon-Stil zu gleichmäßig beschleunigter Bewegung aus der Ruhe.

Zeige vier getrennte und ausdrücklich als schematisch, nicht maßstäblich bezeichnete Momentaufnahmen für t=0,1,2,3 s mit v=0,2,4,6 m/s und s=0,1,4,9 m.

Zeige drei konsistente Diagramme:
- t-s: Parabel durch (0,0), (1,1), (2,4), (3,9), Achsen t/s und s/m.
- t-v: Gerade durch (0,0), (1,2), (2,4), (3,6), Achsen t/s und v/(m/s).
- t-a: horizontale Linie bei a=2 m/s², Achsen t/s und a/(m/s²).

Formeln und Bedingungen: a=konstant, v₀=0, s₀=0, v(t)=v₀+a·t und s(t)=s₀+v₀·t+½a·t².

Keine gemeinsame räumliche Linealskala für die vier Momentaufnahmen. Keine Inhalte zu Durchschnitts- oder Momentangeschwindigkeit. Keine Kraftpfeile.
\`\`\`

## Review-Notiz

Unabhängige Originalauflösungsprüfung: Alle Momentwerte, drei Diagramme, Achsen, Einheiten, Formeln und Anfangsbedingungen sind konsistent; die getrennten Panels beseitigen jede falsche Maßstabs-Suggestion.
`

const secondLawPrompt = `# Lernzielvisualisierung: ${String(nextSecondLaw.title)}

## SkillPilot-Ziel

- SkillPilot-ID: \`${secondLawId}\`
- Titel: ${String(nextSecondLaw.title)}
- Beschreibung: ${String(nextSecondLaw.description)}

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot, independently reviewed 2026-08-29
- Quellbild: \`${secondLawId}.jpg\`
- Asset SHA-256: \`sha256:${hashes.candidateSecondLaw}\`
- Public Asset: \`${finalSecondLawUrl}\`

## Prompt

\`\`\`text
Erzeuge eine klare deutsche Physik-Infografik im lockeren Cartoon-Stil zu Newtons zweitem Axiom für ein materiell abgeschlossenes System in einem Inertialsystem.

Zeige genau einen blauen Impulspfeil p⃗ und genau einen roten Pfeil der resultierenden äußeren Kraft ΣF⃗_ext. Keine v⃗=p⃗-Suggestion und keine Vorher-/Nachher-Pfeilkonstruktion.

Formeln: p⃗=m·v⃗, ΣF⃗_ext=dp⃗/dt und bei konstanter Masse ΣF⃗_ext=m·a⃗. Beschrifte die gestrichelte Systemgrenze als materiell abgeschlossenes System und den Bezugsrahmen als Inertialsystem.

Keine Aussage, die die einfache Systemgleichung pauschal als Variable-Mass-Gleichung ausgibt. Symbole, Vektorpfeile und ext-Indizes müssen eindeutig lesbar sein.
\`\`\`

## Review-Notiz

Unabhängige Originalauflösungsprüfung: genau ein p⃗-Pfeil, keine v=p-Suggestion, korrekte Vektorformeln und eindeutige System-, Inertialsystem- und Außenkraftkennzeichnung.
`

const clusterPrompt = `# Cluster-Überblicksvisualisierung: ${String(nextCluster.title)}

## SkillPilot-Cluster

- SkillPilot-ID: \`${clusterId}\`
- Titel: ${String(nextCluster.title)}
- Beschreibung: ${String(nextCluster.description)}

## Herkunft und Erhalt

- Provider: Google Gemini / Nano Banana Pro
- Ursprüngliches Ziel: \`${acceleratedMotionId}\`
- Bild unverändert erhalten: \`sha256:${hashes.oldAcceleratedMotion}\`
- Historischer Prompt: \`historical-e4b38061-prompt.de.md\`
- Public Asset: \`${finalClusterUrl}\`

## Einordnung

Das unveränderte Vorgängerbild verbindet gleichmäßig beschleunigte Bewegung mit Durchschnitts- und Momentangeschwindigkeit. Nach der fachlichen Aufteilung ist es für keines der beiden atomaren Kinder eng genug, bleibt aber als korrekter Überblick über den gemeinsamen Bewegungskorridor didaktisch nützlich.
`

const archiveReadme = `# Archived Physics B025 second-law predecessor

The original Google Gemini / Nano Banana Pro image and prompt for
\`${secondLawId}\` are preserved here byte-for-byte before the active image is
replaced by the independently reviewed B025 correction.

The predecessor image contains an over-broad variable-mass claim and is no
longer active. Its bytes remain available for provider provenance and audit.

- image SHA-256: \`${hashes.oldSecondLaw}\`
- prompt SHA-256: \`${hashes.oldSecondLawPrompt}\`
- replacement SHA-256: \`${hashes.candidateSecondLaw}\`
`

const archiveManifest = {
  schemaVersion: 1,
  archiveKind: 'goal-visualization-provider-predecessor',
  archiveDate: '2026-08-29',
  subject,
  goalId: secondLawId,
  provider: 'Google Gemini / Nano Banana Pro',
  decision: 'replaced_after_independent_scientific_review',
  artifacts: [
    { path: archivedSecondLawAssetPath, sha256: `sha256:${hashes.oldSecondLaw}` },
    { path: archivedSecondLawPromptPath, sha256: `sha256:${hashes.oldSecondLawPrompt}` },
  ],
  replacement: {
    activeCanonicalPath: secondLawPaths.canonical,
    activePublicPath: secondLawPaths.public,
    activeBackendPath: secondLawPaths.backend,
    generationSourcePath: candidatePaths.secondLaw,
    sha256: `sha256:${hashes.candidateSecondLaw}`,
  },
}

const qa = JSON.parse(read(qaPath).toString('utf8')) as {
  schemaVersion?: number
  subject?: string
  records?: JsonRecord[]
}
if (qa.schemaVersion !== 1 || qa.subject !== subject || !Array.isArray(qa.records)) {
  throw new Error('Physics visualization QA ledger identity or records changed')
}
const qaByGoalId = new Map(qa.records.map((record) => [String(record.goalId ?? ''), record]))

const availableQaRecord = (
  goal: JsonRecord,
  goalId: string,
  assetHash: string,
  notes: string,
): JsonRecord => ({
  goalId,
  title: String(goal.title ?? ''),
  description: String(goal.description ?? ''),
  subject,
  landscapeId,
  landscapePath: canonicalPath,
  visualizationState: 'available',
  missingReason: '',
  imageUrl: `/assets/goal-visualizations/physik/${goalId}/${goalId}.jpg`,
  publicAssetPath: `app/public/assets/goal-visualizations/physik/${goalId}/${goalId}.jpg`,
  canonicalAssetPath: `curricula/DE/Gymnasium/visualizations/physik/${goalId}/${goalId}.jpg`,
  assetSha256: `sha256:${assetHash}`,
  umlautsCorrectChatGpt: 'yes',
  contentApprovedChatGpt: 'yes',
  humanApproved: 'no',
  humanIssueIdentified: 'no',
  humanIssueDescription: '',
  chatGptReviewedAt: reviewedAt,
  chatGptReviewer: reviewer,
  chatGptNotes: notes,
  humanReviewedAt: null,
  humanReviewer: '',
  aiApproved: 'yes',
  aiApprovedAssetSha256: `sha256:${assetHash}`,
  aiReviewedAt: reviewedAt,
  aiReviewer: reviewer,
  aiNotes: notes,
})

const clusterNotes = (
  'Das unveränderte Nano-Banana-Pro-Vorgängerbild bleibt als Clusterüberblick fachlich korrekt: '
  + 'a=2 m/s² aus der Ruhe, v=0/2/4/6 m/s, s=0/1/4/9 m, t-s-Parabel und t-v-Gerade '
  + 'sowie die ergänzende Unterscheidung von Durchschnitts- und Momentangeschwindigkeit.'
)
const acceleratedNotes = (
  'Unabhängig geprüfte Nano-Banana-Pro-Korrektur: getrennte, ausdrücklich nicht maßstäbliche '
  + 'Momentaufnahmen; korrekte Werte v=0/2/4/6 m/s und s=0/1/4/9 m; konsistente t-s-, t-v- '
  + 'und t-a-Diagramme sowie korrekte Anfangsbedingungen und Bewegungsgleichungen.'
)
const secondLawNotes = (
  'Unabhängig geprüfte Nano-Banana-Pro-Korrektur: genau ein Impulspfeil p⃗, keine v=p-Suggestion, '
  + 'p⃗=m·v⃗, ΣF⃗_ext=dp⃗/dt und für konstante Masse ΣF⃗_ext=m·a⃗; materiell abgeschlossenes '
  + 'System und Inertialsystem sind eindeutig bezeichnet.'
)

qaByGoalId.set(clusterId, availableQaRecord(nextCluster, clusterId, hashes.oldAcceleratedMotion, clusterNotes))
qaByGoalId.set(acceleratedMotionId, availableQaRecord(
  nextAcceleratedMotion,
  acceleratedMotionId,
  hashes.candidateAcceleratedMotion,
  acceleratedNotes,
))
qaByGoalId.set(secondLawId, availableQaRecord(
  nextSecondLaw,
  secondLawId,
  hashes.candidateSecondLaw,
  secondLawNotes,
))
qaByGoalId.set(velocityChildId, {
  goalId: velocityChildId,
  title: String(nextVelocityChild.title ?? ''),
  description: String(nextVelocityChild.description ?? ''),
  subject,
  landscapeId,
  landscapePath: canonicalPath,
  visualizationState: 'missing',
  missingReason: 'deferred_provider_limitation',
  imageUrl: '',
  publicAssetPath: '',
  canonicalAssetPath: '',
  assetSha256: '',
  umlautsCorrectChatGpt: 'no',
  contentApprovedChatGpt: 'no',
  humanApproved: 'no',
  humanIssueIdentified: 'no',
  humanIssueDescription: '',
  chatGptReviewedAt: null,
  chatGptReviewer: '',
  chatGptNotes: '',
  humanReviewedAt: null,
  humanReviewer: '',
})
for (const [goalId, assetHash] of compatibilityAssets) {
  const goal = nextGoalById.get(goalId)
  const existing = qaByGoalId.get(goalId)
  const notes = compatibilityNotes.get(goalId)
  if (!goal || !existing || !notes) throw new Error(`${goalId}: missing compatibility inputs`)
  if (
    existing.assetSha256 !== `sha256:${assetHash}`
    || existing.visualizationState !== 'available'
  ) throw new Error(`${goalId}: QA asset binding drifted before compatibility review`)
  qaByGoalId.set(goalId, {
    ...existing,
    title: String(goal.title ?? ''),
    description: String(goal.description ?? ''),
    umlautsCorrectChatGpt: 'yes',
    contentApprovedChatGpt: 'yes',
    chatGptReviewedAt: reviewedAt,
    chatGptReviewer: reviewer,
    chatGptNotes: notes,
    aiApproved: 'yes',
    aiApprovedAssetSha256: `sha256:${assetHash}`,
    aiReviewedAt: reviewedAt,
    aiReviewer: reviewer,
    aiNotes: notes,
  })
}
qa.records = [...qaByGoalId.values()].sort((left, right) => (
  String(left.title ?? '').localeCompare(String(right.title ?? ''), 'de-DE', {
    numeric: true,
    sensitivity: 'base',
  }) || String(left.goalId ?? '').localeCompare(String(right.goalId ?? ''))
))

const reviewRows = [
  `| \`${clusterId}\` | \`accepted_cluster_overview_after_atomic_split\` | ${clusterNotes} Reviewed asset hash: \`sha256:${hashes.oldAcceleratedMotion}\`. Historical prompt preserved byte-for-byte. |`,
  `| \`${acceleratedMotionId}\` | \`accepted_pilot_after_fresh_ai_review\` | ${acceleratedNotes} Reviewed asset hash: \`sha256:${hashes.candidateAcceleratedMotion}\`. |`,
  `| \`${secondLawId}\` | \`accepted_pilot_after_fresh_ai_review\` | ${secondLawNotes} Reviewed asset hash: \`sha256:${hashes.candidateSecondLaw}\`. |`,
  `| \`${velocityChildId}\` | \`deferred_provider_limitation\` | Das neue atomare Ziel erhält kein Ersatzbild, bis Nano Banana Pro eine separat geprüfte Darstellung der Sekanten- und Tangentensteigung liefert. |`,
  ...[...compatibilityAssets].map(([goalId, assetHash]) => (
    `| \`${goalId}\` | \`accepted_pilot_after_fresh_compatibility_review\` | ${compatibilityNotes.get(goalId)} Assetbytes unverändert; reviewed asset hash: \`sha256:${assetHash}\`. |`
  )),
]
const review = `# Physik goal visualization review – Batch 085

Review date: 2026-08-29

Scope: B025 mechanics, energy and momentum visualization compatibility after
the independently adjudicated text revision and one atomic split. Good Google
Gemini / Nano Banana Pro assets are retained unless a demonstrated mismatch
requires correction.

| Goal ID | Decision | Notes |
|---|---|---|
${reviewRows.join('\n')}

The previous \`${acceleratedMotionId}\` image is preserved byte-for-byte as a
reviewed overview on cluster \`${clusterId}\`; it is not discarded or treated
as the narrowed atomic image. The active corrections for \`${acceleratedMotionId}\`
and \`${secondLawId}\` are the exact independently reviewed Nano Banana Pro
candidates bound above. No repository-native substitute was introduced.
`

const plannedFiles: PlannedFile[] = [
  { path: canonicalPath, bytes: jsonBytes(nextCanonical), purpose: 'resource links and deferred child state' },
  { path: qaPath, bytes: jsonBytes(qa), purpose: 'fresh hash-bound visualization QA' },
  { path: reviewPath, bytes: textBytes(review), purpose: 'append-only B025 review evidence', appendOnly: true },
  { path: clusterPaths.canonical, bytes: historicalAcceleratedAsset, purpose: 'preserved e4 cluster overview' },
  { path: clusterPaths.public, bytes: historicalAcceleratedAsset, purpose: 'public e4 cluster overview' },
  { path: clusterPaths.backend, bytes: historicalAcceleratedAsset, purpose: 'backend e4 cluster overview' },
  { path: clusterPaths.prompt, bytes: textBytes(clusterPrompt), purpose: 'cluster overview provenance prompt' },
  { path: historicalAcceleratedPromptPath, bytes: historicalAcceleratedPrompt, purpose: 'byte-exact historical e4 prompt', appendOnly: true },
  { path: acceleratedPaths.canonical, bytes: candidateAcceleratedMotion, purpose: 'corrected e4 canonical NBP image' },
  { path: acceleratedPaths.public, bytes: candidateAcceleratedMotion, purpose: 'corrected e4 public NBP image' },
  { path: acceleratedPaths.backend, bytes: candidateAcceleratedMotion, purpose: 'corrected e4 backend NBP image' },
  { path: acceleratedPaths.prompt, bytes: textBytes(acceleratedPrompt), purpose: 'corrected e4 prompt' },
  { path: secondLawPaths.canonical, bytes: candidateSecondLaw, purpose: 'corrected a94 canonical NBP image' },
  { path: secondLawPaths.public, bytes: candidateSecondLaw, purpose: 'corrected a94 public NBP image' },
  { path: secondLawPaths.backend, bytes: candidateSecondLaw, purpose: 'corrected a94 backend NBP image' },
  { path: secondLawPaths.prompt, bytes: textBytes(secondLawPrompt), purpose: 'corrected a94 prompt' },
  { path: archivedSecondLawAssetPath, bytes: historicalSecondLawAsset, purpose: 'archived a94 predecessor image', appendOnly: true },
  { path: archivedSecondLawPromptPath, bytes: historicalSecondLawPrompt, purpose: 'archived a94 predecessor prompt', appendOnly: true },
  { path: archiveReadmePath, bytes: textBytes(archiveReadme), purpose: 'a94 predecessor archive note', appendOnly: true },
  { path: archiveManifestPath, bytes: jsonBytes(archiveManifest), purpose: 'a94 predecessor archive manifest', appendOnly: true },
  ...[...compatibilityPromptOutputs].map(([goalId, bytes]) => ({
    path: assetPaths(goalId).prompt,
    bytes,
    purpose: `${goalId}: current-description compatibility prompt`,
  })),
  {
    path: thirdLawReconstructionPromptPath,
    bytes: thirdLawReconstructionPromptOutput,
    purpose: 'ad984 current-description image-reconstruction metadata',
  },
]

const outputHashes = Object.fromEntries(plannedFiles.map(({ path, bytes }) => [path, sha256(bytes)]))
const plannedPaths = plannedFiles.map(({ path }) => path)
if (new Set(plannedPaths).size !== plannedPaths.length) {
  throw new Error('B025 visual plan contains duplicate output paths')
}
const planPayload = {
  planContract: 'physics-b025-visual-corrections-plan-v2',
  prerequisiteCanonicalSha256: hashes.canonicalAfterTextSplit,
  candidateArtifacts: {
    acceleratedMotion: {
      generationSourcePath: candidatePaths.acceleratedMotion,
      activeCanonicalPath: acceleratedPaths.canonical,
      sha256: hashes.candidateAcceleratedMotion,
    },
    secondLaw: {
      generationSourcePath: candidatePaths.secondLaw,
      activeCanonicalPath: secondLawPaths.canonical,
      sha256: hashes.candidateSecondLaw,
    },
  },
  preservedPredecessors: {
    acceleratedMotion: hashes.oldAcceleratedMotion,
    acceleratedMotionPrompt: hashes.oldAcceleratedMotionPrompt,
    secondLaw: hashes.oldSecondLaw,
    secondLawPrompt: hashes.oldSecondLawPrompt,
  },
  compatibilityAssets: Object.fromEntries(compatibilityAssets),
  compatibilityPromptInputs: Object.fromEntries(compatibilityPromptHashes),
  thirdLawReconstructionPromptInput: thirdLawReconstructionPromptHash,
  outputs: plannedFiles.map(({ path, purpose, appendOnly }) => ({
    path,
    purpose,
    appendOnly: appendOnly === true,
    sha256: outputHashes[path],
  })),
}
const planSha256 = sha256(jsonBytes(planPayload))
const pendingOutputBindings = plannedFiles.filter(({ path }) => (
  !expectedOutputSha256[path] || expectedOutputSha256[path] === 'PENDING'
))
const mismatchedOutputBindings = plannedFiles.filter(({ path, bytes }) => {
  const expected = expectedOutputSha256[path]
  return expected !== undefined && expected !== 'PENDING' && expected !== sha256(bytes)
})
if (mismatchedOutputBindings.length > 0) {
  throw new Error(`Bound B025 visual output hashes drifted: ${mismatchedOutputBindings.map(({ path }) => path).join(', ')}`)
}
if (expectedPlanSha256 !== 'PENDING' && expectedPlanSha256 !== planSha256) {
  throw new Error(`B025 visual plan drift: ${planSha256} != ${expectedPlanSha256}`)
}

const changed = plannedFiles.filter(({ path, bytes }) => (
  !existsSync(absolute(path)) || !read(path).equals(bytes)
))
for (const { path, bytes, appendOnly } of plannedFiles) {
  if (appendOnly && existsSync(absolute(path)) && !read(path).equals(bytes)) {
    throw new Error(`Append-only B025 review artifact already exists with different bytes: ${path}`)
  }
}

const recognizedPreHashes = new Map<string, string>([
  [canonicalPath, hashes.canonicalAfterTextSplit],
  [qaPath, hashes.qaBeforeVisuals],
  [acceleratedPaths.canonical, hashes.oldAcceleratedMotion],
  [acceleratedPaths.public, hashes.oldAcceleratedMotion],
  [acceleratedPaths.backend, hashes.oldAcceleratedMotion],
  [acceleratedPaths.prompt, hashes.oldAcceleratedMotionPrompt],
  [secondLawPaths.canonical, hashes.oldSecondLaw],
  [secondLawPaths.public, hashes.oldSecondLaw],
  [secondLawPaths.backend, hashes.oldSecondLaw],
  [secondLawPaths.prompt, hashes.oldSecondLawPrompt],
  ...[...compatibilityPromptHashes].map(([goalId, hash]) => (
    [assetPaths(goalId).prompt, hash] as const
  )),
  [thirdLawReconstructionPromptPath, thirdLawReconstructionPromptHash],
])
type PathState = 'missing' | 'pre' | 'output' | 'invalid'
const currentPathStates = new Map<string, PathState>(plannedFiles.map(({ path, bytes }) => {
  if (!existsSync(absolute(path))) return [path, 'missing']
  const actual = fileHash(path)
  if (actual === sha256(bytes)) return [path, 'output']
  const recognizedPreHash = recognizedPreHashes.get(path)
  if (
    recognizedPreHash !== undefined
    && recognizedPreHash !== 'PENDING'
    && actual === recognizedPreHash
  ) return [path, 'pre']
  return [path, 'invalid']
}))
const stateHashBindingsReady = (
  hashes.canonicalAfterTextSplit !== 'PENDING'
  && pendingOutputBindings.length === 0
)
const exactBoundPreState = stateHashBindingsReady && plannedFiles.every(({ path }) => (
  recognizedPreHashes.has(path)
    ? currentPathStates.get(path) === 'pre'
    : currentPathStates.get(path) === 'missing'
))
const exactBoundAppliedState = stateHashBindingsReady && plannedFiles.every(({ path }) => (
  currentPathStates.get(path) === 'output'
))
const recoverablePartialState = stateHashBindingsReady && plannedFiles.every(({ path }) => {
  const state = currentPathStates.get(path)
  return recognizedPreHashes.has(path)
    ? state === 'pre' || state === 'output'
    : state === 'missing' || state === 'output'
}) && !exactBoundPreState && !exactBoundAppliedState
const visualPreState = stateHashBindingsReady ? exactBoundPreState : legacyVisualPreState
const visualAppliedState = exactBoundAppliedState
const visualPartialState = recoverablePartialState
if (
  (!stateHashBindingsReady && !legacyVisualPreState)
  || (stateHashBindingsReady && !visualPreState && !visualAppliedState && !visualPartialState)
) {
  const invalidPaths = [...currentPathStates]
    .filter(([, state]) => state === 'invalid')
    .map(([path]) => path)
  throw new Error(
    'Physics B025 visual state is not exact pre-state, exact applied state, or a safely '
    + `recoverable partial state; invalid=${invalidPaths.join(',') || 'none'}`,
  )
}
const allExecutionBindingsReady = (
  stateHashBindingsReady
  && expectedPlanSha256 !== 'PENDING'
)
if ((writeMode || checkMode) && !allExecutionBindingsReady) {
  throw new Error(
    'Refusing B025 visual write/check while canonical, plan, or output hash bindings remain '
    + `PENDING: outputs=${pendingOutputBindings.length}`,
  )
}
if (checkMode && changed.length > 0) {
  throw new Error(`Physics B025 visual corrections are not exact-current: ${changed.length} output(s) differ`)
}
if (writeMode) {
  if (!visualPreState && !visualPartialState && !visualAppliedState) {
    throw new Error(
      'Refusing B025 visual write outside exact pre-state, exact applied state, or safe partial state',
    )
  }
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  const stagingPath = (path: string): string => `${path}.b025-visual-staging`
  for (const { path, bytes } of changed) {
    const staging = stagingPath(path)
    mkdirSync(dirname(absolute(path)), { recursive: true })
    if (existsSync(absolute(staging))) {
      if (!read(staging).equals(bytes)) throw new Error(`Stale B025 visual staging file: ${staging}`)
    } else {
      writeFileSync(absolute(staging), bytes, { flag: 'wx' })
    }
  }
  const additive = changed.filter(({ path }) => !existsSync(absolute(path)))
  const replacing = changed.filter(({ path }) => existsSync(absolute(path)))
  for (const { path } of [...additive, ...replacing]) {
    const staging = stagingPath(path)
    if (!existsSync(absolute(staging))) throw new Error(`Missing staged B025 visual output: ${staging}`)
    renameSync(absolute(staging), absolute(path))
  }
  for (const { path, bytes } of plannedFiles) {
    if (!existsSync(absolute(path)) || !read(path).equals(bytes)) {
      throw new Error(`Written B025 visual output mismatch: ${path}`)
    }
    const staging = stagingPath(path)
    if (existsSync(absolute(staging))) unlinkSync(absolute(staging))
  }
}

const finalChanged = plannedFiles.filter(({ path, bytes }) => (
  !existsSync(absolute(path)) || !read(path).equals(bytes)
))
const status = writeMode ? 'WRITE' : finalChanged.length === 0 ? 'PASS' : 'PLAN'
const visualState = visualAppliedState
  ? 'applied'
  : visualPartialState
    ? 'recoverable-partial'
    : 'pre-visual'
console.log(
  `CHECK apply_physics_batch025_visual_corrections ${status} `
  + `state=${visualState} outputs=${plannedFiles.length} `
  + `plannedWrites=${finalChanged.length} compatibility=${compatibilityAssets.size} deferred=1`,
)
console.log(`VISUAL_PLAN_SHA256 ${planSha256} binding=${expectedPlanSha256}`)
console.log(`OUTPUT_HASHES ${JSON.stringify(outputHashes)}`)
console.log(
  `PENDING_BINDINGS canonical=${hashes.canonicalAfterTextSplit === 'PENDING' ? 1 : 0} `
  + `plan=${expectedPlanSha256 === 'PENDING' ? 1 : 0} outputs=${pendingOutputBindings.length}`,
)
