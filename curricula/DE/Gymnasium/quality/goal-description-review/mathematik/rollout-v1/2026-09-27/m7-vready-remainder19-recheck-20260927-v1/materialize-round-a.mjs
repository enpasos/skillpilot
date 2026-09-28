import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const round = join(root, 'round-a')
const batchId = 'mathematik-m7-vready-remainder19-recheck-20260927-v1-first-pass-a.batch-001'
const runId = 'mathematik-m7-vready-remainder19-recheck-20260927-v1-first-pass-a-codex-unexposed'
const sha256 = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const parse = async (path) => JSON.parse(await readFile(path, 'utf8'))

// Authorial judgments, ordered exactly like the bound campaign. No other review output is read.
const reviews = [
  {
    decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann reellwertige Funktionen als eindeutige Zuordnungen zwischen Zahlenmengen beschreiben und eine gegebene Funktion durch Wertetabelle, Term und Graph darstellen.',
    proposedDescriptionEn: 'The learner can describe real-valued functions as single-valued mappings between sets of numbers and represent a given function with a value table, formula, and graph.',
    euDe: 'Zu jedem zulässigen Eingabewert gehört genau ein Funktionswert. Tabelle, Term und Graph können dieselbe Zuordnung zeigen, doch eine endliche Tabelle bestimmt im Allgemeinen keinen eindeutigen Term.',
    euEn: 'Each permitted input has exactly one function value. A table, formula, and graph can represent the same mapping, but a finite table generally does not determine a unique formula.',
    opDe: 'Die lernende Person erklärt an einer gegebenen Funktion, welche Werte einander zugeordnet werden, erstellt dazu Tabelle und Graph und vergleicht einzelne Wertepaarungen in allen drei Darstellungen.',
    opEn: 'For a given function, the learner explains which values correspond, constructs its table and graph, and compares selected input-output pairs in all three representations.',
    trDe: 'Bei einer neuen graphischen Darstellung mit mehreren Kurvenstücken prüft die lernende Person, ob jedem Eingabewert genau ein Ausgabewert zugeordnet ist, und begründet, welche Tabelle dazu passen kann.',
    trEn: 'For a fresh graph made of several curve segments, the learner checks whether each input has exactly one output and explains which table could represent it.',
    rationale: 'Die gegenwärtige Formulierung „zwischen Wertetabelle, Term und Graph wechseln“ kann eine eindeutige Rekonstruktion eines Terms aus endlich vielen Tabellenwerten nahelegen. Die lokale Revision bindet alle drei Darstellungen an eine gegebene Funktion und nennt die Eindeutigkeit der Zuordnung; sie bewahrt den E.1-Grundlagenumfang. Die gebundene Seite zeigt zusätzlich BW-Sek-I-Geltung, aber keine vollständige Quell- oder Projektionsprüfung.'
  },
  {
    decision: 'block',
    euDe: 'Punkt-Punkt-Abstand ist die Länge eines Differenzvektors; ein Punkt-Gerade-Abstand ist die kürzeste senkrechte Strecke, die aus Projektion und Skalarprodukt gewonnen werden kann. Für andere Objektpaare ändern sich die geometrischen Bedingungen.',
    euEn: 'Point-to-point distance is the length of a difference vector; point-to-line distance is the shortest perpendicular segment, obtainable with projection and a scalar product. Other pairs of objects require different geometric conditions.',
    opDe: 'Die lernende Person unterscheidet an unbekannten Raumdaten einen Punktabstand von einem Punkt-Gerade-Abstand, bestimmt jeweils die passende kürzeste Strecke und deutet das Ergebnis geometrisch.',
    opEn: 'For unfamiliar spatial data, the learner distinguishes a distance between points from a point-to-line distance, determines the appropriate shortest segment in each case, and interprets it geometrically.',
    trDe: 'Wird statt eines Punktpaars ein Punkt und eine schiefe Gerade vorgegeben, stellt die lernende Person eine Senkrechtbedingung auf und prüft, ob die gefundene Strecke tatsächlich minimal ist.',
    trEn: 'When a point and an oblique line replace a pair of points, the learner sets up a perpendicularity condition and checks whether the resulting segment is genuinely shortest.',
    rationale: '„Abstände zwischen Punkten und Geraden“ lässt offen, welche Objektpaare zu diesem Ziel gehören; Punkt-Punkt, Punkt-Gerade und Gerade-Gerade wären verschiedene Leistungen. Der Titel nennt außerdem Längen, die Beschreibung Koordinaten, Projektionen und Skalarprodukt ohne Zuordnung zu einem Fall. Direkter sourceRef und gebundene Mappingbelege fehlen; vor einer verantwortbaren Textrevision müssen Zielumfang und Überschneidung mit spezifischen Abstandszielen geklärt werden.'
  },
  {
    decision: 'block',
    euDe: 'Zwei Ebenen können identisch, echt parallel oder in einer Geraden schneiden. Rang und Lösungsmenge des zugehörigen linearen Gleichungssystems müssen zu dieser geometrischen Lage passen.',
    euEn: 'Two planes can coincide, be distinct and parallel, or intersect in a line. The rank and solution set of their associated linear system must agree with that geometric relation.',
    opDe: 'Die lernende Person löst für zwei neu vorgegebene Ebenen das lineare System, unterscheidet keine, unendlich viele oder eine Schnittgerade als Lösung und erklärt die entsprechende Lage.',
    opEn: 'For two newly given planes, the learner solves the linear system, distinguishes no solution, coincident planes, or an intersection line, and explains the corresponding position.',
    trDe: 'Bei Ebenen in einer anderen Darstellungsform stellt die lernende Person zuerst ein äquivalentes System auf und begründet daraus die Lage, statt sie nur aus einer Skizze abzulesen.',
    trEn: 'For planes given in a different representation, the learner first forms an equivalent system and justifies their relation from it rather than reading it only from a sketch.',
    rationale: 'Der Titel beansprucht Ebene-Ebene und Gerade-Ebene, die aktuelle DE/EN-Beschreibung prüft aber ausschließlich zwei Ebenen. Q2.3 S. 43 belegt den LK-Teil zu zwei Ebenen; Gerade-Ebene ist dort ein eigener grundlegender Inhalt auf S. 42. Die Entscheidung, ob Titel/Identität verschmälert oder eine zweite Kompetenz aufgenommen wird, ist strukturell und durch einen neuen Beschreibungstext allein nicht verantwortbar.'
  },
  {
    decision: 'split_review',
    euDe: 'Kugeloberfläche und Kugelvolumen messen verschiedene Größen: Fläche skaliert mit dem Quadrat des Radius, Volumen mit dessen dritter Potenz. Die beiden Formeln und Einheiten müssen geometrisch getrennt begründet und angewandt werden.',
    euEn: 'Sphere surface area and volume measure different quantities: area scales with the square of the radius, volume with its cube. Their formulas and units require distinct geometric explanations and applications.',
    opDe: 'Die lernende Person erläutert an einer neuen Kugel, warum Oberflächeninhalt und Volumen unterschiedlich vom Radius abhängen, berechnet beide Größen und ordnet Flächen- beziehungsweise Raumeinheiten korrekt zu.',
    opEn: 'For a new sphere, the learner explains why surface area and volume depend differently on radius, calculates both quantities, and assigns area and volume units correctly.',
    trDe: 'Wenn der Radius eines kugelförmigen Gegenstands skaliert wird, sagt die lernende Person die getrennten Auswirkungen auf benötigtes Hüllmaterial und Rauminhalt voraus und prüft sie rechnerisch.',
    trEn: 'When the radius of a spherical object is scaled, the learner predicts the distinct effects on covering material and enclosed volume and checks them numerically.',
    rationale: 'Die Plausibilisierung und Anwendung von Kugeloberfläche einerseits und Kugelvolumen andererseits sind separat beherrschbar; ein Radius-Skalierungsargument verbindet sie zwar, macht daraus aber nicht eine atomare Kompetenz. Die vorhandene semanticAtomic-Markierung entscheidet diese fachliche Frage nicht. Eine Textglättung würde die Doppelkompetenz verdecken; der gebundene Input liefert keinen direkten sourceRef für die breite Geltung.'
  },
  {
    decision: 'split_review',
    euDe: 'Beim Bestimmen einer Stammfunktion wird die Ableitung einer gesuchten Funktion mit dem gegebenen Polynom verknüpft; eine additive Konstante bleibt frei. Eine bereits vorgegebene Stammfunktion kann anschließend ein Integral oder einen rekonstruierten Bestand liefern, wenn Grenzen beziehungsweise Anfangswert bekannt sind.',
    euEn: 'Finding an antiderivative reverses differentiation of the given polynomial, with a free additive constant. A supplied antiderivative can then yield an integral or reconstructed stock when bounds or an initial value are known.',
    opDe: 'Die lernende Person bestimmt ohne Hilfsmittel eine Stammfunktion eines neuen Polynoms und kontrolliert sie durch Ableiten; in einer getrennten Aufgabe nutzt sie eine vorgegebene Stammfunktion samt Grenzen oder Anfangswert zur Berechnung und Deutung.',
    opEn: 'The learner finds an antiderivative of a new polynomial without aids and checks it by differentiation; in a separate task, the learner uses a supplied antiderivative with bounds or an initial value to calculate and interpret a result.',
    trDe: 'Wechselt die Aufgabe von der eigenen Stammfunktionssuche zu einer gegebenen Stammfunktion mit Anfangsbestand, verwendet die lernende Person den Hauptsatz und unterscheidet Bestandsänderung vom Bestand.',
    trEn: 'When the task changes from finding an antiderivative to using a supplied one with an initial stock, the learner applies the fundamental theorem and distinguishes change in stock from stock itself.',
    rationale: 'Stammfunktionen selbst bestimmen und vorgegebene Stammfunktionen in Integral- oder Rekonstruktionsaufgaben nutzen können unabhängig beherrscht werden; das Hilfsmittelverbot betrifft zudem nur den ersten Teil. Der Titel und beide Texte verbinden diese Leistungen ausdrücklich. Eine einheitliche Wortrevision würde die getrennte Beurteilbarkeit verschleiern; die aktuelle Vorlage enthält keinen direkten sourceRef.'
  },
  {
    decision: 'split_review',
    euDe: 'Das Volumen eines geraden Prismas entsteht aus Grundflächeninhalt mal Höhe und wird in Raumeinheiten gemessen. Seine Oberfläche entsteht aus der Summe der äußeren Teilflächen, einschließlich Grund- und Deckfläche, und wird in Flächeneinheiten gemessen.',
    euEn: 'A right prism has volume equal to base area times height, measured in cubic units. Its surface area is the sum of its outer faces, including both bases, measured in square units.',
    opDe: 'Die lernende Person zerlegt ein unbekanntes gerades Prisma in geeignete Grund- und Seitenflächen, berechnet Volumen und Oberfläche getrennt und erläutert, welche Sachgröße jedes Ergebnis beschreibt.',
    opEn: 'The learner decomposes an unfamiliar right prism into appropriate base and side faces, calculates volume and surface area separately, and explains what real quantity each result describes.',
    trDe: 'Bei einem neuen Prisma mit nicht rechteckiger Grundfläche unterscheidet die lernende Person erneut die für Volumen und Oberfläche nötigen Flächen und prüft die unterschiedlichen Einheiten.',
    trEn: 'For a fresh prism with a nonrectangular base, the learner again distinguishes the areas needed for volume and surface area and checks the different units.',
    rationale: 'Volumen und Oberfläche verlangen verschiedene Zerlegungen, Größen und Einheiten und können getrennt sicher oder unsicher beherrscht werden. Das Deuten der Ergebnisse gehört jeweils zur passenden Berechnung. Eine gemeinsame Beschreibung würde zwei Kompetenzen als ein Ziel behandeln; direkte gebundene Quellenbelege für eine solche Bündelung fehlen.'
  },
  {
    decision: 'block',
    euDe: 'Eine besondere Lage im Raum muss durch passende algebraische Bedingungen gestützt sein: etwa Richtungs- und Normalenvektoren für Parallelität oder Orthogonalität sowie eine Punktprobe für Enthaltensein oder Schnitt.',
    euEn: 'A special spatial relation needs appropriate algebraic conditions: for example, direction and normal vectors for parallelism or perpendicularity, and a point test for containment or intersection.',
    opDe: 'Für eine konkret benannte besondere Lage zwischen Gerade und Ebene stellt die lernende Person eine prüfbare Vektor- oder Gleichungsbedingung auf und erklärt, warum deren Ergebnis die geometrische Behauptung trägt.',
    opEn: 'For a specifically named special relation between a line and a plane, the learner sets up a testable vector or equation condition and explains why its result supports the geometric claim.',
    trDe: 'Ändert sich in einer neuen Raumfigur die behauptete Lage von parallel zu orthogonal, wählt die lernende Person ein anderes Kriterium und kontrolliert die Schlussrichtung.',
    trEn: 'When a fresh spatial configuration changes the claimed relation from parallel to perpendicular, the learner selects a different criterion and checks the direction of the inference.',
    rationale: '„Besondere Lagebeziehungen“ benennt weder die geforderten Objektpaare noch die konkreten Lagen; zugleich sind Lagebeziehung Gerade-Ebene, Schnittpunkt und Winkel bereits direkte Vorbedingungen. Ohne direkten sourceRef oder gebundene Scope-Zuordnung lässt sich die eigenständige LK-Zusatzleistung dieses BW-Ziels nicht bestimmen. Die Beispielfälle im Evidenzentwurf sind nur Prüfmaßstäbe, keine behauptete Quellenabdeckung.'
  },
  {
    decision: 'block',
    euDe: 'Eine Parallelprojektion auf eine Ursprungsebene entlang einer Richtung außerhalb dieser Ebene ordnet jedem Raumpunkt genau den Schnitt seiner Richtungsgeraden mit der Zielebene zu. Die Abbildung ist linear, lässt Ebenenpunkte fest und ihre Matrix entsteht aus den Bildern der Basisvektoren.',
    euEn: 'A parallel projection onto a plane through the origin along a direction outside that plane sends each point to the unique intersection of its direction line with the target plane. The map is linear, fixes points of the plane, and its matrix is built from the images of the basis vectors.',
    opDe: 'Für eine neue Ursprungsebene und eine zulässige Projektionsrichtung bestimmt die lernende Person die Bilder der Standardbasis, bildet die Matrix und prüft an einem Punkt der Zielebene deren Fixierung und die zweimalige Projektion.',
    opEn: 'For a new origin plane and an admissible projection direction, the learner finds the images of the standard basis, forms the matrix, and checks that it fixes a point of the plane and remains unchanged under a second projection.',
    trDe: 'Bei einer schiefen statt koordinatenparallelen Zielebene prüft die lernende Person zuerst, dass die Richtung nicht in der Ebene liegt, und konstruiert die Projektionsmatrix erneut aus Basisbildern.',
    trEn: 'For an oblique rather than coordinate-aligned target plane, the learner first checks that the direction is not in the plane and reconstructs the projection matrix from basis images.',
    rationale: 'Die Mathematik der Beschreibung ist konsistent und Q2.5 S. 44 nennt Projektionen auf beliebige Ursprungsebenen ausdrücklich im erhöhten Niveau. Der gebundene Seitenauszug weist das als „(LK)“ betitelte Ziel jedoch in fünfzehn Ländern für GK und LK aus. Ohne gebundene Mapping- oder Projektionsbelege lässt sich dieser Widerspruch nicht als bloße Textfrage auflösen; deshalb keine KEEP- oder Wortrevisionsempfehlung.'
  },
  {
    decision: 'block',
    euDe: 'Kreisumfang und Kreisbogen sind Längen und hängen linear vom Radius ab; Kreisfläche ist eine Fläche und hängt quadratisch vom Radius ab. Ob auch die Fläche eines Kreisteils gemeint ist, lässt die gegenwärtige Beschreibung offen.',
    euEn: 'Circle circumference and arc length are lengths and scale linearly with radius; disk area is an area and scales quadratically with radius. The current description leaves open whether the area of a circle sector is also intended.',
    opDe: 'Die lernende Person berechnet zu einem neuen Kreis seinen Umfang und Flächeninhalt sowie die Länge eines bezeichneten Kreisbogens und erklärt, warum die Ergebnisse unterschiedliche Einheiten tragen.',
    opEn: 'For a new circle, the learner calculates its circumference and area and the length of a specified arc, explaining why the results carry different units.',
    trDe: 'Ändern sich in einer frischen Aufgabe Radius und Mittelpunktswinkel, unterscheidet die lernende Person die Änderung von Bogenlänge und Kreisfläche; eine Kreisteilfläche wird nur geprüft, falls sie als Zielumfang geklärt ist.',
    trEn: 'When radius and central angle change in a fresh task, the learner distinguishes the changes in arc length and disk area; a sector area is assessed only if it is confirmed as part of the goal.',
    rationale: 'Der Titel verspricht Flächeninhalte von Kreisen und Kreisteilen, während beide Beschreibungen nur Flächeninhalte von Kreisen nennen. „Umfänge von Kreisteilen“ kann Bogenlänge oder den ganzen Rand eines Sektors meinen. Zudem sind Längen- und Flächenberechnungen separat beherrschbar. Ohne direkten sourceRef muss zuerst geklärt werden, welche Kreisteile und Größen kanonisch gemeint sind; eine bloße neue Formulierung würde Scope erfinden.'
  },
  {
    decision: 'split_review',
    euDe: 'Ein Integral einer Änderungsrate liefert eine Bestandsänderung, die mit einem Anfangsbestand erst einen rekonstruierten Bestand ergibt. Ein mittlerer Bestand beziehungsweise eine mittlere Änderungsrate entsteht dagegen aus dem jeweiligen Integral geteilt durch die Intervalllänge; Größe und Einheit hängen vom Integranden ab.',
    euEn: 'Integrating a rate gives a change in stock, which becomes a reconstructed stock only with an initial stock. Mean stock or mean rate instead comes from integrating the respective quantity and dividing by interval length; the integrand determines the meaning and unit.',
    opDe: 'Die lernende Person entscheidet bei unbekannten Bestands- und Ratenfunktionen, ob das Integral eine Änderung oder einen Mittelwert liefert, setzt gegebenenfalls einen Anfangsbestand hinzu und interpretiert die Einheit des Ergebnisses.',
    opEn: 'For unfamiliar stock and rate functions, the learner decides whether an integral yields a change or a mean, adds an initial stock when needed, and interprets the result’s unit.',
    trDe: 'Wechselt eine neue Aufgabe von gegebener Änderungsrate zu gegebenem Bestand, ändert die lernende Person Integrand und Deutung passend, statt dieselbe Integralformel als Bestandsrekonstruktion zu verwenden.',
    trEn: 'When a fresh task changes from a given rate to a given stock, the learner changes the integrand and interpretation appropriately rather than treating the same integral formula as a stock reconstruction.',
    rationale: 'Q1.2 S. 37 nennt rekonstruierte Bestände, mittlere Bestände und mittlere Änderungsraten gemeinsam als Anwendungen. Diese Ausgaben beruhen aber auf unterscheidbaren Modellentscheidungen und können separat beherrscht werden; der zusätzliche unqualifizierte „Bestand“ im Text macht die Grenze noch unklarer. Eine reine Wortkorrektur löst die Mehrfachkompetenz nicht. Das Bild ist Lehrhilfe, kein Nachweis einer solchen Integration.'
  },
  {
    decision: 'split_review',
    euDe: 'Vektorbetrag und Punktabstand beruhen auf der Länge eines Verschiebungsvektors. Der Mittelpunkt dagegen halbiert die Verbindung zweier Punkte und ist eine affine Lagebestimmung, keine Längenberechnung.',
    euEn: 'Vector magnitude and point-to-point distance use the length of a displacement vector. A midpoint instead bisects the segment joining two points and is an affine position, not a length calculation.',
    opDe: 'Die lernende Person bildet für neue Raumpunkte den Differenzvektor, berechnet daraus Betrag und Abstand und bestimmt davon getrennt den Mittelpunkt; sie zeigt die drei Ergebnisse an einer Skizze.',
    opEn: 'For new spatial points, the learner forms the difference vector, calculates its magnitude and the distance, and separately finds the midpoint, showing all three results in a sketch.',
    trDe: 'Werden die Punkte in einem anderen Koordinatensystem oder in umgekehrter Reihenfolge gegeben, prüft die lernende Person, dass Abstand und Mittelpunkt unverändert bleiben, obwohl der Differenzvektor sein Vorzeichen ändern kann.',
    trEn: 'When the points are given in another coordinate system or in reverse order, the learner checks that distance and midpoint stay the same even though the difference vector may reverse sign.',
    rationale: 'Betrag und Abstand sind eng verbunden; die Mittelpunktberechnung ist eine unabhängig erlernbare Lagekompetenz. Der eine aktuelle Marker semanticAtomic:true ersetzt diese inhaltliche Trennung nicht. Eine gemeinsame Beschreibung könnte eine korrekte Distanzrechnung fälschlich als Beleg für Mittelpunktverständnis werten. Ein direkter sourceRef für die gesamte J9-Bündelung ist im gebundenen Input nicht vorhanden.'
  },
  {
    decision: 'keep',
    euDe: 'Ein eindeutiger Schnittpunkt liegt zugleich auf der Geraden und der Ebene. Das Einsetzen der Geradenparameter in die Ebenengleichung liefert den passenden Parameter; keine oder unendlich viele Lösungen bedeuten keinen eindeutigen Schnittpunkt.',
    euEn: 'A unique intersection lies on both the line and the plane. Substituting the line parameter into the plane equation gives the relevant parameter; no solution or infinitely many solutions means there is no unique intersection point.',
    opDe: 'Die lernende Person setzt in einer neuen Raumaufgabe eine Geradengleichung in eine Ebenengleichung ein, bestimmt bei eindeutigem Schnitt die Punktkoordinaten und kontrolliert beide Objektgleichungen.',
    opEn: 'In a new spatial problem, the learner substitutes a parametric line equation into a plane equation, finds the point coordinates when the intersection is unique, and checks both object equations.',
    trDe: 'Ist die Ebene statt in Koordinatenform in Normalenform gegeben, nutzt die lernende Person dieselbe gemeinsame Punktbedingung und erkennt einen parallelen Fall ohne eindeutigen Schnittpunkt.',
    trEn: 'When the plane is given in normal rather than coordinate form, the learner uses the same shared-point condition and recognizes a parallel case with no unique intersection point.',
    rationale: 'Titel und Beschreibung begrenzen das Ziel auf die Berechnung eines Gerade-Ebene-Schnittpunkts samt geometrischer Deutung; die Rechnung und ihre Prüfung sind eine zusammenhängende Kompetenz. Die BW-Quelle 3.4.3 Kompetenz 6 nennt für LK die rechnerische Bestimmung des Schnittgebildes. Der gebundene Input enthält keinen direkten sourceRef oder vollständigen Mappingnachweis; KEEP betrifft allein die klare aktuelle Wortfassung, nicht die externe Geltungsfreigabe.'
  },
  {
    decision: 'split_review',
    euDe: 'Ein Lotfuß realisiert den kürzesten Abstand durch Orthogonalität zur jeweiligen Zielgeraden oder Zielebene. Punkt-Objekt-, parallele Objekt- und windschiefe Gerade-Gerade-Fälle verlangen jedoch verschiedene Unbekannte und Begründungen für den gemeinsamen Normalenabschnitt.',
    euEn: 'A perpendicular foot realizes a shortest distance through orthogonality to the relevant line or plane. Point-to-object, parallel-object, and skew-line cases nevertheless require different unknowns and justifications of a common perpendicular segment.',
    opDe: 'Die lernende Person entwickelt für einen unbekannten Punkt-Ebene-Fall einen Lotfuß und für einen windschiefen Gerade-Gerade-Fall einen gemeinsamen Lotabschnitt, berechnet die Längen und begründet jeweils die Minimalität.',
    opEn: 'The learner develops a perpendicular foot for an unfamiliar point-to-plane case and a common perpendicular segment for skew lines, calculates the lengths, and justifies minimality in each case.',
    trDe: 'Ändert sich die Lage zweier Geraden von windschief zu parallel, wechselt die lernende Person zu einer geeigneten Punkt-Gerade-Reduktion und erklärt, warum das neue Verfahren denselben kürzesten Abstand liefert.',
    trEn: 'When two lines change from skew to parallel, the learner switches to a suitable point-to-line reduction and explains why the new method gives the shortest distance.',
    rationale: 'Q2.3 S. 43 nennt Lotfußpunktverfahren für Abstände zwischen Punkten, Geraden und Ebenen als LK-Bereich. Die aktuelle Beschreibung verlangt aber mehrere separat beherrschbare Konfigurationen, darunter windschiefe Geraden und parallele Ebenen, zusätzlich zu bereits vorausgesetzten Einzelverfahren. Eine Aufteilung nach geometrischer Fallklasse beziehungsweise eine klar definierte Auswahl-Metakompetenz ist strukturell zu entscheiden; ein Wortwechsel allein genügt nicht.'
  },
  {
    decision: 'keep',
    euDe: 'Bei einer Funktionenschar hängen die Grapheneigenschaften sowohl von der Verknüpfung der Exponential- und Polynomanteile als auch vom Parameter ab. Addition, Multiplikation und Verkettung verändern diese Abhängigkeit unterschiedlich; aus einer Einzelkurve allein folgt keine Aussage für alle Parameterwerte.',
    euEn: 'In a function family, graph properties depend on both the combination of exponential and polynomial parts and the parameter. Addition, multiplication, and composition affect that dependence differently; one member graph alone cannot establish a claim for all parameter values.',
    opDe: 'Die lernende Person untersucht eine neu gegebene verknüpfte Funktionenschar, beschreibt an Term und Graph den Einfluss eines Parameters auf ein charakteristisches Merkmal und begründet die Aussage für die betrachteten Parameterwerte.',
    opEn: 'The learner investigates a newly given linked function family, describes from formula and graph how a parameter affects a characteristic feature, and justifies the claim for the parameter values considered.',
    trDe: 'Wird in einer frischen Schar die additive Verknüpfung durch ein Produkt oder eine Verkettung ersetzt, prüft die lernende Person erneut, welches Graphenmerkmal der Parameter tatsächlich steuert, statt die vorige Wirkung zu übertragen.',
    trEn: 'When a fresh family replaces addition with a product or composition, the learner rechecks which graph feature the parameter actually controls instead of carrying over the previous effect.',
    rationale: 'Die beiden direkten Vorbedingungen decken Verknüpfungsarten und Parameterdeutung einzeln ab; dieses Q4.1-Ziel integriert sie zu einer konkreten Untersuchung von verknüpften Funktionenscharen. Die drei in Quelle und Text genannten Operationen sind Varianten der Konstruktion, über die derselbe Parameter-Graph-Zusammenhang zu prüfen ist. DE und EN stimmen überein; Detailfälle gehören ins neue Evidenzprofil. Es wird keine vollständige länderübergreifende Quellprojektion behauptet.'
  },
  {
    decision: 'keep',
    euDe: 'Ein bestimmtes Integral kann mit einer passenden Stammfunktion über Randwerte berechnet werden; deren Ableitung muss den ursprünglichen Integranden ergeben. Verknüpfungen aus Exponential- und Polynomanteilen sind je nach Struktur unterschiedlich zu behandeln, und nicht jede scheinbar ähnliche Form erlaubt denselben Ansatz.',
    euEn: 'A definite integral can be evaluated from the endpoint values of a suitable antiderivative, whose derivative must recover the original integrand. Linked exponential and polynomial parts require different treatment according to their structure; a similar-looking form need not allow the same approach.',
    opDe: 'Die lernende Person berechnet für einen neuen geeigneten verknüpften Integranden ein Integral, weist die gewählte Stammfunktion durch Ableiten nach und prüft, dass die ausgewerteten Grenzen zum Integral passen.',
    opEn: 'For a new suitable linked integrand, the learner evaluates an integral, verifies the chosen antiderivative by differentiation, and checks that the endpoint evaluation matches the integral.',
    trDe: 'Wechselt die Verknüpfung in einer neuen Aufgabe von einer Summe zu einem Produkt, sucht oder prüft die lernende Person eine passende Stammfunktion neu, statt die Summenregel ungeprüft zu übertragen.',
    trEn: 'When a fresh task changes the linkage from a sum to a product, the learner finds or checks an appropriate antiderivative anew rather than applying the sum rule without justification.',
    rationale: 'Q4.1 S. 51 verbindet Integralberechnung bei diesen Funktionsverknüpfungen ausdrücklich mit dem Stammfunktionsnachweis durch Ableiten. Berechnung und Nachweis bilden hier eine kohärente Arbeits- und Kontrollkette, während die vorausgesetzte Fähigkeit „Stammfunktionen durch Ableiten nachweisen“ nur das Werkzeug liefert. Die aktuelle DE/EN-Beschreibung ist knapp und fachlich korrekt für geeignete konkrete Integranden; sie behauptet keine allgemeine elementare Integrierbarkeit aller denkbaren Verkettungen.'
  },
  {
    decision: 'block',
    euDe: 'Ein Fixpunkt einer linearen Abbildung erfüllt A x = x, also (A − I)x = 0. Der Nullvektor ist stets ein Fixpunkt; weitere Fixpunkte bilden je nach Lösungsraum eine Gerade, Ebene oder den ganzen Raum durch den Ursprung.',
    euEn: 'A fixed point of a linear map satisfies A x = x, equivalently (A − I)x = 0. The zero vector is always fixed; further fixed points may form a line, plane, or the entire space through the origin, according to the solution space.',
    opDe: 'Die lernende Person stellt für eine unbekannte lineare Abbildung das Fixpunkt-Gleichungssystem auf, löst es vollständig und deutet die Lösungsmenge als geometrische Menge unveränderter Punkte.',
    opEn: 'For an unfamiliar linear map, the learner sets up the fixed-point system, solves it completely, and interprets its solution set as the geometric set of unchanged points.',
    trDe: 'Bei einer neuen Matrix, deren Fixpunktmenge nicht nur aus dem Ursprung besteht, begründet die lernende Person die zusätzliche freie Richtung und prüft einen nichttrivialen Fixpunkt durch Abbilden.',
    trEn: 'For a new matrix whose fixed-point set contains more than the origin, the learner explains the extra free direction and checks a nontrivial fixed point by applying the map.',
    rationale: 'Die Gleichung und das Verfahren sind mathematisch klar; das benannte KC Q2.5 S. 44 führt Fixpunkte aber ausschließlich im erhöhten LK-Niveau. Die gebundene Lernzielseite weist dasselbe „(LK)“-Ziel in fünfzehn Ländern zugleich für GK und LK aus. Ohne gebundene Belege zur effektiven Zielprojektion und zur Quellenabdeckung kann dieser Scope-Widerspruch nicht per Beschreibung korrigiert werden.'
  },
  {
    decision: 'block',
    euDe: 'Bei einer festgelegten räumlichen Spiegelung müssen Urbild und Bildpunkt durch die zugehörige Symmetriegeometrie verbunden sein; bei Ebenenspiegelung liegt ihr Mittelpunkt in der Spiegelebene und die Verbindungsstrecke steht senkrecht auf ihr.',
    euEn: 'Under a specified spatial reflection, original and image point must satisfy the associated symmetry geometry; for reflection in a plane, their midpoint lies in that plane and the joining segment is perpendicular to it.',
    opDe: 'Die lernende Person berechnet für eine neu vorgegebene Spiegelebene den Bildpunkt und kontrolliert Mittelpunkt, Lotrichtung und gleiche Abstände beider Punkte von der Ebene.',
    opEn: 'For a newly given mirror plane, the learner calculates the image point and checks the midpoint, perpendicular direction, and equal distances of the two points from the plane.',
    trDe: 'Wird die Spiegelebene schief statt koordinatenparallel angegeben, konstruiert die lernende Person das Lot neu und prüft dieselben Symmetriebedingungen ohne Übernahme einer einfachen Koordinatenregel.',
    trEn: 'When the mirror plane is oblique rather than coordinate-aligned, the learner reconstructs the perpendicular and checks the same symmetry conditions without reusing a simple coordinate rule.',
    rationale: 'Q2.3 S. 43 spricht im LK von allgemeinem Spiegeln von Punkten, Geraden und Ebenen, die vorliegende Punktbeschreibung benennt jedoch kein Spiegelobjekt. Der direkte Vorgänger behandelt bereits Punktspiegelung an Ebenen; die aktuelle Illustration zeigt nur die spezielle Ebene x = 2. Ob hier andere Spiegelachsen oder ein allgemeineres Ebenenverfahren gemeint sind, ist anhand der gebundenen Seite nicht entscheidbar. Deshalb wäre eine Ebenenformulierung ohne geklärte Zielidentität eine unbelegte Verengung.'
  },
  {
    decision: 'block',
    euDe: 'Das Spiegelbild einer Geraden entsteht aus den Bildern zweier verschiedener Punkte unter derselben räumlichen Spiegelung; die Bildgerade muss deren geometrische Symmetriebedingungen erfüllen. Bei Ebenenspiegelung lassen sich die Punktbilder durch Lot- und Mittelpunktbedingungen prüfen.',
    euEn: 'The image of a line is determined by the images of two distinct points under the same spatial reflection; the image line must satisfy the associated symmetry conditions. For a mirror plane, the point images can be checked through perpendicularity and midpoint conditions.',
    opDe: 'Die lernende Person spiegelt zwei selbst gewählte Punkte einer neuen Geraden an einer gegebenen Ebene, stellt die Bildgerade auf und prüft die Symmetrie beider Punktpaare.',
    opEn: 'The learner reflects two independently chosen points of a new line in a given plane, forms the image line, and checks the symmetry of both point pairs.',
    trDe: 'Schneidet die Ausgangsgerade in einer neuen Lage die Spiegelebene, prüft die lernende Person den festen Schnittpunkt und konstruiert die Bildgerade aus einem weiteren gespiegelten Punkt.',
    trEn: 'When the original line meets the mirror plane in a fresh configuration, the learner checks the fixed intersection point and constructs the image line from another reflected point.',
    rationale: 'Die Beschreibung nennt „allgemeine räumliche Konfigurationen“, aber nicht das Spiegelobjekt. Q2.3 S. 43 nennt allgemeines Spiegeln, während die gebundene Abbildung nur die Koordinatenebene x = 2 als Spezialfall zeigt; BW nennt als Beispiel sogar eine Geradenspiegelung an einem Punkt. Eine Wortrevision auf Ebenenspiegelung könnte somit die Länder- und Quellenreichweite unbelegt verkleinern. Vor KEEP muss geklärt sein, welche Spiegelung diese Zielidentität fordert.'
  },
  {
    decision: 'block',
    euDe: 'Eine gespiegelte Ebene wird durch die Bilder dreier nicht kollinearer Punkte bestimmt, sofern dieselbe Spiegelung auf alle drei wirkt. Bei Ebenenspiegelung liegen die Mittelpunkte der Punkt-Bildpunkt-Strecken in der Spiegelebene, und die Strecken stehen senkrecht auf ihr.',
    euEn: 'A reflected plane is determined by the images of three noncollinear points when the same reflection acts on all three. For a mirror plane, the midpoints of the point-image segments lie in it and those segments are perpendicular to it.',
    opDe: 'Die lernende Person wählt auf einer neuen Ausgangsebene drei nicht kollineare Punkte, spiegelt sie an einer gegebenen Ebene, stellt die Bildnebene auf und kontrolliert die drei Punktpaare geometrisch.',
    opEn: 'The learner selects three noncollinear points on a new original plane, reflects them in a given plane, forms the image plane, and checks all three point pairs geometrically.',
    trDe: 'Wenn die Ausgangsebene die schief liegende Spiegelebene schneidet, prüft die lernende Person, welche Punkte auf der Schnittgeraden fest bleiben, und nutzt dies zur Kontrolle der Bildnebene.',
    trEn: 'When the original plane intersects an oblique mirror plane, the learner checks which points on their intersection line remain fixed and uses that fact to check the image plane.',
    rationale: 'Auch dieses Ziel nennt weder die Art noch das Objekt der Spiegelung. Die Quelle Q2.3 S. 43 belegt „Spiegeln von Punkten, Geraden und Ebenen allgemein“, aber die gebundene Illustration zeigt allein zwei parallele Ebenen und die Spiegelebene x = 2. Eine Beschreibung nur für diesen Fall wäre nicht quellgetreu, eine uneingeschränkte allgemeine Forderung ohne festgelegtes Spiegelobjekt nicht unabhängig prüfbar. Die Zielgrenze ist vor einer Textfreigabe zu klären.'
  },
]

if (reviews.length !== 19) throw new Error(`Expected 19 authored reviews, found ${reviews.length}`)
const [input, campaign, bundle] = await Promise.all([
  parse(join(round, 'description-review-input.json')),
  parse(join(round, 'description-review-campaign.json')),
  parse(join(round, 'review-bundle-manifest.json')),
])
if (input.goalCount !== 19 || campaign.goalCount !== 19 || campaign.batches.length !== 1) {
  throw new Error('The bound 19-goal campaign changed')
}
const evidenceKeys = [
  ['essentialUnderstandingDe', 'euDe'], ['essentialUnderstandingEn', 'euEn'],
  ['observablePerformanceDe', 'opDe'], ['observablePerformanceEn', 'opEn'],
  ['transferExpectationDe', 'trDe'], ['transferExpectationEn', 'trEn'],
]
const records = input.goals.map((goal, index) => {
  const review = reviews[index]
  const understandingEvidence = Object.fromEntries(evidenceKeys.map(([key, source]) => [key, review[source]]))
  const record = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `m7-vready-remainder19-20260927-a-${String(index + 1).padStart(2, '0')}`,
    runId, campaignId: campaign.campaignId, roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint, bookDigest: campaign.bookDigest,
    goalId: goal.goalId, goalFingerprint: goal.goalFingerprint, pageFingerprint: goal.pageFingerprint,
    currentTitleDe: goal.currentTitleDe, currentTitleEn: goal.currentTitleEn,
    currentDescriptionDe: goal.currentDescriptionDe, currentDescriptionEn: goal.currentDescriptionEn,
    decision: review.decision,
    ...(review.decision === 'revise' ? {
      proposedDescriptionDe: review.proposedDescriptionDe,
      proposedDescriptionEn: review.proposedDescriptionEn,
    } : {}),
    understandingEvidence,
    rationale: review.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: goal.reviewContext.evidenceProfile ? 'revise' : 'create',
    recordStatus: 'candidate', reviewAuthority: 'ai_candidate',
  }
  if (goal.goalId !== campaign.batches[0].goalIds[index]) throw new Error(`Goal order changed at ${index + 1}`)
  return record
})
const recordBytes = Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
const artifact = (role) => {
  const found = bundle.artifacts.find((item) => item.role === role)
  if (!found) throw new Error(`Missing bound artifact ${role}`)
  return { role, digest: found.digest }
}
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1, runId, campaignId: campaign.campaignId, roundId: campaign.roundId,
  batchId, batchInputFingerprint: campaign.batches[0].batchInputFingerprint,
  bundleFingerprint: campaign.bundleFingerprint, bookDigest: campaign.bookDigest,
  provider: 'OpenAI', model: 'Codex model not exposed to reviewer', role: 'didactic_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-v2',
  promptFingerprint: campaign.promptFingerprint, criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha256('Codex runtime model and generation parameters not exposed to reviewer; blind independent first pass; nineteen ordered goals'),
  independenceGroupId: campaign.independenceGroupId, blindToOtherRuns: true,
  goalIds: campaign.batches[0].goalIds,
  inputArtifacts: [
    artifact('book_pdf'), artifact('review_input_jsonl'),
    { role: 'description_review_batch_input_jsonl', digest: campaign.batches[0].batchInputFingerprint },
    artifact('review_prompt'), artifact('review_criteria'),
  ],
  startedAt: '2026-09-27T01:11:03Z', completedAt: new Date().toISOString(),
  status: 'completed', outputDigest: sha256(recordBytes), toolchainVersion: 'goal-description-review-v2',
}
await Promise.all([
  writeFile(join(round, 'results', `${batchId}.records.jsonl`), recordBytes),
  writeFile(join(round, 'results', `${batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`),
])
console.log(JSON.stringify({ records: records.length, decisions: Object.fromEntries([...new Set(records.map((r) => r.decision))].map((key) => [key, records.filter((r) => r.decision === key).length])) }))
