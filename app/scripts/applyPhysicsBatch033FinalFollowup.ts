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
const reviewer = 'codex-physics-b033-final-followup-adjudication-2026-09-05'
const orientationId = '70b358bf-da6d-53ba-8393-51d5c2365b04'

const revisions: Revision[] = [
  {
    id: '7badac4d-2874-5b3a-87e8-bf8f4440b2a6',
    beforeStateDigest: '1f011a8ab167af75d780299e5e4057b486a7993571e84b06043301007e54ca19',
    titleDe: 'Leiter, Nichtleiter und Halbleiter',
    titleEn: 'Conductors, Insulators, and Semiconductors',
    descriptionDe: 'Die lernende Person kann Leiter, Nichtleiter und Halbleiter anhand ihrer typischen elektrischen Leitfähigkeit unter vergleichbaren Bedingungen unterscheiden und Beispiele aus Technik und Alltag begründet zuordnen.',
    descriptionEn: 'The learner can distinguish conductors, insulators, and semiconductors by their typical electrical conductivity under comparable conditions and justify the classification of examples from technology and everyday life.',
    atomicityReason: 'Die drei Materialklassen sind Vergleichsfälle einer einzigen bedingungsbewussten Leitfähigkeitsklassifikation; die begründete Zuordnung prüft diese Kompetenz an neuen Beispielen.',
    memoryReason: 'Beispielnamen allein genügen nicht; die Klassifikation muss aus Leitfähigkeitsdaten und den jeweiligen Bedingungen begründet werden.',
    visualizationNote: 'Eine vorhandene Visualisierung bleibt unverändert; Bedingungen und Begründung werden im Coaching explizit geprüft.',
  },
  {
    id: '8cdef591-6ddb-5151-8c74-a80be0271079',
    beforeStateDigest: 'c875ace2918d23d7d476493ce6f255fc151ac1f862fea8a3546f156166401ebf',
    titleDe: 'Membran- und Axialwiderstand im passiven Axonmodell untersuchen',
    titleEn: 'Investigate membrane and axial resistance in a passive axon model',
    descriptionDe: 'Die lernende Person kann Potenzialverläufe in einem passiven Widerstandsleitermodell messen und mathematisch beschreiben sowie begründen, warum ein größerer Membranwiderstand die räumliche Abschwächung verringert, ein größerer Axialwiderstand sie dagegen verstärkt.',
    descriptionEn: 'The learner can measure and mathematically describe potential profiles in a passive cable model and justify why greater membrane resistance reduces spatial attenuation whereas greater axial resistance increases it.',
    atomicityReason: 'Messung, mathematische Beschreibung und Parametervergleich beziehen sich auf dasselbe passive Kabelmodell und dieselbe Zielgröße der räumlichen Abschwächung.',
    memoryReason: 'Die entgegengesetzten Wirkungen müssen aus Leck- und Längsstromwegen beziehungsweise Messdaten begründet werden und sind kein isolierter Merksatz.',
    visualizationNote: 'Das vorhandene Modellbild bleibt unverändert; die nun eindeutigen Wirkungsrichtungen werden fachlich geprüft.',
  },
  {
    id: 'db47ac91-7bb0-5ba3-b39d-e2d6fc98396e',
    beforeStateDigest: 'ef0764214a2d28a8b3ca61e2a6f87fac9535308d55af69c651fb8618f28ff322',
    titleDe: 'Ruhepotenzial an einer selektiv permeablen Membran modellieren',
    titleEn: 'Model the resting potential across a selectively permeable membrane',
    descriptionDe: 'Die lernende Person kann das Ruhepotenzial als Gleichgewicht zwischen konzentrationsgetriebener Diffusion, elektrischer Gegenwirkung und selektiver Membranpermeabilität modellieren und erläutern, dass aktive Transportprozesse die Konzentrationsgradienten langfristig aufrechterhalten, aber nicht Bestandteil dieses passiven Gleichgewichtsmodells sind.',
    descriptionEn: 'The learner can model the resting potential as an equilibrium between concentration-driven diffusion, electrical opposition, and selective membrane permeability and explain that active transport processes maintain the concentration gradients over time but are not part of this passive equilibrium model.',
    atomicityReason: 'Passive Gleichgewichtsbildung und die Abgrenzung ihrer langfristigen Randbedingung bilden eine einzige Modellierungs- und Modellgrenzenkompetenz.',
    memoryReason: 'Ionengradienten können gestützt werden; Gleichgewicht und die zeitlich getrennten Rollen passiver und aktiver Prozesse müssen modellbezogen erklärt werden.',
    visualizationNote: 'Für dieses Ziel wird kein neues Bild erzeugt; die Präzisierung betrifft ausschließlich die Modellgrenze.',
  },
  {
    id: '1730c01d-8c85-57df-b031-c11e2a0511b1',
    beforeStateDigest: 'a60b78b1a8b19917c8d865cec0a796318e8fffadea6a8b652c5d5844438b3601',
    titleDe: 'Arbeit, Spannung und Potenzial im E-Feld',
    titleEn: 'Work, Voltage, and Potential in Electric Fields',
    descriptionDe: 'Die lernende Person kann die Spannung zwischen zwei Punkten als Potenzialdifferenz und – bei offengelegter Vorzeichenkonvention – über Arbeit beziehungsweise Änderung der potenziellen Energie pro Ladung deuten und im homogenen elektrischen Feld für einen Abstand parallel zu den Feldlinien den Betragszusammenhang |U| = E·d anwenden.',
    descriptionEn: 'The learner can interpret the voltage between two points as a potential difference and, with an explicit sign convention, in terms of work or change in potential energy per unit charge, and apply the magnitude relation |U| = E·d in a uniform electric field for a separation parallel to the field lines.',
    atomicityReason: 'Potenzialdifferenz, Energie- beziehungsweise Arbeitsdeutung und der homogene Parallelfall sind konsistente Darstellungen derselben Spannungsbeziehung.',
    memoryReason: 'Formeln können gestützt werden; Vorzeichenkonvention, Geometriebedingung und physikalische Deutung müssen an neuen Feldern eigenständig gewählt werden.',
    visualizationNote: 'Eine vorhandene Visualisierung bleibt unverändert; Betrag, Vorzeichenkonvention und Parallelitätsbedingung werden durch den Text geklärt.',
  },
  {
    id: 'b9fcbad4-a855-54b7-8017-4caac1e2ffb7',
    beforeStateDigest: 'b2cd005d1ec022349aadd9b7eb199b2dbd1096b8d72a7677730cfecde50640c5',
    titleDe: 'Lokalität und Verschränkung einordnen',
    titleEn: 'Classify Locality and Entanglement',
    descriptionDe: 'Die lernende Person kann Verschränkung als nichtklassische Korrelation zwischen räumlich getrennten Messungen erklären, erläutern, wie entsprechende Experimente lokale realistische Modelle begrenzen, und dies von überlichtschneller Signalübertragung unterscheiden.',
    descriptionEn: 'The learner can explain entanglement as a non-classical correlation between spatially separated measurements, describe how corresponding experiments constrain local realistic models, and distinguish this from faster-than-light signalling.',
    atomicityReason: 'Korrelation, Grenze lokal-realistischer Modelle und No-Signalling sind aufeinander bezogene Teile einer einzigen fachlich kontrollierten Einordnung von Lokalität und Verschränkung.',
    memoryReason: 'Begriffe können erinnert werden; die Trennung von gemeinsamer Statistik, Modellgrenze und Signalübertragung verlangt Verständnis und Transfer.',
    visualizationNote: 'Es wird kein neues Bild erzeugt; die Korrektur operationalisiert das bislang zu allgemeine Ziel.',
  },
  {
    id: 'bdaa56ad-6257-58a3-a633-8a6339f72f09',
    beforeStateDigest: 'c6e4571a8a267fe2f03fc92ee9f78c589d0cfbefc0d24ed7567b3161a6b059f2',
    titleDe: 'Innenohr mit Resonanzmodellen erklären',
    titleEn: 'Explain the inner ear using resonance models',
    descriptionDe: 'Die lernende Person kann die frequenzabhängige Schwingungsantwort der Basilarmembran mit mechanischen Resonanzmodellen erklären, den Ort des Antwortmaximums der Frequenz und die Schwingungsamplitude der mechanischen Antwortstärke zuordnen und das Modell von der nachfolgenden sensorischen und neuronalen Wahrnehmung abgrenzen.',
    descriptionEn: 'The learner can use mechanical resonance models to explain the frequency-dependent vibrational response of the basilar membrane, relate the location of the response maximum to frequency and the vibration amplitude to mechanical response strength, and distinguish the model from subsequent sensory and neural perception.',
    atomicityReason: 'Orts- und Amplitudenantwort sind zwei Messmerkmale desselben mechanischen Resonanzmodells; die Wahrnehmung wird nur als Modellgrenze abgegrenzt.',
    memoryReason: 'Anatomische Begriffe können gestützt werden; Frequenz-Orts-Zuordnung, Amplitudendeutung und Modellgrenze müssen an neuen Antwortprofilen erklärt werden.',
    visualizationNote: 'Das vorhandene lockere Ohrbild bleibt unverändert; die Modellgrenze verhindert eine Überdeutung der mechanischen Darstellung.',
  },
  {
    id: 'e19fccd7-6a35-5c9e-86e1-dcca76481e9c',
    beforeStateDigest: 'b60a425aeac9a415d5d9c4e3d7274aff727d654783d8b25242f7b0bef1c6cb97',
    titleDe: 'Elektrische Dipolfelder mit dem EKG verknüpfen',
    titleEn: 'Relate electric dipole fields to ECG signals',
    descriptionDe: 'Die lernende Person kann elektrische Potenziale und Äquipotentiallinien eines Dipolfeldes experimentell oder in einer Simulation untersuchen und erklären, wie ein zeitlich veränderliches Dipolmodell des Herzens mit den zwischen Oberflächenelektroden gemessenen EKG-Potenzialdifferenzen zusammenhängt und wo die Grenzen dieser Näherung liegen.',
    descriptionEn: 'The learner can investigate electric potentials and equipotential lines of a dipole field experimentally or in a simulation and explain how a time-varying dipole model of the heart relates to ECG potential differences measured between surface electrodes and where this approximation is limited.',
    atomicityReason: 'Dipolfelduntersuchung und EKG-Verknüpfung bilden eine einzige Modelltransferleistung von Potenzialdifferenzen des Modells zur Messung samt expliziter Grenze.',
    memoryReason: 'Dipolbegriffe können gestützt werden; Elektrodenvergleich, zeitliche Modellübertragung und Grenzbeurteilung erfordern eigenständiges Verständnis.',
    visualizationNote: 'Eine vorhandene Visualisierung bleibt unverändert; Übersetzung und Modellgrenze werden im Text korrigiert.',
  },
  {
    id: '3aaac6ad-948e-502a-9d49-ce40db0f2ca3',
    beforeStateDigest: '48a57148f71f64a361951e3da5572c864a2e8377b8f00e03f5015342ceabad9d',
    titleDe: 'Passive Signalleitung mit Kondensator-Ladekurven vergleichen',
    titleEn: 'Compare passive signal conduction with capacitor charging curves',
    descriptionDe: 'Die lernende Person kann den lokalen zeitlichen Signalaufbau eines passiven Axonsegments mit einer Kondensator-Lade- oder Entladekurve vergleichen, durch ein exponentielles RC-Modell mathematisch beschreiben und von der zusätzlichen räumlichen Abschwächung gekoppelter Segmente abgrenzen.',
    descriptionEn: 'The learner can compare the local time course of a signal in a passive axon segment with a capacitor charging or discharging curve, describe it mathematically using an exponential RC model, and distinguish it from the additional spatial attenuation across coupled segments.',
    atomicityReason: 'Vergleich, Exponentialmodell und Abgrenzung beziehen sich auf den lokalen Zeitverlauf desselben passiven Axonsegments.',
    memoryReason: 'RC-Formen können gestützt werden; Parameterdeutung und Trennung von lokalem Zeitverlauf und räumlicher Abschwächung verlangen Modellverständnis.',
    visualizationNote: 'Eine vorhandene Visualisierung bleibt unverändert; die Revision korrigiert Bilingualität und die zeitlich-räumliche Modellgrenze.',
  },
  {
    id: '8fbae050-c5c9-52b6-9983-2c366e9c8ade',
    beforeStateDigest: '0f3b8c227df9fd92ca517804deca77a3b7b1e8a4e946d09fd4269ed026d0a8ae',
    titleDe: 'Saltatorische Signalleitung aus aktiver Regeneration und Membraneigenschaften erklären',
    titleEn: 'Explain saltatory conduction through active regeneration and membrane properties',
    descriptionDe: 'Die lernende Person kann erklären, wie spannungsabhängige Natrium- und Kaliumkanäle das Aktionspotenzial an Ranvier-Schnürringen regenerieren und wie die elektrischen Eigenschaften der myelinisierten Membran die schnelle passive Ausbreitung zwischen den Schnürringen ermöglichen, und dabei passive Ausbreitung von aktiver Regeneration unterscheiden.',
    descriptionEn: 'The learner can explain how voltage-gated sodium and potassium channels regenerate the action potential at nodes of Ranvier and how the electrical properties of the myelinated membrane enable rapid passive spread between the nodes, while distinguishing passive spread from active regeneration.',
    atomicityReason: 'Das Ziel prüft jetzt einen einzigen kausalen Mechanismus der saltatorischen Leitung: schnelle passive Ausbreitung zwischen Knoten und aktive Regeneration an den Knoten.',
    memoryReason: 'Kanalnamen können gestützt werden; das Zusammenspiel von Myelin, passiver Ausbreitung und aktiver Regeneration muss an veränderten Bedingungen erklärt werden.',
    visualizationNote: 'Eine vorhandene Visualisierung bleibt unverändert; Titel und Beschreibung bündeln die zuvor missverständliche Doppelkompetenz zu einem Mechanismus.',
  },
  {
    id: '9f59a088-3939-59e9-821d-167fadfda782',
    beforeStateDigest: 'a7fc20e09c0b4cae16fed2320506e34b46dc978eed819081b0581a98f1af9386',
    titleDe: 'Kondensator und Feld im Plattenkondensator',
    titleEn: 'Capacitors and the Field in a Parallel-Plate Capacitor',
    descriptionDe: 'Die lernende Person kann das Feld eines idealisierten Plattenkondensators fern von Randeffekten als homogen beschreiben, seine Feldstärke bestimmen und bei vollständiger Füllung mit einem homogenen Dielektrikum die Kapazität mit $C=\\varepsilon_0\\varepsilon_r\\frac{A}{d}$ berechnen sowie ihre Abhängigkeit von Geometrie und Dielektrikum erläutern.',
    descriptionEn: 'The learner can describe the field of an idealized parallel-plate capacitor away from edge effects as uniform, determine its field strength, and, when it is completely filled with a homogeneous dielectric, calculate the capacitance using $C=\\varepsilon_0\\varepsilon_r\\frac{A}{d}$ and explain its dependence on geometry and dielectric.',
    atomicityReason: 'Feldmodell, Feldstärkebestimmung und Kapazitätsabhängigkeit beziehen sich auf denselben idealisierten Plattenkondensator; die Rand- und Füllbedingungen begrenzen die gemeinsame Modellkompetenz.',
    memoryReason: 'Die Formeln können gestützt werden; Homogenitätsbereich, vollständige homogene Füllung und Parameterdeutung müssen an neuen Kondensatorfällen begründet werden.',
    visualizationNote: 'Das vorhandene Kondensatorbild bleibt unverändert; die präzisierten Idealbedingungen werden im Coaching und in der Evidenzprüfung verbindlich.',
  },
  {
    id: '2622bef1-bdbc-504e-b468-b600b2ca3ed8',
    beforeStateDigest: 'ff845e6aac9ac3b967d247e22681ff1aae8328f8401c9d06ba415210357a285c',
    titleDe: 'Elektrisches Potenzial berechnen',
    titleEn: 'Calculate Electric Potential',
    descriptionDe: 'Die lernende Person kann in vorgegebenen elektrischen Feldern bei festgelegtem Potenzialnullpunkt Potenziale an Punkten bestimmen, Spannungen als Potenzialdifferenzen berechnen sowie Äquipotentiallinien konstruieren und zur Darstellung und Auswertung der Felder deuten.',
    descriptionEn: 'The learner can determine potentials at points in given electric fields relative to a specified zero of potential, calculate voltages as potential differences, and construct and interpret equipotential lines to represent and analyze the fields.',
    atomicityReason: 'Punktpotenzial, Potenzialdifferenz und Äquipotentiallinien sind rechnerische und grafische Darstellungen desselben skalaren Potenzialfeldes bei explizitem Referenzniveau.',
    memoryReason: 'Begriffe können gestützt werden; Referenzwahl, Differenzbildung und die eigenständige Konstruktion und Deutung neuer Äquipotentialbilder verlangen Verständnis.',
    visualizationNote: 'Das vorhandene Bild bleibt unverändert; Referenzniveau und Unterschied zwischen Potenzial und Spannung werden im Text korrigiert.',
  },
  {
    id: '09e058e9-f3ed-5046-b0e9-495b694bf2a1',
    beforeStateDigest: '15972c45f9914daa4c7087dd7d43cf0aba6abfd31de3878e2772ae8413f71236',
    titleDe: 'Physikalische Prinzipien des Corti-Organs aus Quellen erschließen',
    titleEn: 'Derive Physical Principles of the Organ of Corti from Sources',
    descriptionDe: 'Die lernende Person kann aus vorgegebenen, belegten Quellen nachvollziehen, wie die Relativbewegung von Basilar- und Tektorialmembran die Stereozilien der Haarzellen auslenkt und dadurch mechanische Schwingungen in elektrische Rezeptorsignale überführt werden, die Grenzen dieser vereinfachten Wirkungskette kennzeichnen und die Erklärung fachsprachlich strukturiert präsentieren.',
    descriptionEn: 'Using provided, cited sources, the learner can explain how relative motion of the basilar and tectorial membranes deflects hair-cell stereocilia and thereby converts mechanical vibrations into electrical receptor signals, identify the limits of this simplified causal chain, and present the explanation in a structured form using subject-specific language.',
    atomicityReason: 'Quellenauswertung, Modellgrenze und Präsentation dienen einer einzigen kausalen Erklärung der mechanisch-elektrischen Transduktion im Corti-Organ.',
    memoryReason: 'Anatomische Begriffe können gestützt werden; die kausale Wirkungskette, ihre Quellenbindung und ihre Modellgrenze müssen an neuem Material eigenständig erklärt werden.',
    visualizationNote: 'Das vorhandene Nano-Banana-Pro-Bild bleibt unverändert; Titel, Übersetzung und kausale Zielbeschreibung werden an seine geprüfte Wirkungskette angepasst.',
  },
  {
    id: 'db47ac91-7bb0-5ba3-b39d-e2d6fc98396e',
    beforeStateDigest: 'ca720c65b3cea103bee7bce886a0e5b366f5f09ef9d62540dd22900f9a3e8075',
    titleDe: 'Ruhepotenzial an einer selektiv permeablen Membran modellieren',
    titleEn: 'Model the resting potential across a selectively permeable membrane',
    descriptionDe: 'Die lernende Person kann das Ruhepotenzial in einem vereinfachten passiven Membranmodell als Ergebnis des Zusammenspiels von konzentrationsgetriebener Diffusion, elektrischer Gegenwirkung und selektiver Membranpermeabilität modellieren und erläutern, dass aktive Transportprozesse die Konzentrationsgradienten langfristig aufrechterhalten, aber nicht Bestandteil dieses passiven Modells sind.',
    descriptionEn: 'The learner can model the resting potential in a simplified passive membrane model as the result of the interplay among concentration-driven diffusion, electrical opposition, and selective membrane permeability and explain that active transport processes maintain the concentration gradients over time but are not part of this passive model.',
    atomicityReason: 'Das passive Zusammenspiel und die Abgrenzung seiner langfristigen aktiven Randbedingung bilden eine einzige Modellierungs- und Modellgrenzenkompetenz.',
    memoryReason: 'Ionengradienten können gestützt werden; das passive Zusammenspiel und die zeitlich getrennte Rolle aktiver Transporte müssen modellbezogen erklärt werden.',
    visualizationNote: 'Für dieses Ziel wird kein neues Bild erzeugt; die Präzisierung verhindert eine irreführende Gleichgewichtsaussage.',
  },
  {
    id: '0b08aed8-3c0f-5b38-844c-1bb363abbf68',
    beforeStateDigest: '7b27b4b5aa91b9516d20ac55674e1d0a3d1ff096e95502370cbc533dfd2d786f',
    titleDe: 'Biologische und künstliche neuronale Verschaltungen mit einem gemeinsamen Modell vergleichen',
    titleEn: 'Compare Biological and Artificial Neural Circuits Using a Shared Model',
    descriptionDe: 'Die lernende Person kann in gegebenen Diagrammen erregende und hemmende Verknüpfungen als gewichtete Beiträge zu einer Ausgabe deuten, dieses Verschaltungsmodell auf eine optische Täuschung und ein einfaches künstliches neuronales Netz übertragen und die Grenzen der Analogie benennen.',
    descriptionEn: 'The learner can interpret excitatory and inhibitory connections in given diagrams as weighted contributions to an output, transfer this circuit model to an optical illusion and a simple artificial neural network, and identify the limits of the analogy.',
    atomicityReason: 'Diagrammdeutung, optische Täuschung und künstliches Netz sind hier zwei Transferfälle desselben ausdrücklich begrenzten Verschaltungsmodells; die allgemeine Quellen- und Bewertungskompetenz bleibt in separaten Voraussetzungen.',
    memoryReason: 'Begriffe können gestützt werden; Gewichtung, Übertragung auf neue Diagramme und die Grenze zwischen biologischem und künstlichem Modell verlangen Verständnis.',
    visualizationNote: 'Das vorhandene dreiteilige Nano-Banana-Pro-Bild bleibt unverändert und passt zur eingegrenzten Modellvergleichskompetenz.',
  },
  {
    id: '0b4f2020-8486-5372-9cb9-6e59f698ac2d',
    beforeStateDigest: '91f7a6f45ffdd68b8d612c5bdf0479d0565f8599d98cce5ad96a078884ff41a6',
    titleDe: 'Auf- und Entladen eines Kondensators',
    titleEn: 'Charging and Discharging a Capacitor',
    descriptionDe: 'Die lernende Person kann elektrische Stromstärke als durch einen Leiterquerschnitt transportierte Ladung pro Zeitintervall deuten, Richtung und zeitlichen Verlauf des Stroms beim Auf- und Entladen eines Kondensators qualitativ erklären und vorhersagen, wie bei gleicher Anfangsspannung ein größerer Widerstand den Betrag des Anfangsstroms verringert und wie das Produkt aus Widerstand und Kapazität die charakteristische Lade- beziehungsweise Entladezeit festlegt.',
    descriptionEn: 'The learner can interpret electric current as charge transferred through a conductor cross-section per time interval, qualitatively explain the direction and time course of the current while a capacitor charges and discharges, and predict how, for the same initial voltage, greater resistance reduces the magnitude of the initial current and how the product of resistance and capacitance sets the characteristic charging or discharging time.',
    atomicityReason: 'Definition, Stromverlauf und Parameterwirkung beziehen sich auf ein einziges qualitatives RC-Transientenmodell; Anfangsbedingung und Zeitkonstante machen die Aussagen überprüfbar.',
    memoryReason: 'Die Definition kann gestützt werden; Stromrichtung, Anfangsstrom und RC-Zeit müssen aus einer neuen Schaltung und ihren Bedingungen erklärt werden.',
    visualizationNote: 'Eine vorhandene Visualisierung bleibt unverändert; die Revision präzisiert ausschließlich die qualitative RC-Deutung.',
  },
  {
    id: 'fd9fd8ad-c4a1-5552-9ea0-1878e0636f20',
    beforeStateDigest: '1dc4146ba027c34ae261cc4e508bd2d802f2cff664409a499beb0a827cfa0eb5',
    titleDe: 'Energie des elektrischen Feldes',
    titleEn: 'Energy of the Electric Field',
    descriptionDe: 'Die lernende Person kann die im elektrischen Feld eines Kondensators gespeicherte Energie mithilfe von Ladung, Spannung und Kapazität berechnen und an Anwendungen erläutern, wie beim Laden Energie in das Feld übertragen und beim Entladen an angeschlossene Systeme abgegeben wird.',
    descriptionEn: 'The learner can calculate the energy stored in a capacitor\'s electric field using charge, voltage, and capacitance and use applications to explain how energy is transferred into the field during charging and delivered to connected systems during discharging.',
    atomicityReason: 'Berechnung und Energieübertragung sind zwei Darstellungen derselben Feldenergiespeicherung im Kondensator.',
    memoryReason: 'Energiebeziehungen können gestützt werden; passende Größenwahl, Systemgrenze und Richtung der Energieübertragung müssen begründet werden.',
    visualizationNote: 'Eine vorhandene Visualisierung bleibt unverändert; der Text macht Aufnahme und Abgabe von Feldenergie explizit.',
  },
  {
    id: '741774ef-15fc-4bcf-a370-e2c5cf4257d0',
    beforeStateDigest: '60f9b25ab68669533f17d1992e01bff68f1ce91102627886da954ad82052f8b7',
    titleDe: 'Geladene Teilchen in homogenen elektrischen Feldern untersuchen',
    titleEn: 'Investigate Charged Particles in Homogeneous Electric Fields',
    descriptionDe: 'Die lernende Person kann die Bewegung geladener Teilchen in homogenen elektrischen Feldern untersuchen, die Richtung der Feldkraft aus Feldrichtung und Ladungsvorzeichen bestimmen, Änderungen der elektrischen potenziellen und kinetischen Energie miteinander verknüpfen und einfache Bahnformen aus Anfangsbewegung, Ladungsvorzeichen und Feldrichtung qualitativ deuten.',
    descriptionEn: 'The learner can investigate the motion of charged particles in uniform electric fields, determine the direction of the electric force from the field direction and the sign of the charge, relate changes in electric potential energy and kinetic energy, and qualitatively interpret simple trajectories from the initial motion, charge sign, and field direction.',
    atomicityReason: 'Kraft, Energieänderung und Bahnform sind konsistente Zugänge zur Bewegung desselben geladenen Teilchens im homogenen Feld.',
    memoryReason: 'Beziehungen können gestützt werden; Vorzeichen, Energieumwandlung und Bahnform müssen aus neuen Anfangsbedingungen abgeleitet werden.',
    visualizationNote: 'Eine vorhandene Visualisierung bleibt unverändert; die Revision korrigiert Terminologie und benennt die bestimmenden Größen.',
  },
  {
    id: '5fda8623-69e0-5503-9c6d-86d054a8cf91',
    beforeStateDigest: '47c0c3cef6172e1ba554dba78f2daf4e719beb6f778dcde6a9bfe49ca089e623',
    titleDe: 'Braunsche Röhre (Oszilloskop)',
    titleEn: 'Cathode-Ray Tube (Oscilloscope)',
    descriptionDe: 'Die lernende Person kann erklären, wie elektrische Ablenkfelder einen Elektronenstrahl in der Braunschen Röhre auf dem Leuchtschirm auslenken und wie ein Oszilloskop dadurch zeitabhängige Spannungen darstellt; eine magnetische Ablenkung kann sie davon qualitativ unterscheiden.',
    descriptionEn: 'The learner can explain how electric deflection fields steer an electron beam onto the fluorescent screen of a cathode-ray tube and how this enables an oscilloscope to display time-dependent voltages; they can qualitatively distinguish magnetic deflection from this process.',
    atomicityReason: 'Elektronenablenkung, Bildentstehung und der qualitative Vergleich dienen einer einzigen funktionalen Erklärung der Braunschen Röhre.',
    memoryReason: 'Bauteilnamen können gestützt werden; die Wirkungskette vom Ablenkfeld zur Spannungsdarstellung und die Abgrenzung magnetischer Ablenkung müssen erklärt werden.',
    visualizationNote: 'Eine vorhandene Visualisierung bleibt unverändert; aus Satzfragmenten wird eine vollständig beobachtbare Geräteerklärung.',
  },
  {
    id: '74a74132-fa39-541c-8d3c-696cf228452d',
    beforeStateDigest: '0c06e68b4f49f6bd5dda58d1f7349887b0da7e488bbaf19a684e26328dea7a51',
    titleDe: 'Linearbeschleuniger modellieren',
    titleEn: 'Model Linear Accelerator',
    descriptionDe: 'Die lernende Person kann lineare Beschleunigerstufen über die Energiezunahme einer Ladung im elektrischen Feld klassisch modellieren und begründen, warum bei Geschwindigkeiten, die nicht mehr klein gegenüber der Lichtgeschwindigkeit sind, relativistische Beziehungen für Energie und Impuls erforderlich werden.',
    descriptionEn: 'The learner can model linear accelerator stages classically through the energy gained by a charge in an electric field and justify why relativistic relations for energy and momentum are required when speeds are no longer small compared with the speed of light.',
    atomicityReason: 'Klassisches Stufenmodell und seine relativistische Geltungsgrenze bilden eine einzige Modellierungs- und Modellgrenzenkompetenz.',
    memoryReason: 'Formeln können gestützt werden; Energiegewinn und Wahl des klassischen oder relativistischen Modells müssen aus dem Geschwindigkeitsbereich begründet werden.',
    visualizationNote: 'Eine vorhandene Visualisierung bleibt unverändert; die Geltungsgrenze wird relativ zur Lichtgeschwindigkeit eindeutig formuliert.',
  },
  {
    id: '8fbae050-c5c9-52b6-9983-2c366e9c8ade',
    beforeStateDigest: 'eb1f6f132de41bff956552b626f18adf429bdb60cbefbb23e98fea974fc34e38',
    titleDe: 'Saltatorische Signalleitung aus aktiver Regeneration und Membraneigenschaften erklären',
    titleEn: 'Explain saltatory conduction through active regeneration and membrane properties',
    descriptionDe: 'Die lernende Person kann erklären, wie spannungsabhängige Natriumkanäle die Depolarisation des Aktionspotenzials an Ranvier-Schnürringen regenerieren und Kaliumkanäle zur Repolarisation beitragen, wie die elektrischen Eigenschaften der myelinisierten Membran die schnelle passive Ausbreitung zwischen den Schnürringen ermöglichen und dabei passive Ausbreitung von aktiver Regeneration unterscheiden.',
    descriptionEn: 'The learner can explain how voltage-gated sodium channels regenerate action-potential depolarization at nodes of Ranvier and potassium channels contribute to repolarization, how the electrical properties of the myelinated membrane enable rapid passive spread between nodes, and distinguish passive spread from active regeneration.',
    atomicityReason: 'Die unterschiedlichen Kanalrollen und die passive Ausbreitung sind kausal auf einen einzigen Mechanismus der saltatorischen Leitung bezogen.',
    memoryReason: 'Kanalnamen können gestützt werden; Depolarisation, Repolarisation, passive Ausbreitung und aktive Regeneration müssen funktional unterschieden werden.',
    visualizationNote: 'Eine vorhandene Visualisierung bleibt unverändert; die Revision verhindert eine falsche Gleichsetzung der Natrium- und Kaliumkanalrollen.',
  },
  {
    id: '5fda8623-69e0-5503-9c6d-86d054a8cf91',
    beforeStateDigest: '2b18241e0d5bb59e3e0c26e5210628b2d4a059bce0840367e64a0a9196dee69c',
    titleDe: 'Braunsche Röhre (Oszilloskop)',
    titleEn: 'Cathode-Ray Tube (Oscilloscope)',
    descriptionDe: 'Die lernende Person kann erklären, wie in der Braunschen Röhre das von einer Ablenkspannung erzeugte elektrische Feld die vertikale Lage des Elektronenstrahls auf dem Leuchtschirm bestimmt und eine Zeitbasis den Strahl horizontal führt, sodass ein Oszilloskop den zeitlichen Spannungsverlauf darstellt; eine magnetische Ablenkung kann sie davon qualitativ unterscheiden.',
    descriptionEn: 'The learner can explain how, in a cathode-ray tube, the electric field produced by a deflection voltage determines the electron beam\'s vertical position on the fluorescent screen and a time base sweeps the beam horizontally so that an oscilloscope displays voltage as a function of time; they can qualitatively distinguish magnetic deflection from this process.',
    atomicityReason: 'Vertikale Signalauslenkung, horizontale Zeitbasis und Spurinterpretation sind funktional gekoppelte Teile einer einzigen Erklärung des Oszilloskops; der qualitative Magnetfeldvergleich grenzt denselben Ablenkmechanismus ab.',
    memoryReason: 'Bauteilnamen können gestützt werden; Achsenzuordnung, Wirkung einer geänderten Ablenkspannung oder Zeitbasis und die Abgrenzung magnetischer Ablenkung verlangen kausales Verständnis.',
    visualizationNote: 'Die vorhandenen Bildbytes bleiben unverändert; die Visualisierungsmetadaten werden an die präzisierte vertikale Signalauslenkung und horizontale Zeitbasis gebunden.',
  },
  {
    id: '8fbae050-c5c9-52b6-9983-2c366e9c8ade',
    beforeStateDigest: '031ee02cea7ba22e5885a56c9e18724c7bef2fe19cb2c2b0a529516b255e2617',
    titleDe: 'Saltatorische Signalleitung aus aktiver Regeneration und Membraneigenschaften erklären',
    titleEn: 'Explain saltatory conduction through active regeneration and membrane properties',
    descriptionDe: 'Die lernende Person kann erklären, wie spannungsabhängige Natriumkanäle die Depolarisation des Aktionspotenzials an Ranvier-Schnürringen regenerieren und Kaliumkanäle zur Repolarisation beitragen, während der erhöhte Membranwiderstand und die verringerte Membrankapazität myelinisierter Internodien eine schnelle passive Ausbreitung mit geringen Leckströmen ermöglichen, und passive Ausbreitung von aktiver Regeneration unterscheiden.',
    descriptionEn: 'The learner can explain how voltage-gated sodium channels regenerate action-potential depolarization at nodes of Ranvier and potassium channels contribute to repolarization, while the increased membrane resistance and reduced membrane capacitance of myelinated internodes enable rapid passive spread with little leakage, and distinguish passive spread from active regeneration.',
    atomicityReason: 'Membranwiderstand, Membrankapazität, Kanalrollen und passive beziehungsweise aktive Abschnitte erklären gemeinsam einen einzigen kausalen Mechanismus der saltatorischen Signalleitung.',
    memoryReason: 'Begriffe können gestützt werden; Auswirkungen von Demyelinisierung oder Kanalblockade müssen aus Widerstand, Kapazität und aktiver Regeneration hergeleitet werden.',
    visualizationNote: 'Es werden keine Bildbytes erzeugt; die vorhandene Missing-Entscheidung und ihre Metadaten werden an die fachlich expliziten Membraneigenschaften gebunden.',
  },
  {
    id: '09f2cdbd-64e0-55d2-ada7-1190f4fd50df',
    beforeStateDigest: 'e0a6e25fb5e805aaecf6374e4cbf5ccb8baf4fdfb7153a4cc4a46f2f671a1a49',
    titleDe: 'Methode: Lösungsansatz für DGL (Exponentialfunktion)',
    titleEn: 'Method: Exponential Ansatz for Differential Equations',
    descriptionDe: 'Die lernende Person kann bei einfachen physikalischen Differenzialgleichungen, in denen die Änderungsrate proportional zur Zustandsgröße ist (z. B. bei der RC-Entladung), einen passenden Exponentialansatz wählen und durch Ableiten prüfen, ob er die Differenzialgleichung und die Anfangsbedingung erfüllt.',
    descriptionEn: 'The learner can choose an appropriate exponential ansatz for simple physics differential equations in which the rate of change is proportional to the state variable (e.g., RC discharge) and verify by differentiation that it satisfies the differential equation and the initial condition.',
    atomicityReason: 'Ansatzwahl und Einsetzprüfung einschließlich Anfangsbedingung bilden eine einzige methodische Kompetenz für den klar begrenzten Fall einer zur Zustandsgröße proportionalen Änderungsrate.',
    memoryReason: 'Die Exponentialform kann gestützt werden; Proportionalstruktur, Vorzeichen und Erfüllung von Gleichung und Anfangsbedingung müssen an neuen Fällen geprüft werden.',
    visualizationNote: 'Die vorhandenen Bildbytes bleiben unverändert; die Visualisierungsmetadaten werden auf Proportionalstruktur sowie DGL- und Anfangsbedingungsprüfung aktualisiert.',
  },
  {
    id: '330808f6-789a-583d-86df-e271a7683d8b',
    beforeStateDigest: '16ea9dd0810eb3d87cb7d8c264a974e2289d3f1249a47fe0e3a9d095b7a3b31d',
    titleDe: 'Differenzialgleichung des RC-Kreises lösen',
    titleEn: 'Solve the RC Circuit Differential Equation',
    descriptionDe: 'Die lernende Person kann für die Entladung eines Kondensators aus einer konsistenten Strom- und Spannungskonvention sowie den Beziehungen U_R = RI und Q = CU die Differenzialgleichung aufstellen, sie mit der Anfangsbedingung lösen und die exponentielle Lösung einschließlich der Zeitkonstante RC physikalisch deuten.',
    descriptionEn: 'The learner can use a consistent current and voltage convention together with the relations U_R = RI and Q = CU to set up the differential equation for a discharging capacitor, solve it with the initial condition, and physically interpret the exponential solution, including the time constant RC.',
    atomicityReason: 'Aufstellen, Lösen und physikalisches Deuten sind aufeinanderfolgende beobachtbare Schritte derselben Modellierung einer idealisierten RC-Entladung.',
    memoryReason: 'Bauteilbeziehungen können gestützt werden; Vorzeichenkonvention, Herleitung, Anfangsbedingung und Deutung der Zeitkonstante müssen eigenständig zusammengeführt werden.',
    visualizationNote: 'Die vorhandenen Bildbytes bleiben unverändert; die Visualisierungsmetadaten werden an Aufstellung, Lösung und RC-Deutung gebunden.',
  },
  {
    id: '8d34228c-da38-5c1e-97cc-571f3eafb9f4',
    beforeStateDigest: '2367ccc8b8131b456ace00cf364b8b775fc987d0499b929a38ea6144d77b6d94',
    titleDe: 'Exkurs: Relativistische Energie und Impuls im Linearbeschleuniger',
    titleEn: 'Excursus: Relativistic Energy and Momentum in a Linear Accelerator',
    descriptionDe: 'Die lernende Person kann am Beispiel eines Linearbeschleunigers erläutern, warum klassische Energie- und Impulsbeziehungen für Geschwindigkeiten nahe der Lichtgeschwindigkeit versagen, und die historische Bezeichnung „relativistische Massenzunahme“ so einordnen, dass die Ruhemasse invariant bleibt und die Zunahme von Energie und Impuls relativistisch beschrieben wird.',
    descriptionEn: 'Using a linear accelerator as an example, the learner can explain why classical energy and momentum relations fail at speeds near the speed of light and contextualize the historical term “relativistic mass increase” by recognizing that rest mass remains invariant while increases in energy and momentum are described relativistically.',
    atomicityReason: 'Klassische Modellgrenze und moderne Einordnung der historischen Massenbezeichnung bilden eine einzige, auf Energie und Impuls im Linearbeschleuniger begrenzte Modellkompetenz.',
    memoryReason: 'Begriffe und Beziehungen können gestützt werden; die invariante Ruhemasse und die relativistische Änderung von Energie und Impuls müssen an neuen Beschleunigerargumenten fachlich getrennt werden.',
    visualizationNote: 'Die vorhandenen Bildbytes bleiben unverändert; Titel und Beschreibung der QA werden modernisiert, während die alte m_rel-Schreibweise im Bild nur als historische Konvention eingeordnet werden darf.',
  },
]
const b033vRevisionIds = new Set([
  '5fda8623-69e0-5503-9c6d-86d054a8cf91',
  '8fbae050-c5c9-52b6-9983-2c366e9c8ade',
  '09f2cdbd-64e0-55d2-ada7-1190f4fd50df',
  '330808f6-789a-583d-86df-e271a7683d8b',
  '8d34228c-da38-5c1e-97cc-571f3eafb9f4',
])
const b033vReviewer = 'codex-physics-b033v-final-adjudication-2026-09-05'

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
  const knownAfterState = revisions.some((candidate) => candidate.id === revision.id && isAfter(goal, candidate))
  if (
    currentStateDigest !== revision.beforeStateDigest
    && currentStateDigest !== revision.alternateBeforeStateDigest
    && !isAfter(goal, revision)
    && !knownAfterState
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
    reviewer: b033vRevisionIds.has(revision.id) ? b033vReviewer : reviewer,
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
    reviewer: b033vRevisionIds.has(revision.id) ? b033vReviewer : reviewer,
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
  if (!record) throw new Error(`${revision.id}: missing visualization QA record`)
  if (b033vRevisionIds.has(revision.id)) {
    const goal = goalById.get(revision.id)!
    record.title = goal.title
    record.description = goal.description
  }
  if (record.visualizationState !== 'available') continue
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
  [paths.visualizationQa, serializeJson(visualizationQa)],
])
const changed = [...outputs].filter(([path, content]) => readFileSync(absolute(path), 'utf8') !== content)
if (!writeMode && changed.length > 0) {
  throw new Error(`Physics B033 final follow-up is not materialized: ${changed.map(([path]) => path).join(', ')}`)
}
if (writeMode) changed.forEach(([path, content]) => writeFileSync(absolute(path), content, 'utf8'))

console.log(
  `CHECK apply_physics_batch_033_final_followup ${writeMode ? 'WRITE' : 'PASS'} revisions=${revisions.length} orientation=1 retainedVisualizations=${retainedVisualizationCount} changed=${changed.length}`,
)
