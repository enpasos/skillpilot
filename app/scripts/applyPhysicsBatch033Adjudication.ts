import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { CanonicalAuthoringGoal } from '../src/utils/authoring/canonicalAuthoring'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>
type AdjudicationGoal = CanonicalAuthoringGoal & { dimensionTags: Record<string, unknown> }
type SemanticKindLedger = JsonRecord & { counts: Record<string, number> }
type Revision = {
  id: string
  beforeStateDigest: string
  alternateBeforeStateDigest?: string
  titleDe: string
  titleEn: string
  descriptionDe: string
  descriptionEn: string
  requires?: string[]
  semanticKind?: 'orientation'
  tags?: string[]
  demandLevel?: string
  atomicityReason: string
  memoryReason: string
  visualizationNote: string
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const unexpected = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unexpected.length > 0) throw new Error(`Unexpected arguments: ${unexpected.join(', ')}`)

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
} as const
const reviewedAt = '2026-09-05'
const reviewer = 'codex-physics-b033-dual-review-adjudication-2026-09-05'
const orientationId = '70b358bf-da6d-53ba-8393-51d5c2365b04'

const revisions: Revision[] = [
  {
    id: '3d3e5917-d367-535d-a6ad-b9d87259e6ce',
    beforeStateDigest: 'e4a188056e35c52984da959fd4f61d900004ec57568df240bf10dbe2394d541d',
    titleDe: 'Polarisation quantitativ mit dem Malus-Gesetz untersuchen',
    titleEn: "Investigate polarization quantitatively using Malus's law",
    descriptionDe: 'Die lernende Person kann für linear polarisiertes Licht die Intensität hinter einem Analysator in Abhängigkeit vom Winkel zwischen Polarisations- und Transmissionsrichtung messen, die Daten unter Berücksichtigung der Messunsicherheit mit I = I₀ cos²(α) vergleichen und Abweichungen durch Untergrund oder nichtideale Filter begründen.',
    descriptionEn: "The learner can measure the intensity of linearly polarized light behind an analyzer as a function of the angle between the polarization and transmission directions, compare the data with I = I₀ cos²(α) while accounting for measurement uncertainty, and explain deviations caused by background light or non-ideal filters.",
    atomicityReason: 'Messung, Modellvergleich und Abweichungsanalyse beziehen sich auf denselben Malus-Datensatz und bilden eine zusammenhängende experimentelle Modellprüfung.',
    memoryReason: 'Das Malus-Gesetz ist bereits über vorhandene Gedächtnisstrukturen abgedeckt; dieses Ziel verlangt darüber hinaus Messplanung, Modellvergleich und Fehlerdeutung.',
    visualizationNote: 'Das vorhandene Nano-Banana-Pro-Bild bleibt als anschaulicher Malus-Gesetz-Kontext geeignet; die präzisierte Unsicherheitsanalyse wird im Coaching ergänzt.',
  },
  {
    id: '8c97c234-a932-5e84-aed5-237b4e2a8336',
    beforeStateDigest: 'f782f6e9da6851ee03ff024c672e4dd9c350ff25597b5f4d65803a3ce83c27ed',
    titleDe: 'Delayed-Choice-Experimente messkontextbezogen deuten',
    titleEn: 'Interpret delayed-choice experiments in terms of measurement context',
    descriptionDe: 'Die lernende Person kann an einem Delayed-Choice-Experiment erklären, wie die gewählte Messanordnung entweder Interferenzstatistik oder Weginformation zugänglich macht, und diesen experimentellen Befund von retrokausalen oder klassisch-ontologischen Deutungen unterscheiden.',
    descriptionEn: 'The learner can use a delayed-choice experiment to explain how the selected measurement arrangement makes either interference statistics or which-path information accessible and distinguish this experimental finding from retrocausal or classically ontological interpretations.',
    requires: ['6031bed0-9baa-4f45-b2a5-57ffb00d39cc'],
    atomicityReason: 'Gegenstand ist eine einzelne erkenntnistheoretisch kontrollierte Deutungsleistung: Messkontext und beobachtbare Statistik trennen, ohne aus dem Befund unzulässige Ontologie abzuleiten.',
    memoryReason: 'Begriffe zur Komplementarität dürfen gestützt werden; die eigentliche Leistung ist jedoch das Deuten neuer Versuchsanordnungen und kein isoliertes Erinnern.',
    visualizationNote: 'Das vorhandene Bild kann weiterhin den Versuchsaufbau motivieren; die neue Beschreibung verhindert eine retrokausale Fehlinterpretation.',
  },
  {
    id: 'e5c08365-a0d3-592c-ad8e-d2c2c6e2b717',
    beforeStateDigest: 'c86458b986f0bcb0ce05c4764116a67ffb68fd1033e17f043a873cc4cfc83a91',
    titleDe: 'Anwendungen ionisierender Strahlung qualitativ beurteilen',
    titleEn: 'Qualitatively assess applications of ionising radiation',
    descriptionDe: 'Die lernende Person kann bei einer konkreten Anwendung ionisierender Strahlung deren Funktion über Strahlungsart, Wechselwirkung und Nachweisprinzip erklären und Nutzen sowie Gefährdung unter Berücksichtigung von Expositionsweg, Reichweite und Abschirmung qualitativ beurteilen.',
    descriptionEn: 'For a specific application of ionising radiation, the learner can explain its operation in terms of radiation type, interaction, and detection principle and qualitatively assess its benefits and hazards while considering the exposure pathway, range, and shielding.',
    atomicityReason: 'Die Beschreibung prüft eine einzige fallbezogene Bewertungsleistung, welche bereits vorhandene Teilkompetenzen zu Strahlungsart, Wechselwirkung und Nachweis integriert, statt sie erneut zu bündeln.',
    memoryReason: 'Strahlungsarten und Schutzprinzipien können memoriert werden; Nutzen-Risiko-Abwägung und Transfer auf eine konkrete Anwendung erfordern jedoch Verständnis.',
    visualizationNote: 'Das vorhandene Überblicksbild bleibt als Anwendungskontext nutzbar; beurteilt wird jeweils ein konkreter Fall und nicht das bloße Wiedergeben des gesamten Überblicks.',
  },
  {
    id: 'b1ad9493-acca-5366-9ecd-4b7bf7edaf4a',
    beforeStateDigest: 'be4c8ff2fb70987a4337088a3f6cc8c282bd187245797c89d6b71695e1ba605f',
    titleDe: 'Geiger-Müller-Zählrohr funktional erklären',
    titleEn: 'Explain the operation of a Geiger–Müller counter',
    descriptionDe: 'Die lernende Person kann erklären, wie Primärionisation im Geiger-Müller-Zählrohr eine lawinenartige Gasentladung und dadurch einen Zählimpuls auslöst, und begründen, warum das Gerät Ereignisse zählt, aber keine Energie der einfallenden Strahlung bestimmt.',
    descriptionEn: 'The learner can explain how primary ionisation in a Geiger–Müller counter triggers an avalanche-like gas discharge and hence a counting pulse, and justify why the device counts events but does not determine the energy of the incident radiation.',
    requires: ['25d91cc0-d84c-5522-86b5-fdff73264f08'],
    atomicityReason: 'Ionisation, Lawinenentladung, Impulsbildung und die daraus folgende Messgrenze sind kausal gekoppelte Bestandteile eines einzigen Detektorprinzips.',
    memoryReason: 'Bauteilnamen allein genügen nicht; die Kausalkette und Messgrenze müssen an einer neuen Detektorsituation erklärt werden.',
    visualizationNote: 'Für dieses Ziel ist derzeit bewusst kein Bild freigegeben; es wird kein Ersatzbild erzeugt.',
  },
  {
    id: orientationId,
    beforeStateDigest: '5f3a39441d0f824010a457ff6ee7b2e5b060334faa737f6959b20845ecce9889',
    alternateBeforeStateDigest: 'd164c46e2c5e33cfc3845dff5d320effbcb4fa6547a284ce24a346ab7efac64e',
    titleDe: 'Vom Sand zum Smartphone: Die digitale Revolution',
    titleEn: 'From Sand to Smartphone: The Digital Revolution',
    descriptionDe: 'Ein anschaulicher Einstieg in die Festkörperphysik: Aus siliziumdioxidhaltigem Rohstoff wird hochreines Silizium, dessen gezielt veränderbare elektrische Eigenschaften Mikrochips, Sensoren und Kommunikation ermöglichen. Die lernende Person erkundet diese Verbindung; hier geht es um Orientierung und Interesse, fachliches Detailwissen wird weder vorausgesetzt noch geprüft.',
    descriptionEn: 'An accessible introduction to solid-state physics: silica-bearing raw material is processed into high-purity silicon whose deliberately adjustable electrical properties enable microchips, sensors, and communication. The learner explores this connection; the purpose is orientation and interest, and detailed subject knowledge is neither assumed nor assessed.',
    semanticKind: 'orientation',
    requires: [],
    tags: ['GK', 'LK', 'Motivation', 'Orientation', 'canonical'],
    demandLevel: 'AB1',
    atomicityReason: 'Das Ziel ist ausdrücklich ein motivierender Einstieg ohne fachliche Leistungsprüfung und gehört daher nicht in die curriculare Atomicity-Lane.',
    memoryReason: 'Ein Orientierungsziel verlangt weder fachliches Erinnern noch ein Memory-Deck.',
    visualizationNote: 'Das vorhandene lockere Nano-Banana-Pro-Überblicksbild passt weiterhin zum motivierenden Einstieg und bleibt unverändert.',
  },
  {
    id: 'da3169ae-c72a-5782-ad95-408167a5c6da',
    beforeStateDigest: 'c5802595f8beca7c08d9621f90f2551b8cdc02a91d8717da25d61f52d9189701',
    titleDe: 'Stabilität astronomischer Objekte beurteilen',
    titleEn: 'Assess the stability of astronomical objects',
    descriptionDe: 'Die lernende Person kann bei einem astronomischen Objekt Gleichgewicht oder Ungleichgewicht zwischen Gravitation und Druckgradientkräften aus Gas-, Strahlungs- oder Entartungsdruck erklären und die Folgen veränderter Bedingungen für seine Stabilität qualitativ beurteilen.',
    descriptionEn: 'For an astronomical object, the learner can explain equilibrium or imbalance between gravity and pressure-gradient forces arising from gas, radiation, or degeneracy pressure and qualitatively assess how changed conditions affect its stability.',
    atomicityReason: 'Die Kräftebilanz und ihre qualitative Störungsanalyse bilden gemeinsam eine einzige Stabilitätsbeurteilung an einem gegebenen astronomischen Objekt.',
    memoryReason: 'Druckarten können begrifflich gestützt werden; die relevante Leistung ist die fallbezogene Kräftebilanz und Stabilitätsprognose.',
    visualizationNote: 'Das vorhandene Bild bleibt als Kräftegleichgewichts-Kontext geeignet; die Formulierung präzisiert Druckgradientkräfte statt eines pauschalen Drucks.',
  },
  {
    id: 'f06c581a-7157-584e-a692-99bcd613cff9',
    beforeStateDigest: '46db9ae60069bad25c14ea17623208653fe873c276569cdf2e7ec3648ccea76e',
    titleDe: 'Frequenzspektren von Tönen und Klängen analysieren',
    titleEn: 'Analyse frequency spectra of tones and complex sounds',
    descriptionDe: 'Die lernende Person kann Zeitdiagramme und Frequenzspektren von Tönen und Klängen miteinander verknüpfen, Grund- und Obertöne identifizieren und den Einfluss der Spektralanteile auf die Klangfarbe erklären.',
    descriptionEn: 'The learner can relate time-domain graphs and frequency spectra of tones and complex sounds, identify fundamental and overtone components, and explain how the spectral components affect timbre.',
    requires: ['e62e48bc-2387-4b2b-8d6f-7a06c8e7580e'],
    atomicityReason: 'Zeit- und Frequenzdarstellung, Komponentenidentifikation und Klangfarbendeutung sind verschiedene Zugänge zu derselben Spektralanalyse eines Signals.',
    memoryReason: 'Grundbegriffe können erinnert werden; das Interpretieren neuer Diagramm- und Spektrenpaare erfordert Repräsentationswechsel und Transfer.',
    visualizationNote: 'Für dieses präzisierte Spektrenziel ist derzeit kein Bild freigegeben; es wird kein stilfremdes Ersatzbild erzeugt.',
  },
  {
    id: '9678afc1-44ca-54fb-b280-29336d45a928',
    beforeStateDigest: '6fa04ec798af6192b7eefbbc6e4e491694d7959bbe03d36d53af937e54e0f266',
    titleDe: 'Richtungshören mit spektralen und binauralen Hinweisen untersuchen',
    titleEn: 'Investigate sound localisation using spectral and binaural cues',
    descriptionDe: 'Die lernende Person kann erklären, wie richtungsabhängige Filterung durch Ohrmuschel und Gehörgang sowie interaurale Laufzeit- und Pegeldifferenzen zur Schalllokalisation beitragen, Laufzeitdifferenzen für eine gegebene Richtung abschätzen und frequenzabhängige Grenzen der Hinweise beurteilen.',
    descriptionEn: 'The learner can explain how direction-dependent filtering by the pinna and ear canal and interaural time and level differences contribute to sound localisation, estimate a time difference for a given direction, and assess frequency-dependent limitations of these cues.',
    atomicityReason: 'Die verschiedenen Hinweise werden nicht als getrennte Hörziele geprüft, sondern als komplementäre Eingangsgrößen einer einzigen Schalllokalisationsanalyse.',
    memoryReason: 'Die Hinweisarten können benannt werden; ihre situationsabhängige Gewichtung, Abschätzung und Grenzbeurteilung erfordern physikalisches Verständnis.',
    visualizationNote: 'Für dieses Richtungshörziel ist derzeit kein Bild freigegeben; ein neues Bild wird nur bei späterem fachlich begründetem Bedarf erwogen.',
  },
  {
    id: 'c2e0fc31-27a2-5727-9025-a824db9150d2',
    beforeStateDigest: '2fa94a721115c91fb30162c8b032096d95a821bec72f534a69ddb046b0cb9d0d',
    titleDe: 'Axonsegmente als elektrische Ersatzschaltungen modellieren',
    titleEn: 'Model axon segments as equivalent electrical circuits',
    descriptionDe: 'Die lernende Person kann ein Axonsegment mit Membrankapazität sowie Membran- und Axialwiderstand als elektrische Ersatzschaltung modellieren, mehrere Segmente verknüpfen und begründen, welche passive Signalausbreitung das Modell erklärt und welche zusätzlichen spannungsabhängigen Elemente für aktive Leitung nötig sind.',
    descriptionEn: 'The learner can model an axon segment as an equivalent electrical circuit with membrane capacitance and membrane and axial resistance, connect multiple segments, and justify which passive signal propagation the model explains and which additional voltage-dependent elements are required for active conduction.',
    atomicityReason: 'Aufbau, Verkettung und Reichweitenbeurteilung gehören zur Modellbildung derselben segmentierten Ersatzschaltung; aktive Leitung wird nur als explizite Modellgrenze abgegrenzt.',
    memoryReason: 'Bauteilrollen können gestützt werden; der Aufbau und die Beurteilung einer neuen Ersatzschaltung verlangen Modellverständnis.',
    visualizationNote: 'Das vorhandene Ersatzschaltbild bleibt passend; die Beschreibung benennt seine passiven Aussagegrenzen nun ausdrücklich.',
  },
  {
    id: '8cdef591-6ddb-5151-8c74-a80be0271079',
    beforeStateDigest: '7a46916acc0c20d456b70c4dc80d1637ee7bd055fd7105597fb5e473691939f9',
    titleDe: 'Membran- und Axialwiderstand im passiven Axonmodell untersuchen',
    titleEn: 'Investigate membrane and axial resistance in a passive axon model',
    descriptionDe: 'Die lernende Person kann Potenzialverläufe in einem passiven Widerstandsleitermodell messen und mathematisch beschreiben sowie begründen, wie größere Membran- beziehungsweise Axialwiderstände die räumliche Abschwächung des Signals in unterschiedlicher Richtung beeinflussen.',
    descriptionEn: 'The learner can measure and mathematically describe potential profiles in a passive cable model and justify how larger membrane and axial resistances affect the spatial attenuation of the signal in different ways.',
    atomicityReason: 'Messung, mathematische Beschreibung und Parametervergleich beziehen sich auf ein einziges passives Kabelmodell und dieselbe Ausgangsgröße der räumlichen Abschwächung.',
    memoryReason: 'Die Wirkungsrichtungen müssen aus Stromwegen beziehungsweise Messdaten begründet werden und sind nicht zuverlässig durch isolierte Merksätze ersetzbar.',
    visualizationNote: 'Das vorhandene Modellbild bleibt fachlich passend; die Parameterwirkungen werden im Coaching genauer herausgearbeitet.',
  },
  {
    id: '41872413-497e-5b88-ac65-365ed7d9851f',
    beforeStateDigest: 'e0128333737419670ad1636b4af5bc784810b12ab805d60d2560bb5f3ec247fe',
    titleDe: 'Beugungsbegrenzte Winkelauflösung des Auges abschätzen',
    titleEn: 'Estimate the diffraction-limited angular resolution of the eye',
    descriptionDe: 'Die lernende Person kann die Fraunhofer-Beugung an einer Kreisblende nutzen, um aus Wellenlänge und Pupillendurchmesser die beugungsbegrenzte Winkelauflösung des Auges abzuschätzen, und diese ideale optische Grenze von biologischen Einflüssen auf die Sehschärfe unterscheiden.',
    descriptionEn: 'The learner can use Fraunhofer diffraction at a circular aperture to estimate the diffraction-limited angular resolution of the eye from wavelength and pupil diameter and distinguish this ideal optical limit from biological influences on visual acuity.',
    requires: ['709e688c-eb07-5f83-a506-82c9bfe0d89f'],
    atomicityReason: 'Berechnung und Grenzdeutung sind zwei Schritte derselben beugungsoptischen Abschätzung der Augenauflösung.',
    memoryReason: 'Das Rayleigh-Kriterium kann gestützt werden; Auswahl der Größen, Abschätzung und Abgrenzung biologischer Einflüsse verlangen Modellverständnis.',
    visualizationNote: 'Das vorhandene Beugungsbild bleibt geeignet; die Beschreibung korrigiert den relevanten Kreisblenden- und Winkelauflösungskontext.',
  },
  {
    id: '6d882aac-9658-5f0d-bf3d-9338f0143bbc',
    beforeStateDigest: 'cc531f2a143330edb312f06095e1e4ffb64f5e2915af1dab6bcbb4e4f684d065',
    titleDe: 'Auflösungsvermögen des Auges experimentell bestimmen',
    titleEn: 'Determine the resolving power of the eye experimentally',
    descriptionDe: 'Die lernende Person kann das Auflösungsvermögen des eigenen Auges mit einem sicheren Versuch und einem vorab festgelegten Trennkriterium bestimmen, das Ergebnis mit einer beugungsoptischen Abschätzung vergleichen und zufällige sowie systematische Messunsicherheiten diskutieren.',
    descriptionEn: "The learner can determine the resolving power of their own eye using a safe experiment and a pre-defined resolution criterion, compare the result with a diffraction-based estimate, and discuss random and systematic measurement uncertainties.",
    atomicityReason: 'Versuchsdefinition, Messwert, Modellvergleich und Unsicherheitsanalyse gehören zu derselben experimentellen Bestimmung einer Auflösungsgrenze.',
    memoryReason: 'Das Ziel verlangt eine sichere Messentscheidung und Unsicherheitsanalyse; ein Memory-Deck ersetzt diese experimentelle Kompetenz nicht.',
    visualizationNote: 'Das vorhandene Bild bleibt als Messkontext nutzbar; die sichere Durchführung und das Trennkriterium werden durch die Beschreibung verbindlich.',
  },
  {
    id: 'db47ac91-7bb0-5ba3-b39d-e2d6fc98396e',
    beforeStateDigest: '5d2e9334cef614b0a62d43aede5d90be60950f7e545bbe15c046ee52f00988a0',
    titleDe: 'Ruhepotenzial an einer selektiv permeablen Membran modellieren',
    titleEn: 'Model the resting potential across a selectively permeable membrane',
    descriptionDe: 'Die lernende Person kann das Ruhepotenzial als Gleichgewicht zwischen konzentrationsgetriebener Diffusion, elektrischer Gegenwirkung und selektiver Membranpermeabilität modellieren und aktive Transportprozesse von ihrer langfristigen Rolle bei der Erhaltung der Konzentrationsgradienten abgrenzen.',
    descriptionEn: 'The learner can model the resting potential as an equilibrium between concentration-driven diffusion, electrical opposition, and selective membrane permeability and distinguish active transport processes by their long-term role in maintaining the concentration gradients.',
    atomicityReason: 'Diffusion und elektrisches Gegenfeld bilden gemeinsam das elektrochemische Gleichgewicht; aktive Transporte werden nur korrekt als Bedingung seiner langfristigen Aufrechterhaltung abgegrenzt.',
    memoryReason: 'Ionengradienten können gestützt werden; das Erklären des Gleichgewichts und der unterschiedlichen Rollen passiver und aktiver Prozesse erfordert Modellverständnis.',
    visualizationNote: 'Für dieses Ziel ist derzeit kein Bild freigegeben; es wird kein Ersatzbild erzeugt.',
  },
  {
    id: 'd67502e3-5e0a-595b-a24b-65b1c40de36e',
    beforeStateDigest: 'debc904301ceb324d31033c72b70b760c3c4f878c436124889b58b4d5e0d0e3c',
    titleDe: 'Bewegungen mit Videoanalyse untersuchen',
    titleEn: 'Investigate motion using video analysis',
    descriptionDe: 'Die lernende Person kann ein Bewegungsvideo räumlich und zeitlich kalibrieren, daraus Orts-Zeit-Daten sowie s(t)- und v(t)-Diagramme gewinnen und Modelle einer gleichförmigen oder geworfenen Bewegung unter Berücksichtigung der Messunsicherheit prüfen.',
    descriptionEn: 'The learner can calibrate a motion video spatially and temporally, obtain position-time data and s(t) and v(t) graphs from it, and test models of uniform or projectile motion while accounting for measurement uncertainty.',
    atomicityReason: 'Kalibrierung, Datenerfassung, Diagrammerzeugung und Modellprüfung sind aufeinanderfolgende Schritte eines einzigen Videoanalyseverfahrens.',
    memoryReason: 'Ein vorhandenes Methodendeck kann Arbeitsschritte absichern; die Auswertung eines neuen Videos und Modellprüfung bleiben Transferleistungen.',
    visualizationNote: 'Das vorhandene Videoanalysebild bleibt passend; die Beschreibung macht Kalibrierung, Diagramme und Unsicherheit prüfbar.',
  },
  {
    id: 'bbee4c52-4e95-5529-990f-706aa99316a3',
    beforeStateDigest: '9c30e0b9a7243ab382ea6a49fdb62e28cfe1085d0d36acafb8d57a2bd65268af',
    titleDe: 'Elektrische Stromstärke als Ladungsrate deuten',
    titleEn: 'Interpret electric current as a rate of charge transfer',
    descriptionDe: 'Die lernende Person kann die mittlere elektrische Stromstärke als durch einen Querschnitt transportierte Ladung pro Zeitintervall mit I = ΔQ/Δt deuten, Berechnungen durchführen und den Einheitenzusammenhang 1 A = 1 C/s erklären.',
    descriptionEn: 'The learner can interpret average electric current as the charge transported through a cross-section per time interval using I = ΔQ/Δt, perform calculations, and explain the unit relation 1 A = 1 C/s.',
    atomicityReason: 'Deutung, Berechnung und Einheitenbezug sind gekoppelte Darstellungen derselben physikalischen Größe der mittleren Stromstärke.',
    memoryReason: 'Formel und Einheit können erinnert werden; die relevante Kompetenz ist ihre Deutung und Anwendung auf neue Ladungstransporte.',
    visualizationNote: 'Das vorhandene Bild bleibt als Ladungstransport-Modell geeignet; die Beschreibung präzisiert Mittelwert und Querschnitt.',
  },
  {
    id: '98e42cda-9e5d-5910-b2c0-3e631fd20c78',
    beforeStateDigest: '949715c56ba021bf31d1a0b8700662d2ac383d723a45087232c8a4f3aeacbfa3',
    titleDe: 'Radialsymmetrische elektrische Felder beschreiben',
    titleEn: 'Describe radially symmetric electric fields',
    descriptionDe: 'Die lernende Person kann das elektrische Feld einer Punktladung beziehungsweise den Außenraum einer kugelsymmetrischen Ladungsverteilung durch radiale Feldrichtung und Feldliniendichte beschreiben und die Abnahme der Feldstärke mit E ∝ 1/r² qualitativ begründen.',
    descriptionEn: 'The learner can describe the electric field of a point charge or the exterior of a spherically symmetric charge distribution in terms of radial field direction and field-line density and qualitatively justify the decrease in field strength as E ∝ 1/r².',
    atomicityReason: 'Feldrichtung, Liniendichte und Abstandsabhängigkeit sind zusammengehörige Darstellungen desselben radialsymmetrischen Außenfelds.',
    memoryReason: 'Die 1/r²-Beziehung kann gestützt werden; Feldbild und qualitative Begründung müssen auf neue Situationen übertragen werden.',
    visualizationNote: 'Das vorhandene radiale Feldlinienbild bleibt geeignet; die neue Beschreibung begrenzt die Aussage korrekt auf Punktladung beziehungsweise Außenraum.',
  },
  {
    id: 'f3de5922-dd45-4fb6-87c1-525d1952dd89',
    beforeStateDigest: '8971d447dcbcbb3e0f3163a3757cf4b9c7fd0d7b48e27b15fed1f18922ffc263',
    titleDe: 'Feldlinienbilder von Ladungs- und Leiteranordnungen deuten',
    titleEn: 'Interpret field-line diagrams of charge and conductor configurations',
    descriptionDe: 'Die lernende Person kann Feldlinienbilder eines elektrischen Dipols sowie von Leitern im elektrostatischen Gleichgewicht anhand von Tangentenrichtung und relativer Liniendichte deuten und daraus Feldfreiheit im Inneren eines Faraday-Käfigs sowie lokale Feldverstärkung an Spitzen qualitativ erklären.',
    descriptionEn: 'The learner can interpret field-line diagrams of an electric dipole and of conductors in electrostatic equilibrium using tangent direction and relative line density and thereby qualitatively explain the absence of a field inside a Faraday cage and local field enhancement at sharp points.',
    requires: ['4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe'],
    atomicityReason: 'Die unterschiedlichen Anordnungen sind Transferfälle derselben Feldlinien-Deutung über Richtung, relative Stärke und Leiter-Randbedingungen.',
    memoryReason: 'Feldlinienregeln können gestützt werden; die Deutung wechselnder Ladungs- und Leitergeometrien verlangt räumliches Transferverständnis.',
    visualizationNote: 'Das vorhandene Überblicksbild zeigt die relevanten Transferfälle und bleibt unverändert; der Coach bindet sie nun an ein gemeinsames Deutungsprinzip.',
  },
]

const absolute = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8')
  .split(/\r?\n/u).filter((line) => line.trim() !== '').map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string => `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const digest = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const normalize = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value) ?? 'null'
}
const reviewFingerprint = (goal: AdjudicationGoal, ruleVersion: string): string => `sha256:${digest(stableJson({
  ruleVersion,
  goalId: goal.id,
  shortKey: goal.shortKey ?? '',
  title: normalize(goal.title),
  titleEn: normalize(goal.titleEn),
  description: normalize(goal.description),
  descriptionEn: normalize(goal.descriptionEn),
  phase: normalize(goal.dimensionTags?.phase),
  area: normalize(goal.dimensionTags?.area),
  topicCode: normalize(goal.dimensionTags?.topicCode),
  nodeKind: normalize(goal.nodeKind),
}))}`
const sameArray = (left: unknown, right: unknown): boolean => JSON.stringify(left) === JSON.stringify(right)
const goalStateDigest = (goal: AdjudicationGoal): string => digest(JSON.stringify([
  goal.title,
  goal.titleEn,
  goal.description,
  goal.descriptionEn,
  goal.requires ?? [],
  goal.semanticKind ?? null,
  goal.tags ?? [],
  goal.dimensionTags?.demandLevel ?? null,
]))
const isAfter = (goal: AdjudicationGoal, revision: Revision): boolean => (
  goal.title === revision.titleDe
  && goal.titleEn === revision.titleEn
  && goal.description === revision.descriptionDe
  && goal.descriptionEn === revision.descriptionEn
  && (revision.requires === undefined || sameArray(goal.requires ?? [], revision.requires))
  && (revision.semanticKind === undefined || goal.semanticKind === revision.semanticKind)
  && (revision.tags === undefined || sameArray(goal.tags ?? [], revision.tags))
  && (revision.demandLevel === undefined || goal.dimensionTags?.demandLevel === revision.demandLevel)
)

const canonical = readJson(paths.canonical)
if (canonical.landscapeId !== '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a') {
  throw new Error(`Unexpected canonical Physics landscape ${String(canonical.landscapeId)}`)
}
const goals = canonical.goals as AdjudicationGoal[]
const goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
if (goalById.size !== goals.length) throw new Error('Duplicate canonical Physics goal IDs')

for (const revision of revisions) {
  const goal = goalById.get(revision.id)
  if (!goal) throw new Error(`${revision.id}: missing canonical goal`)
  if (goal.type !== 'atomic' || !sameArray(goal.contains ?? [], [])) {
    throw new Error(`${revision.id}: expected retained atomic goal`)
  }
  const currentStateDigest = goalStateDigest(goal)
  if (
    currentStateDigest !== revision.beforeStateDigest
    && currentStateDigest !== revision.alternateBeforeStateDigest
    && !isAfter(goal, revision)
  ) {
    throw new Error(`${revision.id}: canonical goal is outside bounded before/after state`)
  }
  Object.assign(goal, {
    title: revision.titleDe,
    titleEn: revision.titleEn,
    description: revision.descriptionDe,
    descriptionEn: revision.descriptionEn,
  })
  if (revision.requires !== undefined) goal.requires = [...revision.requires]
  if (revision.semanticKind !== undefined) goal.semanticKind = revision.semanticKind
  if (revision.tags !== undefined) goal.tags = [...revision.tags]
  if (revision.demandLevel !== undefined) goal.dimensionTags.demandLevel = revision.demandLevel

  const visualizationLinks = ((goal.resourceLinks as JsonRecord[] | undefined) ?? [])
    .filter((link) => link.type === 'goal-visualization')
  if (visualizationLinks.length > 1) throw new Error(`${revision.id}: multiple visualization links`)
  if (visualizationLinks.length === 1) Object.assign(visualizationLinks[0], {
    title: `Visualisierung: ${revision.titleDe}`,
    description: `Visualisierung zum Lernziel: ${revision.titleDe}.`,
    altText: `Didaktische Visualisierung zum Lernziel "${revision.titleDe}". ${revision.descriptionDe}`,
  })
}

const semanticKinds = readJson(paths.semanticKinds) as SemanticKindLedger
const semanticDecisions = semanticKinds.decisions as JsonRecord[]
const semanticById = new Map(semanticDecisions.map((decision) => [String(decision.goalId), decision]))
for (const revision of revisions) {
  const goal = goalById.get(revision.id)!
  const decision = semanticById.get(revision.id)
  if (!decision || decision.decisionStatus !== 'authoritative') {
    throw new Error(`${revision.id}: missing authoritative semantic-kind decision`)
  }
  if (revision.id === orientationId) {
    decision.semanticKind = 'orientation'
    decision.decisionBasis = 'reviewed-current-pilot-orientation'
  } else if (decision.semanticKind !== 'curricularAtomic') {
    throw new Error(`${revision.id}: revised content goal must remain curricularAtomic`)
  }
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}
const kindCounts = new Map<string, number>()
for (const decision of semanticDecisions) {
  kindCounts.set(String(decision.semanticKind), (kindCounts.get(String(decision.semanticKind)) ?? 0) + 1)
}
for (const key of Object.keys(semanticKinds.counts as JsonRecord)) {
  if (key !== 'total') semanticKinds.counts[key] = kindCounts.get(key) ?? 0
}
semanticKinds.counts.total = semanticDecisions.length

let atomicity = readJsonl(paths.atomicity)
let memory = readJsonl(paths.memory)
const atomicityById = new Map(atomicity.map((record) => [String(record.goalId), record]))
const memoryById = new Map(memory.map((record) => [String(record.goalId), record]))
for (const revision of revisions) {
  if (revision.id === orientationId) continue
  const goal = goalById.get(revision.id)!
  const atomicityRecord = atomicityById.get(revision.id)
  if (!atomicityRecord) throw new Error(`${revision.id}: missing atomicity review`)
  Object.assign(atomicityRecord, {
    fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
    status: 'atomic',
    semanticAtomic: true,
    reviewedAt,
    reviewer,
    reason: revision.atomicityReason,
    suggestedSplit: [],
  })
  const memoryRecord = memoryById.get(revision.id)
  if (!memoryRecord || !['no_memory_needed', 'memory_required'].includes(String(memoryRecord.status))) {
    throw new Error(`${revision.id}: missing decided memory review`)
  }
  Object.assign(memoryRecord, {
    fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
    reviewedAt,
    reviewer,
    reason: revision.memoryReason,
  })
}
atomicity = atomicity.filter((record) => record.goalId !== orientationId)
memory = memory.filter((record) => record.goalId !== orientationId)

const visualizationQa = readJson(paths.visualizationQa)
const visualizationById = new Map((visualizationQa.records as JsonRecord[])
  .map((record) => [String(record.goalId), record]))
let retainedVisualizationCount = 0
for (const revision of revisions) {
  const record = visualizationById.get(revision.id)
  if (!record || record.visualizationState !== 'available') continue
  const canonicalAsset = readFileSync(absolute(String(record.canonicalAssetPath)))
  const publicAsset = readFileSync(absolute(String(record.publicAssetPath)))
  if (!canonicalAsset.equals(publicAsset) || `sha256:${digest(canonicalAsset)}` !== record.assetSha256) {
    throw new Error(`${revision.id}: retained visualization bytes or digest drifted`)
  }
  retainedVisualizationCount += 1
}

const outputs = new Map<string, string>([
  [paths.canonical, serializeJson(canonical)],
  [paths.semanticKinds, serializeJson(semanticKinds)],
  [paths.atomicity, serializeJsonl(atomicity)],
  [paths.memory, serializeJsonl(memory)],
])
const changed = [...outputs].filter(([path, content]) => readFileSync(absolute(path), 'utf8') !== content)
if (!writeMode && changed.length > 0) {
  throw new Error(`Physics B033 adjudication is not materialized: ${changed.map(([path]) => path).join(', ')}`)
}
if (writeMode) changed.forEach(([path, content]) => writeFileSync(absolute(path), content, 'utf8'))

console.log(
  `CHECK apply_physics_batch_033_adjudication ${writeMode ? 'WRITE' : 'PASS'} revisions=${revisions.length} orientation=1 retainedVisualizations=${retainedVisualizationCount} changed=${changed.length}`,
)
