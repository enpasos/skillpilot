import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const roundDirectory = dirname(fileURLToPath(import.meta.url))
const campaignDirectory = resolve(roundDirectory, '..')
const campaign = JSON.parse(await readFile(join(roundDirectory, 'description-review-campaign.json'), 'utf8'))
const bundle = JSON.parse(await readFile(join(roundDirectory, 'review-bundle-manifest.json'), 'utf8'))
const batchFilename = (await readdir(join(roundDirectory, 'batches'))).find((name) => name.endsWith('.input.jsonl'))
if (!batchFilename) throw new Error('Missing bound round-A batch input')
const inputLines = (await readFile(join(roundDirectory, 'batches', batchFilename), 'utf8')).trim().split('\n')
const inputs = inputLines.map((line) => JSON.parse(line))
const batch = campaign.batches[0]
const runId = `${campaign.roundId}.batch-001`
const sha256 = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`

// Each six-element evidence array is DE/EN essential understanding, DE/EN
// independent performance, and DE/EN changed-case transfer, in that order.
// These are independent AI review candidates, not approval of text or images.
const judgments = [
  {
    decision: 'split_review',
    evidence: [
      'Kreisumfang und Bogenlänge messen Randlängen, während Kreis- und Kreisteilflächen zweidimensionale Inhalte messen; Radius, Winkelanteil und Einheiten wirken dabei verschieden.',
      'Circle circumference and arc length measure boundary lengths, whereas circle and circle-part areas measure two-dimensional regions; radius, angle fraction, and units play different roles.',
      'Die lernende Person trennt in einer Kreisteil-Sachsituation Rand- und Flächenfrage, konstruiert die nötigen Maße und begründet Ergebnis und Einheit.',
      'The learner separates boundary and area questions in a circle-part context, constructs the required measures, and explains each result and unit.',
      'Bei einem Kreissektor mit verändertem Mittelpunktswinkel und anderem praktischen Zweck entscheidet sie erneut, ob Bogen, gesamter Rand oder Flächeninhalt gesucht ist.',
      'For a sector with a changed central angle and a different practical purpose, the learner again decides whether arc, complete boundary, or area is required.',
    ],
    rationale: 'Der Titel verspricht Umfang und Fläche von Kreisen und Kreisteilen, die Beschreibung nennt bei der Fläche aber nur ganze Kreise. Zudem sind Randlänge und Flächeninhalt selbständig prüfbare Messkompetenzen. Eine bloße Wortergänzung würde die atomare Umfangsfrage verdecken; getrennte Zielzuschnitte und Quellenprüfung sind nötig. Das gesichtete Bild unterscheidet Bogen und Gesamtumfang korrekt, kann die Beschreibungslücke aber nicht heilen.',
  },
  {
    decision: 'split_review',
    evidence: [
      'Das Volumen eines geraden Prismas beruht auf Grundfläche mal senkrechter Höhe, seine Oberfläche dagegen auf zwei Grundflächen und dem Mantel; die Größen haben verschiedene Einheiten.',
      'The volume of a right prism comes from base area times perpendicular height, whereas its surface consists of two bases and the lateral area; the quantities have different units.',
      'Die lernende Person zerlegt ein gerades Prisma in passende Flächen, bestimmt unabhängig Volumen und Oberfläche und erklärt, welche Maße jeweils gebraucht werden.',
      'The learner decomposes a right prism into appropriate faces, independently determines volume and surface area, and explains which measurements each requires.',
      'Bei einem Prisma mit anderer Grundform und einer Verpackungs- statt Füllfrage wählt sie die richtige Zerlegung und unterscheidet Materialbedarf von Rauminhalt.',
      'For a prism with a different base shape and a packaging rather than filling question, the learner chooses the appropriate decomposition and distinguishes material needed from enclosed volume.',
    ],
    rationale: 'Volumen- und Oberflächenberechnung können unabhängig voneinander beherrscht werden und verlangen unterschiedliche Zerlegungen, Formeln und Einheiten. Beide bleiben im gegenwärtigen Titel und Beschreibung eigenständige Zielerfolge; ein kurzer Ersatzsatz würde diese Doppelkompetenz nicht atomar machen. Das Originalbild zeigt passende Beispielrechnungen, ist aber kein selbständiger Nachweis.',
  },
  {
    decision: 'keep',
    evidence: [
      'Bei Pyramiden gleicher Höhe bleibt der Volumenfaktor ein Drittel; nähert sich ihre Vielecksgrundfläche einem Kreis, wird der gerade Kreiskegel als Grenzfall plausibel.',
      'For pyramids of equal height the volume factor remains one third; as their polygonal bases approach a disk, the right circular cone becomes plausible as a limiting case.',
      'Die lernende Person skizziert eine Folge geeigneter Pyramiden, erklärt die Rolle von Grundfläche und gleicher Höhe und verbindet dies nachvollziehbar mit V = 1/3 πr²h.',
      'The learner sketches a sequence of suitable pyramids, explains the roles of base area and constant height, and connects this reasoning to V = 1/3 πr²h.',
      'Für einen Kegel mit anderem Radius oder einer umbeschriebenen statt einbeschriebenen Vielecksfolge prüft sie, welcher Grenzwert der Grundflächen und damit der Volumina entsteht.',
      'For a cone with a different radius or a circumscribed rather than inscribed polygon sequence, the learner checks which limiting base area and hence volume results.',
    ],
    rationale: 'Beide Beschreibungen begrenzen das Ziel klar auf die Plausibilisierung der Kegelformel aus passenden Pyramiden; sie fordern keinen formalen Grenzwertbeweis. Voraussetzung ist die Pyramidenformel. Die konkrete Bildfolge stützt genau diese Idee, ohne selbst Leistungsnachweis zu sein.',
  },
  {
    decision: 'split_review',
    evidence: [
      'Schrägbild und Netz sind verschiedene Darstellungen eines Körpers; Grundfläche, Mantelfläche, Kanten und Kegelmantellinie müssen darin konsistent zugeordnet werden.',
      'An oblique drawing and a net represent a solid differently; bases, lateral faces, edges, and cone slant height must be matched consistently across them.',
      'Die lernende Person zeichnet für eine vorgegebene Pyramide und einen geraden Kegel geeignete Darstellungen und benennt die zugehörigen Flächen und Strecken.',
      'The learner draws suitable representations of a given pyramid and right cone and identifies the corresponding faces and line segments.',
      'Bei veränderter Pyramiden-Grundform oder Kegelöffnung überprüft sie, ob das gewählte Netz tatsächlich zum Körper passt und welche Maße erhalten bleiben.',
      'With a different pyramid base or cone opening, the learner checks whether the chosen net actually belongs to the solid and which measurements are preserved.',
    ],
    rationale: 'Der Zieltext bündelt selbständig prüfbares Zeichnen von Schrägbildern, Konstruieren/Deuten von Netzen und Fachsprache für zwei Körperklassen. Eine Wortkorrektur würde die Mehrfachkompetenz nicht auflösen. Zusätzlich ist die im Originalbild als Kreissektor beschriftete grüne Kegelmantelfläche linsenförmig mit zwei gekrümmten Rändern statt zwei geraden Radien und einem Bogen; die Bildbindung braucht gesonderte fachliche Korrektur und bleibt hier ungeändert.',
  },
  {
    decision: 'keep',
    evidence: [
      'Ein Rotationskörper entsteht aus allen Positionen einer ebenen Erzeugerfigur um eine festgelegte Achse; Rechteck, rechtwinkliges Dreieck und Halbkreisfläche führen bei passender Achse zu Zylinder, Kegel und Kugel.',
      'A solid of revolution consists of all positions of a plane generating region rotated about a fixed axis; a rectangle, right triangle, and semicircular region yield a cylinder, cone, and sphere with suitable axes.',
      'Die lernende Person ordnet Erzeugerfigur und Drehachse einer Körperform zu, skizziert die Drehbewegung und erklärt, weshalb genau diese Form entsteht.',
      'The learner matches a generating region and rotation axis to a solid, sketches the rotation, and explains why that solid results.',
      'Bei einer verschobenen Achse oder einer anderen ebenen Figur prüft sie, ob weiterhin derselbe Körper entsteht oder ein anderer Rotationskörper.',
      'With a displaced axis or another plane region, the learner checks whether the same solid still results or a different solid of revolution appears.',
    ],
    rationale: 'Die drei Beispiele dienen demselben Erzeugungsprinzip und sind keine drei unabhängigen Rechenziele. Die vorhandene DE/EN-Beschreibung ist fachlich präzise und altersangemessen; das Bild macht die Achsenwahl sichtbar.',
  },
  {
    decision: 'keep',
    evidence: [
      'Die Oberfläche eines geraden Kreiskegels setzt sich aus Grundkreis und Mantelsektor zusammen; dessen Bogenlänge ist der Grundkreisumfang, während die Mantellinie der Sektorradius ist.',
      'A right circular cone surface consists of its base disk and lateral sector; the sector arc has the base circumference, while the slant height is the sector radius.',
      'Die lernende Person erklärt am korrekten Netz, weshalb M = πrs und O = πr² + πrs gelten, und berechnet eine Oberfläche mit passenden Einheiten.',
      'The learner explains from a correct net why M = πrs and O = πr² + πrs hold, and calculates a surface area with appropriate units.',
      'Bei einem Kegel mit gegebener Höhe statt Mantellinie bestimmt sie zunächst die erforderliche Strecke und begründet die Flächenzerlegung erneut.',
      'For a cone given by height rather than slant height, the learner first finds the required length and justifies the area decomposition again.',
    ],
    rationale: 'Begründen und Anwenden bilden hier eine zusammenhängende Flächenkompetenz. Der kurze aktuelle Zieltext lässt Darstellungswege offen und ist bilingual deckungsgleich; das gesichtete Bild zeigt einen plausiblen Mantelsektor und stimmige Rechnungen.',
  },
  {
    decision: 'split_review',
    evidence: [
      'Kugeloberfläche misst die gekrümmte Hülle und wächst quadratisch mit dem Radius; Kugelvolumen misst den Innenraum und wächst kubisch.',
      'Sphere surface area measures a curved boundary and scales quadratically with radius; sphere volume measures enclosed space and scales cubically.',
      'Die lernende Person erläutert für beide Größen ihre geometrische Bedeutung und eine altersgemäße Plausibilisierung und wendet jeweils die passende Formel an.',
      'The learner explains the geometric meaning and an age-appropriate plausibility argument for each quantity, then applies the appropriate formula.',
      'Wenn der Radius skaliert oder eine Hülle statt Füllmenge gesucht wird, erklärt sie die unterschiedlichen Folgen für Fläche und Volumen.',
      'When the radius is scaled or a covering rather than a fill amount is required, the learner explains the different consequences for area and volume.',
    ],
    rationale: 'Oberfläche und Volumen einer Kugel haben voneinander unabhängige Formeln, Skalierungsgesetze, Einheiten und Anwendungslagen; eine Lernende kann eines ohne das andere beherrschen. Das Originalbild trennt beide Seiten treffend, ersetzt aber keine atomare Zieltrennung.',
  },
  {
    decision: 'keep',
    evidence: [
      'Sinus und Kosinus sind am Einheitskreis die Koordinaten eines Punktes; der Radius 1 verbindet ihre Quadrate über den Satz des Pythagoras.',
      'Sine and cosine are point coordinates on the unit circle; the unit radius links their squares through the Pythagorean theorem.',
      'Die lernende Person konstruiert ein geeignetes rechtwinkliges Dreieck und leitet sin²(α) + cos²(α) = 1 mit erklärten Seitenzuordnungen her.',
      'The learner constructs a suitable right triangle and derives sin²(α) + cos²(α) = 1 while explaining the side assignments.',
      'Für einen Winkel in einem anderen Quadranten erklärt sie, warum die Identität trotz möglicher negativer Koordinaten bestehen bleibt.',
      'For an angle in another quadrant, the learner explains why the identity still holds despite possibly negative coordinates.',
    ],
    rationale: 'Der Text benennt genau eine Identität und die zulässigen anschaulichen oder rechnerischen Herleitungswege. Die Einheitskreis-Voraussetzung ist sichtbar; keine zusätzliche Formel wird ins Ziel importiert.',
  },
  {
    decision: 'keep',
    evidence: [
      'In einem rechtwinkligen Dreieck vertauschen sich Gegen- und Ankathete beim Übergang zum Komplementwinkel; am Einheitskreis entspricht dies einem Koordinatenwechsel.',
      'In a right triangle the opposite and adjacent legs swap roles for the complementary angle; on the unit circle this corresponds to a coordinate change.',
      'Die lernende Person weist sin(90° − α) = cos(α) anhand einer selbst gewählten zulässigen Darstellung her und erklärt, welche Strecke oder Koordinate beiden Seiten gemeinsam ist.',
      'The learner derives sin(90° − α) = cos(α) using a self-chosen valid representation and explains which length or coordinate is common to both sides.',
      'Für einen Winkel außerhalb des zunächst gezeichneten spitzen Bereichs prüft sie mit einer passenden Kreisargumentation die fortbestehende Identität.',
      'For an angle outside the initially drawn acute range, the learner checks the continuing identity using a suitable circle argument.',
    ],
    rationale: 'Der aktuelle DE/EN-Text ist kurz, korrekt und auf eine einzelne Beziehung beschränkt. Das Originalbild zeigt eine passende Dreiecksdeutung für spitze Winkel; die Transferanforderung darf darüber hinausgehen, ohne die Beschreibung zu erweitern.',
  },
  {
    decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann für Winkel mit cos(α) ≠ 0 die Beziehung tan(α) = sin(α)/cos(α) anschaulich oder rechnerisch herleiten.',
    proposedDescriptionEn: 'The learner can derive tan(α) = sin(α)/cos(α) visually or algebraically for angles with cos(α) ≠ 0.',
    evidence: [
      'Tangens ist das Verhältnis von Sinus zu Kosinus nur dort, wo Kosinus nicht null ist; im rechtwinkligen Dreieck kürzt sich dafür dieselbe Hypotenuse heraus.',
      'Tangent is the ratio of sine to cosine only where cosine is nonzero; in a right triangle the common hypotenuse cancels in that ratio.',
      'Die lernende Person leitet den Quotienten aus Seitenverhältnissen oder Einheitskreis-Koordinaten her und erklärt die ausgeschlossenen Winkel.',
      'The learner derives the quotient from side ratios or unit-circle coordinates and explains the excluded angles.',
      'Bei einem Winkel jenseits des ersten Quadranten prüft sie Vorzeichen und Definitionsbedingung, statt die Dreieckszeichnung unbesehen zu übertragen.',
      'For an angle outside the first quadrant, the learner checks sign and domain rather than applying the triangle picture without scrutiny.',
    ],
    rationale: 'Die bisherige Gleichung gilt nicht für cos(α)=0; die kurze Ergänzung der Definitionsbedingung behebt eine konkrete mathematische Lücke, ohne Methode oder Schwierigkeitsgrad zu ändern. Das Bild zeigt nur den spitzen Spezialfall, ist aber für die lokale Beschreibungskorrektur keine Autorität.',
  },
  {
    decision: 'keep',
    evidence: [
      'Ein Parameter bestimmt bei einer Funktionenschar systematisch Lage oder Form des Graphen; aus einem gezeichneten Fall darf nicht unbesehen auf alle Parameterwerte geschlossen werden.',
      'A parameter systematically controls the location or shape of graphs in a function family; one drawn case does not by itself establish every parameter value.',
      'Die lernende Person vergleicht mehrere Schargraphen, ordnet konkrete Parameterwerte zu und beschreibt nachvollziehbar eine Lage- oder Formänderung.',
      'The learner compares several family graphs, associates concrete parameter values, and clearly describes a positional or shape change.',
      'Bei Vorzeichenwechsel oder einem bislang nicht gezeigten Parameterwert sagt sie die Graphwirkung vorher und kontrolliert sie am Funktionsterm.',
      'When the parameter changes sign or takes a previously unseen value, the learner predicts the graph effect and checks it against the function term.',
    ],
    rationale: 'Das Ziel begrenzt sich auf das Beschreiben der Parameterwirkung an Graphen und ist bilingual stimmig; die tieferen speziellen Untersuchungen haben andere Ziele. Die Quadratik im Bild ist ein Beispiel, keine Beschränkung der Kompetenz.',
  },
  {
    decision: 'keep',
    evidence: [
      'Extremstellen einer Funktionenschar können mit dem Parameter wandern, entstehen oder verschwinden; f′ = 0 liefert nur Kandidaten, die als Extremstellen geprüft werden müssen.',
      'Extremal locations in a function family may move, appear, or disappear with the parameter; f′ = 0 gives only candidates that must be checked as extrema.',
      'Die lernende Person bildet eine parameterabhängige Ableitung, löst die stationäre Bedingung samt Parameterfällen und prüft die Art der gefundenen Stellen.',
      'The learner forms a parameter-dependent derivative, solves the stationary condition including parameter cases, and checks the nature of the resulting points.',
      'Bei einer Schar mit einem Parameterwert, an dem stationäre Punkte zusammenfallen oder ihre Art wechseln, prüft sie den Sonderfall gesondert.',
      'For a family with a parameter value where stationary points merge or change type, the learner examines that special case separately.',
    ],
    rationale: 'Die Beschreibung deckt Bestimmen und Prüfen als eine zusammenhängende Extremstellenuntersuchung ab. Das Bild liefert ein korrektes quadratisches Beispiel, ersetzt aber nicht die unabhängige Prüfung weiterer Parameterfälle.',
  },
  {
    decision: 'keep',
    evidence: [
      'Bei ganzrationalen Funktionenscharen hängen ausgewählte Grapheneigenschaften vom Parameter ab; algebraische Ergebnisse und Graphdeutung müssen für die betrachteten Parameterfälle übereinstimmen.',
      'In polynomial function families, selected graph properties depend on the parameter; algebraic results and graph interpretation must agree for the parameter cases considered.',
      'Die lernende Person untersucht für eine gegebene Schar die in der Aufgabe relevanten Nullstellen, Symmetrie- oder Extrempunktmerkmale und erklärt ihre Parameterabhängigkeit.',
      'The learner examines the task-relevant zeros, symmetry, or extremal-point properties of a given family and explains how they depend on the parameter.',
      'Wenn ein Parameterwert die Anzahl von Nullstellen oder die Lage eines charakteristischen Punkts ändert, grenzt sie die Fälle ab und überprüft ihre Graphdeutung.',
      'When a parameter value changes the number of zeros or the location of a characteristic point, the learner separates the cases and checks the graph interpretation.',
    ],
    rationale: 'Die Beschreibung ist eine integrierende, aber auf ganzrationale Scharen und charakteristische Grapheneigenschaften begrenzte Analysekompetenz; die konkreten Merkmale sind aufgabenabhängig, nicht automatisch vollständig zu prüfen. Ein engerer Methodenkanon wäre nicht belegt. Das Bild ist ein konsistentes quadratisches Beispiel; seine kleinen schematischen Inset-Kurven sind keine maßstäbliche Quelle.',
  },
  {
    decision: 'keep',
    evidence: [
      'Bei einem bestimmten Integral ist der Parameter während der Integration nach x konstant; Stammfunktion, Grenzen und Ergebnis können selbst wieder vom Parameter abhängen.',
      'In a definite integral the parameter is constant while integrating with respect to x; antiderivative, bounds, and result may themselves depend on the parameter.',
      'Die lernende Person integriert eine ganzrationale Schar termweise, setzt gegebene Grenzen ein und interpretiert den entstehenden Parameterausdruck für die Schar.',
      'The learner integrates a polynomial family term by term, applies given limits, and interprets the resulting parameter expression for that family.',
      'Bei einem Parameterwert mit Vorzeichenwechsel des Integranden unterscheidet sie orientiertes Integral und geometrischen Flächeninhalt und prüft die Deutung.',
      'At a parameter value where the integrand changes sign, the learner distinguishes signed integral from geometric area and checks the interpretation.',
    ],
    rationale: 'Stammfunktionen und bestimmte Integrale bilden hier dieselbe parameterabhängige Integrationskette. Die Beschreibung ist fachlich korrekt, bilingual gleichwertig und nicht auf ein einzelnes Beispiel verengt; das Bild zeigt einen konsistenten Fall ohne Vorzeichenwechsel.',
  },
  {
    decision: 'split_review',
    evidence: [
      'Addition, Multiplikation und Verkettung verknüpfen Exponential- und Polynomanteile auf strukturell unterschiedliche Weise; ihre Ableitungen, Nullstellen und Graphenwirkungen lassen sich nicht durch eine einzige Schablone erfassen.',
      'Addition, multiplication, and composition combine exponential and polynomial parts in structurally different ways; their derivatives, zeros, and graph effects cannot be captured by one template.',
      'Die lernende Person untersucht für jede tatsächlich beanspruchte Verknüpfungsart eine passende Schar und erklärt, wie der Parameter ihre Graphmerkmale beeinflusst.',
      'For each combination type actually claimed, the learner analyzes a suitable family and explains how the parameter affects its graph features.',
      'Bei Wechsel von einer additiven Verschiebung zu einem Produkt oder einer Verkettung erkennt sie, welche bisherigen Schlussfolgerungen nicht mehr gelten.',
      'When the combination changes from an additive shift to a product or composition, the learner recognizes which previous conclusions no longer apply.',
    ],
    rationale: 'Der Text verlangt ausdrücklich drei mathematisch verschiedene Verknüpfungsarten. Additive, multiplikative und verkettete Exponential-Polynom-Scharen können getrennt beherrscht werden und führen zu anderen Ableitungs-/Graphstrukturen. Das Bild zeigt nur die additive Konstantschar e^x+a und darf die breitere Zielbehauptung nicht stillschweigend verengen.',
  },
  {
    decision: 'block',
    evidence: [
      'Für einige Verknüpfungen von Polynom- und Exponentialfunktion lässt sich eine Stammfunktion mit bekannten Ableitungsregeln finden und prüfen; andere Fälle besitzen keine elementare Stammfunktion.',
      'Some polynomial-exponential combinations have antiderivatives that can be found and checked with familiar differentiation rules; others have no elementary antiderivative.',
      'Die lernende Person berechnet im fachlich erlaubten Fall ein Integral und weist ihre Stammfunktion durch Ableiten nach; welche Verknüpfungsklassen dazu gehören, muss vorher geklärt werden.',
      'In an admissible case the learner computes an integral and verifies the antiderivative by differentiation; the admissible combination classes must first be clarified.',
      'Bei einer veränderten Verknüpfung, etwa e^(x²) statt x·e^x, erkennt sie, dass die bisherige Integrationsstrategie nicht einfach übertragbar ist.',
      'For a changed combination, such as e^(x²) instead of x·e^x, the learner recognizes that the previous integration strategy does not simply transfer.',
    ],
    rationale: '„Integrale bei verknüpften Exponential- und ganzrationalen Funktionen“ begrenzt weder Addition, Produkt noch Verkettung oder die zulässigen Funktionsklassen. Der universelle Wortlaut umfasst etwa e^(x²), dessen Stammfunktion nicht elementar ist. Das Bild behandelt nur x·e^x; ohne gebundene Quelle wäre jede rettende Einschränkung spekulativ. Daher keine Ersatzformulierung, sondern Klärung von Identität und Geltungsbereich.',
  },
  {
    decision: 'keep',
    evidence: [
      'Bei einer reinen Streckung, Stauchung oder Verschiebung bleibt die bekannte Grundform erkennbar; die Stelle des Parameters im Term entscheidet über Richtung und Art der Transformation.',
      'Under a pure stretch, compression, or shift the known base shape remains recognizable; the parameter position in the term determines the direction and type of transformation.',
      'Die lernende Person leitet aus einem gegebenen Scharterm die Parameterwirkung ab, ordnet mehrere Graphen zu und begründet erhaltene sowie veränderte Merkmale.',
      'The learner derives the parameter effect from a given family term, matches several graphs, and justifies preserved and changed features.',
      'Bei Wechsel zwischen g(x−a), g(x)+a und a·g(x) unterscheidet sie horizontale, vertikale und skalierende Wirkung für eine andere bekannte Funktionsklasse.',
      'When switching among g(x−a), g(x)+a, and a·g(x), the learner distinguishes horizontal, vertical, and scaling effects for another known function class.',
    ],
    rationale: 'Die Beschreibung begrenzt den Parameter ausdrücklich auf einfache Transformationen und verlangt eine Graphbegründung; dies ist eine einheitliche Transferkompetenz. Im Bild sind Gleichungen und beschriftete Scheitel konsistent, die gezeichneten Scheitel sind gegenüber den x-Ticks aber nicht maßstäblich angeordnet; das ist separat als Bildqualität zu beurteilen.',
  },
]

if (judgments.length !== inputs.length) throw new Error('Judgment count differs from bound input')
const records = inputs.map((input, index) => {
  const goal = input.goal
  const judgment = judgments[index]
  if (goal.goalId !== batch.goalIds[index]) throw new Error(`Goal order mismatch at ${index + 1}`)
  const evidence = judgment.evidence
  if (evidence.length !== 6) throw new Error(`Evidence chain must have six fields for ${goal.goalId}`)
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `math-m7-vready-geom-func-17-a:${goal.goalId}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: input.bundleFingerprint,
    bookDigest: input.bookDigest,
    goalId: goal.goalId,
    goalFingerprint: goal.goalFingerprint,
    pageFingerprint: goal.pageFingerprint,
    currentTitleDe: goal.currentTitleDe,
    currentTitleEn: goal.currentTitleEn,
    currentDescriptionDe: goal.currentDescriptionDe,
    currentDescriptionEn: goal.currentDescriptionEn,
    decision: judgment.decision,
    ...(judgment.decision === 'revise' ? {
      proposedDescriptionDe: judgment.proposedDescriptionDe,
      proposedDescriptionEn: judgment.proposedDescriptionEn,
    } : {}),
    understandingEvidence: {
      essentialUnderstandingDe: evidence[0],
      essentialUnderstandingEn: evidence[1],
      observablePerformanceDe: evidence[2],
      observablePerformanceEn: evidence[3],
      transferExpectationDe: evidence[4],
      transferExpectationEn: evidence[5],
    },
    rationale: judgment.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: goal.reviewContext.evidenceProfile ? 'revise' : 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
})

const outputBytes = Buffer.from(records.map((record) => JSON.stringify(record)).join('\n') + '\n')
const artifact = (role) => {
  const found = bundle.artifacts.find((item) => item.role === role)
  if (!found) throw new Error(`Missing bound ${role} artifact`)
  return { role, digest: found.digest }
}
const timestamp = new Date().toISOString()
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint: bundle.bundleFingerprint,
  bookDigest: bundle.bookModelDigest,
  provider: 'OpenAI',
  model: 'Codex independent review agent',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: bundle.promptFingerprint,
  criteriaFingerprint: bundle.criteriaFingerprint,
  generationParametersFingerprint: sha256('manual independent first-pass review; no sampling parameters exposed'),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    artifact('review_prompt'),
    artifact('review_criteria'),
    artifact('book_model'),
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt: timestamp,
  completedAt: timestamp,
  status: 'completed',
  outputDigest: sha256(outputBytes),
  toolchainVersion: 'codex-manual-review-v1',
}

await writeFile(join(roundDirectory, 'results', `${batch.batchId}.records.jsonl`), outputBytes)
await writeFile(join(roundDirectory, 'results', `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`)
console.log(`Round A prepared: ${records.length} candidate records; ${JSON.stringify(records.reduce((counts, record) => ({ ...counts, [record.decision]: (counts[record.decision] ?? 0) + 1 }), {}))}`)
