import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Blind first pass: read only this prepared Round A's bound input and manifest.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../../../../..')
const round = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-final-fourteen-triage-20260927-v1/round-a'
const at = (path) => resolve(root, path)
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const jsonBytes = (value) => `${JSON.stringify(value, null, 2)}\n`
const campaign = JSON.parse(readFileSync(at(`${round}/description-review-campaign.json`), 'utf8'))
const input = JSON.parse(readFileSync(at(`${round}/description-review-input.json`), 'utf8'))
const bundle = JSON.parse(readFileSync(at(`${round}/review-bundle-manifest.json`), 'utf8'))
const batch = campaign.batches[0]
const batchPath = `${round}/batches/${batch.batchId}.input.jsonl`
const batchBytes = readFileSync(at(batchPath))
const lines = batchBytes.toString('utf8').trimEnd().split('\n').map(JSON.parse)
if (sha(batchBytes) !== batch.batchInputFingerprint || campaign.goalCount !== 14 ||
    input.goals.length !== 14 || lines.length !== 14 || campaign.batches.length !== 1 ||
    bundle.bundleFingerprint !== campaign.bundleFingerprint ||
    batch.goalIds.some((id, index) => id !== input.goals[index].goalId || id !== lines[index].goal.goalId)) {
  throw new Error('Round A input bindings differ')
}

const evidence = (essentialUnderstandingDe, essentialUnderstandingEn,
  observablePerformanceDe, observablePerformanceEn,
  transferExpectationDe, transferExpectationEn) => ({
  essentialUnderstandingDe, essentialUnderstandingEn,
  observablePerformanceDe, observablePerformanceEn,
  transferExpectationDe, transferExpectationEn,
})
const judgments = {
  '0a846521-edcc-5c3c-a844-eac061e053ce': {
    decision: 'split_review',
    rationale: 'Titel und Text bündeln Längen bzw. Punkt-Punkt-Abstände mit Abständen zu Geraden im Raum. Der erste Fall folgt unmittelbar aus der Norm eines Verbindungsvektors, der zweite verlangt zusätzlich das Lot beziehungsweise eine Projektion; beides kann unabhängig beherrscht werden. „Abstände zwischen Punkten und Geraden“ legt die Objektpaare nicht eindeutig fest. Ohne direkte Quellenbindung ist eine einheitliche lokale Formulierung keine verantwortliche Reparatur; fachliche Zerlegung und genaue Objektpaare prüfen. Roh-Tags und Buchseite belegen keine vollständige Quell-/Projektionsfreigabe.',
    understandingEvidence: evidence(
      'Ein Punkt-Punkt-Abstand ist die Länge des Verbindungsvektors; ein Punkt-Gerade-Abstand ist die Länge der zur Geraden orthogonalen Restkomponente und nicht beliebig die Entfernung zu einem Geradenpunkt. Skalarprodukt und Projektion erklären das Lotprinzip.',
      'A point-to-point distance is the length of the connecting vector; a point-to-line distance is the length of the component orthogonal to the line, not the distance to an arbitrary point on it. Scalar product and projection explain the perpendicular principle.',
      'Die lernende Person bestimmt bei unabhängig gegebenen Raumkoordinaten den kürzesten Abstand eines Punktes zu einer Geraden, begründet die Orthogonalität des Restvektors und unterscheidet diese Rechnung von der Länge einer vorgegebenen Strecke.',
      'Given independently supplied spatial coordinates, the learner determines the shortest distance from a point to a line, justifies orthogonality of the residual vector, and distinguishes this calculation from the length of a specified segment.',
      'Bei einer neu parametrisierten, verschobenen Geraden erklärt die lernende Person, warum sich der Punkt-Gerade-Abstand nicht ändert, wenn ein anderer Stützpunkt derselben Geraden gewählt wird, und prüft das Ergebnis mit einer zweiten Darstellung.',
      'For a newly parameterized, shifted line, the learner explains why the point-to-line distance is unchanged when a different base point on the same line is chosen and checks the result using a second representation.'),
  },
  '0b162cb0-8507-5ac2-b9d6-57f40f4d3f35': {
    decision: 'block',
    rationale: 'Die Kompetenz ist ausdrücklich als LK bezeichnet und kanonisch LK-getaggt; die gebundene Buchseite listet sie aber in zahlreichen Ländern auch für GK, während die direkte Quellenangabe nur LehrplanPLUS Bayern M13.4 nennt. Ob das ein beabsichtigter gemeinsamer Kern oder ein Projektions-/Mappingfehler ist, wird durch das Paket nicht aufgelöst. Daher keine bloße Textglättung und keine Behauptung, die bundesweite Quellenlage sei geprüft. Die inhaltliche Methodenauswahl mit Kontextdeutung ist als ein zusammenhängender Leistungsfall plausibel, aber erst nach Scope-Klärung freigabefähig.',
    understandingEvidence: evidence(
      'Ein bestimmtes Integral kann je nach Bedeutung der Integrandenfunktion eine akkumulierte Änderung, einen Bestand oder eine andere Gesamtgröße beschreiben. Grenzen, Einheiten und Vorzeichen entscheiden über die sachliche Deutung; nicht jede Kontextfrage verlangt dieselbe Integralstrategie.',
      'A definite integral can represent accumulated change, a stock, or another total quantity depending on the meaning of its integrand. Bounds, units, and sign determine its contextual interpretation; not every contextual question calls for the same integration strategy.',
      'Zu einem unabhängig vorgelegten Änderungsratenmodell wählt die lernende Person eine passende Integraldarstellung, begründet Grenzen und Einheit, berechnet die gesuchte Größe und prüft, ob Vorzeichen und Ergebnis im Sachkontext sinnvoll sind.',
      'For an independently presented rate-of-change model, the learner chooses a suitable integral representation, justifies bounds and units, calculates the requested quantity, and checks whether its sign and magnitude make sense in context.',
      'In einem neuen Fall mit abschnittsweise positiven und negativen Raten unterscheidet die lernende Person Nettoänderung von insgesamt durchgesetzter Menge und wählt entsprechend ein Integral der Rate oder ihres Betrags.',
      'In a fresh case with partly positive and negative rates, the learner distinguishes net change from total throughput and accordingly chooses an integral of the rate or of its absolute value.'),
  },
  '0f4f9957-8afe-4aab-9dd8-c26c9aee2afd': {
    decision: 'block',
    rationale: 'Der deutsche und englische Titel beanspruchen sowohl Ebene–Ebene als auch Gerade–Ebene, die beiden aktuellen Beschreibungen definieren jedoch nur die Lage zweier Ebenen. Das ist ein Identitäts-/Scope-Widerspruch, der nicht durch eine lokale Änderung ausschließlich der Beschreibungen verdeckt werden darf. Direkter HMKB-Quellenverweis ist vorhanden, sein Wortlaut aber nicht als prüfbare gebundene Quelle enthalten. Nach Titel- und Quellenabgleich kann eine konsistente Zielidentität festgelegt werden.',
    understandingEvidence: evidence(
      'Bei zwei Ebenen bestimmen Rang und Konsistenz des gemeinsamen linearen Gleichungssystems, ob sie identisch sind, sich in einer Geraden schneiden oder parallel ohne Schnitt liegen; die algebraische Lösungsmenge und die geometrische Lage meinen dieselbe Struktur.',
      'For two planes, the rank and consistency of their common linear system determine whether they coincide, intersect in a line, or are parallel and disjoint; the algebraic solution set and geometric position describe the same structure.',
      'Die lernende Person löst für zwei unabhängig gegebene Ebenengleichungen das Gleichungssystem, nennt die geometrische Lage und begründet diese anhand der Lösungsmenge statt allein anhand einer Skizze.',
      'For two independently given plane equations, the learner solves the linear system, names the geometric relation, and justifies it from the solution set rather than from a sketch alone.',
      'In einer neuen Darstellung mit einer Parameter- und einer Koordinatenform erkennt die lernende Person, ob die vermeintlich verschiedenen Ebenen zusammenfallen oder eine Schnittgerade besitzen, und übersetzt die Rechnung in eine geometrische Aussage.',
      'In a fresh representation using one parametric and one coordinate equation, the learner determines whether apparently different planes coincide or have an intersection line and translates the calculation into a geometric statement.'),
  },
  '1bc118c3-1f05-5f2a-b125-418017180d75': {
    decision: 'split_review',
    rationale: 'Die aktuelle als atomar markierte Kompetenz bündelt Addition/Subtraktion von Verschiebungsvektoren und skalare Multiplikation. Vektoren zusammensetzen und einen Vektor strecken oder umkehren sind unterschiedliche, unabhängig prüfbare Operationen; ein Lernender kann die eine sicher anwenden, ohne die andere zu beherrschen. Eine bloße Umformulierung würde diese Granularität nicht klären. Die geometrische Deutung gehört jeweils zur betreffenden Operation, nicht als losgelöstes drittes Ziel.',
    understandingEvidence: evidence(
      'Komponentenweise Addition und Subtraktion setzen Verschiebungen zusammen oder bilden einen Differenzvektor; Multiplikation mit einem Skalar verändert Länge und bei negativem Faktor die Richtung. Die Koordinatenregeln entsprechen diesen geometrischen Wirkungen.',
      'Component-wise addition and subtraction compose displacements or form a difference vector; scalar multiplication changes length and, for a negative factor, direction. The coordinate rules correspond to these geometric effects.',
      'Die lernende Person berechnet aus unabhängig gegebenen Orts- und Verschiebungsvektoren einen resultierenden Weg und einen skalierten Gegenweg und erklärt jeweils anhand einer Zeichnung, weshalb die Komponentenregel zum Ergebnis passt.',
      'From independently supplied position and displacement vectors, the learner calculates a resultant route and a scaled reverse route and explains with a diagram why each component rule gives that result.',
      'Bei einem neuen räumlichen Weg mit einem negativen Streckfaktor erklärt die lernende Person, welche Operationen nur die Reihenfolge von Verschiebungen ändern und welche die Richtung umkehren, und überprüft dies koordinatenbasiert.',
      'For a fresh spatial route with a negative scaling factor, the learner explains which operations merely reorder displacements and which reverse direction, then checks this with coordinates.'),
  },
  '1ea06c0c-5c60-45cd-8f31-638de98820b4': {
    decision: 'split_review',
    rationale: 'Kugeloberfläche und Kugelvolumen sind zwei unabhängig anwendbare Größen mit verschiedenen Dimensionen und Formeln. Die lernende Person kann Materialbedarf für eine Hülle sicher beurteilen, ohne Rauminhalt sicher zu berechnen, und umgekehrt. Plausibilisieren/Deuten/Anwenden bildet jeweils eine zusammenhängende Kompetenz pro Größe, rechtfertigt aber nicht ein einziges Atom für beide.',
    understandingEvidence: evidence(
      'Oberflächeninhalt misst die zweidimensionale Begrenzung einer Kugel und skaliert mit r²; Volumen misst ihren dreidimensionalen Rauminhalt und skaliert mit r³. Die Faktoren 4π und 4π/3 sowie die Einheiten dürfen nicht verwechselt werden.',
      'Surface area measures a sphere’s two-dimensional boundary and scales with r²; volume measures its three-dimensional interior and scales with r³. The factors 4π and 4π/3, as well as their units, must not be confused.',
      'Die lernende Person entscheidet in einer unabhängig gestellten Kugelanwendung, ob Fläche oder Rauminhalt gefragt ist, berechnet die Größe aus dem Radius und plausibilisiert Einheit und Größenordnung anhand der r²- beziehungsweise r³-Skalierung.',
      'In an independently posed sphere application, the learner decides whether area or capacity is sought, calculates it from the radius, and checks its unit and magnitude using r² or r³ scaling.',
      'Für eine neue Kugel mit verdoppeltem Radius sagt die lernende Person ohne vollständiges Neuberechnen den Faktor der Hüllenfläche und den anderen Faktor des Rauminhalts voraus und erklärt die unterschiedlichen Dimensionen.',
      'For a fresh sphere whose radius is doubled, the learner predicts without full recalculation the factor for its shell area and the different factor for its interior volume, explaining the different dimensions.'),
  },
  '59d5a330-61be-4590-ab46-cf7cefecd144': {
    decision: 'split_review',
    rationale: 'Volumen und gesamte Oberfläche gerader Prismen sind unabhängig prüfbare Messgrößen: Grundfläche mal Höhe einerseits, Summe aus Grund- und Mantelflächen andererseits. Die Fähigkeit, in einer Sachaufgabe Füllmenge zu ermitteln, impliziert keine sichere Materialflächenrechnung. Ein einzelner Textwechsel kann die fachlich getrennten Leistungen nicht atomisieren.',
    understandingEvidence: evidence(
      'Das Volumen eines geraden Prismas entsteht aus Grundfläche mal senkrechter Höhe; seine Oberfläche addiert die Flächen beider Grundseiten und aller Seitenflächen. Unterschiedliche Einheiten und das Netz zeigen, weshalb die beiden Formeln nicht austauschbar sind.',
      'A right prism’s volume is base area times perpendicular height; its surface area sums both bases and all lateral faces. Different units and the net show why the two calculations are not interchangeable.',
      'Die lernende Person zerlegt ein unabhängig gegebenes gerades Prisma in Grund- und Seitenflächen, bestimmt benötigte Längen, berechnet Füllmenge und Materialfläche getrennt und deutet beide Ergebnisse mit passenden Einheiten.',
      'The learner decomposes an independently supplied right prism into bases and lateral faces, determines the needed lengths, calculates capacity and material area separately, and interprets both results with appropriate units.',
      'Bei einem neuen dreieckigen statt rechteckigen Prisma zeichnet die lernende Person ein Netz und erklärt, welche Flächen zum Verpackungsmaterial gehören und welche Grundfläche mit der Höhe für die Füllmenge multipliziert wird.',
      'For a fresh triangular rather than rectangular prism, the learner draws a net and explains which faces count toward wrapping material and which base area is multiplied by height for capacity.'),
  },
  '6b2a1c04-8c28-51ff-905b-9c9492a26cc3': {
    decision: 'block',
    rationale: '„Besondere Lagebeziehungen von Geraden und Ebenen“ benennt weder die konkreten Objektpaare noch, was gegenüber den bereits vorausgesetzten Zielen zu Gerade–Ebene-Schnitt, Winkel und Lage die zusätzliche LK-Leistung ist. Die Seite zeigt nur BW/LK und es gibt keinen direkten sourceRef im gebundenen Paket. Ohne diese Abgrenzung würde jede präzisierende Beschreibung einen nicht belegten Scope erfinden oder bestehende Ziele doppeln. Zuerst fachliche Identität und Quelle klären.',
    understandingEvidence: evidence(
      'Besondere Lagen im Raum müssen über Richtungs- und Normalenvektoren sowie Lösbarkeit der Schnittbedingungen begründet werden; Parallelität, Enthaltensein und Orthogonalität sind verschiedene Aussagen, die eine Zeichnung allein nicht beweist.',
      'Special spatial positions must be justified through direction and normal vectors and solvability of intersection conditions; parallelism, containment, and orthogonality are distinct claims that a sketch alone does not prove.',
      'Die lernende Person untersucht unabhängig gegebene Geraden- und Ebenengleichungen, formuliert eine konkrete Lagehypothese und bestätigt oder widerlegt sie rechnerisch, wobei sie degenerierte Fälle wie eine ganz in der Ebene liegende Gerade unterscheidet.',
      'The learner examines independently supplied line and plane equations, states a specific positional hypothesis, and confirms or refutes it algebraically, distinguishing degenerate cases such as a line entirely contained in a plane.',
      'In einer neuen Konfiguration mit zu einem Ebenennormalenvektor orthogonalem Geradenrichtungsvektor prüft die lernende Person zusätzlich die Lage des Stützpunkts, um zwischen paralleler und enthaltener Gerade zu unterscheiden.',
      'In a fresh configuration with a line direction orthogonal to a plane normal, the learner also checks the base point to distinguish a parallel line from a contained line.'),
  },
  '8064088b-dc0a-4a67-ad63-360fdcc9869d': {
    decision: 'split_review',
    rationale: 'Der Text bündelt Kreis-/Kreisteil-Umfänge mit Kreisflächeninhalt. Längen von Umfang und Bogen sind eindimensional; Kreisfläche ist zweidimensional und verlangt eine andere Formel und Deutung. Diese Rechenleistungen können unabhängig beherrscht und beurteilt werden. Der Titel „Flächeninhalt von Kreisen und Kreisteilen“ geht zudem über die Beschreibung hinaus, die Flächeninhalte nur für ganze Kreise nennt; die Entscheidung über Kreissektorflächen darf nicht durch einen stillen Textzusatz vorweggenommen werden.',
    understandingEvidence: evidence(
      'Kreisumfang und Bogenlänge wachsen linear mit dem Radius und sind Längen; Kreisfläche wächst quadratisch und wird in Flächeneinheiten angegeben. Der Anteil eines Kreisbogens am Umfang folgt aus seinem Mittelpunktswinkel.',
      'Circumference and arc length scale linearly with radius and are lengths; circle area scales quadratically and uses square units. An arc’s share of the circumference follows from its central angle.',
      'Die lernende Person entscheidet bei einer unabhängig beschriebenen Kreisfigur, ob eine Randlänge, Bogenlänge oder Fläche gebraucht wird, berechnet die beanspruchte Größe und erklärt die Wahl von Formel, Winkelanteil und Einheit.',
      'For an independently described circular figure, the learner decides whether a boundary length, arc length, or area is needed, calculates the claimed quantity, and explains the choice of formula, angular share, and unit.',
      'Bei einer neuen Kreisbahn mit halbiertem Radius und unverändertem Mittelpunktswinkel sagt die lernende Person die Änderung der Bogenlänge im Vergleich zur Änderung der Fläche des ganzen Kreises voraus und begründet den Unterschied.',
      'For a fresh circular track with half the radius and unchanged central angle, the learner predicts how arc length changes compared with the area of the whole circle and explains the difference.'),
  },
  '80956a2c-5811-4021-863e-95675bec31f5': {
    decision: 'split_review',
    rationale: 'Die aktuelle Zielidentität fordert Pythagoras für das Konstruieren, zum Berechnen von Strecken und zum Begründen von Figureneigenschaften. Eine Pythagoras-Konstruktion einer vorgegebenen Länge und der allgemeine geometrische Begründungsfall sind unterschiedliche beobachtbare Leistungen; die eine kann gelingen, während die andere noch nicht beherrscht wird. Das als atomar markierte Blatt sollte deshalb fachlich zerlegt oder die verbindende eine Kompetenz mit klarer Grenze neu festgelegt werden, statt die drei Verben nur stilistisch umzuschreiben.',
    understandingEvidence: evidence(
      'Der Satz des Pythagoras verknüpft die Quadrate der Seitenlängen ausschließlich in rechtwinkligen Dreiecken. Eine Konstruktion nutzt diese Beziehung, um eine Länge geometrisch herzustellen; eine Begründung muss zuerst den rechten Winkel und danach die Folgerung für die Figur sichern.',
      'The Pythagorean theorem relates squares of side lengths only in right triangles. A construction uses this relation to produce a length geometrically; a justification must establish the right angle before drawing a conclusion about the figure.',
      'Die lernende Person konstruiert aus unabhängig gegebenen Strecken ein rechtwinkliges Dreieck mit geforderter Hypotenuse, berechnet die Länge und begründet anhand des rechten Winkels, warum genau hier die Pythagoras-Beziehung gilt.',
      'From independently supplied lengths, the learner constructs a right triangle with the required hypotenuse, calculates its length, and justifies from the right angle why the Pythagorean relation applies here.',
      'In einer neuen Figur mit eingezeichneter Diagonale, aber ohne markierten rechten Winkel, prüft die lernende Person erst, ob ein rechtwinkliges Teildreieck vorliegt, und verwirft eine voreilige Pythagoras-Anwendung, falls diese Bedingung fehlt.',
      'In a fresh figure with a diagonal but no marked right angle, the learner first checks whether a right-triangle subfigure exists and rejects premature use of Pythagoras if the condition is absent.'),
  },
  '809ef78a-f282-5593-89be-0f2cb95570ac': {
    decision: 'split_review',
    rationale: 'Bestand aus einer Änderungsrate rekonstruieren, den mittleren Bestand aus einer Bestandsfunktion bilden und die mittlere Änderungsrate bestimmen sind verschiedene Größen mit unterschiedlichen Integranden, Normalisierungen und Einheiten. Auch wenn alle in Integralmodellen vorkommen, sind sie separat beherrschbar; die vierfache Aufzählung ist keine einzelne atomare Kompetenz. „Mittlere Änderungsrate mit bestimmten Integralen“ benötigt insbesondere die Angabe, dass eine Ratenfunktion integriert und durch die Intervalllänge geteilt wird, oder dass sie als Bestandsdifferenzquotient erscheint. Der Quellenverweis allein enthält keine prüfbare Normpassage.',
    understandingEvidence: evidence(
      'Das Integral einer Änderungsrate ergibt eine Bestandsänderung, zu der ein Anfangsbestand hinzukommt. Der mittlere Bestand ist der Intervallmittelwert der Bestandsfunktion; die mittlere Änderungsrate ist dagegen Bestandsänderung je Zeiteinheit. Integrand und Einheiten zeigen den Unterschied.',
      'Integrating a rate of change gives a change in stock, to which an initial stock is added. Mean stock is the interval average of the stock function, whereas mean rate of change is stock change per unit time. Integrand and units distinguish them.',
      'Zu unabhängig gegebenen Anfangsbestand, Ratenfunktion und Zeitintervall rekonstruiert die lernende Person den Endbestand, berechnet eine sachlich gefragte mittlere Größe mit passendem Integranden und Intervallfaktor und erklärt deren Einheit.',
      'Given an independently supplied initial stock, rate function, and time interval, the learner reconstructs the final stock, calculates a requested mean quantity with the appropriate integrand and interval factor, and explains its unit.',
      'In einem neuen Fall mit zeitweise negativem Zu- oder Abfluss unterscheidet die lernende Person den mittleren Bestand von der mittleren Nettoänderungsrate und erklärt, weshalb dieselbe Integralzahl nicht ohne Größen- und Einheitenprüfung beide Antworten liefern kann.',
      'In a fresh case with periods of negative inflow or outflow, the learner distinguishes mean stock from mean net rate of change and explains why one integral value cannot answer both questions without checking quantities and units.'),
  },
  '972cc7e8-be9c-444c-ba45-98e817b3cf14': {
    decision: 'split_review',
    rationale: 'Der Text vereint die Vorwärtsfrage „Wie beeinflusst ein Parameter Lage und Form?“ mit der inversen Bedingungsaufgabe „Welcher Parameter erfüllt gegebene Eigenschaften?“. Graphische Wirkung untersuchen und einen Wert aus Bedingungen ermitteln können unabhängig gelingen. Der gemeinsame Parameterbegriff allein macht sie nicht zu einer atomaren Prüfleistung; begründetes Ergebnis gehört jeweils zur betreffenden Aufgabe. Keine direkte Quelle im Paket grenzt eine engere einzige Kompetenz ab.',
    understandingEvidence: evidence(
      'Ein Parameter verändert eine Funktion innerhalb einer Familie; sein Platz im Term bestimmt, ob etwa Verschiebung oder Skalierung des Graphen eintritt. Bei der Umkehraufgabe werden gegebene Grapheneigenschaften in Bedingungen an den Parameter übersetzt und zulässige Werte geprüft.',
      'A parameter changes a function within a family; its position in the expression determines whether, for example, the graph shifts or scales. In the inverse problem, stated graph properties become conditions on the parameter and admissible values are checked.',
      'Die lernende Person beschreibt für eine unabhängig vorgegebene Funktionsfamilie die Wirkung einer Parametervariation, leitet aus einer geforderten Grapheneigenschaft eine Gleichung für den Parameter ab und überprüft das Ergebnis am ursprünglichen Term.',
      'For an independently supplied function family, the learner describes the effect of varying a parameter, derives a parameter equation from a required graph property, and checks the result against the original expression.',
      'Bei einer neuen Familie, in der der Parameter innerhalb statt außerhalb eines Funktionsarguments steht, unterscheidet die lernende Person horizontale von vertikaler Veränderung und prüft, ob eine Bedingung mehrere oder gar keine Parameterwerte zulässt.',
      'For a fresh family with a parameter inside rather than outside a function argument, the learner distinguishes horizontal from vertical change and checks whether a condition permits multiple or no parameter values.'),
  },
  'a594dec0-3977-5c43-9432-d4254a7f6130': {
    decision: 'keep',
    rationale: 'KEEP: Der Titel und die zweisprachigen Beschreibungen geben eine zusammenhängende Anwendung des Spatprodukts auf Spat und zugehörigen Tetraeder an. Der Tetraederfaktor 1/6 folgt aus derselben von drei Kantenvektoren aufgespannten Volumenstruktur und ist hier eine begründete Ableitung, kein unabhängiger Methodenwechsel. Betrag, gemeinsame Eckpunktwahl und Volumeninterpretation sind korrekt; die präzisen Formeln machen eine neue Beschreibung unnötig. Der Bildfall mit orthogonalen Kanten 2, 3, 4 ist Lehrhilfe, kein Beweis unabhängiger Leistung; die Transferaufgabe verlangt nichtorthogonale Kanten und Orientierungsprüfung. Keine direkte Quelle oder vollständige Projektions-/Mappingprüfung im Input.',
    understandingEvidence: evidence(
      'Das Spatprodukt dreier an einem gemeinsamen Punkt ansetzender Kantenvektoren ist ein orientiertes Volumen; sein Betrag ist das geometrische Spatvolumen. Ein von denselben drei Vektoren aufgespanntes Tetraeder nimmt ein Sechstel dieses Volumens ein.',
      'The scalar triple product of three edge vectors based at one common point is oriented volume; its absolute value is the geometric parallelepiped volume. A tetrahedron spanned by the same three vectors occupies one sixth of it.',
      'Die lernende Person wählt zu vier unabhängig gegebenen Raumpunkten drei Kantenvektoren mit gemeinsamem Startpunkt, berechnet das Spatprodukt, nimmt für das Volumen den Betrag und begründet den Faktor 1/6 für das Tetraeder.',
      'Given four independently supplied spatial points, the learner chooses three edge vectors with a common origin, computes the scalar triple product, takes its absolute value for volume, and justifies the factor 1/6 for the tetrahedron.',
      'Bei einer neuen schiefen statt orthogonalen Konfiguration vertauscht die lernende Person zwei Kantenvektoren, erklärt das wechselnde Vorzeichen bei unverändertem Volumen und erkennt den Nullfall bei linear abhängigen Vektoren.',
      'In a fresh skew rather than orthogonal configuration, the learner swaps two edge vectors, explains the sign change with unchanged volume, and recognizes the zero case for linearly dependent vectors.'),
  },
  'a8ff2666-8df3-4253-8021-3efe42114e40': {
    decision: 'split_review',
    rationale: 'Vektorbetrag und Punkt-Punkt-Abstand bilden einen eng verbundenen Längenfall; der Mittelpunkt einer Strecke ist hingegen eine affine Lageberechnung und kann unabhängig beherrscht werden. Das aktuelle atomar markierte Ziel bündelt daher zwei separat prüfbare Leistungen. Eine rein sprachliche Straffung würde den Unterschied zwischen Längen- und Mittelungsoperation verdecken. Die zweisprachigen Texte stimmen im beanspruchten Umfang überein.',
    understandingEvidence: evidence(
      'Der Abstand zweier Raumpunkte ist der Betrag ihres Differenzvektors; der Mittelpunkt entsteht aus der komponentenweisen Mittelung der beiden Ortsvektoren und halbiert die Strecke. Eine Länge ist skalar, ein Mittelpunkt ein Punkt.',
      'The distance between two points in space is the magnitude of their difference vector; the midpoint comes from component-wise averaging of their position vectors and bisects the segment. A length is a scalar, a midpoint a point.',
      'Die lernende Person berechnet für zwei unabhängig gegebene Raumpunkte den Differenzvektor und seine Länge sowie den Mittelpunkt und überprüft durch gleiche Abstände beider Endpunkte die Halbierung.',
      'For two independently supplied spatial points, the learner calculates the difference vector and its length as well as the midpoint, then checks bisection by equal distances from both endpoints.',
      'Bei einer neuen Strecke mit negativen und gebrochenen Koordinaten erklärt die lernende Person, weshalb Vertauschen der Endpunkte den Abstand und Mittelpunkt nicht ändert, obwohl der Differenzvektor sein Vorzeichen wechselt.',
      'For a fresh segment with negative and fractional coordinates, the learner explains why swapping endpoints changes neither distance nor midpoint even though the difference vector reverses sign.'),
  },
  'fde351a8-98b1-5d75-b4df-813beb2bbe3c': {
    decision: 'block',
    rationale: 'Inhaltlich sind Gleichung, Ungleichung und Funktion mögliche Darstellungen derselben Modellierungsentscheidung und müssen nicht künstlich gesplittet werden. Die gebundene Zielmetadaten ordnen das Ziel jedoch Q4/GK-LK zu, während die Buchseite es zusätzlich für Hessen Sek I G8/G9 ausweist; weder sourceRef noch gebundene Mapping-/Kompositionsnachweise klären, ob dies eine beabsichtigte stufenübergreifende Kompetenz oder ein Scopefehler ist. Bis diese Grenze geklärt ist, wäre eine stilistische KEEP-/REVISION-Freigabe irreführend. Das Kioskbild illustriert nur einen Funktionsfall und beweist nicht die eigene Modellierungsleistung.',
    understandingEvidence: evidence(
      'Eine Gleichung drückt eine Gleichheitsbedingung aus, eine Ungleichung eine zulässige Schranke und eine Funktion eine Zuordnung abhängiger Größen. Die Bedeutung von Variablen, Termen, Einheiten und Annahmen entscheidet, welche Darstellung eine Sachsituation passend modelliert.',
      'An equation expresses an equality condition, an inequality an admissible bound, and a function a dependence between quantities. The meanings of variables, terms, units, and assumptions determine which representation fits a situation.',
      'Die lernende Person definiert für eine unabhängig vorgelegte Sachsituation Größen und Annahmen, formuliert eine passende Gleichung, Ungleichung oder Funktion und erklärt, wie jeder Term beziehungsweise jede Grenze zur Situation gehört.',
      'For an independently presented situation, the learner defines quantities and assumptions, formulates a suitable equation, inequality, or function, and explains how each term or bound maps to the situation.',
      'In einem neuen Kontext mit Kapazitätsgrenze statt bloßer Kostenfunktion stellt die lernende Person eine Ungleichung für die zulässige Menge auf, erläutert ihren Gültigkeitsbereich und unterscheidet sie von einer Gleichung für tatsächliche Kosten.',
      'In a fresh context with a capacity limit rather than just a cost function, the learner sets up an inequality for feasible quantity, explains its domain, and distinguishes it from an equation for actual cost.'),
  },
}

const keys = [
  'goalId', 'goalFingerprint', 'pageFingerprint',
  'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn',
]
const runId = `${batch.batchId}.codex-independent-a`
const records = input.goals.map((goal, index) => {
  for (const key of keys) {
    if (goal[key] !== lines[index].goal[key]) throw new Error(`Round A page/input mismatch: ${goal.goalId} ${key}`)
  }
  const judgment = judgments[goal.goalId]
  if (!judgment || goal.reviewContext.evidenceProfile !== null) throw new Error(`Round A scope/P-context changed: ${goal.goalId}`)
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}.${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    ...Object.fromEntries(keys.map((key) => [key, goal[key]])),
    decision: judgment.decision,
    understandingEvidence: judgment.understandingEvidence,
    rationale: judgment.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
})
if (Object.keys(judgments).length !== records.length) throw new Error('Unassigned review judgment')
const recordsBytes = `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const disclosure = {
  execution: 'Independent Codex subagent /root/rebind_two_imagegen_p authored blind Round A; exact serving model identifier not exposed',
  provider: 'openai',
  model: 'Codex; exact serving model identifier not exposed',
  modelVersion: null,
  samplingParameters: 'Not exposed by orchestration; none inferred',
  startedAt: '2026-09-27T17:15:42.000Z',
  timestampScope: 'Run serialization start anchored to authoring-script file mtime; substantive review began earlier and no provider execution timestamp is exposed',
  independence: 'Only the prepared Round A prompt, criteria, inputs and manifest were used. No Round B material, earlier D vote, D adjudication or D registry for these fourteen goals was read. This agent previously worked on separate M7 visualization/P/D packages for different goals; independence means blindness to this campaign’s other D judgments, not model-provider diversity.',
  boundary: 'All fourteen records are AI candidates; no human approval, complete source mapping, effective projection verification or canonical/registry mutation is claimed. Supplied visualization alt text is teaching context only and was not treated as learner evidence.',
}
const disclosureBytes = jsonBytes(disclosure)
const artifactDigest = (role) => bundle.artifacts.find((item) => item.role === role)?.digest
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint: campaign.bundleFingerprint,
  bookDigest: campaign.bookDigest,
  provider: disclosure.provider,
  model: disclosure.model,
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha(disclosureBytes),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'book_pdf', digest: artifactDigest('book_pdf') },
    { role: 'review_markdown', digest: artifactDigest('review_markdown') },
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
    { role: 'review_prompt', digest: campaign.promptFingerprint },
    { role: 'review_criteria', digest: campaign.criteriaFingerprint },
    { role: 'run_manifest_schema', digest: artifactDigest('run_manifest_schema') },
  ],
  startedAt: disclosure.startedAt,
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha(recordsBytes),
  toolchainVersion: 'goal-description-review-v1',
}
if (run.inputArtifacts.some(({ digest }) => !digest)) throw new Error('Bound input artifact missing')
const files = [
  [`${round}/runtime-disclosure.json`, disclosureBytes],
  [`${round}/results/${batch.batchId}.records.jsonl`, recordsBytes],
  [`${round}/results/${batch.batchId}.run.json`, jsonBytes(run)],
]
process.stdout.write(`*** Begin Patch\n${files.map(([path, content]) =>
  `*** Add File: ${path}\n${content.trimEnd().split('\n').map((line) => `+${line}`).join('\n')}\n`
).join('')}*** End Patch\n`)
