import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, any>
type Subject = 'mathematik' | 'physik'
type MemoryStatus = 'no_memory_needed' | 'memory_required'

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const reviewedAt = '2026-08-27'
const subjectArgument = process.argv.find((argument) => argument.startsWith('--subject='))

const subjects = {
  mathematik: {
    canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
    semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
    atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
    memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
    reviewer: 'codex-math-batch-011-wording-adjudication-2026-08-27',
  },
  physik: {
    canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
    semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
    atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
    memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
    reviewer: 'codex-physics-batch-016-wording-adjudication-2026-08-27',
  },
} as const

const revisions: Record<string, {
  subject: Subject
  previousDescription: string
  previousDescriptionEn: string
  interimDescription?: string
  interimDescriptionEn?: string
  description: string
  descriptionEn: string
  atomicityReason: string
  memoryStatus: MemoryStatus
  memoryReason: string
  promptFiles: string[]
}> = {
  '9d497a0c-f48d-4a90-8ec8-aeb89ca6d0c5': {
    subject: 'mathematik',
    previousDescription: 'Die lernende Person kann Volumenformeln für Prismen und Pyramiden auswählen und in einfachen Berechnungen sicher anwenden.',
    previousDescriptionEn: 'The learner can choose volume formulas for prisms and pyramids and apply them reliably in simple calculations.',
    description: 'Die lernende Person kann bei Prismen und Pyramiden Grundflächeninhalt und senkrechte Höhe identifizieren, anhand der Körperart die passende Volumenformel V = G · h beziehungsweise V = ⅓ · G · h auswählen und anwenden sowie Ergebnisse in passenden Volumeneinheiten prüfen.',
    descriptionEn: 'The learner can identify base area and perpendicular height in prisms and pyramids, select and apply the appropriate volume formula V = G · h or V = ⅓ · G · h according to the solid, and check results using suitable cubic units.',
    atomicityReason: 'Das Identifizieren der Größen, Auswählen der körperartspezifischen Formel und Prüfen des Ergebnisses sind Schritte einer einzelnen, klar begrenzten Volumenberechnung.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Die Volumenbeziehungen müssen an wechselnden Körpern begründet und angewendet werden; ein separates Memory-Deck würde diese räumliche Verständnisleistung nicht angemessen aufbauen.',
    promptFiles: ['prompt.de.md'],
  },
  '7b860649-373e-5523-9843-ec96b3537f1f': {
    subject: 'mathematik',
    previousDescription: 'Die lernende Person kann die Volumenformel für gerade Kreiskegel in Berechnungen sicher anwenden und Ergebnisse mit passenden Einheiten angeben.',
    previousDescriptionEn: 'The learner can reliably apply the volume formula for right circular cones in calculations and state results with suitable units.',
    interimDescription: 'Die lernende Person kann bei geraden Kreiskegeln Grundkreisfläche und senkrechte Höhe identifizieren, sie von der Mantellinie unterscheiden, mit V = ⅓ · G · h das Volumen berechnen und das Ergebnis in passenden Volumeneinheiten prüfen.',
    interimDescriptionEn: 'The learner can identify the circular base area and perpendicular height of a right circular cone, distinguish the height from the slant height, calculate the volume using V = ⅓ · G · h, and check the result using suitable cubic units.',
    description: 'Die lernende Person kann bei geraden Kreiskegeln Grundkreisfläche und senkrechte Höhe identifizieren, die senkrechte Höhe von der Mantellinie unterscheiden, mit V = ⅓ · G · h das Volumen berechnen und das Ergebnis in passenden Volumeneinheiten prüfen.',
    descriptionEn: 'The learner can identify the circular base area and perpendicular height of a right circular cone, distinguish the height from the slant height, calculate the volume using V = ⅓ · G · h, and check the result using suitable cubic units.',
    atomicityReason: 'Größenidentifikation, Abgrenzung der senkrechten Höhe und Formelverwendung sind Schritte einer einzelnen, klar begrenzten Kegelvolumenberechnung.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Das Kegelvolumen wird über den räumlichen Drittelzusammenhang verstanden und in wechselnden Situationen angewendet; dafür ist kein separates Memory-Deck erforderlich.',
    promptFiles: ['prompt.de.md'],
  },
  'bfc2bf06-9b37-4912-a8eb-25fb5d489d72': {
    subject: 'mathematik',
    previousDescription: 'Die lernende Person kann Flächeninhalte mithilfe uneigentlicher Integrale bestimmen, indem sie passende uneigentliche Integrale aufstellt und berechnet.',
    previousDescriptionEn: 'The learner can determine areas using improper integrals by setting up and calculating suitable improper integrals.',
    interimDescription: 'Die lernende Person kann den Inhalt einer unendlich ausgedehnten Fläche durch ein passendes uneigentliches Integral als Grenzwert bestimmen und das Ergebnis nur bei einem existierenden endlichen Grenzwert unter Beachtung von Vorzeichen als endlichen geometrischen Flächeninhalt deuten.',
    interimDescriptionEn: 'The learner can determine the area of an unbounded region using a suitable improper integral expressed as a limit and interpret the result as a finite geometric area, with signs accounted for, only when that limit exists and is finite.',
    description: 'Die lernende Person kann den Inhalt einer unendlich ausgedehnten Fläche durch passende uneigentliche Integrale als Grenzwerte bestimmen, die Fläche vorzeichengerecht in nichtnegative Teilflächen zerlegen und das Ergebnis nur dann als endlich deuten, wenn alle dafür erforderlichen Grenzwerte existieren und endlich sind.',
    descriptionEn: 'The learner can determine the area of an unbounded region using suitable improper integrals expressed as limits, split the region by sign into nonnegative subregions, and interpret the area as finite only when all required limits exist and are finite.',
    atomicityReason: 'Grenzwertdarstellung, vorzeichengerechte Flächenzerlegung und Endlichkeitsdeutung sind notwendige Teile einer einzelnen geometrischen Flächenbestimmung mit uneigentlichen Integralen.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Uneigentliche Integrale müssen über Grenzprozesse, Konvergenz und geometrische Deutung in variierenden Fällen verstanden werden; ein separates Memory-Deck ist dafür nicht erforderlich.',
    promptFiles: ['prompt.de.md', 'image-reconstruction-prompt.de.md'],
  },
  '57b11e9a-4acf-5ebe-b2b6-c9f99d2b5bb5': {
    subject: 'mathematik',
    previousDescription: 'Die lernende Person kann für eine gegebene Gerade-Ebene-Konfiguration den Schnittwinkel mithilfe von Richtungs- und Normalenvektoren berechnen.',
    previousDescriptionEn: 'The learner can calculate the intersection angle for a given line-plane configuration using direction and normal vectors.',
    interimDescription: 'Die lernende Person kann den nichtstumpfen Schnittwinkel zwischen einer Geraden und einer Ebene als Ergänzungswinkel zum kleineren Winkel zwischen einem Richtungsvektor der Geraden und einem Normalenvektor der Ebene bestimmen und das Ergebnis geometrisch prüfen.',
    interimDescriptionEn: 'The learner can determine the non-obtuse angle between a line and a plane as the complement of the smaller angle between a direction vector of the line and a normal vector of the plane and check the result geometrically.',
    description: 'Die lernende Person kann den nichtstumpfen Schnittwinkel α zwischen einer Geraden mit Richtungsvektor u und einer Ebene mit Normalenvektor n orientierungsunabhängig über sin α = |u · n|/(‖u‖ · ‖n‖) bestimmen, als Ergänzungswinkel zum nichtstumpfen Winkel zwischen Geraden- und Normalenrichtung deuten und geometrisch prüfen.',
    descriptionEn: 'The learner can determine the non-obtuse angle α between a line with direction vector u and a plane with normal vector n independently of vector orientation using sin α = |u · n|/(‖u‖ · ‖n‖), interpret it as the complement of the non-obtuse angle between the line and normal directions, and check it geometrically.',
    atomicityReason: 'Vektorrechnung, Ergänzungswinkel und geometrische Plausibilitätsprüfung gehören zu einer einzelnen Bestimmung des Gerade-Ebene-Schnittwinkels.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Die Winkelbeziehung muss aus der räumlichen Lage von Richtung und Normaler verstanden und geprüft werden; eine isolierte Formelkarte ist dafür nicht erforderlich.',
    promptFiles: ['prompt.de.md'],
  },
  '9bf67cce-4c8f-5497-8e64-825b83c6aa40': {
    subject: 'mathematik',
    previousDescription: 'Die lernende Person kann prüfen, ob eine gegebene Matrix als stochastische Übergangsmatrix einer Markov-Kette geeignet ist.',
    previousDescriptionEn: 'The learner can check whether a given matrix is suitable as a stochastic transition matrix for a Markov chain.',
    interimDescription: 'Die lernende Person kann unter Angabe der Zeilen- oder Spaltenkonvention anhand nichtnegativer Einträge und der Bedingung, dass sich die zu jedem Ausgangszustand gehörenden Einträge zu 1 summieren, begründen, ob eine Matrix als stochastische Übergangsmatrix einer Markov-Kette geeignet ist.',
    interimDescriptionEn: 'The learner can state the row or column convention and use nonnegative entries together with the condition that the entries belonging to each source state sum to 1 to justify whether a matrix is a stochastic transition matrix for a Markov chain.',
    description: 'Die lernende Person kann unter Angabe der Zeilen- oder Spaltenkonvention begründen, ob eine Matrix eine stochastische Übergangsmatrix einer Markov-Kette ist: Die Matrix ist quadratisch und ihre Zeilen und Spalten beziehen sich auf denselben Zustandsraum, alle Einträge sind nichtnegativ, und die zu jedem Ausgangszustand gehörenden Einträge summieren sich zu 1.',
    descriptionEn: 'The learner can state the row or column convention and justify whether a matrix is a stochastic transition matrix for a Markov chain: The matrix is square and its rows and columns refer to the same state space, all entries are nonnegative, and the entries belonging to each source state sum to 1.',
    atomicityReason: 'Quadratische Form mit gemeinsamem Zustandsraum, Nichtnegativität, Summenbedingung und explizite Konvention sind gemeinsam die Kriterien einer einzelnen fachlichen Eignungsprüfung für eine Markov-Übergangsmatrix.',
    memoryStatus: 'memory_required',
    memoryReason: 'Der kompakte Kriterienkern aus quadratischer Form mit gemeinsamem Zustandsraum, Nichtnegativität und zur gewählten Konvention passender Summenbedingung muss sicher abrufbar sein; Begründung und Anwendung an neuen Matrizen bleiben führend.',
    promptFiles: ['prompt.de.md'],
  },
  '8dc2c87a-cfc6-5f15-89e5-634107f5c9c7': {
    subject: 'mathematik',
    previousDescription: 'Die lernende Person kann aus den Bildern der Einheitsvektoren einer Basis die zugehörige Abbildungsmatrix bestimmen.',
    previousDescriptionEn: 'The learner can determine the associated mapping matrix from the images of the unit vectors of a basis.',
    description: 'Die lernende Person kann die Abbildungsmatrix einer linearen Abbildung bezüglich der Standardbasis bestimmen, indem sie die Koordinatenvektoren der Bilder der geordneten Standardbasis in derselben Reihenfolge als Spalten anordnet.',
    descriptionEn: 'The learner can determine the matrix of a linear map with respect to the standard basis by placing the coordinate vectors of the images of the ordered standard-basis vectors as columns in the same order.',
    atomicityReason: 'Das Bilden der Spalten aus den Bildern der geordneten Standardbasis ist ein einzelnes, klar abgegrenztes Konstruktionsprinzip für die Abbildungsmatrix.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Das Spaltenprinzip muss aus der Wirkung der linearen Abbildung auf Basisvektoren verstanden und konstruktiv angewendet werden; ein separates Memory-Deck ist nicht erforderlich.',
    promptFiles: ['prompt.de.md', 'image-reconstruction-prompt.de.md'],
  },
  'e8d810de-95ed-52d6-ab1f-0560398e35c0': {
    subject: 'mathematik',
    previousDescription: 'Die lernende Person kann Binomialkoeffizienten als abkürzende Schreibweise für Kombinationen ohne Zurücklegen verwenden.',
    previousDescriptionEn: 'The learner can use binomial coefficients as shorthand for combinations without replacement.',
    interimDescription: 'Die lernende Person kann den Binomialkoeffizienten „n über k“ als Anzahl ungeordneter Auswahlen von k aus n unterscheidbaren Elementen ohne Zurücklegen deuten und als abkürzende Schreibweise verwenden.',
    interimDescriptionEn: 'The learner can interpret the binomial coefficient “n choose k” as the number of unordered selections of k from n distinct elements without replacement and use it as shorthand.',
    description: 'Die lernende Person kann den Binomialkoeffizienten „n über k“ als abkürzende Schreibweise für die Anzahl ungeordneter Auswahlen von k aus n unterscheidbaren Elementen ohne Zurücklegen verwenden.',
    descriptionEn: 'The learner can use the binomial coefficient “n choose k” as shorthand for the number of unordered selections of k from n distinct elements without replacement.',
    atomicityReason: 'Die Verwendung des Binomialkoeffizienten als Abkürzung für eine klar bezeichnete Auswahlanzahl ist eine einzelne, eng begrenzte Notationskompetenz.',
    memoryStatus: 'memory_required',
    memoryReason: 'Notation und kompakte Berechnungsform des Binomialkoeffizienten müssen sicher abrufbar sein; die kombinatorische Deutung und Abgrenzung werden weiterhin über Aufgaben aufgebaut.',
    promptFiles: ['prompt.de.md', 'image-reconstruction-prompt.de.md'],
  },
  'e359f8bb-6106-44aa-9edf-694528d2d2a9': {
    subject: 'physik',
    previousDescription: 'Die lernende Person kann die Energieerhaltung aus den Newtonschen Axiomen herleiten und die Voraussetzungen dieser Herleitung benennen. Ausgangspunkt ist die Grundgleichung der Mechanik, die mit der Geschwindigkeit skalar multipliziert wird. Dabei ist für die kinetische Energie eine konstante Masse vorausgesetzt. Für konservative Kräfte wird die Kraft als Gradient eines Potenzials aufgefasst, sodass sich der entsprechende Term als Zeitableitung der potenziellen Energie schreiben lässt. Auf diese Weise gelangt die lernende Person zur Erhaltung der mechanischen Energie.',
    previousDescriptionEn: "The learner can derive energy conservation from Newton's laws and state the assumptions of the derivation. Hint: Start from the fundamental equation, take the scalar product with velocity, treat mass as constant for kinetic energy, and for potential energy use two canceling operations (integrate this part over time t and differentiate with respect to t) to obtain conservation of mechanical energy.",
    description: 'Die lernende Person kann für ein System konstanter Masse, auf das nur konservative Kräfte mit zeitunabhängigem Potenzial wirken, aus dem zweiten Newtonschen Axiom und F = −∇U die Erhaltung der mechanischen Energie herleiten und die Gültigkeitsbedingungen erläutern.',
    descriptionEn: "The learner can derive conservation of mechanical energy from Newton's second law and F = −∇U for a constant-mass system subject only to conservative forces with a time-independent potential and explain the conditions under which the derivation is valid.",
    atomicityReason: 'Herleitung und Gültigkeitsbedingungen bilden eine einzelne fachliche Begründungskompetenz zur Erhaltung der mechanischen Energie unter konservativen Kräften.',
    memoryStatus: 'memory_required',
    memoryReason: 'Die kompakte Beziehung aus kinetischer und potenzieller Energie sowie ihre konservativen Gültigkeitsbedingungen müssen sicher abrufbar sein; die Herleitung und Grenzfallprüfung bleiben Verständnisleistungen.',
    promptFiles: ['prompt.de.md'],
  },
  '88d07c80-5d7d-5c70-b385-b22769381e44': {
    subject: 'physik',
    previousDescription: 'Die lernende Person kann Wärmeenergie als innere Energie eines Systems interpretieren, typische Beispiele nennen und den Nutzen dieser Definition historisch einordnen.',
    previousDescriptionEn: 'The learner can interpret heat energy as internal energy of a system, name typical examples, and historically contextualize the utility of this definition.',
    description: 'Die lernende Person kann den Ausdruck „Wärmeenergie“ im historischen Zusammenhang als Bezeichnung für die innere Energie eines betrachteten Systems einordnen und erklären, warum „innere Energie“ die im System gespeicherte Energie begrifflich präziser bezeichnet.',
    descriptionEn: 'The learner can contextualize the term “heat energy” historically as a term for the internal energy of the system under consideration and explain why “internal energy” more precisely denotes the energy stored in the system.',
    atomicityReason: 'Historische Einordnung und begriffliche Präzisierung beantworten gemeinsam eine einzelne konzeptuelle Frage: was mit „Wärmeenergie“ gemeint war und welchen Nutzen die Bezeichnung „innere Energie“ hat.',
    memoryStatus: 'memory_required',
    memoryReason: 'Die kompakte Bedeutung der inneren Energie als im betrachteten System gespeicherte Energie muss sicher abrufbar sein; historische Einordnung und begriffliche Präzisierung werden erklärend geprüft.',
    promptFiles: ['prompt.de.md'],
  },
  '48e3d6c2-00bf-5afd-8846-ba3dbd01e96d': {
    subject: 'physik',
    previousDescription: 'Existenz von Antiteilchen (Positron). Paarvernichtung als Energiequelle für die PET-Diagnostik (E=mc²).',
    previousDescriptionEn: 'Existence of antiparticles (positron). Pair annihilation as an energy source for PET diagnostics (E=mc²).',
    description: 'Die lernende Person kann das Positron als Antiteilchen des Elektrons beschreiben und erklären, wie bei der Vernichtung eines annähernd ruhenden Elektron-Positron-Paares unter Energie- und Impulserhaltung zwei nahezu entgegengesetzt ausgesandte Photonen entstehen, die in der PET als Messsignal genutzt werden.',
    descriptionEn: 'The learner can describe the positron as the electron’s antiparticle and explain how annihilation of an approximately stationary electron–positron pair produces two nearly oppositely emitted photons under conservation of energy and momentum, which are used as a measurement signal in PET.',
    atomicityReason: 'Antiteilchenbegriff, Paarvernichtung und Nutzung ihrer Photonen als PET-Messsignal bilden eine zusammenhängende Erklärung eines einzelnen physikalischen Wirkprinzips.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Das Ziel verlangt eine kausale Erklärung unter Energie- und Impulserhaltung und die Übertragung auf PET; eine isolierte Faktenkarte ist dafür nicht erforderlich.',
    promptFiles: ['prompt.de.md'],
  },
  '709e688c-eb07-5f83-a506-82c9bfe0d89f': {
    subject: 'physik',
    previousDescription: 'Beugung als begrenzender Faktor für die Auflösung von Mikroskopen, Teleskopen und dem menschlichen Auge (Rayleigh-Kriterium).',
    previousDescriptionEn: 'Diffraction as the limiting factor for the resolution of microscopes, telescopes, and the human eye (Rayleigh criterion).',
    description: 'Die lernende Person kann mithilfe des Rayleigh-Kriteriums erklären und beurteilen, wie Beugung, Wellenlänge und wirksame Öffnung das Auflösungsvermögen von Mikroskopen, Teleskopen und dem menschlichen Auge begrenzen.',
    descriptionEn: 'The learner can use the Rayleigh criterion to explain and assess how diffraction, wavelength, and effective aperture limit the resolving power of microscopes, telescopes, and the human eye.',
    atomicityReason: 'Rayleigh-Kriterium und Einfluss von Wellenlänge und Öffnung gehören zu einer einzelnen Beurteilung der beugungsbegrenzten optischen Auflösung.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Das Auflösungsvermögen muss an wechselnden Instrumenten über Beugung und Parameterwirkungen erklärt werden; ein separates Memory-Deck ist dafür nicht erforderlich.',
    promptFiles: ['prompt.de.md'],
  },
  '52bdabb2-d9a1-56e6-bccf-ff58f299c739': {
    subject: 'physik',
    previousDescription: 'Anwendung von starken Magnetfeldern und Resonanz in der Medizintechnik. Funktionsprinzip qualitativ verstehen.',
    previousDescriptionEn: 'Application of strong magnetic fields and resonance in medical technology. Qualitative understanding of the operating principle.',
    description: 'Die lernende Person kann qualitativ erklären, wie ein statisches Magnetfeld eine Netto-Kernspinmagnetisierung ausrichtet, eine resonante Hochfrequenzanregung sie auslenkt und Magnetfeldgradienten die bei der Relaxation gemessenen Signale räumlich für ein MRT-Bild codieren.',
    descriptionEn: 'The learner can qualitatively explain how a static magnetic field aligns net nuclear-spin magnetization, resonant radio-frequency excitation tips it, and magnetic-field gradients spatially encode the signals measured during relaxation for an MRI image.',
    atomicityReason: 'Ausrichtung, Resonanzanregung, Relaxationssignal und Raumcodierung sind aufeinanderfolgende Teile einer einzelnen qualitativen Erklärung des MRT-Funktionsprinzips.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Die MRT-Signalkette muss kausal erklärt und auf Bildentstehung bezogen werden; isoliertes Faktenlernen ist dafür nicht erforderlich.',
    promptFiles: ['prompt.de.md'],
  },
  '0693f68f-1bd4-50a9-ba2b-af95b1c949ee': {
    subject: 'physik',
    previousDescription: 'Dispersionsrelationen und Brechzahlverläufe analysieren.',
    previousDescriptionEn: 'Analyze dispersion relations and refractive index courses.',
    description: 'Die lernende Person kann Dispersionsrelationen und die Frequenz- beziehungsweise Wellenlängenabhängigkeit der Brechzahl analysieren und daraus erklären, wie ein Medium Phasengeschwindigkeit und Brechung elektromagnetischer Wellen frequenzabhängig verändert.',
    descriptionEn: 'The learner can analyze dispersion relations and the frequency or wavelength dependence of refractive index and use them to explain how a medium changes the phase velocity and refraction of electromagnetic waves as a function of frequency.',
    atomicityReason: 'Dispersionsrelation, Brechzahlverlauf, Phasengeschwindigkeit und Brechung beschreiben gemeinsam dieselbe frequenzabhängige Ausbreitung elektromagnetischer Wellen im Medium.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Dispersion muss aus Relationen und Brechzahlverläufen analysiert und auf neue Frequenzen übertragen werden; ein separates Memory-Deck ist dafür nicht erforderlich.',
    promptFiles: ['prompt.de.md'],
  },
  '5492f0e0-cbae-574e-a853-182616205ed3': {
    subject: 'physik',
    previousDescription: 'Q-Werte und Reaktionsgleichungen berechnen.',
    previousDescriptionEn: 'Calculate Q-values and reaction equations.',
    description: 'Die lernende Person kann Kernreaktionsgleichungen unter Erhaltung von Ladungs- und Nukleonenzahl vervollständigen, Q-Werte aus den Massen vor und nach der Reaktion bestimmen und deren Vorzeichen als frei werdende oder erforderliche Energie deuten.',
    descriptionEn: 'The learner can complete nuclear reaction equations using conservation of charge and nucleon number, determine Q-values from the masses before and after the reaction, and interpret their sign as energy released or required.',
    atomicityReason: 'Reaktionsbilanz und Q-Wert sind die stoffliche und energetische Bilanz derselben einzelnen Kernreaktion und bilden eine zusammenhängende Rechen- und Deutungskompetenz.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Reaktions- und Energiebilanzen müssen unter Erhaltungssätzen an wechselnden Reaktionen erstellt und gedeutet werden; ein separates Memory-Deck ist nicht erforderlich.',
    promptFiles: ['prompt.de.md'],
  },
}

const abs = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(abs(path), 'utf8'))
const readJsonl = (path: string): JsonRecord[] => readFileSync(abs(path), 'utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim() !== '')
  .map((line) => JSON.parse(line))
const normalizeText = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord).sort(([a], [b]) => a.localeCompare(b)).map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value)
}
const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => `sha256:${createHash('sha256').update(stableJson({
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
})).digest('hex')}`

const outputs = new Map<string, string>()
const subjectFilter = subjectArgument?.slice('--subject='.length) as Subject | undefined
if (subjectFilter && !(subjectFilter in subjects)) throw new Error(`Unknown subject filter: ${subjectFilter}`)

for (const [subject, paths] of Object.entries(subjects) as [Subject, typeof subjects[Subject]][]) {
  if (subjectFilter && subject !== subjectFilter) continue
  const landscape = readJson(paths.canonical)
  const goals = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id as string, goal]))
  const subjectRevisions = Object.entries(revisions).filter(([, revision]) => revision.subject === subject)

  for (const [goalId, revision] of subjectRevisions) {
    const goal = goals.get(goalId)
    if (!goal) throw new Error(`Missing ${subject} goal ${goalId}`)
    const matchesCurrent = goal.description === revision.description && goal.descriptionEn === revision.descriptionEn
    const matchesPrevious = goal.description === revision.previousDescription && goal.descriptionEn === revision.previousDescriptionEn
    const matchesInterim = revision.interimDescription !== undefined
      && revision.interimDescriptionEn !== undefined
      && goal.description === revision.interimDescription
      && goal.descriptionEn === revision.interimDescriptionEn
    if (!matchesCurrent && !matchesPrevious && !matchesInterim) throw new Error(`Canonical bilingual revision does not match adjudication for ${goalId}`)
    goal.description = revision.description
    goal.descriptionEn = revision.descriptionEn
    for (const link of goal.resourceLinks ?? []) {
      if (link.type !== 'goal-visualization') continue
      link.description = `Visualisierung zum Lernziel: ${goal.title}.`
      link.altText = `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`
    }
  }
  outputs.set(paths.canonical, `${JSON.stringify(landscape, null, 2)}\n`)

  const semanticKinds = readJson(paths.semanticKinds)
  for (const [goalId] of subjectRevisions) {
    const decision = (semanticKinds.decisions as JsonRecord[]).find((entry) => entry.goalId === goalId)
    const goal = goals.get(goalId)!
    if (!decision || decision.semanticKind !== 'curricularAtomic' || decision.decisionStatus !== 'authoritative') {
      throw new Error(`Missing authoritative curricularAtomic decision for ${goalId}`)
    }
    decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  }
  outputs.set(paths.semanticKinds, `${JSON.stringify(semanticKinds, null, 2)}\n`)

  const atomicityRecords = readJsonl(paths.atomicity)
  const memoryRecords = readJsonl(paths.memory)
  for (const [goalId, revision] of subjectRevisions) {
    const goal = goals.get(goalId)!
    const atomicity = atomicityRecords.find((entry) => entry.goalId === goalId)
    if (!atomicity) throw new Error(`Missing semantic-atomicity record for ${goalId}`)
    Object.assign(atomicity, {
      fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
      reviewedAt,
      reviewer: paths.reviewer,
      status: 'atomic',
      semanticAtomic: true,
      reason: revision.atomicityReason,
      suggestedSplit: [],
    })

    const memory = memoryRecords.find((entry) => entry.goalId === goalId)
    if (!memory || memory.status !== revision.memoryStatus) throw new Error(`Unexpected memory-card decision for ${goalId}`)
    Object.assign(memory, {
      fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
      reviewedAt,
      reviewer: paths.reviewer,
      status: revision.memoryStatus,
      memoryUseful: revision.memoryStatus === 'memory_required',
      reason: revision.memoryReason,
    })
    if (revision.memoryStatus === 'memory_required') {
      if (!Array.isArray(memory.memoryGoalIds) || memory.memoryGoalIds.length === 0 || !Array.isArray(memory.deckIds) || memory.deckIds.length === 0) {
        throw new Error(`Missing required memory trace for ${goalId}`)
      }
    } else {
      delete memory.memoryGoalIds
      delete memory.deckIds
    }
  }
  outputs.set(paths.atomicity, `${atomicityRecords.map((record) => JSON.stringify(record)).join('\n')}\n`)
  outputs.set(paths.memory, `${memoryRecords.map((record) => JSON.stringify(record)).join('\n')}\n`)

  for (const [goalId, revision] of subjectRevisions) {
    const goal = goals.get(goalId)!
    for (const fileName of revision.promptFiles) {
      const promptPath = `curricula/DE/Gymnasium/visualizations/${subject}/${goalId}/${fileName}`
      let bytes = readFileSync(abs(promptPath), 'utf8')
      const lines = bytes.split(/\r?\n/u).filter((line) => line.startsWith('- Beschreibung: ') || line.startsWith('Beschreibung: '))
      if (lines.length === 0) throw new Error(`No description binding found in ${promptPath}`)
      for (const line of lines) bytes = bytes.replace(line, `${line.startsWith('- ') ? '- ' : ''}Beschreibung: ${goal.description}`)
      outputs.set(promptPath, bytes)
    }
  }
}

for (const [path, bytes] of outputs) {
  if (writeMode) writeFileSync(abs(path), bytes)
  else if (readFileSync(abs(path), 'utf8') !== bytes) throw new Error(`Adjudication drift in ${path}`)
}

const selectedRevisionCount = Object.values(revisions).filter((revision) => !subjectFilter || revision.subject === subjectFilter).length
console.log(`CHECK apply_math_physics_batch_011_016_wording_adjudication ${writeMode ? 'WRITE' : 'PASS'} goals=${selectedRevisionCount} files=${outputs.size}`)
