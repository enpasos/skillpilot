import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Blind first-pass judgments. Bound identifiers and current text are copied
// mechanically from this round's batch input, never reconstructed here.
const judgments = [
  {
    decision: 'block',
    rationale: 'Die DE/EN-Texte und das gebundene Bild mit a_n = 2n + 1, Tabelle und diskreten Punkten sind fachlich stimmig. Die BY-Geltung als Sek II/LK ist jedoch ungeklärt: LehrplanPLUS M12 2 ist ein zusätzlicher, wählbarer Vertiefungskurs, dessen Lehrkraft drei von fünf Modulen auswählt; Mathematik ist in Bayern regulär für alle auf erhöhtem Anforderungsniveau und kein wählbares Leistungsfach. Die pauschale LK-Projektion dieses Vertiefungsmoduls ist durch die gebundene Quelle nicht gedeckt. Ohne geklärte Kurs- und Modulgeltung kein freigebbarer Textentscheid. Quellen: https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/vertieft ; https://www.isb.bayern.de/fileadmin/user_upload/Gymnasium/Kontaktbriefe/Mathematik/kontaktbrief_mathematik_2023.pdf . Die übrigen Länderprojektionen sind durch die einzelne BY-Quellenangabe ebenfalls nicht unabhängig belegt.',
    evidence: [
      'Eine explizite Vorschrift ordnet jedem zulässigen Index unmittelbar ein Folgenglied zu; die Folge besteht aus diskreten, nicht durch eine Linie ergänzten Punkten.',
      'An explicit rule assigns a term directly to each admissible index; the sequence consists of discrete points rather than a continuous line.',
      'Die lernende Person berechnet selbst Folgenglieder aus einem gegebenen Term und erläutert die Übereinstimmung von Index, Wertetabelle und Punktdarstellung.',
      'The learner independently computes terms from a given formula and explains how index, value table, and plotted points correspond.',
      'Bei geändertem Startindex oder anders dargestellter expliziter Vorschrift ordnet sie die neuen Indizes und Werte korrekt zu und erklärt die Verschiebung der Punktdarstellung.',
      'With a changed starting index or a differently presented explicit rule, the learner matches the new indices and values and explains the change in the point representation.',
    ],
  },
  {
    decision: 'block',
    rationale: 'Die gebundene Fibonacci-Grafik ist rechnerisch korrekt und zeigt Startwerte sowie Rekursionsschritt. Die offizielle BY-Stelle spricht genauer von der Folge der Näherungswerte beim Newton-Verfahren, während "Newton-Folgen" ohne Iterationsregel/Startwert mehrdeutig sein kann; das wäre lokal klärbar. Vorrangig ist die ungedeckte BY-LK-Geltung: M12 2 gehört zum zusätzlich wählbaren Vertiefungskurs mit Modulauswahl, nicht zum regulären LK-Profil. Eine Textrevision würde diese Geltungsfrage verdecken. Quelle: https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/vertieft .',
    evidence: [
      'Eine rekursive Folge braucht Startwert oder Startwerte und eine Vorschrift, die neue Glieder aus früheren Gliedern gewinnt; Fibonacci und Newton-Näherungen verwenden unterschiedliche Rekursionen.',
      'A recursive sequence needs an initial term or terms and a rule that obtains new terms from earlier ones; Fibonacci and Newton approximations use different recurrences.',
      'Die lernende Person berechnet mehrere Glieder selbst, benennt die jeweils verwendeten Vorgänger und erklärt, warum ohne Startwerte keine eindeutige Fortsetzung folgt.',
      'The learner independently computes several terms, identifies the predecessors used at each step, and explains why the rule alone does not determine a unique continuation without initial values.',
      'Bei veränderten Startwerten oder einer anderen Anzahl benötigter Vorgänger führt sie die Iteration korrekt fort und erklärt die dadurch geänderte Folge.',
      'With changed initial values or a recurrence using a different number of preceding terms, the learner continues the iteration and explains how the resulting sequence changes.',
    ],
  },
  {
    decision: 'block',
    rationale: '"Ein passendes" Bildungsgesetz vermeidet richtigerweise einen Eindeutigkeitsanspruch aus endlich vielen Gliedern; die Grafik prüft nur fünf Werte und darf nicht als Beweis der einzigen Regel gelesen werden. Die BY-Quelle M12 2 nennt die Umkehrung von gegebenen Gliedern zu einem geeigneten Bildungsgesetz, liegt aber im optionalen Vertiefungskurs mit Auswahl von drei Modulen. Die gebundene BY-Geltung als allgemeines LK-Ziel muss vor einem abschließenden D-Entscheid geklärt werden. Quelle: https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/vertieft .',
    evidence: [
      'Endlich viele vorgegebene Folgenglieder können zu mehreren Bildungsgesetzen passen; ein geeignetes Gesetz beschreibt das erkannte Muster und wird an den bekannten Gliedern geprüft.',
      'A finite list of sequence terms may fit more than one formation rule; a suitable rule expresses an identified pattern and is checked against the known terms.',
      'Die lernende Person erschließt aus den gegebenen Gliedern eine plausible explizite oder rekursive Vorschrift, überprüft alle vorgegebenen Glieder und begründet die Musterwahl ohne unbelegte Eindeutigkeit.',
      'The learner infers a plausible explicit or recursive rule from the given terms, checks every supplied term, and justifies the chosen pattern without claiming unsupported uniqueness.',
      'Bei einer Folge mit veränderter Differenz- oder Verhältnisstruktur prüft sie erneut, welche Art von Vorschrift passt, statt die erste Musterform unverändert zu übernehmen.',
      'For a sequence whose difference or ratio pattern changes, the learner tests anew which kind of rule fits instead of reusing the first pattern unchanged.',
    ],
  },
  {
    decision: 'block',
    rationale: 'Die BY-Quelle M12 2 trägt die inhaltliche Kette Monotonie/Beschränktheit, ggf. Konvergenz, Grenzwert, gehört aber zu einem zusätzlichen wählbaren Vertiefungskurs. Die BY-Geltung als pauschales LK-Ziel ist deshalb ungeklärt. Außerdem ist "daraus Konvergenzaussagen ableiten" im Text nur bei geeigneter Kombination der Bedingungen korrekt: beschränkt allein genügt nicht, monoton allein ebenfalls nicht. Das gebundene Bild a_n = 1 - 1/n illustriert einen korrekten Spezialfall; seine kleine Grenzwert-Einblendung platziert Punkte teils oberhalb der als Grenzwert gelesenen Linie und sollte unabhängig geprüft werden. Quelle: https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/vertieft .',
    evidence: [
      'Eine monotone und passend beschränkte reelle Folge konvergiert; aus nur einer dieser beiden Eigenschaften folgt das nicht. Der Grenzwert ist eine zusätzliche quantitative Aussage.',
      'A real sequence that is monotone and bounded in the relevant direction converges; either property alone is insufficient. The limit is a further quantitative result.',
      'Die lernende Person begründet Monotonie und Schranken, zieht nur bei erfüllten Voraussetzungen eine Konvergenzfolgerung und bestimmt oder verifiziert danach den Grenzwert.',
      'The learner establishes monotonicity and bounds, infers convergence only when the conditions hold, and then determines or verifies the limit.',
      'An einer nun monotonen, aber unbeschränkten oder beschränkten, aber nicht monotonen Folge beurteilt sie die Folgerung neu und trennt fehlende Satzvoraussetzungen von tatsächlicher Divergenz.',
      'For a newly presented monotone but unbounded or bounded but nonmonotone sequence, the learner reassesses the inference and distinguishes missing theorem conditions from actual divergence.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'HMKB KCGO 2024 Q1.2 S. 37 führt uneigentliche Integrale und unendlich ausgedehnte Flächen ausdrücklich unter erhöhtem Niveau/Leistungskurs. Der Text unterscheidet gerichtetes Integral von nichtnegativem Flächeninhalt und verlangt endliche Grenzwerte für alle Teilflächen; DE und EN sind deckungsgleich. Das Bild mit 1/x² auf [1, unendlich) rechnet A = 1 korrekt. Die Quelle belegt hier die HE-LK-Stufe, nicht jede angezeigte Länderprojektion. Quelle: https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf .',
    evidence: [
      'Der Inhalt einer unendlich ausgedehnten Fläche entsteht als Grenzwert endlicher, nichtnegativer Teilflächen; bei Vorzeichenwechseln darf sich eine positive und negative Integralbilanz nicht gegenseitig als Flächeninhalt aufheben.',
      'The area of an unbounded region is the limit of finite nonnegative subareas; where signs change, positive and negative signed integrals cannot cancel as an area.',
      'Die lernende Person legt Integrationsgrenzen und gegebenenfalls Vorzeichenabschnitte selbst fest, berechnet die zugehörigen Grenzwerte und begründet, ob der Gesamtflächeninhalt endlich ist.',
      'The learner independently sets integration limits and, where needed, sign intervals, computes the corresponding limits, and justifies whether the total area is finite.',
      'Für eine anders abklingende Randfunktion oder eine zusätzliche Nullstelle prüft sie die Konvergenz und Zerlegung neu und erklärt, warum eine endliche Integralbilanz keinen endlichen Flächeninhalt garantiert.',
      'For a boundary function with a different decay rate or an added zero, the learner reassesses convergence and partitioning and explains why a finite signed integral does not guarantee a finite area.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'HMKB KCGO 2024 Q1.3 S. 37 weist Parameteruntersuchungen verknüpfter Exponential- und ganzrationaler Funktionen dem Leistungskurs zu; die Grundkurs-Stelle ohne Parameter bleibt die vorausgesetzte Vorstufe. DE/EN halten diesen Unterschied ein. Die gebundene PNG-Grafik f_a(x)=e^x+a*x zeigt für a=-1,0,1 stimmige Kurven mit gemeinsamem Punkt (0,1); sie nennt sich zutreffend abstraktes Modell und belegt selbst keine Realinterpretation. Quelle: https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf .',
    evidence: [
      'Ein Parameter verändert Eigenschaften einer aus Exponential- und Polynomanteilen verknüpften Funktion; rechnerische Grapheneigenschaften und ihre Bedeutung im Sachmodell sind auseinanderzuhalten.',
      'A parameter changes properties of a function combining exponential and polynomial parts; calculated graph properties must be distinguished from their meaning in a real-world model.',
      'Die lernende Person untersucht für verschiedene Parameterwerte relevante Eigenschaften, erklärt deren Änderung aus dem Term und deutet ausgewählte Resultate mit Einheiten und Modellbedingungen im gegebenen Sachkontext.',
      'The learner investigates relevant properties for different parameter values, explains their changes from the expression, and interprets selected results with units and model conditions in the given context.',
      'Bei einer veränderten Verknüpfung oder einem anderen zulässigen Parameterbereich prüft sie die Graphen- und Modellfolgen erneut, ohne Aussagen aus einem einzelnen Kurvenbild zu verallgemeinern.',
      'With a changed combination or a different admissible parameter range, the learner reassesses graph and model consequences without generalizing from one plotted member.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'HMKB Q1.3 S. 37 nennt Kettenlinien im LK-Zusammenhang mit Parameterfunktionen und Glockenkurven. Die Kettenlinie ist ein kohärentes eigenständiges Modellziel; die gemeinsame Voraussetzung Parameteruntersuchungen ist passend. Das gebundene PNG zeigt y=a*cosh(x/a)+c mit a>0, cosh-Bezug, Minimum (0,a+c) und für größeres a eine flachere Kurve konsistent. Der Text verspricht keine physikalische Universalgültigkeit; DE/EN entsprechen einander. Quelle: https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf .',
    evidence: [
      'Bei einer Kettenlinie verbindet die hyperbolische Kosinusform Exponentialterme mit einer symmetrischen U-Form; Parameter steuern unter gegebenen Modellbedingungen Tiefpunkt und Krümmung.',
      'For a catenary, the hyperbolic cosine form connects exponential terms with a symmetric U-shape; parameters control its low point and curvature under stated model conditions.',
      'Die lernende Person untersucht eine gegebene Kettenlinienfunktion, begründet Lage und Form aus dem Term und deutet Parameteränderungen für eine passende hängende Kette.',
      'The learner investigates a given catenary function, explains its position and shape from the expression, and interprets parameter changes for a suitable hanging-chain setting.',
      'Bei veränderter Aufhängehöhe oder Durchhangvorgabe passt sie die Parameterdeutung an und prüft, welche beobachtete Eigenschaft das Modell weiterhin beschreibt.',
      'With a changed suspension height or sag requirement, the learner adapts the parameter interpretation and checks which observed property the model still describes.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'HMKB Q1.3 S. 37 nennt Glockenkurven gemeinsam mit Kettenlinien ausdrücklich auf LK-Niveau. Der Text bleibt beim Exponentialmodell und erhebt keinen Anspruch, jede Glockenkurve sei eine normierte Wahrscheinlichkeitsdichte. Das gebundene PNG f(x)=A*exp(-k(x-mu)^2) mit A,k>0 zeigt Zentrum, Höhe und die Breitenänderung bei k korrekt und nennt die begrenzte Signalmodell-Eignung. DE/EN sind gleichwertig. Quelle: https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf .',
    evidence: [
      'Bei der dargestellten exponentiellen Glockenfamilie legen Zentrum, Höhe und Breitenparameter unterschiedliche Grapheneigenschaften fest; eine Signalspitze ist nur dann passend, wenn ihre Form und Modellannahmen dazu passen.',
      'In the shown exponential bell-curve family, center, height, and width parameters control distinct graph properties; a signal peak is suitable only when its shape and model assumptions fit.',
      'Die lernende Person bestimmt und erklärt Symmetrieachse, Maximum und Breitenänderung aus einem Funktionsterm und deutet diese Merkmale für ein geeignetes Signal.',
      'The learner determines and explains the symmetry axis, maximum, and width change from a function expression and interprets these features for a suitable signal.',
      'Bei verschobenem Zentrum, anderer Breite oder asymmetrischen Messdaten prüft sie erneut, welche Parameteranpassung sinnvoll ist und wo das Glockenmodell nicht mehr trägt.',
      'With a shifted center, different width, or asymmetric measured data, the learner reassesses which parameter adjustment is sensible and where the bell model ceases to fit.',
    ],
  },
  {
    decision: 'revise',
    proposedDe: 'Die lernende Person kann für eine Funktionenschar die Koordinaten ihrer Extrempunkte parameterabhängig bestimmen, den Parameter eliminieren und die Ortskurve unter Beachtung zulässiger Parameterwerte herleiten.',
    proposedEn: 'For a family of functions, the learner can determine the parameter-dependent coordinates of its extrema, eliminate the parameter, and derive the locus while respecting admissible parameter values.',
    rationale: 'HMKB Q4.1 S. 51 nennt Ortskurven von Extrempunkten unter erhöhtem Niveau/LK; die Voraussetzung zur parameterabhängigen Extremstellenuntersuchung passt. Das gebundene PNG f_a(x)=x²-2ax zeigt E_a=(a,-a²) und y=-x² rechnerisch richtig. In allgemeinen Scharen kann Parameterelimination jedoch Punkte liefern, die wegen Parameterbereich oder Extremum-Bedingung nicht erreicht werden. Der lokale Zusatz zu zulässigen Parameterwerten verhindert diese falsche Gleichsetzung von impliziter Gleichung und tatsächlicher Ortskurve. Quelle: https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf .',
    evidence: [
      'Die Ortskurve ist die Menge tatsächlich erreichter Extrempunkte einer Schar; eine aus eliminiertem Parameter gewonnene Gleichung kann mehr Punkte beschreiben als zulässig sind.',
      'A locus is the set of extrema actually attained by a family; an equation obtained by eliminating the parameter may describe more points than are admissible.',
      'Die lernende Person prüft Extrempunkte für die erlaubten Parameter, bestimmt ihre Koordinaten, eliminiert den Parameter und gibt die erreichbare Punktmenge begründet an.',
      'The learner verifies extrema for the allowed parameters, determines their coordinates, eliminates the parameter, and justifies the attainable set of points.',
      'Bei eingeschränktem Parameterintervall oder wechselnder Extremum-Art leitet sie die Gleichung neu her und begrenzt die Ortskurve auf die tatsächlich entstehenden Extrempunkte.',
      'With a restricted parameter interval or a change in extremum type, the learner derives the equation anew and restricts the locus to the extrema that actually occur.',
    ],
  },
  {
    decision: 'revise',
    proposedDe: 'Die lernende Person kann für eine Funktionenschar die Koordinaten ihrer Wendepunkte parameterabhängig bestimmen, den Parameter eliminieren und die Ortskurve unter Beachtung zulässiger Parameterwerte herleiten.',
    proposedEn: 'For a family of functions, the learner can determine the parameter-dependent coordinates of its inflection points, eliminate the parameter, and derive the locus while respecting admissible parameter values.',
    rationale: 'HMKB Q4.1 S. 51 nennt Wendepunkt-Ortskurven unter erhöhtem Niveau/LK; die direkte Voraussetzung zur Krümmung passt. Das gebundene PNG f_a(x)=x³-3ax² hat W_a=(a,-2a³) und y=-2x³ korrekt dargestellt, auch bei a=0 mit stationärem Wendepunkt. Allgemein ist fʺ=0 nicht allein ein Wendepunktnachweis und Parameterelimination kann unzulässige Kurvenstücke ergänzen. Die kurze Ergänzung zum Parameterbereich erhält die Kompetenz und macht die tatsächliche Punktmenge maßgeblich. Quelle: https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf .',
    evidence: [
      'Die Ortskurve umfasst nur tatsächliche Wendepunkte der zulässigen Scharmitglieder; eine Nullstelle der zweiten Ableitung und eine eliminierte Gleichung brauchen jeweils eine fachliche Prüfung.',
      'The locus contains only actual inflection points of admissible family members; both a zero of the second derivative and an eliminated equation require mathematical checking.',
      'Die lernende Person belegt die Krümmungsänderung, berechnet die parameterabhängigen Wendepunktkoordinaten und begründet nach Elimination die erreichbare Punktmenge.',
      'The learner establishes the curvature change, calculates parameter-dependent inflection-point coordinates, and justifies the attainable point set after elimination.',
      'Bei einem veränderten Parameterbereich oder einer Schar mit bloßer Nullstelle von fʺ ohne Vorzeichenwechsel prüft sie die Kandidaten erneut und korrigiert die Ortskurve entsprechend.',
      'With a changed parameter range or a family in which fʺ vanishes without changing sign, the learner reassesses candidates and adjusts the locus accordingly.',
    ],
  },
  {
    decision: 'block',
    rationale: 'Der gebundene Datensatz hat keinen sourceRef. HMKB Q4.2 S. 51-52 verortet allgemeine heuristische Strategien, Argumentation und Beurteilung im grundlegenden Niveau für GK und LK; der spezifische LK-Abschnitt behandelt Stochastikstrategien. Für das hier allgemeine, als (LK) bezeichnete Vergleichsziel fehlt damit eine belegte LK-only-Abgrenzung. Hinzu kommt ein didaktischer Bildfehler: Die JPG-Tabelle bewertet "grafisch" pauschal als gering genau und nur mittel robust, "rechnerisch" als hoch, ohne konkrete Aufgabe oder Bedingungen; solche Rangfolgen sind nicht allgemein gültig. Erst Quelle/Geltung und Bildaussage klären. Quelle: https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf .',
    evidence: [
      'Die Eignung zweier Lösungsstrategien hängt von der konkreten Aufgabe und den dafür relevanten Kriterien ab; Aufwand, Genauigkeit und Robustheit besitzen keine universelle Rangfolge.',
      'The suitability of two solution strategies depends on the specific problem and its relevant criteria; effort, accuracy, and robustness have no universal ranking.',
      'Die lernende Person löst oder analysiert denselben Fall mit zwei Strategien, belegt deren Eigenschaften an konkreten Schritten und begründet eine auf den Fall bezogene Wahl.',
      'The learner solves or analyzes the same case with two strategies, supports their properties using concrete steps, and justifies a choice tied to that case.',
      'Wenn sich etwa die verlangte Exaktheit oder Datenqualität ändert, vergleicht sie die Strategien mit neu gewichteten Kriterien und überprüft, ob die frühere Wahl noch gilt.',
      'If the required exactness or data quality changes, the learner compares the strategies using newly weighted criteria and checks whether the earlier choice still holds.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'HMKB Q2.3 S. 43 führt Geradenscharen ausdrücklich unter erhöhtem Niveau/LK. Die aktuelle Beschreibung verbindet Parameterbedingungen mit geometrischer Deutung und ist bilingual konsistent. Das gebundene JPG zeigt g_a=(0,0,a)+t(1,1,0) und h=(0,1,0)+s(1,0,0); bei a=0 schneiden sie sich in (1,1,0), für a ungleich 0 sind sie windschief. Das stützt den Fallunterschied. Die HE-Quelle verifiziert nicht automatisch die weiteren Landesprojektionen, auch BY nicht. Quelle: https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf .',
    evidence: [
      'Bei einer Geradenschar beeinflusst der Parameter Stützpunkt oder Richtung; Schnitt, Parallelität und Windschiefe folgen aus der gemeinsamen geometrischen Lage und den Gleichungsbedingungen.',
      'In a family of lines, the parameter changes a support point or direction; intersection, parallelism, and skew position follow from geometric configuration and equation conditions.',
      'Die lernende Person löst die Lage- oder Schnittbedingungen für Parameterwerte und erklärt jede algebraische Fallunterscheidung am zugehörigen Geradenbild.',
      'The learner solves positional or intersection conditions for parameter values and explains each algebraic case through the corresponding line configuration.',
      'Wenn der Parameter statt im Stützpunkt im Richtungsvektor liegt, prüft sie Sonderwerte neu und entscheidet begründet über mögliche Schnitt- und Parallelfälle.',
      'If the parameter moves from the support point to the direction vector, the learner rechecks exceptional values and justifies possible intersection and parallel cases.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'HMKB Q2.3 S. 43 nennt die Normalenform ausdrücklich im LK-Teil; Hessesche Normalenform ist deren normierte Spezialisierung und die Abstandsverwendung bildet eine zusammenhängende Konstruktion-Anwendung-Kette. Die direkte Vorstufe Punkt-Normalen-Form und Abstandsverfahren passt. Im JPG sind n=(2,-1,2), |n|=3, die durch 3 geteilte Ebenengleichung und d((4,1,2),E)=5/3 rechnerisch stimmig. Der Text behauptet keine exklusive Abstands-Methode; DE/EN entsprechen einander. Quelle: https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf .',
    evidence: [
      'Die Normalenform beschreibt eine Ebene über einen senkrechten Vektor; nach Normierung liefert der Betrag des eingesetzten Ebenenausdrucks den Punkt-Ebene-Abstand unabhängig von der Skalierung der ursprünglichen Gleichung.',
      'Normal form describes a plane through a perpendicular vector; after normalization, the absolute value of the evaluated plane expression gives point-to-plane distance regardless of scaling of the original equation.',
      'Die lernende Person stellt die Normalenform auf, normiert einen nichtnulligen Normalenvektor, erklärt den Einheitsfaktor und berechnet sowie interpretiert einen Punkt-Ebene-Abstand.',
      'The learner constructs normal form, normalizes a nonzero normal vector, explains the unit factor, and calculates and interprets a point-to-plane distance.',
      'Bei einer äquivalent skalierten Ebenengleichung oder einem Punkt auf der anderen Seite zeigt sie, warum die Hesse-Form und der nichtnegative Abstand geometrisch gleich bleiben.',
      'For an equivalently scaled plane equation or a point on the opposite side, the learner shows why Hesse form and the nonnegative distance remain geometrically consistent.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'HMKB Q2.3 S. 43 nennt Ebenenscharen, besonders in Koordinatengleichung, ausdrücklich im LK-Teil. Text, Prärequisiten zu Ebenenform und Lagebeziehungen sowie DE/EN passen. Das JPG-Beispiel E_k: x+y+kz=2 gegenüber F: 2x+2y+2z=5 ist rechnerisch konsistent: k=1 ergibt verschiedene parallele Ebenen, k ungleich 1 eine Schnittgerade; für k=0 ist z=0,5 und g=(0,2,0,5)+s(1,-1,0). Die HE-Quelle beweist keine vollständige Projektion aller angezeigten Länder. Quelle: https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf .',
    evidence: [
      'In einer Ebenenschar können Parameter Normalenrichtung oder Lage ändern; proportionale Normalen allein unterscheiden noch nicht identische von verschiedenen parallelen Ebenen.',
      'In a family of planes, parameters can alter normal direction or position; proportional normals alone do not distinguish coincident from distinct parallel planes.',
      'Die lernende Person bestimmt Parameterwerte für vorgegebene Lage- oder Schnittbedingungen, löst nötige Gleichungssysteme und deutet die resultierenden Ebenenkonfigurationen.',
      'The learner determines parameter values for given positional or intersection conditions, solves the necessary systems, and interprets the resulting plane configurations.',
      'Wenn der Parameter von einem Normalenkoeffizienten auf die rechte Gleichungsseite wechselt, klassifiziert sie die Sonderfälle erneut und erklärt, wann Ebenen zusammenfallen statt sich zu schneiden.',
      'When the parameter moves from a normal coefficient to the right-hand side, the learner classifies special cases anew and explains when planes coincide rather than intersect.',
    ],
  },
  {
    decision: 'block',
    rationale: 'Die offizielle BY-Stelle M12 1 nennt zwar die kulturhistorische Bedeutung komplexer Zahlen, aber sie gehört zu einem zusätzlich wählbaren Vertiefungskurs, in dem nur drei von fünf Modulen unterrichtet werden; die Buchseite projiziert sie pauschal als BY Sek II/LK. Dieses Profil ist nicht durch die Quelle gedeckt. Das PNG zeigt eine plausible mathematische Erzählung zu x²+1=0 und i²=-1, nennt jedoch keinen historisch belegten Akteur, Zeitpunkt oder Entwicklungsschritt; es kann daher das im Text verlangte "fachhistorisch belegt" nicht tragen. Auch die Behauptung eines einzelnen Übergangs von Rechenhilfe zu anerkanntem Zahlbereich braucht eine konkrete historische Quelle. Ohne Kurs-/Modulgeltung und historischen Beleg keine verantwortliche Freigabe. Quellen: https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/vertieft ; https://www.isb.bayern.de/fileadmin/user_upload/Gymnasium/Kontaktbriefe/Mathematik/kontaktbrief_mathematik_2023.pdf .',
    evidence: [
      'Die mathematische Erweiterung erlaubt die Lösung zuvor über den reellen Zahlen unlösbarer Gleichungen; ihre historische Anerkennung ist ein belegpflichtiger Entwicklungsprozess und nicht allein aus x²+1=0 ableitbar.',
      'The mathematical extension permits solutions to equations unsolvable over the real numbers; its historical acceptance is an evidence-based development and cannot be deduced from x²+1=0 alone.',
      'Die lernende Person erläutert anhand einer konkreten, historisch belegten Quelle einen Entwicklungsschritt, trennt dessen mathematische Idee von der historischen Deutung und ordnet ihn in die Erweiterung des Zahlbereichs ein.',
      'Using a specific documented historical source, the learner explains one development step, distinguishes its mathematical idea from the historical interpretation, and places it within the extension of the number system.',
      'Bei einem zweiten belegten Schritt mit anderer Funktion komplexer Zahlen vergleicht sie, was sich an Deutung oder Akzeptanz änderte, ohne daraus eine zwangsläufige lineare Erfolgsgeschichte zu machen.',
      'For a second documented step in which complex numbers played a different role, the learner compares changes in interpretation or acceptance without treating them as an inevitable linear success story.',
    ],
  },
]

const roundDirectory = dirname(fileURLToPath(import.meta.url))
const campaign = JSON.parse(readFileSync(join(roundDirectory, 'description-review-campaign.json'), 'utf8'))
const batch = campaign.batches[0]
const batchPath = join(roundDirectory, 'batches', `${batch.batchId}.input.jsonl`)
const boundInput = readFileSync(batchPath, 'utf8').trimEnd().split('\n').map((line) => JSON.parse(line))
if (boundInput.length !== 15 || judgments.length !== boundInput.length) throw new Error('Expected exactly 15 judgments')
const sha256 = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const runId = `${campaign.roundId}.codex-gpt6`
const recordPath = join(roundDirectory, 'results', `${batch.batchId}.records.jsonl`)
const runPath = join(roundDirectory, 'results', `${batch.batchId}.run.json`)
if (existsSync(recordPath) || existsSync(runPath)) throw new Error('Round B output already exists; refusing to overwrite it')

const records = boundInput.map((item, index) => {
  const source = item.goal
  const judgment = judgments[index]
  if (item.ordinal !== index + 1 || batch.goalIds[index] !== source.goalId) throw new Error(`Unexpected binding at ${index + 1}`)
  const [essentialUnderstandingDe, essentialUnderstandingEn, observablePerformanceDe, observablePerformanceEn, transferExpectationDe, transferExpectationEn] = judgment.evidence
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${campaign.roundId}.goal-${String(index + 1).padStart(2, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: item.bundleFingerprint,
    bookDigest: item.bookDigest,
    goalId: source.goalId,
    goalFingerprint: source.goalFingerprint,
    pageFingerprint: source.pageFingerprint,
    currentTitleDe: source.currentTitleDe,
    currentTitleEn: source.currentTitleEn,
    currentDescriptionDe: source.currentDescriptionDe,
    currentDescriptionEn: source.currentDescriptionEn,
    decision: judgment.decision,
    ...(judgment.decision === 'revise' ? {
      proposedDescriptionDe: judgment.proposedDe,
      proposedDescriptionEn: judgment.proposedEn,
    } : {}),
    understandingEvidence: {
      essentialUnderstandingDe,
      essentialUnderstandingEn,
      observablePerformanceDe,
      observablePerformanceEn,
      transferExpectationDe,
      transferExpectationEn,
    },
    rationale: judgment.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: source.reviewContext.evidenceProfile === null ? 'create' : 'revise',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
})
const recordsBytes = `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const bookPdfBytes = readFileSync(join(roundDirectory, '..', 'bundle', 'book.pdf'))
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
  model: 'gpt-6',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  // Runtime decoding parameters are not exposed to this reviewer. Bind that
  // disclosure rather than inventing temperature or other numeric settings.
  generationParametersFingerprint: sha256(JSON.stringify({ parameters: 'not-exposed-in-reviewer-runtime' })),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'book_pdf', digest: sha256(bookPdfBytes) },
    { role: 'review_prompt', digest: campaign.promptFingerprint },
    { role: 'review_criteria', digest: campaign.criteriaFingerprint },
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt: '2026-09-27T03:37:48.000Z',
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha256(recordsBytes),
  toolchainVersion: 'codex-manual-round-b-v1',
}
writeFileSync(recordPath, recordsBytes, { flag: 'wx' })
writeFileSync(runPath, `${JSON.stringify(run, null, 2)}\n`, { flag: 'wx' })
console.log(`Wrote ${records.length} candidate records and one run manifest`)
