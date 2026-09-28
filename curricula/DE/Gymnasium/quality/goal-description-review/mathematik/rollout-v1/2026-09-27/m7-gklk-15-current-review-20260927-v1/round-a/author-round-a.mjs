import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const digest = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const readJson = async (name) => JSON.parse(await readFile(resolve(here, name), 'utf8'))
const campaign = await readJson('description-review-campaign.json')
const input = await readJson('description-review-input.json')
const bundle = await readJson('review-bundle-manifest.json')
const batch = campaign.batches[0]
const runId = `${campaign.roundId}.run-001`

const reviews = [
  {
    decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann Folgenglieder aus einer expliziten Vorschrift berechnen und erklären, wie diese jedem Index unmittelbar ein Glied zuordnet.',
    proposedDescriptionEn: 'The learner can compute terms from an explicit rule and explain how it assigns a term directly to each index.',
    evidence: [
      'Eine explizite Vorschrift ordnet einem zulässigen Index unmittelbar einen Folgengliedwert zu; Index, Startindex und Wert haben verschiedene Rollen.',
      'An explicit rule directly assigns a term value to each admissible index; the index, starting index, and value have different roles.',
      'Die lernende Person bestimmt auch nicht benachbarte Glieder aus einer gegebenen expliziten Vorschrift und erläutert, welcher Index eingesetzt wird und was der erhaltene Wert bezeichnet.',
      'The learner finds nonconsecutive terms from a given explicit rule and explains which index is used and what the resulting value denotes.',
      'Bei einer neuen expliziten Folge mit verschobenem Startindex oder eingeschränktem Indexbereich berechnet und deutet sie ein angefragtes Glied ohne rekursives Fortzählen.',
      'For a new explicit sequence with a shifted starting index or restricted index domain, the learner computes and interprets a requested term without recursively counting forward.',
    ],
    rationale: 'Die aktuelle Beschreibung nennt Berechnung und fachsprachliche Deutung, aber „die Darstellung“ bleibt unbestimmt und der Titel verspricht Darstellen. Die lokale Fassung macht die direkte Zuordnung Index–Glied sichtbar, ohne das separate Ziel „Bildungsgesetze aufstellen“ zu übernehmen. Bayerns M12-V.2 bestätigt explizite Folgen, ist aber ein wählbares Modul des Vertiefungskurses; die im Buch angezeigte bundesweite LK-Projektion ist durch sourceRef und Roh-Anwendbarkeit allein nicht belegt. Das gebundene JPG bleibt bloße Lernhilfe.',
  },
  {
    decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann aus Startwerten und einer Rekursionsregel Folgenglieder schrittweise berechnen und das Bildungsgesetz an Beispielen wie Fibonacci- oder Newton-Folgen erläutern.',
    proposedDescriptionEn: 'The learner can compute sequence terms step by step from initial values and a recurrence rule and explain the formation rule using examples such as Fibonacci or Newton sequences.',
    evidence: [
      'Eine rekursive Vorschrift benötigt geeignete Startwerte und bestimmt weitere Glieder aus früheren Gliedern; die Zahl der benötigten Vorgänger hängt von der Regel ab.',
      'A recurrence needs suitable initial values and determines later terms from earlier terms; the number of preceding terms required depends on the rule.',
      'Die lernende Person berechnet mehrere aufeinanderfolgende Glieder, bezeichnet die jeweils benutzten Vorgänger und erklärt bei einer Fibonacci- oder Newton-Folge die Rolle der Startwerte und der Regel.',
      'The learner computes several successive terms, identifies the preceding terms used at each step, and explains the roles of initial values and rule in a Fibonacci or Newton sequence.',
      'Für eine neue Rekursion mit verändertem Startwert oder veränderter Abhängigkeit von Vorgängern verfolgt sie die nächsten Glieder und begründet die Änderung gegenüber dem Ausgangsfall.',
      'For a new recurrence with a changed initial value or changed dependence on preceding terms, the learner traces the next terms and explains the change from the original case.',
    ],
    rationale: '„Beispiele ... deuten“ lässt offen, was rekursive Darstellung bedeutet. Die Fassung bindet den Rechengang an Startwerte und Regel, ohne das spätere Erfinden eines Bildungsgesetzes zu verlangen. Bayern M12-V.2 nennt Fibonacci und Newton ausdrücklich, als Vertiefungskursmodul jedoch ohne Nachweis einer universellen LK-Pflicht in allen angezeigten Ländern. Das gebundene JPG ist keine Leistungsprobe.',
  },
  {
    decision: 'keep',
    evidence: [
      'Endlich viele vorgegebene Folgenglieder können zu verschiedenen Bildungsgesetzen passen; ein geeignetes Gesetz muss die bekannten Glieder erzeugen und seine Annahmen offenlegen.',
      'A finite list of given sequence terms can fit different formation rules; a suitable rule must generate the known terms and make its assumptions explicit.',
      'Die lernende Person formuliert zu gegebenen Gliedern eine passende explizite oder rekursive Regel, überprüft sie an allen Vorgaben und begründet das erkannte Muster, ohne Eindeutigkeit vorzutäuschen.',
      'The learner states a suitable explicit or recursive rule for given terms, checks it against every supplied term, and justifies the pattern without pretending it is unique.',
      'Bei einer neuen Folge mit einem zusätzlichen Glied, das die erste Mustervermutung widerlegt, passt sie die Regel an oder erklärt, warum mehrere Regeln weiterhin möglich sind.',
      'For a new sequence with an additional term that refutes the first pattern conjecture, the learner revises the rule or explains why several rules remain possible.',
    ],
    rationale: '„Ein passendes“ statt „das“ Bildungsgesetz vermeidet bereits den falschen Eindeutigkeitsanspruch. Begründen verbindet Muster und Regel; die genauere Prüfung gehört in das V2-Profil. Das bayerische M12-V.2 belegt die Umkehroperation, seine optionale Vertiefungskursstruktur belegt allein keine bundesweite LK-Projektion. Das gebundene JPG trägt keine eigenständige Quellenevidenz.',
  },
  {
    decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann Folgen auf Monotonie und Beschränktheit untersuchen, für monotone und beschränkte Folgen Konvergenz folgern und Grenzwerte konvergenter Folgen bestimmen.',
    proposedDescriptionEn: 'The learner can analyze sequences for monotonicity and boundedness, infer convergence for sequences that are both monotone and bounded, and determine limits of convergent sequences.',
    evidence: [
      'Monotonie zusammen mit Beschränktheit liefert ein hinreichendes Konvergenzkriterium; das Fehlen einer dieser Eigenschaften allein beweist keine Divergenz, und ein Grenzwert ist ein eigener Bestimmungsschritt.',
      'Monotonicity together with boundedness gives a sufficient convergence criterion; the absence of either property alone does not prove divergence, and finding a limit is a separate step.',
      'Die lernende Person prüft Monotonie und Schranken einer konkreten Folge, begründet eine zulässige Konvergenzfolgerung und bestimmt den Grenzwert mit einem dazu passenden Argument.',
      'The learner checks monotonicity and bounds for a concrete sequence, justifies a valid convergence inference, and determines its limit with a suitable argument.',
      'Bei einer neuen Folge, die zwar beschränkt, aber nicht monoton ist, trennt sie die Nichtanwendbarkeit dieses Kriteriums von einer Aussage über tatsächliche Konvergenz.',
      'For a new sequence that is bounded but not monotone, the learner separates the criterion’s inapplicability from a claim about actual convergence.',
    ],
    rationale: 'Das gegenwärtige „daraus“ / „infer convergence statements“ lässt die entscheidende Konjunktion offen. Die Revision nennt die hinreichende Bedingung und erhält die dreistufige Quellenaussage aus Bayern M12-V.2. Das Modul ist im Vertiefungskurs wählbar; die Roh-Projektion in 16 Ländern ist kein geprüfter Quellen-Mapping-Nachweis. Das JPG ersetzt den mathematischen Beweis nicht.',
  },
  {
    decision: 'keep',
    evidence: [
      'Der geometrische Flächeninhalt einer unendlich ausgedehnten Region entspricht geeigneten uneigentlichen Integralen nichtnegativer Teilflächen; negative Funktionswerte dürfen einen Flächeninhalt nicht wegkürzen, und Endlichkeit verlangt die Konvergenz aller benötigten Grenzwerte.',
      'The area of an unbounded region is represented by suitable improper integrals over nonnegative subregions; negative function values must not cancel area, and finiteness requires every necessary limit to converge.',
      'Die lernende Person setzt an unendlichen Grenzen und Vorzeichenwechseln korrekte Grenzwertintegrale an, berechnet deren Werte oder Divergenz und interpretiert die Summe als Fläche nur im konvergenten Fall.',
      'The learner sets up correct limiting integrals at infinite bounds and sign changes, computes their values or divergence, and interprets their sum as area only when they converge.',
      'Bei einer neuen unbeschränkten Fläche mit einem zusätzlichen Vorzeichenwechsel oder zwei unendlichen Enden teilt sie die Region passend auf und prüft jeden Grenzwert getrennt.',
      'For a new unbounded region with an additional sign change or two infinite ends, the learner partitions the region appropriately and checks each limit separately.',
    ],
    rationale: 'Die ungewöhnlich lange aktuelle Fassung ist mathematisch präzise: Sie verhindert, dass ein konvergenter vorzeichenbehafteter Gesamtwert als endlicher Flächeninhalt gilt. Hessen Q1.2 nennt uneigentliche Integrale für unendlich ausgedehnte Flächen ausdrücklich nur im erhöhten LK-Niveau; die vorangehenden Integrale sind passende Voraussetzungen. Die Detailfälle gehören ins V2-Profil; das JPG ist nur Anschauung.',
  },
  {
    decision: 'keep',
    evidence: [
      'Bei einer Schar aus Exponentialfunktion und Polynom steuert der Parameter den Funktionsterm und kann Eigenschaften wie Lage oder Zahl von Extrempunkten verändern; eine Deutung im Sachkontext hängt von sinnvollem Definitions- und Parameterbereich ab.',
      'In a family combining an exponential function and a polynomial, the parameter changes the term and may alter properties such as the position or number of extrema; interpretation in context depends on sensible input and parameter domains.',
      'Die lernende Person untersucht eine gegebene Exponential-Polynom-Schar für unterschiedliche Parameterwerte, erklärt die graphischen Änderungen und deutet nur im zulässigen Bereich eine relevante Größe im Kontext.',
      'The learner analyzes a given exponential-polynomial family for different parameter values, explains the graphical changes, and interprets a relevant quantity only within the admissible contextual range.',
      'Für eine neue Verknüpfung oder einen Parameterwert jenseits einer Schwelle prüft sie erneut die Eigenschaften und ob die ursprüngliche Realsituationsdeutung noch trägt.',
      'For a new combination or a parameter value beyond a threshold, the learner rechecks the properties and whether the original real-world interpretation still holds.',
    ],
    rationale: 'Die Beschreibung trennt die LK-spezifische Parameteruntersuchung von der anschließenden Deutung in Realsituationen und bleibt methodenneutral. Hessen Q1.3 führt verknüpfte Exponential- und Polynomfunktionen im GK/LK-Grundniveau und deren Parameterscharen im erhöhten LK-Niveau. Das gebundene PNG zeigt f_a(x)=e^x+a·x mit dem gemeinsamen Punkt (0,1) rechnerisch stimmig; seine Graphen sind Unterrichtshilfe, keine selbstständige Leistung. Die länderübergreifende Projektion ist aus der Roh-Anwendbarkeit nicht verifiziert.',
  },
  {
    decision: 'keep',
    evidence: [
      'Eine Kettenlinie lässt sich in einer geeigneten Lage durch eine Kosinus-hyperbolicus-Funktion mit Exponentialbezug modellieren; Formparameter und Verschiebung verändern Krümmung, Tiefpunkt und Lage, während das Modell idealisierte Annahmen hat.',
      'A catenary can be modeled in a suitable position by a hyperbolic-cosine function related to exponentials; its shape parameter and translation change curvature, minimum, and position, while the model makes idealizing assumptions.',
      'Die lernende Person erläutert an einer gegebenen Kettenlinien-Schar die Wirkung der Parameter auf Graph und Tiefpunkt und verbindet diese Eigenschaften mit einer hängenden Kette im gewählten Kontext.',
      'The learner explains how parameters in a given catenary family affect the graph and minimum and relates those properties to a hanging chain in the chosen context.',
      'Bei veränderter Spannweite oder veränderten Aufhängehöhen prüft sie, ob die bisherige symmetrische Modelllage passt, und deutet passende Parameter oder nötige Anpassungen.',
      'With a changed span or unequal support heights, the learner checks whether the former symmetric model position still fits and interprets suitable parameters or needed adjustments.',
    ],
    rationale: 'Der Text hält dieses Modell vom allgemeineren Vorgänger „Parameteruntersuchungen“ und vom nachfolgenden Sammelziel getrennt. Hessen Q1.3 nennt Kettenlinien ausdrücklich im LK-Abschnitt. Das gebundene PNG zeigt y=a·cosh(x/a)+c (a>0), die korrekten Tiefpunkte (0,1+c) und (0,2+c) sowie die flachere a=2-Kurve; es deckt nur den symmetrischen Spezialfall ab. Keine Bilddarstellung beweist Lernkompetenz oder länderübergreifende Quellendeckung.',
  },
  {
    decision: 'keep',
    evidence: [
      'Für A·exp(−k(x−μ)²) mit A,k>0 bestimmen μ die Lage, A die Gipfelhöhe und k die Breite; ein symmetrischer Glockengraph ist ein mögliches Modell und ohne Normierung keine Wahrscheinlichkeitsdichte.',
      'For A·exp(−k(x−μ)²) with A,k>0, μ sets location, A peak height, and k width; a symmetric bell curve is a possible model and is not a probability density without normalization.',
      'Die lernende Person vergleicht Graphen bei veränderten Parametern, begründet die Eigenschaften aus Term und Symmetrie und beurteilt die Eignung für einen gegebenen symmetrischen Sachverhalt.',
      'The learner compares graphs under parameter changes, explains their properties from the term and symmetry, and judges suitability for a given symmetric real-world situation.',
      'Für einen neuen Datensatz oder ein Signal mit asymmetrischem Verlauf erkennt sie die Modellgrenze und erklärt, warum bloßes Ändern von A, k oder μ sie nicht beseitigt.',
      'For a new data set or signal with an asymmetric shape, the learner identifies the model limit and explains why changing only A, k, or μ cannot remove it.',
    ],
    rationale: 'Die bestehende Beschreibung ist mit dem Kettenlinienziel parallel, aber auf ein eigenständiges Modell begrenzt. Hessen Q1.3 nennt Glockenkurven ausdrücklich für LK. Das gebundene PNG stellt Amplitude, Zentrum und Breite mathematisch korrekt dar und kennzeichnet die fehlende Normierung sowie die Modellgrenze eines symmetrischen Signalpeaks; es ist keine Leistungs- oder Quellenprüfung.',
  },
  {
    decision: 'keep',
    evidence: [
      'Eine Ortskurve besteht aus tatsächlich erreichbaren Extrempunkten einer Funktionenschar; Parameterelimination liefert eine Gleichung für mögliche Punktlagen, deren zulässige Parameter und Extremumseigenschaft noch geprüft werden müssen.',
      'A locus consists of extrema actually attained by members of a function family; eliminating the parameter gives an equation for possible point locations, whose admissible parameters and extremum property still need checking.',
      'Die lernende Person findet parameterabhängige Extrempunktkoordinaten, eliminiert den Parameter und prüft für die erhaltene Kurve, welche Punkte bei zulässigen Scharmitgliedern echte Extrema sind.',
      'The learner finds parameter-dependent coordinates of extrema, eliminates the parameter, and checks which points on the resulting curve are genuine extrema for admissible family members.',
      'Bei einer neuen Schar mit eingeschränktem Parameterbereich oder mehreren Extrempunktästen beschreibt sie die tatsächlich durchlaufenen Teilkurven statt nur einer ungeprüften Gleichung.',
      'For a new family with a restricted parameter domain or several extremum branches, the learner describes the loci actually traced rather than only an unchecked equation.',
    ],
    rationale: 'Die aktuelle DE/EN-Beschreibung ist gleichwertig und bildet die kohärente Kette „Extrempunkte → Parameter eliminieren → Ortskurve“ ab. Hessen Q4.1 führt Ortskurven von Extrempunkten im LK-Niveau. Das gebundene PNG zeigt f_a(x)=x²−2ax mit erreichbaren Scheitelpunkten (a,−a²) und korrekter Ortskurve y=−x²; ein neues Beispiel muss selbstständig geprüft werden.',
  },
  {
    decision: 'block',
    evidence: [
      'Eine Wendepunkt-Ortskurve umfasst nur Punkte mit tatsächlichem Krümmungswechsel in zulässigen Scharmitgliedern; fʺ(x)=0 allein genügt nicht, und Parameterelimination kann unzulässige Punkte hinzufügen.',
      'A locus of inflection points contains only actual curvature-change points in admissible family members; fʺ(x)=0 alone is insufficient, and parameter elimination may add inadmissible points.',
      'Die lernende Person bestimmt parameterabhängige Wendepunkte, überprüft den Krümmungswechsel, eliminiert den Parameter und prüft den zulässigen Bereich der Ortskurve.',
      'The learner determines parameter-dependent inflection points, verifies a change of curvature, eliminates the parameter, and checks the locus’s admissible range.',
      'Bei einer neuen Schar, in der ein Parameterwert nur eine Nullstelle der zweiten Ableitung ohne Krümmungswechsel erzeugt, lässt sie diesen Punkt aus der Ortskurve weg.',
      'For a new family in which a parameter value produces a zero of the second derivative without a curvature change, the learner excludes that point from the locus.',
    ],
    rationale: 'Die Beschreibung und das gebundene PNG sind mathematisch stimmig: Für f_a(x)=x³−3ax² liegt der Wendepunkt bei (a,−2a³). Hessen Q4.1 weist Ortskurven von Wendepunkten dem LK zu. Die gelieferte Seitenrelation nennt jedoch als direkten Nachfolger erneut „Die Ortskurve von Wendepunkten bestimmen (LK)“; ohne Abgrenzung der beiden stabilen Ziele wäre eine D-Freigabe trotz korrekten Wortlauts ein ungeklärter Identitäts-/Doppelungsfall. Hold für Klärung dieser Relation und Zielidentität, nicht für eine automatische Bildkorrektur.',
  },
  {
    decision: 'block',
    evidence: [
      'Die Eignung einer Lösungsstrategie hängt von problembezogenen Kriterien ab; Aufwand, Genauigkeit und Robustheit haben je nach mathematischer Aufgabe unterschiedliches Gewicht, und ein bloßes Geschmacksurteil reicht nicht.',
      'A solution strategy’s suitability depends on criteria relevant to the problem; effort, accuracy, and robustness carry different weight across mathematical tasks, and personal preference is insufficient.',
      'Die lernende Person vergleicht zwei für dieselbe Aufgabe tragfähige Wege anhand ausdrücklich passender Kriterien und begründet an konkreten Rechenschritten oder Eigenschaften die Wahl.',
      'The learner compares two viable approaches to the same task using explicitly relevant criteria and justifies the choice through concrete steps or properties.',
      'Bei einer neuen Aufgabe, in der statt Genauigkeit etwa die Nachvollziehbarkeit eines Beweises entscheidend ist, passt sie die Kriterien und ihre Wahl begründet an.',
      'For a new task where clarity of a proof matters more than numerical accuracy, the learner adjusts the criteria and justifies its choice.',
    ],
    rationale: 'Das Wortpaar ist klar und bilingual gleichwertig. Die gebundene canonicalContext.sourceRef ist jedoch null, während Titel, Tag und sichtbare Projektion LK behaupten. Das amtliche hessische Q4.2 führt allgemeines Problemlösen und Argumentieren auf GK/LK-Grundniveau; der LK-Abschnitt ist dort auf besondere stochastische Strategien fokussiert. Ohne konkrete Quellzuordnung oder andere gebundene Evidenz lässt sich die LK-only-Abgrenzung dieses allgemein formulierten Ziels nicht verantworten. Hold für Quellen-/Anwendbarkeitsklärung; das JPG ändert daran nichts.',
  },
  {
    decision: 'keep',
    evidence: [
      'In einer Geradenschar ist der Scharparameter vom Laufparameter auf jeder Geraden zu unterscheiden; spezielle Scharwerte können Parallelität, Schnitt, Identität oder sogar eine unzulässige Richtungsnull erzeugen.',
      'In a family of lines, the family parameter differs from the running parameter on each line; special family values may produce parallelism, intersection, coincidence, or even an invalid zero direction.',
      'Die lernende Person untersucht die Lage von Scharmitgliedern zu einer vorgegebenen Geraden oder Bedingung, löst für zulässige Scharwerte und erklärt die entstehenden Raumkonfigurationen.',
      'The learner analyzes family members relative to a specified line or condition, solves for admissible family values, and explains the resulting spatial configurations.',
      'Für eine neue Schar mit parameterabhängigem Richtungsvektor überprüft sie Sonderwerte gesondert, bevor sie Schnitt- oder Lageaussagen geometrisch deutet.',
      'For a new family with a parameter-dependent direction vector, the learner checks exceptional values separately before interpreting intersection or position claims geometrically.',
    ],
    rationale: 'Die vorhandene Fassung hält algebraische Parameterbestimmung und räumliche Deutung zusammen; sie dupliziert nicht das grundlegende Vorgängerziel zu Lagebeziehungen. Hessen Q2.3 nennt Geradenscharen ausdrücklich im erhöhten LK-Niveau. Das JPG ist nur eine mögliche Darstellung und kein Nachweis für alle Parameter-Sonderfälle; weitere Länder-Mappings werden aus dem Rohumfang nicht behauptet.',
  },
  {
    decision: 'block',
    evidence: [
      'Die Normalenform beschreibt eine Ebene durch Punkt und Normalenvektor; bei Hessescher Normalenform ist der Normalenvektor normiert, sodass ein Punkt-Ebene-Ausdruck einen vorzeichenbehafteten Abstand und sein Betrag die Entfernung liefert.',
      'Normal form describes a plane through a point and a normal vector; Hesse normal form uses a unit normal, so the point-plane expression yields signed distance and its absolute value yields distance.',
      'Die lernende Person stellt für eine gegebene Ebene eine Normalengleichung auf, normiert den Normalenvektor für Hesse-Form und erläutert, warum die daraus bestimmte Punktentfernung durch die Normierung maßstabsrichtig ist.',
      'The learner sets up a normal equation for a given plane, normalizes the vector for Hesse form, and explains why normalization makes the resulting point distance correctly scaled.',
      'Für dieselbe Ebene mit einem anders skalierten Normalenvektor erkennt sie, dass die unnormierte Einsetzung andere Zahlen liefert, die geometrische Entfernung nach Normierung aber unverändert bleibt.',
      'For the same plane with a differently scaled normal vector, the learner recognizes that unnormalized substitution gives different numbers while the geometric distance after normalization stays unchanged.',
    ],
    rationale: 'Mathematisch sind DE und EN stimmig, und die Voraussetzungen Punkt-Normalen-Form sowie Abstandsverfahren sind passend. Der angegebene hessische Q2.3-LK-Spiegelstrich nennt aber nur „Normalenform einer Ebene“; Hessesche Normalenform und ihre konkrete Nutzung für Abstände erscheinen in der bindenden Quellenstelle nicht ausdrücklich. Der unmittelbar folgende LK-Abschnitt nennt weitere Abstandsbestimmungen, jedoch kein Hesse-Verfahren. Ohne genauere Quell-/Mapping-Begründung wäre die spezifische Titel- und Beschreibungsbehauptung zu weitreichend. Hold auf Quellenfidelität; das JPG kann sie nicht liefern.',
  },
  {
    decision: 'keep',
    evidence: [
      'Eine Ebenenschar in Koordinatenform beschreibt je zulässigem Parameterwert eine Ebene; Änderungen von Normalenvektor oder Konstante steuern ihre Lage, während ein verschwindender Normalenvektor keine Ebene definiert.',
      'A coordinate-form family describes a plane for each admissible parameter value; changes in normal vector or constant control its position, while a zero normal vector does not define a plane.',
      'Die lernende Person bestimmt Parameterwerte für geforderte Lage- oder Schnittbedingungen, prüft Sonderwerte und erläutert die entstehenden Ebenen und Schnittmengen räumlich.',
      'The learner determines parameter values for required positional or intersection conditions, checks exceptional values, and explains the resulting planes and intersections in space.',
      'Bei einer neuen Schar, deren Parameter sowohl Normalenvektor als auch Konstante verändert, entscheidet sie für welche Werte Ebenen vorliegen und wie ihre Schnittlage wechselt.',
      'For a new family whose parameter changes both normal vector and constant, the learner decides which values define planes and how their intersection pattern changes.',
    ],
    rationale: 'Die aktuelle Formulierung trifft das hessische LK-Thema Q2.3 „Ebenenscharen, insbesondere ... Koordinatengleichung“; der methodische Zusatz Parameter- und Lagebedingungen ist eine passende Operationalisierung der einen Kompetenz. GK/LK-Vorgänger zu Koordinatenform und LK-Lagebeziehungen grenzen die vorausgesetzten Kenntnisse ab. Das JPG ist kein Beleg für Sonderfallkompetenz oder bundesweite Quellendeckung.',
  },
  {
    decision: 'block',
    evidence: [
      'Die Erweiterung zu komplexen Zahlen machte zuvor formal auftretende Quadratwurzeln negativer Zahlen innerhalb konsistenter Rechenregeln behandelbar; ihre historische Anerkennung verlief über verschiedene nachprüfbare mathematische Entwicklungen, nicht über ein einziges Schulbeispiel.',
      'The extension to complex numbers made formerly formal square roots of negative numbers workable within consistent rules; their historical acceptance developed through several verifiable mathematical steps, not one classroom example.',
      'Anhand einer benannten und belegten historischen Episode erläutert die lernende Person, welches mathematische Problem auftrat, welche neue Deutung oder Rechenregel genutzt wurde und weshalb dies über ein bloßes Hilfssymbol hinausgeht.',
      'Using a named, documented historical episode, the learner explains the mathematical problem, the new interpretation or calculation rule used, and why this goes beyond a mere auxiliary symbol.',
      'Bei einer anderen belegten Episode, etwa einer späteren geometrischen Deutung, unterscheidet sie deren Beitrag zur Anerkennung komplexer Zahlen von der ursprünglichen formalen Rechnung.',
      'For another documented episode, such as a later geometric interpretation, the learner distinguishes its contribution to acceptance of complex numbers from the earlier formal calculation.',
    ],
    rationale: 'Bayerns M12-V.1 verlangt Bewusstsein für die kulturhistorische Bedeutung, liefert in der gebundenen Quelle aber keine bestimmte historische Episode oder die Erzählung „formale Rechenhilfen → anerkannter Zahlbereich“. Der aktuelle Text verlangt ausdrücklich einen fachhistorisch belegten Entwicklungsschritt, ohne dass ein solcher Beleg mitgeliefert wurde. Das gebundene PNG setzt x²+1=0 als scheinbaren historischen Ausgangspunkt und kann die historische Abfolge nicht belegen; seine allgemeine Gaußsche Ebene ist keine datierte Episode. Zudem ist M12-V.1 ein wählbares Vertiefungskursmodul und kein Nachweis einer obligatorischen bundesweiten LK-Projektion. Hold für überprüfbare Fachgeschichte und Geltungsbereich.',
  },
]

if (reviews.length !== campaign.goalCount || input.goals.length !== reviews.length) {
  throw new Error('Review count differs from the bound campaign')
}
if (batch.goalIds.some((id, index) => id !== input.goals[index].goalId)) {
  throw new Error('Review order differs from the bound batch')
}

const keys = [
  'essentialUnderstandingDe', 'essentialUnderstandingEn',
  'observablePerformanceDe', 'observablePerformanceEn',
  'transferExpectationDe', 'transferExpectationEn',
]
const records = reviews.map((review, index) => {
  const source = input.goals[index]
  const understandingEvidence = Object.fromEntries(keys.map((key, part) => [key, review.evidence[part]]))
  const record = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${campaign.roundId}.record-${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    goalId: source.goalId,
    goalFingerprint: source.goalFingerprint,
    pageFingerprint: source.pageFingerprint,
    currentTitleDe: source.currentTitleDe,
    currentTitleEn: source.currentTitleEn,
    currentDescriptionDe: source.currentDescriptionDe,
    currentDescriptionEn: source.currentDescriptionEn,
    decision: review.decision,
    understandingEvidence,
    rationale: review.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
  if (review.decision === 'revise') {
    record.proposedDescriptionDe = review.proposedDescriptionDe
    record.proposedDescriptionEn = review.proposedDescriptionEn
  }
  return record
})

const recordsBytes = Buffer.from(records.map((record) => JSON.stringify(record)).join('\n') + '\n')
const startedAt = new Date().toISOString()
const inputArtifacts = [
  'review_input_json', 'review_prompt', 'review_criteria', 'finding_schema',
].map((role) => {
  const artifact = bundle.artifacts.find((item) => item.role === role)
  if (!artifact) throw new Error(`Missing bound artifact ${role}`)
  return { role, digest: artifact.digest }
})
inputArtifacts.push({ role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint })
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
  model: 'GPT-6',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: digest('independent-blind-manual-review-round-a;temperature=unavailable'),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: [...batch.goalIds],
  inputArtifacts,
  startedAt,
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: digest(recordsBytes),
  toolchainVersion: 'manual-review-materializer-v1',
}
await writeFile(resolve(here, 'results', `${batch.batchId}.records.jsonl`), recordsBytes)
await writeFile(resolve(here, 'results', `${batch.batchId}.run.json`), JSON.stringify(run, null, 2) + '\n')
console.log(JSON.stringify({ records: records.length, decisions: records.reduce((counts, record) => ({ ...counts, [record.decision]: (counts[record.decision] ?? 0) + 1 }), {}), outputDigest: run.outputDigest }))
