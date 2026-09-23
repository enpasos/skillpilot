// Blind, independent Round B. Read only this round's bound input and shared bundle.
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const campaign = JSON.parse(readFileSync(resolve(here, 'description-review-campaign.json')))
const bundle = JSON.parse(readFileSync(resolve(here, 'review-bundle-manifest.json')))
const batch = campaign.batches[0]
const inputBytes = readFileSync(resolve(here, 'batches', `${batch.batchId}.input.jsonl`))
const inputs = inputBytes.toString('utf8').trim().split('\n').map(JSON.parse)
const digest = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
if (digest(inputBytes) !== batch.batchInputFingerprint || inputs.length !== 17) throw new Error('Round-B input changed')
if (bundle.bundleFingerprint !== campaign.bundleFingerprint || bundle.bookModelDigest !== campaign.bookDigest) throw new Error('Bound book changed')

const decisions = [
  {
    id: '8064088b-dc0a-4a67-ad63-360fdcc9869d', decision: 'split_review',
    rationale: 'Titel und aktueller Zieltext sind nicht deckungsgleich: Der Titel nennt auch Flächeninhalte von Kreisteilen, die DE/EN-Beschreibung aber nur Kreisflächen. Umfang/Bogenlänge einerseits und Flächeninhalt andererseits sind unabhängig prüfbare Leistungen; eine bloße Textergänzung würde die Atomicity-Frage verdecken. Die Illustration zeigt rechnerisch zutreffende Vollkreis- und Halbkreisumfänge, löst diese Zieltextspannung jedoch nicht. Der gebundene Ausschnitt enthält keinen Quellentext, aus dem die beabsichtigte Teilflächenabdeckung geklärt werden könnte.',
    u: [
      'Kreisumfang und Bogenlänge messen Randlängen; Kreis- und Kreisteilflächen messen überdeckte Flächen. Radius, Durchmesser und der jeweilige Anteil am Vollkreis verbinden die Größen, ihre Einheiten und Berechnungen sind aber verschieden.',
      'Circumference and arc length measure boundaries; circle and circle-part areas measure covered regions. Radius, diameter, and the fraction of the full circle connect the quantities, but their units and calculations differ.',
      'An einer neuen Kreisfigur bestimmt die lernende Person zuerst die gesuchte Rand- oder Flächengröße, setzt Radius oder Durchmesser und den Kreisteil korrekt in Beziehung und erläutert die Bedeutung der erhaltenen Längen- oder Flächeneinheit.',
      'For a new circle diagram, the learner first identifies whether a boundary or an area is required, relates radius or diameter and the circle part correctly, and explains the resulting length or area unit.',
      'Bei einem aus Halbkreis und Geraden zusammengesetzten Rand trennt sie Bogenlänge von gerader Kante; bei einem geänderten Flächenauftrag erkennt sie, dass diese Randrechnung keine Fläche liefert und bestimmt den passenden Kreisanteil.',
      'For a boundary made of a semicircle and straight edges, the learner separates arc length from the straight segment; when the task instead asks for area, they recognize that the boundary calculation is insufficient and determine the relevant circle fraction.',
    ],
  },
  {
    id: '59d5a330-61be-4590-ab46-cf7cefecd144', decision: 'split_review',
    rationale: 'Volumen und gesamte Oberfläche eines geraden Prismas sind zwei eigenständige Messgrößen mit verschiedenen räumlichen Zerlegungen, Einheiten und Anwendungssituationen. Eine Person kann V=G·h verstehen, ohne Mantelflächen zuverlässig zu erfassen, und umgekehrt. Der aktuelle DE/EN-Text bündelt beide samt Deutung; dies ist nicht durch eine lokale Umformulierung atomar zu machen. Das Originalbild rechnet am 3-4-5-Dreiecksprisma beide Beispielwerte korrekt, ersetzt aber keine unabhängige Zielprüfung.',
    u: [
      'Das Volumen eines geraden Prismas ergibt sich aus gleich großen Grundflächen-Schichten entlang der senkrechten Höhe; seine Oberfläche besteht aus zwei Grundflächen und den Seitenflächen. Kubische und quadratische Einheiten unterscheiden Inhalt von Hülle.',
      'A right prism’s volume comes from equal base-area layers along its perpendicular height; its surface consists of two bases and the lateral faces. Cubic and square units distinguish capacity from covering.',
      'Die lernende Person markiert an einem neuen Prisma Grundfläche, senkrechte Höhe und Seitenflächen, erklärt die beiden unterschiedlichen Zerlegungen und berechnet V und O mit sachgemäßen Einheiten.',
      'On a new prism, the learner identifies the base, perpendicular height, and lateral faces, explains the two different decompositions, and computes V and total surface area with appropriate units.',
      'Bei einem Prisma mit anderer Grundform und schräger Zeichnung erkennt sie weiterhin die tatsächliche senkrechte Höhe und begründet, warum Materialbedarf für eine Hülle nicht mit dem Füllvolumen berechnet wird.',
      'For a prism with a different base shape shown in an oblique view, the learner still identifies the true perpendicular height and explains why covering material cannot be calculated from filling volume.',
    ],
  },
  {
    id: '50612a57-7b9d-45fd-bc08-e95556444760', decision: 'keep',
    rationale: 'Der DE/EN-Zieltext nennt genau die geometrische Plausibilisierung: geeignete Pyramiden gleicher Höhe mit zunehmend kreisnaher Grundfläche und den Übergang von G_n zu πr² in V=G_nh/3. Die Pyramiden-Volumenformel ist bereits Voraussetzung. Die Originalzeichnung unterstützt dies mit Dreiecks-, Vier-, Sechs- und Vielecksgrundflächen; sie ist keine eigenständige Leistungsbestätigung. Ein formaler Analysis-Grenzwertbeweis wird nicht verlangt.',
    u: [
      'Bei Pyramiden mit festgehaltener Höhe und zunehmend kreisnahen Grundflächen bleibt der Faktor 1/3 in V=G·h erhalten; nähert sich G der Kreisfläche πr², entsteht plausibel die Kegelformel V=(πr²h)/3.',
      'For pyramids of fixed height with bases approaching a disk, the factor 1/3 in V=G·h remains; as G approaches the circle area πr², the cone formula V=(πr²h)/3 becomes plausible.',
      'Die lernende Person skizziert oder beschreibt eine geeignete Folge von Pyramiden, hält Höhe und Radiusbezug konsistent und erklärt, warum der Übergang der Grundflächen die Kegelformel stützt.',
      'The learner sketches or describes a suitable sequence of pyramids, keeps height and radius correspondence consistent, and explains why the changing base areas support the cone formula.',
      'Bei einem Kegel mit anderer Höhe und einem einbeschriebenen statt umbeschriebenen Vieleck prüft sie, ob die Näherung weiterhin kreisnah wird und welche Größen für die Volumenbegründung unverändert bleiben müssen.',
      'For a cone of another height and an inscribed rather than circumscribed polygon, the learner checks whether the approximation still approaches a disk and which quantities must remain fixed for the volume argument.',
    ],
  },
  {
    id: '74d29d0c-80b3-4d46-a5f5-3c2f609e8483', decision: 'keep',
    rationale: 'Schrägbild, Netz und Fachbegriffe gehören hier zu derselben Raum-zu-Ebene-Darstellungskompetenz für Pyramiden und Kegel; Grund- und Mantelfläche werden an den selbst erstellten Darstellungen lokalisiert. DE/EN stimmen überein. Das Originalbild sollte separat bei V geprüft werden: Die gezeigte Kegel-Mantelfläche sieht wie eine linsenartige, doppelt gekrümmte Region statt wie ein Kreissektor aus. Diese mögliche Bildschwäche macht den gebundenen Zieltext nicht unklar.',
    u: [
      'Schrägbild und Netz zeigen denselben Körper auf unterschiedliche Weise: Eine Pyramide hat eine polygonale Grundfläche mit dreieckigen Seitenflächen, ein gerader Kreiskegel einen Grundkreis und einen kreissektorförmig abwickelbaren Mantel. Fachbegriffe bezeichnen korrespondierende Teile beider Darstellungen.',
      'An oblique sketch and a net show the same solid in different ways: a pyramid has a polygonal base and triangular lateral faces, while a right circular cone has a circular base and a lateral surface that unfolds into a circular sector. Technical terms refer to corresponding parts across both representations.',
      'Die lernende Person fertigt für einen neu beschriebenen Körper ein plausibles Schrägbild und ein dazu passendes Netz an und zeigt darin Grundfläche, Mantelflächen und für den Kegel die Mantellinie.',
      'For a newly specified solid, the learner constructs a plausible oblique sketch and matching net and identifies the base, lateral faces or surface, and the cone’s slant height.',
      'Bei veränderter Pyramidengrundform oder anderen Kegelmaßen erkennt sie, welche Netze zum Schrägbild passen und weshalb ein falsches Netz mit nicht zusammenpassenden Kanten beziehungsweise Bogenlängen nicht geschlossen werden kann.',
      'For a pyramid with another base polygon or a cone with changed dimensions, the learner identifies nets matching the sketch and explains why a mismatched net with incompatible edges or arc length cannot close into the solid.',
    ],
  },
  {
    id: 'b9f2cf6b-f892-46a5-8f0b-2a916f0f2f8e', decision: 'keep',
    rationale: 'Die drei Körper sind konkrete Variationen einer einheitlichen Kompetenz: Form einer rotationssymmetrischen Fläche aus erzeugender ebener Figur und Achse erschließen. Rechteck, rechtwinkliges Dreieck und Halbkreisscheibe im Bild tragen diesen Zusammenhang fachlich passend. Der Text fordert keine Volumen- oder Oberflächenrechnung und dupliziert die Nachbarziele nicht.',
    u: [
      'Ein Rotationskörper entsteht aus allen Lagen einer ebenen Fläche beim Drehen um eine festgelegte Achse; Achsenlage und Erzeugerfigur entscheiden über Zylinder-, Kegel- oder Kugelform. Die Rotation der bloßen Randlinie würde nur eine Oberfläche, nicht den gefüllten Körper erzeugen.',
      'A solid of revolution is formed by all positions of a planar region rotated around a specified axis; the axis and generating region determine whether the result is a cylinder, cone, or sphere. Rotating only the boundary curve would create a surface, not the filled solid.',
      'Die lernende Person ordnet einem Rechteck, einem rechtwinkligen Dreieck und einer Halbkreisscheibe jeweils eine passende Drehachse und den entstehenden Körper zu und erklärt die Gestalt aus der Bewegung der ganzen Fläche.',
      'The learner matches a rectangle, a right triangle, and a semicircular region with a suitable rotation axis and resulting solid, and explains each shape from the motion of the full region.',
      'Bei einer neu vorgegebenen Achse, die nicht an derselben Figurenseite liegt, prüft sie, ob derselbe Körper entsteht, und begründet die veränderte Innen- und Außenkontur statt allein den Körpernamen zu raten.',
      'With a newly specified axis not on the same side of the figure, the learner checks whether the same solid results and explains the changed inner and outer boundary rather than merely naming a solid.',
    ],
  },
  {
    id: 'a4f6f5e4-f790-48d1-8b49-c9dc048c9d83', decision: 'keep',
    rationale: 'Begründen und Berechnen sind hier eine kohärente Kompetenz: Der Kegelmantel wird als Kreissektor abgewickelt, dessen Bogenlänge dem Grundkreisumfang entspricht; danach ist O=πr²+πrs anwendbar. Das Originalbild zeigt die Beziehung und r=3, h=4, s=5 mit O=24π cm² korrekt. Die Beschreibung bleibt methodenoffen durch „geeignete Skizzen oder Netze“ und ist DE/EN deckungsgleich.',
    u: [
      'Die Gesamtoberfläche eines geraden Kreiskegels besteht aus Grundkreis und Mantel. Der Mantel wird zum Kreissektor mit Radius s und Bogenlänge 2πr; daraus folgt M=πrs und O=πr²+πrs, wobei s die Mantellinie und nicht die senkrechte Höhe ist.',
      'A right circular cone’s total surface comprises its circular base and lateral surface. The latter unfolds to a sector of radius s and arc length 2πr; hence M=πrs and O=πr²+πrs, where s is slant height, not perpendicular height.',
      'Die lernende Person zeichnet oder erklärt das Kegelnetz, begründet den Umfangs-Bogenlängen-Zusammenhang, bestimmt nötigenfalls s aus r und h und berechnet die Gesamtoberfläche mit Flächeneinheit.',
      'The learner sketches or explains the cone net, justifies the circumference–arc-length correspondence, finds s from r and h if needed, and computes total surface area with area units.',
      'Bei einem offenen Trichter ohne Grundkreis und vorgegebener Höhe statt Mantellinie passt sie die verwendeten Teilflächen an und begründet, warum weder der Grundkreis noch h direkt in die Mantelflächenformel gehört.',
      'For an open funnel without a base disk and given height rather than slant height, the learner adjusts the included surfaces and explains why neither the base disk nor h enters the lateral-area formula directly.',
    ],
  },
  {
    id: '1ea06c0c-5c60-45cd-8f31-638de98820b4', decision: 'split_review',
    rationale: 'Die Zielbeschreibung verknüpft zwei unabhängig beherrschbare Kugelkompetenzen: Struktur und Deutung von O=4πr² sowie von V=4πr³/3 und ihre jeweilige Anwendung. Oberfläche und Volumen haben unterschiedliche Dimensionen und fachliche Begründungen; eine lokale Wortkorrektur ersetzt die notwendige Atomicity-Prüfung nicht, obwohl das vorhandene Bild beide Formeln mit r=2 rechnerisch richtig illustriert. Das gespeicherte semanticAtomic=true ist Reviewkontext, aber kein Veto gegen belegten Split-Bedarf.',
    u: [
      'Die Kugeloberfläche O=4πr² misst die äußere Hülle; das Kugelvolumen V=4πr³/3 misst den gefüllten Raum. Beide hängen vom Radius ab, skalieren aber verschieden: Flächen mit r², Volumina mit r³.',
      'Sphere surface area O=4πr² measures the outer boundary, while sphere volume V=4πr³/3 measures enclosed space. Both depend on radius but scale differently: area with r², volume with r³.',
      'Die lernende Person erläutert an einer neuen Kugel, welcher Sachauftrag Hülle und welcher Rauminhalt verlangt, nutzt den Radius statt des Durchmessers und berechnet beide Größen mit jeweils passender Einheit.',
      'For a new sphere, the learner explains which practical question concerns covering and which concerns capacity, uses the radius rather than diameter, and calculates both quantities with the correct units.',
      'Bei verdoppeltem Radius prognostiziert sie vor der Rechnung den vierfachen Oberflächeninhalt und das achtfache Volumen und prüft damit eine neue Material- oder Füllmengenangabe.',
      'When radius doubles, the learner predicts four times the surface area and eight times the volume before calculating, then uses this to check a new covering or filling quantity.',
    ],
  },
  {
    id: 'd9725eb6-6b1f-5674-9f17-3de10f5b1ed8', decision: 'keep',
    rationale: 'Die DE/EN-Beschreibung fordert die Herleitung genau einer Identität und legt weder einen bloßen Zahlencheck noch eine spezielle Herleitungsmethode fest. Mit dem vorausgesetzten Einheitskreis führt x²+y²=1 und x=cos α, y=sin α unmittelbar zur Aussage. Das Bild zeigt einen ersten-Quadranten-Zugang korrekt; die Allgemeinheit folgt aus Quadranten und Quadratsummen, nicht allein aus diesem Beispiel. Der benannte BW-Quellenverweis ist ein Verweis, kein hier vorliegender Wortlaut.',
    u: [
      'Auf dem Einheitskreis sind cos α und sin α die Koordinaten eines Punktes; ihr Quadratsummenwert ist wegen x²+y²=r² und r=1 für jeden Winkel gleich eins. Vorzeichen in anderen Quadranten ändern die Quadrate nicht.',
      'On the unit circle, cos α and sin α are a point’s coordinates; their sum of squares equals one for every angle because x²+y²=r² with r=1. Coordinate signs in other quadrants do not change the squares.',
      'Die lernende Person zeichnet für einen Winkel einen Einheitskreispunkt, benennt die beiden Koordinaten und leitet sin²α+cos²α=1 aus dem Satz des Pythagoras oder der Kreisgleichung ab.',
      'The learner draws a unit-circle point for an angle, identifies both coordinates, and derives sin²α+cos²α=1 from Pythagoras or the circle equation.',
      'Für einen Winkel im zweiten Quadranten begründet sie trotz negativem Kosinus dieselbe Beziehung und erklärt, weshalb ein einzelner Zahlencheck die Identität nicht beweist.',
      'For an angle in the second quadrant, the learner justifies the same relation despite negative cosine and explains why one numerical check does not prove the identity.',
    ],
  },
  {
    id: '674baaa8-911d-5231-9330-881c5288634f', decision: 'keep',
    rationale: 'Der Text benennt exakt die Komplementwinkelidentität und eine anschauliche oder rechnerische Herleitung. Die Darstellung am rechtwinkligen Dreieck ist für spitze Winkel richtig: Die dem Komplementwinkel gegenüberliegende Kathete ist die an α anliegende Kathete. Eine allgemeinere Deutung über den Einheitskreis ist mit den angegebenen Voraussetzungen möglich, ohne die Zielbeschreibung zu verbreitern. Keine belegte Textschwäche.',
    u: [
      'In einem rechtwinkligen Dreieck sind α und 90°−α komplementär; dieselbe Kathete ist zu α anliegend und zum anderen Winkel gegenüberliegend. Ihre Länge im Verhältnis zur gemeinsamen Hypotenuse ist daher zugleich cos α und sin(90°−α).',
      'In a right triangle, α and 90°−α are complementary; the same leg is adjacent to α and opposite the other angle. Its ratio to the shared hypotenuse therefore equals both cos α and sin(90°−α).',
      'Die lernende Person markiert an einem neuen rechtwinkligen Dreieck beide spitzen Winkel, bezeichnet die gemeinsame Kathete aus beiden Blickrichtungen und leitet die Verhältnisgleichheit statt sie nur einzusetzen.',
      'On a new right triangle, the learner marks both acute angles, names the shared leg from each angle’s viewpoint, and derives the equality of ratios rather than merely substituting values.',
      'Bei einem gedrehten oder gespiegelten Dreieck erkennt sie die Komplementbeziehung unabhängig von der Lage auf dem Papier und stellt die passende Sinus-Kosinus-Gleichung selbst auf.',
      'For a rotated or reflected right triangle, the learner recognizes the complementary relation independently of page orientation and formulates the corresponding sine–cosine equality.',
    ],
  },
  {
    id: '4cba85d3-2e25-5c4b-9c4c-37e5b201dce7', decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann für Winkel mit cos(α) ≠ 0 die Beziehung tan(α) = sin(α)/cos(α) aus den trigonometrischen Verhältnissen herleiten.',
    proposedDescriptionEn: 'The learner can derive tan(α) = sin(α)/cos(α) from trigonometric ratios for angles with cos(α) ≠ 0.',
    rationale: 'Die bisherige DE/EN-Beschreibung gibt den Quotienten ohne die notwendige Definitionsbedingung an. Für cos α=0 ist die rechte Seite nicht definiert; die lokale Ergänzung beseitigt den fachlichen Fehler, ohne eine zusätzliche Methode oder Kompetenz zu verlangen. Das Originalbild benutzt einen spitzen Winkel im rechtwinkligen Dreieck und ist dort korrekt; es belegt aber nicht die unqualifizierte Allgemeinheit des Zieltexts.',
    u: [
      'Im rechtwinkligen Dreieck teilen sin α und cos α dieselbe Hypotenuse als Nenner. Ihr Quotient kürzt diese heraus und ergibt Gegenkathete/Ankathete=tan α, sofern die Ankathete und damit cos α nicht null sind.',
      'In a right triangle, sin α and cos α share the hypotenuse as denominator. Dividing cancels it and gives opposite/adjacent=tan α, provided the adjacent leg and hence cos α are not zero.',
      'Die lernende Person stellt an einem neuen rechtwinkligen Dreieck die drei Verhältnisse auf, kürzt sin α/cos α nachvollziehbar und nennt die Bedingung für einen definierten Quotienten.',
      'On a new right triangle, the learner writes the three ratios, cancels sin α/cos α explicitly, and states the condition under which the quotient is defined.',
      'Bei einem zweiten Winkel oder einer Einheitskreis-Skizze prüft sie vor einer Quotientenrechnung, ob cos α null wird, und erklärt, warum die Beziehung an einer vertikalen Radiusrichtung keinen Tangenswert liefert.',
      'For another angle or unit-circle diagram, the learner checks whether cos α is zero before taking the quotient and explains why a vertical radius direction gives no tangent value.',
    ],
  },
  {
    id: 'bfa2351c-735e-56eb-a778-2413aa68db42', decision: 'keep',
    rationale: 'Dieses Q4-Ziel beschränkt sich auf das Beschreiben beobachtbarer Lage- oder Formänderungen an Schargraphen; algebraische Parameter- oder Extremstellenberechnung ist nicht hineinzuziehen. Der Text ist bilingual, knapp und im Blick auf seine einzige unmittelbar vorausgesetzte Parameterdeutung ausreichend. Das Bild f_a(x)=a·x² illustriert Vorzeichen und Betrag konsistent, ist aber keine vom Lernenden erzeugte Beschreibung.',
    u: [
      'Ein Parameter kennzeichnet verschiedene Mitglieder derselben Funktionsfamilie; Änderungen können eine Lageverschiebung oder Formänderung bewirken. Was aus dem Graphen folgt, hängt davon ab, an welcher Stelle der Parameter im Funktionsterm wirkt; Beispiele allein legen keine universelle Wirkungsregel fest.',
      'A parameter selects members of one function family; changing it may shift the graph or change its shape. The visible effect depends on where the parameter acts in the expression; one example does not establish a universal rule.',
      'Die lernende Person vergleicht mehrere neu vorgelegte Schargraphen, benennt gemeinsame Merkmale und beschreibt mit passenden Parametern, ob Scheitel, Öffnung oder Lage variiert.',
      'The learner compares several newly supplied family graphs, identifies invariant features, and describes with the corresponding parameters whether vertex, opening, or position changes.',
      'Bei einer anderen Familie wie f_a(x)=(x−a)² statt a·x² unterscheidet sie Verschiebung von Formänderung und begründet die Aussage anhand der Graphen, nicht durch Übertragung der ersten Faustregel.',
      'For another family such as f_a(x)=(x−a)² instead of a·x², the learner distinguishes shift from shape change and justifies it from the graphs rather than carrying over the first rule.',
    ],
  },
  {
    id: '7feaaebd-cc8d-522b-8b3a-ea22675c65dd', decision: 'keep',
    rationale: 'Die Beschreibung umfasst eine kohärente parameterabhängige Extremstellenuntersuchung: Ableiten, Kandidaten bestimmen, anhand zulässiger Parameter und eines Kriteriums prüfen. Sie verlangt nicht zusätzlich eine Ortskurve oder Modellkalibrierung; beide stehen als Nachfolger. Das Originalbild enthält einen möglichen Beschriftungsfehler in der Beispielgrafik (unten „2(-4)“ statt eines sauberen Punktlabels); das ist getrennt für V zu prüfen und rechtfertigt keine Textänderung.',
    u: [
      'Extremstellen einer Schar können als Funktionen des Parameters auftreten oder für bestimmte Parameter wegfallen beziehungsweise ihren Typ ändern. Aus f_a′(x)=0 folgen nur Kandidaten; eine Vorzeichen- oder zweite-Ableitungsprüfung sowie Definitionsbedingungen entscheiden über tatsächliche Extremstellen.',
      'Extrema of a function family may depend on the parameter, disappear for certain parameter values, or change type. Solving f_a′(x)=0 yields candidates only; a sign test or second-derivative test and domain conditions establish actual extrema.',
      'Die lernende Person leitet eine neue f_a(x) ab, löst f_a′(x)=0 unter Beachtung der Parameterfälle, prüft den Extremtyp und nennt Lage und gegebenenfalls Funktionswert der Extrempunkte.',
      'The learner differentiates a fresh f_a(x), solves f_a′(x)=0 with attention to parameter cases, checks the extremum type, and states the location and, where requested, function value of the extrema.',
      'Bei einer Schar, deren Ableitung je nach Vorzeichen oder Nullwert des Parameters ihre Nullstellen ändert, trennt sie die Fälle und verwirft eine scheinbare Extremstelle, falls das Prüfkriterium nicht erfüllt ist.',
      'For a family whose derivative zeros change with the parameter’s sign or zero value, the learner separates cases and rejects an apparent extremum if the verification criterion fails.',
    ],
  },
  {
    id: 'fcf9af67-7abd-5f69-a22a-b436297d44c5', decision: 'keep',
    rationale: 'Das Ziel verlangt eine zusammenhängende, parameterabhängige Kurvenuntersuchung ganzrationaler Scharen und die fachsprachliche Deutung der Ergebnisse, ohne eine einzelne obligatorische Methode oder jedes denkbare Merkmal festzuschreiben. Die unmittelbare Voraussetzung erklärt Parameter, der Nachfolger erweitert zur Ortskurve. Das Bild p_a=x²+ax illustriert einen konsistenten Fall mit Nullstellen und Scheitel; für den V2-Nachweis wird ein frischer Parameterfall verlangt.',
    u: [
      'Bei einer ganzrationalen Schar hängen Nullstellen, Symmetrie, Extrema und Lage je nach Term unterschiedlich vom Parameter ab; allgemeine Aussagen müssen die zulässigen Parameterfälle unterscheiden und mit Term und Graph zusammenpassen.',
      'In a polynomial family, zeros, symmetry, extrema, and position can depend on the parameter in different ways; general claims must distinguish admissible parameter cases and agree with both expression and graph.',
      'Die lernende Person untersucht für eine neue ganzrationale Schar fachlich relevante Merkmale in Abhängigkeit von a, begründet Fallunterscheidungen und beschreibt die zugehörigen Graphänderungen mit korrekten Begriffen.',
      'The learner analyzes mathematically relevant properties of a fresh polynomial family as functions of a, justifies any case distinctions, and describes the corresponding graph changes in precise terms.',
      'Bei einer Schar mit einem Parameterwert, an dem der Grad oder die Zahl der Nullstellen wechselt, passt sie ihre Untersuchung an und erklärt, weshalb eine Aussage aus einem einzelnen Beispiel nicht für alle a gilt.',
      'For a family with a parameter value at which degree or number of zeros changes, the learner adapts the analysis and explains why a claim from one sample member does not hold for every a.',
    ],
  },
  {
    id: 'd144a855-9139-55c7-a801-e8b85dab5f01', decision: 'keep',
    rationale: 'Stammfunktion bilden, bestimmtes Integral auswerten und das Ergebnis im Parameterzusammenhang deuten bilden hier eine zusammenhängende Integralkompetenz, nicht bloß beliebig gepaarte Fertigkeiten. Das Beispielbild f_a=ax+1, F_a=ax²/2+x und ∫_0^2 f_a=2a+2 ist rechnerisch korrekt für die dargestellten a-Werte. Die aktuelle zweisprachige Beschreibung ist präzise und verlangt keine bestimmte Rechenroutine.',
    u: [
      'Bei einer ganzrationalen Schar wird der Parameter beim Integrieren nach x als Konstante behandelt; ein bestimmtes Integral entsteht aus F_a(b)−F_a(a) und kann je nach Parameter Vorzeichen und damit Deutung ändern.',
      'When integrating a polynomial family with respect to x, its parameter is held constant; a definite integral is F_a(b)−F_a(a) and may change sign and interpretation with the parameter.',
      'Die lernende Person bildet zu einer neuen Schar eine parameterabhängige Stammfunktion, prüft sie durch Ableiten, wertet ein gegebenes Intervall aus und erläutert die Rolle des Parameters im Ergebnis.',
      'The learner forms a parameter-dependent antiderivative for a new family, checks it by differentiation, evaluates a specified interval, and explains the parameter’s role in the result.',
      'Bei geändertem Intervall oder einem Parameterwert, für den f_a das Vorzeichen wechselt, unterscheidet sie orientiertes Integral von bloßer geometrischer Fläche und überprüft die Deutung am Graphen.',
      'With changed bounds or a parameter value for which f_a changes sign, the learner distinguishes a signed integral from geometric area and checks the interpretation against the graph.',
    ],
  },
  {
    id: 'ccfd4e60-5728-568f-adb7-0b932d8e5aac', decision: 'split_review',
    rationale: 'Der aktuelle Zieltext verlangt das Untersuchen von Scharen für Addition, Multiplikation und Verkettung von Exponential- mit ganzrationalen Funktionen. Diese drei Verknüpfungen erzeugen unterschiedliche Definitions-, Ableitungs- und Verlaufseffekte und können unabhängig beherrscht oder verfehlt werden. Das Bild illustriert lediglich den Additionsfall e^x+a, nicht die übrigen beiden; eine einzelne lokale Textänderung verdeckte das Atomicity- und Abdeckungsproblem. Der Quellenverweis ist im Bundle nicht als Originalwortlaut nachprüfbar.',
    u: [
      'Addition, Produkt und Verkettung verbinden Exponential- und ganzrationale Anteile strukturell verschieden; der Parameter kann Lage, Steigung, Nullstellen oder asymptotisches Verhalten unterschiedlich beeinflussen. Eine an einem Additionsbeispiel beobachtete vertikale Verschiebung gilt nicht automatisch für Produkt oder Verkettung.',
      'Addition, multiplication, and composition combine exponential and polynomial parts in structurally different ways; a parameter can affect position, slope, zeros, or asymptotic behavior differently. A vertical shift seen in one additive example does not automatically apply to a product or composition.',
      'Die lernende Person identifiziert in einer neuen Schar die Verknüpfungsart, untersucht daraus begründet relevante Graphmerkmale und erläutert anhand verschiedener Parameterwerte, welche Merkmale invariant bleiben oder sich ändern.',
      'For a fresh family, the learner identifies the combination type, analyzes graph properties justified by that structure, and explains across parameter values which properties remain invariant or change.',
      'Bei einem Wechsel von e^x+a zu a·e^x oder e^{x+a} prüft sie neu, ob Verschiebung oder Streckung vorliegt und wie sich Nullstellen, Ableitung und Grenzverhalten ändern, statt die erste Graphregel zu kopieren.',
      'When switching from e^x+a to a·e^x or e^{x+a}, the learner reassesses shift versus scaling and the changes in zeros, derivative, and limiting behavior rather than copying the first graph rule.',
    ],
  },
  {
    id: '0e8417d7-effb-5314-93ba-a571b01726ce', decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann für geeignete Verknüpfungen von Exponential- und ganzrationalen Funktionen Stammfunktionen bestimmen, sie durch Ableiten prüfen und bestimmte Integrale berechnen.',
    proposedDescriptionEn: 'The learner can find antiderivatives for suitable combinations of exponential and polynomial functions, check them by differentiation, and compute definite integrals.',
    rationale: '„Integrale bei verknüpften ... Funktionen berechnen“ ist ohne Auswahlbedingung zu pauschal: Bei beliebiger Verkettung wie e^(x²) steht keine elementare Stammfunktion zur Verfügung. Eine kleine Einschränkung auf geeignete Verknüpfungen beseitigt den mathematischen Überanspruch, ohne die intendierte Integralkompetenz oder Methodenneutralität zu verlieren; das explizite Prüfen war schon Teil des bestehenden Textes. Das Bild behandelt das fachlich korrekte Produkt x·e^x und ∫_0^1 x·e^x dx=1, nicht alle Verknüpfungen.',
    u: [
      'Bei geeigneten verknüpften Exponential- und ganzrationalen Termen ist eine Stammfunktion eine Funktion F mit F′=f; die Probe durch Ableiten prüft den gesamten Ausdruck und ein bestimmtes Integral wird aus Randwerten von F berechnet. Nicht jede beliebige Verkettung besitzt eine elementar darstellbare Stammfunktion.',
      'For suitable combined exponential and polynomial expressions, an antiderivative F satisfies F′=f; differentiation checks the full expression, and a definite integral follows from endpoint values of F. Not every arbitrary composition has an elementary antiderivative.',
      'Die lernende Person findet für ein neu gegebenes lösbares Produkt oder eine Summe eine passende Stammfunktion, leitet sie als Probe ab und wertet daraus ein bestimmtes Integral mit korrekten Grenzen aus.',
      'For a fresh solvable product or sum, the learner finds a suitable antiderivative, differentiates it as a check, and evaluates a definite integral with the correct bounds.',
      'Bei einem veränderten Polynomfaktor oder Vorfaktor der Exponentialfunktion passt sie ihre Stammfunktion an und begründet über die Ableitungsprobe, warum die alte Form nicht unverändert übernommen werden darf.',
      'When the polynomial factor or exponential coefficient changes, the learner adapts the antiderivative and uses the derivative check to justify why the previous form cannot be reused unchanged.',
    ],
  },
  {
    id: 'e33e75e3-eae5-5a09-862f-d1a11176373f', decision: 'keep',
    rationale: 'Der aktuelle Text begrenzt die Scharen ausdrücklich auf Parameterwirkungen durch Streckung, Stauchung oder Verschiebung bekannter Klassen und fordert die Graphdeutung. Das ist eine zusammenhängende Transformationskompetenz; die Voraussetzungen zu allgemeinem Transformationsterm und Parametern passen. Das Bild g_a(x)=(x−a)² zeigt die horizontale Verschiebung für −1, 0 und 2 konsistent. DE/EN sind semantisch gleichwertig.',
    u: [
      'Wenn ein Parameter in einer bekannten Funktionsklasse ausschließlich eine Streckung, Stauchung oder Verschiebung verursacht, lassen sich Lage- und Formänderungen aus seiner Position im Term vorhersagen. Die Grundform und geeignete Invarianten bleiben dabei erhalten.',
      'When a parameter in a known function class causes only stretching, compression, or shifting, its position in the expression predicts changes in graph position and shape. The basic form and relevant invariants remain.',
      'Die lernende Person ordnet bei einer neu vorgegebenen Schar Term und mehrere Graphen zu, erklärt die Richtung und Größe der Transformation für konkrete Parameterwerte und begründet konstante Merkmale.',
      'For a newly given family, the learner matches the expression to several graphs, explains the direction and size of the transformation for concrete parameter values, and justifies invariant features.',
      'Beim Wechsel von f(x−a) zu f(x)+a oder a·f(x) leitet sie für einen frischen Graphen die jeweils andere Wirkung her und korrigiert die verbreitete Verwechslung von horizontalem und vertikalem Versatz.',
      'When changing from f(x−a) to f(x)+a or a·f(x), the learner derives the different effect on a fresh graph and corrects the common confusion between horizontal and vertical shifts.',
    ],
  },
]

const runId = `${batch.batchId}.codex-b`
const keys = ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']
const records = decisions.map((d, index) => {
  const bound = inputs[index]
  const goal = bound.goal
  if (d.id !== goal.goalId || bound.batchId !== batch.batchId) throw new Error(`Round-B order changed at ${index}`)
  const record = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}.${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    goalId: goal.goalId,
    goalFingerprint: goal.goalFingerprint,
    pageFingerprint: goal.pageFingerprint,
    currentTitleDe: goal.currentTitleDe,
    currentTitleEn: goal.currentTitleEn,
    currentDescriptionDe: goal.currentDescriptionDe,
    currentDescriptionEn: goal.currentDescriptionEn,
    decision: d.decision,
    understandingEvidence: Object.fromEntries(keys.map((key, i) => [key, d.u[i]])),
    rationale: d.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
  if (d.decision === 'revise') {
    record.proposedDescriptionDe = d.proposedDescriptionDe
    record.proposedDescriptionEn = d.proposedDescriptionEn
  }
  return record
})
const outputBytes = Buffer.from(`${records.map(record => JSON.stringify(record)).join('\n')}\n`)
const artifact = role => {
  const found = bundle.artifacts.find(item => item.role === role)
  if (!found) throw new Error(`Missing bundle artifact ${role}`)
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
  bundleFingerprint: campaign.bundleFingerprint,
  bookDigest: campaign.bookDigest,
  provider: 'OpenAI',
  model: 'Codex agent; exact model identifier and sampling parameters not exposed; independent blind round B, no different-model claim',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: digest('host-managed sampling parameters not exposed'),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    artifact('book_model'), artifact('book_html'), artifact('book_pdf'),
    artifact('review_prompt'), artifact('review_criteria'), artifact('run_manifest_schema'),
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt: timestamp,
  completedAt: timestamp,
  status: 'completed',
  outputDigest: digest(outputBytes),
  toolchainVersion: 'codex-agent-description-review-v2',
}
const resultDir = resolve(here, 'results')
mkdirSync(resultDir, { recursive: true })
writeFileSync(resolve(resultDir, `${batch.batchId}.records.jsonl`), outputBytes, { flag: 'wx' })
writeFileSync(resolve(resultDir, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`, { flag: 'wx' })
process.stdout.write(`Wrote ${records.length} blind Round-B records; ${JSON.stringify(Object.fromEntries(['keep','revise','split_review','block'].map(k=>[k,records.filter(r=>r.decision===k).length])))}\n`)
