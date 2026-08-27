import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// This bounded migration preserves heterogeneous canonical/view JSON fields verbatim.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  compositionViews: 'curricula/DE/Gymnasium/composition-views/physik',
  applicabilityOverrides:
    'curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json',
  acceptedApplicabilityWarnings: 'docs/qa-ci/applicability-accepted-warnings.json',
} as const

const PHYSICS_LANDSCAPE_ID = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const PRACTICE_VIEW_STRUCTURE_ID = 'physics-seki-practice-assessments'
const ROUTE_PREREQUISITE_VIEW_STRUCTURE_ID = 'physics-seki-route-prerequisites'
const POWER_AND_EFFICIENCY_ASSESSMENT_ID = '0b8aff9a-6c77-51b9-82d4-725a21f32a90'
const RETIRED_BAVARIA_SYSTEMS_ASSESSMENT_ID = 'dc3e495a-d59c-5d49-86a6-e05ac9ae1e00'
const GENERIC_COMPATIBILITY_JURISDICTIONS = [
  'DE-BB', 'DE-BE', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV', 'DE-NI',
  'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
] as const

const ids = {
  motivation: '5c44b9ba-9b05-4774-95d5-073230d3fc4f',
  magneticFields: '0f6b798b-594e-5480-8c5f-95e2486a4d85',
  currentEffects: 'a5f652cc-e091-4c90-bec2-c357ae54fcf1',
  conductorAndCoilField: '106417ed-80db-5490-a1ee-bb4160d3f2b4',
  buildMotor: 'eb30189c-27c6-510b-b235-6543afa18b90',
  motionInduction: 'a522c8c0-f3a4-5568-acae-3010ed9feb87',
  magneticFluxInduction: '1a037489-3c95-540b-8cae-0acd360358ee',
  inductionApplications: 'fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c',
  measureMass: 'af0e2efb-f634-5f2d-abea-b2e1a67a2894',
  regularVolume: 'f827b00f-af7f-52de-84aa-2a2bbaa035bd',
  displacementVolume: 'f92b5b8a-327f-50d2-8313-6a142399ebf0',
  thermometer: '51de4fd9-6827-5b3d-b2ca-5e27ba961a7f',
  thermalExpansion: 'b60f63b6-e70b-5557-9f54-86d42fa80325',
  reflectionLaw: '3c8e5510-a12d-5770-8a01-e5fe741b259c',
  planeMirrorImage: 'b57427c9-1af5-5daa-8c65-b84a4cc20785',
  lunarPhases: '33e3417c-e062-5f4a-8df9-3195dca50089',
  eclipses: 'f0046ae8-cbfc-526b-8414-04e3595b6075',
  power: 'b92827a7-5d62-5fdb-a6f5-ac44461f4a7b',
  efficiency: 'f7f2c254-1663-5861-bed7-a32c00495b19',
  massEnergyEquivalence: '7d78da7f-6af5-440a-9d6b-6cab4bee8dd2',
  practiceCluster: '21ab0854-4d67-5233-9495-ae208e152a3c',
  genericSekIAssessment: '3631c8f7-ff48-57ff-b7ee-8397ff1d166a',
  bavariaSekIAssessment: 'a77138b8-3924-4a17-a22e-d2625ab19bd6',
  totalReflection: '58fc7852-722c-5a67-be6a-bfd1be0b527e',
  refraction: '6a4c6042-052b-502b-a39a-0ed8941247ac',
  mechanicalEnergy: '94784e0a-7ddc-48be-91fb-dc82b78eb322',
  mechanicalWork: 'c1c71daa-042b-4f4c-8c31-0ac366f5149e',
  qualitativeMechanicalEnergyForms: '722857cf-f327-5740-8151-64eb92195ec8',
  electricWorkVoltagePotential: '1730c01d-8c85-57df-b031-c11e2a0511b1',
  currentAsChargeTransport: 'bbee4c52-4e95-5529-990f-706aa99316a3',
  electromagneticSpectrum: '4a7cbe83-b694-57d3-85ce-1eeca418daaf',
  quantumObjects: 'a359c859-eee0-40ef-a9d1-88db2e6c55b2',
  harmonicWaves: 'cb0ced6d-b7c1-5b7d-9922-8c394f6030e8',
  characteristicOscillationQuantities: 'fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e',
  harmonicOscillation: 'd03f1cb6-c224-53db-ad91-76cc7827978d',
  emissionAndLineSpectra: '904670af-8e4c-543e-bc9b-e6248d87a10d',
  photonEnergyMomentum: 'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
  bandModelAndDoping: 'df010b2b-b182-5f7e-bbe4-49b72e48c27a',
  conductorInsulatorSemiconductor: '7badac4d-2874-5b3a-87e8-bf8f4440b2a6',
  nuclearReactions: '49872cc0-401f-5464-9235-4763df4db5cf',
  nuclearDecayAndRadiation: 'cb0426b0-a973-5660-b6fe-79407934730f',
  nuclearEnergyOptions: '7e719cc2-0866-5267-a252-e7e7ac0d03f1',
  radioactiveApplications: '979e0d0d-8933-4ace-814f-f28060ad280f',
  evaluateEnergySaving: 'aed9161b-ddc4-559c-be8f-baeeddf224f3',
  electricEnergyTransformations: 'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
  energyDegradation: 'cbdc0b5f-8a48-5ade-be53-ab6aacaa3e73',
  energyConservation: '91c49019-ea51-4ce5-a919-c91c45b25e83',
  gravitationLawAndWeight: 'eb0ffdea-c12d-56df-b7e8-c0297d2f8aff',
  massAndWeight: '9c328f68-41ed-55dd-9e02-34414a6246f2',
  linearRestoringForce: '05af2893-0201-4d7f-985b-272d7b88e26e',
  forceAndDeformation: '45bbdf6b-6372-5b6a-b7e4-be15a0eb4b83',
  modelAndIdealizeMotion: 'd6dc0e02-831d-4894-a61a-852bcc74f147',
  motionDiagrams: 'ce431132-dfc4-42c2-aff6-bd72035190f8',
  uniformlyAcceleratedMotion: 'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  fallingWithDrag: '12260012-cf04-5409-b57d-f5b3a46d9126',
  freeFallExperiment: '09029573-864f-40ca-bf8a-cee7bf6dcb73',
  mechanicsFundamentalEquation: '5f289cdc-fda1-4058-b44f-041ba1398e79',
} as const

const routePrerequisiteGoalIdsByJurisdiction: Readonly<Record<string, readonly string[]>> = {
  'DE-BW': [
    '9ac4973a-21d5-48a5-90b4-eb90e10391ae',
    '3c82510a-1f12-4eaa-81c2-8599437a5b85',
    '32111497-d5ca-453e-906d-d352f885b126',
    '01bebdfc-5819-4610-a03e-ea5e794fc954',
    ids.motionInduction,
    '67ffd0f0-a5ab-518f-8c45-4c0e7eb18390',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    ids.massAndWeight,
    ids.conductorInsulatorSemiconductor,
    '70b358bf-da6d-53ba-8393-51d5c2365b04',
  ],
  'DE-BY': [
    '940978fa-1f2d-4e54-9c28-081a6df9b76f',
    'a4681378-ade4-4f20-bf77-fb020469510f',
    '3c82510a-1f12-4eaa-81c2-8599437a5b85',
    'c1006f55-0406-48cc-92d4-0d8345897cf4',
    '2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb',
    'a5f652cc-e091-4c90-bec2-c357ae54fcf1',
    '75bdf5ca-cda4-4658-9ec7-84c77b3759db',
    'f778a659-1467-4aa7-97b2-bed78c530634',
    '75b9ca4c-178e-5df2-adc4-f7f78e9d28e5',
    '691c11d0-fa6a-5d2e-a19c-086e89c3c233',
    '8aff7aac-321b-5172-ac55-877876bfd2cd',
    'f6b1d812-ce8b-5852-b417-e6c29b533c7a',
    'f23fdfa9-38b6-5157-8301-ed302476c456',
    'a6e48b88-51ed-5942-bdb8-8d2192652e0d',
    '70b358bf-da6d-53ba-8393-51d5c2365b04',
    'ad984bb6-e225-432a-952d-d83cda40b7f8',
    ids.harmonicWaves,
    ids.characteristicOscillationQuantities,
    ids.harmonicOscillation,
  ],
  'DE-SN': [
    '3ed3279e-c524-5230-a277-dda89493df6d',
    '5355fee0-0477-5570-a234-561477bf77ba',
  ],
  'DE-ST': [
    '3ed3279e-c524-5230-a277-dda89493df6d',
    '5355fee0-0477-5570-a234-561477bf77ba',
  ],
  'DE-TH': [
    '3ed3279e-c524-5230-a277-dda89493df6d',
    '5355fee0-0477-5570-a234-561477bf77ba',
  ],
}

const nationalRoutePrerequisiteGoalIds = [
  ids.massEnergyEquivalence,
  'af1094c1-511a-5aae-9e0a-3e9196a82d9a',
  'eb30189c-27c6-510b-b235-6543afa18b90',
  '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  // The national resolved views expose every jurisdiction-local assessment.
  // These goals therefore remain visible there only as prerequisite roots for
  // the small local endpoints; they do not become national learner targets.
  '2eecd0e2-a7ca-4568-9b12-3d47706c65fb',
  'e790de73-f8e5-4027-bc05-9f12a0e8c9cb',
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
  '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2',
  '4a2bf015-052b-4af0-aed7-324259fa1a8a',
  'b3f3f4f7-b5cc-40e1-b57a-3d93649baa61',
  'a12fddce-0215-58d9-bd91-21be8a960d25',
  ids.nuclearReactions,
  ids.nuclearEnergyOptions,
  '37b33812-d428-5953-852e-57a53a4347fe',
  '0da13365-02c2-44f1-8a81-d524ca0ac3ae',
  ids.fallingWithDrag,
  'accb1d9e-cd48-5983-bcef-9b9bca4a9114',
  ids.gravitationLawAndWeight,
  ids.linearRestoringForce,
  '2088ccf0-48f4-51d4-be5f-67affd0fb099',
  'f322c268-dc16-5d50-82dd-209834f20208',
  ids.bandModelAndDoping,
  ids.inductionApplications,
  ids.conductorAndCoilField,
  ids.emissionAndLineSpectra,
  ids.quantumObjects,
  ids.photonEnergyMomentum,
  ids.electricWorkVoltagePotential,
  ids.currentAsChargeTransport,
  'd67502e3-5e0a-595b-a24b-65b1c40de36e',
  '72effc66-87f4-5f5e-8d36-1547677365fb',
  ids.totalReflection,
  'd36727cc-ce42-51a3-9425-41afb0b9acdd',
  'baa2bf3c-798a-5ec3-a667-031bf062d96c',
  'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
  '8f833b36-4126-52db-b210-79fb0023c7d9',
  '7eeff2de-6015-49a6-a96e-a488d886dc9f',
  '6affc2ea-ecd2-4fcd-8877-3ffa15b0425b',
  'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
] as const

const expectedBavariaRouteSinkGoalIds = [
  '979e0d0d-8933-4ace-814f-f28060ad280f',
  'af1094c1-511a-5aae-9e0a-3e9196a82d9a',
  'eb30189c-27c6-510b-b235-6543afa18b90',
  '310b4f62-e261-46be-bb1b-1f125fc1699a',
  '873c6371-4ffb-582b-8d8d-3f45f968ba08',
  '5be98160-5189-58aa-8183-1df1c400cc8c',
  'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
  'baa2bf3c-798a-5ec3-a667-031bf062d96c',
  '46e42b07-c098-5d65-8ef5-8472b7c4d8e2',
  '0dd1e39c-8557-5a4e-b467-caae964fff67',
  '45bbdf6b-6372-5b6a-b7e4-be15a0eb4b83',
  '41d35667-0296-5f84-bc12-202ffc440be0',
  '9c328f68-41ed-55dd-9e02-34414a6246f2',
  '71b51afd-c71b-506f-8128-d6de36b509d1',
  '6a4c6042-052b-502b-a39a-0ed8941247ac',
  '8f833b36-4126-52db-b210-79fb0023c7d9',
  '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  '1911920e-b099-4310-82f2-b47f51a78b33',
  'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
  '2eecd0e2-a7ca-4568-9b12-3d47706c65fb',
  'e790de73-f8e5-4027-bc05-9f12a0e8c9cb',
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
  '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2',
  '4a2bf015-052b-4af0-aed7-324259fa1a8a',
  'b3f3f4f7-b5cc-40e1-b57a-3d93649baa61',
  'a12fddce-0215-58d9-bd91-21be8a960d25',
  ids.nuclearReactions,
  ids.nuclearEnergyOptions,
  '37b33812-d428-5953-852e-57a53a4347fe',
  ids.emissionAndLineSpectra,
  ids.quantumObjects,
  ids.photonEnergyMomentum,
  ids.electricWorkVoltagePotential,
  ids.currentAsChargeTransport,
  'd67502e3-5e0a-595b-a24b-65b1c40de36e',
  '72effc66-87f4-5f5e-8d36-1547677365fb',
  ids.totalReflection,
  'd36727cc-ce42-51a3-9425-41afb0b9acdd',
  'e62e48bc-2387-4b2b-8d6f-7a06c8e7580e',
] as const

const deterministicPhysicsGoalId = (shortKey: string): string => {
  const digest = createHash('sha1')
    .update(`DE-GYM-CANONICAL-PHYSICS:${shortKey}`)
    .digest('hex')
  return `${digest.slice(0, 8)}-${digest.slice(8, 12)}-5${digest.slice(13, 16)}-8${digest.slice(17, 20)}-${digest.slice(20, 32)}`
}

const assessmentSpecs: JsonRecord[] = [
  {
    shortKey: 'canonical_physics_sek1_assessment_thermometer_measurement',
    id: 'ef2bb474-89e1-5deb-81c4-c6b05d174bbd',
    title: 'Prüfungsaufgabe: Eine Temperatur fachgerecht messen',
    titleEn: 'Assessment Task: Measure a Temperature Correctly',
    description:
      'Die lernende Person kann in einer praktischen Prüfungsaufgabe ein zum Messbereich und zur benötigten Auflösung passendes Thermometer auswählen, fachgerecht einsetzen und aus stabilisierten Messwerten ein begründetes Ergebnis mit Einheit angeben.',
    descriptionEn:
      'The learner can select a thermometer suited to the measurement range and required resolution in a practical assessment, use it correctly, and report a justified result with its unit from stabilized readings.',
    requires: [ids.thermometer],
    applicability: ['DE-HE', 'DE-SL', 'DE-SN', 'DE-ST'],
    area: 'Wärmelehre',
    topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.THERMOMETER_MEASUREMENT',
    processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK4_KOMMUNIZIEREN'],
    guidingIdeas: ['LI_MATERIE', 'LI_ENERGIE'],
    coveredGoalIds: [ids.thermometer],
    coveredStrands: ['LI_MATERIE', 'LI_ENERGIE'],
    taskContent:
      '**Praktische Messstation:**\n\nFür ein Wasserbad wird eine Temperatur zwischen 15 °C und 35 °C erwartet. Änderungen von 0,5 °C sollen sicher erkennbar sein. Zur Wahl stehen Thermometer A (−20 °C bis 120 °C, Skalenteilung 1 °C), B (0 °C bis 50 °C, Skalenteilung 0,1 °C) und C (30 °C bis 45 °C, Skalenteilung 0,1 °C).\n\n**Aufgaben:**\n\n1. Wählen Sie ein geeignetes Thermometer und begründen Sie die Wahl mit Messbereich und Auflösung. (4 BE)\n2. Bringen Sie den Messfühler vollständig in guten thermischen Kontakt mit dem Wasser, ohne Gefäßwand oder Boden zu berühren. Beschreiben Sie zwei Handlungen, die einen belastbaren Messwert sichern. (4 BE)\n3. Nach jeweils 30 s werden 24,8 °C, 24,7 °C und 24,7 °C abgelesen. Entscheiden Sie, ob ein stabiler Wert erreicht ist, und geben Sie das Messergebnis mit sinnvoller Genauigkeit und Einheit an. (4 BE)\n4. Erklären Sie, warum ein an der Gefäßwand anliegender oder nur teilweise eingetauchter Fühler das Ergebnis verfälschen kann. (3 BE)',
    solutionContent:
      'Thermometer B ist geeignet: Sein Messbereich umfasst die erwarteten Werte und seine Skalenteilung ist fein genug, um 0,5 °C zu unterscheiden. Der Fühler wird ausreichend tief, frei von Wand und Boden, in das Wasser gebracht; vorsichtiges Durchmischen und Warten bis zur Stabilisierung verringern Temperaturgradienten und Ablesefehler. Die letzten beiden Werte stimmen innerhalb der Auflösung überein, daher ist 24,7 °C ein begründeter stabiler Messwert. Wandkontakt oder unvollständiges Eintauchen koppelt den Fühler zusätzlich an Gefäß beziehungsweise Umgebung, sodass nicht zuverlässig die Temperatur des Wasserbads erfasst wird.',
    scoring: {
      maxPoints: 15,
      passingPoints: 9,
      steps: [
        { id: 'thermo_1', points: 4, description: 'Thermometer B anhand von Messbereich und Auflösung begründet ausgewählt' },
        { id: 'thermo_2', points: 4, description: 'Fühlerkontakt und stabilisierende Messhandlungen fachgerecht ausgeführt oder beschrieben' },
        { id: 'thermo_3', points: 4, description: 'Stabilität erkannt und 24,7 °C mit angemessener Genauigkeit angegeben' },
        { id: 'thermo_4', points: 3, description: 'Wandkontakt oder unvollständiges Eintauchen kausal als Fehlerquelle erklärt' },
      ],
    },
  },
  {
    shortKey: 'canonical_physics_sek1_assessment_thermal_expansion',
    id: '44ada28b-8635-5481-8d09-2d91686d352b',
    title: 'Prüfungsaufgabe: Thermische Ausdehnung aus Beobachtungen deuten',
    titleEn: 'Assessment Task: Interpret Thermal Expansion from Observations',
    description:
      'Die lernende Person kann in einer vergleichenden Prüfungsaufgabe beobachtete Längen- und Volumenänderungen beim Erwärmen und Abkühlen qualitativ erklären, Stoffzustände unterscheiden und die Wirkung starrer Begrenzungen beurteilen.',
    descriptionEn:
      'The learner can qualitatively explain observed changes in length and volume during heating and cooling in a comparative assessment, distinguish states of matter, and assess the effect of rigid constraints.',
    requires: [ids.thermalExpansion],
    applicability: ['DE-BW', 'DE-HE', 'DE-MV', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH'],
    area: 'Wärmelehre',
    topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.THERMAL_EXPANSION',
    processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
    guidingIdeas: ['LI_MATERIE', 'LI_TECHNIK'],
    coveredGoalIds: [ids.thermalExpansion],
    coveredStrands: ['LI_MATERIE', 'LI_TECHNIK'],
    taskContent:
      '**Material:**\n\nBei 20 °C ist ein Aluminiumstab 1000,0 mm lang; bei 60 °C werden 1000,9 mm gemessen. In einem dünnen Steigrohr steigt die Säule einer Flüssigkeit beim Erwärmen von 12,0 cm auf 18,5 cm. In einem leicht beweglichen Kolben vergrößert eingeschlossene Luft ihr Volumen beim Erwärmen von 20 mL auf 27 mL.\n\n**Aufgaben:**\n\n1. Beschreiben Sie für Festkörper, Flüssigkeit und Gas jeweils die beobachtete Änderung und formulieren Sie die gemeinsame qualitative Aussage. (5 BE)\n2. Sagen Sie für das anschließende Abkühlen die jeweilige Änderungsrichtung voraus und begründen Sie sie. (4 BE)\n3. Erklären Sie, warum aus den drei Zahlenbeispielen nicht folgt, dass sich alle Stoffe oder Aggregatzustände gleich stark ausdehnen. (4 BE)\n4. Eine Stahlschiene ist zwischen zwei starren Widerlagern ohne Spalt eingebaut. Beurteilen Sie, welche zusätzliche Wirkung beim Erwärmen auftreten kann und warum Dehnfugen diese Wirkung verringern. (5 BE)',
    solutionContent:
      'Der Aluminiumstab wird länger, die Flüssigkeitssäule steigt als Folge einer Volumenzunahme, und das Gas nimmt bei beweglichem Kolben mehr Volumen ein. Gemeinsam ist eine meist zunehmende Länge beziehungsweise ein zunehmendes Volumen beim Erwärmen; beim Abkühlen kehrt sich die Richtung qualitativ um. Die Messanordnungen, Ausgangsgrößen, Temperaturintervalle und Stoffeigenschaften unterscheiden sich, daher erlauben die Zahlen keinen einfachen Vergleich gleicher Ausdehnungsstärken. Wird freie Ausdehnung starr verhindert, entstehen mechanische Spannungen beziehungsweise Kräfte; eine Dehnfuge lässt die Längenänderung zu und reduziert diese Belastung.',
    scoring: {
      maxPoints: 18,
      passingPoints: 11,
      steps: [
        { id: 'expansion_1', points: 5, description: 'Beobachtungen für alle drei Stoffzustände korrekt beschrieben und gemeinsame Richtung formuliert' },
        { id: 'expansion_2', points: 4, description: 'Änderungsrichtung beim Abkühlen nachvollziehbar vorausgesagt' },
        { id: 'expansion_3', points: 4, description: 'Unzulässigen quantitativen Vergleich anhand der Versuchsbedingungen zurückgewiesen' },
        { id: 'expansion_4', points: 5, description: 'Folgen starrer Begrenzung und Funktion einer Dehnfuge fachlich erklärt' },
      ],
    },
  },
  {
    shortKey: 'canonical_physics_sek1_assessment_reflection_and_plane_mirror',
    id: '899481ae-2917-5fb0-805e-29e7c3c051be',
    title: 'Prüfungsaufgabe: Reflexionsgesetz und ebenes Spiegelbild untersuchen',
    titleEn: 'Assessment Task: Investigate the Law of Reflection and a Plane-Mirror Image',
    description:
      'Die lernende Person kann in einer zusammenhängenden praktischen Prüfungsaufgabe Einfalls- und Reflexionswinkel selbst messen, zugehörige Ablese- und Ausrichtungsunsicherheiten begründet abschätzen, damit das Reflexionsgesetz prüfen und anschließend Lage, Größe und Virtualität eines ebenen Spiegelbilds konstruieren und erklären.',
    descriptionEn:
      'The learner can independently measure angles of incidence and reflection in a coherent practical assessment, reasonably estimate the associated reading and alignment uncertainties, use them to test the law of reflection, and then construct and explain the position, size, and virtual nature of a plane-mirror image.',
    requires: [ids.reflectionLaw, ids.planeMirrorImage],
    applicability: ['DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV', 'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH'],
    area: 'Optik',
    topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.REFLECTION_AND_PLANE_MIRROR',
    processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
    guidingIdeas: ['LI_WELLEN', 'LI_TECHNIK'],
    coveredGoalIds: [ids.reflectionLaw, ids.planeMirrorImage],
    coveredStrands: ['LI_WELLEN', 'LI_TECHNIK'],
    taskContent:
      '**Teil A – Reflexion experimentell prüfen:**\n\nZur Verfügung stehen eine ebene Spiegelfläche, eine Strahlenbox mit schmalem Lichtstrahl, Papier und Winkelmesser. Richten Sie den Lichtstrahl nicht auf Augen.\n\n1. Zeichnen und beschriften Sie Spiegelgerade, Auftreffpunkt, Lot, Einfallsstrahl und Reflexionsstrahl. Markieren Sie beide Winkel zum Lot. (3 BE)\n2. Stellen Sie nacheinander drei deutlich verschiedene Einfallsrichtungen ein. Messen Sie für jede Einstellung Einfalls- und Reflexionswinkel zum Lot und protokollieren Sie die drei Wertepaare. Schätzen Sie für jeden Winkel eine begründete Ablese- und Ausrichtungsunsicherheit ab und nennen Sie zwei Maßnahmen, mit denen Sie diese Unsicherheiten klein halten. (5 BE)\n3. Formulieren Sie aus den Messwerten das Reflexionsgesetz. Prüfen Sie für jedes Paar, ob die Unsicherheitsintervalle von Einfalls- und Reflexionswinkel überlappen. Beurteilen Sie damit, ob Ihre Messung mit dem Reflexionsgesetz vereinbar ist; erklären Sie bei einem nicht vereinbaren Paar eine mögliche experimentelle Ursache. (4 BE)\n\n**Teil B – Spiegelbild konstruieren:**\n\nEin 4,0 cm hoher Pfeil steht 6,0 cm vor einem ausreichend großen ebenen Spiegel.\n\n4. Zeichnen Sie von derselben Pfeilspitze mindestens zwei auf den Spiegel treffende Lichtwege und reflektieren Sie sie nach dem Reflexionsgesetz. Verlängern Sie die reflektierten Strahlen hinter dem Spiegel gestrichelt, konstruieren Sie daraus das vollständige Bild und geben Sie Bildhöhe sowie Bildabstand an. (6 BE)\n5. Erklären Sie, warum das Bild hinter dem Spiegel erscheint, dort aber nicht auf einem Schirm aufgefangen werden kann. (3 BE)\n6. Der Beobachtungsort wird bei unverändertem, räumlich begrenztem Spiegel seitlich verschoben. Unterscheiden Sie zwischen der unveränderten geometrischen Bildlage und dem möglicherweise veränderten sichtbaren Ausschnitt. (3 BE)',
    solutionContent:
      'Die Winkel werden jeweils vom Lot aus gemessen. Die Messwerte hängen vom Aufbau ab; ein fachgerechtes Protokoll enthält drei plausible Wertepaare und begründete Unsicherheiten. Zwei geeignete Maßnahmen zur Unsicherheitsminderung sind beispielsweise ein möglichst schmaler Strahl mit langen, sauber nachgezogenen Strahlwegen, senkrechtes Ablesen zur Vermeidung von Parallaxe sowie das Fixieren des Spiegels und ein genau konstruiertes Lot; zwei davon sind zu erläutern. Das Reflexionsgesetz lautet Einfallswinkel = Reflexionswinkel. Ein Wertepaar ist mit dieser Gleichheit vereinbar, wenn sich die Intervalle i ± u_i und r ± u_r überlappen; gleichwertig genügt beim konservativen Intervallvergleich |i − r| ≤ u_i + u_r. Die Differenz darf nicht nur mit einer einzelnen Unsicherheit verglichen werden. Mögliche Ursachen einer Nichtvereinbarkeit sind ein ungenau gezeichnetes Lot, eine breite Strahlenlinie, Parallaxe oder ein verrutschter Spiegel. Hinter dem Spiegel schneiden sich nur die rückwärtigen Verlängerungen der reflektierten Strahlen. Sie ergeben ein aufrechtes, 4,0 cm hohes Bild in 6,0 cm Abstand hinter dem Spiegel. Dort laufen keine realen Strahlen zusammen; das Bild ist virtuell und nicht auf einem Schirm auffangbar. Der Beobachtungsort ändert die geometrische Bildlage nicht, bei einem begrenzten Spiegel aber gegebenenfalls den sichtbaren Ausschnitt.',
    scoring: {
      maxPoints: 24,
      passingPoints: 14,
      steps: [
        { id: 'reflection_1', points: 3, description: 'Versuchsgeometrie mit Spiegel, Lot, Strahlen und Winkelbezug fachlich korrekt dargestellt' },
        { id: 'reflection_2', points: 5, description: 'Drei Winkelpaare selbst gemessen, begründete Unsicherheiten abgeschätzt und zwei Maßnahmen zur Verringerung benannt' },
        { id: 'reflection_3', points: 4, description: 'Reflexionsgesetz formuliert und jedes Messpaar mit überlappenden Unsicherheitsintervallen beurteilt' },
        { id: 'reflection_4', points: 6, description: 'Spiegelbild mit mindestens zwei Lichtwegen sowie korrekter Lage und Größe konstruiert' },
        { id: 'reflection_5', points: 3, description: 'Virtualität und fehlende Schirmprojektion mit realen und rückwärts verlängerten Strahlen erklärt' },
        { id: 'reflection_6', points: 3, description: 'Bildlage und beobachtungsabhängigen sichtbaren Ausschnitt unterschieden' },
      ],
    },
  },
  {
    shortKey: 'canonical_physics_sek1_assessment_moon_phases_and_eclipses',
    id: '1a0dd12c-f30f-5e62-860b-93e393db9ce8',
    title: 'Prüfungsaufgabe: Mondphasen und Finsternisse räumlich erklären',
    titleEn: 'Assessment Task: Explain Lunar Phases and Eclipses Spatially',
    description:
      'Die lernende Person kann in einer räumlichen Modellaufgabe Mondphasen aus Beleuchtung und Blickrichtung ableiten, sie von Erdschatten unterscheiden und Sonnen- sowie Mondfinsternisse mit Kern- und Halbschatten erklären.',
    descriptionEn:
      'The learner can derive lunar phases from illumination and viewing direction in a spatial modeling task, distinguish them from Earth-shadow effects, and explain solar and lunar eclipses using umbra and penumbra.',
    requires: [ids.lunarPhases, ids.eclipses],
    applicability: ['DE-BB', 'DE-BE', 'DE-BW', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV', 'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH'],
    area: 'Optik und Astronomie',
    topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.MOON_PHASES_AND_ECLIPSES',
    processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
    guidingIdeas: ['LI_WELLEN', 'LI_KOSMOS'],
    coveredGoalIds: [ids.lunarPhases, ids.eclipses],
    coveredStrands: ['LI_WELLEN', 'LI_KOSMOS'],
    taskContent:
      '**Modellvorgabe:**\n\nFür die Phasenskizzen betrachten Sie das System senkrecht von der Nordseite der Erdbahnebene. Die Erde liegt in der Mitte, die Sonne weit links außerhalb der Skizze; paralleles Sonnenlicht läuft von links nach rechts. Der Mond bewegt sich in dieser Draufsicht gegen den Uhrzeigersinn. Größen und Abstände sind nicht maßstäblich.\n\n**Aufgaben:**\n\n1. Tragen Sie Neumond, erstes Viertel und Vollmond an den dadurch eindeutig festgelegten Stellen der Mondbahn ein. Markieren Sie jeweils die von der Sonne beleuchtete Mondhälfte und leiten Sie den von der Erde sichtbaren beleuchteten Anteil ab. (8 BE)\n2. Begründen Sie, warum die regelmäßigen Mondphasen nicht durch den Erdschatten entstehen. Nutzen Sie insbesondere die räumliche Stellung beim ersten Viertel. (4 BE)\n3. Fertigen Sie getrennte Strahlenskizzen für eine Sonnenfinsternis und eine Mondfinsternis an. Stellen Sie die Sonne in beiden Finsternisskizzen als ausgedehnte Lichtquelle dar und verwenden Sie Randstrahlen von gegenüberliegenden Sonnenrändern, um Kern- und Halbschatten abzugrenzen. Ordnen Sie bei der **Sonnenfinsternis** Orte auf der Erdoberfläche einer totalen beziehungsweise partiellen Sonnenfinsternis zu. Zeichnen Sie bei der **Mondfinsternis** einmal den Mond vollständig im Kernschatten der Erde und einmal nur teilweise im Kernschatten und erklären Sie daraus totale beziehungsweise partielle Mondfinsternis. (8 BE)\n4. Erklären Sie, warum trotz Neu- beziehungsweise Vollmond meistens keine Finsternis eintritt. Nutzen Sie dazu qualitativ die Neigung der Mondbahnebene gegenüber der Erdbahnebene. (4 BE)',
    solutionContent:
      'In der vorgegebenen Draufsicht liegt Neumond links zwischen Sonne und Erde. Bei der vorgegebenen Bewegung gegen den Uhrzeigersinn folgt das erste Viertel nach einer Viertelbahn an der unteren Bahnposition; Sonne-Erde- und Erde-Mond-Richtung stehen dort ungefähr senkrecht aufeinander. Vollmond liegt rechts hinter der Erde. Die beleuchtete Mondhälfte weist stets zur Sonne. Von der Erde ist bei Neumond nahezu nichts zu sehen, beim ersten Viertel ist etwa die Hälfte der sichtbaren Mondscheibe beleuchtet und bei Vollmond nahezu die ganze sichtbare Mondscheibe. Gerade beim ersten Viertel befindet sich der Mond nicht im Erdschatten; die Phasen folgen aus Beleuchtung und Blickrichtung. Die Randstrahlen der ausgedehnten Sonne begrenzen jeweils Kern- und Halbschatten. Bei der Sonnenfinsternis liegt der Mond zwischen Sonne und Erde. Orte im Mondkernschatten erleben eine totale, Orte im Mondhalbschatten eine partielle Sonnenfinsternis. Bei der Mondfinsternis liegt die Erde zwischen Sonne und Mond: Ein vollständig in den Erd-Kernschatten eingetretener Mond ist total, ein nur teilweise eingetretener Mond partiell verfinstert. Dies sind Lagen des Mondes im Erdschatten und keine schmalen, verschiedenen Beobachtungszonen auf der Erde; sichtbar ist die Mondfinsternis grundsätzlich von der Nachtseite, soweit der Mond über dem Horizont steht. Wegen der Bahnneigung passiert der Mond die Verbindungslinie bei den meisten Neu- und Vollmondstellungen oberhalb oder unterhalb der erforderlichen Schattenlage.',
    scoring: {
      maxPoints: 24,
      passingPoints: 14,
      steps: [
        { id: 'moon_1', points: 8, description: 'Drei Phasenstellungen mit beleuchteter Hälfte und sichtbarem Anteil räumlich korrekt abgeleitet' },
        { id: 'moon_2', points: 4, description: 'Erdschatten-Erklärung anhand der Viertelstellung fachlich ausgeschlossen' },
        { id: 'moon_3', points: 8, description: 'Sonnen- und Mondfinsternis mit Kern-/Halbschatten sowie den unterschiedlichen Kriterien für total und partiell korrekt modelliert' },
        { id: 'moon_4', points: 4, description: 'Seltenheit von Finsternissen qualitativ mit der Bahnneigung erklärt' },
      ],
    },
  },
  {
    shortKey: 'canonical_physics_sek1_assessment_power_and_efficiency',
    id: POWER_AND_EFFICIENCY_ASSESSMENT_ID,
    title: 'Prüfungsaufgabe: Leistung und Wirkungsgrad eines Hebezeugs vergleichen',
    titleEn: 'Assessment Task: Compare the Power and Efficiency of Hoists',
    description:
      'Die lernende Person kann in einer materialgebundenen Prüfungsaufgabe Energieumsatz, Leistung und Wirkungsgrad zweier Hebezeuge berechnen, die Kennwerte sachgerecht vergleichen und Energieverluste sowie Grenzen des Vergleichs physikalisch erklären.',
    descriptionEn:
      'The learner can calculate energy transfer, power, and efficiency for two hoists in a source-based assessment, compare the performance indicators appropriately, and explain energy losses and limitations of the comparison in physical terms.',
    requires: [ids.power, ids.efficiency],
    applicability: ['DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV', 'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH'],
    area: 'Mechanik und Energie',
    topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.POWER_AND_EFFICIENCY',
    processCompetencies: ['PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN', 'PK5_BEWERTEN'],
    guidingIdeas: ['LI_ENERGIE', 'LI_TECHNIK'],
    coveredGoalIds: [ids.power, ids.efficiency],
    coveredStrands: ['LI_ENERGIE', 'LI_TECHNIK'],
    taskContent:
      '**Material:**\n\nZwei elektrische Hebezeuge heben jeweils eine Last der Masse 120 kg um 2,5 m an. Verwenden Sie g = 10 N/kg. Hebezeug A benötigt dafür 8,0 s und nimmt 5,0 kJ elektrische Energie auf. Hebezeug B benötigt 6,0 s und nimmt 6,0 kJ elektrische Energie auf. Die Last startet und endet jeweils in Ruhe.\n\n**Aufgaben:**\n\n1. Bestimmen Sie die Zunahme der Lageenergie der Last und die mittlere mechanische Ausgangsleistung von Hebezeug A. (4 BE)\n2. Bestimmen Sie die mittlere elektrische Eingangsleistung und den Wirkungsgrad von Hebezeug A. (4 BE)\n3. Berechnen Sie Ausgangsleistung und Wirkungsgrad von Hebezeug B. Vergleichen Sie beide Hebezeuge und unterscheiden Sie dabei ausdrücklich zwischen schnellerem Heben und effizienterer Energienutzung. (5 BE)\n4. Erklären Sie, warum der nicht als Lageenergie wiedergefundene Energieanteil der Energieerhaltung nicht widerspricht, und nennen Sie eine Grenze des Vergleichs anhand der gegebenen Mittelwerte. (3 BE)',
    solutionContent:
      'Die Gewichtskraft beträgt 1200 N; bei 2,5 m Hub nimmt die Lageenergie um 3000 J zu. Für A folgt eine mittlere mechanische Ausgangsleistung von 3000 J / 8,0 s = 375 W. Die mittlere elektrische Eingangsleistung beträgt 5000 J / 8,0 s = 625 W, der Wirkungsgrad 3000 J / 5000 J = 0,60 beziehungsweise 60 %. Für B ergeben sich 3000 J / 6,0 s = 500 W Ausgangsleistung und 3000 J / 6000 J = 0,50 beziehungsweise 50 % Wirkungsgrad. B hebt die Last schneller und besitzt die höhere Ausgangsleistung; A nutzt die zugeführte elektrische Energie effizienter. Der übrige Energieanteil wird beispielsweise als Wärme, Schall oder Verformungsenergie an die Umgebung übertragen und geht nicht verloren. Die Mittelwerte erlauben keine Aussage über zeitliche Leistungsspitzen; außerdem sind Messunsicherheiten und unterschiedliche Betriebsbedingungen im Material nicht erfasst.',
    scoring: {
      maxPoints: 16,
      passingPoints: 10,
      steps: [
        { id: 'power_efficiency_1', points: 4, description: 'Lageenergie und mittlere Ausgangsleistung von Hebezeug A korrekt bestimmt' },
        { id: 'power_efficiency_2', points: 4, description: 'Eingangsleistung und Wirkungsgrad von Hebezeug A korrekt bestimmt' },
        { id: 'power_efficiency_3', points: 5, description: 'Hebezeug B berechnet und Geschwindigkeit, Leistung sowie Effizienz trennscharf verglichen' },
        { id: 'power_efficiency_4', points: 3, description: 'Verlustenergie mit Energieerhaltung erklärt und eine belastbare Grenze des Mittelwertvergleichs benannt' },
      ],
    },
  },
  {
    shortKey: 'canonical_physics_sek1_assessment_bavaria_mechanics_lab',
    id: 'd8bad724-03ea-510a-8415-928332ed4979',
    title: 'Prüfungsaufgabe: Kräfte experimentell und grafisch untersuchen',
    titleEn: 'Assessment Task: Investigate Forces Experimentally and Graphically',
    description:
      'Die lernende Person kann in einer praktischen Prüfungsaufgabe Kraft und elastische Verformung experimentell untersuchen, Masse und Gewichtskraft begrifflich trennen und mehrere Kräfte maßstäblich zu einer Resultierenden zusammensetzen.',
    descriptionEn:
      'The learner can experimentally investigate force and elastic deformation, distinguish mass from weight, and combine multiple forces to a resultant using a scale drawing in a practical assessment.',
    requires: ['45bbdf6b-6372-5b6a-b7e4-be15a0eb4b83', '41d35667-0296-5f84-bc12-202ffc440be0', '9c328f68-41ed-55dd-9e02-34414a6246f2'],
    applicability: ['DE-BY'],
    area: 'Mechanik',
    topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BAVARIA.MECHANICS_LAB',
    processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
    guidingIdeas: ['LI_ENERGIE', 'LI_TECHNIK'],
    coveredGoalIds: ['45bbdf6b-6372-5b6a-b7e4-be15a0eb4b83', '41d35667-0296-5f84-bc12-202ffc440be0', '9c328f68-41ed-55dd-9e02-34414a6246f2'],
    coveredStrands: ['LI_ENERGIE', 'LI_TECHNIK'],
    applicabilityFromRequires: false,
    applicabilityOverrides: { jurisdiction: ['DE-BY'] },
    taskContent:
      '**Praktische Station:**\n\nZur Verfügung stehen ein elastisches Sicherungselement, Stativ, Kraftmesser, Maßstab, mindestens sechs geeignete Lasten und Millimeterpapier.\n\n1. Planen und führen Sie eine Messreihe mit mindestens sechs verschiedenen Kräften durch. Protokollieren Sie Kraft und Verlängerung mit Einheiten, zeichnen Sie ein beschriftetes Diagramm und bestimmen Sie begründet den Messbereich, in dem beide Größen proportional sind. Dokumentieren Sie außerdem eine Maßnahme zur Verringerung der Messunsicherheit. (10 BE)\n2. Eine Last besitzt auf Erde und Mond dieselbe Masse von 2,0 kg; verwenden Sie g_E = 9,8 N/kg und g_M = 1,6 N/kg. Berechnen Sie beide Gewichtskräfte, geben Sie die Einheiten von Masse und Kraft an und korrigieren Sie fachlich den Satz „Auf dem Mond hat der Körper weniger Masse“. (6 BE)\n3. Zwei Kräfte von 40 N und 30 N greifen unter einem Winkel von 60° an einem Ring an. Konstruieren Sie beide Kräfte im Maßstab 1 cm = 10 N und bestimmen Sie die Resultierende ausschließlich mit Kräfteparallelogramm oder Spitze-an-Schaft-Konstruktion. Geben Sie Betrag und Richtung an und deuten Sie die Resultierende im Kontext. (8 BE)',
    solutionContent:
      'Die Messreihe muss selbst erhoben, mit einer nachvollziehbaren Nullstellung und wiederholbaren Ablesung dokumentiert und als Verlängerung-gegen-Kraft-Diagramm ausgewertet werden. Proportionalität ist nur dort begründet, wo die Punkte innerhalb der Messunsicherheit auf einer Geraden durch den Ursprung liegen. Die Masse bleibt 2,0 kg; die Gewichtskräfte betragen auf der Erde 19,6 N und auf dem Mond 3,2 N. Masse ist eine ortsunabhängige Körpereigenschaft in Kilogramm, Gewichtskraft eine vom Gravitationsfeld abhängige Kraft in Newton. Die maßstäbliche Vektorkonstruktion ergibt ungefähr 61 N bei etwa 25° von der 40-N-Kraft in Richtung der 30-N-Kraft; diese eine Kraft ersetzt die gemeinsame Wirkung beider Kräfte.',
    scoring: {
      maxPoints: 24,
      passingPoints: 14,
      steps: [
        { id: 'mechanics_lab_1', points: 10, description: 'Eigene Kraft-Verformungs-Messreihe geplant, durchgeführt, grafisch ausgewertet und proportionalen Bereich begründet' },
        { id: 'mechanics_lab_2', points: 6, description: 'Masse und Gewichtskraft begrifflich, rechnerisch und sprachlich korrekt unterschieden' },
        { id: 'mechanics_lab_3', points: 8, description: 'Kräfte maßstäblich grafisch zusammengesetzt und Resultierende im Kontext gedeutet' },
      ],
    },
  },
  {
    shortKey: 'canonical_physics_sek1_assessment_bavaria_optics_safety',
    id: '5353aabf-68c9-5788-8c25-8ed7e3ea42f3',
    title: 'Prüfungsaufgabe: Brechung erklären und optische Risiken beurteilen',
    titleEn: 'Assessment Task: Explain Refraction and Assess Optical Risks',
    description:
      'Die lernende Person kann Brechung und optische Hebung mithilfe eines Strahlenmodells erklären und den Einsatz von Linsen, Lichtquellen und Lasern anhand konkreter Sicherheitsregeln fachlich beurteilen.',
    descriptionEn:
      'The learner can explain refraction and apparent depth using a ray model and assess the use of lenses, light sources, and lasers using concrete safety rules.',
    requires: ['6a4c6042-052b-502b-a39a-0ed8941247ac', '71b51afd-c71b-506f-8128-d6de36b509d1'],
    applicability: ['DE-BY'],
    area: 'Optik',
    topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BAVARIA.OPTICS_SAFETY',
    processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN', 'PK5_BEWERTEN'],
    guidingIdeas: ['LI_WELLEN', 'LI_TECHNIK'],
    coveredGoalIds: ['6a4c6042-052b-502b-a39a-0ed8941247ac', '71b51afd-c71b-506f-8128-d6de36b509d1'],
    coveredStrands: ['LI_WELLEN', 'LI_TECHNIK'],
    applicabilityFromRequires: false,
    applicabilityOverrides: { jurisdiction: ['DE-BY'] },
    taskContent:
      '**Material A:** Eine Münze auf dem Boden eines Wasserbeckens erscheint bei schrägem Blick von oben angehoben.\n\n1. Zeichnen Sie einen Strahl von der Münze zur beobachtenden Person mit Grenzfläche, Lot und korrekter Brechungsrichtung beim Übergang Wasser–Luft. Verlängern Sie den gebrochenen Strahl rückwärts und erklären Sie damit die scheinbare Hebung. (8 BE)\n\n**Material B:** Für einen frei zugänglichen Schüleraufbau wird ein Laser der Klasse 3R vorgeschlagen. Alternativ steht ein Laser der Klasse 2 für einen von der Lehrkraft begrenzten Strahlweg bereit. Außerdem soll Sonnenlicht mit einer Sammellinse untersucht werden.\n\n2. Lehnen Sie den Einsatz des Klasse-3R-Lasers im Schülerexperiment fachlich eindeutig ab. Begründen Sie die Entscheidung über die Gefahr für das Auge und formulieren Sie mindestens drei Regeln für den beaufsichtigten Klasse-2-Aufbau. (5 BE)\n3. Erklären Sie die zusätzliche Gefahr beim Blick in den direkten oder spiegelnd reflektierten Strahl und beim Bündeln von Sonnenlicht mit der Sammellinse. Leiten Sie je eine Schutzmaßnahme ab. (3 BE)',
    solutionContent:
      'Beim Übergang vom optisch dichteren Wasser in die Luft wird der Strahl vom Lot weg gebrochen. Das Auge ordnet Licht geradlinig zurück; die rückwärtige Verlängerung endet oberhalb der wirklichen Münze. Ein Laser der Klasse 3R ist für den vorgeschlagenen Schüleraufbau abzulehnen, weil direkte Bestrahlung des Auges gefährlich ist. Beim beaufsichtigten Klasse-2-Aufbau bleiben der Strahl unter Augenhöhe und räumlich begrenzt, wird nie auf Personen gerichtet und trifft nicht auf spiegelnde Flächen; absichtliches Hineinblicken bleibt verboten. Spiegelnde Reflexion kann ähnlich wie der direkte Strahl in das Auge gelangen. Eine Sammellinse kann Sonnenenergie auf eine kleine Fläche konzentrieren und Auge oder Material schädigen; deshalb nie zur Sonne blicken und den Brennpunkt kontrolliert von Personen und brennbaren Stoffen fernhalten.',
    scoring: {
      maxPoints: 16,
      passingPoints: 10,
      steps: [
        { id: 'optics_safety_1', points: 8, description: 'Brechungsstrahl und rückwärtige Verlängerung korrekt konstruiert und optische Hebung erklärt' },
        { id: 'optics_safety_2', points: 5, description: 'Klasse 3R eindeutig abgelehnt und Regeln für einen begrenzten Klasse-2-Aufbau begründet' },
        { id: 'optics_safety_3', points: 3, description: 'Gefahren von Reflexion und Lichtbündelung mit passenden Schutzmaßnahmen erklärt' },
      ],
    },
  },
  {
    shortKey: 'canonical_physics_sek1_assessment_bavaria_thermal_energy_system',
    id: '9fe4f83e-2065-53f5-8a35-ef4a3b76c17b',
    title: 'Prüfungsaufgabe: Ein thermisches Energiesystem modellieren und bewerten',
    titleEn: 'Assessment Task: Model and Evaluate a Thermal Energy System',
    description:
      'Die lernende Person kann Druckänderungen und Aggregatzustandsänderungen im Teilchenmodell erklären und Energieversorgungsvarianten anhand physikalischer, ökologischer, ökonomischer und gesellschaftlicher Kriterien abgewogen beurteilen.',
    descriptionEn:
      'The learner can explain pressure changes and phase changes using the particle model and weigh energy-supply options using physical, environmental, economic, and social criteria.',
    requires: ['310b4f62-e261-46be-bb1b-1f125fc1699a', '873c6371-4ffb-582b-8d8d-3f45f968ba08', '5be98160-5189-58aa-8183-1df1c400cc8c'],
    applicability: ['DE-BY'],
    area: 'Wärmelehre und Energieversorgung',
    topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BAVARIA.THERMAL_ENERGY_SYSTEM',
    processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK5_BEWERTEN'],
    guidingIdeas: ['LI_MATERIE', 'LI_ENERGIE', 'LI_TECHNIK'],
    coveredGoalIds: ['310b4f62-e261-46be-bb1b-1f125fc1699a', '873c6371-4ffb-582b-8d8d-3f45f968ba08', '5be98160-5189-58aa-8183-1df1c400cc8c'],
    coveredStrands: ['LI_MATERIE', 'LI_ENERGIE', 'LI_TECHNIK'],
    applicabilityFromRequires: false,
    applicabilityOverrides: { jurisdiction: ['DE-BY'] },
    taskContent:
      '**Teil A – Modelle:** In einem starren geschlossenen Behälter steigt beim Erwärmen einer Gasmenge von 20 °C auf 65 °C der Druck von 1,00 bar auf 1,15 bar und sinkt beim anschließenden Abkühlen wieder. (1) Erklären Sie beide Druckänderungen bei konstantem Volumen mit Teilchenbewegung und Stößen an der Behälterwand. (5 BE) (2) Ordnen Sie Schmelzen, Erstarren, Verdampfen und Kondensieren jeweils Energieaufnahme oder Energieabgabe zu. Erklären Sie die vier Vorgänge im Teilchenmodell und unterscheiden Sie ausdrücklich Modellteilchen von den beobachtbaren Stoffen. (7 BE)\n\n**Teil B – Entscheidung:** Ein Gebäude benötigt jährlich 9000 kWh Nutzwärme. Variante W nutzt eine Wärmepumpe: 2500 kWh Strom, 0,10 kg CO₂-Äquivalent je kWh, 0,30 Euro je kWh, Außengerät 48 dB; der Strommix kann schwanken. Variante G nutzt eine Gasheizung: 10000 kWh Gas, 0,20 kg CO₂-Äquivalent je kWh, 0,11 Euro je kWh; Verbrennung findet lokal statt, das vorhandene Gasnetz kann genutzt werden. (3) Berechnen Sie jährliche Energiekosten und Emissionen beider Varianten. (4 BE) (4) Legen Sie eine begründete Gewichtung für mindestens ein physikalisches, ein ökologisches, ein ökonomisches und ein gesellschaftliches Kriterium offen. Formulieren Sie daraus ein abgewogenes Urteil und benennen Sie zwei Grenzen der Daten. (8 BE)',
    solutionContent:
      'Bei höherer Temperatur bewegen sich die Gasteilchen im Modell schneller und stoßen häufiger und kräftiger gegen die Wand; beim Abkühlen nimmt diese Wirkung ab. Schmelzen und Verdampfen benötigen Energie, Erstarren und Kondensieren geben Energie ab. Das Teilchenmodell beschreibt Bewegung, Abstände und Bindungsänderungen; sichtbare Tropfen oder Stoffstücke sind nicht einzelne Modellteilchen. Für W ergeben sich 750 Euro und 250 kg CO₂-Äquivalent pro Jahr, für G 1100 Euro und 2000 kg. W ist in den gegebenen Daten günstiger und emissionsärmer, kann aber durch Geräusch und schwankenden Strommix belastet sein; G nutzt vorhandene Infrastruktur, verursacht jedoch lokale Verbrennung und deutlich höhere Emissionen. Ein Urteil muss die eigene Kriteriengewichtung offenlegen. Daten zu Anschaffung, Lebensdauer, Wartung, zukünftigen Preisen und realen Betriebsbedingungen fehlen.',
    scoring: {
      maxPoints: 24,
      passingPoints: 14,
      steps: [
        { id: 'thermal_system_1', points: 5, description: 'Druckanstieg und Druckabfall bei konstantem Volumen im Teilchenmodell erklärt' },
        { id: 'thermal_system_2', points: 7, description: 'Alle vier Aggregatzustandsänderungen energetisch gedeutet und Modell-/Realitätsebene getrennt' },
        { id: 'thermal_system_3', points: 4, description: 'Kosten und Emissionen beider Versorgungsvarianten korrekt bilanziert' },
        { id: 'thermal_system_4', points: 8, description: 'Vier Kriterienarten offengelegt gewichtet, Urteil abgewogen und Datengrenzen benannt' },
      ],
    },
  },
  {
    shortKey: 'canonical_physics_sek1_assessment_bavaria_circuit_investigation',
    id: '924e1187-a067-5eb6-8d8d-85525ee6c837',
    title: 'Prüfungsaufgabe: Leitfähigkeit, Kennlinien und Widerstandsnetze untersuchen',
    titleEn: 'Assessment Task: Investigate Conductivity, Characteristics, and Resistor Networks',
    description:
      'Die lernende Person kann mit sicheren Kleinspannungsversuchen Leitfähigkeit und Kennlinien untersuchen sowie Widerstandsänderungen in Reihen- und Parallelschaltungen vorhersagen, begründen und an Grenzfällen prüfen.',
    descriptionEn:
      'The learner can investigate conductivity and characteristic curves using safe low-voltage experiments and predict, justify, and check resistor changes in series and parallel circuits using limiting cases.',
    requires: ['baa2bf3c-798a-5ec3-a667-031bf062d96c', 'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca', '8f833b36-4126-52db-b210-79fb0023c7d9'],
    applicability: ['DE-BW', 'DE-BY'],
    area: 'Elektrizitätslehre',
    topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BAVARIA.CIRCUIT_INVESTIGATION',
    processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
    guidingIdeas: ['LI_MATERIE', 'LI_FELDER', 'LI_TECHNIK'],
    coveredGoalIds: ['baa2bf3c-798a-5ec3-a667-031bf062d96c', 'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca', '8f833b36-4126-52db-b210-79fb0023c7d9'],
    coveredStrands: ['LI_MATERIE', 'LI_FELDER', 'LI_TECHNIK'],
    applicabilityFromRequires: false,
    applicabilityOverrides: { jurisdiction: ['DE-BW', 'DE-BY'] },
    taskContent:
      '**Praktische Station mit höchstens 12 V:**\n\n1. Planen und bauen Sie einen Prüfschaltkreis, mit dem Kupfer, Aluminium, Glas und Kunststoff auf Leitfähigkeit untersucht werden. Begründen Sie eine Strombegrenzung, protokollieren Sie die Beobachtungen und ordnen Sie Leiter und Nichtleiter zu. (6 BE)\n2. Nehmen Sie für einen Widerstand mindestens fünf U-I-Wertepaare auf, zeichnen und interpretieren Sie die Kennlinie und bestimmen Sie im proportionalen Bereich den Widerstand. Untersuchen Sie anschließend qualitativ je eine Änderung von Material, Leiterlänge und Querschnitt. (8 BE)\n3. Zwei gleiche Widerstände liegen zunächst in Reihe an konstanter Quellenspannung. Sagen Sie voraus und begründen Sie, wie Gesamtwiderstand und Stromstärke reagieren, wenn ein Widerstand hinzugefügt, entfernt oder stark vergrößert wird. Prüfen Sie den Grenzfall eines sehr großen Widerstands. (5 BE)\n4. Wiederholen Sie die Vorhersage für zwei parallele Zweige: Entfernen Sie gedanklich einen Zweig und vergrößern Sie anschließend nur einen Zweigwiderstand. Unterscheiden Sie Gesamtstrom und Zweigströme und prüfen Sie den Grenzfall eines nahezu offenen Zweigs. (5 BE)',
    solutionContent:
      'Ein geschlossener, strombegrenzter Kleinspannungskreis zeigt bei Kupfer und Aluminium Stromfluss, bei Glas und Kunststoff nicht. Die Strombegrenzung verhindert bei Kurzschluss oder sehr kleinem Probenwiderstand gefährlich große Ströme und schützt Quelle, Leitungen und Proben vor Überhitzung. Die U-I-Kennlinie eines ohmschen Widerstands verläuft im untersuchten proportionalen Bereich geradlinig durch den Ursprung; R = U/I. Größere Länge und typischerweise schlechter leitendes Material erhöhen, größerer Querschnitt verringert den Widerstand. In Reihe erhöhen zusätzliche oder größere Widerstände den Gesamtwiderstand und verringern den Strom; beim sehr großen Widerstand geht der Strom gegen null. Das Entfernen eines Reihenwiderstands wirkt umgekehrt. In Parallelschaltung erhöht das Entfernen eines Zweigs den Gesamtwiderstand und senkt den Gesamtstrom; bei ideal konstanter Spannung bleibt der Strom des unveränderten Zweigs gleich. Wird nur ein Zweigwiderstand groß, sinken dessen Strom und der Gesamtstrom; der Grenzfall entspricht einem offenen Zweig.',
    scoring: {
      maxPoints: 24,
      passingPoints: 14,
      steps: [
        { id: 'circuit_investigation_1', points: 6, description: 'Sicheren Leitfähigkeitsversuch aufgebaut, protokolliert und Stoffe korrekt zugeordnet' },
        { id: 'circuit_investigation_2', points: 8, description: 'Eigene Kennlinie aufgenommen, Widerstand bestimmt und drei Einflussgrößen untersucht' },
        { id: 'circuit_investigation_3', points: 5, description: 'Hinzufügen, Entfernen und Ändern in Reihenschaltung einschließlich Grenzfall begründet' },
        { id: 'circuit_investigation_4', points: 5, description: 'Änderungen von Gesamt- und Zweigströmen in Parallelschaltung einschließlich Grenzfall begründet' },
      ],
    },
  },
  {
    shortKey: 'canonical_physics_sek1_assessment_bavaria_solar_energy_lab',
    id: 'def74475-7126-5e55-8517-498951118f26',
    title: 'Prüfungsaufgabe: Solarmodule experimentell verschalten und nutzen',
    titleEn: 'Assessment Task: Connect and Use Solar Modules Experimentally',
    description:
      'Die lernende Person kann Solarmodule experimentell in Reihen- und Parallelschaltung untersuchen, Einfallswinkel und Beschattung variieren, elektrische Leistung und Wirkungsgrad bilanzieren und die beobachteten Energieumwandlungen für eine geeignete Nutzung deuten.',
    descriptionEn:
      'The learner can experimentally investigate solar modules in series and parallel, vary angle and shading, balance electrical power and efficiency, and interpret the observed energy conversions for an appropriate use.',
    requires: ['0dd1e39c-8557-5a4e-b467-caae964fff67', 'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76', '46e42b07-c098-5d65-8ef5-8472b7c4d8e2'],
    applicability: ['DE-BY'],
    area: 'Elektrische Energie',
    topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BAVARIA.SOLAR_ENERGY_LAB',
    processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK3_MATHEMATISIEREN', 'PK5_BEWERTEN'],
    guidingIdeas: ['LI_ENERGIE', 'LI_TECHNIK'],
    coveredGoalIds: ['0dd1e39c-8557-5a4e-b467-caae964fff67', 'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76', '46e42b07-c098-5d65-8ef5-8472b7c4d8e2'],
    coveredStrands: ['LI_ENERGIE', 'LI_TECHNIK'],
    applicabilityFromRequires: false,
    applicabilityOverrides: { jurisdiction: ['DE-BY'] },
    taskContent:
      '**Praktische Station:** Zwei gleiche Solarmodule, regelbare Lampe, Spannungs- und Strommessgeräte, ein geeigneter Lastwiderstand und ein Kleinspannungsmotor stehen bereit. Der Motor hebt eine Masse von 0,20 kg um 0,50 m; verwenden Sie g = 10 N/kg.\n\n1. Planen und führen Sie Messungen für ein Modul sowie für Reihen- und Parallelschaltung bei gleicher Beleuchtung durch. Protokollieren Sie Spannung und Stromstärke am Lastwiderstand und begründen Sie aus den Messwerten den Unterschied beider Verschaltungen. (7 BE)\n2. Variieren Sie bei einer festgelegten Schaltung systematisch den Einfallswinkel und anschließend die Teilbeschattung nur eines Moduls. Halten Sie andere Größen möglichst konstant, dokumentieren Sie die Ergebnisse und leiten Sie je eine Schlussfolgerung für die Aufstellung und Verschaltung ab. (6 BE)\n3. Betreiben Sie den Kleinspannungsmotor mit der geeigneteren Modulschaltung. Messen Sie Spannung, Stromstärke und Hubzeit, bestimmen Sie elektrische Eingangsleistung, mechanische Ausgangsleistung und Wirkungsgrad und erstellen Sie eine Leistungsbilanz. Beschreiben Sie außerdem die Energieumwandlungskette bis zu Bewegung, Wärme und Schall und beurteilen Sie anhand Ihrer Messungen, für welchen Betriebsfall die Nutzung tragfähig ist. (7 BE)',
    solutionContent:
      'Bei gleichen Modulen erhöht die Reihenschaltung typischerweise die verfügbare Spannung, die Parallelschaltung die verfügbare Stromstärke; die konkreten Werte werden selbst gemessen und müssen konsistent protokolliert sein. Günstiger Einfallswinkel erhöht die übertragene Strahlungsleistung. Teilbeschattung verändert die Ausgangsgrößen und kann Reihen- und Parallelschaltung unterschiedlich stark beeinträchtigen; Schlussfolgerungen müssen aus den eigenen Daten folgen. Für den Motor gilt P_ein = U · I, P_nutz = mgh/t und η = P_nutz/P_ein; die Differenz wird vor allem als Wärme und Schall übertragen. Die Energieumwandlungskette beginnt mit Strahlung, führt über elektrische Energie zu Bewegung und Verlustanteilen. Die Nutzungsentscheidung muss Messwerte und Stabilität unter Winkel- beziehungsweise Schattenänderung berücksichtigen.',
    scoring: {
      maxPoints: 20,
      passingPoints: 12,
      steps: [
        { id: 'solar_lab_1', points: 7, description: 'Reihen- und Parallelschaltung selbst gemessen und Unterschiede datenbasiert begründet' },
        { id: 'solar_lab_2', points: 6, description: 'Einfallswinkel und Teilbeschattung kontrolliert variiert und Nutzungsschlüsse gezogen' },
        { id: 'solar_lab_3', points: 7, description: 'Eingangs-/Ausgangsleistung und Wirkungsgrad bilanziert, Energieumwandlung erklärt und Betriebsfall beurteilt' },
      ],
    },
  },
  {
    shortKey: 'canonical_physics_sek1_assessment_bavaria_electrical_safety_briefing',
    id: '77257ded-ccf0-521f-8a8c-38c8f85fd3ca',
    title: 'Prüfungsaufgabe: Elektrische Sicherheit fachsprachlich vermitteln',
    titleEn: 'Assessment Task: Communicate Electrical Safety Scientifically',
    description:
      'Die lernende Person kann Gefahren in elektrischen Anlagen, Haushaltsstromkreisen und bei Gewitter fachlich beurteilen und die begründeten Schutzentscheidungen adressatengerecht und fachsprachlich präsentieren.',
    descriptionEn:
      'The learner can assess hazards in electrical installations, household circuits, and thunderstorms and present justified protective decisions to an audience using appropriate scientific language.',
    requires: ['1911920e-b099-4310-82f2-b47f51a78b33', '6d323d54-0aee-55d0-a9e1-ef2efdea0346'],
    applicability: ['DE-BY'],
    area: 'Elektrische Sicherheit und Kommunikation',
    topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BAVARIA.ELECTRICAL_SAFETY_BRIEFING',
    processCompetencies: ['PK4_KOMMUNIZIEREN', 'PK5_BEWERTEN'],
    guidingIdeas: ['LI_FELDER', 'LI_TECHNIK'],
    coveredGoalIds: ['1911920e-b099-4310-82f2-b47f51a78b33', '6d323d54-0aee-55d0-a9e1-ef2efdea0346'],
    coveredStrands: ['LI_FELDER', 'LI_TECHNIK'],
    applicabilityFromRequires: false,
    applicabilityOverrides: { jurisdiction: ['DE-BY'] },
    taskContent:
      '**Material:** Eine Skizze zeigt einen Haushaltsstromkreis mit beschädigter Geräteisolierung, berührbarem Metallgehäuse, Schutzleiter, Sicherung und Fehlerstrom-Schutzeinrichtung. Daneben stehen zwei Gewittersituationen: eine Person unter einem einzelnen Baum und eine Person in einem geschlossenen Gebäude.\n\n1. Erläutern Sie die Gefahren von beschädigter Isolierung und berührbarem Metallgehäuse. Unterscheiden Sie die Funktionen von Isolierung, Schutzleiter, Sicherung und Fehlerstrom-Schutzeinrichtung und beurteilen Sie, welche Schutzebenen im gezeigten Fehlerfall wirken. (7 BE)\n2. Erklären Sie das sichere Verhalten in beiden Gewittersituationen und begründen Sie, warum der einzelne Baum kein geeigneter Schutzort ist. (4 BE)\n3. Bereiten Sie eine höchstens zweiminütige Sicherheitsunterweisung für jüngere Lernende vor. Sie muss eine klare Handlungsempfehlung, mindestens drei bewusst verwendete Fachbegriffe und zwei Bezüge zur Materialskizze enthalten. Überführen Sie dabei die Aussagen „Der Strom wird von der Sicherung verbraucht“ und „Gummi macht Elektrizität immer ungefährlich“ in fachlich korrekte, verständliche Formulierungen. (7 BE)',
    solutionContent:
      'Beschädigte Isolierung kann leitende Teile berührbar machen. Isolierung verhindert Kontakt, der Schutzleiter schafft im Fehlerfall einen niederohmigen Ableitweg, die Sicherung schützt Leitungen vor zu großer Stromstärke und die Fehlerstrom-Schutzeinrichtung trennt bei einer Differenz der Ströme schnell ab; keine einzelne Maßnahme rechtfertigt Berührung. Ein geschlossenes Gebäude ist ein geeigneterer Schutzort, während am einzelnen Baum Seitenblitz, Schrittspannung und herabfallende Teile gefährlich sind. Eine gute Unterweisung benennt konkrete Handlungen, belegt sie an der Skizze und erklärt fachsprachlich: Eine Sicherung unterbricht den Stromkreis bei zu großer Stromstärke, sie verbraucht keinen Strom; isolierende Stoffe senken Risiken nur bei intaktem, geeignetem Aufbau und machen Elektrizität nicht bedingungslos ungefährlich.',
    scoring: {
      maxPoints: 18,
      passingPoints: 11,
      steps: [
        { id: 'safety_briefing_1', points: 7, description: 'Gefahren und vier unterschiedliche Schutzfunktionen am Haushaltsstromkreis erklärt' },
        { id: 'safety_briefing_2', points: 4, description: 'Gewitterverhalten für beide Situationen physikalisch begründet' },
        { id: 'safety_briefing_3', points: 7, description: 'Adressatengerechte Fachpräsentation mit Materialbelegen und korrigierter Alltagssprache strukturiert' },
      ],
    },
  },
  {
    shortKey: 'canonical_physics_sek1_assessment_bavaria_motor_transformer_lab',
    id: '11c964ff-be82-5d02-8cd7-ccb41cda8f4f',
    title: 'Prüfungsaufgabe: Motor und Transformator untersuchen',
    titleEn: 'Assessment Task: Investigate a Motor and Transformer',
    description:
      'Die lernende Person kann einen einfachen Kleinspannungsmotor aufbauen und gezielt variieren sowie Aufbau, Induktionsprinzip, Spannungs- und Stromübersetzung eines idealen Transformators mit Energieerhaltung erklären.',
    descriptionEn:
      'The learner can build and deliberately vary a simple low-voltage motor and explain the construction, induction principle, voltage and current transformation of an ideal transformer using energy conservation.',
    requires: ['eb30189c-27c6-510b-b235-6543afa18b90', 'af1094c1-511a-5aae-9e0a-3e9196a82d9a'],
    applicability: ['DE-BY'],
    area: 'Elektromagnetismus',
    topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BAVARIA.MOTOR_TRANSFORMER_LAB',
    processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
    guidingIdeas: ['LI_FELDER', 'LI_ENERGIE', 'LI_TECHNIK'],
    coveredGoalIds: ['eb30189c-27c6-510b-b235-6543afa18b90', 'af1094c1-511a-5aae-9e0a-3e9196a82d9a'],
    coveredStrands: ['LI_FELDER', 'LI_ENERGIE', 'LI_TECHNIK'],
    applicabilityFromRequires: false,
    applicabilityOverrides: { jurisdiction: ['DE-BY'] },
    taskContent:
      '**Teil A – Motor, ausschließlich Kleinspannung:** Bauen Sie aus Spule, Permanentmagnet, Stromwender und 6-V-Quelle einen einfachen Motor. (1) Dokumentieren Sie den Aufbau und erklären Sie die Drehwirkung über Magnetfeld und Kraft auf stromdurchflossene Leiter. (6 BE) (2) Untersuchen Sie nacheinander die Wirkung umgekehrter Stromrichtung, umgekehrter Magnetpolung und erhöhter Stromstärke innerhalb der Gerätegrenze. Protokollieren Sie Drehrichtung beziehungsweise Laufverhalten und erklären Sie die Beobachtungen. (6 BE)\n\n**Teil B – Transformator:** Ein sicherer Schultransformator hat N₁ = 1200 und N₂ = 120 Windungen. An der Primärspule liegen ausdrücklich U₁ = 12,0 V Wechselspannung; sekundär fließen ideal I₂ = 0,60 A. (3) Skizzieren und beschriften Sie Primärspule, Sekundärspule und gemeinsamen Eisenkern. Erklären Sie die Induktionskette vom Wechselstrom bis zur Sekundärspannung. (5 BE) (4) Berechnen Sie U₂ und I₁ für den idealen Transformator. Begründen Sie die gegenläufige Stromübersetzung mit P₁ = P₂ und nennen Sie eine reale Verlustursache. (7 BE)',
    solutionContent:
      'Im Motor erzeugt die stromdurchflossene Spule im Magnetfeld ein Drehmoment; der Stromwender kehrt die Stromrichtung passend um. Das Umpolen genau einer Einflussgröße kehrt die Drehrichtung um, das gleichzeitige Umpolen von Strom und Magnetfeld nicht. Größere Stromstärke verstärkt innerhalb der sicheren Grenze typischerweise die Kraftwirkung. Der Transformator besitzt zwei elektrisch getrennte Spulen auf einem gemeinsamen Kern. Wechselstrom erzeugt einen veränderlichen magnetischen Fluss, der in der Sekundärspule eine Spannung induziert. Ideal gilt U₂/U₁ = N₂/N₁ = 0,10, also U₂ = 1,20 V. Wegen U₁I₁ = U₂I₂ folgt I₁ = 0,060 A. Die Stromstärke wird gegenläufig übersetzt, weil ideal die Leistung erhalten bleibt; reale Verluste entstehen etwa durch Erwärmung der Spulen oder Wirbelströme.',
    scoring: {
      maxPoints: 24,
      passingPoints: 14,
      steps: [
        { id: 'motor_transformer_1', points: 6, description: 'Kleinspannungsmotor aufgebaut, dokumentiert und Kraftwirkung erklärt' },
        { id: 'motor_transformer_2', points: 6, description: 'Drei gezielte Variationen praktisch untersucht und Beobachtungen erklärt' },
        { id: 'motor_transformer_3', points: 5, description: 'Transformatoraufbau und Induktionskette vollständig erklärt' },
        { id: 'motor_transformer_4', points: 7, description: 'Spannungs- und Stromübersetzung berechnet, Energieerhaltung begründet und Verlust benannt' },
      ],
    },
  },
  {
    shortKey: 'canonical_physics_sek1_assessment_bavaria_radiation_risk',
    id: '77b23e86-c39f-589e-8460-b28883baea51',
    title: 'Prüfungsaufgabe: Anwendungen radioaktiver Strahlung abwägen',
    titleEn: 'Assessment Task: Weigh Applications of Radioactive Radiation',
    description:
      'Die lernende Person kann Nutzen und Risiken radioaktiver Strahlung in Medizin und Technik anhand gegebener Dosis-, Expositions- und Alternativdaten qualitativ beurteilen und Unsicherheiten des Vergleichs offenlegen.',
    descriptionEn:
      'The learner can qualitatively assess benefits and risks of radioactive radiation in medicine and technology using dose, exposure, and alternative data and disclose uncertainties in the comparison.',
    requires: ['979e0d0d-8933-4ace-814f-f28060ad280f'],
    applicability: ['DE-BY'],
    area: 'Radioaktivität',
    topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BAVARIA.RADIATION_RISK',
    processCompetencies: ['PK4_KOMMUNIZIEREN', 'PK5_BEWERTEN'],
    guidingIdeas: ['LI_MATERIE', 'LI_TECHNIK'],
    coveredGoalIds: ['979e0d0d-8933-4ace-814f-f28060ad280f'],
    coveredStrands: ['LI_MATERIE', 'LI_TECHNIK'],
    applicabilityFromRequires: false,
    applicabilityOverrides: { jurisdiction: ['DE-BY'] },
    taskContent:
      '**Material:** Anwendung M ist eine medizinisch begründete Tracer-Untersuchung mit 2,0 mSv effektiver Dosis; eine strahlungsfreie Alternative liefert in diesem Fall deutlich geringere diagnostische Genauigkeit. Anwendung T ist eine gekapselte Quelle zur Dickenmessung in einer Industrieanlage; Beschäftigte erhalten nach Überwachungsdaten höchstens 0,05 mSv pro Jahr, bei beschädigter Abschirmung wäre lokale Exposition möglich. Als Vergleichswert sind etwa 2,1 mSv natürliche Strahlenexposition pro Jahr angegeben.\n\n1. Stellen Sie für M und T jeweils den physikalischen Nutzen, den möglichen Expositionsweg und mindestens eine für die jeweilige Anwendung passende konkrete Maßnahme zur Begrenzung durch kurze Dauer, großen Abstand, Abschirmung oder kleine medizinisch ausreichende Aktivität gegenüber. (6 BE)\n2. Formulieren Sie für M eine begründete Nutzen-Risiko-Entscheidung, die diagnostischen Zusatznutzen, Dosisvergleich, individuelle Rechtfertigung und eine Unsicherheit berücksichtigt. (5 BE)\n3. Beurteilen Sie für T den Normalbetrieb und einen Abschirmungsdefekt getrennt. Erklären Sie, warum weder „unter der natürlichen Jahresdosis“ noch „radioaktiv“ allein ein abschließendes Sicherheitsurteil liefert. (5 BE)',
    solutionContent:
      'Der Tracer liefert diagnostische Information, exponiert aber den Körper; die Anwendung ist nur bei medizinischer Rechtfertigung und mit der kleinsten diagnostisch ausreichenden Aktivität sowie möglichst kurzer Handhabungsdauer sinnvoll. Nach Aufnahme des Tracers verringert ein größerer Abstand zur Patientin oder zum Patienten deren innere Exposition nicht; er kann aber zusammen mit Abschirmung und kurzer Aufenthaltsdauer die berufliche Exposition des Personals begrenzen. Die gekapselte Quelle ermöglicht berührungslose Dickenmessung; Abstand, Abschirmung, kurze Aufenthaltsdauer, Zugangskontrolle und Überwachung begrenzen die Exposition. Der Vergleich mit 2,1 mSv ordnet Größenordnungen ein, ersetzt aber keine individuelle Risikoprognose und hängt von Strahlenart, Verteilung und Unsicherheit ab. Für T spricht im ungestörten Betrieb die sehr kleine überwachte Dosis, während ein Defekt eine neue Gefährdungsbeurteilung, Absperrung und fachkundige Prüfung verlangt. Ein Urteil muss Anwendung, Expositionspfad, Alternativen und Schutzmaßnahmen gemeinsam berücksichtigen.',
    scoring: {
      maxPoints: 16,
      passingPoints: 10,
      steps: [
        { id: 'radiation_risk_1', points: 6, description: 'Nutzen, Expositionsweg und konkrete Begrenzungsmaßnahmen für Medizin und Technik gegenübergestellt' },
        { id: 'radiation_risk_2', points: 5, description: 'Medizinische Anwendung mit Dosis, Zusatznutzen, Rechtfertigung und Unsicherheit abgewogen' },
        { id: 'radiation_risk_3', points: 5, description: 'Technischen Normal- und Fehlerfall getrennt beurteilt und verkürzte Sicherheitsurteile zurückgewiesen' },
      ],
    },
  },
]

const makeRouteAssessmentSpec = ({
  coveredGoalIds,
  applicability,
  ...spec
}: JsonRecord): JsonRecord => ({
  ...spec,
  guidingIdeas: [...new Set((spec.guidingIdeas ?? []).map((guidingIdea: string) => ({
    LI_KRAEFTE: 'LI_BEWEGUNG',
    LI_ERHALTUNG: 'LI_ENERGIE',
    LI_WECHSELWIRKUNG: 'LI_FELDER',
    LI_UMWELT: 'LI_TECHNIK',
    LI_LADUNG: 'LI_FELDER',
    LI_DATEN: 'LI_TECHNIK',
    LI_MODELLE: 'LI_TECHNIK',
    LI_BIOPHYSIK: 'LI_MATERIE',
  })[guidingIdea] ?? guidingIdea))],
  coveredStrands: [...new Set((spec.coveredStrands ?? []).map((guidingIdea: string) => ({
    LI_KRAEFTE: 'LI_BEWEGUNG',
    LI_ERHALTUNG: 'LI_ENERGIE',
    LI_WECHSELWIRKUNG: 'LI_FELDER',
    LI_UMWELT: 'LI_TECHNIK',
    LI_LADUNG: 'LI_FELDER',
    LI_DATEN: 'LI_TECHNIK',
    LI_MODELLE: 'LI_TECHNIK',
    LI_BIOPHYSIK: 'LI_MATERIE',
  })[guidingIdea] ?? guidingIdea))],
  requires: [...coveredGoalIds],
  applicability,
  coveredGoalIds: [...coveredGoalIds],
  applicabilityFromRequires: false,
  applicabilityOverrides: { jurisdiction: [...applicability] },
})

assessmentSpecs.push(
  ...[
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_by_collision_inertia',
      id: '68061652-d617-5e51-8d2a-1c686c3c49df',
      title: 'Prüfungsaufgabe: Trägheit, Kraftstoß und Stoßvorgang untersuchen',
      titleEn: 'Assessment Task: Investigate Inertia, Impulse, and a Collision',
      description:
        'Die lernende Person kann Trägheit und Kräftegleichgewicht unterscheiden, einen Kraftstoß mit einer Impulsänderung verknüpfen und einen einfachen Stoß mit Impuls- und Energieerhaltung quantitativ untersuchen.',
      descriptionEn:
        'The learner can distinguish inertia from force equilibrium, link an impulse to a change in momentum, and quantitatively investigate a simple collision using momentum and energy conservation.',
      coveredGoalIds: [
        '2eecd0e2-a7ca-4568-9b12-3d47706c65fb',
        'e790de73-f8e5-4027-bc05-9f12a0e8c9cb',
        '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
      ],
      applicability: ['DE-BW', 'DE-BY'],
      area: 'Mechanik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW_BY.COLLISION_INERTIA',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_KRAEFTE', 'LI_ERHALTUNG'],
      coveredStrands: ['LI_KRAEFTE', 'LI_ERHALTUNG'],
      taskContent:
        '**Material:** Wagen A (0,40 kg) fährt mit 1,5 m/s nach rechts, Wagen B (0,20 kg) ruht. Nach einem geradlinigen elastischen Stoß fährt A mit 0,50 m/s nach rechts. Während eines vorangehenden Anstoßes wirkte auf A für 0,20 s eine mittlere Kraft von 3,0 N.\n\n1. Ein dritter Wagen fährt auf gerader waagerechter Bahn mit konstanter Geschwindigkeit. Erläutern Sie mit Newtons erstem Axiom, warum dafür keine resultierende Kraft nötig ist, und grenzen Sie dies von „es wirkt gar keine Kraft“ ab. (5 BE)\n2. Bestimmen Sie den Kraftstoß des vorangehenden Anstoßes und die dadurch verursachte Impulsänderung von A. Geben Sie die Richtung an. (5 BE)\n3. Bestimmen Sie mit Impulserhaltung die Geschwindigkeit von B nach dem Stoß. Prüfen Sie anschließend über die kinetischen Energien vor und nach dem Stoß, ob die Angabe „elastisch“ zu den Daten passt, und erläutern Sie die Rolle beider Erhaltungssätze. (8 BE)',
      solutionContent:
        'Bei konstanter Geschwindigkeit ist die resultierende Kraft null; einzelne Kräfte können sich dennoch ausgleichen. Der Kraftstoß beträgt 3,0 N · 0,20 s = 0,60 Ns nach rechts und entspricht der Impulsänderung. Vor dem Stoß ist p = 0,40 kg · 1,5 m/s = 0,60 kg m/s. Danach trägt A 0,20 kg m/s; daher gilt für B p = 0,40 kg m/s und v = 2,0 m/s. Die kinetische Energie beträgt vorher 0,45 J und nachher 0,05 J + 0,40 J = 0,45 J. Impuls und kinetische Energie sind damit erhalten; die Daten sind mit einem elastischen Stoß vereinbar.',
      scoring: {
        maxPoints: 18,
        passingPoints: 11,
        steps: [
          { id: 'collision_inertia_1', points: 5, description: 'Trägheitsprinzip und Kräftegleichgewicht fachlich unterschieden' },
          { id: 'collision_inertia_2', points: 5, description: 'Kraftstoß mit Betrag, Richtung und Impulsänderung bestimmt' },
          { id: 'collision_inertia_3', points: 8, description: 'Stoß über Impuls und Energie quantitativ geprüft und Erhaltungssätze erklärt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_by_motion_models',
      id: 'dfd2628f-b44e-51b3-86e8-99158861be8c',
      title: 'Prüfungsaufgabe: Wurf- und Bremsbewegungen modellieren',
      titleEn: 'Assessment Task: Model Projectile and Braking Motion',
      description:
        'Die lernende Person kann einen waagerechten Wurf als Bewegungsüberlagerung untersuchen und Reaktions- sowie Bremswegmodelle zur Bewertung eines Sicherheitsabstands nutzen.',
      descriptionEn:
        'The learner can investigate a horizontal projectile as superposed motions and use reaction- and braking-distance models to assess a safe following distance.',
      coveredGoalIds: [
        '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2',
        '4a2bf015-052b-4af0-aed7-324259fa1a8a',
      ],
      applicability: ['DE-BW', 'DE-BY'],
      area: 'Mechanik und Verkehr',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW_BY.MOTION_MODELS',
      processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK5_BEWERTEN'],
      guidingIdeas: ['LI_BEWEGUNG', 'LI_TECHNIK'],
      coveredStrands: ['LI_BEWEGUNG', 'LI_TECHNIK'],
      taskContent:
        '**Teil A – waagerechter Wurf:** Eine Kugel verlässt einen Tisch waagerecht mit 2,0 m/s. Ein Video liefert nach 0,10 s, 0,20 s und 0,30 s die horizontalen Wege 0,20 m, 0,40 m und 0,60 m sowie die Fallstrecken 0,05 m, 0,20 m und 0,44 m. Beschreiben Sie eine Videoauswertung, stellen Sie beide Teilbewegungen getrennt dar und begründen Sie aus den Daten die Form der x-y-Bahn. (8 BE)\n\n**Teil B – Verkehr:** Für ein Auto gilt im betrachteten Modell: Reaktionszeit 1,0 s; bei 50 km/h beträgt der Bremsweg 14 m, bei 100 km/h 56 m. Berechnen Sie jeweils den Reaktionsweg, bestimmen Sie den Anhalteweg und beurteilen Sie die Aussage „Doppelte Geschwindigkeit braucht nur den doppelten Sicherheitsabstand“. Nennen Sie eine Grenze des Modells. (8 BE)',
      solutionContent:
        'Die x-Koordinate wird Bild für Bild relativ zu einem Maßstab erfasst. Sie wächst in gleichen Zeiten gleichmäßig; die Fallstrecke wächst überproportional. Die Überlagerung einer gleichförmigen horizontalen und beschleunigten vertikalen Bewegung ergibt eine parabelförmige Bahn. 50 km/h entsprechen etwa 13,9 m/s, 100 km/h etwa 27,8 m/s. Die Anhaltewege sind damit ungefähr 27,9 m und 83,8 m. Der zweite ist deutlich mehr als doppelt so groß, weil der Bremsweg im Modell quadratisch mit der Geschwindigkeit zunimmt. Wetter, Reifen, Gefälle und tatsächliche Reaktionszeit begrenzen die Übertragbarkeit.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'motion_models_1', points: 8, description: 'Waagerechten Wurf aus Videodaten als Überlagerung untersucht und Bahnform begründet' },
          { id: 'motion_models_2', points: 8, description: 'Reaktions-, Brems- und Anhalteweg berechnet, Aussage bewertet und Modellgrenze benannt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_by_nuclear_structure_decay',
      id: 'b8c3dfb7-9286-52ac-8b0f-ad0a0ce941ed',
      title: 'Prüfungsaufgabe: Materiestruktur und radioaktiven Zerfall ordnen',
      titleEn: 'Assessment Task: Organize Matter Structure and Radioactive Decay',
      description:
        'Die lernende Person kann Quarks und Leptonen in einem einfachen Strukturmodell der Materie einordnen sowie Aktivität, Halbwertszeit und eine Zerfallsfolge aus Daten deuten.',
      descriptionEn:
        'The learner can place quarks and leptons in a simple structural model of matter and interpret activity, half-life, and a decay sequence from data.',
      coveredGoalIds: [
        'b3f3f4f7-b5cc-40e1-b57a-3d93649baa61',
        'a12fddce-0215-58d9-bd91-21be8a960d25',
      ],
      applicability: ['DE-BW', 'DE-BY'],
      area: 'Kern- und Teilchenphysik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW_BY.NUCLEAR_STRUCTURE_DECAY',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
      guidingIdeas: ['LI_MATERIE', 'LI_ERHALTUNG'],
      coveredStrands: ['LI_MATERIE', 'LI_ERHALTUNG'],
      taskContent:
        '**Material A:** Zu ordnen sind Elektron, Up-Quark, Down-Quark, Proton und Neutron.\n\n1. Erstellen Sie ein einfaches Strukturmodell: Kennzeichnen Sie Quarks und Leptonen und geben Sie die Quarkzusammensetzung von Proton und Neutron an. Erklären Sie, in welchem Sinn Quarks und Elektronen in diesem Modell elementare Bausteine sind. (7 BE)\n\n**Material B:** Die separat gemessene Aktivität der Mutterkerne beträgt zu Beginn 800 Bq, nach 6 h 400 Bq und nach 12 h 200 Bq. Die Aktivität bereits entstandener Tochterkerne ist in diesen Werten ausdrücklich nicht enthalten. Der Tochterkern zerfällt durch einen weiteren Beta-Zerfall zu einem stabilen Kern.\n\n2. Bestimmen Sie die Halbwertszeit der Mutterkerne, prognostizieren Sie deren Aktivität nach 24 h und erläutern Sie, was 800 Bq hier aussagt. (6 BE)\n3. Beschreiben Sie die qualitative Zerfallsfolge Mutterkern – Tochterkern – stabiler Kern und erklären Sie, warum die Halbwertszeit keine Lebensdauer eines einzelnen Kerns vorhersagt. (5 BE)',
      solutionContent:
        'Elektronen gehören zu den Leptonen, Up- und Down-Quarks zu den Quarks. Ein Proton besteht aus uud, ein Neutron aus udd. Proton und Neutron sind somit zusammengesetzt, Quarks und Elektronen werden im einfachen Modell als elementar behandelt. Die Halbwertszeit der Mutterkerne beträgt 6 h; nach 24 h sind vier Halbwertszeiten vergangen, also beträgt ihre separat betrachtete Aktivität 50 Bq. 800 Bq bedeutet hier im Mittel 800 Zerfälle der Mutterkerne pro Sekunde. Eine Gesamtaktivität einschließlich der Tochterkerne wäre ohne deren Halbwertszeit und Aktivitätsverlauf nicht bestimmbar. Die Folge führt über einen radioaktiven Tochterkern zu einem stabilen Kern. Die Halbwertszeit beschreibt ein statistisches Ensemble und nicht den Zerfallszeitpunkt eines einzelnen Kerns.',
      scoring: {
        maxPoints: 18,
        passingPoints: 11,
        steps: [
          { id: 'nuclear_structure_1', points: 7, description: 'Quarks, Leptonen, Proton und Neutron im Strukturmodell korrekt geordnet' },
          { id: 'nuclear_structure_2', points: 6, description: 'Aktivität und Halbwertszeit aus Daten bestimmt und interpretiert' },
          { id: 'nuclear_structure_3', points: 5, description: 'Zerfallsfolge und statistische Bedeutung der Halbwertszeit erklärt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_by_nuclear_reactions_options',
      id: 'a77e53d5-246d-52df-86a2-d14f7a08fb77',
      title: 'Prüfungsaufgabe: Kernreaktionen und Energieoptionen bewerten',
      titleEn: 'Assessment Task: Evaluate Nuclear Reactions and Energy Options',
      description:
        'Die lernende Person kann Spaltung und Fusion qualitativ unterscheiden und eine Kernenergieoption anhand physikalischer Kriterien, Sicherheitsaspekten und ausgewiesenen Unsicherheiten bewerten.',
      descriptionEn:
        'The learner can qualitatively distinguish fission from fusion and evaluate a nuclear-energy option using physical criteria, safety aspects, and stated uncertainties.',
      coveredGoalIds: [ids.nuclearReactions, ids.nuclearEnergyOptions],
      applicability: ['DE-BW', 'DE-BY'],
      area: 'Kernphysik und Energie',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW_BY.NUCLEAR_REACTIONS_OPTIONS',
      processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN', 'PK5_BEWERTEN'],
      guidingIdeas: ['LI_MATERIE', 'LI_ENERGIE', 'LI_TECHNIK'],
      coveredStrands: ['LI_MATERIE', 'LI_ENERGIE', 'LI_TECHNIK'],
      taskContent:
        '**Material:** Option S nutzt kontrollierte Kernspaltung. Sie liefert wetterunabhängig Strom, erzeugt langlebige radioaktive Abfälle und benötigt gestaffelte Sicherheitssysteme. Option F wäre eine Fusionsanlage; bei Versagen endet die Fusionsreaktion, aber Werkstoffe können aktiviert werden. Für F sind Baukosten und erreichbarer Dauerbetrieb noch unsicher.\n\n1. Beschreiben Sie für Spaltung und Fusion jeweils Ausgangskerne, typische Produkte und die Herkunft der frei werdenden Energie qualitativ. Grenzen Sie eine kontrollierte Reaktion von einer unkontrollierten Kettenreaktion ab. (7 BE)\n2. Entwickeln Sie vier physikalische Bewertungskriterien, darunter Energieverfügbarkeit, Strahlenschutz beziehungsweise Abfall und technische Beherrschbarkeit. Wenden Sie sie getrennt auf S und F an. (7 BE)\n3. Formulieren Sie ein begründetes, bedingtes Urteil. Kennzeichnen Sie mindestens zwei Unsicherheiten und erklären Sie, welche zusätzliche Mess- oder Betriebsinformation Ihr Urteil ändern könnte. (6 BE)',
      solutionContent:
        'Bei der Spaltung zerfällt ein schwerer Kern in leichtere Kerne, Neutronen und Energie; freigesetzte Neutronen können weitere Spaltungen auslösen. Bei der Fusion verbinden sich leichte Kerne zu einem schwereren Kern. In beiden Fällen wird Bindungsenergie frei. Eine kontrollierte Spaltung hält die Kettenreaktion regelbar; eine unkontrollierte wächst stark an. Vier gemeinsame Kriterien sind getrennt anzuwenden: Bei der Energieverfügbarkeit liefert S laut Material wetterunabhängig Strom, während für F der Dauerbetrieb noch nicht belegt ist. Bei Strahlenschutz und Abfall erzeugt S langlebige radioaktive Abfälle; bei F können aktivierte Werkstoffe ebenfalls Strahlenschutz und einen Entsorgungsweg erfordern. Bei der technischen Beherrschbarkeit braucht S gestaffelte Sicherheitssysteme, während bei F die Reaktion bei Versagen endet, die Materialaktivierung aber bestehen bleibt. Bei Kosten und Betriebssicherheit sind Baukosten und Dauerbetrieb von F ausdrücklich unsicher; für S fehlen im Material Kostendaten, sodass ein wirtschaftliches Ranking nicht zulässig ist. Das bedingte Urteil muss diese ungleiche Datenlage offenlegen und kann sich durch nachgewiesenen Dauerbetrieb, belastbare Kosten, Abfallpfade und gemessene Störfall- beziehungsweise Verfügbarkeitsdaten ändern.',
      scoring: {
        maxPoints: 20,
        passingPoints: 12,
        steps: [
          { id: 'nuclear_options_1', points: 7, description: 'Spaltung und Fusion einschließlich Reaktionskontrolle qualitativ erklärt' },
          { id: 'nuclear_options_2', points: 7, description: 'Beide Optionen mit gemeinsamen physikalischen Kriterien verglichen' },
          { id: 'nuclear_options_3', points: 6, description: 'Bedingtes Urteil mit Unsicherheiten und entscheidungsrelevanten Informationen formuliert' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_by_gas_theory',
      id: 'e1794352-ceee-5c27-8be4-224592ddbb89',
      title: 'Prüfungsaufgabe: Temperatur mit dem Teilchenmodell erklären',
      titleEn: 'Assessment Task: Explain Temperature with the Particle Model',
      description:
        'Die lernende Person kann absolute Temperatur mit mittlerer kinetischer Teilchenenergie verknüpfen und makroskopische Beobachtungen mithilfe der kinetischen Gastheorie erklären.',
      descriptionEn:
        'The learner can link absolute temperature to average particle kinetic energy and explain macroscopic observations using kinetic gas theory.',
      coveredGoalIds: ['37b33812-d428-5953-852e-57a53a4347fe'],
      applicability: ['DE-BW', 'DE-BY'],
      area: 'Wärmelehre',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW_BY.GAS_THEORY',
      processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_MATERIE', 'LI_ENERGIE'],
      coveredStrands: ['LI_MATERIE', 'LI_ENERGIE'],
      taskContent:
        '**Material:** Zwei gleichartige, starre und geschlossene Gasbehälter enthalten gleich viele Teilchen. Behälter A hat 300 K, Behälter B 450 K. Eine Simulation zeigt in B eine größere mittlere Teilchengeschwindigkeit, aber weiterhin auch langsame Teilchen.\n\n1. Erklären Sie auf Teilchenebene, was die unterschiedlichen absoluten Temperaturen über die mittlere kinetische Energie aussagen. (5 BE)\n2. Skizzieren Sie für beide Behälter qualitative Geschwindigkeitsverteilungen und erklären Sie, warum nicht alle Teilchen dieselbe Geschwindigkeit haben. (5 BE)\n3. Begründen Sie qualitativ, warum der Druck in B bei gleichem Volumen größer ist, und widerlegen Sie die Aussage „450 K bedeutet, jedes Teilchen bewegt sich genau 1,5-mal so schnell“. (6 BE)',
      solutionContent:
        'Eine höhere absolute Temperatur bedeutet eine höhere mittlere kinetische Energie der ungeordneten Teilchenbewegung. Die Geschwindigkeiten sind verteilt; bei 450 K ist die Verteilung zu größeren Werten verschoben, ohne dass alle Teilchen gleich schnell sind. Schnellere Teilchen übertragen bei häufigeren beziehungsweise stärkeren Wandstößen im Mittel mehr Impuls, wodurch der Druck steigt. Aus dem Verhältnis der Temperaturen folgt ein Verhältnis mittlerer kinetischer Energien, nicht eine für jedes Teilchen feste Geschwindigkeit; charakteristische Geschwindigkeiten skalieren zudem mit der Quadratwurzel der Temperatur.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'gas_theory_1', points: 5, description: 'Absolute Temperatur und mittlere kinetische Energie verknüpft' },
          { id: 'gas_theory_2', points: 5, description: 'Qualitative Geschwindigkeitsverteilungen und Streuung erklärt' },
          { id: 'gas_theory_3', points: 6, description: 'Druckänderung mikroskopisch begründet und Fehlvorstellung korrigiert' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_inelastic_collision',
      id: 'b637582c-a618-5698-817a-8d7bd1fa05f6',
      title: 'Prüfungsaufgabe: Einen inelastischen Stoß bilanzieren',
      titleEn: 'Assessment Task: Balance an Inelastic Collision',
      description:
        'Die lernende Person kann einen eindimensionalen inelastischen Stoß mit Impulserhaltung berechnen und die dabei auftretende Energieumwandlung qualitativ deuten.',
      descriptionEn:
        'The learner can calculate a one-dimensional inelastic collision using momentum conservation and qualitatively interpret the associated energy conversion.',
      coveredGoalIds: ['0da13365-02c2-44f1-8a81-d524ca0ac3ae'],
      applicability: ['DE-BW'],
      area: 'Mechanik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.INELASTIC_COLLISION',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
      guidingIdeas: ['LI_ERHALTUNG', 'LI_ENERGIE'],
      coveredStrands: ['LI_ERHALTUNG', 'LI_ENERGIE'],
      taskContent:
        'Ein Wagen mit 0,60 kg fährt mit 1,2 m/s nach rechts und stößt auf einen ruhenden Wagen mit 0,30 kg. Beide Wagen kuppeln und fahren gemeinsam weiter.\n\n1. Zeichnen Sie den Zustand vor und nach dem Stoß mit gewählter positiver Richtung. (3 BE)\n2. Berechnen Sie die gemeinsame Geschwindigkeit aus der Impulserhaltung. (5 BE)\n3. Vergleichen Sie die kinetischen Energien vor und nach dem Stoß. Erklären Sie, warum der fehlende Anteil die Energieerhaltung nicht verletzt, und nennen Sie zwei plausible Umwandlungsformen. (6 BE)',
      solutionContent:
        'Vorher beträgt der Impuls 0,60 kg · 1,2 m/s = 0,72 kg m/s. Nachher bewegen sich 0,90 kg gemeinsam, also v = 0,80 m/s nach rechts. Die kinetische Energie sinkt von 0,432 J auf 0,288 J. Die Differenz 0,144 J wird unter anderem in Verformung, innere Energie und Schall umgewandelt; der Impuls des abgeschlossenen Systems bleibt erhalten.',
      scoring: {
        maxPoints: 14,
        passingPoints: 8,
        steps: [
          { id: 'inelastic_1', points: 3, description: 'Stoßzustände und Richtung eindeutig modelliert' },
          { id: 'inelastic_2', points: 5, description: 'Gemeinsame Geschwindigkeit aus Impulserhaltung berechnet' },
          { id: 'inelastic_3', points: 6, description: 'Kinetische Energien verglichen und Energieumwandlung erklärt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_falling_with_drag',
      id: 'b7e366e2-8323-5171-83a1-1f536c2062d8',
      title: 'Prüfungsaufgabe: Einen Fall mit Luftwiderstand modellieren',
      titleEn: 'Assessment Task: Model a Fall with Drag',
      description:
        'Die lernende Person kann einen Fall mit Luftwiderstand aus Geschwindigkeitsdaten modellieren und das Entstehen einer Grenzgeschwindigkeit über das Kräftegleichgewicht erklären.',
      descriptionEn:
        'The learner can model a fall with drag from velocity data and explain the emergence of terminal speed through force equilibrium.',
      coveredGoalIds: [ids.fallingWithDrag],
      applicability: ['DE-BW'],
      area: 'Mechanik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.FALLING_WITH_DRAG',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
      guidingIdeas: ['LI_BEWEGUNG', 'LI_KRAEFTE'],
      coveredStrands: ['LI_BEWEGUNG', 'LI_KRAEFTE'],
      taskContent:
        'Für einen fallenden Filter werden in Abständen von 0,20 s die Geschwindigkeiten 0, 1,8, 3,0, 3,8, 4,3 und 4,5 m/s gemessen.\n\n1. Zeichnen Sie ein v-t-Diagramm, bestimmen Sie für die ersten vier Intervalle mittlere Beschleunigungen und beschreiben Sie deren Entwicklung. (6 BE)\n2. Zeichnen Sie zu drei geeigneten Zeitpunkten Kräftepfeile für Gewichtskraft, Luftwiderstand und resultierende Kraft. Verknüpfen Sie deren Entwicklung mit den Messdaten. (5 BE)\n3. Erklären Sie den Begriff Grenzgeschwindigkeit und sagen Sie begründet voraus, wie eine größere Querschnittsfläche bei unveränderter Masse die Kurve und die Grenzgeschwindigkeit verändert. (5 BE)',
      solutionContent:
        'Die Geschwindigkeit nähert sich einem Wert wenig oberhalb von 4,5 m/s; die mittleren Beschleunigungen nehmen in den ersten vier Intervallen von 9,0 über 6,0 und 4,0 auf 2,5 m/s² ab und bleiben damit unter der Erdbeschleunigung. Die Gewichtskraft bleibt näherungsweise konstant, während der Luftwiderstand mit der Geschwindigkeit wächst. Dadurch sinken resultierende Kraft und Beschleunigung. Bei Grenzgeschwindigkeit sind Luftwiderstand und Gewichtskraft betragsgleich. Eine größere Querschnittsfläche erhöht bei gleicher Geschwindigkeit den Widerstand, sodass die Annäherung früher erfolgt und die Grenzgeschwindigkeit kleiner ist.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'falling_drag_1', points: 6, description: 'Geschwindigkeitsdaten als Diagramm und abnehmende Beschleunigungen ausgewertet' },
          { id: 'falling_drag_2', points: 5, description: 'Kräfteentwicklung konsistent mit den Messdaten dargestellt' },
          { id: 'falling_drag_3', points: 5, description: 'Grenzgeschwindigkeit und Einfluss der Querschnittsfläche modellgestützt erklärt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_circular_motion',
      id: 'b1808b4c-5e02-5e1f-831f-47ee126e00ee',
      title: 'Prüfungsaufgabe: Eine Kurvenfahrt mit Zentripetalkraft analysieren',
      titleEn: 'Assessment Task: Analyze Cornering with Centripetal Force',
      description:
        'Die lernende Person kann eine gleichförmige Kreisbewegung mit Zentripetalbeschleunigung und Zentripetalkraft quantitativ analysieren und das Modell auf eine Kurvenfahrt anwenden.',
      descriptionEn:
        'The learner can quantitatively analyze uniform circular motion using centripetal acceleration and force and apply the model to cornering.',
      coveredGoalIds: ['accb1d9e-cd48-5983-bcef-9b9bca4a9114'],
      applicability: ['DE-BW'],
      area: 'Mechanik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.CIRCULAR_MOTION',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK5_BEWERTEN'],
      guidingIdeas: ['LI_BEWEGUNG', 'LI_KRAEFTE'],
      coveredStrands: ['LI_BEWEGUNG', 'LI_KRAEFTE'],
      taskContent:
        'Ein Fahrrad samt Person hat 80 kg und fährt mit 6,0 m/s auf einer waagerechten Kreisbahn mit Radius 18 m. Die seitliche Haftreibung kann höchstens 220 N betragen.\n\n1. Zeichnen Sie Geschwindigkeits- und Beschleunigungsvektor an drei Punkten der Bahn und erläutern Sie, warum trotz konstantem Geschwindigkeitsbetrag eine Beschleunigung vorliegt. (5 BE)\n2. Berechnen Sie Zentripetalbeschleunigung und Zentripetalkraft und ordnen Sie die Haftreibung als verursachende Kraft ein. (5 BE)\n3. Bestimmen Sie die größte im Modell sichere Geschwindigkeit. Prüfen Sie außerdem, wie sich die notwendige Zentripetalkraft bei doppelter Geschwindigkeit und bei doppeltem Radius verändert. (6 BE)',
      solutionContent:
        'Der Geschwindigkeitsvektor liegt tangential, der Beschleunigungsvektor zeigt zum Kreismittelpunkt. Die Richtungsänderung der Geschwindigkeit ist eine Beschleunigung. Es gilt a = v²/r = 2,0 m/s² und F = ma = 160 N zum Mittelpunkt; diese Kraft stellt die seitliche Haftreibung bereit. Aus 220 N = m v²/r folgt v ≈ 7,0 m/s. Bei doppelter Geschwindigkeit vervierfacht sich die nötige Kraft, bei doppeltem Radius halbiert sie sich.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'circular_1', points: 5, description: 'Geschwindigkeits- und Beschleunigungsvektoren korrekt dargestellt und erklärt' },
          { id: 'circular_2', points: 5, description: 'Zentripetalbeschleunigung und -kraft berechnet und physikalischer Kraft zugeordnet' },
          { id: 'circular_3', points: 6, description: 'Grenzgeschwindigkeit und Parameterabhängigkeiten quantitativ bestimmt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_gravitation_restoring_force',
      id: 'ac6c578c-401b-5e4b-801a-6dff8fe8b93a',
      title: 'Prüfungsaufgabe: Gravitations- und Rückstellkräfte modellieren',
      titleEn: 'Assessment Task: Model Gravitational and Restoring Forces',
      description:
        'Die lernende Person kann Gravitations- und Gewichtskräfte berechnen sowie aus Federdaten eine lineare Rückstellkraft als Bedingung einer harmonischen Schwingung deuten.',
      descriptionEn:
        'The learner can calculate gravitational and weight forces and use spring data to interpret a linear restoring force as a condition for harmonic motion.',
      coveredGoalIds: [ids.gravitationLawAndWeight, ids.linearRestoringForce],
      applicability: ['DE-BW'],
      area: 'Mechanik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.GRAVITATION_RESTORING_FORCE',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
      guidingIdeas: ['LI_KRAEFTE', 'LI_WECHSELWIRKUNG'],
      coveredStrands: ['LI_KRAEFTE', 'LI_WECHSELWIRKUNG'],
      taskContent:
        '**Material:** Zwei Kraftgesetze werden daten- und diagrammgestützt verglichen. Für einen Satelliten von 500 kg gilt bei den Abständen r = 7,0 · 10⁶ m, 1,4 · 10⁷ m und 2,1 · 10⁷ m vom Erdmittelpunkt die Gravitationskraft F_G = 4080 N, 1020 N und 453 N. Für eine Feder lauten Messwerte (Auslenkung x in cm | rücktreibende Kraft F_R in N): (1|−0,40), (2|−0,80), (3|−1,20), (4|−1,60). Verwenden Sie M_E = 6,0 · 10²⁴ kg und G = 6,67 · 10⁻¹¹ N m²/kg².\n\n1. Prüfen Sie den ersten Gravitationswert mit dem Gravitationsgesetz, bestimmen Sie die örtliche Feldstärke und leiten Sie F_G = m·g her. Grenzen Sie Masse und Gewichtskraft ab. (7 BE)\n2. Stellen Sie die Gravitationsdaten als F_G-gegen-r-Diagramm und die Federdaten als F_R-gegen-x-Diagramm dar. Bestimmen Sie die Federkonstante, deuten Sie das Minuszeichen und begründen Sie den Zusammenhang zur harmonischen Schwingung. (6 BE)\n3. Vergleichen Sie beide Kraftgesetze ausdrücklich hinsichtlich Abstands- beziehungsweise Auslenkungsabhängigkeit, Kraftrichtung, Nullpunkt und Gültigkeitsbereich. Erklären Sie anhand der Daten, warum eine lineare Gerade nur für die Federdaten angemessen ist. (5 BE)',
      solutionContent:
        'Das Gravitationsgesetz liefert etwa 4,08 · 10³ N; die Feldstärke beträgt 8,16 N/kg und damit F_G = m g. Masse ist ortsunabhängig in kg, Gewichtskraft feldabhängig in N. Die Gravitationsdaten fallen mit 1/r² und ergeben keine Gerade gegen r; die Kraft zeigt anziehend zum Erdmittelpunkt und wird erst im Unendlichen null. Für die Feder folgt D = 40 N/m und F_R = −Dx: eine Gerade durch den Ursprung, deren Minuszeichen die Richtung zur Gleichgewichtslage kennzeichnet. Diese lineare Rückstellkraft ermöglicht im elastischen Gültigkeitsbereich harmonische Bewegung. Beide Gesetze modellieren gerichtete Kräfte, unterscheiden sich aber in funktionaler Abhängigkeit, Bezugspunkt und Gültigkeitsbereich.',
      scoring: {
        maxPoints: 18,
        passingPoints: 11,
        steps: [
          { id: 'gravity_restore_1', points: 7, description: 'Gravitationswert, Feldstärke und Gewichtskraft berechnet und Masse abgegrenzt' },
          { id: 'gravity_restore_2', points: 6, description: 'Beide Datensätze diagrammgestützt ausgewertet und Federkraft gedeutet' },
          { id: 'gravity_restore_3', points: 5, description: 'Kraftgesetze nach Abhängigkeit, Richtung, Nullpunkt und Gültigkeit verglichen' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_irreversibility_climate',
      id: '198bfc8c-25f7-5a02-8618-47650ce36d14',
      title: 'Prüfungsaufgabe: Energieumwandlungen und Klimawirkungen beurteilen',
      titleEn: 'Assessment Task: Assess Energy Conversions and Climate Effects',
      description:
        'Die lernende Person kann reversible und irreversible Vorgänge unterscheiden und eine Energieentscheidung anhand physikalischer Klima- und Umwandlungsdaten fachlich diskutieren.',
      descriptionEn:
        'The learner can distinguish reversible and irreversible processes and discuss an energy decision using physical climate and conversion data.',
      coveredGoalIds: [
        '2088ccf0-48f4-51d4-be5f-67affd0fb099',
        'f322c268-dc16-5d50-82dd-209834f20208',
      ],
      applicability: ['DE-BW'],
      area: 'Wärmelehre und Energie',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.IRREVERSIBILITY_CLIMATE',
      processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN', 'PK5_BEWERTEN'],
      guidingIdeas: ['LI_ENERGIE', 'LI_UMWELT'],
      coveredStrands: ['LI_ENERGIE', 'LI_UMWELT'],
      taskContent:
        '**Material:** Ein Gebäude benötigt jährlich 12 000 kWh Wärme. Variante D erzeugt Wärme direkt elektrisch; ihr Strommix verursacht 300 g CO₂-Äquivalent pro kWh. Variante W ist eine Wärmepumpe mit Jahresarbeitszahl 3,0 und demselben Strommix. Für Herstellung und Entsorgung der Wärmepumpe werden über ihre Nutzungszeit zusätzlich 6 000 kg CO₂-Äquivalent angesetzt; die Nutzungszeit ist mit 15 bis 25 Jahren unsicher.\n\n1. Ordnen Sie das Abkühlen eines heißen Körpers in einem Raum und die idealisierte quasistatische Kompression eines Gases als irreversiblen beziehungsweise näherungsweise reversiblen Vorgang ein. Begründen Sie und beschreiben Sie die Konsequenz für die Nutzbarkeit der Energie. (6 BE)\n2. Berechnen Sie die jährlichen betriebsbedingten Emissionen beider Heizvarianten. (5 BE)\n3. Diskutieren Sie die Klimawirkung der Entscheidung über 15 und 25 Jahre. Beziehen Sie Betriebs- und Herstellungsdaten ein, weisen Sie die Modellunsicherheiten aus und formulieren Sie ein bedingtes Urteil. (7 BE)',
      solutionContent:
        'Der spontane Temperaturausgleich ist irreversibel: Die Energie bleibt erhalten, wird aber weniger vollständig nutzbar. Eine sehr langsame, reibungsfreie Kompression kann als näherungsweise reversibel modelliert werden. D benötigt 12 000 kWh Strom und verursacht 3 600 kg CO₂e pro Jahr. W benötigt 4 000 kWh und verursacht 1 200 kg pro Jahr. Mit Herstellung ergeben sich für W über 15 Jahre 24 000 kg und über 25 Jahre 36 000 kg; D verursacht 54 000 beziehungsweise 90 000 kg. Unter den gegebenen Annahmen ist W klimatisch günstiger. Strommix, tatsächliche Jahresarbeitszahl, Lebensdauer und Bilanzgrenzen bleiben entscheidende Unsicherheiten.',
      scoring: {
        maxPoints: 18,
        passingPoints: 11,
        steps: [
          { id: 'irreversible_climate_1', points: 6, description: 'Reversible und irreversible Vorgänge samt Energienutzbarkeit unterschieden' },
          { id: 'irreversible_climate_2', points: 5, description: 'Betriebsemissionen beider Varianten korrekt berechnet' },
          { id: 'irreversible_climate_3', points: 7, description: 'Lebenszyklusdaten, Unsicherheiten und bedingtes Klimaurteil verbunden' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_band_model',
      id: '1abfd5ef-1f42-5b71-8c9a-80c0a6b0322e',
      title: 'Prüfungsaufgabe: Halbleiter im Bändermodell deuten',
      titleEn: 'Assessment Task: Interpret Semiconductors with the Band Model',
      description:
        'Die lernende Person kann Leiter und Halbleiter im qualitativen Bändermodell unterscheiden und die Wirkung von n- und p-Dotierung auf die Leitfähigkeit erklären.',
      descriptionEn:
        'The learner can distinguish conductors and semiconductors using a qualitative band model and explain how n- and p-type doping affect conductivity.',
      coveredGoalIds: [ids.bandModelAndDoping],
      applicability: ['DE-BW'],
      area: 'Festkörperphysik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.BAND_MODEL',
      processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_MATERIE', 'LI_TECHNIK'],
      coveredStrands: ['LI_MATERIE', 'LI_TECHNIK'],
      taskContent:
        '**Material:** Drei vereinfachte Diagramme zeigen (A) ein teilweise besetztes Band, (B) ein volles Valenzband mit kleiner Bandlücke zum leeren Leitungsband und (C) dieselbe kleine Bandlücke mit zusätzlichen Donatorniveaus dicht unter dem Leitungsband.\n\n1. Ordnen Sie A einem Leiter und B einem undotierten Halbleiter zu und erklären Sie die Zuordnung über verfügbare Energiezustände. (6 BE)\n2. Deuten Sie C als n-Dotierung und erklären Sie, wie Donatoren die Zahl beweglicher Ladungsträger erhöhen. (5 BE)\n3. Skizzieren Sie analog die qualitative Wirkung einer p-Dotierung mit Akzeptorniveaus und Löchern. Erklären Sie, warum Dotierung keine beliebige Erzeugung elektrischer Ladung bedeutet. (5 BE)',
      solutionContent:
        'Im Leiter stehen in unmittelbarer Nähe unbesetzte Zustände zur Verfügung. Beim undotierten Halbleiter trennt eine kleine Bandlücke Valenz- und Leitungsband; thermische Anregung kann Elektronen ins Leitungsband heben. Donatorniveaus liefern leichter anregbare Elektronen und erhöhen die Elektronendichte im Leitungsband. Akzeptoren ermöglichen fehlende Elektronenplätze beziehungsweise Löcher im Valenzband. Dotierung verändert Zahl und Art beweglicher Ladungsträger, wahrt aber insgesamt die Ladungsbilanz des Materials.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'band_model_1', points: 6, description: 'Leiter und undotierten Halbleiter im Bändermodell unterschieden' },
          { id: 'band_model_2', points: 5, description: 'n-Dotierung über Donatorniveaus und bewegliche Elektronen erklärt' },
          { id: 'band_model_3', points: 5, description: 'p-Dotierung und Ladungsbilanz qualitativ gedeutet' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_magnet_induction',
      id: 'dbe230d5-31e1-5fca-8e11-2226821952ff',
      title: 'Prüfungsaufgabe: Magnetfelder berechnen und Induktion anwenden',
      titleEn: 'Assessment Task: Calculate Magnetic Fields and Apply Induction',
      description:
        'Die lernende Person kann Magnetfelder eines geraden Leiters und einer langen Spule bestimmen und eine technische Induktionsanwendung über die Änderung des magnetischen Flusses erklären.',
      descriptionEn:
        'The learner can determine magnetic fields of a straight conductor and a long solenoid and explain a technical induction application through changing magnetic flux.',
      coveredGoalIds: [ids.inductionApplications, ids.conductorAndCoilField],
      applicability: ['DE-BW'],
      area: 'Elektromagnetismus',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.MAGNET_INDUCTION',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_FELDER', 'LI_TECHNIK'],
      coveredStrands: ['LI_FELDER', 'LI_TECHNIK'],
      taskContent:
        '**Teil A:** Ein langer gerader Leiter liegt senkrecht in der Zeichenebene; der technische Strom fließt darin nach oben. Der Beobachtungspunkt P liegt in der Zeichenebene 2,0 cm rechts vom Leiter. Bestimmen Sie mit B = μ₀I/(2πr) für I = 4,0 A die Flussdichte in P und geben Sie mit der Rechte-Hand-Regel eindeutig an, ob das Magnetfeld dort aus der Zeichenebene heraus oder in sie hinein zeigt. Eine lange Luftspule besitzt 800 Windungen auf 0,40 m und führt 0,50 A. Bestimmen Sie mit B = μ₀NI/l ihre Flussdichte und erläutern Sie je eine Modellgrenze beider Formeln. Verwenden Sie μ₀ = 4π · 10⁻⁷ Tm/A. (9 BE)\n\n**Teil B:** Bei einem Induktionsladegerät erzeugt die Primärspule ein zeitlich veränderliches Magnetfeld durch die Sekundärspule. Erklären Sie die vollständige Kette von der Stromänderung über induzierte Spannung, Strom im geschlossenen Sekundärkreis und Ladeelektronik bis zur nutzbaren beziehungsweise im Akku gespeicherten Energie. Sagen Sie begründet voraus, was bei Gleichstrom nach dem Einschaltvorgang und bei größerem Spulenabstand geschieht. (7 BE)',
      solutionContent:
        'Am Leiter gilt B = 4,0 · 10⁻⁵ T. Nach der Rechte-Hand-Regel zeigt der Daumen in technische Stromrichtung nach oben; die gekrümmten Finger weisen am rechts liegenden Punkt P in die Zeichenebene hinein. Für die Spule folgt B ≈ 1,26 · 10⁻³ T. Die Näherungen setzen einen langen geraden Leiter beziehungsweise eine lange, gleichmäßig gewickelte Spule und vernachlässigte Randfelder voraus. Im Ladegerät erzeugt Wechselstrom einen veränderlichen magnetischen Fluss, der in der Sekundärspule eine Spannung induziert. Bei angeschlossener Last treibt diese Spannung im geschlossenen Sekundärkreis einen Wechselstrom; Ladeelektronik richtet ihn gleich, regelt Spannung beziehungsweise Strom und überträgt Energie in den Akku, wo sie chemisch gespeichert und später elektrisch nutzbar wird. Bei einem direkten Verbraucher würde der Sekundärstrom die Energie entsprechend an diese Last übertragen. Bei stationärem Gleichstrom gibt es nach dem Einschalten keine dauerhafte Induktion. Größerer Abstand schwächt die magnetische Kopplung und damit die übertragbare Leistung.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'magnet_induction_1', points: 9, description: 'Felder von Leiter und Spule berechnet, Richtungen und Modellgrenzen angegeben' },
          { id: 'magnet_induction_2', points: 7, description: 'Induktionsladegerät bis Sekundärstrom, Ladeelektronik und nutzbare Energie erklärt sowie zwei Änderungen vorhergesagt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_by_spectra_photons',
      id: '93cdaa49-88e8-5e26-8506-656366d9ce3c',
      title: 'Prüfungsaufgabe: Spektrallinien und Photonen deuten',
      titleEn: 'Assessment Task: Interpret Spectral Lines and Photons',
      description:
        'Die lernende Person kann Spektrallinien mit Energieniveaus erklären, Energie und Impuls von Photonen bestimmen und den Quantenobjektcharakter von Licht und Elektronen an Experimenten deuten.',
      descriptionEn:
        'The learner can explain spectral lines using energy levels, determine photon energy and momentum, and interpret the quantum-object character of light and electrons from experiments.',
      coveredGoalIds: [ids.emissionAndLineSpectra, ids.quantumObjects, ids.photonEnergyMomentum],
      applicability: ['DE-BY'],
      area: 'Quantenphysik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BY.SPECTRA_PHOTONS',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_MATERIE', 'LI_WELLEN'],
      coveredStrands: ['LI_MATERIE', 'LI_WELLEN'],
      taskContent:
        '**Material:** Ein Atom besitzt die Energieniveaus 0 eV, 2,0 eV und 4,5 eV. Bei einem Übergang wird ein Photon mit 2,5 eV emittiert. Verwenden Sie 1 eV = 1,60 · 10⁻¹⁹ J, h = 6,63 · 10⁻³⁴ Js und c = 3,00 · 10⁸ m/s.\n\n1. Zeichnen Sie den passenden Übergang und erklären Sie, warum das Emissionsspektrum diskrete Linien statt eines kontinuierlichen Spektrums enthält. Beschreiben Sie den umgekehrten Absorptionsvorgang. (6 BE)\n2. Berechnen Sie Energie in Joule, Frequenz, Wellenlänge und Impuls des Photons. Deuten Sie die Beziehungen E = hf und p = h/λ. (7 BE)\n3. Ein Einzelphotonen-Doppelspalt erzeugt erst einzelne Treffer, später ein Interferenzmuster; Elektronen zeigen bei entsprechendem Aufbau dasselbe Muster. Erläutern Sie, welche Wellen- und Teilchenaspekte die Beobachtung belegt und warum klassische Bahnbilder nicht ausreichen. (7 BE)',
      solutionContent:
        'Der Übergang erfolgt von 4,5 eV auf 2,0 eV. Diskrete Energieniveaus erlauben nur bestimmte Energiedifferenzen und damit Spektrallinien; Absorption hebt ein Atom bei passender Photonenenergie an. E = 4,00 · 10⁻¹⁹ J, f ≈ 6,03 · 10¹⁴ Hz, λ ≈ 4,98 · 10⁻⁷ m und p ≈ 1,33 · 10⁻²⁷ kg m/s. Einzelne lokalisierte Treffer zeigen den Teilchenaspekt, die statistische Interferenz den Wellenaspekt. Photonen und Elektronen sind Quantenobjekte, deren Verhalten nicht vollständig durch eine klassische Teilchenbahn beschrieben wird.',
      scoring: {
        maxPoints: 20,
        passingPoints: 12,
        steps: [
          { id: 'spectra_photons_1', points: 6, description: 'Emission, Absorption und diskrete Spektrallinien am Energieniveauschema erklärt' },
          { id: 'spectra_photons_2', points: 7, description: 'Photonenenergie, Frequenz, Wellenlänge und Impuls berechnet und gedeutet' },
          { id: 'spectra_photons_3', points: 7, description: 'Wellen- und Teilchenaspekte von Photonen und Elektronen experimentbezogen erklärt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_by_electric_quantities',
      id: '8ff2a728-fba3-538e-83e9-69bdd8e1369e',
      title: 'Prüfungsaufgabe: Stromstärke und Spannung als Ladungsgrößen deuten',
      titleEn: 'Assessment Task: Interpret Current and Voltage through Charge',
      description:
        'Die lernende Person kann Stromstärke als Ladung pro Zeit und Spannung als Arbeit pro Ladung berechnen und beide Größen im homogenen elektrischen Feld verknüpfen.',
      descriptionEn:
        'The learner can calculate current as charge per time and voltage as work per charge and link both quantities in a uniform electric field.',
      coveredGoalIds: [ids.electricWorkVoltagePotential, ids.currentAsChargeTransport],
      applicability: ['DE-BY'],
      area: 'Elektrizitätslehre',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BY.ELECTRIC_QUANTITIES',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
      guidingIdeas: ['LI_LADUNG', 'LI_FELDER', 'LI_ENERGIE'],
      coveredStrands: ['LI_LADUNG', 'LI_FELDER', 'LI_ENERGIE'],
      taskContent:
        'Durch einen Leiterquerschnitt fließen in 4,0 s insgesamt 12 C Ladung. Die Ladungsträger durchlaufen anschließend eine Spannung von 6,0 V. In einem homogenen Feld mit Plattenabstand 3,0 cm beträgt die Feldstärke 200 V/m.\n\n1. Bestimmen Sie die Stromstärke und erklären Sie die Bedeutung von 1 A in Coulomb pro Sekunde. (5 BE)\n2. Bestimmen Sie die Arbeit, die das elektrische Feld beim Transport von 12 C über 6,0 V überträgt, und deuten Sie U = W/q sprachlich. (5 BE)\n3. Berechnen Sie aus E und d die Plattenspannung. Prüfen Sie die Einheiten und erläutern Sie, unter welcher Modellannahme U = E·d gilt. (5 BE)',
      solutionContent:
        'I = ΔQ/Δt = 3,0 A; 1 A entspricht 1 C/s. Mit U = W/q folgt W = Uq = 72 J. Spannung gibt die übertragene Arbeit je Ladung an. Für das homogene Feld gilt U = E d = 200 V/m · 0,030 m = 6,0 V. Die Beziehung setzt ein homogenes Feld und einen Weg entlang der Feldrichtung voraus.',
      scoring: {
        maxPoints: 15,
        passingPoints: 9,
        steps: [
          { id: 'electric_quantities_1', points: 5, description: 'Stromstärke als Ladung pro Zeit berechnet und Einheit erklärt' },
          { id: 'electric_quantities_2', points: 5, description: 'Elektrische Arbeit aus Spannung und Ladung bestimmt und Spannung gedeutet' },
          { id: 'electric_quantities_3', points: 5, description: 'Homogene Feldbeziehung berechnet, einheitengeprüft und eingegrenzt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_by_digital_video_data',
      id: '367b17f8-972a-5f3e-8915-8cfe743132a3',
      title: 'Prüfungsaufgabe: Eine Bewegung digital auswerten',
      titleEn: 'Assessment Task: Analyze Motion Digitally',
      description:
        'Die lernende Person kann Ortsdaten aus einem Bewegungsvideo gewinnen, die Bewegung daraus analysieren und zufällige von systematischen Messabweichungen unterscheiden.',
      descriptionEn:
        'The learner can obtain position data from a motion video, analyze the motion from those data, and distinguish random from systematic measurement deviations.',
      coveredGoalIds: [
        'd67502e3-5e0a-595b-a24b-65b1c40de36e',
        '72effc66-87f4-5f5e-8d36-1547677365fb',
      ],
      applicability: ['DE-BY'],
      area: 'Mechanik und Messmethoden',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BY.DIGITAL_VIDEO_DATA',
      processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK3_MATHEMATISIEREN', 'PK5_BEWERTEN'],
      guidingIdeas: ['LI_BEWEGUNG', 'LI_DATEN'],
      coveredStrands: ['LI_BEWEGUNG', 'LI_DATEN'],
      taskContent:
        '**Material:** Ein Fahrrad wird mit 25 Bildern pro Sekunde gefilmt. Nach Kalibrierung mit einer im Bild sichtbaren 2,00-m-Marke ergeben sich für die Bildnummern 0, 5, 10, 15 die Ortswerte 0,02 m, 1,01 m, 1,98 m und 3,00 m. Drei wiederholte Markierungen in Bild 10 liefern 1,96 m, 1,98 m und 2,01 m. Später stellt sich heraus, dass die Kalibriermarke tatsächlich 1,96 m lang war.\n\n1. Beschreiben Sie den vollständigen Ablauf von Kalibrierung, Koordinatenwahl und punktweiser Markierung. Wandeln Sie Bildnummern in Zeiten um und erstellen Sie ein t-s-Diagramm. (7 BE)\n2. Bestimmen Sie die mittleren Geschwindigkeiten in den drei Intervallen und beurteilen Sie die Bewegungsart. (5 BE)\n3. Unterscheiden Sie die Streuung der drei Markierungen von der falschen Kalibrierlänge als zufällige beziehungsweise systematische Abweichung. Erklären Sie Wirkung und Begrenzung der Ergebnisgenauigkeit und schlagen Sie je eine Gegenmaßnahme vor. (6 BE)',
      solutionContent:
        'Bei 25 Bildern/s liegen zwischen fünf Bildern 0,20 s. Die Datenpunkte werden relativ zum Ursprung und zur kalibrierten Längenskala erfasst. Die Intervallgeschwindigkeiten betragen etwa 4,95 m/s, 4,85 m/s und 5,10 m/s; innerhalb der Messstreuung ist eine näherungsweise gleichförmige Bewegung plausibel. Die verschiedenen Markierungen zeigen zufällige Streuung und können durch wiederholtes Markieren beziehungsweise Mittelwertbildung reduziert werden. Die falsch angegebene Referenzlänge skaliert alle Ortswerte systematisch zu groß; Wiederholung allein beseitigt sie nicht, wohl aber eine geprüfte Kalibrierung. Beide Abweichungen begrenzen die Aussagekraft.',
      scoring: {
        maxPoints: 18,
        passingPoints: 11,
        steps: [
          { id: 'digital_video_1', points: 7, description: 'Videoanalyse mit Kalibrierung, Zeitachse und t-s-Daten nachvollziehbar durchgeführt' },
          { id: 'digital_video_2', points: 5, description: 'Intervallgeschwindigkeiten berechnet und Bewegungsart datenbasiert beurteilt' },
          { id: 'digital_video_3', points: 6, description: 'Zufällige und systematische Abweichungen unterschieden und Gegenmaßnahmen begründet' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_by_glass_fiber',
      id: '654ec964-d982-593d-8c26-407a381675a6',
      title: 'Prüfungsaufgabe: Lichtleitung in einer Glasfaser erklären',
      titleEn: 'Assessment Task: Explain Light Guidance in an Optical Fiber',
      description:
        'Die lernende Person kann Totalreflexion an der Kern-Mantel-Grenze qualitativ erklären und daraus Bedingungen sowie Grenzen der Lichtleitung in einer Glasfaser ableiten.',
      descriptionEn:
        'The learner can qualitatively explain total internal reflection at the core-cladding boundary and derive conditions and limits for light guidance in an optical fiber.',
      coveredGoalIds: [ids.totalReflection],
      applicability: ['DE-BY'],
      area: 'Optik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BY.GLASS_FIBER',
      processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_WELLEN', 'LI_TECHNIK'],
      coveredStrands: ['LI_WELLEN', 'LI_TECHNIK'],
      taskContent:
        '**Material:** Eine Glasfaser besitzt einen optisch dichteren Kern und einen optisch dünneren Mantel. Drei Strahlen treffen von innen mit verschiedenen Winkeln zur Grenzflächennormalen auf die Kern-Mantel-Grenze: kleiner, gleich und größer als der Grenzwinkel.\n\n1. Zeichnen Sie für alle drei Fälle den qualitativen Strahlenverlauf und kennzeichnen Sie Brechung, Grenzfall und Totalreflexion. (6 BE)\n2. Erklären Sie die zwei notwendigen Bedingungen für Totalreflexion und begründen Sie, warum ein optisch dünnerer Mantel die Lichtleitung ermöglicht. (5 BE)\n3. Sagen Sie voraus, wie ein zu enger Faserbogen oder ein ungeeigneter Einkopplungswinkel die Übertragung beeinflusst, und begründen Sie die Vorhersage mit den Einfallswinkeln an der Kern-Mantel-Grenze. (5 BE)',
      solutionContent:
        'Beim Übergang vom optisch dichteren zum dünneren Medium wird der Strahl für kleine Winkel vom Lot weg gebrochen. Am Grenzwinkel läuft der gebrochene Strahl entlang der Grenzfläche; darüber tritt Totalreflexion auf. Erforderlich sind der Übergang vom optisch dichteren zum dünneren Medium und ein Einfallswinkel größer als der Grenzwinkel. Der Mantel ermöglicht wiederholte Reflexion im Kern. Zu starke Krümmung oder ungünstige Einkopplung kann lokale Einfallswinkel unter den Grenzwinkel bringen; Licht tritt aus und die Übertragung wird schwächer.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'glass_fiber_1', points: 6, description: 'Drei Strahlenfälle an der Grenzfläche korrekt dargestellt' },
          { id: 'glass_fiber_2', points: 5, description: 'Bedingungen der Totalreflexion und Mantelfunktion erklärt' },
          { id: 'glass_fiber_3', points: 5, description: 'Krümmung und Einkopplung über Grenzwinkelwirkung beurteilt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_by_transistor',
      id: '88f27aab-8724-5a4d-8543-e49ebcb54b8e',
      title: 'Prüfungsaufgabe: Einen Transistor als Schalter deuten',
      titleEn: 'Assessment Task: Interpret a Transistor as a Switch',
      description:
        'Die lernende Person kann Aufbau und Grundfunktion eines bipolaren Transistors qualitativ beschreiben und eine einfache Transistorschaltung als elektronischen Schalter interpretieren.',
      descriptionEn:
        'The learner can qualitatively describe the structure and basic function of a bipolar transistor and interpret a simple transistor circuit as an electronic switch.',
      coveredGoalIds: ['d36727cc-ce42-51a3-9425-41afb0b9acdd'],
      applicability: ['DE-BY'],
      area: 'Elektronik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BY.TRANSISTOR',
      processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_LADUNG', 'LI_TECHNIK'],
      coveredStrands: ['LI_LADUNG', 'LI_TECHNIK'],
      taskContent:
        '**Material:** Ein NPN-Transistor schaltet eine LED im Kollektorkreis. Die Basis ist über einen Vorwiderstand mit einem Lichtsensor verbunden. Im Hellen fließen 0,02 mA Basisstrom und 0,1 mA Kollektorstrom; im Dunkeln 0,20 mA Basisstrom und 8,0 mA Kollektorstrom.\n\n1. Beschriften Sie in einem vorgegebenen Schaltbild Basis, Kollektor und Emitter und unterscheiden Sie Steuer- und Lastkreis. (5 BE)\n2. Erklären Sie anhand der Messwerte, wie ein kleiner Basisstrom den größeren Kollektorstrom steuert und warum die LED im Dunkeln leuchtet. (6 BE)\n3. Sagen Sie begründet voraus, was bei unterbrochenem Basiszweig und bei vertauschter Sensorwirkung geschieht. Grenzen Sie „Transistor als Schalter“ von einem mechanischen Schalter ab. (5 BE)',
      solutionContent:
        'Basis und Emitter bilden den Steuerpfad, Kollektor und Emitter den Lastpfad. Der größere Basisstrom im Dunkeln ermöglicht einen deutlich größeren Kollektorstrom; die LED leuchtet. Ohne Basisstrom sperrt der Transistor im einfachen Modell und die LED bleibt aus. Eine umgekehrte Sensorbeschaltung kann die Schaltbedingung auf Helligkeit verschieben. Anders als ein mechanischer Kontakt steuert der Transistor den Laststrom elektronisch ohne bewegliche Teile; Steuer- und Laststrom sind dennoch durch das Bauteilverhalten gekoppelt.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'transistor_1', points: 5, description: 'Anschlüsse sowie Steuer- und Lastkreis korrekt identifiziert' },
          { id: 'transistor_2', points: 6, description: 'Schaltfunktion aus Basis- und Kollektorstrom fachlich erklärt' },
          { id: 'transistor_3', points: 5, description: 'Zwei Schaltungsänderungen vorhergesagt und elektronische Schaltung abgegrenzt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_force_vectors',
      id: '8f62ab5e-20fc-562f-8121-63c082313e6e',
      title: 'Prüfungsaufgabe: Kräfte an einer Aufhängung vektoriell bilanzieren',
      titleEn: 'Assessment Task: Balance Forces on a Suspension Vectorially',
      description:
        'Die lernende Person kann mehrere Kräfte an einer Aufhängung maßstäblich als Vektoren darstellen, grafisch zur Resultierenden zusammensetzen und die Gleichgewichtsbedingung im Kontext deuten.',
      descriptionEn:
        'The learner can draw several forces on a suspension as scaled vectors, combine them graphically into a resultant, and interpret the equilibrium condition in context.',
      coveredGoalIds: ['41d35667-0296-5f84-bc12-202ffc440be0'],
      applicability: ['DE-BW'],
      area: 'Mechanik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.FORCE_VECTORS',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
      guidingIdeas: ['LI_KRAEFTE'],
      coveredStrands: ['LI_KRAEFTE'],
      taskContent:
        'Ein Schild hängt an einem Ring. Zwei Seilkräfte von 40 N und 30 N greifen unter einem Winkel von 60° an. Verwenden Sie den Maßstab 1 cm = 10 N.\n\n1. Zeichnen Sie beide Kräfte mit gemeinsamem Angriffspunkt und beschriften Sie Betrag und Richtung. (4 BE)\n2. Konstruieren Sie die Resultierende mit Kräfteparallelogramm oder Spitze-an-Schaft, bestimmen Sie grafisch Betrag und Richtung und dokumentieren Sie die Messunsicherheit der Konstruktion. (6 BE)\n3. Zeichnen Sie die dritte Kraft, die den Ring im Gleichgewicht hält. Erläutern Sie den Unterschied zwischen dieser Ausgleichskraft und der Resultierenden der beiden Seilkräfte. (5 BE)',
      solutionContent:
        'Die beiden Kraftvektoren werden maßstäblich mit gemeinsamem Angriffspunkt gezeichnet. Mit R = √((40 N)² + (30 N)² + 2 · 40 N · 30 N · cos 60°) ergibt sich R ≈ 60,8 N. Relativ zur 40-N-Kraft gilt tan α = (30 N · sin 60°)/(40 N + 30 N · cos 60°), also α ≈ 25,3° in Richtung der 30-N-Kraft. Die Gleichgewichtskraft ist gleich groß und entgegengesetzt gerichtet. Sie ist nicht eine weitere Bezeichnung für die Resultierende, sondern ergänzt sie zur Vektorsumme null. Eine angemessene grafische Unsicherheit folgt aus Strichbreite, Winkel- und Längenmessung.',
      scoring: {
        maxPoints: 15,
        passingPoints: 9,
        steps: [
          { id: 'force_vectors_1', points: 4, description: 'Zwei Kräfte maßstäblich und gerichtet dargestellt' },
          { id: 'force_vectors_2', points: 6, description: 'Resultierende grafisch konstruiert, bestimmt und Unsicherheit angegeben' },
          { id: 'force_vectors_3', points: 5, description: 'Ausgleichskraft konstruiert und vom Resultierendenvektor unterschieden' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_mechanical_energy_machine',
      id: '0cf2a5b0-8660-578d-8316-2b8a50fbdff7',
      title: 'Prüfungsaufgabe: Einen Rettungs- und Materialwagen energetisch bewegen und heben',
      titleEn: 'Assessment Task: Move and Lift a Rescue-Supply Cart Energetically',
      description:
        'Die lernende Person kann kinetische und potenzielle Energie eines Rettungs- und Materialwagens berechnen und einen Flaschenzug als Kraftwandler ohne ideale Arbeitsersparnis deuten.',
      descriptionEn:
        'The learner can calculate a rescue-supply cart’s kinetic and potential energy and interpret a pulley system as a force converter without ideal work savings.',
      coveredGoalIds: [
        '7eeff2de-6015-49a6-a96e-a488d886dc9f',
        '6affc2ea-ecd2-4fcd-8877-3ffa15b0425b',
        '327302e3-5b36-46f8-9c16-73f24583b0eb',
      ],
      applicability: ['DE-BW'],
      area: 'Mechanik und Energie',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.MECHANICAL_ENERGY_MACHINE',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_ENERGIE', 'LI_TECHNIK'],
      coveredStrands: ['LI_ENERGIE', 'LI_TECHNIK'],
      taskContent:
        'Ein 120-kg-Materialwagen mit Rettungsausrüstung rollt mit 3,0 m/s zu einer Hebestelle und wird anschließend mit einem idealen Flaschenzug 2,0 m angehoben. Verwenden Sie g = 10 N/kg. Der Flaschenzug besitzt vier tragende Seilabschnitte.\n\n1. Berechnen Sie die kinetische Energie des fahrenden Wagens und erläutern Sie getrennt die Abhängigkeit von Masse und Geschwindigkeit. (5 BE)\n2. Berechnen Sie die Zunahme seiner potenziellen Energie beim Heben und deuten Sie die gewählte Bezugshöhe. (5 BE)\n3. Bestimmen Sie ideal die nötige Zugkraft und den Zugweg. Vergleichen Sie Hubarbeit und Zugarbeit und erklären Sie, warum die kleinere Kraft keine Arbeit einspart. (6 BE)',
      solutionContent:
        'Die kinetische Energie ist 0,5 · 120 kg · (3,0 m/s)² = 540 J; sie wächst linear mit der Masse und quadratisch mit der Geschwindigkeit. Die Lageenergie nimmt um 120 kg · 10 N/kg · 2,0 m = 2400 J zu; entscheidend ist die Höhenänderung relativ zum gewählten Nullniveau. Ideal beträgt die Zugkraft 300 N und der Zugweg 8,0 m. Beide Arbeiten sind 2400 J. Der Flaschenzug tauscht Kraft gegen Weg; real kommen Reibungsverluste hinzu.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'mechanical_energy_1', points: 5, description: 'Kinetische Energie berechnet und Parameterabhängigkeit erläutert' },
          { id: 'mechanical_energy_2', points: 5, description: 'Potenzielle Energie berechnet und Bezugshöhe gedeutet' },
          { id: 'mechanical_energy_3', points: 6, description: 'Flaschenzug über Kraft, Weg und gleiche ideale Arbeit analysiert' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_fission_fusion',
      id: 'ca13e9cd-6377-540e-88c8-0308cddc8a7e',
      title: 'Prüfungsaufgabe: Kernspaltung und Kernfusion einordnen',
      titleEn: 'Assessment Task: Classify Nuclear Fission and Fusion',
      description:
        'Die lernende Person kann Kernspaltung und Kernfusion qualitativ unterscheiden und Kernkraftwerk sowie Stern als passende Anwendungs- beziehungsweise Naturbeispiele einordnen.',
      descriptionEn:
        'The learner can qualitatively distinguish nuclear fission and fusion and classify a nuclear power plant and a star as appropriate technological and natural examples.',
      coveredGoalIds: ['50877233-7abf-54df-b347-6d3224678fc9'],
      applicability: ['DE-BW'],
      area: 'Kernphysik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.FISSION_FUSION',
      processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_MATERIE', 'LI_ENERGIE'],
      coveredStrands: ['LI_MATERIE', 'LI_ENERGIE'],
      taskContent:
        '**Material:** Modell S zeigt einen schweren Kern, der nach Aufnahme eines Neutrons in zwei mittelschwere Kerne und weitere Neutronen zerfällt. Modell F zeigt zwei leichte Kerne, die sich zu einem schwereren Kern verbinden.\n\n1. Ordnen Sie S und F Kernspaltung beziehungsweise Kernfusion zu und beschreiben Sie Ausgangs- und Reaktionsprodukte qualitativ. (6 BE)\n2. Erklären Sie, warum die frei werdenden Neutronen bei S eine Kettenreaktion ermöglichen und wie ein Kernkraftwerk sie kontrolliert nutzt. (5 BE)\n3. Ordnen Sie F dem Inneren eines Sterns zu und nennen Sie die notwendige hohe Temperatur als Bedingung. Vergleichen Sie die Herkunft der frei werdenden Energie in beiden Modellen qualitativ. (5 BE)',
      solutionContent:
        'S ist Kernspaltung: Ein schwerer Kern zerfällt in leichtere Kerne, Neutronen und Energie. Weitere Neutronen können neue Spaltungen auslösen; im Kraftwerk wird die Kettenreaktion durch Neutronenaufnahme geregelt. F ist Kernfusion: Leichte Kerne verbinden sich unter hohen Temperaturen, wie im Sterninneren. In beiden Fällen führt eine größere Bindungsenergie pro Nukleon der Produkte zur frei werdenden Energie.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'fission_fusion_1', points: 6, description: 'Spaltung und Fusion anhand der Kernmodelle unterschieden' },
          { id: 'fission_fusion_2', points: 5, description: 'Kettenreaktion und kontrollierte Nutzung im Kernkraftwerk erklärt' },
          { id: 'fission_fusion_3', points: 5, description: 'Fusion im Stern und qualitative Energiefreisetzung eingeordnet' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_current_voltage_measurement',
      id: 'a3c513d0-8fb9-5bd5-88cc-041527ff097d',
      title: 'Prüfungsaufgabe: Stromstärke und Spannung fachgerecht messen',
      titleEn: 'Assessment Task: Measure Current and Voltage Correctly',
      description:
        'Die lernende Person kann Amperemeter und Voltmeter in einem sicheren Kleinspannungsstromkreis fachgerecht anschließen, geeignete Messbereiche wählen und Messwerte begründet auswerten.',
      descriptionEn:
        'The learner can correctly connect an ammeter and voltmeter in a safe low-voltage circuit, select suitable ranges, and evaluate readings with justification.',
      coveredGoalIds: [
        '59d1145e-ac54-5917-880a-21b4b80526d3',
        'f1a078ae-6262-4444-a4bc-a5ab275621cf',
      ],
      applicability: ['DE-BW'],
      area: 'Elektrizitätslehre',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.CURRENT_VOLTAGE_MEASUREMENT',
      processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK3_MATHEMATISIEREN'],
      guidingIdeas: ['LI_LADUNG', 'LI_TECHNIK'],
      coveredStrands: ['LI_LADUNG', 'LI_TECHNIK'],
      taskContent:
        '**Praktische Station, höchstens 6 V:** Eine Lampe soll betrieben werden; ein Multimeter misst nacheinander Stromstärke und Lampenspannung.\n\n1. Zeichnen Sie die Messschaltung mit Amperemeter in Reihe und Voltmeter parallel zur Lampe. Begründen Sie beide Anschlussarten und wählen Sie vor dem Einschalten sichere Messbereiche. (6 BE)\n2. Bauen Sie die Schaltung auf, lassen Sie sie prüfen und messen Sie Stromstärke und Spannung mit Einheit. Dokumentieren Sie Polung, Messbereich und Ablesegenauigkeit. (6 BE)\n3. Ein Amperemeter wurde versehentlich parallel geschaltet. Erklären Sie die Gefahr für Messgerät und Schaltung und beschreiben Sie die fachgerechte Korrektur. (4 BE)',
      solutionContent:
        'Das Amperemeter wird in den Strompfad eingeschleift, das Voltmeter parallel an die Lampe gelegt. Zunächst wird ein ausreichend großer Messbereich gewählt und anschließend bei Bedarf verkleinert. Messwerte müssen zum eigenen Aufbau passen und mit Einheit sowie Auflösung dokumentiert sein. Ein parallel geschaltetes Amperemeter besitzt sehr kleinen Innenwiderstand und kann einen hohen Strom verursachen; die Quelle wird abgeschaltet und das Gerät korrekt in Reihe eingefügt.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'current_voltage_1', points: 6, description: 'Messschaltung und sichere Messbereichswahl fachlich begründet' },
          { id: 'current_voltage_2', points: 6, description: 'Stromstärke und Spannung praktisch gemessen und vollständig dokumentiert' },
          { id: 'current_voltage_3', points: 4, description: 'Fehlschaltung des Amperemeters erklärt und korrigiert' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_circuit_balances_device_data',
      id: 'de7528cc-8c5d-5cd6-8d08-f8ce7457e666',
      title: 'Prüfungsaufgabe: Eine mobile Energieversorgung elektrisch bilanzieren',
      titleEn: 'Assessment Task: Balance a Mobile Electrical Supply',
      description:
        'Die lernende Person kann Geräteangaben einer mobilen Energieversorgung einordnen und an deren verzweigtem Stromkreis Knoten- und Maschenbilanzen mit Ladungs- und Energieerhaltung begründen.',
      descriptionEn:
        'The learner can interpret device ratings of a mobile power supply and justify node and loop balances in its branched circuit using charge and energy conservation.',
      coveredGoalIds: [
        '50431e92-eec9-54d6-b437-ea7a51b6f474',
        '267170bd-f880-56a7-9719-ffb9751872c5',
        '8a84de16-2fde-58ec-827a-f803e2ce8564',
      ],
      applicability: ['DE-BW'],
      area: 'Elektrische Energie und Schaltungen',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.CIRCUIT_BALANCES_DEVICE_DATA',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_LADUNG', 'LI_ENERGIE', 'LI_TECHNIK'],
      coveredStrands: ['LI_LADUNG', 'LI_ENERGIE', 'LI_TECHNIK'],
      taskContent:
        '**Material:** Eine 12-V-Gleichspannungsbox versorgt parallel eine Lampe (12 V, 18 W) und einen Lüfter (12 V, 12 W). Vor der Verzweigung werden 2,5 A gemessen. Am Lampenzweig fließen 1,5 A. Der Akku ist mit 12 V, 10 Ah gekennzeichnet. Ein Netzladegerät trägt „230 V Wechselspannung Eingang; 12 V Gleichspannung Ausgang“.\n\n1. Ordnen Sie die Angaben V, W und Ah physikalischen Größen zu, unterscheiden Sie Gleich- und Wechselspannung und erläutern Sie die Funktion des Ladegeräts in der Energieversorgung. (6 BE)\n2. Legen Sie Stromrichtungen am Verzweigungsknoten fest, bestimmen Sie den Lüfterstrom und begründen Sie die Knotenregel mit Ladungserhaltung ohne Ladungsanhäufung. (5 BE)\n3. Stellen Sie für jede der beiden Maschen eine vorzeichenrichtige Spannungsbilanz auf. Begründen Sie mit Energie pro Ladung, warum sich Spannungsanstieg und Spannungsabfall beim Umlauf ausgleichen. (5 BE)',
      solutionContent:
        'Volt bezeichnet Spannung, Watt Leistung und Amperestunden Akkuladung. Das Ladegerät wandelt Netz-Wechselspannung in geeignete Klein-Gleichspannung. Am Knoten gilt 2,5 A = 1,5 A + I_L, also I_L = 1,0 A; andernfalls würde sich Ladung ansammeln. Für jeden Parallelzweig gilt bei idealen Leitungen +12 V − 12 V = 0. Die Quelle überträgt pro Ladung dieselbe Energie, die das jeweilige Gerät aufnimmt, daher ist die Umlaufsumme der Spannungen null.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'circuit_balance_1', points: 6, description: 'Geräte-, Akku- und Versorgungsangaben fachlich eingeordnet' },
          { id: 'circuit_balance_2', points: 5, description: 'Knotenbilanz berechnet und mit Ladungserhaltung begründet' },
          { id: 'circuit_balance_3', points: 5, description: 'Maschenbilanzen aufgestellt und mit Energie pro Ladung erklärt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_electrical_safety',
      id: 'eb5e147f-a67c-542e-858b-533a00af7af2',
      title: 'Prüfungsaufgabe: Elektrische Gefahren sicher beurteilen',
      titleEn: 'Assessment Task: Assess Electrical Hazards Safely',
      description:
        'Die lernende Person kann Gefahren an einer elektrischen Anlage, in einem Haushaltsstromkreis und bei Gewitter erkennen und physikalisch begründete Schutzentscheidungen treffen.',
      descriptionEn:
        'The learner can identify hazards in an electrical installation, a household circuit, and a thunderstorm and make physically justified safety decisions.',
      coveredGoalIds: ['1911920e-b099-4310-82f2-b47f51a78b33'],
      applicability: ['DE-BW'],
      area: 'Elektrische Sicherheit',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.ELECTRICAL_SAFETY',
      processCompetencies: ['PK4_KOMMUNIZIEREN', 'PK5_BEWERTEN'],
      guidingIdeas: ['LI_LADUNG', 'LI_TECHNIK'],
      coveredStrands: ['LI_LADUNG', 'LI_TECHNIK'],
      taskContent:
        '**Material:** Eine Skizze zeigt ein Gerät mit beschädigter Isolierung und berührbarem Metallgehäuse, Schutzleiter, Sicherung und Fehlerstrom-Schutzeinrichtung. Eine zweite Skizze zeigt bei Gewitter eine Person unter einem einzelnen Baum und eine Person in einem geschlossenen Gebäude.\n\n1. Erläutern Sie die Gefahr des beschädigten Geräts und unterscheiden Sie die Funktionen von Isolierung, Schutzleiter, Sicherung und Fehlerstrom-Schutzeinrichtung. Entscheiden Sie, ob das Gerät weiterverwendet werden darf. (7 BE)\n2. Beurteilen Sie beide Gewitterorte und begründen Sie konkrete sichere Handlungen mit Seitenblitz, Schrittspannung und abschirmender Wirkung des Gebäudes. (5 BE)\n3. Erklären Sie, warum weder „Die Sicherung verbraucht den Strom“ noch „Gummisohlen machen jede Berührung sicher“ eine tragfähige Schutzbegründung ist. (4 BE)',
      solutionContent:
        'Beschädigte Isolierung kann leitende Teile berührbar machen; das Gerät wird abgeschaltet und fachkundig geprüft. Isolierung verhindert Kontakt, der Schutzleiter bietet einen Fehlerstrompfad, die Sicherung schützt Leitungen vor Überstrom und die Fehlerstrom-Schutzeinrichtung trennt bei Stromdifferenz schnell. Bei Gewitter sucht man ein stabiles geschlossenes Gebäude oder ein geschlossenes Fahrzeug mit metallischer Außenstruktur auf und hält Abstand zu Fenstern, Wasserleitungen und anderen leitenden Installationen. Einzelne Bäume, Masten, Zäune und offene erhöhte Orte werden gemieden, weil Direkteinschlag, Seitenblitz und Bodenströme gefährlich sind. Ist kein Schutz erreichbar, verringern zusammengehaltene Füße, eine kleine Körperhöhe und sehr kleine Schritte die Spannungsdifferenz zwischen den Kontaktpunkten; flaches Hinlegen wäre wegen der größeren Schritt- beziehungsweise Körperspannung falsch. Eine Sicherung unterbricht, statt Strom zu verbrauchen, und Gummi schützt nur im geeigneten intakten Aufbau, nicht bedingungslos.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'electrical_safety_1', points: 7, description: 'Gerätegefahr und vier Schutzfunktionen unterschieden' },
          { id: 'electrical_safety_2', points: 5, description: 'Gewitterorte und sichere Handlungen physikalisch beurteilt' },
          { id: 'electrical_safety_3', points: 4, description: 'Zwei fachlich falsche Sicherheitsbegründungen korrigiert' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_heat_greenhouse',
      id: '0b090935-1e43-581b-84ec-078741f8969e',
      title: 'Prüfungsaufgabe: Wärmeübertragung und Treibhauseffekt bilanzieren',
      titleEn: 'Assessment Task: Balance Heat Transfer and the Greenhouse Effect',
      description:
        'Die lernende Person kann Wärmeleitung, Konvektion und Wärmestrahlung unterscheiden, eine qualitative Energiebilanz abgrenzen und den natürlichen sowie anthropogen verstärkten Treibhauseffekt damit erklären.',
      descriptionEn:
        'The learner can distinguish conduction, convection, and thermal radiation, define a qualitative energy balance, and use it to explain the natural and enhanced greenhouse effect.',
      coveredGoalIds: [
        'fbe0faae-7fba-482b-888e-341f926770f3',
        'eeba6bf8-a2b9-4d7d-a1d6-67286c923cef',
        '5a3716dd-ec67-5c48-ba3d-1a29f05ba2ce',
      ],
      applicability: ['DE-BW'],
      area: 'Wärmelehre und Klima',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.HEAT_GREENHOUSE',
      processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_ENERGIE', 'LI_UMWELT'],
      coveredStrands: ['LI_ENERGIE', 'LI_UMWELT'],
      taskContent:
        '**Kontext Klimakammer:** In einer durchsichtigen Kammer erwärmt Strahlung eine dunkle Bodenplatte. Ein Metallstab führt Energie zur Außenwand, erwärmte Luft steigt auf. Nach einiger Zeit bleibt die mittlere Temperatur konstant. Ein Atmosphärenmodell zeigt zusätzlich: kurzwellige Sonnenstrahlung passiert die Atmosphäre weitgehend; Treibhausgase absorbieren und emittieren einen Teil der langwelligen Wärmestrahlung der Erdoberfläche.\n\n1. Ordnen Sie die drei Vorgänge am Metallstab, in der Luft und zwischen Bodenplatte und Umgebung Wärmeleitung, Konvektion und Wärmestrahlung zu und begründen Sie jeweils anhand von Stofftransport beziehungsweise elektromagnetischer Übertragung. (6 BE)\n2. Wählen Sie die Kammer als System, unterscheiden Sie Wärmeübertragung, gespeicherte innere Energie und mechanische Arbeit und formulieren Sie für Aufheizphase und stationären Zustand je eine qualitative Energiebilanz. (6 BE)\n3. Übertragen Sie das Strahlungsmodell auf den natürlichen Treibhauseffekt. Erklären Sie den anthropogenen Anteil bei erhöhter Treibhausgaskonzentration und kennzeichnen Sie eine Grenze der Klimakammer als Modell. (6 BE)',
      solutionContent:
        'Im Stab erfolgt Wärmeleitung ohne makroskopischen Stofftransport, in der aufsteigenden Luft Konvektion, zwischen Boden und Umgebung Wärmestrahlung. Als System werden Bodenplatte und eingeschlossene Innenluft gewählt; die Grenze verläuft an Kammerwand und -deckel sowie durch den nach außen führenden Metallstab. Strahlungszufuhr durch die transparente Wand und Energieabgabe über Strahlung beziehungsweise den Stab sind reale Grenzflüsse. Die Konvektion innerhalb der eingeschlossenen Luft verteilt Energie dagegen intern und ist nicht selbst schon ein Grenzfluss. Die Änderung ΔU beschreibt gespeicherte innere Energie. Da die starre Kammergrenze sich nicht verschiebt und keine Last gehoben wird, gilt im Modell W ≈ 0. Während der Aufheizung ist die Energiezufuhr größer als die Abgabe und ΔU > 0; stationär sind Zu- und Abgabe im Mittel gleich und ΔU ≈ 0. Treibhausgase absorbieren langwellige Strahlung und emittieren in mehrere Richtungen, wodurch sich die Strahlungsbilanz der Oberfläche ändert. Höhere Konzentrationen verstärken diesen Anteil. Die Kammer bildet Atmosphäre, Dynamik und Spektren nur stark vereinfacht ab.',
      scoring: {
        maxPoints: 18,
        passingPoints: 11,
        steps: [
          { id: 'heat_greenhouse_1', points: 6, description: 'Drei Wärmeübertragungsarten kausal unterschieden' },
          { id: 'heat_greenhouse_2', points: 6, description: 'System abgegrenzt, Wärmeübertragung, innere Energie und mechanische Arbeit unterschieden sowie zwei qualitative Energiebilanzen erklärt' },
          { id: 'heat_greenhouse_3', points: 6, description: 'Natürlichen und anthropogenen Treibhauseffekt samt Modellgrenze erklärt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_energy_supply',
      id: '7cb0e5a0-c4ef-5e24-82b6-d8f85ffded8d',
      title: 'Prüfungsaufgabe: Eine kommunale Energieversorgung bewerten',
      titleEn: 'Assessment Task: Evaluate a Municipal Energy Supply',
      description:
        'Die lernende Person kann Energieversorgungssysteme als Übertragungsketten beschreiben und anhand belastbarer Daten sowie offengelegter Kriterien ein abgewogenes Versorgungsurteil formulieren.',
      descriptionEn:
        'The learner can describe energy-supply systems as transfer chains and formulate a balanced supply judgment from reliable data and explicit criteria.',
      coveredGoalIds: [
        '30a936ec-e427-57fe-bf3e-4abd64b1f0c1',
        '5be98160-5189-58aa-8183-1df1c400cc8c',
      ],
      applicability: ['DE-BW'],
      area: 'Energieversorgung',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.ENERGY_SUPPLY',
      processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN', 'PK5_BEWERTEN'],
      guidingIdeas: ['LI_ENERGIE', 'LI_UMWELT', 'LI_TECHNIK'],
      coveredStrands: ['LI_ENERGIE', 'LI_UMWELT', 'LI_TECHNIK'],
      taskContent:
        '**Material (kommunales Planungsmodell):** Eine Gemeinde vergleicht Windstrom mit einem Gaskraftwerk. Wind: 20 g CO₂e/kWh im Lebenszyklus, wetterabhängig, modellierte Gesamtkosten 10–18 ct/kWh einschließlich Netz- und Speicheranteil; die Bandbreite hängt besonders vom Speicherbedarf und vom Erzeugungsprofil des Wetterjahres ab. Gas: 450 g CO₂e/kWh, regelbar, modellierte Gesamtkosten 13–24 ct/kWh einschließlich Brennstoff und CO₂-Preis; die Bandbreite hängt besonders von künftigem Gas- und CO₂-Preis ab. Beide Bereiche sind Planungsschätzungen, keine garantierten Preise. Reserveleistung und Netzausbau sind in beiden Varianten standortabhängig.\n\n1. Stellen Sie für beide Optionen die Kette von Energieträger beziehungsweise Primärenergie über Umwandlung, elektrische Übertragung und Nutzung bis zu Energieabgaben an die Umgebung dar. (7 BE)\n2. Vergleichen Sie beide Optionen mit mindestens vier ausdrücklich benannten Kriterien aus Physik, Ökologie, Ökonomie und gesellschaftlicher Versorgungssicherheit. Trennen Sie Messdaten, Annahmen und Wertgewichtungen. (7 BE)\n3. Formulieren Sie ein abgewogenes Urteil für einen Versorgungmix, beziehen Sie Klimawirkungen ein und nennen Sie zwei zusätzliche Daten, die das Urteil verändern könnten. (6 BE)',
      solutionContent:
        'Bei Wind führt die Kette von kinetischer Energie der Luft über Rotorbewegung und Generator zur elektrischen Energie im Netz und weiter zur Nutzung; Reibung, Schall, Wirbel und elektrische Verluste übertragen Energie an die Umgebung. Beim Gas führt sie von chemischer Energie über thermische Energie der Verbrennung und mechanische Energie der Turbine zum Generator, ins Netz und zur Nutzung; Abgaswärme, Kühlung, Reibung und elektrische Verluste übertragen Energie an die Umgebung. Die Daten sprechen beim Klimakriterium für Wind, bei unmittelbarer Regelbarkeit für Gas. Die Kostenintervalle überlappen zwischen 13 und 18 ct/kWh und tragen unterschiedliche Unsicherheiten: bei Wind vor allem Speicherbedarf und Wetterjahr, bei Gas vor allem Brennstoff- und CO₂-Preis. Deshalb erlaubt das Material keine sichere allgemeine Rangfolge der Kosten. Speicher, Netz, Flächen und Versorgungssicherheit müssen transparent verglichen werden. Ein tragfähiges Urteil ist bedingt, legt Gewichtungen offen und benennt etwa reale lokale Erzeugungsprofile, Speicherwirkungsgrade oder standortspezifische Netzkosten als zusätzliche Daten.',
      scoring: {
        maxPoints: 20,
        passingPoints: 12,
        steps: [
          { id: 'energy_supply_1', points: 7, description: 'Zwei vollständige Energieübertragungsketten dargestellt' },
          { id: 'energy_supply_2', points: 7, description: 'Versorgungsoptionen daten- und kriterienscharf verglichen' },
          { id: 'energy_supply_3', points: 6, description: 'Abgewogenes Klima- und Versorgungsurteil mit Datengrenzen formuliert' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_color_light_interactions',
      id: '2c195204-2e21-5369-8782-7bf4fc41bf9f',
      title: 'Prüfungsaufgabe: Farben und Lichtwechselwirkungen in einer Ausstellung erklären',
      titleEn: 'Assessment Task: Explain Colors and Light Interactions in an Exhibit',
      description:
        'Die lernende Person kann Spektralzerlegung, additive und subtraktive Farbmischung sowie Streuung und Absorption an Beobachtungen einer Lichtausstellung unterscheiden und erklären.',
      descriptionEn:
        'The learner can distinguish and explain spectral decomposition, additive and subtractive color mixing, and scattering and absorption from observations in a light exhibit.',
      coveredGoalIds: [
        'a4681378-ade4-4f20-bf77-fb020469510f',
        'cdab9fd1-5054-4a7e-8c9a-4474062ddd23',
        '9a9e2085-5ab6-534f-b622-83774d51f36b',
      ],
      applicability: ['DE-BW'],
      area: 'Optik und Farben',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.COLOR_LIGHT_INTERACTIONS',
      processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_WELLEN', 'LI_MATERIE'],
      coveredStrands: ['LI_WELLEN', 'LI_MATERIE'],
      taskContent:
        '**Ausstellung:** Station P zerlegt weißes Licht mit einem Prisma. Station K lässt einen Farbkreis mit gleich großen roten, grünen und blauen Sektoren bei geeigneter Helligkeit schnell rotieren. Station RGB überlagert rote, grüne und blaue Lichtkegel; Station D mischt Cyan-, Magenta- und Gelbfilter. Station N beleuchtet bei gleicher Eingangshelligkeit zuerst eine Nebelkammer und dann einen schwarzen Stoff: Beim Nebel ist der Strahl seitlich als breiter Lichtkegel sichtbar und der Schirm dahinter noch mäßig hell. Beim Stoff bleibt der Schirm fast dunkel, seitlich entsteht kein vergleichbar heller Lichtkegel und der Stoff erwärmt sich messbar.\n\n1. Erklären Sie an P die räumliche Spektralzerlegung durch wellenlängenabhängige Brechung. Sagen Sie für K den annähernd weißen Gesamteindruck bei schneller Rotation voraus und erklären Sie ihn durch zeitliche Integration; nennen Sie eine Ursache für einen grauen oder farbstichigen nichtidealen Eindruck. (6 BE)\n2. Sagen Sie je zwei Mischungen an RGB und D voraus und erklären Sie, warum Lichtüberlagerung additiv, Filtermischung aber subtraktiv wirkt. (6 BE)\n3. Deuten Sie die gesamte Lichtverteilung und die Erwärmung an N im Hinblick auf Streuung und Absorption. Erklären Sie, warum geringere Transmission allein beide Vorgänge nicht unterscheidet und warum Streuung und Absorption in einem Material nebeneinander auftreten können. (5 BE)',
      solutionContent:
        'Das Prisma lenkt Wellenlängen verschieden stark ab und trennt Spektralfarben räumlich. Beim schnell rotierenden Farbkreis kann das Auge die rasch wechselnden roten, grünen und blauen Sektoren nicht zeitlich trennen und integriert sie bei geeigneten Anteilen zu einem annähernd weißen Gesamteindruck. Ungleiche Helligkeiten, Pigmentreflexionen oder ungeeignete Sektoranteile können den Eindruck grau oder farbstichig machen. RGB-Licht addiert Intensitäten, etwa Rot plus Grün zu Gelb und alle drei näherungsweise zu Weiß. Filter entziehen Spektralanteile; im idealisierten CMY-Modell ergeben Cyan plus Magenta Blau, Magenta plus Gelb Rot und Cyan plus Gelb Grün. Der breite seitlich sichtbare Lichtkegel im Nebel belegt eine starke Richtungsänderung und damit Streuung. Beim schwarzen Stoff stützen die geringe Transmission, das fehlende vergleichbar helle seitliche Streulicht und besonders die Erwärmung gemeinsam die Deutung, dass ein großer Lichtanteil absorbiert und in innere Energie überführt wird. Geringe Transmission allein wäre nicht eindeutig, weil sowohl Streuung als auch Absorption Licht aus dem ursprünglichen Strahl entfernen; reale Stoffe können beides zugleich bewirken.',
      scoring: {
        maxPoints: 17,
        passingPoints: 10,
        steps: [
          { id: 'color_light_1', points: 6, description: 'Spektralzerlegung und zeitliche Farbintegration unterschieden' },
          { id: 'color_light_2', points: 6, description: 'Additive und subtraktive Mischungen vorhergesagt und erklärt' },
          { id: 'color_light_3', points: 5, description: 'Streuung und Absorption aus Beobachtungen abgeleitet' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_refraction_lens_models',
      id: '44985d9f-7b49-52e4-86ec-eddc7b70429f',
      title: 'Prüfungsaufgabe: Brechung und Linsen mit dem Strahlenmodell untersuchen',
      titleEn: 'Assessment Task: Investigate Refraction and Lenses with the Ray Model',
      description:
        'Die lernende Person kann Brechung und Linsenabbildungen mit dem Strahlenmodell beschreiben, konstruieren und die Funktion sowie Grenzen dieses physikalischen Modells erläutern.',
      descriptionEn:
        'The learner can describe and construct refraction and lens images using the ray model and explain the function and limits of this physical model.',
      coveredGoalIds: [
        '6a4c6042-052b-502b-a39a-0ed8941247ac',
        '078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5',
        'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
      ],
      applicability: ['DE-BW'],
      area: 'Optik und Modelle',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.REFRACTION_LENS_MODELS',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_WELLEN', 'LI_MODELLE'],
      coveredStrands: ['LI_WELLEN', 'LI_MODELLE'],
      taskContent:
        '**Kontext Unterwasserkamera:** Ein Gegenstand unter Wasser erscheint von der Luft aus angehoben. Eine Konvexlinse bildet ihn auf einen Sensor ab; zum Vergleich liegt eine Konkavlinse bereit.\n\n1. Zeichnen Sie an der Wasser-Luft-Grenze Lot, Einfalls- und gebrochenen Strahl und erklären Sie Brechung sowie optische Hebung qualitativ. (6 BE)\n2. Konstruieren Sie mit Hauptstrahlen das reelle Bild eines Gegenstands außerhalb der doppelten Brennweite an der Konvexlinse. Beschreiben Sie Lage und Größe; zeichnen Sie anschließend qualitativ die Zerstreuungswirkung der Konkavlinse. (7 BE)\n3. Erläutern Sie, welche Fragen das Strahlenmodell hier beantwortet, welche Annahmen es idealisiert und warum es weder die Wellennatur des Lichts noch reale Linsenfehler vollständig beschreibt. Vergleichen Sie seine Funktion kurz mit einem Teilchenmodell aus einem anderen Physikbereich. (5 BE)',
      solutionContent:
        'Beim Übergang Wasser zu Luft wird Licht vom Lot weg gebrochen; die rückwärtige Verlängerung lässt den Gegenstand höher erscheinen. Bei der Konvexlinse ergibt die Konstruktion für g > 2f ein reelles, umgekehrtes, verkleinertes Bild zwischen f und 2f. Eine Konkavlinse zerstreut Strahlen und erzeugt im einfachen Fall ein virtuelles Bild. Das Strahlenmodell reduziert Licht auf gerichtete Linien und eignet sich für Wege und Bilder, vernachlässigt aber Beugung, Interferenz und Linsenfehler. Wie ein Teilchenmodell hebt es ausgewählte Eigenschaften hervor und hat einen begrenzten Gültigkeitsbereich.',
      scoring: {
        maxPoints: 18,
        passingPoints: 11,
        steps: [
          { id: 'refraction_lens_1', points: 6, description: 'Brechung und optische Hebung im Strahlenmodell erklärt' },
          { id: 'refraction_lens_2', points: 7, description: 'Konvexlinsenbild konstruiert und Konkavlinsenwirkung beschrieben' },
          { id: 'refraction_lens_3', points: 5, description: 'Funktion, Annahmen und Grenzen physikalischer Modelle erläutert' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_pinhole_eye',
      id: '35dd0a33-e5d5-53b9-8438-3d339173db1b',
      title: 'Prüfungsaufgabe: Lochkamera und Auge vergleichen',
      titleEn: 'Assessment Task: Compare a Pinhole Camera and the Eye',
      description:
        'Die lernende Person kann Bildentstehung in der Lochkamera mit geradliniger Lichtausbreitung erklären und den Sehvorgang sowie Kurz- und Weitsichtigkeit am Auge qualitativ deuten.',
      descriptionEn:
        'The learner can explain image formation in a pinhole camera through rectilinear light propagation and qualitatively interpret vision, myopia, and hyperopia in the eye.',
      coveredGoalIds: [
        '1ab5f599-0927-579d-94cc-feecdf3b5603',
        '90e1e6cf-4092-41d6-81f7-5206f9d68f84',
      ],
      applicability: ['DE-BW'],
      area: 'Optik und Sehen',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.PINHOLE_EYE',
      processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_WELLEN', 'LI_BIOPHYSIK'],
      coveredStrands: ['LI_WELLEN', 'LI_BIOPHYSIK'],
      taskContent:
        '**Material:** Eine Lochkamera und ein vereinfachtes Augenmodell betrachten denselben beleuchteten Pfeil.\n\n1. Zeichnen Sie von Pfeilspitze und Pfeilfuß je einen geradlinigen Lichtweg durch das Loch zur Rückwand. Erklären Sie Lage und Orientierung des Bildes und sagen Sie voraus, wie ein kleineres Loch Helligkeit und Schärfe verändert. (7 BE)\n2. Beschriften Sie am Augenmodell Hornhaut, Linse und Netzhaut und erklären Sie, wie ein scharfes Netzhautbild entsteht. (5 BE)\n3. Zeichnen Sie qualitativ die Bildlage bei Kurz- und Weitsichtigkeit relativ zur Netzhaut und ordnen Sie Zerstreuungs- beziehungsweise Sammellinse als Korrektur zu. (5 BE)',
      solutionContent:
        'Geradlinige Strahlen von oben und unten kreuzen sich am Loch, sodass auf der Rückwand ein umgekehrtes Bild entsteht. Ein kleineres Loch verbessert geometrisch die Schärfe, lässt aber weniger Licht durch. Im Auge bündeln Hornhaut und Linse das Licht auf der Netzhaut. Bei Kurzsichtigkeit liegt der Fokus vor der Netzhaut und eine Zerstreuungslinse korrigiert, bei Weitsichtigkeit dahinter und eine Sammellinse korrigiert.',
      scoring: {
        maxPoints: 17,
        passingPoints: 10,
        steps: [
          { id: 'pinhole_eye_1', points: 7, description: 'Lochkamerabild konstruiert und Lochgröße qualitativ beurteilt' },
          { id: 'pinhole_eye_2', points: 5, description: 'Sehvorgang am Auge fachlich erklärt' },
          { id: 'pinhole_eye_3', points: 5, description: 'Kurz- und Weitsichtigkeit samt Korrekturlinsen zugeordnet' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_bw_sound_hearing',
      id: '00e2ddfe-18c1-57a4-86ad-ee467a1a3d61',
      title: 'Prüfungsaufgabe: Schall bei einer Schulveranstaltung untersuchen',
      titleEn: 'Assessment Task: Investigate Sound at a School Event',
      description:
        'Die lernende Person kann Schallquelle und -empfänger beschreiben, Tonhöhe, Lautstärke und Geräusch unterscheiden, Schallgeschwindigkeiten datenbasiert vergleichen, den Hörvorgang qualitativ erklären und eine Lärmbelastung für das Ohr beurteilen.',
      descriptionEn:
        'The learner can describe sound sources and receivers, distinguish pitch, loudness, and noise, compare sound speeds from data, explain hearing qualitatively, and assess a noise exposure for the ear.',
      coveredGoalIds: [
        'c1006f55-0406-48cc-92d4-0d8345897cf4',
        '10aad90e-a1db-42b6-8d1e-1d856e14b47d',
        'a24c41ce-68c5-56a7-8235-ef9a7dba7042',
        '2a6ad2c6-3e1b-57a9-82a1-e6620a532f5c',
        'da0837c7-95a7-5a6a-81db-f33cb7f42d85',
      ],
      applicability: ['DE-BW'],
      area: 'Akustik und Hören',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.SOUND_HEARING',
      processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK5_BEWERTEN'],
      guidingIdeas: ['LI_WELLEN', 'LI_BIOPHYSIK'],
      coveredStrands: ['LI_WELLEN', 'LI_BIOPHYSIK'],
      taskContent:
        '**Kontext Schulkonzert:** Eine Lautsprechermembran schwingt; ein Mikrofon und das Ohr empfangen Schall. Oszillogramm A ist periodisch mit 440 Hz, B unregelmäßig; C hat dieselbe Frequenz wie A, aber größere Amplitude. Gemessene Schallgeschwindigkeiten: Luft 343 m/s, Wasser 1480 m/s, Stahl 5100 m/s. Am Mischpult werden in Ohrnähe 94 dB über 60 min erwartet.\n\n1. Beschreiben Sie Lautsprecher als Schallquelle sowie Mikrofon und Ohr als Empfänger und erklären Sie die Übertragung über Schwingungen des Mediums. (5 BE)\n2. Ordnen Sie A und B Ton beziehungsweise Geräusch zu, vergleichen Sie A und C hinsichtlich Tonhöhe und Lautstärke und begründen Sie mit Frequenz und Amplitude. (5 BE)\n3. Vergleichen Sie die drei Schallgeschwindigkeiten und begründen Sie die Unterschiede mit elastischer Kopplung und Trägheit im Teilchenmodell. Erklären Sie, warum der Aggregatzustand allein keine allgemeine Rangfolge garantiert. (5 BE)\n4. Erklären Sie den Weg des Schalls durch Außenohr, Mittelohr und Innenohr einschließlich der Umwandlung der mechanischen Anregung in Nervensignale. Beurteilen Sie die Belastung von 94 dB über 60 min und leiten Sie zwei konkrete Schutzmaßnahmen ab. (5 BE)',
      solutionContent:
        'Die Membran regt das Medium an; Mikrofon und Ohr wandeln die ankommende Schwingung um. A ist ein Ton, B ein Geräusch. A und C haben gleiche Tonhöhe, C ist wegen größerer Amplitude lauter. Die Daten zeigen deutlich verschiedene Geschwindigkeiten; starke elastische Kopplung erhöht, große Trägheit vermindert die Ausbreitung, sodass nicht der Aggregatzustand allein entscheidet. Außenohr und Trommelfell nehmen Schall auf, Gehörknöchelchen übertragen, die Cochlea wandelt in Nervenimpulse. 94 dB über eine Stunde ist belastend; Abstand, geringerer Pegel, kürzere Dauer und Gehörschutz reduzieren das Risiko.',
      scoring: {
        maxPoints: 20,
        passingPoints: 12,
        steps: [
          { id: 'sound_hearing_1', points: 5, description: 'Schallquelle, Medium und Empfänger fachlich beschrieben' },
          { id: 'sound_hearing_2', points: 5, description: 'Ton, Geräusch, Tonhöhe und Lautstärke an Signalen unterschieden' },
          { id: 'sound_hearing_3', points: 5, description: 'Schallgeschwindigkeiten daten- und teilchenmodellgestützt verglichen' },
          { id: 'sound_hearing_4a', points: 2, description: 'Hörweg und Umwandlung in Nervensignale qualitativ erklärt' },
          { id: 'sound_hearing_4b', points: 3, description: 'Lärmbelastung mit Pegel und Dauer beurteilt sowie Schutzmaßnahmen abgeleitet' },
        ],
      },
    },
  ].map(makeRouteAssessmentSpec),
)

assessmentSpecs.push(
  ...[
    {
      shortKey: 'canonical_physics_sek1_assessment_optical_instrument_model',
      id: '3f477f0d-4f79-5eed-8671-fb2667d60910',
      title: 'Prüfungsaufgabe: Ein einfaches Fernrohr im Strahlenmodell deuten',
      titleEn: 'Assessment Task: Interpret a Simple Telescope with a Ray Model',
      description:
        'Die lernende Person kann Aufbau und Bildentstehung eines einfachen Fernrohrs mit Objektiv, Zwischenbild und Okular beschreiben und einen modellhaften Strahlengang deuten.',
      descriptionEn:
        'The learner can describe the structure and image formation of a simple telescope using its objective, intermediate image, and eyepiece and interpret a model ray path.',
      coveredGoalIds: ['6367d45e-919e-4c19-bcd9-7770a2d51139'],
      applicability: [...GENERIC_COMPATIBILITY_JURISDICTIONS],
      area: 'Optik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.OPTICAL_INSTRUMENT',
      processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_WELLEN', 'LI_TECHNIK'],
      coveredStrands: ['LI_WELLEN', 'LI_TECHNIK'],
      taskContent:
        '**Material:** Ein vereinfachtes Kepler-Fernrohr besteht aus einem Objektiv mit 200 mm Brennweite und einem Okular mit 40 mm Brennweite; die Linsenmitten liegen 240 mm auseinander. Die Spitze eines weit entfernten Gegenstands liegt oberhalb der optischen Achse. Für die Strahlenskizze sind von dieser Spitze ein nahezu achsenparalleler Strahl zum Objektiv und ein Strahl durch die Objektivmitte vorgegeben; sie repräsentieren zwei Strahlen des nahezu parallelen Bündels.\n\n1. Beschriften Sie Objektiv, Okular, optische Achse, Brennpunkte und das reelle umgekehrte Zwischenbild. Ergänzen Sie den Verlauf der beiden Hauptstrahlen bis zum Zwischenbild. (6 BE)\n2. Erklären Sie die Aufgabe von Objektiv und Okular und deuten Sie, warum der Linsenabstand hier der Summe der Brennweiten entspricht. (5 BE)\n3. Beschreiben Sie Lage, Orientierung und Wahrnehmung des endgültigen Bildes für ein entspanntes Auge und nennen Sie zwei Grenzen des vereinfachten Strahlenmodells beziehungsweise Aufbaus. (5 BE)',
      solutionContent:
        'Im Dünnlinsenmodell wird der nahezu achsenparallele Strahl hinter dem Objektiv durch dessen bildseitigen Brennpunkt gebrochen; der Strahl durch die Objektivmitte verläuft näherungsweise geradlinig. Ihr Schnittpunkt liegt unterhalb der Achse in der Brennebene und gehört zum reellen umgekehrten Zwischenbild. Dieses liegt zugleich in der vorderen Brennebene des Okulars, weil 200 mm + 40 mm = 240 mm. Das Okular wirkt als Lupe für das Zwischenbild; austretende Strahlen sind für das entspannte Auge wieder nahezu parallel. Das endgültige Bild ist virtuell, gegenüber dem ursprünglichen Gegenstand umgekehrt und erscheint unter vergrößertem Sehwinkel in sehr großer Entfernung. Das einfache Modell vernachlässigt unter anderem Linsenfehler, endliche Linsendicken, begrenzte Öffnungen und die genaue Anpassung an das Auge.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'optical_instrument_1', points: 6, description: 'Fernrohrteile, Brennpunkte, Hauptstrahlen und Zwischenbild korrekt dargestellt' },
          { id: 'optical_instrument_2', points: 5, description: 'Funktionen beider Linsen und Linsenabstand fachlich erklärt' },
          { id: 'optical_instrument_3', points: 5, description: 'Wahrnehmung durch das Okular beschrieben und zwei Modellgrenzen benannt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_musical_instrument_sound',
      id: '0acb10a3-c5e2-5a76-8907-3dfe1b57e767',
      title: 'Prüfungsaufgabe: Klanggestaltung an einer Gitarre untersuchen',
      titleEn: 'Assessment Task: Investigate Sound Shaping on a Guitar',
      description:
        'Die lernende Person kann Tonhöhe, Lautstärke und Klang einer Gitarrensaite aus Beobachtungen deuten und die Funktion des Resonanzkörpers erklären.',
      descriptionEn:
        'The learner can interpret the pitch, loudness, and timbre of a guitar string from observations and explain the function of the resonating body.',
      coveredGoalIds: ['e62e48bc-2387-4b2b-8d6f-7a06c8e7580e'],
      applicability: [...GENERIC_COMPATIBILITY_JURISDICTIONS, 'DE-BY'],
      area: 'Akustik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.MUSICAL_INSTRUMENT',
      processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_WELLEN', 'LI_TECHNIK'],
      coveredStrands: ['LI_WELLEN', 'LI_TECHNIK'],
      taskContent:
        '**Material:** Dieselbe Gitarrensaite schwingt bei gleicher Spannung mit 65 cm freier Länge bei 110 Hz und mit 32,5 cm freier Länge bei 220 Hz. Ein stärkeres Anzupfen vergrößert im Oszillogramm die Amplitude, ohne die Grundfrequenz wesentlich zu ändern. Ein Tonabnehmer zeichnet bei gleicher Grundfrequenz für Gitarre und Stimmgabel unterschiedlich geformte periodische Signale auf. Ohne Resonanzkörper ist die Saite deutlich leiser.\n\n1. Beschreiben und erklären Sie anhand der Daten, wie die freie Saitenlänge die Tonhöhe verändert. (5 BE)\n2. Ordnen Sie dem stärkeren Anzupfen die Änderung der Lautstärke zu und grenzen Sie sie von einer Änderung der Tonhöhe ab. (4 BE)\n3. Deuten Sie die unterschiedlichen Signalformen als unterschiedlichen Klang trotz gleicher Grundfrequenz und erklären Sie, wie der Resonanzkörper die Schwingung wirksamer an die Luft überträgt. (6 BE)',
      solutionContent:
        'Die halbierte freie Saitenlänge verdoppelt in den Daten die Grundfrequenz von 110 Hz auf 220 Hz; der Ton wird höher. Stärkeres Anzupfen erhöht die Amplitude und damit die Lautstärke, nicht wesentlich die Grundfrequenz. Unterschiedliche Signalformen zeigen verschiedene Anteile von Grund- und Obertönen und damit unterschiedliche Klangfarben. Der Resonanzkörper überträgt die Saitenschwingung über eine größere schwingende Fläche stärker an die Luft, sodass der Ton lauter hörbar wird.',
      scoring: {
        maxPoints: 15,
        passingPoints: 9,
        steps: [
          { id: 'instrument_sound_1', points: 5, description: 'Saitenlänge und Tonhöhe datenbasiert verknüpft' },
          { id: 'instrument_sound_2', points: 4, description: 'Amplitude, Lautstärke und Tonhöhe trennscharf zugeordnet' },
          { id: 'instrument_sound_3', points: 6, description: 'Klangfarbe und Funktion des Resonanzkörpers erklärt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_color_technology_perception',
      id: 'bb7c5191-3c35-5ba6-85e0-795c7a049744',
      title: 'Prüfungsaufgabe: Bildschirm-, Druck- und Körperfarben erklären',
      titleEn: 'Assessment Task: Explain Screen, Print, and Object Colors',
      description:
        'Die lernende Person kann additive Bildschirmfarben und subtraktive Druckfarben erklären und Farbeindrücke aus Beleuchtung, Oberfläche und dem ins Auge gelangenden Licht ableiten.',
      descriptionEn:
        'The learner can explain additive screen colors and subtractive print colors and derive color perception from illumination, surface properties, and the light reaching the eye.',
      coveredGoalIds: [
        'cc9eea77-2a7f-4f35-ac22-6c230c0d6fa5',
        '1c8dd14c-0fbf-44a5-85a3-25c8e3bd0075',
      ],
      applicability: [...GENERIC_COMPATIBILITY_JURISDICTIONS],
      area: 'Farben',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.COLOR_TECHNOLOGY_PERCEPTION',
      processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_WELLEN', 'LI_MATERIE', 'LI_TECHNIK'],
      coveredStrands: ['LI_WELLEN', 'LI_MATERIE', 'LI_TECHNIK'],
      taskContent:
        '**Material:** Ein Display-Pixel besitzt rote, grüne und blaue Teilpixel. Für Gelb leuchten Rot und Grün, für Weiß alle drei. Auf einem Druckbogen überlagern sich Cyan- und Gelbtinte zu Grün. Ein weißes, ein rotes und ein grünes Kartenfeld werden nacheinander mit weißem und ausschließlich rotem Licht beleuchtet.\n\n1. Erklären Sie die beiden Displayfarben mit additiver Farbmischung und sagen Sie voraus, welche Teilpixel für Cyan leuchten. (5 BE)\n2. Erklären Sie die grüne Druckfarbe als subtraktive Farbmischung: Benennen Sie, welche Anteile Cyan- und Gelbtinte aus weißem Licht überwiegend entziehen und welcher Anteil zum Auge gelangt. (5 BE)\n3. Sagen Sie die Farbeindrücke der drei Kartenfelder unter rotem Licht voraus. Begründen Sie jeden Eindruck über Beleuchtung, spektrale Reflexion beziehungsweise Absorption der Oberfläche und das Licht, das schließlich ins Auge gelangt. (6 BE)',
      solutionContent:
        'Beim Display addieren sich die ausgesandten Lichtanteile: Rot und Grün erscheinen gelb, Rot, Grün und Blau näherungsweise weiß, Grün und Blau cyan. Beim Druck entzieht Cyan vor allem rote und Gelb vor allem blaue Anteile; überwiegend grünes Licht wird zurückgeworfen. Unter ausschließlich rotem Licht kann das weiße Feld Rot reflektieren und erscheint rot, das rote Feld ebenfalls. Das grüne Feld reflektiert den angebotenen roten Anteil kaum und erscheint dunkel. Der Farbeindruck hängt daher gemeinsam von Beleuchtung, Oberfläche und dem ins Auge gelangenden Licht ab.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'color_technology_1', points: 5, description: 'Additive Displayfarben erklärt und Cyan korrekt vorhergesagt' },
          { id: 'color_technology_2', points: 5, description: 'Subtraktive Druckmischung über entzogene und reflektierte Spektralanteile erklärt' },
          { id: 'color_technology_3', points: 6, description: 'Drei Farbeindrücke aus Beleuchtung, Oberfläche und Lichtweg begründet' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_mass_volume_density_lab',
      id: 'd304cfd0-f87c-51f7-8dee-f5f405da4b3d',
      title: 'Prüfungsaufgabe: Masse, Volumen und Dichte experimentell bestimmen',
      titleEn: 'Assessment Task: Determine Mass, Volume, and Density Experimentally',
      description:
        'Die lernende Person kann Masse und Volumen regelmäßiger sowie unregelmäßiger Körper fachgerecht messen, daraus Dichten bestimmen und Messwerte samt Einheiten und Fehlerquellen beurteilen.',
      descriptionEn:
        'The learner can correctly measure the mass and volume of regular and irregular objects, determine their densities, and assess measurements, units, and error sources.',
      coveredGoalIds: [
        'af0e2efb-f634-5f2d-abea-b2e1a67a2894',
        'f827b00f-af7f-52de-84aa-2a2bbaa035bd',
        'f92b5b8a-327f-50d2-8313-6a142399ebf0',
        'c2d6bdf1-8077-50fb-a8b5-2f0b7e3493f0',
      ],
      applicability: [...GENERIC_COMPATIBILITY_JURISDICTIONS],
      area: 'Mechanik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.MASS_VOLUME_DENSITY_LAB',
      processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_MATERIE', 'LI_TECHNIK'],
      coveredStrands: ['LI_MATERIE', 'LI_TECHNIK'],
      taskContent:
        '**Praktische Station, falls die Geräte real vorliegen:** Ein Metallquader und ein vollständig eintauchbarer unregelmäßiger Stein, zwei Waagen (A: bis 200 g, 0,1 g; B: bis 5 kg, 1 g), Messschieber, Messzylinder und Wasser. Führen Sie dann die verlangten Messungen selbst aus.\n\n**Textbasierter Ersatzpfad nur für Planung, Instrumentablesung und Auswertung:** Die Nullanzeigen sind Waage A: 0,0 g, Waage B: 0 g und Messschieber: 0,00 cm. Nach Auflegen zeigt Waage A für den Quader 78,0 g und für den Stein 64,0 g. Am Quader werden 5,00 cm × 2,00 cm × 1,00 cm abgelesen. Der untere Meniskus im Messzylinder steht vor dem vollständigen Eintauchen des Steins bei 50,0 mL und danach bei 74,0 mL. Verwenden Sie diese Instrumentanzeigen und erläutern Sie jeweils das Vorgehen, statt eine praktische Durchführung zu behaupten. Dieser Ersatzpfad weist die praktische Gerätehandhabung nicht nach: Für den vollständigen Nachweis des Messziels sind eine reale Station und die Beobachtung durch eine Lehrkraft erforderlich; der Coach muss die praktische Teilkompetenz sonst als nicht beobachtet kennzeichnen.\n\n**Für beide Pfade:** Dichtetabelle: Aluminium 2,70 g/cm³, Stahl 7,8 g/cm³, Kupfer 8,9 g/cm³. Kennzeichnen Sie, welchen Pfad Sie bearbeiten.\n\n1. Wählen Sie für jeden Körper eine geeignete Waage, kontrollieren beziehungsweise beurteilen Sie den Nullpunkt und messen Sie beide Massen oder lesen Sie sie im Ersatzpfad ab. Protokollieren und vergleichen Sie die Massen mit Einheit und angemessener Genauigkeit. (5 BE)\n2. Messen Sie Länge, Breite und Höhe des Quaders oder werten Sie die Messschieberanzeigen aus, berechnen Sie sein Volumen und prüfen Sie Einheit und Größenordnung. (5 BE)\n3. Bestimmen Sie das Volumen des Steins aus den Flüssigkeitsständen vor und nach vollständigem Eintauchen. Lesen beziehungsweise beurteilen Sie den Meniskus fachgerecht und erklären Sie den Einfluss anhaftender Luftblasen. (6 BE)\n4. Berechnen Sie für beide Körper die Dichte. Ordnen Sie den Quader anhand der Tabelle einem Material zu. Bei gleicher Masse: Erklären Sie, wie sich unterschiedliche Dichten auf das Volumen auswirken. (6 BE)',
      solutionContent:
        'Am realen Aufbau deckt eine passende Waage die jeweilige Masse ab und bietet innerhalb dieses Bereichs die feinere sinnvolle Auflösung; vor der Messung wird tariert beziehungsweise der Nullpunkt kontrolliert. Die tatsächlich beobachtete Handhabung und die Messwerte werden mit Einheiten und Messgenauigkeit bewertet. Im Ersatzpfad liegen beide Massen unter 200 g, daher ist Waage A mit der feineren Auflösung geeignet; ihre Nullanzeige ist korrekt. Es ergeben sich m_Quader = 78,0 g und m_Stein = 64,0 g, also ist der Quader um 14,0 g schwerer. Für den Quader gilt V = l · b · h = 5,00 cm · 2,00 cm · 1,00 cm = 10,0 cm³ und damit ρ = 78,0 g / 10,0 cm³ = 7,8 g/cm³: Der Tabellenvergleich ergibt Stahl. Beim Stein ist V = 74,0 mL − 50,0 mL = 24,0 mL = 24,0 cm³ und ρ = 64,0 g / 24,0 cm³ ≈ 2,67 g/cm³. Der untere Meniskus wird auf Augenhöhe abgelesen; Luftblasen vergrößern die scheinbare Verdrängung und würden die berechnete Dichte zu klein erscheinen lassen. Für beide Pfade gilt ρ = m/V mit zusammenpassenden Einheiten. Bei gleicher Masse besitzt ein dichterer Stoff das kleinere Volumen. Bei ausschließlicher Bearbeitung des Ersatzpfads sind Gerätewahl, Ablesung, Rechnung und Fehlerdeutung bewertbar; die praktische Handhabung bleibt ausdrücklich nicht beobachtet und darf nicht als beherrscht zertifiziert werden.',
      scoring: {
        maxPoints: 22,
        passingPoints: 13,
        steps: [
          { id: 'mass_density_1', points: 5, description: 'Waage gewählt, Nullpunkt und beide Massen korrekt behandelt; praktische Handhabung nur bei real beobachteter Durchführung belegt' },
          { id: 'mass_density_2', points: 5, description: 'Quaderabmessungen und geometrisches Volumen korrekt bestimmt; praktische Messung nur bei real beobachteter Durchführung belegt' },
          { id: 'mass_density_3', points: 6, description: 'Steinvolumen und Fehler korrekt beurteilt; praktische Verdrängungsmessung nur bei real beobachteter Durchführung belegt' },
          { id: 'mass_density_4', points: 6, description: 'Beide Dichten berechnet, Material zugeordnet und Dichte-Volumen-Beziehung erklärt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_archimedes_buoyancy',
      id: 'e1d3c599-6964-5094-83ee-7fb1ecd161ce',
      title: 'Prüfungsaufgabe: Auftrieb in Wasser und Luft erklären',
      titleEn: 'Assessment Task: Explain Buoyancy in Water and Air',
      description:
        'Die lernende Person kann die Auftriebskraft aus Kraftmessungen und verdrängtem Wasser bestimmen und Auftrieb in Wasser und Luft mit dem archimedischen Prinzip sowie Druckunterschieden erklären.',
      descriptionEn:
        'The learner can determine buoyant force from force measurements and displaced water and explain buoyancy in water and air using Archimedes’ principle and pressure differences.',
      coveredGoalIds: ['e11b2ee9-e528-4857-9ecd-59bd460fba81'],
      applicability: [...GENERIC_COMPATIBILITY_JURISDICTIONS],
      area: 'Druck und Auftrieb',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.ARCHIMEDES_BUOYANCY',
      processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
      guidingIdeas: ['LI_MATERIE', 'LI_BEWEGUNG'],
      coveredStrands: ['LI_MATERIE', 'LI_BEWEGUNG'],
      taskContent:
        '**Material Wasser:** Ein Körper zeigt am Kraftmesser in Luft 1,20 N und vollständig eingetaucht in Wasser 0,70 N. Er verdrängt dabei 50 cm³ Wasser; 50 cm³ Wasser haben die Masse 50 g. Verwenden Sie g = 10 N/kg.\n\n1. Bestimmen Sie die Auftriebskraft aus den beiden Kraftmessungen und vergleichen Sie sie mit der Gewichtskraft des verdrängten Wassers. (6 BE)\n2. Zeichnen Sie am eingetauchten Körper Gewichtskraft, Auftriebskraft und Kraft des Kraftmessers. Erklären Sie den Auftrieb qualitativ über den mit der Tiefe zunehmenden Flüssigkeitsdruck. (6 BE)\n3. Sagen Sie begründet voraus, wie sich die Auftriebskraft ändert, wenn derselbe Körper vollständig in eine Flüssigkeit höherer Dichte eintaucht. Formulieren Sie die Bedingung für Schweben, wenn außer Gewicht und Auftrieb keine weiteren vertikalen Kräfte wirken. (5 BE)\n\n**Material Luft:** Ein Heliumballon verdrängt 3,0 m³ Luft mit der Masse 3,6 kg. Ballonhülle, Korb, Nutzlast und Helium haben zusammen die Masse 2,4 kg. Luftwiderstand, Seil- und Antriebskräfte werden zunächst vernachlässigt.\n\n4. Bestimmen Sie Gewichtskraft der verdrängten Luft und Gewichtskraft des Ballonsystems. Sagen Sie die anfängliche Bewegungsrichtung voraus und erklären Sie, warum das archimedische Prinzip auch in Luft gilt. (5 BE)',
      solutionContent:
        'Die Auftriebskraft ist 1,20 N − 0,70 N = 0,50 N. Das verdrängte Wasser wiegt 0,050 kg · 10 N/kg = 0,50 N; beide Werte stimmen mit dem archimedischen Prinzip überein. Auf den Körper wirken Gewicht nach unten, Auftrieb nach oben und die Kraft des Kraftmessers nach oben. Weil der Druck an der Unterseite größer als an der Oberseite ist, entsteht eine resultierende Kraft nach oben. Bei gleicher verdrängter Menge erhöht eine dichtere Flüssigkeit die Auftriebskraft. Wenn außer Gewicht und Auftrieb keine weiteren vertikalen Kräfte wirken, liegt Schweben genau bei F_A = F_G vor. Luft ist wie Wasser ein Fluid: Auch dort ist der Druck unten größer als oben, und die Auftriebskraft entspricht dem Gewicht der verdrängten Luft. Der Ballon erfährt daher F_A = 3,6 kg · 10 N/kg = 36 N nach oben und F_G = 2,4 kg · 10 N/kg = 24 N nach unten. Die resultierende Kraft beträgt anfangs 12 N nach oben, sodass der Ballon steigt.',
      scoring: {
        maxPoints: 22,
        passingPoints: 13,
        steps: [
          { id: 'buoyancy_1', points: 6, description: 'Auftrieb aus Messwerten bestimmt und mit verdrängter Wassergewichtskraft verglichen' },
          { id: 'buoyancy_2', points: 6, description: 'Kräftebild erstellt und Druckursache des Auftriebs erklärt' },
          { id: 'buoyancy_3', points: 5, description: 'Einfluss der Flüssigkeitsdichte und Schweben korrekt vorhergesagt' },
          { id: 'buoyancy_4', points: 5, description: 'Luftauftrieb aus verdrängter Luft bestimmt und mit demselben archimedischen Prinzip erklärt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_airfoil_drag',
      id: '840a82e3-44aa-5d0f-8b6f-8a067d057d14',
      title: 'Prüfungsaufgabe: Auftrieb und Luftwiderstand im Windkanal einordnen',
      titleEn: 'Assessment Task: Classify Lift and Drag in a Wind Tunnel',
      description:
        'Die lernende Person kann Auftrieb und Luftwiderstand an einer Tragfläche anhand von Kraftmessungen qualitativ beschreiben und einen geeigneten Betriebszustand begründet auswählen.',
      descriptionEn:
        'The learner can qualitatively describe lift and drag on an airfoil from force measurements and justify the selection of a suitable operating condition.',
      coveredGoalIds: ['24b4686a-e8a6-4583-8952-33e6f653c2a3'],
      applicability: [...GENERIC_COMPATIBILITY_JURISDICTIONS],
      area: 'Druck und Auftrieb',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.AIRFOIL_DRAG',
      processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK5_BEWERTEN'],
      guidingIdeas: ['LI_BEWEGUNG', 'LI_TECHNIK'],
      coveredStrands: ['LI_BEWEGUNG', 'LI_TECHNIK'],
      taskContent:
        '**Windkanaldaten bei gleicher Luftgeschwindigkeit:** Die Luftgeschwindigkeit relativ zum festgehaltenen Flügel v_Luft/Flügel zeigt von der Vorderkante zur Hinterkante; die dazu entgegengesetzte Geschwindigkeit v_Flügel/Luft beschreibt die Bewegung des Flügels relativ zur Luft. Anstellwinkel 0°: Auftrieb 0,2 N, Luftwiderstand 0,25 N; 5°: Auftrieb 1,8 N, Luftwiderstand 0,35 N; 10°: Auftrieb 3,0 N, Luftwiderstand 0,75 N. Eine Wollfadenaufnahme zeigt bei 10° hinter der Tragfläche deutlich unruhigere Strömung als bei 5°. Im vereinfachten Modell dient G = Auftriebskraft/Luftwiderstandskraft als aerodynamische Güte; ein größeres G bedeutet mehr Auftrieb je Widerstandskraft.\n\n1. Zeichnen Sie für den 5°-Fall v_Luft/Flügel, v_Flügel/Luft sowie Auftriebs- und Widerstandskraft auf den Flügel ein. Grenzen Sie beide Kräfte über ihre Richtung ab. (5 BE)\n2. Vergleichen Sie die drei Messungen und erklären Sie qualitativ, dass Auftrieb aus der resultierenden Druck- und Strömungswirkung an der Tragfläche entsteht. Ordnen Sie die Widerstandskraft eindeutig relativ zu beiden Geschwindigkeitspfeilen ein. (6 BE)\n3. Berechnen Sie G für 5° und 10°. Wählen Sie unter diesen Modellbedingungen für einen energiesparenden Gleitflug begründet einen der beiden Winkel und nennen Sie zwei Grenzen der Übertragung auf ein reales Flugzeug. (5 BE)',
      solutionContent:
        'Der Auftrieb steht senkrecht zur relativen Anströmung und zeigt hier bei horizontaler Anströmung nach oben. Die Widerstandskraft auf den Flügel zeigt mit v_Luft/Flügel von der Vorder- zur Hinterkante und damit entgegen v_Flügel/Luft; sie hemmt also die Bewegung des Flügels relativ zur Luft. Mit wachsendem Winkel steigen in den Daten beide Kräfte; von 5° zu 10° wächst der Widerstand relativ stark und die unruhigere Nachströmung weist auf höhere Verluste hin. Auftrieb ist die Resultierende der verteilten Druck- und Scherwirkungen und darf nicht mit einer einzelnen Druckstelle erklärt werden. Es gilt G_5° = 1,8/0,35 ≈ 5,14 und G_10° = 3,0/0,75 = 4,0. Unter den angegebenen Modellbedingungen ist daher 5° für den verlangten energiesparenden Gleitfall durch die höhere aerodynamische Güte plausibel; daraus folgt ohne vorgegebene Mindestauftriebskraft kein allgemeines Betriebsoptimum. Reale Flugzeuge unterscheiden sich unter anderem in Geschwindigkeit, Flügelform, dreidimensionaler Strömung, Masse und wechselnden Wetterbedingungen.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'airfoil_drag_1', points: 5, description: 'Beide relativen Geschwindigkeitspfeile, Auftrieb und Widerstand am Flügel gerichtet eingezeichnet und abgegrenzt' },
          { id: 'airfoil_drag_2', points: 6, description: 'Kraftdaten und Strömungsbeobachtung qualitativ fachgerecht gedeutet' },
          { id: 'airfoil_drag_3', points: 5, description: 'Betriebszustand datenbasiert gewählt und zwei Modellgrenzen benannt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_friction_contact_force',
      id: '7072dfbc-f684-5d4e-8c9a-ee74f7ebeeba',
      title: 'Prüfungsaufgabe: Reibung beim Ziehen und Gehen deuten',
      titleEn: 'Assessment Task: Interpret Friction While Pulling and Walking',
      description:
        'Die lernende Person kann Haft- und Gleitreibung als Kontaktkräfte deuten, ihre Richtung in konkreten Situationen bestimmen und erklären, wie Reibung Bewegung hemmt oder Fortbewegung ermöglicht.',
      descriptionEn:
        'The learner can interpret static and kinetic friction as contact forces, determine their direction in concrete situations, and explain how friction impedes motion or enables locomotion.',
      coveredGoalIds: ['581c0766-b84b-54cb-b8b6-375310329a41'],
      applicability: [...GENERIC_COMPATIBILITY_JURISDICTIONS],
      area: 'Mechanik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.FRICTION_CONTACT_FORCE',
      processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_BEWEGUNG', 'LI_TECHNIK'],
      coveredStrands: ['LI_BEWEGUNG', 'LI_TECHNIK'],
      taskContent:
        '**Material A:** Eine Kiste bleibt bei waagerechten Zugkräften von 2 N, 4 N und 6 N in Ruhe; ab 7 N setzt sie sich in Bewegung. Beim gleichförmigen Gleiten zeigt der Kraftmesser 5 N. **Material B:** Beim Gehen drückt der Fuß den Boden nach hinten; auf Eis rutscht er leichter als auf rauem Boden.\n\n1. Zeichnen Sie für die ruhende Kiste bei 4 N Zugkraft alle waagerechten Kräfte und erklären Sie, warum die Haftreibung hier 4 N statt stets 6 N oder 7 N beträgt. (5 BE)\n2. Bestimmen Sie aus den Daten eine Grenze der Haftreibung und die Gleitreibung. Zeichnen Sie deren Richtung beim Ziehen nach rechts und erklären Sie die gleichförmige Bewegung bei 5 N Zugkraft. (6 BE)\n3. Erklären Sie mit der Kontaktkraft zwischen Fuß und Boden, warum Haftreibung beim Gehen eine Vorwärtsbewegung ermöglicht und warum die Fortbewegung auf Eis schwieriger ist. (5 BE)',
      solutionContent:
        'Solange die Kiste ruht, passt sich die Haftreibung bis zu ihrer Grenze der Zugkraft an; bei 4 N wirkt sie daher mit 4 N nach links. Aus dem Losbrechen ab 7 N folgt eine maximale Haftreibung zwischen 6 N und 7 N. Beim gleichförmigen Gleiten beträgt die Gleitreibung 5 N entgegen der Bewegung; die gleich große Zugkraft ergibt eine resultierende Kraft von null. Beim Gehen drückt der Fuß den Boden nach hinten, und der Boden übt durch Haftreibung eine Kraft nach vorn auf den Fuß aus. Auf Eis ist die verfügbare Haftreibung kleiner, sodass der Fuß leichter relativ zum Boden rutscht.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'friction_1', points: 5, description: 'Angepasste Haftreibung an der ruhenden Kiste korrekt dargestellt und erklärt' },
          { id: 'friction_2', points: 6, description: 'Haftgrenze, Gleitreibung, Richtung und Kräftegleichgewicht aus Daten bestimmt' },
          { id: 'friction_3', points: 5, description: 'Fortbewegung und Rutschen über die Kontaktkraft am Fuß erklärt' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_simple_machines_force_distance',
      id: 'd15764ce-ebea-5178-84ea-9351dd808b8c',
      title: 'Prüfungsaufgabe: Kraft und Weg an einfachen Maschinen vergleichen',
      titleEn: 'Assessment Task: Compare Force and Distance in Simple Machines',
      description:
        'Die lernende Person kann Flaschenzug und Hebel als Kraftwandler analysieren und über Kraft-Weg-Produkte erklären, warum eine kleinere Kraft ideal keine mechanische Arbeit einspart.',
      descriptionEn:
        'The learner can analyze a pulley system and a lever as force converters and use force-distance products to explain why a smaller force ideally does not save mechanical work.',
      coveredGoalIds: ['327302e3-5b36-46f8-9c16-73f24583b0eb'],
      applicability: [...GENERIC_COMPATIBILITY_JURISDICTIONS],
      area: 'Mechanik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.SIMPLE_MACHINES_FORCE_DISTANCE',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_BEWEGUNG', 'LI_ENERGIE', 'LI_TECHNIK'],
      coveredStrands: ['LI_BEWEGUNG', 'LI_ENERGIE', 'LI_TECHNIK'],
      taskContent:
        '**Material:** Eine Last mit der Gewichtskraft 600 N wird ideal, also zunächst ohne Reibung, um 0,40 m angehoben. Aufbau P ist ein Flaschenzug mit vier tragenden Seilabschnitten. Aufbau H ist ein Hebel mit 0,25 m Lastarm und 1,00 m Kraftarm. Bei H hebt sich die Last in einem kleinen betrachteten Bewegungsabschnitt um 0,10 m, während der Angriffspunkt der Hand näherungsweise 0,40 m zurücklegt.\n\n1. Bestimmen Sie für P die Zugkraft und den Zugweg. Kennzeichnen Sie in einer Skizze Lastkraft, Zugkraft, Lastweg und Zugweg. (5 BE)\n2. Vergleichen Sie für P Hubarbeit und Zugarbeit über die jeweiligen Kraft-Weg-Produkte. Erklären Sie, warum die kleinere Kraft keine mechanische Arbeit einspart und wie Reibung das reale Ergebnis verändert. (5 BE)\n3. Bestimmen Sie für H die ideale Handkraft aus dem Hebelgesetz und vergleichen Sie Lastarbeit und Handarbeit für den angegebenen Bewegungsabschnitt. Erläutern Sie die gemeinsame Kraftwandler-Idee von Hebel, Rollen sowie Rad und Achse. (6 BE)',
      solutionContent:
        'Bei vier tragenden Seilabschnitten gilt ideal F_Zug = 600 N / 4 = 150 N. Für 0,40 m Lastweg müssen 4 · 0,40 m = 1,60 m Seil gezogen werden. Die Hubarbeit ist 600 N · 0,40 m = 240 J; die Zugarbeit ist 150 N · 1,60 m = 240 J. Der Flaschenzug tauscht daher Kraft gegen Weg, spart ideal aber keine Arbeit. Real muss wegen Reibung mehr als 240 J zugeführt werden. Beim Hebel folgt aus 600 N · 0,25 m = F_Hand · 1,00 m ebenfalls F_Hand = 150 N. Für den kleinen Bewegungsabschnitt sind Lastarbeit 600 N · 0,10 m = 60 J und Handarbeit 150 N · 0,40 m = 60 J. Hebel, Rollen sowie Rad und Achse verändern Kraft und Weg in entgegengesetzter Richtung; ohne Verluste bleibt ihr Produkt gleich.',
      scoring: {
        maxPoints: 16,
        passingPoints: 10,
        steps: [
          { id: 'simple_machines_1', points: 5, description: 'Kräfte und Wege am Flaschenzug berechnet und gerichtet dargestellt' },
          { id: 'simple_machines_2', points: 5, description: 'Gleiche ideale Arbeit und reale Reibungsverluste über Kraft-Weg-Produkte erklärt' },
          { id: 'simple_machines_3', points: 6, description: 'Hebel quantitativ ausgewertet und gemeinsame Kraftwandler-Idee einfacher Maschinen erläutert' },
        ],
      },
    },
    {
      shortKey: 'canonical_physics_sek1_assessment_force_line_center_of_gravity',
      id: '449d9732-a869-5126-8879-564da5c3d263',
      title: 'Prüfungsaufgabe: Wirkungslinien und Schwerpunkt an einer Planke deuten',
      titleEn: 'Assessment Task: Interpret Lines of Action and Center of Gravity on a Plank',
      description:
        'Die lernende Person kann Angriffspunkte und Wirkungslinien an einem starren Körper kennzeichnen, die Gewichtskraft im Schwerpunkt modellieren und Gleichgewicht sowie Drehrichtung aus den Drehwirkungen ableiten.',
      descriptionEn:
        'The learner can mark points of application and lines of action on a rigid body, model weight as acting at its center of gravity, and infer equilibrium and rotational direction from the moments.',
      coveredGoalIds: ['67ffd0f0-a5ab-518f-8c45-4c0e7eb18390'],
      applicability: [...GENERIC_COMPATIBILITY_JURISDICTIONS],
      area: 'Mechanik',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.FORCE_LINE_CENTER_OF_GRAVITY',
      processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
      guidingIdeas: ['LI_BEWEGUNG', 'LI_TECHNIK'],
      coveredStrands: ['LI_BEWEGUNG', 'LI_TECHNIK'],
      taskContent:
        '**Material:** Eine waagerechte, homogene 3,00-m-Planke wird von links ausgemessen. Ihre Gewichtskraft beträgt 180 N und greift modellhaft bei x = 1,50 m an. Eine Kiste übt bei x = 0,50 m eine zusätzliche Kraft von 120 N senkrecht nach unten aus. Eine schmale Stütze steht zunächst bei x = 1,20 m. Für die Drehwirkung um die Stütze gilt Betrag M = Kraft · senkrechter Abstand der Wirkungslinie.\n\n1. Zeichnen Sie Planke, Stütze und beide nach unten gerichteten Kräfte. Kennzeichnen und unterscheiden Sie für jede Kraft Angriffspunkt und Wirkungslinie sowie den Schwerpunkt der homogenen Planke. (5 BE)\n2. Begründen Sie, warum die verteilte Gewichtskraft im näherungsweise homogenen Gravitationsfeld als im Schwerpunkt angreifend modelliert werden darf. (4 BE)\n3. Berechnen Sie die beiden Drehwirkungen um die Stütze bei x = 1,20 m und bestimmen Sie die resultierende Drehrichtung. (5 BE)\n4. Bestimmen Sie die Position, an die die einzelne Stütze für Gleichgewicht verschoben werden muss. Erklären Sie das Ergebnis über die Wirkungslinie der resultierenden Gewichtskraft von Planke und Kiste. (6 BE)',
      solutionContent:
        'Der Angriffspunkt der Plankengewichtskraft liegt im Schwerpunkt bei x = 1,50 m; ihre Wirkungslinie verläuft dort vertikal. Die Kistenkraft greift bei x = 0,50 m an und besitzt dort ebenfalls eine vertikale Wirkungslinie. Im näherungsweise homogenen Gravitationsfeld kann die Summe der über die homogene Planke verteilten Gewichtskräfte durch die gleich große Kraft 180 N im Schwerpunkt ersetzt werden. Um die Stütze bei 1,20 m erzeugt die Planke 180 N · 0,30 m = 54 N m im Uhrzeigersinn; die Kiste erzeugt 120 N · 0,70 m = 84 N m gegen den Uhrzeigersinn. Resultierend wirken 30 N m gegen den Uhrzeigersinn. Für Gleichgewicht muss die Stütze unter der Wirkungslinie der gesamten Gewichtskraft stehen: x = (180 N · 1,50 m + 120 N · 0,50 m) / 300 N = 1,10 m. Dann heben sich die Drehwirkungen auf.',
      scoring: {
        maxPoints: 20,
        passingPoints: 12,
        steps: [
          { id: 'force_line_1', points: 5, description: 'Angriffspunkte, Wirkungslinien und Schwerpunkt eindeutig und korrekt dargestellt' },
          { id: 'force_line_2', points: 4, description: 'Schwerpunktmodell der Gewichtskraft fachlich begründet' },
          { id: 'force_line_3', points: 5, description: 'Beide Drehwirkungen berechnet und resultierende Drehrichtung bestimmt' },
          { id: 'force_line_4', points: 6, description: 'Stützposition für Gleichgewicht berechnet und über die resultierende Wirkungslinie erklärt' },
        ],
      },
    },
  ].map(makeRouteAssessmentSpec),
)

for (const spec of assessmentSpecs) {
  spec.routeStabilization = spec.applicabilityOverrides?.jurisdiction?.includes('DE-BY') === true
  // Local assessment visibility is compiled from the exact all-of coverage
  // contract. This keeps a task available in every jurisdiction that exposes
  // all of its assessed goals, without authored state overrides.
  spec.applicabilityFromRequires = true
  delete spec.applicabilityOverrides
  const actual = deterministicPhysicsGoalId(spec.shortKey)
  if (actual !== spec.id) {
    throw new Error(`Deterministic Physics ID mismatch for ${spec.shortKey}: ${actual} !== ${spec.id}`)
  }
  if (JSON.stringify(spec.requires) !== JSON.stringify(spec.coveredGoalIds)) {
    throw new Error(`Assessment ${spec.id} must keep requires and coveredGoalIds exactly aligned`)
  }
  const scoringStepTotal = (spec.scoring?.steps ?? []).reduce(
    (sum: number, step: JsonRecord) => sum + Number(step.points ?? 0),
    0,
  )
  if (scoringStepTotal !== spec.scoring?.maxPoints) {
    throw new Error(`Assessment ${spec.id} scoring steps total ${scoringStepTotal}, expected ${spec.scoring?.maxPoints}`)
  }
}

const routeStabilizationSpecs = assessmentSpecs.filter(
  (spec) => spec.routeStabilization === true,
)
const actualBavariaRouteSinkGoalIds = routeStabilizationSpecs
  .flatMap((spec) => spec.coveredGoalIds as string[])
  .sort()
const expectedSortedBavariaRouteSinkGoalIds = [...expectedBavariaRouteSinkGoalIds].sort()
if (JSON.stringify(actualBavariaRouteSinkGoalIds) !== JSON.stringify(expectedSortedBavariaRouteSinkGoalIds)) {
  throw new Error(
    `BY route terminal coverage drifted: ${actualBavariaRouteSinkGoalIds.join(', ')} !== ${expectedSortedBavariaRouteSinkGoalIds.join(', ')}`,
  )
}

const readJson = (path: string): JsonRecord =>
  JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8')) as JsonRecord

const writeJson = (path: string, value: unknown): void => {
  writeFileSync(resolve(repoRoot, path), `${JSON.stringify(value, null, 2)}\n`)
}

const unique = <T>(values: T[]): T[] => [...new Set(values)]

const buildAssessmentGoal = (spec: JsonRecord, applicability: string[]): JsonRecord => ({
  id: spec.id,
  shortKey: spec.shortKey,
  title: spec.title,
  titleEn: spec.titleEn,
  description: spec.description,
  descriptionEn: spec.descriptionEn,
  weight: 1,
  tags: ['GK', 'LK', 'Practice', 'Assessment', 'canonical', 'SekI'],
  dimensionTags: {
    framework: 'canonical-gymnasium-physics',
    demandLevel: 'AB3',
    processCompetencies: spec.processCompetencies,
    guidingIdeas: spec.guidingIdeas,
    phase: 'GLOBAL',
    area: spec.area,
    topicCode: spec.topicCode,
  },
  requires: spec.requires,
  contains: [],
  examples: [],
  applicability: { jurisdiction: applicability },
  extendedData: {
    applicabilityFromRequires: true,
    applicabilityMappingInheritance: 'boundary',
  },
  type: 'atomic',
  examData: {
    reviewStatus: 'released',
    coveredGoalIds: spec.coveredGoalIds,
    coveredStrands: spec.coveredStrands,
    demandLevels: ['AB1', 'AB2', 'AB3'],
    taskContent: spec.taskContent,
    solutionContent: spec.solutionContent,
    scoring: spec.scoring,
  },
})

function buildCanonical(): JsonRecord {
  const landscape = readJson(paths.canonical)
  const goals = (landscape.goals as JsonRecord[]).filter(
    (goal) => goal.id !== RETIRED_BAVARIA_SYSTEMS_ASSESSMENT_ID,
  )
  landscape.goals = goals
  const byId = new Map(goals.map((goal) => [goal.id, goal]))

  for (const goalId of Object.values(ids)) {
    if (!byId.has(goalId)) throw new Error(`Missing required Physics goal ${goalId}`)
  }

  for (const goalId of [ids.measureMass, ids.regularVolume, ids.displacementVolume]) {
    const goal = byId.get(goalId)!
    goal.requires = unique([...(goal.requires ?? []), ids.motivation])
  }

  // Keep the Bavaria Ph10.1 motor/induction route on its reviewed Sek-I
  // foundations. These are exact all-of prerequisites: retaining one of the
  // former upper-secondary branches would still block the learner frontier.
  byId.get(ids.conductorAndCoilField)!.requires = [ids.magneticFields]
  byId.get(ids.buildMotor)!.requires = [ids.magneticFields, ids.currentEffects]
  byId.get(ids.motionInduction)!.requires = [ids.conductorAndCoilField]
  byId.get(ids.inductionApplications)!.requires = [ids.magneticFluxInduction]

  // Replace upper-secondary detours only where the existing target itself is
  // authoritatively placed in BW/BY Sek I. The replacement prerequisites are
  // the smallest subject-matter foundations that actually support the target;
  // target roles and target content remain unchanged.
  byId.get(ids.totalReflection)!.requires = [ids.refraction]
  byId.get(ids.mechanicalEnergy)!.requires = [
    ids.mechanicalWork,
    ids.qualitativeMechanicalEnergyForms,
  ]
  byId.get(ids.electricWorkVoltagePotential)!.requires = [
    ids.currentAsChargeTransport,
    ids.mechanicalWork,
  ]
  byId.get(ids.electromagneticSpectrum)!.requires = [ids.harmonicWaves]
  byId.get(ids.emissionAndLineSpectra)!.requires = [ids.photonEnergyMomentum]
  byId.get(ids.bandModelAndDoping)!.requires = [ids.conductorInsulatorSemiconductor]
  byId.get(ids.nuclearReactions)!.requires = [ids.nuclearDecayAndRadiation]
  byId.get(ids.nuclearEnergyOptions)!.requires = [
    ids.nuclearReactions,
    ids.radioactiveApplications,
  ]
  byId.get(ids.evaluateEnergySaving)!.requires = [
    ids.efficiency,
    ids.electricEnergyTransformations,
  ]
  byId.get(ids.energyDegradation)!.requires = [
    ids.energyConservation,
    ids.efficiency,
  ]
  byId.get(ids.gravitationLawAndWeight)!.requires = [ids.massAndWeight]
  byId.get(ids.linearRestoringForce)!.requires = [ids.forceAndDeformation]
  byId.get(ids.modelAndIdealizeMotion)!.requires = [
    ids.motionDiagrams,
    ids.uniformlyAcceleratedMotion,
    'e4f3a846-d2b8-4ee5-b0a2-4dc2833b2ecb',
  ]
  byId.get(ids.fallingWithDrag)!.requires = [
    ids.freeFallExperiment,
    ids.mechanicsFundamentalEquation,
  ]

  // The old aggregate capstone does not actually assess its broad coverage
  // list. Retain its stable ID as a compatibility artifact, but exclude it
  // from applicability and learner-facing terminal projections. The narrow
  // assessments below derive their jurisdiction scope from their exact
  // requires/coveredGoalIds contract instead.
  const genericAssessment = byId.get(ids.genericSekIAssessment)!
  delete genericAssessment.applicability
  genericAssessment.extendedData = {
    ...(genericAssessment.extendedData ?? {}),
    applicabilityProjection: 'excluded',
    compatibilityOnly: true,
  }
  delete genericAssessment.extendedData.applicabilityOverrides
  delete genericAssessment.extendedData.applicabilityMappingInheritance

  const practiceCluster = byId.get(ids.practiceCluster)!
  if (!Array.isArray(practiceCluster.contains)) {
    throw new Error(`Practice cluster ${ids.practiceCluster} has no contains array`)
  }
  practiceCluster.contains = practiceCluster.contains.filter(
    (goalId: string) => goalId !== RETIRED_BAVARIA_SYSTEMS_ASSESSMENT_ID
      && goalId !== ids.genericSekIAssessment,
  )

  for (const spec of assessmentSpecs) {
    const existing = byId.get(spec.id)
    const requiredGoalIds = spec.requires as string[]
    if (!Array.isArray(requiredGoalIds) || requiredGoalIds.length === 0) {
      throw new Error(`Assessment ${spec.id} must have non-empty all-of requires`)
    }
    const prerequisiteJurisdictionSets = requiredGoalIds.map((requiredGoalId) => {
      const requiredGoal = byId.get(requiredGoalId)
      const jurisdictions = requiredGoal?.applicability?.jurisdiction
      if (!Array.isArray(jurisdictions) || jurisdictions.length === 0) {
        throw new Error(`Assessment ${spec.id} prerequisite ${requiredGoalId} has no compiled jurisdiction applicability`)
      }
      return new Set(jurisdictions as string[])
    })
    // `applicabilityFromRequires` is an all-of contract. Recompute its broad
    // jurisdiction evidence deterministically from the current prerequisites
    // instead of preserving a potentially stale prior assessment field. The
    // composition-view pass below then applies the stricter stage-local check.
    const applicability = [...prerequisiteJurisdictionSets[0]]
      .filter((jurisdiction) => prerequisiteJurisdictionSets.every((values) => values.has(jurisdiction)))
      .sort()
    if (applicability.length === 0) {
      throw new Error(`Assessment ${spec.id} has no shared prerequisite jurisdiction applicability`)
    }
    const materialized = buildAssessmentGoal(spec, applicability)
    if (existing && existing.shortKey !== spec.shortKey) {
      throw new Error(`Assessment ID collision for ${spec.id}`)
    }
    if (existing) {
      Object.assign(existing, materialized)
    } else {
      const clusterIndex = goals.findIndex((goal) => goal.id === ids.practiceCluster)
      if (clusterIndex < 0) throw new Error(`Missing practice-cluster insertion point ${ids.practiceCluster}`)
      const existingAssessmentIndices = assessmentSpecs
        .map(({ id }) => goals.findIndex((goal) => goal.id === id))
        .filter((index) => index >= 0)
      const insertionIndex = existingAssessmentIndices.length > 0
        ? Math.max(...existingAssessmentIndices) + 1
        : clusterIndex + 1
      goals.splice(insertionIndex, 0, materialized)
      byId.set(spec.id, materialized)
    }
  }

  practiceCluster.contains = unique([
    ...practiceCluster.contains,
    ...assessmentSpecs.map(({ id }) => id),
  ])

  return landscape
}

function buildApplicabilityOverrides(): JsonRecord {
  const registry = readJson(paths.applicabilityOverrides)
  if (registry.version !== 1 || !Array.isArray(registry.landscapes)) {
    throw new Error(`Unsupported canonical applicability-override registry ${paths.applicabilityOverrides}`)
  }

  const landscapeEntries = registry.landscapes as JsonRecord[]
  const landscapeEntry = landscapeEntries.find(
    (entry) => entry.landscapeId === PHYSICS_LANDSCAPE_ID,
  )
  if (landscapeEntry && (
    landscapeEntry.goalApplicabilityOverrides === null
    || typeof landscapeEntry.goalApplicabilityOverrides !== 'object'
    || Array.isArray(landscapeEntry.goalApplicabilityOverrides)
  )) {
    throw new Error(`Invalid Physics applicability overrides in ${paths.applicabilityOverrides}`)
  }
  if (landscapeEntry) {
    delete landscapeEntry.goalApplicabilityOverrides[ids.genericSekIAssessment]
  }
  registry.landscapes = landscapeEntries.filter((entry) =>
    Object.keys(entry.goalApplicabilityOverrides ?? {}).length > 0,
  ).sort((left, right) =>
    String(left.landscapeId).localeCompare(String(right.landscapeId)),
  )
  return registry
}

function buildAcceptedApplicabilityWarnings(): JsonRecord {
  const registry = readJson(paths.acceptedApplicabilityWarnings)
  if (registry.version !== 1 || !Array.isArray(registry.acceptedWarnings)) {
    throw new Error(`Unsupported accepted applicability-warning registry ${paths.acceptedApplicabilityWarnings}`)
  }
  const derivedAssessmentIds = new Set(assessmentSpecs.map(({ id }) => id as string))
  registry.acceptedWarnings = (registry.acceptedWarnings as JsonRecord[]).filter((warning) =>
    !(
      warning.code === 'APV-201'
      && warning.landscapeId === PHYSICS_LANDSCAPE_ID
      && derivedAssessmentIds.has(warning.goalId)
    ),
  )
  return registry
}

function buildSemanticKinds(landscape: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const decisionById = new Map(
    (ledger.decisions as JsonRecord[])
      .filter((decision) => decision.goalId !== RETIRED_BAVARIA_SYSTEMS_ASSESSMENT_ID)
      .map((decision) => [decision.goalId, decision]),
  )
  const changedExistingIds = [
    ids.measureMass,
    ids.regularVolume,
    ids.displacementVolume,
    ids.conductorAndCoilField,
    ids.buildMotor,
    ids.motionInduction,
    ids.inductionApplications,
    ids.totalReflection,
    ids.mechanicalEnergy,
    ids.electricWorkVoltagePotential,
    ids.electromagneticSpectrum,
    ids.emissionAndLineSpectra,
    ids.bandModelAndDoping,
    ids.nuclearReactions,
    ids.nuclearEnergyOptions,
    ids.evaluateEnergySaving,
    ids.energyDegradation,
    ids.gravitationLawAndWeight,
    ids.linearRestoringForce,
    ids.modelAndIdealizeMotion,
    ids.fallingWithDrag,
    ids.genericSekIAssessment,
    ids.practiceCluster,
  ]

  for (const goalId of changedExistingIds) {
    const goal = goalById.get(goalId)
    const decision = decisionById.get(goalId)
    if (!goal || !decision) throw new Error(`Missing semantic-kind binding for changed goal ${goalId}`)
    decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  }

  for (const spec of assessmentSpecs) {
    const goal = goalById.get(spec.id)
    if (!goal) throw new Error(`Missing materialized assessment ${spec.id}`)
    decisionById.set(spec.id, {
      goalId: spec.id,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
      semanticKind: 'practiceAssessment',
      decisionStatus: 'authoritative',
      decisionBasis: 'reviewed-current-post-split-practice-assessment',
    })
  }

  ledger.decisions = [...decisionById.values()].sort((left, right) =>
    left.goalId < right.goalId ? -1 : left.goalId > right.goalId ? 1 : 0,
  )
  const counts: Record<string, number> = {}
  for (const decision of ledger.decisions as JsonRecord[]) {
    counts[decision.semanticKind] = (counts[decision.semanticKind] ?? 0) + 1
  }
  const order = [
    'curricularAtomic',
    'curricularArea',
    'practiceAssessment',
    'programStructure',
    'memory',
    'runtimeSupport',
    'orientation',
  ]
  ledger.counts = Object.fromEntries(order.filter((key) => counts[key] !== undefined).map((key) => [key, counts[key]]))
  ledger.counts.total = (ledger.decisions as JsonRecord[]).length
  if (ledger.counts.curricularAtomic !== 439) {
    throw new Error(`Expected 439 curricularAtomic Physics decisions, got ${ledger.counts.curricularAtomic}`)
  }
  if (ledger.counts.practiceAssessment !== 126 || ledger.counts.total !== 660) {
    throw new Error(`Expected 126 practiceAssessment / 660 total decisions, got ${ledger.counts.practiceAssessment} / ${ledger.counts.total}`)
  }
  return ledger
}

const collectCompositionNodes = (
  nodes: JsonRecord[],
  predicate: (node: JsonRecord) => boolean,
  matches: JsonRecord[] = [],
): JsonRecord[] => {
  for (const node of nodes) {
    if (predicate(node)) matches.push(node)
    if (node.kind === 'structure' && Array.isArray(node.children)) {
      collectCompositionNodes(node.children, predicate, matches)
    }
  }
  return matches
}

const normalizeCompositionGoalRef = (reference: unknown): string | null => {
  if (typeof reference === 'string') return reference
  if (
    reference
    && typeof reference === 'object'
    && typeof (reference as JsonRecord).goalId === 'string'
  ) {
    return (reference as JsonRecord).goalId as string
  }
  return null
}

const collectCanonicalSubtreeGoalIds = (
  rootGoalId: string,
  goalById: Map<string, JsonRecord>,
  collectedGoalIds: Set<string>,
): void => {
  if (collectedGoalIds.has(rootGoalId)) return
  collectedGoalIds.add(rootGoalId)
  const goal = goalById.get(rootGoalId)
  if (!goal || !Array.isArray(goal.contains)) return
  goal.contains.forEach((reference: unknown) => {
    const childGoalId = normalizeCompositionGoalRef(reference)
    if (childGoalId) collectCanonicalSubtreeGoalIds(childGoalId, goalById, collectedGoalIds)
  })
}

const collectAuthoritativeCompositionGoalIds = (
  nodes: JsonRecord[],
  goalById: Map<string, JsonRecord>,
  collectedGoalIds = new Set<string>(),
): Set<string> => {
  for (const node of nodes) {
    if (node.kind === 'structure') {
      if (node.id !== PRACTICE_VIEW_STRUCTURE_ID && Array.isArray(node.children)) {
        collectAuthoritativeCompositionGoalIds(node.children, goalById, collectedGoalIds)
      }
      continue
    }
    const goalId = normalizeCompositionGoalRef(node.goalId)
    if (!goalId) continue
    if (node.kind === 'canonicalSubtree') {
      collectCanonicalSubtreeGoalIds(goalId, goalById, collectedGoalIds)
    } else if (node.kind === 'goalEntry') {
      collectedGoalIds.add(goalId)
    }
  }
  return collectedGoalIds
}

function buildCompositionViews(landscape: JsonRecord): Array<{ path: string; view: JsonRecord }> {
  const directory = resolve(repoRoot, paths.compositionViews)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const terminalAssessmentIds = [
    ids.bavariaSekIAssessment,
    ...assessmentSpecs.map(({ id }) => id as string),
  ]
  for (const goalId of terminalAssessmentIds) {
    if (!goalById.has(goalId)) throw new Error(`Missing Sek-I terminal assessment ${goalId}`)
  }
  const viewPaths = readdirSync(directory)
    .filter((fileName) => fileName.endsWith('.view.json'))
    .sort()
    .map((fileName) => `${paths.compositionViews}/${fileName}`)
  const relevantViews: Array<{ path: string; view: JsonRecord }> = []
  const placementCounts = new Map(terminalAssessmentIds.map((goalId) => [goalId, 0]))
  let routePrerequisiteStructures = 0
  let routePrerequisitePlacements = 0
  let sekIIOnlyViews = 0

  for (const path of viewPaths) {
    const view = readJson(path)
    if (view.landscapeId !== PHYSICS_LANDSCAPE_ID) continue
    const stage = view.scope?.stage
    const practiceReferences = collectCompositionNodes(
      view.rootNodes ?? [],
      (node) => node.kind === 'canonicalSubtree' && node.goalId === ids.practiceCluster,
    )

    if (stage === 'SekII') {
      sekIIOnlyViews += 1
      if (practiceReferences.length > 0) {
        throw new Error(`Sek-II-only view must not expose Sek-I practice: ${path}`)
      }
      continue
    }
    if (stage !== 'SekI' && stage !== 'CrossStage') continue
    if (practiceReferences.length > 0) {
      throw new Error(`Sek-I practice must be projected as scope-exact atomic goalEntries, not a broad subtree: ${path}`)
    }

    const jurisdiction = typeof view.scope?.jurisdiction === 'string'
      ? view.scope.jurisdiction
      : null
    const sekIAnchorId = jurisdiction === 'DE-BW' ? 'physics-bw-seki' : 'physics-seki'
    const sekIStructures = collectCompositionNodes(
      view.rootNodes ?? [],
      (node) => node.kind === 'structure' && node.id === sekIAnchorId,
    )
    if (sekIStructures.length !== 1) {
      throw new Error(`Expected exactly one ${sekIAnchorId} anchor in ${path}; got ${sekIStructures.length}`)
    }
    const sekIStructure = sekIStructures[0]
    if (!Array.isArray(sekIStructure.children)) {
      throw new Error(`Sek-I anchor has no children array in ${path}`)
    }
    const expectedRoutePrerequisiteIds = jurisdiction
      ? [...(routePrerequisiteGoalIdsByJurisdiction[jurisdiction] ?? [])]
      : [...nationalRoutePrerequisiteGoalIds]
    expectedRoutePrerequisiteIds.forEach((goalId) => {
      if (!goalById.has(goalId)) {
        throw new Error(`Missing route prerequisite ${goalId} for ${path}`)
      }
    })
    const routePrerequisiteReferences = collectCompositionNodes(
      view.rootNodes ?? [],
      (node) => node.kind === 'structure' && node.id === ROUTE_PREREQUISITE_VIEW_STRUCTURE_ID,
    )
    if (routePrerequisiteReferences.length > 1) {
      throw new Error(`Duplicate ${ROUTE_PREREQUISITE_VIEW_STRUCTURE_ID} structures in ${path}`)
    }
    const expectedRoutePrerequisiteStructure = {
      kind: 'structure',
      id: ROUTE_PREREQUISITE_VIEW_STRUCTURE_ID,
      label: 'Eingebundene Voraussetzungen für vollständige Lernrouten',
      children: expectedRoutePrerequisiteIds.map((goalId) => ({
        kind: 'goalEntry',
        goalId,
        projectionRole: 'prerequisiteOnly',
      })),
    }
    if (routePrerequisiteReferences.length === 1) {
      const routePrerequisiteStructure = routePrerequisiteReferences[0]
      if (!sekIStructure.children.includes(routePrerequisiteStructure)) {
        throw new Error(`${ROUTE_PREREQUISITE_VIEW_STRUCTURE_ID} is outside ${sekIAnchorId} in ${path}`)
      }
      if (expectedRoutePrerequisiteIds.length > 0) {
        Object.assign(routePrerequisiteStructure, expectedRoutePrerequisiteStructure)
      } else {
        sekIStructure.children = sekIStructure.children.filter(
          (child: JsonRecord) => child !== routePrerequisiteStructure,
        )
      }
    } else if (expectedRoutePrerequisiteIds.length > 0) {
      sekIStructure.children.push(expectedRoutePrerequisiteStructure)
    }
    if (expectedRoutePrerequisiteIds.length > 0) {
      routePrerequisiteStructures += 1
      routePrerequisitePlacements += expectedRoutePrerequisiteIds.length
    }

    const physicsRootStructures = collectCompositionNodes(
      view.rootNodes ?? [],
      (node) => node.kind === 'structure' && node.id === 'physics-root',
    )
    if (physicsRootStructures.length !== 1 || !Array.isArray(physicsRootStructures[0].children)) {
      throw new Error(`Expected exactly one Physics root with children in ${path}`)
    }
    const rootLevelPrerequisiteNodes = physicsRootStructures[0].children.filter(
      (node: JsonRecord) => node.projectionRole === 'prerequisiteOnly',
    )
    const authoritativeSekIGoalIds = collectAuthoritativeCompositionGoalIds(
      [sekIStructure, ...rootLevelPrerequisiteNodes],
      goalById,
    )
    const expectedTerminalIds = terminalAssessmentIds.filter((goalId) => {
      const goal = goalById.get(goalId)!
      const jurisdictions = goal.applicability?.jurisdiction
      if (jurisdiction && Array.isArray(jurisdictions) && !jurisdictions.includes(jurisdiction)) {
        return false
      }
      const requiredGoalIds = Array.isArray(goal.requires)
        ? goal.requires.map(normalizeCompositionGoalRef)
        : []
      if (requiredGoalIds.some((requiredGoalId) => !requiredGoalId)) {
        throw new Error(`Terminal assessment ${goalId} has an invalid requires reference`)
      }
      return requiredGoalIds.every((requiredGoalId) => authoritativeSekIGoalIds.has(requiredGoalId!))
    })
    if (expectedTerminalIds.length === 0) {
      throw new Error(`No prerequisite-complete Sek-I terminal assessment for ${path}`)
    }
    expectedTerminalIds.forEach((goalId) => {
      placementCounts.set(goalId, (placementCounts.get(goalId) ?? 0) + 1)
    })

    const practiceStructures = collectCompositionNodes(
      view.rootNodes ?? [],
      (node) => node.kind === 'structure' && node.id === PRACTICE_VIEW_STRUCTURE_ID,
    )
    if (practiceStructures.length > 1) {
      throw new Error(`Duplicate ${PRACTICE_VIEW_STRUCTURE_ID} structures in ${path}`)
    }
    const expectedPracticeStructure = {
      kind: 'structure',
      id: PRACTICE_VIEW_STRUCTURE_ID,
      label: 'Übungen Sekundarstufe I Physik',
      children: expectedTerminalIds.map((goalId) => ({ kind: 'goalEntry', goalId })),
    }
    if (practiceStructures.length === 1) {
      const practiceStructure = practiceStructures[0]
      if (!sekIStructure.children.includes(practiceStructure)) {
        throw new Error(`${PRACTICE_VIEW_STRUCTURE_ID} is outside ${sekIAnchorId} in ${path}`)
      }
      Object.assign(practiceStructure, expectedPracticeStructure)
    } else {
      sekIStructure.children.push(expectedPracticeStructure)
    }
    relevantViews.push({ path, view })
  }

  if (relevantViews.length !== 35) {
    throw new Error(`Expected 35 Sek-I/CrossStage Physics views, got ${relevantViews.length}`)
  }
  if (sekIIOnlyViews !== 34) {
    throw new Error(`Expected 34 Sek-II-only Physics views, got ${sekIIOnlyViews}`)
  }
  const unplacedAssessmentIds = terminalAssessmentIds.filter(
    (goalId) => (placementCounts.get(goalId) ?? 0) === 0,
  )
  if (unplacedAssessmentIds.length > 0) {
    throw new Error(`Sek-I terminal assessments have no prerequisite-complete view placement: ${unplacedAssessmentIds.join(', ')}`)
  }
  const totalPlacements = [...placementCounts.values()].reduce((sum, count) => sum + count, 0)
  if (routePrerequisiteStructures !== 13 || routePrerequisitePlacements !== 187) {
    throw new Error(
      `Expected 13 route-prerequisite structures / 187 placements, got ${routePrerequisiteStructures} / ${routePrerequisitePlacements}`,
    )
  }
  return { relevantViews, totalPlacements }
}

const canonical = buildCanonical()
const applicabilityOverrides = buildApplicabilityOverrides()
const acceptedApplicabilityWarnings = buildAcceptedApplicabilityWarnings()
const semanticKinds = buildSemanticKinds(canonical)
const { relevantViews: compositionViews, totalPlacements } = buildCompositionViews(canonical)

if (writeMode) {
  writeJson(paths.canonical, canonical)
  writeJson(paths.applicabilityOverrides, applicabilityOverrides)
  writeJson(paths.acceptedApplicabilityWarnings, acceptedApplicabilityWarnings)
  writeJson(paths.semanticKinds, semanticKinds)
  for (const { path, view } of compositionViews) writeJson(path, view)
}

console.log(
  `CHECK apply_physics_seki_route_stabilization ${writeMode ? 'WRITE' : 'PASS'} motivationEdges=3 assessments=51 compositionViews=${compositionViews.length} terminalPlacements=${totalPlacements} routePrerequisiteStructures=13 routePrerequisitePlacements=187 curricularAtomic=439 practiceAssessment=126`,
)
