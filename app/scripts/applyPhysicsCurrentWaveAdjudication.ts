import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
  pressureTemperatureVisualizationPrompt:
    'curricula/DE/Gymnasium/visualizations/physik/310b4f62-e261-46be-bb1b-1f125fc1699a/prompt.de.md',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  compositionViews: [
    'curricula/DE/Gymnasium/composition-views/physik/de-bw-gk.view.json',
    'curricula/DE/Gymnasium/composition-views/physik/de-bw-lk.view.json',
    'curricula/DE/Gymnasium/composition-views/physik/de-by-gk.view.json',
    'curricula/DE/Gymnasium/composition-views/physik/de-by-lk.view.json',
  ],
} as const

const ids = {
  motivation: '5c44b9ba-9b05-4774-95d5-073230d3fc4f',
  volumeParent: '7c996528-5fae-5353-b8fb-d59382e225c6',
  regularVolume: 'f827b00f-af7f-52de-84aa-2a2bbaa035bd',
  displacementVolume: 'f92b5b8a-327f-50d2-8313-6a142399ebf0',
  reflectionParent: 'cca06d84-28fe-4b80-9bcd-968dda026e0e',
  reflectionLaw: '3c8e5510-a12d-5770-8a01-e5fe741b259c',
  planeMirrorImage: 'b57427c9-1af5-5daa-8c65-b84a4cc20785',
  celestialParent: '1fede37b-6554-5dd3-93d9-08ed1fd09c91',
  lunarPhases: '33e3417c-e062-5f4a-8df9-3195dca50089',
  eclipses: 'f0046ae8-cbfc-526b-8414-04e3595b6075',
  scatteringAbsorption: '9a9e2085-5ab6-534f-b622-83774d51f36b',
  motionGraph: 'ae67bcf1-f3ee-50d6-9a12-25a159dff659',
  forcePointLineCenterOfGravity: '67ffd0f0-a5ab-518f-8c45-4c0e7eb18390',
  friction: '581c0766-b84b-54cb-b8b6-375310329a41',
  mechanicalEnergyForms: '722857cf-f327-5740-8151-64eb92195ec8',
  energySupplyChains: '30a936ec-e427-57fe-bf3e-4abd64b1f0c1',
  energySupplyEvaluation: '5be98160-5189-58aa-8183-1df1c400cc8c',
  measureMass: 'af0e2efb-f634-5f2d-abea-b2e1a67a2894',
  massWeight: '9c328f68-41ed-55dd-9e02-34414a6246f2',
  heatCluster: '2d3d42ae-492b-4795-a22f-eeca03aaed38',
  temperatureExpansionParent: 'd27c8860-12a4-4d7d-9849-ccd8b7caca48',
  thermometer: '51de4fd9-6827-5b3d-b2ca-5e27ba961a7f',
  thermalExpansion: 'b60f63b6-e70b-5557-9f54-86d42fa80325',
  particleModelTemperature: '9ac4973a-21d5-48a5-90b4-eb90e10391ae',
  heatTransfer: 'fbe0faae-7fba-482b-888e-341f926770f3',
  pressureTemperature: '310b4f62-e261-46be-bb1b-1f125fc1699a',
  density: 'c2d6bdf1-8077-50fb-a8b5-2f0b7e3493f0',
  buoyancy: 'e11b2ee9-e528-4857-9ecd-59bd460fba81',
  rayModel: '79cb1695-f985-443a-b93e-27b57ab474b7',
  shadowPropagation: 'dd7cdcea-0950-461b-96ac-ce49989fca47',
  sekICapstone: '3631c8f7-ff48-57ff-b7ee-8397ff1d166a',
  subjectRoot: 'bf980fff-b62b-4ea4-a20d-31681a7ad785',
} as const

const thermalViewPolicies = [
  { jurisdiction: 'bb', includeThermometer: false, includeExpansion: false },
  { jurisdiction: 'be', includeThermometer: false, includeExpansion: false },
  { jurisdiction: 'hb', includeThermometer: false, includeExpansion: false },
  { jurisdiction: 'hh', includeThermometer: false, includeExpansion: false },
  { jurisdiction: 'mv', includeThermometer: false, includeExpansion: true },
  { jurisdiction: 'ni', includeThermometer: false, includeExpansion: false },
  { jurisdiction: 'nw', includeThermometer: false, includeExpansion: false },
  { jurisdiction: 'rp', includeThermometer: false, includeExpansion: false },
  { jurisdiction: 'sh', includeThermometer: false, includeExpansion: false },
  { jurisdiction: 'th', includeThermometer: false, includeExpansion: true },
].flatMap(({ jurisdiction, includeThermometer, includeExpansion }) =>
  ['gk', 'lk'].map((courseProfile) => ({
    path: `curricula/DE/Gymnasium/composition-views/physik/de-${jurisdiction}-${courseProfile}.view.json`,
    includeThermometer,
    includeExpansion,
  })),
)

const splitParentIds = [ids.volumeParent, ids.reflectionParent, ids.celestialParent]

const deterministicPhysicsGoalId = (shortKey: string): string => {
  const digest = createHash('sha1')
    .update(`DE-GYM-CANONICAL-PHYSICS:${shortKey}`)
    .digest('hex')
  return `${digest.slice(0, 8)}-${digest.slice(8, 12)}-5${digest.slice(13, 16)}-8${digest.slice(17, 20)}-${digest.slice(20, 32)}`
}

const childSpecs: Array<JsonRecord & { parentId: string }> = [
  {
    parentId: ids.volumeParent,
    id: ids.regularVolume,
    shortKey: 'canonical_physics_determine_regular_body_volume_geometrically',
    title: 'Volumen regelmäßiger Körper geometrisch bestimmen',
    titleEn: 'Determine the volume of regular objects geometrically',
    description:
      'Die lernende Person kann die benötigten Abmessungen eines einfachen regelmäßigen Körpers messen, daraus sein Volumen mit einer passenden geometrischen Beziehung bestimmen und Ergebnis sowie Volumeneinheit auf Plausibilität prüfen.',
    descriptionEn:
      'The learner can measure the dimensions needed for a simple regular object, use an appropriate geometric relationship to determine its volume, and check the plausibility of the result and volume unit.',
    requires: [ids.motivation],
    topicCode: 'CANONICAL.PHYSICS.SEK1.MECHANICS.VOLUME.GEOMETRIC',
    atomicityReason:
      'Abmessungen messen, eine passende geometrische Volumenbeziehung verwenden und Ergebnis sowie Einheit plausibilisieren sind zusammengehörige Schritte derselben Volumenbestimmung an einem regelmäßigen Körper.',
    memoryReason:
      'Die Kompetenz verlangt Messplanung, Geometriewahl und Plausibilitätsprüfung an konkreten Körpern; ein isoliertes Memory-Deck bildet diese Handlung nicht angemessen ab.',
  },
  {
    parentId: ids.volumeParent,
    id: ids.displacementVolume,
    shortKey: 'canonical_physics_determine_irregular_body_volume_by_displacement',
    title: 'Volumen unregelmäßiger Körper durch Flüssigkeitsverdrängung bestimmen',
    titleEn: 'Determine the volume of irregular objects by liquid displacement',
    description:
      'Die lernende Person kann das Volumen eines vollständig eintauchbaren unregelmäßigen festen Körpers aus dem Flüssigkeitsstand vor und nach dem Eintauchen bestimmen, die Differenz mit passender Volumeneinheit angeben und Ablese- oder Luftblasenfehler beurteilen.',
    descriptionEn:
      'The learner can determine the volume of a fully submersible irregular solid object from the liquid levels before and after immersion, state the difference with an appropriate volume unit, and assess reading errors or errors caused by air bubbles.',
    requires: [ids.motivation],
    topicCode: 'CANONICAL.PHYSICS.SEK1.MECHANICS.VOLUME.DISPLACEMENT',
    atomicityReason:
      'Aus Anfangs- und Endstand die verdrängte Flüssigkeitsmenge bestimmen und typische Ablese- oder Luftblasenfehler beurteilen bildet eine einzelne experimentelle Volumenbestimmungs-Kompetenz.',
    memoryReason:
      'Flüssigkeitsverdrängung muss praktisch abgelesen, differenziert und auf Fehler geprüft werden; dafür ist verständnisorientierte Messpraxis geeigneter als eine Memorycard.',
  },
  {
    parentId: ids.reflectionParent,
    id: ids.reflectionLaw,
    shortKey: 'canonical_physics_test_law_of_reflection_experimentally',
    title: 'Reflexionsgesetz experimentell prüfen',
    titleEn: 'Test the law of reflection experimentally',
    description:
      'Die lernende Person kann bei der Reflexion an einer ebenen glatten Fläche Einfalls- und Reflexionswinkel jeweils zum Lot messen, die Messwerte samt Ablese- und Ausrichtungsunsicherheiten vergleichen, daraus das Reflexionsgesetz formulieren und beurteilen, ob Abweichungen mit diesen Unsicherheiten vereinbar sind.',
    descriptionEn:
      'The learner can measure the angles of incidence and reflection relative to the normal at a flat, smooth surface, compare the measurements including reading and alignment uncertainties, formulate the law of reflection from them, and judge whether deviations are consistent with those uncertainties.',
    requires: [ids.rayModel],
    topicCode: 'CANONICAL.PHYSICS.SEK1.OPTICS.REFLECTION.LAW_EXPERIMENT',
    atomicityReason:
      'Winkel zum Lot messen, konkrete Ablese- und Ausrichtungsunsicherheiten berücksichtigen und damit das Reflexionsgesetz einschließlich der Vereinbarkeit von Messabweichungen prüfen sind Bestandteile einer einzigen experimentellen Prüfkompetenz.',
    memoryReason:
      'Das Reflexionsgesetz soll aus Messungen gewonnen und anhand konkreter Unsicherheitsquellen geprüft werden; bloßes Erinnern der Winkelgleichheit ersetzt diese experimentelle Kompetenz nicht.',
  },
  {
    parentId: ids.reflectionParent,
    id: ids.planeMirrorImage,
    shortKey: 'canonical_physics_model_plane_mirror_image_with_rays',
    title: 'Spiegelbilder am ebenen Spiegel mit dem Strahlenmodell erklären',
    titleEn: 'Explain plane-mirror images using the ray model',
    description:
      'Die lernende Person kann reflektierte Lichtwege rückwärts verlängern, damit Lage und Größe des virtuellen Bildes am ebenen Spiegel konstruieren und erklären, warum das Bild hinter dem Spiegel erscheint und nicht auf einem Schirm aufgefangen werden kann.',
    descriptionEn:
      'The learner can extend reflected light paths backwards, use them to construct the position and size of the virtual image in a plane mirror, and explain why the image appears behind the mirror and cannot be projected onto a screen.',
    requires: [ids.reflectionLaw],
    topicCode: 'CANONICAL.PHYSICS.SEK1.OPTICS.REFLECTION.PLANE_MIRROR_IMAGE',
    atomicityReason:
      'Konstruktion und Erklärung des virtuellen Bildes beruhen auf derselben rückwärtigen Verlängerung reflektierter Strahlen und bilden eine zusammenhängende Modellkompetenz.',
    memoryReason:
      'Die Bildlage und Virtualität müssen mit Lichtwegen konstruiert und erklärt werden; eine feste Merkkarte würde die erforderliche Modellanwendung nicht ersetzen.',
  },
  {
    parentId: ids.celestialParent,
    id: ids.lunarPhases,
    shortKey: 'canonical_physics_explain_lunar_phases',
    title: 'Mondphasen mit Beleuchtung und Blickrichtung erklären',
    titleEn: 'Explain lunar phases using illumination and viewing direction',
    description:
      'Die lernende Person kann aus den relativen Positionen von Sonne, Erde und Mond ableiten, welcher Anteil der beleuchteten Mondhälfte von der Erde aus sichtbar ist, damit die Mondphasen erklären und begründen, warum sie nicht durch den Erdschatten entstehen.',
    descriptionEn:
      "The learner can infer from the relative positions of the Sun, Earth, and Moon what fraction of the Moon's illuminated half is visible from Earth, use this to explain the lunar phases, and justify why they are not caused by Earth's shadow.",
    requires: [ids.rayModel],
    topicCode: 'CANONICAL.PHYSICS.SEK1.OPTICS.CELESTIAL_SHADOWS.LUNAR_PHASES',
    atomicityReason:
      'Sichtbaren Anteil der beleuchteten Mondhälfte aus der Geometrie ableiten und damit Phasen sowie die Abgrenzung zum Erdschatten erklären ist eine einzelne räumliche Modellkompetenz.',
    memoryReason:
      'Mondphasen sollen aus wechselnden Positionen, Beleuchtung und Blickrichtung rekonstruiert werden; auswendig gelernte Phasenfolgen genügen für dieses Ziel nicht.',
  },
  {
    parentId: ids.celestialParent,
    id: ids.eclipses,
    shortKey: 'canonical_physics_explain_solar_lunar_eclipses',
    title: 'Sonnen- und Mondfinsternisse mit Schattenräumen erklären',
    titleEn: 'Explain solar and lunar eclipses using shadow regions',
    description:
      'Die lernende Person kann für Sonnen- und Mondfinsternisse die jeweilige Anordnung von Sonne, Erde und Mond darstellen, Kern- und Halbschatten zuordnen und daraus erklären, welches Himmelsobjekt für Beobachtende ganz oder teilweise verdunkelt erscheint.',
    descriptionEn:
      'The learner can represent the respective arrangement of the Sun, Earth, and Moon for solar and lunar eclipses, identify the umbra and penumbra, and use these to explain which celestial object appears fully or partially darkened to observers.',
    requires: [ids.rayModel],
    topicCode: 'CANONICAL.PHYSICS.SEK1.OPTICS.CELESTIAL_SHADOWS.ECLIPSES',
    atomicityReason:
      'Die beiden Finsternisarten werden durch dieselbe Kompetenz geprüft: Anordnung und Schattenräume darstellen und daraus die beobachtete Verdunkelung ableiten.',
    memoryReason:
      'Finsternisse müssen aus Anordnung, Kern- und Halbschatten erklärt werden; räumliche Modellaufgaben sind dafür lernwirksamer als eine isolierte Merkkarte.',
  },
]

for (const spec of childSpecs) {
  const actual = deterministicPhysicsGoalId(spec.shortKey)
  if (actual !== spec.id) {
    throw new Error(`Deterministic Physics ID mismatch for ${spec.shortKey}: ${actual} !== ${spec.id}`)
  }
}

const revisionSpecs: Array<JsonRecord> = [
  {
    id: ids.scatteringAbsorption,
    title: 'Streuung und Absorption von Licht an Beobachtungen unterscheiden',
    titleEn: 'Distinguish scattering and absorption of light from observations',
    description:
      'Die lernende Person kann an einfachen Alltags- und Experimentbeispielen aus beobachteten Änderungen der Lichtverteilung und Helligkeit begründet schließen, ob Licht überwiegend in verschiedene Richtungen gestreut oder vom Material absorbiert wird, und erläutern, welche Beobachtung die Zuordnung stützt.',
    descriptionEn:
      'The learner can use observed changes in light distribution and brightness in simple everyday and experimental examples to infer with reasons whether light is predominantly scattered in different directions or absorbed by the material, and explain which observation supports the classification.',
    requires: [ids.shadowPropagation],
    atomicityReason:
      'Aus Änderungen von Lichtverteilung und Helligkeit begründet auf überwiegende Streuung oder Absorption zu schließen und die tragende Beobachtung zu benennen ist eine einzelne beobachtungsbasierte Inferenzkompetenz.',
    memoryReason:
      'Die Unterscheidung entsteht durch den Vergleich variierender Lichtverteilungen und Helligkeiten sowie eine begründete Inferenz; ein eigenes Memory-Deck ist dafür nicht erforderlich.',
  },
  {
    id: ids.motionGraph,
    description:
      'Die lernende Person kann in Weg-Zeit-Diagrammen Ruhe, gleichförmige Bewegung und qualitative Geschwindigkeitsänderungen anhand des Verlaufs und seiner Steigung unterscheiden und passende Bewegungen beschreiben.',
    descriptionEn:
      "The learner can distinguish rest, uniform motion, and qualitative changes in speed in distance-time diagrams from the graph's shape and slope and describe the corresponding motions.",
    atomicityReason:
      'Ruhe, gleichförmige Bewegung und Geschwindigkeitsänderungen sind Fälle derselben Kompetenz, Bewegungszustände aus Verlauf und Steigung eines Weg-Zeit-Diagramms abzuleiten.',
    memoryReason:
      'Diagrammverläufe müssen flexibel über ihre Steigung gedeutet werden; Verständnis und Aufgabenpraxis sind dafür geeigneter als eine Memorycard.',
  },
  {
    id: ids.forcePointLineCenterOfGravity,
    description:
      'Die lernende Person kann an starren Körpern Angriffspunkt und Wirkungslinie einer Kraft kennzeichnen, in einem näherungsweise homogenen Gravitationsfeld die Gewichtskraft als am Schwerpunkt angreifend modellieren und daraus qualitative Folgen für Gleichgewicht oder Drehwirkung ableiten.',
    descriptionEn:
      "For rigid bodies, the learner can identify a force's point of application and line of action, model weight as acting at the center of gravity in an approximately uniform gravitational field, and infer qualitative consequences for equilibrium or rotational effect.",
    atomicityReason:
      'Angriffspunkt und Wirkungslinie zu kennzeichnen, die Gewichtskraft unter der benannten Modellbedingung am Schwerpunkt anzusetzen und daraus Gleichgewicht oder Drehwirkung abzuleiten sind Teile einer einzigen Starrkörper-Modellkompetenz.',
    memoryReason:
      'Angriffspunkt, Wirkungslinie, Schwerpunkt und Drehwirkung müssen in veränderten Körper-, Auflage- und Kraftrichtungs-Situationen modelliert werden; eine isolierte Merkkarte genügt dafür nicht.',
  },
  {
    id: ids.friction,
    title: 'Reibung als Kontaktkraft deuten',
    titleEn: 'Interpret friction as a contact force',
    description:
      'Die lernende Person kann Reibung als Kontaktkraft deuten, die einer relativen oder drohenden Bewegung zwischen Kontaktflächen entgegenwirkt, und erklären, wie sie etwa beim Gehen die Fortbewegung ermöglicht oder eine Relativbewegung abbremst.',
    descriptionEn:
      'The learner can interpret friction as a contact force that opposes relative or impending motion between contact surfaces and explain how it enables locomotion, for example when walking, or slows relative motion.',
    atomicityReason:
      'Richtung und Wirkung von Reibung aus dem Kontakt und der relativen oder drohenden Bewegung zu deuten ist eine einzelne qualitative Kraftkompetenz.',
    memoryReason:
      'Die Reibungsrichtung und ihre fortbewegungsermöglichende oder relativbewegungsbremsende Wirkung müssen situationsbezogen erklärt werden; eine feste Merkkarte genügt dafür nicht.',
  },
  {
    id: ids.mechanicalEnergyForms,
    description:
      'Die lernende Person kann mechanische Energieformen wie Bewegungs-, Lage- und Spannenergie anhand des Zustands eines Systems unterscheiden und bei einfachen Vorgängen qualitativ beschreiben, welche Energieform ab- und welche zunimmt.',
    descriptionEn:
      'The learner can distinguish mechanical forms of energy such as kinetic, gravitational potential, and elastic energy from the state of a system and qualitatively describe which form decreases and which increases in simple processes.',
    atomicityReason:
      'Energieformen aus dem Systemzustand erkennen und ihre qualitative Zu- oder Abnahme in einem Vorgang verfolgen sind zusammengehörige Teile einer mechanischen Energieform-Kompetenz.',
    memoryReason:
      'Die Energieform muss aus unterschiedlichen Systemzuständen erschlossen und in Vorgängen verfolgt werden; ein separates Memory-Deck ist nicht notwendig.',
  },
  {
    id: ids.energySupplyChains,
    description:
      'Die lernende Person kann Energieversorgungssysteme wie Wasser-, Wind-, Kohle- oder Solarkraftwerke als Ketten von Energieformen, Energieträgern und Übertragungs- beziehungsweise Umwandlungsschritten bis zur Nutzung einschließlich Energieabgaben an die Umgebung qualitativ beschreiben.',
    descriptionEn:
      'The learner can qualitatively describe energy-supply systems such as hydro, wind, coal, or solar power plants as chains of energy forms, energy carriers, and transfer or transformation steps through to use, including energy released to the surroundings.',
    atomicityReason:
      'Eine vollständige Energieversorgungskette mit Formen, Trägern, Übertragungen, Umwandlungen, Nutzung und Umgebungsabgaben zu modellieren ist eine zusammenhängende Systembeschreibung.',
    memoryReason:
      'Energieversorgungsketten müssen für verschiedene technische Systeme konstruiert und begründet werden; ein Memory-Deck würde diese Modellierungsleistung nicht abbilden.',
  },
  {
    id: ids.energySupplyEvaluation,
    description:
      'Die lernende Person kann verschiedene Arten der Energieversorgung anhand fachlich belastbarer Daten und offengelegter Kriterien unter physikalischen, ökologischen, ökonomischen und gesellschaftlichen Aspekten vergleichen, Klimawirkungen fachlich begründet einordnen und daraus ein abgewogenes Urteil formulieren.',
    descriptionEn:
      'The learner can compare forms of energy supply using scientifically reliable data and explicit criteria from physical, ecological, economic, and social perspectives, classify climate impacts with scientific reasoning, and formulate a balanced judgment from this comparison.',
    atomicityReason:
      'Daten- und kriteriengestützter Vergleich, fachliche Einordnung der Klimawirkungen und das daraus abgeleitete abgewogene Urteil bilden eine zusammenhängende physikalische Bewertungskompetenz.',
    memoryReason:
      'Die Kompetenz verlangt die Auswertung fachlich belastbarer Daten, eine offengelegte Kriteriengewichtung und ein fallbezogenes Urteil; eine isolierte Memorycard bildet diese Bewertungsleistung nicht angemessen ab.',
  },
  {
    id: ids.measureMass,
    description:
      'Die lernende Person kann für Messbereich und benötigte Auflösung eine geeignete Waage auswählen, ihren Nullpunkt kontrollieren, die Masse eines Körpers messen und mit Einheit und angemessener Genauigkeit angeben sowie Massen vergleichen, ohne Form oder Volumen eines Körpers mit seiner Masse gleichzusetzen.',
    descriptionEn:
      "The learner can select a balance suited to the measurement range and required resolution, check its zero point, measure an object's mass and report it with a unit and appropriate precision, and compare masses without equating an object's shape or volume with its mass.",
    requires: [ids.motivation],
    atomicityReason:
      'Waage auswählen, Nullpunkt kontrollieren, Messwert angemessen angeben und Massen ohne Gleichsetzung mit Form oder Volumen vergleichen sind aufeinander bezogene Schritte einer einzigen sachgerechten Massenmessung.',
    memoryReason:
      'Die Kompetenz entsteht durch Auswahl und Bedienung realer Waagen sowie begründete Messwertangaben; eine zusätzliche feste Wissenskarte ist nicht erforderlich.',
  },
  {
    id: ids.massWeight,
    description:
      'Die lernende Person kann Masse als ortsunabhängige Eigenschaft eines Körpers von der Gewichtskraft als vom Gravitationsfeld abhängiger Kraft unterscheiden, beide mit passenden Einheiten angeben und alltagssprachliche Verwechslungen fachlich korrigieren.',
    descriptionEn:
      'The learner can distinguish mass as a location-independent property of an object from weight as a force that depends on the gravitational field, state both in appropriate units, and correct everyday-language confusions using scientific terminology.',
    atomicityReason:
      'Masse und Gewichtskraft über Ortsabhängigkeit, Feldbezug und Einheit fachlich zu unterscheiden und sprachlich korrekt zuzuordnen ist eine einzelne Begriffsklärungs-Kompetenz.',
    memoryReason:
      'Die Unterscheidung muss in variierenden Orts- und Sprachkontexten erklärt und angewendet werden; eine isolierte Karte ist dafür nicht notwendig.',
  },
  {
    id: ids.thermometer,
    description:
      'Die lernende Person kann für einen gegebenen Messbereich und die benötigte Auflösung ein geeignetes Thermometer auswählen, es in guten thermischen Kontakt mit dem Messobjekt bringen und einen stabilen Temperaturwert mit Einheit fachgerecht ablesen.',
    descriptionEn:
      'The learner can select a thermometer suitable for a given measurement range and required resolution, place it in good thermal contact with the object, and correctly read a stable temperature value with its unit.',
    atomicityReason:
      'Thermometer auswählen, thermischen Kontakt herstellen und nach Stabilisierung ablesen sind zusammengehörige Schritte einer einzigen Temperaturmesskompetenz.',
    memoryReason:
      'Thermometerauswahl, Kontakt und stabiles Ablesen sind beobachtbare Messhandlungen, die mit verschiedenen Instrumenten geübt werden müssen.',
  },
  {
    id: ids.thermalExpansion,
    description:
      'Die lernende Person kann aus vergleichenden Beobachtungen erklären, dass sich Länge oder Volumen fester, flüssiger und gasförmiger Stoffe beim Erwärmen meist vergrößern und beim Abkühlen verkleinern, sofern eine Ausdehnung nicht durch starre Begrenzung verhindert wird, und Unterschiede qualitativ deuten.',
    descriptionEn:
      'The learner can use comparative observations to explain that the length or volume of solids, liquids, and gases usually increases when heated and decreases when cooled, provided expansion is not prevented by a rigid constraint, and can qualitatively interpret differences.',
    atomicityReason:
      'Richtung und stoffzustandsabhängige Unterschiede freier thermischer Längen- oder Volumenänderungen samt der Wirkung einer starren Begrenzung aus Vergleichsbeobachtungen zu deuten ist eine einzelne qualitative Modellkompetenz.',
    memoryReason:
      'Thermische Ausdehnung soll aus Vergleichsbeobachtungen bei Erwärmung und Abkühlung unter freien oder starr begrenzten Bedingungen gedeutet werden; Fallvariation ist geeigneter als eine Merkkarte.',
  },
  {
    id: ids.particleModelTemperature,
    description:
      'Die lernende Person kann im einfachen Teilchenmodell Temperaturänderungen qualitativ mit Veränderungen der mittleren ungeordneten Teilchenbewegung erklären und das Modell auf einfache Wärmeübertragungsvorgänge innerhalb oder zwischen Stoffen anwenden.',
    descriptionEn:
      "Using a simple particle model, the learner can qualitatively explain temperature changes through changes in the particles' average disordered motion and apply the model to simple heat-transfer processes within or between materials.",
    atomicityReason:
      'Temperaturänderungen über die mittlere ungeordnete Teilchenbewegung zu erklären und dieses Modell auf stoffgebundene Wärmeübertragung anzuwenden ist eine einzelne, klar begrenzte Teilchenmodell-Kompetenz.',
    memoryReason:
      'Die mittlere ungeordnete Bewegung muss in veränderten Stoff- und Wärmeübertragungssituationen modelliert und von Strahlungsübertragung im Vakuum abgegrenzt werden; eine isolierte Merkkarte genügt dafür nicht.',
  },
  {
    id: ids.heatTransfer,
    description:
      'Die lernende Person kann Wärmeleitung als Energieübertragung ohne makroskopischen Stofftransport, Konvektion als Übertragung durch strömende Flüssigkeiten oder Gase und Wärmestrahlung als elektromagnetische Übertragung auch ohne Materie unterscheiden und Alltagsbeispiele begründet zuordnen.',
    descriptionEn:
      'The learner can distinguish conduction as energy transfer without macroscopic transport of matter, convection as transfer by flowing liquids or gases, and thermal radiation as electromagnetic transfer that can also occur without matter, and can justify the classification of everyday examples.',
    atomicityReason:
      'Die drei Wärmeübertragungsarten über ihren jeweiligen Trägermechanismus zu unterscheiden und Beispiele begründet zuzuordnen ist eine einzelne Klassifikationskompetenz.',
    memoryReason:
      'Die Übertragungsmechanismen müssen in wechselnden Alltagssituationen erkannt und begründet werden; ein eigenes Memory-Deck ist dafür nicht erforderlich.',
  },
  {
    id: ids.pressureTemperature,
    title: 'Druck-Temperatur-Zusammenhang bei konstantem Volumen qualitativ erklären',
    titleEn: 'Qualitatively Explain the Pressure–Temperature Relationship at Constant Volume',
    description:
      'Die lernende Person kann für eine eingeschlossene Gasmenge bei konstantem Volumen mithilfe des Teilchenmodells qualitativ erklären, warum der Druck bei steigender Temperatur zunimmt und bei sinkender Temperatur abnimmt.',
    descriptionEn:
      'The learner can use the particle model to qualitatively explain why, for a fixed amount of gas at constant volume, pressure increases as temperature rises and decreases as temperature falls.',
    atomicityReason:
      'Den Druck-Temperatur-Zusammenhang für eine eingeschlossene Gasmenge bei konstantem Volumen mithilfe desselben Teilchenstoßmodells zu erklären ist eine einzelne, klar abgegrenzte Modellkompetenz.',
    memoryReason:
      'Der Zusammenhang muss unter den Randbedingungen feste Gasmenge und konstantes Volumen aus Teilchenstößen in veränderten Temperaturzuständen erklärt werden; eine isolierte Merkkarte ersetzt diese Modellierung nicht.',
  },
]

const childIds = childSpecs.map((spec) => spec.id)
const revisedIds = revisionSpecs.map((spec) => spec.id)

const readJson = (path: string): JsonRecord =>
  JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8')) as JsonRecord

const writeJson = (path: string, value: unknown): void => {
  writeFileSync(resolve(repoRoot, path), `${JSON.stringify(value, null, 2)}\n`)
}

const readJsonl = (path: string): JsonRecord[] =>
  readFileSync(resolve(repoRoot, path), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as JsonRecord)

const writeJsonl = (path: string, records: JsonRecord[]): void => {
  writeFileSync(resolve(repoRoot, path), `${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
}

const pressureTemperaturePreviousText = {
  title: 'Druck-Temperatur-Zusammenhänge qualitativ erklären',
  description:
    'Die lernende Person kann qualitative Zusammenhänge zwischen Druck- und Temperaturänderungen in Gasen fachlich erläutern.',
} as const

const pressureTemperatureCurrentText = {
  title: 'Druck-Temperatur-Zusammenhang bei konstantem Volumen qualitativ erklären',
  description:
    'Die lernende Person kann für eine eingeschlossene Gasmenge bei konstantem Volumen mithilfe des Teilchenmodells qualitativ erklären, warum der Druck bei steigender Temperatur zunimmt und bei sinkender Temperatur abnimmt.',
} as const

const normalizeText = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

const fingerprintReviewGoal = (goal: JsonRecord, ruleVersion: string): string => {
  const payload = stableJson({
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
  })
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}

const unique = <T>(values: T[]): T[] => [...new Set(values)]

const replaceReference = (
  values: string[] | undefined,
  oldId: string,
  replacements: string[],
): string[] => unique((values ?? []).flatMap((value) => (value === oldId ? replacements : [value])))

const updateVisualizationLinkText = (goal: JsonRecord): void => {
  if (!Array.isArray(goal.resourceLinks)) return
  for (const link of goal.resourceLinks) {
    if (link?.type !== 'goal-visualization') continue
    link.title = `Visualisierung: ${goal.title}`
    link.description = `Visualisierung zum Lernziel: ${goal.title}.`
    link.altText = `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`
  }
}

function buildCanonical(): JsonRecord {
  const landscape = readJson(paths.canonical)
  const goals = landscape.goals as JsonRecord[]
  const byId = new Map(goals.map((goal) => [goal.id, goal]))

  for (const parentId of splitParentIds) {
    if (!byId.has(parentId)) throw new Error(`Missing Physics split parent ${parentId}`)
  }

  for (const parentId of splitParentIds) {
    const parent = byId.get(parentId)!
    const children = childSpecs.filter((spec) => spec.parentId === parentId).map((spec) => spec.id)
    parent.type = 'cluster'
    parent.weight = 2
    parent.requires = []
    parent.contains = children
    delete parent.semanticAtomic
    updateVisualizationLinkText(parent)
  }

  for (const spec of childSpecs) {
    const parent = byId.get(spec.parentId)!
    const existing = byId.get(spec.id)
    const preservedResourceLinks = existing && Array.isArray(existing.resourceLinks)
      ? structuredClone(existing.resourceLinks)
      : []
    const goal: JsonRecord = existing ?? { id: spec.id }
    const applicability = structuredClone(parent.applicability ?? {})
    if (Array.isArray(applicability.jurisdiction) && Array.isArray(spec.excludedJurisdictions)) {
      applicability.jurisdiction = applicability.jurisdiction.filter(
        (jurisdiction: string) => !spec.excludedJurisdictions.includes(jurisdiction),
      )
    }
    Object.assign(goal, {
      id: spec.id,
      shortKey: spec.shortKey,
      title: spec.title,
      titleEn: spec.titleEn,
      description: spec.description,
      descriptionEn: spec.descriptionEn,
      weight: 1,
      tags: [...(parent.tags ?? [])],
      contains: [],
      requires: [...spec.requires],
      dimensionTags: {
        ...structuredClone(parent.dimensionTags),
        topicCode: spec.topicCode,
      },
      applicability,
      type: 'atomic',
      semanticAtomic: true,
      resourceLinks: preservedResourceLinks,
    })
    if (Array.isArray(parent.competencyRefs)) goal.competencyRefs = [...parent.competencyRefs]
    if (Object.prototype.hasOwnProperty.call(parent, 'core')) goal.core = parent.core
    updateVisualizationLinkText(goal)
    byId.set(goal.id, goal)
  }

  for (const spec of [...childSpecs].reverse()) {
    if (goals.some((goal) => goal.id === spec.id)) continue
    const parentIndex = goals.findIndex((goal) => goal.id === spec.parentId)
    if (parentIndex < 0) throw new Error(`Missing insertion point ${spec.parentId}`)
    goals.splice(parentIndex + 1, 0, byId.get(spec.id)!)
  }

  for (const spec of revisionSpecs) {
    const goal = byId.get(spec.id)
    if (!goal) throw new Error(`Missing Physics revision goal ${spec.id}`)
    for (const field of ['title', 'titleEn', 'description', 'descriptionEn'] as const) {
      if (typeof spec[field] === 'string') goal[field] = spec[field]
    }
    if (Array.isArray(spec.requires)) goal.requires = [...spec.requires]
    goal.semanticAtomic = true
    updateVisualizationLinkText(goal)
  }

  const thermalApplicabilityByGoalId = new Map<string, string[]>([
    [ids.temperatureExpansionParent, ['DE-BW', 'DE-HE', 'DE-MV', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH']],
    [ids.thermometer, ['DE-HE', 'DE-SL', 'DE-SN', 'DE-ST']],
    [ids.thermalExpansion, ['DE-BW', 'DE-HE', 'DE-MV', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH']],
  ])
  for (const [goalId, jurisdictions] of thermalApplicabilityByGoalId) {
    const goal = byId.get(goalId)
    if (!goal) throw new Error(`Missing thermal applicability goal ${goalId}`)
    goal.applicability = {
      ...structuredClone(goal.applicability ?? {}),
      jurisdiction: [...jurisdictions],
    }
  }

  const density = byId.get(ids.density)
  const buoyancy = byId.get(ids.buoyancy)
  if (!density || !buoyancy) throw new Error('Missing density or buoyancy ripple goal')
  density.requires = replaceReference(
    density.requires,
    ids.volumeParent,
    [ids.regularVolume, ids.displacementVolume],
  )
  buoyancy.requires = replaceReference(buoyancy.requires, ids.volumeParent, [ids.displacementVolume])

  const capstone = byId.get(ids.sekICapstone)
  if (!capstone?.examData) throw new Error(`Missing Sek-I capstone assessment ${ids.sekICapstone}`)
  // The released placeholder task is content-generic: it names no reflection, mirror-image,
  // lunar-phase, or eclipse operation. Do not inflate its actual coverage by copying either
  // newly separated atom into requires or coveredGoalIds.
  for (const oldId of [ids.reflectionParent, ids.celestialParent]) {
    capstone.requires = replaceReference(capstone.requires, oldId, [])
    capstone.examData.coveredGoalIds = replaceReference(capstone.examData.coveredGoalIds, oldId, [])
  }

  const parentIdsByChild = new Map<string, string[]>()
  for (const goal of goals) {
    for (const childId of goal.contains ?? []) {
      parentIdsByChild.set(childId, [...(parentIdsByChild.get(childId) ?? []), goal.id])
    }
  }
  const affectedAncestors = new Set<string>()
  for (const splitParentId of splitParentIds) {
    const queue = [...(parentIdsByChild.get(splitParentId) ?? [])]
    while (queue.length > 0) {
      const ancestorId = queue.shift()!
      if (affectedAncestors.has(ancestorId)) continue
      affectedAncestors.add(ancestorId)
      queue.push(...(parentIdsByChild.get(ancestorId) ?? []))
    }
  }
  affectedAncestors.delete(ids.subjectRoot)
  for (const ancestorId of affectedAncestors) {
    const ancestor = byId.get(ancestorId)
    if (!ancestor) throw new Error(`Missing affected ancestor ${ancestorId}`)
    const atomicDescendants = new Set<string>()
    const visit = (goalId: string): void => {
      const goal = byId.get(goalId)
      if (!goal) throw new Error(`Missing contains target ${goalId}`)
      if ((goal.contains ?? []).length === 0) {
        atomicDescendants.add(goalId)
        return
      }
      for (const childId of goal.contains) visit(childId)
    }
    visit(ancestorId)
    ancestor.weight = atomicDescendants.size
  }

  for (const parentId of splitParentIds) {
    for (const goal of goals) {
      if ((goal.requires ?? []).includes(parentId)) {
        throw new Error(`Unadjudicated requires reference ${goal.id} -> ${parentId}`)
      }
      if ((goal.examData?.coveredGoalIds ?? []).includes(parentId)) {
        throw new Error(`Unadjudicated assessment reference ${goal.id} -> ${parentId}`)
      }
    }
  }

  const allIds = new Set(goals.map((goal) => goal.id))
  if (allIds.size !== goals.length) throw new Error('Duplicate canonical Physics goal IDs after adjudication')
  for (const childId of childIds) {
    if (!allIds.has(childId)) throw new Error(`Missing materialized child ${childId}`)
  }
  landscape.goals = goals
  return landscape
}

function buildSemanticKinds(landscape: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const decisionById = new Map((ledger.decisions as JsonRecord[]).map((decision) => [decision.goalId, decision]))
  const fingerprintOnlyIds = [ids.density, ids.buoyancy, ids.sekICapstone]
  const structuralAtomicBasisIds = new Set([
    ids.forcePointLineCenterOfGravity,
    ids.measureMass,
    ids.density,
    ids.thermometer,
    ids.thermalExpansion,
  ])

  for (const goalId of [...splitParentIds, ...childIds, ...revisedIds, ...fingerprintOnlyIds]) {
    const goal = goalById.get(goalId)
    if (!goal) throw new Error(`Missing semantic-kind goal ${goalId}`)
    const decision = decisionById.get(goalId) ?? { goalId }
    const semanticKind = splitParentIds.includes(goalId)
      ? 'curricularArea'
      : childIds.includes(goalId) || revisedIds.includes(goalId)
        ? 'curricularAtomic'
        : decision.semanticKind
    if (!semanticKind) throw new Error(`Missing retained semantic kind for ${goalId}`)
    const decisionBasis = splitParentIds.includes(goalId)
      ? 'reviewed-current-structural-split-curricular-area'
      : childIds.includes(goalId) || structuralAtomicBasisIds.has(goalId)
        ? 'reviewed-current-structural-split-curricular-atomic'
        : revisedIds.includes(goalId)
          ? 'reviewed-current-pilot-curricular-atomic'
          : fingerprintOnlyIds.includes(goalId) && semanticKind === 'curricularAtomic'
            ? 'reviewed-current-pilot-curricular-atomic'
          : semanticKind === 'practiceAssessment'
          ? 'reviewed-current-post-split-practice-assessment'
          : decision.decisionBasis
    Object.assign(decision, {
      sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
      semanticKind,
      decisionStatus: 'authoritative',
      decisionBasis,
    })
    decisionById.set(goalId, decision)
  }

  ledger.decisions = [...decisionById.values()].sort((left, right) =>
    left.goalId < right.goalId ? -1 : left.goalId > right.goalId ? 1 : 0,
  )
  const counts: Record<string, number> = {}
  for (const decision of ledger.decisions as JsonRecord[]) {
    counts[decision.semanticKind] = (counts[decision.semanticKind] ?? 0) + 1
  }
  const preferredOrder = [
    'curricularAtomic',
    'curricularArea',
    'practiceAssessment',
    'programStructure',
    'memory',
    'runtimeSupport',
    'orientation',
  ]
  ledger.counts = Object.fromEntries(
    preferredOrder.filter((key) => counts[key] !== undefined).map((key) => [key, counts[key]]),
  )
  ledger.counts.total = (ledger.decisions as JsonRecord[]).length
  if (ledger.counts.curricularAtomic !== 438) {
    throw new Error(`Expected 438 curricularAtomic Physics decisions, got ${ledger.counts.curricularAtomic}`)
  }
  return ledger
}

function replaceSplitReviewRecords(
  records: JsonRecord[],
  replacementByParent: Map<string, JsonRecord[]>,
  updatedById: Map<string, JsonRecord>,
): JsonRecord[] {
  const result: JsonRecord[] = []
  const emitted = new Set<string>()
  for (const record of records) {
    const replacements = replacementByParent.get(record.goalId)
    if (replacements) {
      for (const replacement of replacements) {
        if (emitted.has(replacement.goalId)) continue
        result.push(replacement)
        emitted.add(replacement.goalId)
      }
      continue
    }
    if (splitParentIds.includes(record.goalId) || emitted.has(record.goalId)) continue
    result.push(updatedById.get(record.goalId) ?? record)
    emitted.add(record.goalId)
  }
  for (const replacements of replacementByParent.values()) {
    for (const replacement of replacements) {
      if (!emitted.has(replacement.goalId)) result.push(replacement)
    }
  }
  return result
}

function buildAtomicity(landscape: JsonRecord): JsonRecord[] {
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const records = readJsonl(paths.atomicity)
  const byId = new Map(records.map((record) => [record.goalId, record]))
  const reviewedAt = '2026-08-26'
  const reviewer = 'codex-ai-synthesis-2026-08-26'

  const replacementByParent = new Map<string, JsonRecord[]>()
  for (const parentId of splitParentIds) replacementByParent.set(parentId, [])
  for (const spec of childSpecs) {
    const goal = goalById.get(spec.id)
    if (!goal) throw new Error(`Missing atomicity child ${spec.id}`)
    const record = {
      schemaVersion: 1,
      reviewId: 'canonical-physics-full',
      ruleVersion: 'semantic-atomicity-v1',
      landscapeId: landscape.landscapeId,
      goalId: spec.id,
      fingerprint: fingerprintReviewGoal(goal, 'semantic-atomicity-v1'),
      reviewedAt,
      reviewer,
      status: 'atomic',
      semanticAtomic: true,
      reason: spec.atomicityReason,
      suggestedSplit: [],
    }
    byId.set(spec.id, record)
    replacementByParent.get(spec.parentId)!.push(record)
  }

  for (const spec of revisionSpecs) {
    const goal = goalById.get(spec.id)
    const record = byId.get(spec.id)
    if (!goal || !record) throw new Error(`Missing current atomicity record ${spec.id}`)
    Object.assign(record, {
      fingerprint: fingerprintReviewGoal(goal, 'semantic-atomicity-v1'),
      reviewedAt,
      reviewer,
      status: 'atomic',
      semanticAtomic: true,
      reason: spec.atomicityReason,
      suggestedSplit: [],
    })
  }
  return replaceSplitReviewRecords(records, replacementByParent, byId)
}

function buildMemory(landscape: JsonRecord): JsonRecord[] {
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const records = readJsonl(paths.memory)
  const byId = new Map(records.map((record) => [record.goalId, record]))
  const reviewedAt = '2026-08-26'
  const reviewer = 'codex-ai-synthesis-2026-08-26'

  const replacementByParent = new Map<string, JsonRecord[]>()
  for (const parentId of splitParentIds) replacementByParent.set(parentId, [])
  for (const spec of childSpecs) {
    const goal = goalById.get(spec.id)
    if (!goal) throw new Error(`Missing memory-review child ${spec.id}`)
    const record = {
      schemaVersion: 1,
      reviewId: 'canonical-physics-full',
      ruleVersion: 'memory-card-review-v1',
      landscapeId: landscape.landscapeId,
      goalId: spec.id,
      fingerprint: fingerprintReviewGoal(goal, 'memory-card-review-v1'),
      status: 'no_memory_needed',
      memoryUseful: false,
      reviewedAt,
      reviewer,
      reason: spec.memoryReason,
    }
    byId.set(spec.id, record)
    replacementByParent.get(spec.parentId)!.push(record)
  }

  for (const spec of revisionSpecs) {
    const goal = goalById.get(spec.id)
    const record = byId.get(spec.id)
    if (!goal || !record) throw new Error(`Missing current memory-review record ${spec.id}`)
    Object.assign(record, {
      fingerprint: fingerprintReviewGoal(goal, 'memory-card-review-v1'),
      status: 'no_memory_needed',
      memoryUseful: false,
      reviewedAt,
      reviewer,
      reason: spec.memoryReason,
    })
    delete record.memoryGoalIds
    delete record.deckIds
  }
  return replaceSplitReviewRecords(records, replacementByParent, byId)
}

function buildVisualizationQa(landscape: JsonRecord): JsonRecord {
  const qa = readJson(paths.visualizationQa)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  qa.records = (qa.records as JsonRecord[])
    .filter((record) => !splitParentIds.includes(record.goalId))
    .map((record) => {
      if (![...childIds, ...revisedIds].includes(record.goalId)) return record
      const goal = goalById.get(record.goalId)
      if (!goal) throw new Error(`Missing visualization QA goal ${record.goalId}`)
      return { ...record, title: goal.title, description: goal.description }
    })
  return qa
}

function buildPressureTemperatureVisualizationPrompt(): string {
  let prompt = readFileSync(resolve(repoRoot, paths.pressureTemperatureVisualizationPrompt), 'utf8')
  for (const field of ['title', 'description'] as const) {
    const previous = pressureTemperaturePreviousText[field]
    const current = pressureTemperatureCurrentText[field]
    prompt = prompt.split(previous).join(current)
    if (!prompt.includes(current) || prompt.includes(previous)) {
      throw new Error(`Could not bind current pressure-temperature ${field} in visualization prompt`)
    }
  }
  return prompt
}

function buildProvenance(): JsonRecord {
  const registry = readJson(paths.provenance)
  const landscape = (registry.landscapes as JsonRecord[]).find(
    (entry) => entry.landscapeId === '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
  )
  if (!landscape?.goalProvenance) throw new Error('Missing canonical Physics provenance landscape')
  Object.assign(landscape.goalProvenance, {
    [ids.regularVolume]: {
      sourceLandscapeId: 'd2e1fbb7-9e42-49a7-a07b-a7973156da12',
      sourceGoalId: 'sn-phys-seki-sn-klassenstufe-6-lb2-008-01-fdd7881a',
    },
    [ids.displacementVolume]: {
      sourceLandscapeId: 'd2e1fbb7-9e42-49a7-a07b-a7973156da12',
      sourceGoalId: 'sn-phys-seki-sn-klassenstufe-6-lb2-008-02-76a5526e',
    },
    [ids.reflectionLaw]: {
      sourceLandscapeId: '2b1b8596-f8c5-44ba-9dec-4cccb834769a',
      sourceGoalId: 'th-phys-seki-th-2-1-4-lichtausbreitung-und-bildentstehung-100-755d7bf9',
      additionalSourceLandscapeIds: [
        '3eedae6b-7e62-4e6e-a96c-78cd6df4c4aa',
        'd2e1fbb7-9e42-49a7-a07b-a7973156da12',
        '3f58b4cf-2b02-4ae0-bb0f-8d8ab6d7f4f1',
      ],
    },
    [ids.planeMirrorImage]: {
      sourceLandscapeId: '996d097a-cac2-4b5f-979a-b3a0b9803265',
      sourceGoalId: 'he-phys-seki-7-1-b03-a01-85d6be44',
      additionalSourceLandscapeIds: [
        '3f58b4cf-2b02-4ae0-bb0f-8d8ab6d7f4f1',
        '42c2f7e3-91b4-5de8-bef0-d563440e9d52',
        'd2e1fbb7-9e42-49a7-a07b-a7973156da12',
      ],
    },
    [ids.lunarPhases]: {
      sourceLandscapeId: '3f58b4cf-2b02-4ae0-bb0f-8d8ab6d7f4f1',
      sourceGoalId: 'bw-phys-seki-3-2-2-b06-a01-5770e8b7',
      additionalSourceLandscapeIds: ['d2e1fbb7-9e42-49a7-a07b-a7973156da12'],
    },
    [ids.eclipses]: {
      sourceLandscapeId: '2b1b8596-f8c5-44ba-9dec-4cccb834769a',
      sourceGoalId: 'th-phys-seki-th-2-1-4-lichtausbreitung-und-bildentstehung-097-eb809dc0',
      additionalSourceLandscapeIds: [
        '3f58b4cf-2b02-4ae0-bb0f-8d8ab6d7f4f1',
        'd2e1fbb7-9e42-49a7-a07b-a7973156da12',
        '3eedae6b-7e62-4e6e-a96c-78cd6df4c4aa',
      ],
    },
  })
  return registry
}

const replaceGoalEntries = (
  value: unknown,
  replacements: Map<string, string[]>,
): unknown => {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      if (entry && typeof entry === 'object' && (entry as JsonRecord).kind === 'goalEntry') {
        const entryRecord = entry as JsonRecord
        const replacementIds = replacements.get(entryRecord.goalId)
        if (replacementIds) {
          return replacementIds.map((goalId) => ({ ...entryRecord, goalId }))
        }
      }
      return [replaceGoalEntries(entry, replacements)]
    })
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as JsonRecord).map(([key, nested]) => [key, replaceGoalEntries(nested, replacements)]),
    )
  }
  return value
}

const ensureBavariaReflectionPrerequisiteEntry = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const nested = value.map((entry) => ensureBavariaReflectionPrerequisiteEntry(entry))
    const planeMirrorIndex = nested.findIndex(
      (entry) => entry && typeof entry === 'object'
        && (entry as JsonRecord).kind === 'goalEntry'
        && (entry as JsonRecord).goalId === ids.planeMirrorImage,
    )
    if (planeMirrorIndex < 0) return nested
    const reflectionLawIndex = nested.findIndex(
      (entry) => entry && typeof entry === 'object'
        && (entry as JsonRecord).kind === 'goalEntry'
        && (entry as JsonRecord).goalId === ids.reflectionLaw,
    )
    if (reflectionLawIndex >= 0) {
      ;(nested[reflectionLawIndex] as JsonRecord).projectionRole = 'prerequisiteOnly'
      return nested
    }
    nested.splice(planeMirrorIndex, 0, {
      kind: 'goalEntry',
      goalId: ids.reflectionLaw,
      projectionRole: 'prerequisiteOnly',
    })
    return nested
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as JsonRecord).map(([key, nested]) => [
        key,
        ensureBavariaReflectionPrerequisiteEntry(nested),
      ]),
    )
  }
  return value
}

function buildCompositionViews(canonical: JsonRecord): Map<string, JsonRecord> {
  const result = new Map<string, JsonRecord>()
  for (const path of paths.compositionViews) {
    const isBavaria = /\/de-by-/u.test(path)
    const replacements = new Map<string, string[]>([
      [ids.reflectionParent, isBavaria ? [ids.planeMirrorImage] : [ids.reflectionLaw, ids.planeMirrorImage]],
    ])
    if (!isBavaria) {
      replacements.set(ids.celestialParent, [ids.lunarPhases, ids.eclipses])
    }
    const replaced = replaceGoalEntries(readJson(path), replacements)
    result.set(
      path,
      (isBavaria ? ensureBavariaReflectionPrerequisiteEntry(replaced) : replaced) as JsonRecord,
    )
  }

  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const heatCluster = goalById.get(ids.heatCluster)
  if (!heatCluster || !goalById.has(ids.temperatureExpansionParent)) {
    throw new Error('Missing canonical heat or thermal boundary cluster')
  }

  const narrowHeatProjection = (
    value: unknown,
    includeThermometer: boolean,
    includeExpansion: boolean,
    replacements: { count: number },
  ): unknown => {
    if (Array.isArray(value)) {
      return value.map((entry) =>
        narrowHeatProjection(entry, includeThermometer, includeExpansion, replacements))
    }
    if (value && typeof value === 'object') {
      const record = value as JsonRecord
      const isBroadHeatSubtree = record.kind === 'canonicalSubtree' && record.goalId === ids.heatCluster
      const isMaterializedHeatStructure = record.kind === 'structure' && record.id === 'physics-seki-heat-source-backed'
      if (isBroadHeatSubtree || isMaterializedHeatStructure) {
        replacements.count += 1
        const supportedThermalIds = [
          ...(includeThermometer ? [ids.thermometer] : []),
          ...(includeExpansion ? [ids.thermalExpansion] : []),
        ]
        const orderedChildIds = (heatCluster.contains as string[]).flatMap((goalId) =>
          goalId === ids.temperatureExpansionParent ? supportedThermalIds : [goalId],
        )
        return {
          kind: 'structure',
          id: 'physics-seki-heat-source-backed',
          label: heatCluster.title,
          children: orderedChildIds.map((goalId) => ({ kind: 'canonicalSubtree', goalId })),
        }
      }
      return Object.fromEntries(
        Object.entries(record).map(([key, nested]) => [
          key,
          narrowHeatProjection(nested, includeThermometer, includeExpansion, replacements),
        ]),
      )
    }
    return value
  }

  const countDirectGoalReferences = (value: unknown, goalId: string): number => {
    if (Array.isArray(value)) return value.reduce((sum, entry) => sum + countDirectGoalReferences(entry, goalId), 0)
    if (!value || typeof value !== 'object') return 0
    const record = value as JsonRecord
    return (record.goalId === goalId ? 1 : 0)
      + Object.values(record).reduce((sum, nested) => sum + countDirectGoalReferences(nested, goalId), 0)
  }

  for (const policy of thermalViewPolicies) {
    const replacements = { count: 0 }
    const narrowed = narrowHeatProjection(
      readJson(policy.path),
      policy.includeThermometer,
      policy.includeExpansion,
      replacements,
    ) as JsonRecord
    if (replacements.count !== 1) {
      throw new Error(`Expected exactly one heat projection in ${policy.path}, found ${replacements.count}`)
    }
    const expectedThermometerRefs = policy.includeThermometer ? 1 : 0
    const expectedExpansionRefs = policy.includeExpansion ? 1 : 0
    const actualThermometerRefs = countDirectGoalReferences(narrowed, ids.thermometer)
    const actualExpansionRefs = countDirectGoalReferences(narrowed, ids.thermalExpansion)
    if (actualThermometerRefs !== expectedThermometerRefs || actualExpansionRefs !== expectedExpansionRefs) {
      throw new Error(
        `Unexpected thermal projection in ${policy.path}: thermometer=${actualThermometerRefs}/${expectedThermometerRefs}, expansion=${actualExpansionRefs}/${expectedExpansionRefs}`,
      )
    }
    result.set(policy.path, narrowed)
  }
  return result
}

const canonical = buildCanonical()
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = buildAtomicity(canonical)
const memory = buildMemory(canonical)
const visualizationQa = buildVisualizationQa(canonical)
const pressureTemperatureVisualizationPrompt = buildPressureTemperatureVisualizationPrompt()
const provenance = buildProvenance()
const compositionViews = buildCompositionViews(canonical)

if (writeMode) {
  writeJson(paths.canonical, canonical)
  writeJson(paths.semanticKinds, semanticKinds)
  writeJsonl(paths.atomicity, atomicity)
  writeJsonl(paths.memory, memory)
  writeJson(paths.visualizationQa, visualizationQa)
  writeFileSync(resolve(repoRoot, paths.pressureTemperatureVisualizationPrompt), pressureTemperatureVisualizationPrompt)
  writeJson(paths.provenance, provenance)
  for (const [path, view] of compositionViews) writeJson(path, view)
}

console.log(
  `CHECK apply_physics_current_wave_adjudication ${writeMode ? 'WRITE' : 'PASS'} splits=3 children=6 revisions=12 thermalViews=${thermalViewPolicies.length} visualText=1 curricularAtomic=438`,
)
