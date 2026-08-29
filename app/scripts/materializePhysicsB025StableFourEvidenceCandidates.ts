import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PositiveGoalEvidenceProfile } from './positiveGoalEvidenceProfileModel'

type ReviewRecord = {
  recordId: string
  goalId: string
  decision: 'keep' | 'revise' | 'split_review' | 'block'
  understandingEvidence: {
    essentialUnderstandingDe: string
    essentialUnderstandingEn: string
    observablePerformanceDe: string
    observablePerformanceEn: string
    transferExpectationDe: string
    transferExpectationEn: string
  }
  evidenceProfileContract: string
  evidenceProfileRecommendation: string
  recordStatus: string
  reviewAuthority: string
}

type ParsedReviewRecord = {
  record: ReviewRecord
  digest: string
}

type ProfileDefinition = {
  archetype: PositiveGoalEvidenceProfile['archetype']
  selectionReasonDe: string
  selectionReasonEn: string
  additionalExpectation: PositiveGoalEvidenceProfile['expectations'][number]
  variationAxes: PositiveGoalEvidenceProfile['variationAxes']
  applicationCaseBriefs: PositiveGoalEvidenceProfile['applicationCaseBriefs']
}

type CandidateSet = {
  schemaVersion: 1
  authoringContract: 'positive-understanding-evidence-candidates-v1'
  reviewId: string
  reviewedAt: string
  reviewer: string
  goals: Array<{
    goalId: string
    reason: string
    evidenceLevel: 'E1'
    maximumClaimScope: 'G1'
    dissent: string[]
    profile: PositiveGoalEvidenceProfile
  }>
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const unknownArgs = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unknownArgs.length > 0) throw new Error('Unknown arguments: ' + unknownArgs.join(', '))

const rolloutRoot = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28',
)
const batchName = 'batch-025-e-mechanics-energy-current-20-v1'
const batchDirectory = resolve(rolloutRoot, batchName)
const sourceConfigPath = resolve(rolloutRoot, batchName + '.config.json')
const batchManifestPath = resolve(batchDirectory, 'batch-manifest.json')
const dualSummaryPath = resolve(batchDirectory, 'dual-summary.json')
const adjudicationPath = resolve(batchDirectory, 'third-adjudication/adjudication.json')
const roundARecordsPath = resolve(
  batchDirectory,
  'round-a/results/physik-rollout-v1-batch-025-e-mechanics-energy-'
    + 'current-20-v1-20260828-first-pass-a.batch-001.records.jsonl',
)
const roundARunPath = roundARecordsPath.replace('.records.jsonl', '.run.json')
const roundBRecordsPath = resolve(
  batchDirectory,
  'round-b/results/physik-rollout-v1-batch-025-e-mechanics-energy-'
    + 'current-20-v1-20260828-first-pass-b.batch-001.records.jsonl',
)
const roundBRunPath = roundBRecordsPath.replace('.records.jsonl', '.run.json')
const synthesisManifestPath = resolve(
  batchDirectory,
  'synthesis-decisions.stable-current-carryover-4-v1.json',
)
const resolutionIndexPath = resolve(
  batchDirectory,
  'resolution-index.stable-current-carryover-4-v1.json',
)

const targetStem = (
  'canonical-physics-positive-understanding-evidence-rollout-v1-'
  + 'batch-025-e-mechanics-energy-stable4-current-v1'
)
const targetPath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-evidence/' + targetStem + '.candidates.json',
)
const targetReviewId = 'canonical-physics-positive-evidence-v1-b025-e-mechanics-energy-stable4-v1'

const expectedSourceDigests = {
  config: 'b60924ec6896316c1fb3259370a656e19180d0490620453b5bae342d74c8d1f7',
  batchManifest: '7b92d30ad287b6f9fea4e95297d8e7fe683f9becd14955ca8565da972e65a692',
  dualSummary: '384c0f4cf154cfe9558e3d885e094e396a5290bf75afe9b3b47718645617fb24',
  adjudication: '5351bba08ffbb83590ce530eb9d026dfb35cea1c6d9da8b8adaef4b9c50b0003',
  roundARun: '721e1a263acaa8fca11bc2ff3e5e53d5533fcb636e916aaf2e61d8fef3036650',
  roundARecords: 'ec3e9fc0c6d94c342ff96ee09ea58a98061832cc06976da610aa2ed134a9b5a6',
  roundBRun: '79cc0a73a3c1ff0fdbe17293259722635e073675854c23e1b327c42e73bbadc2',
  roundBRecords: 'f08e7206b82cb6b1fe525463c1e0e7f8f99127d6cd1049f3e3bb43df4dc05793',
  synthesisManifest: 'd99745260ddf18bd4798d439cc34c8e42481cd8a610415213a3282beb055847e',
  resolutionIndex: 'e4dda21c2d39c94bbafe44cfe67ca2d2144c8c0884eddddb37095de4b6d09b63',
} as const

const expectedBatchId = 'physik-rollout-v1-batch-025-e-mechanics-energy-current-20-v1-20260828'
const expectedRoundARunId = 'physik-b025-e-mechanics-energy-current-round-a-gpt-5.6-codex-20260828'
const expectedRoundBRunId = 'physik-b025-round-b-gpt5-20260828'
const expectedBatchGoalIds = [
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
const goalIds = [
  '4a2bf015-052b-4af0-aed7-324259fa1a8a',
  '00245a43-eb89-47d2-92d7-21799dbec9f3',
  '94784e0a-7ddc-48be-91fb-dc82b78eb322',
  '7eeff2de-6015-49a6-a96e-a488d886dc9f',
] as const

const selectedRecordIdByGoalId = new Map<string, string>([
  ['4a2bf015-052b-4af0-aed7-324259fa1a8a', 'physik-b025-a-005'],
  ['00245a43-eb89-47d2-92d7-21799dbec9f3', 'physik-b025-a-011'],
  ['94784e0a-7ddc-48be-91fb-dc82b78eb322', 'physik-b025-a-013'],
  ['7eeff2de-6015-49a6-a96e-a488d886dc9f', 'physik-b025-a-014'],
])

const profileDefinitions = new Map<string, ProfileDefinition>([
  ['4a2bf015-052b-4af0-aed7-324259fa1a8a', {
    archetype: 'modeling',
    selectionReasonDe: 'Der Archetyp modeling passt, weil der belastbare Nachweis eine vollständige Kette aus Situationsabgrenzung, begründeter Modellwahl, Einheitenführung, Parameterabhängigkeit und kriteriumsgebundenem Sicherheitsurteil verlangt. Eine Einzelrechnung genügt nicht; die lernende Person muss insbesondere erkennen, welche Wege in der jeweiligen Gefahrensituation überhaupt verglichen werden dürfen.',
    selectionReasonEn: 'The modeling archetype fits because robust evidence requires a complete chain from defining the situation and justifying a model through handling units and parameter dependence to making a criterion-based safety judgment. A single calculation is insufficient; in particular, the learner must identify which distances may legitimately be compared in the given hazard scenario.',
    additionalExpectation: {
      id: 'relative-gap-requires-a-shared-motion-timeline',
      essentialUnderstandingDe: 'Beim Abstand zu einem ebenfalls bewegten und bremsenden Fahrzeug ist nicht automatisch der volle Anhalteweg des Folgefahrzeugs die relevante Vergleichsgröße, sondern der größte Abbau des Abstands im gemeinsamen Zeitverlauf. Nur in passend begründeten einfachen Fällen lässt er sich als Differenz der Fahrwege bis zum Stillstand bestimmen; eine gesonderte Sicherheitsreserve bleibt erforderlich.',
      essentialUnderstandingEn: 'When following another vehicle that is also moving and braking, the relevant quantity is not automatically the follower\'s full stopping distance but the greatest loss of separation over the shared time history. Only in suitably justified simple cases can this be obtained from the difference between the distances traveled before stopping; a separate safety margin is still required.',
      observablePerformanceDe: 'Die lernende Person stellt für ein festes Hindernis und für ein bremsendes vorausfahrendes Fahrzeug jeweils einen konsistenten Zeit- oder Wegvergleich auf, bestimmt den maximalen Abstandsverlust, prüft einen Anfangsabstand einschließlich Reserve und verwirft die pauschale Gleichsetzung von Folgeabstand und vollständigem Anhalteweg.',
      observablePerformanceEn: 'For both a fixed obstacle and a braking lead vehicle, the learner constructs a consistent time- or distance-based comparison, determines the maximum loss of separation, tests an initial gap including a margin, and rejects the blanket identification of following distance with the follower\'s full stopping distance.',
    },
    variationAxes: [
      {
        id: 'speed-and-reaction-latency',
        textDe: 'Anfangsgeschwindigkeit und Reaktionszeit werden unabhängig verändert, einschließlich korrekter Umrechnung zwischen km/h und m/s.',
        textEn: 'Initial speed and reaction time are varied independently, including correct conversion between km/h and m/s.',
      },
      {
        id: 'effective-braking-conditions',
        textDe: 'Trockene oder nasse Fahrbahn, Gefälle und fahrzeugspezifische effektive Bremsverzögerung verändern den Bremsweg.',
        textEn: 'Dry or wet pavement, downhill grade, and vehicle-specific effective braking deceleration alter braking distance.',
      },
      {
        id: 'hazard-geometry-and-uncertainty',
        textDe: 'Festes Hindernis oder mitbremsendes vorausfahrendes Fahrzeug sowie Punktwerte oder Unsicherheitsintervalle erfordern unterschiedliche Vergleichs- und Reserveentscheidungen.',
        textEn: 'A fixed obstacle or a braking lead vehicle, together with point estimates or uncertainty intervals, requires different comparison and margin decisions.',
      },
    ],
    applicationCaseBriefs: [
      {
        id: 'fixed-obstacle-two-speed-safety-test',
        taskDemandDe: 'Ein Pkw fährt auf ebener trockener Straße entweder 50 km/h oder 100 km/h auf ein plötzlich sichtbares festes Hindernis zu. Verwende t_R = 0,80 s und eine konstante Bremsverzögerung vom Betrag 8,0 m/s². Bestimme für beide Geschwindigkeiten Reaktions-, Brems- und Anhalteweg und bewerte vorgeschlagene Abstände von 30 m beziehungsweise 75 m, wenn zusätzlich mindestens 10 % des modellierten Anhaltewegs als Reserve gefordert werden.',
        taskDemandEn: 'A car travels on a level dry road toward a suddenly visible fixed obstacle at either 50 km/h or 100 km/h. Use t_R = 0.80 s and a constant braking-deceleration magnitude of 8.0 m/s². Determine reaction, braking, and stopping distance at both speeds and evaluate proposed distances of 30 m and 75 m respectively when a margin of at least 10% of the modeled stopping distance is also required.',
        expectedPerformanceDe: 'Die lernende Person rechnet die Geschwindigkeiten in m/s um, verwendet s_R = v t_R und s_B = v²/(2|a_B|), erhält ungefähr 23 m beziehungsweise 70 m ohne Reserve und urteilt daher modellbedingt: 30 m genügen einschließlich 10-%-Reserve, 75 m bei 100 km/h nicht. Sie erklärt, dass die Verdopplung der Geschwindigkeit den Reaktionsweg verdoppelt, den Bremsweg vervierfacht und deshalb den gesamten Anhalteweg nicht bloß verdoppelt.',
        expectedPerformanceEn: 'The learner converts the speeds to m/s, uses s_R = v t_R and s_B = v²/(2|a_B|), obtains approximately 23 m and 70 m without a margin, and therefore concludes within the model that 30 m is sufficient with the 10% margin whereas 75 m at 100 km/h is not. The learner explains that doubling speed doubles reaction distance, quadruples braking distance, and therefore does not merely double total stopping distance.',
        understandingFocusDe: 'Geprüft werden getrennte Skalierung der beiden Phasen, konsistente Einheiten und die Unterscheidung zwischen berechnetem Modellminimum und begründetem Sicherheitsabstand.',
        understandingFocusEn: 'This tests the distinct scaling of the two phases, consistent units, and the distinction between a calculated model minimum and a justified safe distance.',
      },
      {
        id: 'wet-road-following-gap-with-lead-vehicle',
        taskDemandDe: 'Zwei Fahrzeuge fahren zunächst mit 80 km/h und 40 m Abstand. Das vorausfahrende Fahrzeug beginnt bei t = 0 mit 8,0 m/s² zu bremsen. Das Folgefahrzeug fährt wegen einer Reaktionszeit von 1,0 s zunächst unverändert weiter und erreicht auf nasser Fahrbahn anschließend nur 5,0 m/s². Fahrzeuglängen dürfen im Punktmodell vernachlässigt werden. Prüfe, ob der Abstand mit einer zusätzlichen Reserve von 5 m ausreicht, und begründe die richtige Vergleichsgröße.',
        taskDemandEn: 'Two vehicles initially travel at 80 km/h with a 40 m gap. At t = 0 the lead vehicle begins braking at 8.0 m/s². Because of a 1.0 s reaction time, the following vehicle initially continues unchanged and then achieves only 5.0 m/s² on the wet road. Vehicle lengths may be neglected in the point-particle model. Determine whether the gap is sufficient with an additional 5 m margin and justify the correct comparison quantity.',
        expectedPerformanceDe: 'Die lernende Person bestimmt für das vorausfahrende Fahrzeug ungefähr 31 m und für das Folgefahrzeug einschließlich Reaktionsweg ungefähr 72 m Fahrweg. Der Abstand nimmt damit im einfachen monotonen Fall um rund 41 m ab; mit 5 m Reserve wären etwa 46 m erforderlich. Sie verwirft die 40 m und erklärt, warum weder der volle Folgefahrzeug-Anhalteweg noch eine starre Faustregel allein die gesuchte Abstandsbilanz darstellt.',
        expectedPerformanceEn: 'The learner finds approximately 31 m of travel for the lead vehicle and approximately 72 m for the following vehicle including reaction distance. In this simple monotonic case the separation therefore decreases by about 41 m; roughly 46 m would be required with the 5 m margin. The learner rejects the 40 m gap and explains why neither the follower\'s full stopping distance nor a fixed rule of thumb alone represents the required separation balance.',
        understandingFocusDe: 'Geprüft werden relativer Weg, veränderte Bremsbedingungen und die Fehlvorstellung, jeder Folgeabstand müsse schlicht dem vollständigen Anhalteweg des hinteren Fahrzeugs entsprechen.',
        understandingFocusEn: 'This tests relative travel, changed braking conditions, and the misconception that every following gap is simply the rear vehicle\'s full stopping distance.',
      },
    ],
  }],
  ['00245a43-eb89-47d2-92d7-21799dbec9f3', {
    archetype: 'concept',
    selectionReasonDe: 'Der Archetyp concept passt, weil der zentrale Nachweis nicht in einer Rechenroutine, sondern in einem physikalisch tragfähigen Kriterium für Inertialität und einer konsistenten Trennung von realen Wechselwirkungskräften und bezugssystembedingten Scheinkräften besteht. Unterschiedliche Darstellungen müssen auf dasselbe Urteil führen.',
    selectionReasonEn: 'The concept archetype fits because the central evidence is not a calculation routine but a physically sound criterion for inertiality and a consistent distinction between real interaction forces and frame-dependent fictitious forces. Different representations must support the same judgment.',
    additionalExpectation: {
      id: 'inertiality-is-not-rest-and-fictitious-forces-are-frame-terms',
      essentialUnderstandingDe: 'Ruhe relativ zu einem Bezugssystem ist kein Kriterium für dessen Inertialität: Bezugssysteme, die sich geradlinig gleichförmig gegeneinander bewegen, sind gleichermaßen inertial. In einem beschleunigten oder rotierenden System kann die Newtonsche Form weiterverwendet werden, wenn passende Scheinkräfte ergänzt werden; diese beschreiben die Beschleunigung des Bezugssystems und keine zusätzliche physische Wechselwirkung mit einem Kraftpartner.',
      essentialUnderstandingEn: 'Being at rest relative to a frame is not a criterion for that frame\'s inertiality: frames moving uniformly in a straight line relative to one another are equally inertial. Newtonian form can still be used in an accelerating or rotating frame if appropriate fictitious forces are added; these represent the acceleration of the frame rather than an additional physical interaction with a force partner.',
      observablePerformanceDe: 'Die lernende Person verbindet Bahn- oder Beschleunigungsdaten mit Kraftbildern, erkennt mehrere gleichförmig gegeneinander bewegte Systeme als inertial, kennzeichnet in einem nicht inertialen System reale und Scheinkräfte getrennt und widerlegt Begründungen wie „Der Körper ruht hier, also ist dieses System inertial“ oder „Die Zentrifugalkraft ist eine reale Kraft nach außen“.',
      observablePerformanceEn: 'The learner connects trajectory or acceleration data with force diagrams, recognizes multiple uniformly moving frames as inertial, labels real and fictitious forces separately in a non-inertial frame, and refutes arguments such as "the body is at rest here, so this frame is inertial" or "centrifugal force is a real outward interaction force."',
    },
    variationAxes: [
      {
        id: 'frame-motion',
        textDe: 'Das betrachtete System bewegt sich geradlinig gleichförmig, linear beschleunigt oder rotiert.',
        textEn: 'The observed frame moves uniformly in a straight line, accelerates linearly, or rotates.',
      },
      {
        id: 'test-body-interaction-state',
        textDe: 'Der Testkörper ist kräftefrei, steht in realem Kontakt oder wird durch eine Führung auf einer gekrümmten Bahn gehalten.',
        textEn: 'The test body is force-free, subject to a real contact interaction, or constrained to a curved path.',
      },
      {
        id: 'evidence-representation',
        textDe: 'Die Inertialität ist aus einer Bahnkurve, Beschleunigungsmessung oder einem Kraftdiagramm zu beurteilen.',
        textEn: 'Inertiality must be judged from a trajectory, acceleration measurement, or force diagram.',
      },
    ],
    applicationCaseBriefs: [
      {
        id: 'coasting-then-accelerating-railcar',
        taskDemandDe: 'Ein nahezu reibungsfreier Puck liegt auf einem horizontalen Luftkissentisch in einem Eisenbahnwagen. Der Wagen fährt zunächst geradlinig mit konstant 20 m/s und beschleunigt später mit 2,0 m/s². Beschreibe die Bewegung des freigegebenen Pucks vom Bahnsteig und vom Wagen aus, entscheide in beiden Phasen über die Inertialität der Systeme und zeichne die jeweils nötige horizontale Kraftbilanz.',
        taskDemandEn: 'A nearly frictionless puck rests on a horizontal air table inside a railcar. The railcar initially moves in a straight line at a constant 20 m/s and later accelerates at 2.0 m/s². Describe the released puck\'s motion from the platform and the railcar, decide which frames are inertial in each phase, and draw the required horizontal force balance in each description.',
        expectedPerformanceDe: 'Die lernende Person erkennt den Bahnsteig im Modell und den gleichförmig fahrenden Wagen als Inertialsysteme: Der horizontal kräftefreie Puck bewegt sich jeweils geradlinig gleichförmig beziehungsweise ruht relativ zum Wagen. Während der Wagenbeschleunigung bleibt der Puck im Bahnsteigsystem ohne horizontale Kraft gleichförmig, erscheint im Wagensystem aber rückwärts beschleunigt; dort ist für die Newtonsche Bilanz eine Scheinkraft −m a_Wagen einzuführen, keine reale rückwärts gerichtete Wechselwirkung.',
        expectedPerformanceEn: 'The learner recognizes the modeled platform frame and the uniformly moving railcar as inertial: the horizontally force-free puck moves uniformly in a straight line or remains at rest relative to the railcar. During railcar acceleration, the puck continues uniformly without a horizontal force in the platform frame but appears to accelerate backward in the railcar frame; Newtonian bookkeeping there requires a fictitious force −m a_car rather than a real backward interaction.',
        understandingFocusDe: 'Geprüft werden das kräftefreie Testkörperkriterium, die Gleichwertigkeit gleichförmig gegeneinander bewegter Inertialsysteme und die Fehlvorstellung, relative Ruhe beweise Inertialität.',
        understandingFocusEn: 'This tests the force-free test-body criterion, the equivalence of uniformly moving inertial frames, and the misconception that relative rest proves inertiality.',
      },
      {
        id: 'released-object-in-a-rotating-habitat',
        taskDemandDe: 'Ein kleiner Körper wird in einem gleichförmig rotierenden Habitat zunächst durch eine radiale Führung mitgeführt und dann freigegeben. Vergleiche seine Bahn unmittelbar vor und nach der Freigabe für eine außen ruhende, idealisiert inertiale Kamera und für eine mitrotierende Beobachterin. Ordne alle benötigten Kräfte als reale Wechselwirkungs- oder Scheinkräfte ein.',
        taskDemandEn: 'A small object in a uniformly rotating habitat is initially carried by a radial guide and then released. Compare its path immediately before and after release for an external, idealized inertial camera and for a co-rotating observer. Classify every required force as either a real interaction force or a fictitious force.',
        expectedPerformanceDe: 'Die lernende Person identifiziert vor der Freigabe die reale Führungskraft als Ursache der zum Rotationszentrum gerichteten Beschleunigung. Nach der Freigabe bewegt sich der Körper im Inertialsystem ohne diese horizontale Kraft zunächst tangential geradlinig. Im rotierenden System erscheint die Bahn gekrümmt und wird mit Zentrifugal- und, bei relativer Bewegung, Coriolistermen beschrieben; daraus wird keine reale nach außen wirkende Kontaktkraft erfunden.',
        expectedPerformanceEn: 'Before release, the learner identifies the real guide force as the cause of acceleration toward the rotation axis. After release, without that horizontal force, the object initially travels tangentially in a straight line in the inertial frame. In the rotating frame the path appears curved and is described using centrifugal and, when relative motion is present, Coriolis terms; no real outward contact force is invented.',
        understandingFocusDe: 'Geprüft werden rotierende Nicht-Inertialsysteme, der Wechsel zwischen zwei konsistenten Beschreibungen und die Trennung von realer Zwangskraft und Scheinkraft.',
        understandingFocusEn: 'This tests rotating non-inertial frames, the transition between two consistent descriptions, and the distinction between a real constraint force and a fictitious force.',
      },
    ],
  }],
  ['94784e0a-7ddc-48be-91fb-dc82b78eb322', {
    archetype: 'concept',
    selectionReasonDe: 'Der Archetyp concept passt, weil die fachliche Schwierigkeit in der Bedeutung der Energiesumme, der expliziten System- und Bezugswahl und der Abgrenzung zwischen Definition und Erhaltung liegt. Rechnungen dienen als Nachweis dieser Unterscheidungen und dürfen sie nicht durch ein bloßes Einsetzschema ersetzen.',
    selectionReasonEn: 'The concept archetype fits because the central difficulty lies in the meaning of the energy sum, the explicit choice of system and reference, and the distinction between defining mechanical energy and asserting its conservation. Calculations provide evidence for those distinctions and must not replace them with mere substitution.',
    additionalExpectation: {
      id: 'potential-zero-shifts-values-not-physical-predictions',
      essentialUnderstandingDe: 'Das Nullniveau einer potenziellen Energie ist eine konsistent zu verwendende Konvention. Wird zu allen Zuständen derselben potenziellen Energie dieselbe Konstante addiert, verschieben sich deren absolute Werte und die mechanische Energiesumme, nicht aber Energieunterschiede, daraus berechnete Geschwindigkeiten oder Umkehrpunkte; ein unbemerkter Wechsel des Nullniveaus zwischen Zuständen ist dagegen unzulässig.',
      essentialUnderstandingEn: 'The zero level of a potential energy is a convention that must be used consistently. Adding the same constant to that potential energy in every state shifts its absolute values and the mechanical-energy sum but not energy differences, predicted speeds, or turning points; silently changing the zero level between states is invalid.',
      observablePerformanceDe: 'Die lernende Person bilanziert dieselbe Bewegung mit zwei verschiedenen Nullniveaus, weist die konstante Verschiebung der absoluten Energiewerte nach, erhält identische Energieunterschiede und Bewegungsvorhersagen und erkennt eine Rechnung, die zwei Bezugsniveaus inkonsistent vermischt.',
      observablePerformanceEn: 'The learner accounts for the same motion using two different zero levels, demonstrates the constant shift in absolute energy values, obtains identical energy differences and motion predictions, and identifies a calculation that inconsistently mixes two reference levels.',
    },
    variationAxes: [
      {
        id: 'included-energy-stores',
        textDe: 'Die mechanische Energiesumme enthält gravitative, elastische oder beide potenzielle Energieformen zusammen mit kinetischer Energie.',
        textEn: 'The mechanical-energy sum includes gravitational potential energy, elastic potential energy, or both together with kinetic energy.',
      },
      {
        id: 'system-boundary-and-transfer',
        textDe: 'Konservative Wechselwirkungen liegen innerhalb des Systems oder Reibung beziehungsweise äußere Arbeit überträgt Energie über die gewählte Grenze.',
        textEn: 'Conservative interactions lie within the system, or friction or external work transfers energy across the chosen boundary.',
      },
      {
        id: 'reference-and-representation',
        textDe: 'Nullniveau und Darstellung wechseln zwischen Energietabelle, Balkenbilanz und Energie-Zustandsdiagramm.',
        textEn: 'The zero level and representation vary among an energy table, bar-chart accounting, and an energy-state diagram.',
      },
    ],
    applicationCaseBriefs: [
      {
        id: 'frictionless-track-with-two-height-zeroes',
        taskDemandDe: 'Ein Wagen bewegt sich reibungsfrei unter dem Einfluss der Schwerkraft von Punkt A bei h = 3,0 m und gegebener Anfangsgeschwindigkeit zu Punkt B bei h = 1,0 m. Stelle die kinetische, gravitative potenzielle und mechanische Energie an beiden Punkten einmal mit h = 0 als Nullniveau und einmal mit h = 5,0 m als Nullniveau dar. Bestimme in beiden Konventionen die Geschwindigkeit bei B.',
        taskDemandEn: 'A cart moves frictionlessly under gravity from point A at h = 3.0 m with a given initial speed to point B at h = 1.0 m. Represent kinetic, gravitational potential, and mechanical energy at both points first using h = 0 as the zero level and then using h = 5.0 m as the zero level. Determine the speed at B under both conventions.',
        expectedPerformanceDe: 'Die lernende Person legt Wagen und Erde als mechanisches System offen, verschiebt beim zweiten Nullniveau beide potenziellen Energien und beide mechanischen Energiesummen um dieselbe Konstante, lässt die kinetischen Energien unverändert und erhält aus identischen Energiedifferenzen dieselbe Geschwindigkeit bei B. Negative Werte der potenziellen oder mechanischen Energie im zweiten Bezug werden nicht als physikalischer Fehler oder als negative „Energiemenge“ missdeutet.',
        expectedPerformanceEn: 'The learner explicitly chooses the cart and Earth as the mechanical system, shifts both potential-energy values and both mechanical-energy sums by the same constant under the second zero convention, leaves kinetic energies unchanged, and obtains the same speed at B from identical energy differences. Negative potential or mechanical energy values under the second reference are not misread as a physical error or as a negative "amount of energy."',
        understandingFocusDe: 'Geprüft werden konsistente Bezugswahl, die physikalische Bedeutung von Energiedifferenzen und die Fehlvorstellung, ein anderes Nullniveau ändere die Bewegung.',
        understandingFocusEn: 'This tests consistent reference choice, the physical significance of energy differences, and the misconception that a different zero level changes the motion.',
      },
      {
        id: 'spring-cart-crossing-a-rough-section',
        taskDemandDe: 'Ein Wagen wird von einer gespannten Feder gestartet, durchquert einen rauen horizontalen Abschnitt und fährt anschließend eine glatte Rampe hinauf. Für Federkonstante, Kompression, Masse und die auf dem rauen Abschnitt übertragene Reibungsenergie liegen Daten vor. Lege ein System fest, bilanziere die mechanischen Energieanteile in drei Zuständen und erkläre, unter welchen Bedingungen die mechanische Energie gleich bleibt oder abnimmt.',
        taskDemandEn: 'A cart is launched by a compressed spring, crosses a rough horizontal section, and then climbs a smooth ramp. Data are provided for spring constant, compression, mass, and the energy transferred by friction on the rough section. Define a system, account for the mechanical-energy contributions in three states, and explain when mechanical energy remains constant or decreases.',
        expectedPerformanceDe: 'Die lernende Person benennt Feder-, kinetische und gravitative Energie nur dort, wo sie zur gewählten Systemgrenze gehören. Auf glatten Abschnitten bilanziert sie deren Umwandlung; über den rauen Abschnitt weist sie die Abnahme der mechanischen Energie als Übertragung in innere beziehungsweise thermische Energie aus. Sie schließt weder aus der Definition der mechanischen Energie auf Erhaltung noch aus ihrer Abnahme auf die Vernichtung von Gesamtenergie.',
        expectedPerformanceEn: 'The learner includes elastic, kinetic, and gravitational energy only where they belong to the chosen system boundary. On smooth sections the learner accounts for their conversion; across the rough section the decrease in mechanical energy is identified as transfer into internal or thermal energy. The learner infers neither conservation from the definition of mechanical energy nor destruction of total energy from a decrease in mechanical energy.',
        understandingFocusDe: 'Geprüft werden Systemgrenze, Auswahl der Energieanteile und die strikte Trennung zwischen mechanischer Energie, ihrer möglichen Erhaltung und vollständiger Energiebilanz.',
        understandingFocusEn: 'This tests the system boundary, selection of energy contributions, and the strict distinction among mechanical energy, its possible conservation, and complete energy accounting.',
      },
    ],
  }],
  ['7eeff2de-6015-49a6-a96e-a488d886dc9f', {
    archetype: 'concept',
    selectionReasonDe: 'Der Archetyp concept passt, weil der belastbare Nachweis über das Ausrechnen von 1/2 m v² hinausgeht: Entscheidend sind quadratische Skalierung, inverse Vergleichsschlüsse, Skalarität und Bezugssystemabhängigkeit. Die Zahlenbeispiele dienen dazu, diese Beziehungen und nicht lediglich Formelabruf sichtbar zu machen.',
    selectionReasonEn: 'The concept archetype fits because robust evidence goes beyond evaluating 1/2 m v²: the decisive elements are quadratic scaling, inverse comparative reasoning, scalar character, and reference-frame dependence. Numerical examples make those relationships visible rather than merely testing formula recall.',
    additionalExpectation: {
      id: 'equal-energy-does-not-fix-mass-or-speed',
      essentialUnderstandingDe: 'Gleiche kinetische Energie legt weder Masse noch Geschwindigkeit einzeln fest, sondern nur das Produkt m v². Daher können Körper mit verschiedenen Massen und Geschwindigkeiten dieselbe kinetische Energie besitzen; aus einem Energievergleich allein darf ohne weitere Angabe nicht auf gleiche Geschwindigkeit geschlossen werden.',
      essentialUnderstandingEn: 'Equal kinetic energy determines neither mass nor speed separately but only the product m v². Bodies with different masses and speeds can therefore have the same kinetic energy, and equal speed cannot be inferred from an energy comparison alone without additional information.',
      observablePerformanceDe: 'Die lernende Person erzeugt oder vervollständigt unterschiedliche Masse-Geschwindigkeit-Paare mit gleicher kinetischer Energie, begründet die nötige Änderung über Verhältnisse oder eine E_k-v-Darstellung und widerlegt die Behauptung, gleiche kinetische Energie bedeute gleiche Geschwindigkeit.',
      observablePerformanceEn: 'The learner generates or completes different mass-speed pairs with equal kinetic energy, justifies the required change using ratios or an E_k-versus-v representation, and refutes the claim that equal kinetic energy means equal speed.',
    },
    variationAxes: [
      {
        id: 'mass-speed-combination',
        textDe: 'Masse und Geschwindigkeitsbetrag werden einzeln oder gekoppelt verändert, einschließlich Fällen gleicher Energie bei ungleichen Größen.',
        textEn: 'Mass and speed are varied separately or jointly, including equal-energy cases with unequal quantities.',
      },
      {
        id: 'direction-and-reference-frame',
        textDe: 'Die Bewegungsrichtung wird bei gleichem Betrag umgekehrt oder dieselbe Bewegung wird aus unterschiedlich bewegten Bezugssystemen beschrieben.',
        textEn: 'Direction is reversed at unchanged speed, or the same motion is described from differently moving reference frames.',
      },
      {
        id: 'evidence-form',
        textDe: 'Der Zusammenhang ist symbolisch über Verhältnisse, numerisch in SI-Einheiten oder grafisch als E_k-v-Beziehung nachzuweisen.',
        textEn: 'The relationship must be demonstrated symbolically using ratios, numerically in SI units, or graphically as an E_k-versus-v relation.',
      },
    ],
    applicationCaseBriefs: [
      {
        id: 'different-mass-speed-pairs-with-equal-energy',
        taskDemandDe: 'Vergleiche einen Wagen der Masse 1000 kg bei 10 m/s mit einem Fahrzeug der Masse 250 kg bei 20 m/s. Berechne beide kinetischen Energien, erkläre das Ergebnis über Masse- und Geschwindigkeitsverhältnisse und untersuche anschließend getrennt, was eine Verdopplung nur der Masse beziehungsweise nur der Geschwindigkeit bewirken würde.',
        taskDemandEn: 'Compare a 1000 kg car traveling at 10 m/s with a 250 kg vehicle traveling at 20 m/s. Calculate both kinetic energies, explain the result using mass and speed ratios, and then examine separately what would happen if only mass or only speed were doubled.',
        expectedPerformanceDe: 'Die lernende Person erhält für beide Fahrzeuge 50 kJ und erklärt, dass die vierfach größere Masse des ersten Fahrzeugs durch das Quadrat der doppelt so großen Geschwindigkeit des zweiten ausgeglichen wird. Sie folgert korrekt: doppelte Masse verdoppelt E_k, doppelte Geschwindigkeit vervierfacht E_k; gleiche Energie beweist weder gleiche Masse noch gleiche Geschwindigkeit.',
        expectedPerformanceEn: 'The learner obtains 50 kJ for both vehicles and explains that the first vehicle\'s fourfold larger mass is offset by the square of the second vehicle\'s twofold larger speed. The learner correctly concludes that doubling mass doubles E_k while doubling speed quadruples E_k, and that equal energy proves neither equal mass nor equal speed.',
        understandingFocusDe: 'Geprüft werden inverse Verhältnisargumente und die Fehlvorstellungen, kinetische Energie sei linear in v oder gleiche Energie bedeute gleiche Geschwindigkeit.',
        understandingFocusEn: 'This tests inverse ratio reasoning and the misconceptions that kinetic energy is linear in v or that equal energy implies equal speed.',
      },
      {
        id: 'forward-and-backward-throw-in-a-moving-train',
        taskDemandDe: 'Ein Zug fährt im Bodensystem mit 15 m/s. Ein Ball der Masse 0,20 kg wird im Zug einmal mit 5,0 m/s in Fahrtrichtung und einmal mit 5,0 m/s entgegen der Fahrtrichtung geworfen. Bestimme für beide Würfe die kinetische Energie im Zugsystem und im Bodensystem und erkläre, welche Rolle Richtung und Bezugssystem spielen.',
        taskDemandEn: 'A train moves at 15 m/s in the ground frame. A 0.20 kg ball is thrown inside the train once at 5.0 m/s in the direction of travel and once at 5.0 m/s opposite the direction of travel. Determine the kinetic energy for both throws in the train frame and in the ground frame, and explain the roles of direction and reference frame.',
        expectedPerformanceDe: 'Die lernende Person erhält im Zugsystem für die Geschwindigkeiten +5,0 m/s und −5,0 m/s jeweils 2,5 J: Eine Richtungsumkehr bei gleichem Betrag erzeugt keine negative oder andere kinetische Energie. Im Bodensystem verwendet sie 20 m/s beziehungsweise 10 m/s und erhält 40 J beziehungsweise 10 J. Sie erklärt, dass E_k zwar skalar und nicht negativ ist, der benötigte Geschwindigkeitsbetrag aber vom gewählten Bezugssystem abhängt.',
        expectedPerformanceEn: 'In the train frame, the learner obtains 2.5 J for both +5.0 m/s and −5.0 m/s: reversing direction at unchanged speed produces neither negative nor different kinetic energy. In the ground frame the learner uses 20 m/s and 10 m/s and obtains 40 J and 10 J respectively. The learner explains that although E_k is scalar and non-negative, the required speed depends on the chosen reference frame.',
        understandingFocusDe: 'Geprüft werden Skalarität, Nichtnegativität und Bezugssystemabhängigkeit sowie die Fehlvorstellungen, eine negative Geschwindigkeitskomponente erzeuge negative kinetische Energie oder Energie sei bezugssysteminvariant.',
        understandingFocusEn: 'This tests scalar character, non-negativity, and reference-frame dependence, including the misconceptions that a negative velocity component produces negative kinetic energy or that kinetic energy is frame-invariant.',
      },
    ],
  }],
])

const sha256 = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')
const prefixedSha256 = (value: Buffer | string): string => 'sha256:' + sha256(value)
const jsonBytes = (value: unknown): Buffer => Buffer.from(JSON.stringify(value, null, 2) + '\n')
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)

const parseJsonl = (bytes: Buffer): ParsedReviewRecord[] => bytes.toString('utf8').trim().split('\n')
  .filter(Boolean)
  .map((line) => ({
    record: JSON.parse(line) as ReviewRecord,
    digest: prefixedSha256(line),
  }))

const readOptional = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}

const main = async (): Promise<void> => {
  const [
    configBytes,
    batchManifestBytes,
    dualSummaryBytes,
    adjudicationBytes,
    roundARunBytes,
    roundARecordsBytes,
    roundBRunBytes,
    roundBRecordsBytes,
    synthesisManifestBytes,
    resolutionIndexBytes,
  ] = await Promise.all([
    readFile(sourceConfigPath),
    readFile(batchManifestPath),
    readFile(dualSummaryPath),
    readFile(adjudicationPath),
    readFile(roundARunPath),
    readFile(roundARecordsPath),
    readFile(roundBRunPath),
    readFile(roundBRecordsPath),
    readFile(synthesisManifestPath),
    readFile(resolutionIndexPath),
  ])
  const boundSources = {
    config: configBytes,
    batchManifest: batchManifestBytes,
    dualSummary: dualSummaryBytes,
    adjudication: adjudicationBytes,
    roundARun: roundARunBytes,
    roundARecords: roundARecordsBytes,
    roundBRun: roundBRunBytes,
    roundBRecords: roundBRecordsBytes,
    synthesisManifest: synthesisManifestBytes,
    resolutionIndex: resolutionIndexBytes,
  }
  for (const [name, bytes] of Object.entries(boundSources)) {
    const expected = expectedSourceDigests[name as keyof typeof expectedSourceDigests]
    const actual = sha256(bytes)
    if (actual !== expected) {
      throw new Error('Physics B025 stable-four evidence source drift: ' + name + ': ' + actual + ' != ' + expected)
    }
  }

  const sourceConfig = JSON.parse(configBytes.toString('utf8')) as {
    batchId?: string
    subject?: string
    goalIds?: string[]
  }
  const batchManifest = JSON.parse(batchManifestBytes.toString('utf8')) as {
    batchId?: string
    subject?: string
    goalIds?: string[]
  }
  const roundARun = JSON.parse(roundARunBytes.toString('utf8')) as {
    runId?: string
    status?: string
    goalIds?: string[]
  }
  const roundBRun = JSON.parse(roundBRunBytes.toString('utf8')) as {
    runId?: string
    status?: string
    goalIds?: string[]
  }
  const dualSummary = JSON.parse(dualSummaryBytes.toString('utf8')) as {
    goalCount?: number
    goals?: Array<{
      goalId: string
      agreement: string
      firstRecordId: string
      secondRecordId: string
      firstRunId: string
      secondRunId: string
      firstDecision: string
      secondDecision: string
      requiresSynthesis: boolean
      automaticAcceptance: boolean
    }>
  }
  const adjudication = JSON.parse(adjudicationBytes.toString('utf8')) as {
    batchId?: string
    campaignGoalCount?: number
    resolvedGoalCount?: number
    decisions?: Array<{
      goalId: string
      roundA: { recordId: string; decision: string }
      roundB: { recordId: string; decision: string }
      resolutionDecision: string
    }>
  }
  const synthesisManifest = JSON.parse(synthesisManifestBytes.toString('utf8')) as {
    decisions?: Array<{
      goalId: string
      effectiveSemanticKind: string
      resolutionDecision: string
      evidenceRound: string
      records: {
        first: { recordId: string; recordDigest: string }
        second: { recordId: string; recordDigest: string }
      }
    }>
  }
  const resolutionIndex = JSON.parse(resolutionIndexBytes.toString('utf8')) as {
    subject?: string
    semanticKind?: string
    strictDescriptionReviewCompleteCount?: number
    resolutions?: Array<{
      goalId: string
      groupId: string
      decision: string
      strictDescriptionComplete: boolean
    }>
  }

  if (
    sourceConfig.batchId !== expectedBatchId
    || sourceConfig.subject !== 'physik'
    || !sameOrdered(sourceConfig.goalIds ?? [], expectedBatchGoalIds)
    || batchManifest.batchId !== expectedBatchId
    || batchManifest.subject !== 'physik'
    || !sameOrdered(batchManifest.goalIds ?? [], expectedBatchGoalIds)
  ) {
    throw new Error('Physics B025 stable-four evidence config or batch manifest scope is invalid')
  }
  if (
    roundARun.runId !== expectedRoundARunId
    || roundARun.status !== 'completed'
    || !sameOrdered(roundARun.goalIds ?? [], expectedBatchGoalIds)
    || roundBRun.runId !== expectedRoundBRunId
    || roundBRun.status !== 'completed'
    || !sameOrdered(roundBRun.goalIds ?? [], expectedBatchGoalIds)
  ) {
    throw new Error('Physics B025 stable-four evidence run binding is invalid')
  }
  if (
    dualSummary.goalCount !== expectedBatchGoalIds.length
    || dualSummary.goals?.length !== expectedBatchGoalIds.length
    || adjudication.batchId !== expectedBatchId
    || adjudication.campaignGoalCount !== expectedBatchGoalIds.length
    || adjudication.resolvedGoalCount !== 0
    || adjudication.decisions?.length !== expectedBatchGoalIds.length
    || synthesisManifest.decisions?.length !== goalIds.length
    || resolutionIndex.subject !== 'Physik'
    || resolutionIndex.semanticKind !== 'curricularAtomic'
    || resolutionIndex.strictDescriptionReviewCompleteCount !== goalIds.length
    || resolutionIndex.resolutions?.length !== goalIds.length
    || !sameOrdered(resolutionIndex.resolutions.map(({ goalId }) => goalId), goalIds)
    || resolutionIndex.resolutions.some((resolution) => (
      resolution.groupId !== expectedBatchId
      || resolution.decision !== 'keep_current'
      || resolution.strictDescriptionComplete !== true
    ))
    || selectedRecordIdByGoalId.size !== goalIds.length
    || profileDefinitions.size !== goalIds.length
  ) {
    throw new Error('Physics B025 stable-four evidence synthesis or index scope is invalid')
  }

  const rounds = {
    first: parseJsonl(roundARecordsBytes),
    second: parseJsonl(roundBRecordsBytes),
  }
  if (rounds.first.length !== expectedBatchGoalIds.length || rounds.second.length !== expectedBatchGoalIds.length) {
    throw new Error('Physics B025 stable-four evidence record count is invalid')
  }

  const candidates: CandidateSet['goals'] = goalIds.map((goalId) => {
    const selectedRecordId = selectedRecordIdByGoalId.get(goalId)
    const definition = profileDefinitions.get(goalId)
    const summary = dualSummary.goals?.find((goal) => goal.goalId === goalId)
    const adjudicationDecision = adjudication.decisions?.find((decision) => decision.goalId === goalId)
    const manifestDecision = synthesisManifest.decisions?.find((decision) => decision.goalId === goalId)
    const selected = rounds.first.find(({ record }) => record.goalId === goalId)
    const alternate = rounds.second.find(({ record }) => record.goalId === goalId)
    if (
      !selectedRecordId
      || !definition
      || !summary
      || !adjudicationDecision
      || !manifestDecision
      || !selected
      || !alternate
    ) {
      throw new Error(goalId + ': missing B025 evidence selection or bound source')
    }
    if (
      summary.agreement !== 'disagreement'
      || summary.firstRecordId !== selected.record.recordId
      || summary.secondRecordId !== alternate.record.recordId
      || summary.firstRunId !== expectedRoundARunId
      || summary.secondRunId !== expectedRoundBRunId
      || summary.firstDecision !== 'keep'
      || summary.secondDecision !== 'keep'
      || summary.requiresSynthesis !== true
      || summary.automaticAcceptance !== false
      || adjudicationDecision.roundA.recordId !== selected.record.recordId
      || adjudicationDecision.roundA.decision !== 'keep'
      || adjudicationDecision.roundB.recordId !== alternate.record.recordId
      || adjudicationDecision.roundB.decision !== 'keep'
      || adjudicationDecision.resolutionDecision !== 'keep_current'
      || manifestDecision.effectiveSemanticKind !== 'curricularAtomic'
      || manifestDecision.resolutionDecision !== 'keep_current'
      || manifestDecision.evidenceRound !== 'first'
      || manifestDecision.records.first.recordId !== selected.record.recordId
      || manifestDecision.records.first.recordDigest !== selected.digest
      || manifestDecision.records.second.recordId !== alternate.record.recordId
      || manifestDecision.records.second.recordDigest !== alternate.digest
      || selected.record.recordId !== selectedRecordId
    ) {
      throw new Error(goalId + ': evidence selection disagrees with the bound B025 sources')
    }
    for (const [label, parsed] of [['selected', selected], ['alternate', alternate]] as const) {
      const record = parsed.record
      if (
        record.decision !== 'keep'
        || record.evidenceProfileContract !== 'positive-understanding-evidence-v2'
        || record.evidenceProfileRecommendation !== 'create'
        || record.recordStatus !== 'candidate'
        || record.reviewAuthority !== 'ai_candidate'
      ) {
        throw new Error(goalId + ': ' + label + ' B025 source record is not a valid KEEP V2 AI candidate')
      }
    }
    if (
      definition.variationAxes.length !== 3
      || definition.applicationCaseBriefs.length !== 2
      || definition.additionalExpectation.id === 'selected-blind-review-core'
    ) {
      throw new Error(goalId + ': profile definition must contain one additional expectation, three axes, and two cases')
    }

    const reviewedCore = {
      id: 'selected-blind-review-core',
      essentialUnderstandingDe: selected.record.understandingEvidence.essentialUnderstandingDe,
      essentialUnderstandingEn: selected.record.understandingEvidence.essentialUnderstandingEn,
      observablePerformanceDe: selected.record.understandingEvidence.observablePerformanceDe,
      observablePerformanceEn: selected.record.understandingEvidence.observablePerformanceEn,
    }
    const expectations = [reviewedCore, definition.additionalExpectation]
    const profile: PositiveGoalEvidenceProfile = {
      archetype: definition.archetype,
      expectations,
      coverageExpectations: {
        requiredExpectationIds: expectations.map(({ id }) => id),
        alternativeExpectationGroups: [],
        minimumIndependentDemonstrations: 2,
        freshVariationRequired: true,
        independentTransferRequired: true,
      },
      variationAxes: definition.variationAxes,
      applicationCaseBriefs: definition.applicationCaseBriefs,
    }
    return {
      goalId,
      reason: 'DE: ' + definition.selectionReasonDe
        + ' Das Profil übernimmt den Kernblock bytegetreu aus ' + selected.record.recordId
        + ', operationalisiert ihn in zwei unabhängigen frischen Fällen und bindet die kompatible Round-B-Fassung als Dissent. EN: '
        + definition.selectionReasonEn
        + ' The profile carries the core block byte-for-byte from ' + selected.record.recordId
        + ', operationalizes it in two independent fresh cases, and binds the compatible Round B formulation as dissent.',
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: [
        'B025 evidence-formulation dissent remains bound: selected Round A record '
          + selected.record.recordId + ' (' + selected.digest + '); compatible Round B record '
          + alternate.record.recordId + ' (' + alternate.digest
          + ') and its complete bilingual essential-understanding, observable-performance, and transfer blocks '
          + 'remain preserved in the exact dual summary, synthesis, and resolution-index binding.',
      ],
      profile,
    }
  })

  const output: CandidateSet = {
    schemaVersion: 1,
    authoringContract: 'positive-understanding-evidence-candidates-v1',
    reviewId: targetReviewId,
    reviewedAt: '2026-08-29T12:00:00.000Z',
    reviewer: 'codex-physics-b025-stable4-positive-evidence-candidate-2026-08-29',
    goals: candidates,
  }
  const bytes = jsonBytes(output)
  const current = await readOptional(targetPath)
  if (current && !current.equals(bytes)) {
    throw new Error('Existing Physics B025 stable-four evidence candidates are stale: ' + targetPath)
  }
  if (!current && !write) {
    throw new Error('Missing Physics B025 stable-four evidence candidates: ' + targetPath)
  }
  if (!current && write) await writeFile(targetPath, bytes, { flag: 'wx' })
  console.log(
    (write ? 'Materialized' : 'Verified')
      + ' Physics B025 stable-four evidence candidates: ' + candidates.length + '/' + goalIds.length,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
