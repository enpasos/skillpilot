import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Individually authored judgments from the sealed Round B input and actual view_image calls.
// This helper only copies bindings, checks image bytes and serializes the authored evidence.
const authored = [
  {
    id: '1341c20b-87ab-51e7-bd4a-50166c27806e', decision: 'keep',
    de: [
      'Die oberste Verknüpfung eines Funktionsterms unterscheidet Summanden, Faktoren und innere beziehungsweise äußere Funktion; diese Struktur bestimmt die passende Ableitungsregel.',
      'Die lernende Person zerlegt selbstständig x²+eˣ, x²eˣ und e^(x²) in Teilfunktionen und begründet, warum Summe, Produkt und Verkettung unterschiedliche Regelansätze verlangen, ohne schon eine vollständige Funktionsuntersuchung auszuführen.',
      'In einer unabhängig vorgelegten verschachtelten Summe wie (x+1)e^(2x)+x² erkennt sie zusätzlich zur äußeren Summe das Produkt und dessen innere Verkettung und ordnet die Regeln hierarchisch zu.'
    ],
    en: [
      'The outermost operation in a function expression distinguishes summands, factors, and inner and outer functions; this structure determines the appropriate differentiation rule.',
      'The learner independently decomposes x²+eˣ, x²eˣ, and e^(x²) into component functions and explains why addition, multiplication, and composition require different rule setups, without performing a full function investigation.',
      'In a separately presented nested sum such as (x+1)e^(2x)+x², the learner identifies the product and its internal composition within the outer sum and organizes the rules hierarchically.'
    ],
    rationale: 'Die DE/EN-Texte benennen dieselbe Strukturierungsleistung. Die drei Verknüpfungen sind unterscheidbare Fälle dieser einen Leistung, keine verdeckte Sammlung vollständiger Ableitungsverfahren. Die Voraussetzungen zur Polynom- und Exponentialableitung passen; Regelüberprüfung und Regelausführung bleiben ausdrücklich den Nachfolgern zugeordnet. E/AB2 und GK/LK werden nicht erweitert.',
    imageStatus: 'no_material_issue', image: 'Summe x²+eˣ, Produkt x²·eˣ und Verkettung e^(2x+1) sind korrekt getrennt und lesbar; die innere und äußere Funktion stimmen.'
  },
  {
    id: '864f9a45-badf-5a31-88d3-da4525808c2d', decision: 'keep',
    de: [
      'Produktregel und Kettenregel spiegeln verschiedene Termstrukturen; ein unabhängiger Kontrollweg kann ihre Anwendung an einem Beispiel bestätigen, während endlich viele numerische Treffer keinen allgemeinen Regelbeweis liefern.',
      'Die lernende Person überprüft selbstständig eine Produkt- und eine Verkettungsableitung durch einen mathematisch unabhängigen Weg, erläutert die zwei Summanden beziehungsweise die innere Ableitung und unterscheidet symbolische Identität von numerischer Plausibilität.',
      'Bei einem neu vorgelegten Exponentialprodukt, das sich nicht in ein Polynom ausmultiplizieren lässt, wählt sie eine passende numerisch-grafische Kontrolle und erklärt deren geringere Beweiskraft gegenüber einem symbolischen Identitätsnachweis.'
    ],
    en: [
      'The product and chain rules reflect different expression structures; an independent check can confirm their application in an example, whereas finitely many numerical matches do not prove a general rule.',
      'The learner independently checks a product derivative and a composition derivative by a mathematically independent route, explains the two summands or the inner derivative, and distinguishes symbolic identity from numerical plausibility.',
      'For a newly presented exponential product that cannot be expanded into a polynomial, the learner chooses an appropriate numerical-graphical check and explains its weaker evidential force compared with a symbolic identity argument.'
    ],
    rationale: 'DE und EN beschränken die Überprüfung ausdrücklich auf konkrete Beispiele und verlangen zusätzlich die Regelstruktur. Das ist eine zusammenhängende Kontrollkompetenz nach dem Strukturieren und vor dem Anwenden; ein allgemeiner Beweis wird nicht beansprucht. Die Alternativen bleiben offen, E/AB2 wird gewahrt. Eine Beschreibungserweiterung um einen Pflichtbeweis wäre fachlich unpassend.',
    imageStatus: 'no_material_issue', image: 'Für (x+1)x² ergeben beide Wege 3x²+2x, für (2x+1)³ ergeben beide Wege 6(2x+1)². Alle ausmultiplizierten Koeffizienten sind korrekt; das Bild zeigt Beispielkontrollen.'
  },
  {
    id: 'd0a9e407-e654-5940-958f-6f608bf3d654', decision: 'keep',
    de: [
      'Bei a·e^(kx+c)+b multipliziert die innere Ableitung k den Exponentialterm, während b verschwindet; beim Produkt (ax+b)e^(kx) tragen die Änderungen beider Faktoren zur Ableitung bei.',
      'Die lernende Person leitet beide angegebenen Funktionstypen selbstständig ab, begründet jeden Faktor beziehungsweise Summanden und nutzt das Vorzeichen der erhaltenen Ableitung für eine konkrete Monotonie- oder Extremstellenfrage.',
      'In einem frischen Fall mit negativem k erklärt sie die veränderte Monotonie; bei einem Produkt untersucht sie zusätzlich, wie die Nullstelle des linearen Ableitungsfaktors eine stationäre Stelle ermöglicht, obwohl die Exponentialfunktion selbst keine Nullstelle hat.'
    ],
    en: [
      'For a·e^(kx+c)+b, the inner derivative k multiplies the exponential term while b disappears; for (ax+b)e^(kx), changes in both factors contribute to the derivative.',
      'The learner independently differentiates both specified function types, justifies every factor or summand, and uses the sign of the resulting derivative to answer a concrete monotonicity or stationary-point question.',
      'In a fresh case with negative k, the learner explains the changed monotonicity; for a product, the learner also investigates how a zero of the linear derivative factor can create a stationary point even though the exponential function itself has no zero.'
    ],
    rationale: 'Die beiden konkreten Funktionstypen begrenzen DE und EN gleich. Strukturieren, Regelkontrolle und e-Schreibweise sind als Voraussetzungen vorhanden. Ableiten und Verwenden der Ableitung bilden eine zusammenhängende Anwendung; die nachfolgende Integration wird nicht vorweggenommen. Der Text beansprucht weder beliebige verschachtelte Funktionen noch einen Regelbeweis und passt zu E/AB2.',
    imageStatus: 'no_material_issue', image: 'Die dargestellten Ableitungen von 3e^(2x−1)+4 und (2x+1)eˣ stimmen. Bei der linken Strukturzeile ist eᵘ der elementare äußere Baustein; Faktor 3 und Konstante 4 werden anschließend korrekt verarbeitet.'
  },
  {
    id: '46166788-4a8f-53d5-9fe9-77b0a018d7ee', decision: 'keep',
    de: [
      'Eine gefundene Nullstelle r entspricht dem Faktor x−r; die Polynomdivision trennt diesen Faktor ab, und Rest null bestätigt die Teilbarkeit. Einsetzen prüft eine Nullstelle, nicht allein die Vollständigkeit aller Nullstellen.',
      'Die lernende Person führt nach einem begründeten Nullstellenkandidaten selbstständig eine Polynomdivision durch, deutet Quotient und Rest, liest weitere reelle Nullstellen aus den entstandenen Linearfaktoren ab und kontrolliert sie im Ausgangsterm.',
      'Bei einem unabhängig gestellten Polynom mit einer fehlenden Potenz ergänzt sie den Nullkoeffizienten korrekt; bleibt ein quadratischer Faktor ohne reelle Nullstelle, erklärt sie, warum keine weiteren reellen Linearfaktoren entstehen.'
    ],
    en: [
      'A zero r corresponds to the factor x−r; polynomial division separates that factor, and a zero remainder confirms divisibility. Substitution checks a zero but does not by itself establish that all zeros have been found.',
      'After identifying a justified root candidate, the learner independently performs polynomial division, interprets quotient and remainder, reads further real zeros from the resulting linear factors, and checks them in the original expression.',
      'For an independently supplied polynomial with a missing power, the learner inserts its zero coefficient correctly; if a quadratic factor without a real zero remains, the learner explains why no further real linear factors arise.'
    ],
    rationale: 'DE/EN nennen dieselbe methodengebundene Faktorisierungs- und Kontrollleistung. Anders als eine vollständige Linearfaktordarstellung erlaubt Faktorisieren auch einen irreduziblen Restfaktor. Die angegebenen Voraussetzungen Motivation und Extremwertprobleme sind didaktisch indirekt; ihre ausführlichen Inhalte fehlen im Bundle, daher wird keine vollständige Voraussetzungskette attestiert. Die eigentliche Methode ist dennoch eindeutig, und systematische Suche sowie Vielfachheiten bleiben nachfolgend.',
    imageStatus: 'no_material_issue', image: 'Die Division von x³−6x²+11x−6 durch x−1 ergibt x²−5x+6 mit Rest null; die weiteren Faktoren x−2 und x−3 und alle drei Nullstellen stimmen.'
  },
  {
    id: '51e80e7b-df31-5d97-97f9-4c6e26eb7416', decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann reelle Nullstellen ganzrationaler Funktionen systematisch suchen, vorhandene Linearfaktoren abspalten und die Nullstellen aus diesen Faktoren ablesen.',
    proposedDescriptionEn: 'The learner can systematically search for real zeros of polynomial functions, separate existing linear factors, and determine the zeros from these factors.',
    de: [
      'Reelle Nullstellen entsprechen reellen Linearfaktoren; nicht jede reelle Polynomfunktion zerfällt vollständig in solche Faktoren. Ein verbleibender Faktor kann ohne weitere reelle Nullstelle sein.',
      'Die lernende Person wählt selbstständig eine zur Polynomstruktur passende Suche, trennt gefundene Linearfaktoren ab und begründet die zugehörigen Nullstellen, ohne aus erfolglosem Raten das Fehlen weiterer Nullstellen zu folgern.',
      'In einem neuen Fall mit einem reellen Linearfaktor und einem quadratischen Restfaktor ohne reelle Nullstellen bestimmt sie die gesamte reelle Nullstellenmenge und erklärt, weshalb die Faktorzerlegung über den reellen Zahlen dort endet.'
    ],
    en: [
      'Real zeros correspond to real linear factors; not every real polynomial splits completely into such factors. A remaining factor may have no further real zero.',
      'The learner independently chooses a search appropriate to the polynomial structure, separates discovered linear factors, and justifies their associated zeros without inferring the absence of further zeros merely from unsuccessful guessing.',
      'In a new case containing a real linear factor and a quadratic remainder factor without real zeros, the learner determines the complete real zero set and explains why factorization over the real numbers stops there.'
    ],
    rationale: 'Der unbedingte Auftrag, ganzrationale Funktionen in Linearfaktordarstellung zu überführen, ist im reellen Schulkontext zu weit: etwa x²+1 besitzt keine reellen Linearfaktoren. DE und EN teilen diese konkrete Unschärfe. Die minimale Korrektur erhält systematische Suche, Faktorisierung und Ablesen, ohne komplexe Zahlen einzuführen. Die Polynomdivision als Voraussetzung passt; Vielfachheiten und numerische Näherung bleiben Nachfolger. Der leere sourceRef wird nicht als Quellenbeleg ausgegeben.',
    imageStatus: 'no_material_issue', image: 'Das Beispiel x³−2x²−5x+6=(x+2)(x−1)(x−3) und die Nullstellen −2, 1, 3 stimmen; die qualitative Skizze zeigt die drei Durchgänge. Dieses vollständig zerlegbare Beispiel beseitigt die allgemeine Textunschärfe nicht.'
  },
  {
    id: '71f62cfa-7cc2-5f60-9691-bcdc2ee910df', decision: 'keep',
    de: [
      'Die Potenz eines Nullstellenfaktors beschreibt die Vielfachheit. Gerade Vielfachheit erhält das lokale Vorzeichen, ungerade Vielfachheit wechselt es; höhere Vielfachheiten verändern zusätzlich die Flachheit am Achsenkontakt.',
      'Die lernende Person liest selbstständig Vielfachheiten aus einer faktorisieren Polynomfunktion ab und begründet anhand der Faktorvorzeichen, an welchen Nullstellen der Graph berührt oder die Achse durchquert.',
      'Bei einem frischen Beispiel mit negativem Vorfaktor und einer dreifachen statt einfachen Nullstelle erklärt sie, welche Durchquerungsrichtung sich umkehrt und warum die Paritätsaussage unverändert bleibt.'
    ],
    en: [
      'The power of a root factor gives the multiplicity. Even multiplicity preserves the local sign, odd multiplicity changes it; higher multiplicities also affect flatness at the axis contact.',
      'The learner independently reads multiplicities from a factored polynomial and uses factor signs to justify which zeros are points of touching and which are axis crossings.',
      'For a fresh example with a negative leading factor and a triple rather than simple zero, the learner explains which crossing direction reverses and why the parity statement remains unchanged.'
    ],
    rationale: 'Der Titel grenzt die knappe Beschreibung auf Linearfaktoren und Nullstellen ein; DE und EN stimmen überein. Beurteilen und graphische Folgerung sind eine kohärente Deutung, keine neue Faktorisierungsroutine. Faktorisierung und Polynomdivision sind vorhanden, umfassende Funktionsanalyse folgt später. E/AB2 bleibt angemessen; der fehlende sourceRef wird nicht ersetzt.',
    imageStatus: 'no_material_issue', image: 'Für (x+1)²(x−2)³ ist der negative Berührungskontakt bei −1 und der flache aufwärts gerichtete Durchgang bei 2 korrekt skizziert; gerade und ungerade Vielfachheit sind richtig zugeordnet.'
  },
  {
    id: 'f40fcaf7-c630-589c-9f48-6c9e69da0b9d', decision: 'keep',
    de: [
      'Stetigkeit und entgegengesetzte Randvorzeichen sichern mindestens eine Nullstelle. Halbierung bewahrt ein solches Intervall und verkleinert die Einschließungsbreite kontrolliert; ein exakter Nulltreffer beendet die Suche.',
      'Die lernende Person wählt und begründet selbstständig ein Startintervall, berechnet Mittelpunkte und Vorzeichen, entscheidet über die beibehaltene Hälfte und erklärt anhand der Intervallbreite die verbleibende Unsicherheit.',
      'Bei einem neu gegebenen stetigen, nichtpolynomialen Graphen beziehungsweise Term führt sie dieselbe Einschließung durch; bei einem Vorzeichenwechsel über einer Polstelle erklärt sie, warum die bisherige Begründung nicht gilt.'
    ],
    en: [
      'Continuity and opposite endpoint signs ensure at least one zero. Bisection preserves such an interval and reduces its width in a controlled manner; an exact zero ends the search.',
      'The learner independently selects and justifies an initial interval, computes midpoints and signs, chooses the retained half, and explains the remaining uncertainty from the interval width.',
      'For a newly supplied continuous nonpolynomial graph or expression, the learner applies the same enclosure argument; for a sign change across a pole, the learner explains why the argument no longer applies.'
    ],
    rationale: 'Die Beschreibung benennt Stetigkeit, Intervallbegründung, Verfahren und Näherungsdeutung bereits ausdrücklich und in beiden Sprachen gleich. Die vorausgesetzte Nullstellensuche wird um genau diese Näherungsmethode ergänzt; Regula falsi und Verfahrensvergleich bleiben eigenständige Nachfolger. Eine feste Fehlertoleranz oder ein allgemeiner Konvergenzbeweis muss nicht in den knappen E/AB2-Text.',
    imageStatus: 'no_material_issue', image: 'Für x²−2 stimmen f(1)=−1, f(2)=2, f(1,5)=0,25 und f(1,25)=−0,4375. Die beiden beibehaltenen Intervalle und 1,25<√2<1,5 sind korrekt.'
  },
  {
    id: '47400de4-b0e4-5bb6-a1bd-bd2beee616bb', decision: 'keep',
    de: [
      'Regula falsi nutzt den Achsenschnitt der Sekante durch die beiden Randpunkte als neuen Näherungswert. Unter der aus der Bisektion bekannten Stetigkeitsbedingung bestimmt der Vorzeichentest das verbleibende Einschließungsintervall.',
      'Die lernende Person berechnet selbstständig aus Randwerten die Sekantennullstelle, wertet die Funktion dort aus und begründet den Austausch genau des Randpunkts mit gleichem Vorzeichen; einen Nulltreffer erkennt sie als Ende.',
      'Bei einem frischen Beispiel mit stark ungleichen Beträgen der Randwerte erklärt sie die Lage der Sekantennullstelle fern vom Mittelpunkt und führt die korrekte Intervallaktualisierung aus, auch wenn ein Randpunkt erneut stehen bleibt.'
    ],
    en: [
      'Regula falsi uses the axis intercept of the secant through the two endpoint values as its new approximation. Under the continuity condition already encountered in bisection, a sign test determines the remaining enclosing interval.',
      'The learner independently computes the secant root from endpoint values, evaluates the function there, and justifies replacing exactly the endpoint with the same sign; the learner recognizes an exact zero as termination.',
      'In a fresh example with strongly unequal endpoint-value magnitudes, the learner explains why the secant root is far from the midpoint and updates the interval correctly even when one endpoint remains fixed again.'
    ],
    rationale: 'DE/EN beschreiben denselben vollständigen Schritt aus Sekantenkonstruktion und begründeter Einschließung. Die Stetigkeitsvoraussetzung ist über das direkt vorausgesetzte Bisektionsziel fachlich vorhanden und wird in der Evidenz ausdrücklich mitgeprüft. Der anschließende Geschwindigkeitsvergleich wird nicht in dieses E/AB2-Ziel importiert. Ein aktiver Bildlink ist im versiegelten Kontext nicht vorhanden.',
    imageStatus: 'not_present', image: 'visualization ist im gelieferten Kontext null; es wurde kein Bild für dieses Ziel angesehen und kein Bildhash erfunden.'
  },
  {
    id: '70a21623-6c87-55ae-b534-ab45a3b9b1d2', decision: 'keep',
    de: [
      'Verfahrensgeschwindigkeit ist nur bei vergleichbarer Genauigkeit und unter Berücksichtigung des Aufwands pro Schritt sinnvoll vergleichbar. Einschließung, verfügbare Ableitung, Startwert und lokale Funktionsform beeinflussen Zuverlässigkeit und Tempo.',
      'Die lernende Person vergleicht selbstständig Iterationsverläufe von Bisektion, Newton und Regula falsi bei gleicher Zielgenauigkeit, zählt erforderliche Auswertungen und erklärt die beobachteten Unterschiede anhand der Voraussetzungen statt eine universelle Rangfolge zu behaupten.',
      'Für einen unabhängig vorgelegten Fall mit ungünstigem Newton-Startwert oder stark einseitiger Regula-falsi-Fortschreibung korrigiert sie die zunächst günstige Geschwindigkeitsbewertung und begründet den Nutzen einer sicheren Einschließung.'
    ],
    en: [
      'Method speed can be compared meaningfully only at comparable accuracy and with the work per step taken into account. Enclosure, available derivatives, starting values, and local function shape influence reliability and speed.',
      'The learner independently compares bisection, Newton, and regula falsi iterations at the same target accuracy, counts required evaluations, and explains the observed differences from their prerequisites rather than asserting a universal ranking.',
      'For an independently supplied case with an unsuitable Newton starting value or strongly one-sided regula falsi updates, the learner revises an initially favorable speed assessment and explains the value of a reliable enclosure.'
    ],
    rationale: 'Die drei Verfahren und drei Vergleichsdimensionen sind in DE/EN präzise benannt und entsprechen E/AB3. Alle drei Verfahren sind direkt vorausgesetzt, die umfassendere Reflexion von Grenzen folgt erst anschließend. Der Vergleich ist eine einheitliche begründete Auswahlleistung; der fachlich gute Text bleibt bestehen. Der konkrete Fehler im Lehrbild ist separat zu korrigieren und macht keine Textrevision nötig.',
    imageStatus: 'observed_issue', image: 'Regula falsi ist falsch fortgeschrieben: Für x²−2 und [1;2] ergibt c=4/3, danach bleibt [4/3;2], nicht das gezeichnete [4/3;1,5]. Aus letzterem ergäbe sich 24/17≈1,4118 statt des eingezeichneten 1,4. Die Newton-Skizze ordnet x1 und x2 außerdem nicht konsistent den Achsenschnitten zu. Regula-falsi-Intervall und Sekantenzeichnungen müssen berichtigt werden; quadratische Newton-Konvergenz braucht eine einfache Nullstelle und geeignete lokale Voraussetzungen.'
  },
  {
    id: '67c4d6f8-45fc-53d5-8c95-a4c423e421a6', decision: 'keep',
    de: [
      'Arithmetische Folgen verändern aufeinanderfolgende Glieder um eine feste Differenz, geometrische um einen festen Faktor. Der Startindex bestimmt den Exponenten beziehungsweise die Anzahl der Differenzschritte; der Graph besteht aus diskreten Indexpunkten.',
      'Die lernende Person formuliert selbstständig beide Bildungstypen, stellt aus Anfangswert und Differenz beziehungsweise Faktor den n-ten Term auf und verbindet berechnete Tabellenwerte mit korrekt indizierten Punkten im Graphen.',
      'In einem frischen Fall mit Startindex null und einem negativen geometrischen Faktor stellt sie den Term passend zum Index auf und erklärt, warum die Werte alternieren, obwohl der Multiplikationsfaktor konstant bleibt.'
    ],
    en: [
      'Arithmetic sequences change successive terms by a fixed difference, geometric sequences by a fixed factor. The starting index determines the exponent or number of difference steps; the graph consists of discrete index points.',
      'The learner independently states both formation types, constructs the nth-term expression from an initial value and difference or factor, and connects computed table values to correctly indexed graph points.',
      'In a fresh case starting at index zero with a negative geometric factor, the learner adjusts the expression to the indexing and explains why values alternate despite the constant multiplication factor.'
    ],
    rationale: 'DE und EN koordinieren Definition, n-ten Term, Tabelle und Graph derselben beiden einfachen Folgentypen. Dies ist eine kohärente Darstellungskompetenz auf E/AB1 nach Funktionswerten; Grenzwerte, Reihen und das spätere Finden beliebiger Bildungsgesetze werden nicht vorweggenommen. Die aktuelle Formulierung ist ausreichend konkret.',
    imageStatus: 'no_material_issue', image: 'Die Folgen 5,8,11,14 und 2,4,8,16 stimmen mit a_n=2+3n und b_n=2ⁿ sowie den angegebenen Rekursionen überein. Die diskreten beschrifteten Punkte passen zu den Tabellen.'
  },
  {
    id: '12a8dffc-dea7-5f2c-b490-2a1a2bb6901b', decision: 'keep',
    de: [
      'Reihenkonvergenz betrifft die Folge der Partialsummen, nicht nur das Verhalten einzelner Summanden. Die arithmetische Summenformel und die geometrische Summenformel beschreiben diese Partialsummen; deren Verhalten entscheidet über Grenzwert oder Divergenz.',
      'Die lernende Person bestimmt selbstständig Partialsummen beider Typen, erklärt die Bedeutung der Summenformel und begründet das Verhalten für wachsende Summandenanzahl anhand der Formel einschließlich q=1 und der Nullreihe als Sonderfällen.',
      'In einem unabhängig gestellten geometrischen Beispiel mit negativem Quotienten zwischen −1 und 0 erklärt sie die alternierenden Partialsummen und ihren Grenzwert; bei einer arithmetischen Reihe mit negativen Summanden unterscheidet sie Divergenz nach unten von Wachstum nach oben.'
    ],
    en: [
      'Series convergence concerns the sequence of partial sums, not merely individual summands. Arithmetic and geometric summation formulas describe these partial sums, whose behavior determines a limit or divergence.',
      'The learner independently determines partial sums of both types, explains the meaning of each summation formula, and justifies behavior as the number of summands grows, including q=1 and the zero series as special cases.',
      'In an independently presented geometric example with ratio between −1 and 0, the learner explains alternating partial sums and their limit; for an arithmetic series with negative summands, the learner distinguishes divergence downwards from growth upwards.'
    ],
    rationale: 'Der DE/EN-Text verbindet endliche Summen und deren Grenzverhalten korrekt in einer Reihenuntersuchung auf E/AB2. Die gewöhnlichen Folgentypen sind vorausgesetzt; harmonische Divergenz, abstrakte Notation und vertiefte geometrische Bedingungen bleiben getrennte Nachfolger. Die Begründung wird nicht auf Formeleinsetzen reduziert. Die fehlerhaften Bildbeschriftungen sind ein eigenes Bildproblem.',
    imageStatus: 'observed_issue', image: 'Links sind fünf Blockstapel mit a1,a2,a2,a3,a4 beschriftet; insbesondere stimmen Index und Stapelzahl ab dem dritten Stapel nicht. Die unqualifizierte Zeile „Divergenz (wächst unbegrenzt)“ gilt nur für das positive Beispiel, nicht für jede arithmetische Reihe einschließlich Nullreihe und negativer Fälle. Summenformeln rechts und links stimmen; Indizes und Geltungsbereich der Divergenzaussage müssen präzisiert werden.'
  },
  {
    id: '1b888f4c-df57-52a9-9551-b2b692e929fa', decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann anhand tabellarischer oder grafischer Darstellungen Vermutungen über Konvergenz oder Divergenz einer Folge formulieren, Grenzwerte schätzen und mithilfe des Bildungsgesetzes begründen, ob eine Nullfolge vorliegt.',
    proposedDescriptionEn: 'The learner can use tabular or graphical representations to formulate conjectures about convergence or divergence of a sequence, estimate limits, and use the formation rule to justify whether the sequence tends to zero.',
    de: [
      'Konvergenz beschreibt beliebig späte Folgenglieder und wird durch eine endliche Tabelle allein nicht entschieden. Eine Nullfolge hat Grenzwert null, während eine beschränkte oszillierende Folge divergieren kann.',
      'Die lernende Person formuliert selbstständig aus Tabellen und Graphen eine begründete Grenzwertvermutung, kennzeichnet ihre vorläufige Aussagekraft und erklärt anhand eines bekannten Bildungsgesetzes, warum die Werte einer Nullfolge beliebig nahe bei null bleiben.',
      'Bei einer frischen alternierenden Nullfolge unterscheidet sie Vorzeichenwechsel von fehlender Konvergenz; bei zwei Bildungsgesetzen mit gleichem endlichem Tabellenanfang erklärt sie, warum daraus noch kein gemeinsamer Grenzwert folgt.'
    ],
    en: [
      'Convergence concerns arbitrarily late terms and cannot be decided from a finite table alone. A null sequence has limit zero, whereas a bounded oscillating sequence may diverge.',
      'The learner independently formulates a justified limit conjecture from tables and graphs, marks its provisional evidential force, and uses a known formation rule to explain why a null sequence eventually stays arbitrarily close to zero.',
      'For a fresh alternating null sequence, the learner distinguishes sign changes from failure to converge; for two formation rules sharing the same finite table prefix, the learner explains why that prefix does not imply a common limit.'
    ],
    rationale: 'DE „entscheiden“ und EN „decide based on tabular or graphical representations“ schreiben einer endlichen Darstellung zu viel Beweiskraft zu. Die minimale Korrektur trennt Vermutung und Schätzung von der bereits verlangten Begründung einer Nullfolge. Das bekannte Bildungsgesetz begrenzt diese Begründung; allgemeine Grenzwertsätze und formale Monotonieargumente bleiben den Nachfolgern vorbehalten. Die Folgengrundlagen als Voraussetzung und E/AB2 bleiben erhalten.',
    imageStatus: 'observed_minor_issue', image: 'Die drei dargestellten Typen 2−10^(−n), (−1)ⁿ und 1/n illustrieren korrekt Konvergenz, Divergenz und Nullfolge. Der Tabelleneintrag d3=0,333 ist gerundet, ohne dies kenntlich zu machen; besser 1/3 oder 0,333… verwenden. Das Bild enthält Bildungsgesetze und trägt deshalb mehr Information als eine isolierte endliche Tabelle.'
  },
  {
    id: 'c61af0a9-7d56-5505-a70d-ee097c3b747f', decision: 'keep',
    de: [
      'Grenzwertsätze verknüpfen vorhandene Grenzwerte unter ihren jeweiligen Bedingungen; beim Quotienten muss der Nennergrenzwert von null verschieden sein. Das Scheitern einer Satzvoraussetzung ist für sich noch kein Divergenzbeweis.',
      'Die lernende Person zerlegt selbstständig einen Folgenterm in geeignete bekannte Teilfolgen, prüft die Voraussetzungen der benutzten Sätze und begründet den Grenzwert verbal wie symbolisch; bei einem divergenten Fall begründet sie das fehlende endliche Grenzverhalten gesondert.',
      'Bei einem neu vorgelegten Quotienten mit Zähler- und Nennergrenzwert null erkennt sie den nicht direkt anwendbaren Quotientensatz, formt den Term sinnvoll um und entscheidet erst anhand der umgeformten Folge.'
    ],
    en: [
      'Limit laws combine existing limits under their respective conditions; the quotient law requires a nonzero denominator limit. Failure of a law’s prerequisite does not by itself prove divergence.',
      'The learner independently decomposes a sequence expression into suitable known component sequences, checks the prerequisites of the laws used, and justifies the limit verbally and symbolically; in a divergent case, the learner separately justifies the lack of a finite limit.',
      'For a newly supplied quotient whose numerator and denominator both tend to zero, the learner recognizes that the quotient law does not apply directly, transforms the expression appropriately, and decides from the transformed sequence.'
    ],
    rationale: 'Nach dem beschreibenden Konvergenzziel fordert dieses E/AB3-Ziel ausdrücklich begründete Grenzwertargumente. DE/EN sind deckungsgleich, und symbolische sowie verbale Darstellung dienen derselben Argumentation. Der Text behauptet nicht, dass ein unanwendbarer Satz Divergenz beweist. Eine Neufassung ist unnötig; die konkreten Bedingungen gehören in die Evidenz.',
    imageStatus: 'observed_issue', image: 'Die Formeln für Summe, Produkt und Quotient mit B≠0 sowie der Grenzwert von (2n+1)/n sind korrekt. Die linke Konvergenzskizze zeigt jedoch Punkte beidseits von L beim beschrifteten Beispiel a_n=2+1/n, dessen Werte ausschließlich oberhalb von 2 liegen. Beim Beispiel (−1)ⁿ zeigt die Skizze mehr als die zwei möglichen Höhen. Beide Beispielskizzen müssen zu den angeschriebenen Folgen passen.'
  },
  {
    id: '6a66b4f5-d36e-5b53-91ad-cf25a849d66b', decision: 'keep',
    de: [
      'Eine explizite Folgenvorschrift ordnet jedem zulässigen natürlichen Index direkt einen Wert zu. Index und Folgenglied sind verschiedene Größen; die diskrete Definitionsmenge bleibt auch bei einer vertrauten Funktionstermform erhalten.',
      'Die lernende Person berechnet selbstständig auch nicht aufeinanderfolgende Glieder aus einer expliziten Vorschrift, stellt sie als Tabelle oder diskrete Punkte dar und erläutert Indexbereich und Symbol a_n fachsprachlich.',
      'In einer frischen rationalen oder alternierenden Vorschrift erklärt sie anhand des zulässigen Startindex, welche Werte definiert sind, und stellt eine ausgewählte Teilmenge von Gliedern ohne künstliche Zwischenwerte dar.'
    ],
    en: [
      'An explicit sequence rule directly assigns a value to each allowed natural-number index. Index and sequence term are different quantities; the domain remains discrete even when the expression resembles a familiar function.',
      'The learner independently computes even nonconsecutive terms from an explicit rule, represents them in a table or as discrete points, and explains the index domain and the symbol a_n using mathematical language.',
      'For a fresh rational or alternating rule, the learner uses the allowed starting index to explain which values are defined and represents selected terms without inventing intermediate values.'
    ],
    rationale: 'Titel und DE/EN-Beschreibung beschränken die Leistung klar auf explizite Darstellung, Berechnung und Deutung. Die allgemeinen arithmetischen/geometrischen Folgen liefern die Voraussetzung; Rekursion und Regelerschließung folgen separat. Die Q4/AB2/LK-Markierung wird als lokaler Anspruch bewahrt. Die zusätzlich gelieferten GK/LK-Geltungszeilen werden nicht als extern geprüfte bundesweite Zuordnung attestiert.',
    imageStatus: 'no_material_issue', image: 'a_n=2n+1, die Tabelle 3,5,7,9,11 und die Punkte (1|3) bis (5|11) stimmen. Die ausdrücklich diskrete Darstellung und die Unterscheidung Index/Folgenglied unterstützen das Ziel.'
  },
  {
    id: '10efb267-9733-5db3-a807-03f4cf54e336', decision: 'keep',
    de: [
      'Eine Rekursion bestimmt neue Folgenglieder aus vorherigen Werten und braucht dazu passende Anfangswerte. Die Rekursionsordnung entscheidet, wie viele Vorgänger benötigt werden; die Vorschrift muss bei jedem Schritt definiert sein.',
      'Die lernende Person berechnet selbstständig mehrere Glieder einer gegebenen Rekursion, erläutert die Rolle der Anfangswerte und deutet bei Fibonacci- oder vorgegebenen Newton-Folgen, welche vorherigen Werte den nächsten Schritt erzeugen.',
      'Bei einer frischen Rekursion mit zwei Anfangswerten oder einem Nenner, der null werden könnte, verfolgt sie die benötigten Vorgänger korrekt und erklärt, wann die Berechnung fortsetzbar ist.'
    ],
    en: [
      'A recurrence determines new terms from previous values and therefore needs appropriate initial values. Its order determines how many predecessors are needed, and the rule must be defined at each step.',
      'The learner independently computes several terms of a supplied recurrence, explains the role of initial values, and interprets which preceding values generate the next step in Fibonacci or supplied Newton sequences.',
      'For a fresh recurrence with two initial values or a denominator that could become zero, the learner tracks the necessary predecessors correctly and explains when computation can continue.'
    ],
    rationale: 'DE/EN fordern dieselbe rekursive Berechnung und Interpretation; Fibonacci und Newton sind Beispiele, keine zusätzliche Pflicht zur Herleitung des Newton-Verfahrens. Explizite Folgen und Folgengrundlagen sind direkt vorhanden. Die spätere Erschließung einer Regel bleibt getrennt, und die genannten Beispiele bilden Fälle derselben Rekursionskompetenz auf Q4/AB2. Eine externe GK/LK-Projektion wird nicht behauptet.',
    imageStatus: 'no_material_issue', image: 'Die Anfangswerte a1=a2=1, die Rekursion für n≥3, die Tabelle 1,1,2,3,5,8 und die vier gezeigten Berechnungsschritte stimmen vollständig.'
  },
  {
    id: 'f1eee698-04c6-5d60-bcc6-a3c67129eea2', decision: 'keep',
    de: [
      'Eine endliche Liste von Folgengliedern lässt mehrere Fortsetzungen zu. Ein passendes Bildungsgesetz erklärt die beobachtete Struktur und reproduziert alle gegebenen Glieder samt Indexierung, ist aber ohne weitere Angaben nicht eindeutig erzwungen.',
      'Die lernende Person stellt selbstständig aus gegebenen indexierten Gliedern eine plausible explizite oder rekursive Vorschrift auf, prüft jeden gegebenen Wert und begründet die Wahl durch Differenzen, Quotienten oder eine andere konkrete Regelmäßigkeit.',
      'In einem frischen Fall mit einer alternierenden oder nichtarithmetischen Struktur entwickelt sie eine passende Regel; bei einer zusätzlich vorgelegten anderen passenden Fortsetzung erklärt sie die Mehrdeutigkeit endlicher Daten.'
    ],
    en: [
      'A finite list of sequence terms permits several continuations. A suitable formation rule explains the observed structure and reproduces all supplied terms with their indexing, but is not uniquely forced without further information.',
      'The learner independently constructs a plausible explicit or recursive rule from given indexed terms, checks every supplied value, and justifies the choice through differences, ratios, or another concrete regularity.',
      'In a fresh case with an alternating or nonarithmetic structure, the learner develops a suitable rule; when another compatible continuation is also presented, the learner explains the ambiguity of finite data.'
    ],
    rationale: 'Die Formulierung „ein passendes“ beziehungsweise „a suitable“ wahrt bereits die fehlende Eindeutigkeit; es wird kein vermeintlich einziges Bildungsgesetz behauptet. Berechnung expliziter und rekursiver Folgen ist vorausgesetzt. Aufstellen und Begründen bilden eine konkrete Modellwahl auf Q4/AB2; allgemeine Interpolationssätze werden nicht ergänzt. Die kurzen DE/EN-Texte können unverändert bleiben.',
    imageStatus: 'no_material_issue', image: 'Die Differenzenfolge +4, die Ableitung von c=−1 aus a1=3 und alle fünf Proben für a_n=4n−1 sind korrekt. Die Schlussaussage „Passt!“ ist eine Passungsprüfung und behauptet keine Eindeutigkeit.'
  },
  {
    id: 'b66d13c5-187e-530b-b4d3-efc7506a7f34', decision: 'keep',
    de: [
      'Monotonie und eine passende Schranke sichern gemeinsam Konvergenz. Weder Beschränktheit allein noch eine beliebige obere Schranke bestimmt den Grenzwert; Monotonie ist außerdem keine notwendige Bedingung für Konvergenz.',
      'Die lernende Person begründet selbstständig Monotonie etwa über a_(n+1)−a_n, weist eine passende Schranke für alle zulässigen Indizes nach, zieht eine zulässige Konvergenzfolgerung und bestimmt den tatsächlichen Grenzwert gesondert.',
      'Für einen frischen beschränkten, oszillierenden Fall erklärt sie, warum der Monotoniesatz allein keine Entscheidung liefert; bei einer monoton fallenden Folge verwendet sie die untere statt der oberen Schranke und trennt diese vom Grenzwert.'
    ],
    en: [
      'Monotonicity together with an appropriate bound ensures convergence. Boundedness alone does not suffice, and an arbitrary upper bound does not determine the limit; monotonicity is also not necessary for convergence.',
      'The learner independently justifies monotonicity, for example using a_(n+1)−a_n, proves a suitable bound for every allowed index, draws a valid convergence conclusion, and separately determines the actual limit.',
      'For a fresh bounded oscillating case, the learner explains why the monotone convergence theorem alone gives no decision; for a decreasing sequence, the learner uses a lower rather than upper bound and distinguishes it from the limit.'
    ],
    rationale: 'Die Eigenschaften sind durch das ausdrückliche „daraus“ zu einer zusammenhängenden Konvergenzuntersuchung verbunden; eine Aufteilung würde diesen fachlichen Zusammenhang verdecken. DE und EN stimmen überein. Das beschreibende Konvergenzziel ist vorhanden, die Übertragung auf Reihen folgt erst danach. Q4/AB2/LK wird erhalten, und es wird kein universeller Entscheidungsalgorithmus behauptet.',
    imageStatus: 'no_material_issue', image: 'Für a_n=1−1/n, n≥1, stimmen a1=0, a2=0,5, a3≈0,667, die Schranken 0≤a_n<1 und der Grenzwert 1. Die beschrifteten Hauptpunkte und die steigende Richtung sind konsistent.'
  },
  {
    id: '4d55ba50-8d67-560c-a10f-cccff4728c40', decision: 'keep',
    de: [
      'Die n-te Partialsumme S_n addiert die ersten n Glieder einer Ausgangsfolge. Die Reihe wird über die Folge dieser endlichen Summen beschrieben; Summand a_n, Partialsumme S_n und ein gegebenenfalls existierender unendlicher Summenwert sind verschiedene Objekte.',
      'Die lernende Person bildet selbstständig aus einer Ausgangsfolge die ersten Partialsummen und übersetzt zwischen ausgeschriebener Summe und Sigma-Notation, wobei sie Laufindex, Grenzen und Anzahl der Summanden korrekt erklärt.',
      'In einer frischen Aufgabe mit Startindex null oder alternierenden Summanden deutet sie die neue Summationsgrenze korrekt; aus aufeinanderfolgenden gegebenen Partialsummen gewinnt sie einen Summanden als Differenz zurück.'
    ],
    en: [
      'The nth partial sum S_n adds the first n terms of an underlying sequence. A series is described through the sequence of these finite sums; a summand a_n, a partial sum S_n, and an infinite sum value if it exists are distinct objects.',
      'The learner independently constructs initial partial sums from a sequence and translates between expanded sums and sigma notation while correctly explaining the running index, bounds, and number of summands.',
      'In a fresh task starting at index zero or containing alternating summands, the learner interprets the changed summation bound correctly; from consecutive supplied partial sums, the learner recovers a summand by taking their difference.'
    ],
    rationale: 'Die aktuelle DE/EN-Formulierung trifft genau die Notations- und Objektdeutung. Arithmetische/geometrische Reihen und Folgekonvergenz sind bereits vorausgesetzt; harmonischer Divergenzbeweis und Tayloranwendungen gehören zu den Nachfolgern. Der kurze Text bleibt auf Q4/AB2 angemessen und braucht keine zusätzliche Berechnungs- oder Beweispflicht.',
    imageStatus: 'no_material_issue', image: 'Aus a_n=n entstehen korrekt die Partialsummen 1,3,6,10,15. Ausgeschriebene Summen, Sigma-Notation und die Unterscheidung Ausgangsfolge/Partialsumme sind sauber beschriftet.'
  },
  {
    id: '565fcd3f-52cd-5402-a0ac-a1069ed9c598', decision: 'keep',
    de: [
      'Obwohl 1/n gegen null geht, sind die harmonischen Partialsummen unbeschränkt. Eine wiederholbare untere Abschätzung zusammengefasster Glieder zeigt unbegrenzten Zuwachs; die Nullfolgenbedingung allein sichert keine Reihenkonvergenz.',
      'Die lernende Person begründet selbstständig die Divergenz durch eine gültige Blockabschätzung oder einen gleichwertigen Beweis und erklärt, warum sich damit für jede vorgegebene Schranke eine größere Partialsumme finden lässt.',
      'Bei einer unabhängig gestellten harmonischen Restreihe ab einem späteren Startindex passt sie ihr Argument an und begründet, weshalb das Weglassen endlich vieler Anfangsglieder die Divergenz nicht beseitigt.'
    ],
    en: [
      'Although 1/n tends to zero, harmonic partial sums are unbounded. A repeatable lower bound on blocks of terms shows unlimited accumulation; the null-sequence condition alone does not ensure series convergence.',
      'The learner independently proves divergence using a valid block estimate or an equivalent argument and explains why a partial sum exceeding any prescribed bound can therefore be found.',
      'For an independently presented harmonic tail starting at a later index, the learner adapts the argument and explains why removing finitely many initial terms does not eliminate divergence.'
    ],
    rationale: 'Der knappe DE/EN-Text ist durch das benannte Objekt und den Begründungsauftrag vollständig bestimmt. Partialsummen sowie Beschränktheit sind direkt vorausgesetzt. „Geeignetes Argument“ hält gültige Beweiswege offen; eine Festlegung auf Gruppierung oder Integralvergleich wäre unbegründet. Die geometrischen Konvergenzbedingungen bleiben nachfolgend, der Q4/AB2-LK-Rahmen bleibt bestehen.',
    imageStatus: 'no_material_issue', image: 'Die gezeigten Blöcke 1/3+1/4>1/2 und 1/5+…+1/8>1/2 sind korrekt abgeschätzt; der erste einzelne 1/2-Block ist separat gleich 1/2 beschriftet. Die unendlich vielen späteren Blöcke tragen den Divergenzschluss.'
  },
  {
    id: 'c66cb27b-8199-58fb-95f4-6314c0c2d07b', decision: 'keep',
    de: [
      'Für eine geometrische Reihe mit von null verschiedenem Anfangsglied konvergieren die Partialsummen genau bei |q|<1; dann verschwindet qⁿ in der endlichen Summenformel und der Grenzwert ist a/(1−q). Die Nullreihe ist ein eigener trivialer Fall.',
      'Die lernende Person erläutert selbstständig die Bedingung über das Verhalten von qⁿ, bestimmt den Grenzwert im konvergenten Fall und begründet, warum insbesondere q=1 und q=−1 bei a≠0 keinen endlichen Reihengrenzwert liefern.',
      'In einer frischen geometrischen Reihe mit negativem q zwischen −1 und 0 erklärt sie die Konvergenz trotz alternierender Summanden; bei verändertem Startindex passt sie das erste Glied und damit den Summenwert korrekt an.'
    ],
    en: [
      'For a geometric series with nonzero initial term, partial sums converge exactly when |q|<1; qⁿ then vanishes in the finite summation formula and the limit is a/(1−q). The zero series is a separate trivial case.',
      'The learner independently explains the condition through the behavior of qⁿ, determines the limit in the convergent case, and justifies why q=1 and q=−1 in particular give no finite series limit when a≠0.',
      'In a fresh geometric series with negative q between −1 and 0, the learner explains convergence despite alternating summands; after a change of starting index, the learner correctly adjusts the first term and hence the sum value.'
    ],
    rationale: 'DE und EN fordern ausdrücklich Bedingungen und den Grenzwert nur konvergenter Reihen. Damit ist die relevante Unterscheidung bereits angelegt; Sonderfälle können konkret in der Evidenz behandelt werden. Reihenuntersuchung, Konvergenz und harmonische Divergenz sind vorhanden, Anwendungs- und Taylorziele folgen separat. Erklären und Bestimmen bilden eine zusammenhängende Q4/AB2-Leistung.',
    imageStatus: 'no_material_issue', image: 'Die dargestellten Beispiele haben a=3: Für q=1/2 stimmen die Glieder und S=6, für q=2 und q=−2 die gezeigten Vorzeichen und Werte. Die endliche Summenformel gilt mit q≠1 korrekt. Die allgemeine Klassifikation ist auf a≠0 zu lesen; die explizite Nullreihe sollte im Unterricht gesondert behandelt werden.'
  }
]

const roundDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(roundDirectory, '../../../../../../../../../..')
const readJson = (name) => JSON.parse(readFileSync(resolve(roundDirectory, name), 'utf8'))
const digest = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const input = readJson('description-review-input.json')
const campaign = readJson('description-review-campaign.json')
const batch = campaign.batches[0]
const runId = 'math-b039-20260907-independent-b-codex'
const completedAt = process.argv[2]
if (!completedAt || !Number.isFinite(Date.parse(completedAt))) throw new Error('Pass actual completedAt from clock tool')
if (authored.length !== 20 || JSON.stringify(authored.map(({ id }) => id)) !== JSON.stringify(batch.goalIds)) throw new Error('Exact ordered twenty-goal boundary mismatch')
const generationParameters = {
  provider: 'OpenAI', model: 'Codex', underlyingExactModel: 'unknown',
  temperature: 'not exposed', samplingParameters: 'not exposed',
  reviewer: '/root/math_b039_blind_b',
  execution: 'One independent agent; judgments individually authored from sealed Round B input; no other rounds, old reviews, P profiles or canonical diffs inspected.',
  humanReviewClaim: false, modelDiversityClaim: false,
  visualizationMethod: '19 actual view_image calls, source images displayed; one not_present; SHA-256 checked against sealed inputs.',
  sourceVerification: 'Only supplied sourceRef and page context; no external mapping, source-manifest or learner-facing projection audit claimed.'
}
const parameterBytes = JSON.stringify(generationParameters, null, 2) + '\n'
const images = input.goals.map((goal, index) => {
  const visualization = goal.reviewContext.page.visualization
  const note = authored[index]
  if (!visualization) return { goalId: goal.goalId, status: 'not_present', viewed: false, boundDigest: null, actualDigest: null, observationDe: note.image }
  const file = resolve(repositoryRoot, 'app/public' + visualization.url)
  const actualDigest = digest(readFileSync(file))
  if (actualDigest !== visualization.originalDigest) throw new Error(`Sealed image changed: ${goal.goalId}`)
  return { goalId: goal.goalId, status: note.imageStatus, viewed: true, viewTool: 'view_image', assetPath: 'app/public' + visualization.url, boundDigest: visualization.originalDigest, actualDigest, matchesSealedDigest: true, observationDe: note.image, reviewAuthority: 'ai_candidate', grantsHumanApproval: false }
})
const records = input.goals.map((goal, index) => {
  const note = authored[index]
  const keys = ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', schemaVersion: 1,
    recordId: `math-b039-b-${String(index + 1).padStart(2, '0')}-${goal.goalId}`, runId,
    campaignId: campaign.campaignId, roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint, bookDigest: campaign.bookDigest,
    ...Object.fromEntries(keys.map((key) => [key, goal[key]])), decision: note.decision,
    ...(note.decision === 'revise' ? { proposedDescriptionDe: note.proposedDescriptionDe, proposedDescriptionEn: note.proposedDescriptionEn } : {}),
    understandingEvidence: {
      essentialUnderstandingDe: note.de[0], essentialUnderstandingEn: note.en[0],
      observablePerformanceDe: note.de[1], observablePerformanceEn: note.en[1],
      transferExpectationDe: note.de[2], transferExpectationEn: note.en[2]
    },
    rationale: `${note.rationale} Bildsichtung: ${note.image}${images[index].actualDigest ? ` Gesehener und gebundener Bildhash: ${images[index].actualDigest}.` : ''} Geltungs- und Quellenangaben sind ausschließlich gelieferter Kontext, keine eigene externe Quellen- oder Projektionsprüfung.`,
    evidenceProfileContract: 'positive-understanding-evidence-v2', evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate', reviewAuthority: 'ai_candidate'
  }
})
const recordsBytes = records.map((record) => JSON.stringify(record)).join('\n') + '\n'
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', schemaVersion: 1,
  runId, campaignId: campaign.campaignId, roundId: campaign.roundId, batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint, bundleFingerprint: campaign.bundleFingerprint, bookDigest: campaign.bookDigest,
  provider: 'OpenAI', model: 'Codex; exact underlying model unknown', role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2', promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint, generationParametersFingerprint: digest(parameterBytes),
  independenceGroupId: campaign.independenceGroupId, blindToOtherRuns: true, goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
    { role: 'review_prompt', digest: campaign.promptFingerprint },
    { role: 'review_criteria', digest: campaign.criteriaFingerprint }
  ],
  startedAt: '2026-09-06T23:01:34Z', completedAt, status: 'completed', outputDigest: digest(recordsBytes), toolchainVersion: 'codex-independent-description-review-v1'
}
mkdirSync(resolve(roundDirectory, 'results'), { recursive: true })
writeFileSync(resolve(roundDirectory, 'generation-parameters.json'), parameterBytes)
writeFileSync(resolve(roundDirectory, 'image-observations.json'), JSON.stringify({ runId, bundleFingerprint: campaign.bundleFingerprint, images, reviewAuthority: 'ai_candidate', grantsHumanApproval: false }, null, 2) + '\n')
writeFileSync(resolve(roundDirectory, `results/${batch.batchId}.records.jsonl`), recordsBytes)
writeFileSync(resolve(roundDirectory, `results/${batch.batchId}.run.json`), JSON.stringify(run, null, 2) + '\n')
console.log(JSON.stringify({ runId, count: records.length, decisions: records.reduce((counts, record) => ({ ...counts, [record.decision]: (counts[record.decision] ?? 0) + 1 }), {}), viewedImages: images.filter(({ viewed }) => viewed).length, outputDigest: run.outputDigest, results: `results/${batch.batchId}.records.jsonl` }, null, 2))
