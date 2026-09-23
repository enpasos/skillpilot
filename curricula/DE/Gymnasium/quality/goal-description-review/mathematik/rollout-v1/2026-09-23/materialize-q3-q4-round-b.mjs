import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Independent Round B judgments. This file reads only the packaged Round B
// inputs, prompts, criteria, and page bindings of the two named batches.
const parent = dirname(fileURLToPath(import.meta.url))
const digest = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const evidence = (essentialUnderstandingDe, essentialUnderstandingEn,
  observablePerformanceDe, observablePerformanceEn,
  transferExpectationDe, transferExpectationEn) => ({
  essentialUnderstandingDe, essentialUnderstandingEn,
  observablePerformanceDe, observablePerformanceEn,
  transferExpectationDe, transferExpectationEn,
})

const q4 = [
  {
    id: '08259bad-eb0c-5bd3-b2a1-b6673f796605', decision: 'keep',
    understandingEvidence: evidence(
      'Die Gültigkeit eines Rechenschritts hängt von seinen Voraussetzungen ab: Beim Teilen darf der Divisor nicht null sein; beim Wurzelziehen im Reellen muss der Radikand nichtnegativ sein. Ein Fall außerhalb der Bedingung darf nicht stillschweigend im selben Verfahren weiterbehandelt werden.',
      'The validity of a calculation step depends on its conditions: division requires a nonzero divisor, and a real square root requires a nonnegative radicand. A case outside the condition must not silently continue through the same procedure.',
      'Die lernende Person prüft in einer eigenständig vorgelegten Umformung den Definitionsbereich und relevante Vorzeichenbedingungen, benennt ausgeschlossene Fälle und bearbeitet sie getrennt oder verwirft sie mit Begründung.',
      'For an independently presented transformation, the learner checks the domain and relevant sign conditions, identifies excluded cases, and handles them separately or rejects them with a reason.',
      'Bei einer neuen Gleichung wird ein Ausdruck mit einer Variablen im Nenner durch eine Wurzelbedingung ersetzt. Die lernende Person bestimmt die nun maßgebliche Bedingung vor der Umformung und prüft die gefundenen Lösungen dagegen.',
      'In a new equation, an expression with a variable in the denominator is replaced by a square-root condition. The learner determines the newly relevant condition before transforming the equation and checks proposed solutions against it.'),
    rationale: 'KEEP: Beide Sprachen nennen die Prüfung von Verfahrensbedingungen und die korrekte Fallbehandlung. Das ist eine zusammenhängende formale Kontrollkompetenz; einzelne Verfahren sind Beispiele, keine verdeckte Erweiterung. Das betrachtete Bild zeigt korrekt x≠0 für 6/x und einen nichtnegativen Radikanden für reelle Quadratwurzeln. Es ist Anschauung, kein Leistungsnachweis.'
  },
  {
    id: '08a4ae81-b732-50c6-8a3f-c19b6bbd4c2b', decision: 'keep',
    understandingEvidence: evidence(
      'Äquivalente Umformungen erhalten die Lösungsmenge in beide Richtungen; eine bloße Implikation erhält nur eine Folgerichtung und kann Scheinlösungen zulassen. Die Rückprüfung entscheidet, welche Kandidaten die Ausgangsgleichung erfüllen.',
      'Equivalent transformations preserve the solution set in both directions; a one-way implication preserves only one direction and may introduce extraneous candidates. Checking back determines which candidates satisfy the original equation.',
      'Die lernende Person kennzeichnet die Richtung mehrerer vorgelegter Gleichungsumformungen, erklärt an einem nicht umkehrbaren Schritt die mögliche Änderung der Lösungsmenge und prüft Kandidaten an der Ausgangsgleichung.',
      'The learner marks the direction of several supplied equation transformations, explains how a nonreversible step may change the solution set, and checks candidates in the original equation.',
      'Eine frische Aufgabe verwendet Quadrieren statt einer zuvor betrachteten Division. Die lernende Person begründet die nur einseitige Folgerung und entfernt eine durch das Quadrieren entstandene Scheinlösung.',
      'A fresh problem uses squaring instead of a previously considered division. The learner explains the one-way implication and removes an extraneous solution introduced by squaring.'),
    rationale: 'KEEP: Unterscheiden der Umformungsrichtung und korrektes Bestimmen der Lösungsmenge gehören hier unmittelbar zusammen. DE und EN sind deckungsgleich. Das betrachtete Bild trennt 2x=8 ⇔ x=4 korrekt von x=3 ⇒ x²=9; die Rückrichtung scheitert wegen x=-3. Die vorgängige Bedingungsprüfung ist passend.'
  },
  {
    id: '14af09c2-999f-52fa-8d42-1f2f6b23629b', decision: 'keep',
    understandingEvidence: evidence(
      'Ein digitales Ergebnis hängt von der mathematisch richtigen Eingabe und der zur Frage passenden Werkzeugfunktion ab. CAS und Tabellenkalkulation können dieselbe Aufgabe unterschiedlich darstellen; Bedienung und mathematischer Zweck müssen zusammenpassen.',
      'A digital result depends on mathematically correct input and choosing a tool function suited to the question. A CAS and a spreadsheet may represent the same task differently; the operation must fit the mathematical purpose.',
      'Die lernende Person formuliert eine vorgelegte Funktion korrekt für ein verfügbares Werkzeug, wählt die zur Frage passende Funktion und erklärt, welche Ausgabe die gesuchte mathematische Größe darstellt.',
      'The learner enters a supplied function correctly into an available tool, selects the function that matches the question, and explains which output represents the requested mathematical quantity.',
      'In einer neuen Aufgabe wechselt die Fragestellung von Nullstellen zu Änderungsraten und das Werkzeug von einem CAS zu einer Tabellenkalkulation. Die lernende Person passt Eingabe und Funktionswahl an, ohne die beiden Operationen zu verwechseln.',
      'In a new task, the question changes from zeros to rates of change and the tool changes from a CAS to a spreadsheet. The learner adapts the input and operation without confusing the two mathematical requests.'),
    rationale: 'KEEP: Der aktuelle Text beansprucht zielgerichtete Eingabe und Funktionswahl; die kritische Prüfung von Tool-Ausgaben liegt im ausgewiesenen Nachfolger. Die DE/EN-Fassungen sind gleichwertig. Das betrachtete Bild zeigt f(x)=x²−4 und die Nullstellen −2, 2 korrekt. Der Bildbeleg ist didaktisch, nicht eigenständige Schülerleistung.'
  },
  {
    id: '1675fdde-cba7-5456-ae70-a846e1924a68', decision: 'keep',
    understandingEvidence: evidence(
      'Schnittpunkte eines vorgegebenen Funktionsgraphen mit einer Geraden sind gemeinsame Punkte beider Darstellungen. Ihre Anzahl ergibt sich aus dem sichtbaren Verlauf und der Lage der Geraden; Berührung an einem Punkt bedeutet für einen allgemeinen Graphen nicht automatisch, dass es sonst keinen weiteren Schnittpunkt gibt.',
      'Intersections of a supplied function graph and a line are points shared by both representations. Their number follows from the visible graph and the line position; touching at one point does not, for a general graph, rule out another intersection elsewhere.',
      'Die lernende Person markiert in einem eigenständig vorgelegten Graphen die gemeinsamen Punkte mit verschiedenen Geraden, zählt sie und begründet anschaulich, wann eine gezeigte Gerade den Graphen berührt oder schneidet.',
      'Given an independently presented graph, the learner marks shared points with different lines, counts them, and visually explains when a shown line touches or crosses the graph.',
      'Ein neuer Graph mit mehreren Wendungen ersetzt die Parabel. Die lernende Person prüft den gesamten dargestellten Verlauf und erkennt, ob eine Tangente an einer Stelle zusätzlich an anderer Stelle schneiden kann.',
      'A new graph with several turns replaces the parabola. The learner checks the entire displayed graph and recognizes whether a tangent at one point can also intersect elsewhere.'),
    rationale: 'KEEP: Der Text begrenzt die Leistung auf anschauliches Begründen anhand eines vorgegebenen Graphen; eine allgemeine algebraische Schnittpunktklassifikation wäre weitergehend. Das betrachtete Bild ist für y=x² und die drei horizontalen Geraden y=−1, 0, 1 korrekt. Seine 0/1/2-Fälle dürfen nicht als allgemeine Schranke für beliebige Graphen oder Tangenten verallgemeinert werden; dies wird in der Evidenz ausdrücklich geprüft. Der Quellenverweis allein belegt keine externe Quellenabstimmung.'
  },
  {
    id: '499b8a0d-a5da-5cf7-8557-89e16152b752', decision: 'keep',
    understandingEvidence: evidence(
      'Eine mathematische Behauptung wird an ihrer Begründung und ihrem Geltungsbereich beurteilt. Ein einziges gültiges Gegenbeispiel widerlegt eine allgemeine Aussage, während einzelne bestätigende Beispiele keinen allgemeinen Beweis liefern.',
      'A mathematical claim is judged by its reasoning and scope. One valid counterexample disproves a universal statement, whereas individual confirming examples do not establish a general proof.',
      'Die lernende Person prüft eine fremde Lösung oder Argumentationskette auf gültige Schritte, sucht bei einer allgemeinen Behauptung ein passendes Gegenbeispiel und formuliert ein begründetes Urteil.',
      'The learner checks a supplied solution or chain of reasoning for valid steps, seeks a suitable counterexample to a universal claim, and gives a reasoned judgment.',
      'Bei einer neuen Aussage gelten veränderte Voraussetzungen für die betrachteten Objekte. Die lernende Person prüft, ob das frühere Gegenbeispiel noch zulässig ist, und passt ihre Beurteilung an den neuen Geltungsbereich an.',
      'For a new claim, the conditions on the objects change. The learner checks whether the earlier counterexample is still admissible and adjusts the judgment to the new scope.'),
    rationale: 'KEEP: Prüfen, Gegenbeispielsuche und Stellungnahme sind eine kohärente Urteilsleistung, keine drei unabhängigen Themen. Die Rechteckdarstellung zeigt bei gleichem Umfang 20 korrekt die Flächen 25 und 16 und widerlegt die Allgemeinbehauptung. DE und EN stimmen überein.'
  },
  {
    id: '4a53a441-3c2a-53aa-8a1a-e08a6898e826', decision: 'keep',
    understandingEvidence: evidence(
      'Mathematische Fachwörter bezeichnen verschiedene Objekte und Beziehungen: Eine Funktion ordnet Werte zu, eine Nullstelle ist ein Eingabewert mit Funktionswert null, und eine Ableitung beschreibt lokal eine Änderungsrate. Präzise Sprache vermeidet die Verwechslung dieser Rollen.',
      'Mathematical terms name different objects and relations: a function assigns values, a zero is an input value whose function value is zero, and a derivative describes a local rate of change. Precise language keeps these roles distinct.',
      'Die lernende Person beschreibt eine vorgelegte Funktion, ihre Nullstellen und eine Ableitung mit korrekten Begriffen und verbessert eine Erklärung, die Eingabewert, Funktionswert und Änderungsrate verwechselt.',
      'The learner describes a supplied function, its zeros and a derivative using correct terms and corrects an explanation that confuses input value, function value and rate of change.',
      'Bei einer frischen Darstellung werden dieselben Größen in Tabelle und Graph statt im Term gezeigt. Die lernende Person verwendet die Fachwörter auch dort passend und erläutert ihren Bezug zur Darstellung.',
      'In a fresh representation, the same quantities appear in a table and graph rather than in an expression. The learner uses the terms appropriately there and explains how they relate to the representation.'),
    rationale: 'KEEP: Die Kompetenz ist der präzise Einsatz mathematischer Begriffe; Funktion, Nullstelle und Ableitung sind Beispiele für unterscheidbare Rollen. Das Bild benennt diese Rollen sachlich passend, insbesondere die Nullstelle als x-Wert. Die ausdifferenzierte Aussageformulierung bleibt beim Nachfolger.'
  },
  {
    id: '5d9c156b-e5a4-5e91-9da3-22e858eb1f8e', decision: 'keep',
    understandingEvidence: evidence(
      'Ein Teilungsverhältnis vergleicht Längen von Teilstrecken derselben Strecke in einer räumlichen Figur. Es bleibt unter gemeinsamer Skalierung unverändert; die Lage und Reihenfolge der Punkte bestimmen, welche Strecken verglichen werden.',
      'A division ratio compares lengths of parts of the same segment in a spatial figure. It is unchanged by a common scaling; point positions and order determine which subsegments are compared.',
      'Die lernende Person bestimmt in einer räumlichen Skizze oder Koordinatendarstellung die zugehörigen Teilstrecken, bildet und vergleicht ihre Verhältnisse und begründet die Zuordnung der Punkte und Längen.',
      'Using a spatial sketch or coordinates, the learner identifies the relevant subsegments, forms and compares their ratios, and justifies the matching of points and lengths.',
      'Eine neue Konfiguration legt den Teilpunkt auf eine anders gerichtete Kante desselben Körpers. Die lernende Person bestimmt das Verhältnis erneut und erklärt, welche räumliche Änderung es beibehält oder verändert.',
      'A new configuration places the division point on a differently oriented edge of the same solid. The learner determines the ratio again and explains which spatial change preserves or alters it.'),
    rationale: 'KEEP: Bestimmen, Vergleichen und Begründen beziehen sich auf dasselbe Streckenteilungsverhältnis. Die getrennte Volumenrelation ist als Nachfolger erkennbar und wird nicht in dieses Ziel hineingenommen. Auf dieser Seite ist keine Visualisierung vorhanden; aus dem Quellenverweis allein wird keine vollständige Quellenprüfung behauptet.'
  },
  {
    id: 'bab64124-fabf-544c-a2e5-3e6c786531d2', decision: 'keep',
    understandingEvidence: evidence(
      'In einer mathematischen Diskussion hängt die Qualität einer Rückmeldung vom Inhalt des Arguments ab. Eine allgemein begründete Folgerung trägt mehr als ein einzelnes bestätigendes Beispiel; ein Gegenbeispiel kann eine allgemeine Behauptung widerlegen.',
      'In a mathematical discussion, useful feedback depends on the content of an argument. A general justification supports more than one confirming example, and a counterexample can disprove a universal claim.',
      'Die lernende Person bringt zu einer Aufgabe ein eigenes Argument ein, prüft einen fremden Begründungsschritt und gibt eine konkrete, mathematisch begründete Rückmeldung zum tragfähigen oder fehlenden Teil.',
      'The learner contributes an argument to a problem, evaluates another person’s reasoning step, and gives concrete, mathematically reasoned feedback about what is sound or missing.',
      'Bei einer neuen Diskussion wird aus einer zuvor wahren Aussage ihre Umkehrung behauptet. Die lernende Person prüft das neue Argument und formuliert eine passende Rückfrage oder ein Gegenbeispiel.',
      'In a new discussion, someone asserts the converse of a previously true statement. The learner checks the new argument and offers a suitable question or counterexample.'),
    rationale: 'KEEP: Einbringen, Prüfen und Rückmelden bilden eine zusammenhängende Diskussionskompetenz. Das Bild unterscheidet am Beispiel gerader Quadratzahlen korrekt den allgemeinen Beweis von einem einzelnen bestätigenden Fall. Es ersetzt keine beobachtete eigene Argumentation.'
  },
  {
    id: 'c8698478-4662-5b52-a3e5-7994604ff0de', decision: 'keep',
    understandingEvidence: evidence(
      'Eine Lösungsstrategie kann durch eine andere Darstellung oder ein anderes Verfahren ersetzt werden. Ihr Nutzen hängt von der Aufgabe ab: Eine grafische Lösung kann Lage und Anzahl anschaulich zeigen, während eine rechnerische Lösung hier genaue Koordinaten liefert.',
      'A solution strategy can be replaced by another representation or method. Its usefulness depends on the task: a graph may show position and number of intersections, while calculation can give exact coordinates in this setting.',
      'Die lernende Person skizziert zu einem vorgelegten Problem einen gangbaren zweiten Weg, benennt einen konkreten Vor- und Nachteil gegenüber dem ersten und begründet die Wahl anhand des verlangten Ergebnisses.',
      'For a supplied problem, the learner outlines a workable second route, states a concrete advantage and disadvantage compared with the first, and justifies a choice using the requested result.',
      'Eine neue Aufgabe verlangt nur die ungefähre Lage statt exakter Koordinaten eines Schnittpunkts. Die lernende Person prüft, ob sich damit die zweckmäßigere Strategie ändert, und begründet den Wechsel.',
      'A new task asks only for an approximate location rather than exact intersection coordinates. The learner checks whether this changes the more suitable strategy and explains the change.'),
    rationale: 'KEEP: Vorschlagen und knapper Vergleich sind hier eine einzige Strategiewahl; der Nachfolger behandelt einen ausführlicheren Kriterienvergleich im LK. Das Bild rechnet den Schnittpunkt der Geraden y=2x−1 und y=−x+5 korrekt zu (2,3) und stellt den grafischen Weg als Näherung dar. Kein bestimmtes Verfahren wird für alle Aufgaben vorgeschrieben.'
  },
  {
    id: 'e75ec65a-9692-5871-b90b-fbebe38ae0c3', decision: 'keep',
    understandingEvidence: evidence(
      'Die relative Lage einer Geraden und einer Ebene ergibt sich aus Richtungsvektor, Ebenennormale und einer Punktprobe: n·v=0 bedeutet parallele Richtung; erst die Lage eines Stützpunkts unterscheidet echte Parallelität von einer Geraden in der Ebene. Die Rechnung muss zur geometrischen Lage passen.',
      'The position of a line relative to a plane follows from its direction vector, the plane normal and a point check: n·v=0 gives a parallel direction; checking a point distinguishes a truly parallel line from one contained in the plane. The calculation must match the geometric position.',
      'Die lernende Person untersucht eine vorgelegte Gerade und Ebene rechnerisch, begründet mit Vektorbeziehungen und Punktprobe die besondere Lage und deutet die Anzahl gemeinsamer Punkte geometrisch.',
      'The learner investigates a supplied line and plane computationally, justifies the special position using vector relations and a point check, and interprets the number of shared points geometrically.',
      'In einer frischen Konfiguration bleibt n·v=0, doch der Stützpunkt liegt nun in der Ebene. Die lernende Person erkennt, dass die Gerade in der Ebene liegt, und begründet, warum die frühere Einordnung als echt parallel nicht mehr gilt.',
      'In a fresh configuration n·v remains zero but the support point now lies in the plane. The learner identifies the line as contained in the plane and explains why the earlier classification as strictly parallel no longer applies.'),
    rationale: 'KEEP: Untersuchen, Begründen und Deuten sind ein kohärenter Lagebeziehungsfall. Das betrachtete Bild rechnet n=(1,2,1), v=(2,−1,0), n·v=0 und P=(1,0,1) mit linker Ebenenseite 2 statt 4 korrekt; folglich ist die Gerade echt parallel. Der Zwischenhinweis „g parallel zu E“ ist als Richtungsprüfung zu lesen und wird durch die Punktprobe qualifiziert. Kein Quellenabgleich über den gelieferten Verweis hinaus behauptet.'
  },
  {
    id: 'fcb4cef1-b17a-5682-924c-41498fc6c9b2', decision: 'keep',
    understandingEvidence: evidence(
      'Eine mathematische Aussage macht Voraussetzungen und Schluss erkennbar und verwendet Variablen und Symbole durchgehend mit derselben Bedeutung. Eine Folgerung benötigt eine tragfähige Begründung; klare Notation allein beweist sie nicht.',
      'A mathematical statement clearly identifies conditions and conclusion and uses variables and symbols consistently. An implication needs sound reasoning; clear notation alone does not prove it.',
      'Die lernende Person formuliert aus einer vorgelegten Eigenschaft einen Satz mit ausdrücklich benannter Voraussetzung und Schlussfolgerung, erklärt die Variablen und bereinigt eine widersprüchliche Notation.',
      'The learner turns a supplied property into a statement with explicit conditions and conclusion, explains the variables, and corrects inconsistent notation.',
      'Eine frische Aufgabe ändert den Zahlenbereich von natürlichen zu ganzen Zahlen. Die lernende Person passt Voraussetzung und Symbolgebrauch an und prüft, ob der formulierte Schluss noch gilt.',
      'A fresh task changes the number domain from natural to integer numbers. The learner adapts the condition and notation and checks whether the stated conclusion still holds.'),
    rationale: 'KEEP: Der aktuelle DE/EN-Text formuliert eine klare sprachliche Kompetenz und bleibt unterhalb des Nachfolgers „Lösung nachvollziehbar erklären“. Das Bild zeigt eine konsistente Bedingung-Schluss-Struktur für eine gerade Zahl und ihr gerades Quadrat; k sollte im Unterricht als ganze Zahl benannt werden, was die Checkliste mit „Variable erklärt“ bereits anlegt.'
  },
  {
    id: 'fde351a8-98b1-5d75-b4df-813beb2bbe3c', decision: 'keep',
    understandingEvidence: evidence(
      'Gleichungen, Ungleichungen und Funktionen drücken unterschiedliche Beziehungen zwischen festgelegten Größen aus. Variablen, Koeffizienten und Terme erhalten ihre Bedeutung durch den Sachkontext und die getroffenen Annahmen; eine formal richtige Beziehung kann inhaltlich unpassend sein.',
      'Equations, inequalities and functions express different relations among defined quantities. Variables, coefficients and expressions obtain their meaning from the context and assumptions; a formally valid relation may still be unsuitable for the situation.',
      'Die lernende Person übersetzt eine eigenständig vorgelegte Beziehung zwischen Größen in eine passende Gleichung, Ungleichung oder Funktion und erläutert Einheiten, Variablen sowie die Bedeutung der Terme im Kontext.',
      'The learner translates an independently supplied relation among quantities into a suitable equation, inequality or function and explains the units, variables and meaning of its terms in context.',
      'In einer neuen Situation wird aus einer festen Gebühr plus Stückkosten eine Obergrenze für verfügbare Mittel. Die lernende Person wählt nun eine Ungleichung statt einer Kostenfunktion und deutet die zulässigen Werte.',
      'In a new situation, a fixed fee plus unit costs is replaced by a limit on available funds. The learner now chooses an inequality rather than a cost function and interprets the admissible values.'),
    rationale: 'KEEP: Formulieren und Kontextdeuten beziehen sich auf dieselbe Modellbeziehung; die Wahl zwischen Gleichung, Ungleichung und Funktion ist ausdrücklich Teil der bestehenden Kompetenz. DE/EN sind deckungsgleich. Das betrachtete Bild K(x)=15+2x zeigt 15 Euro Fixkosten, bezeichnet 2 Euro aber nur als Betrag „pro verkauftem Saft“. Ohne Ausweis als variable Kosten ist die Preis-/Kostenrolle mehrdeutig. Dieses Bildthema ist separat zu klären; aus der Mehrdeutigkeit folgt keine Änderung des korrekten Zieltexts und kein eigenständiger Leistungsnachweis.'
  },
]

const q3 = [
  {
    id: '70efdec0-110c-5564-849b-bc05cfff0f6a', decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann die Anzahl ungeordneter Stichproben ohne Zurücklegen mithilfe von Fakultäten bestimmen (ohne den Binomialkoeffizientenbegriff) und das Ergebnis an kleinen Beispielen prüfen.',
    proposedDescriptionEn: 'The learner can determine the number of unordered samples without replacement using factorials (without the binomial coefficient concept) and check the result with small examples.',
    understandingEvidence: evidence(
      'Bei einer Auswahl ohne Zurücklegen sinkt die Zahl der Möglichkeiten von Zug zu Zug; geordnete Ziehfolgen zählen dieselbe ungeordnete Auswahl mehrfach. Fakultäten beschreiben beide Faktoren und ermöglichen die Korrektur der Mehrfachzählung, ohne den Binomialkoeffizientenbegriff vorauszusetzen.',
      'When sampling without replacement, the number of options decreases on successive draws; ordered draw sequences count the same unordered selection more than once. Factorials express both factors and correct the overcount without requiring the binomial coefficient concept.',
      'Die lernende Person bestimmt für eine vorgelegte Auswahlaufgabe die Anzahl geordneter Folgen, erklärt die Zahl der Anordnungen je ungeordneter Auswahl und berechnet daraus deren Anzahl; bei einer kleinen Menge kontrolliert sie das Resultat durch Auflisten.',
      'For a supplied selection problem, the learner counts ordered sequences, explains how many arrangements represent one unordered selection, and derives the count of selections; for a small set, the learner checks it by listing.',
      'Eine neue Aufgabe ändert die Auswahlgröße statt nur die Zahl der verfügbaren Objekte. Die lernende Person passt den Fakultätenquotienten an und begründet erneut, warum jede ungeordnete Gruppe gleich oft in den geordneten Folgen erscheint.',
      'A new problem changes the selection size rather than merely the number of available objects. The learner adapts the factorial quotient and again explains why each unordered group appears equally often among ordered sequences.'),
    rationale: 'REVISE: „Stichproben berechnen“/“compute samples” bezeichnet das zu berechnende Objekt ungenau; gemeint ist deren Anzahl. Die vollständigen Ersatzfassungen beheben nur diese lokale Mehrdeutigkeit und erhalten Verfahren, Reihenfolgefreiheit und Verzicht auf den Binomialkoeffizientenbegriff. Der Nachfolger führt diesen Begriff erst ein. Keine Visualisierung auf der Seite; der Quellenverweis ist keine wortgetreue Quellenprüfung.'
  },
  {
    id: 'd81bc960-4eff-5c87-90b8-fec8e1cb8b3a', decision: 'keep',
    understandingEvidence: evidence(
      'Der Binomialkoeffizient zählt k-elementige Auswahlen aus n unterscheidbaren Objekten ohne Beachtung der Reihenfolge. Der Faktor k! entfernt die mehrfach gezählten Anordnungen derselben Auswahl; in kleinen Fällen kann das Ergebnis direkt überprüft werden.',
      'A binomial coefficient counts k-element selections from n distinct objects without regard to order. Dividing by k! removes the multiple arrangements of the same selection; small cases can be checked directly.',
      'Die lernende Person erklärt an einer kleinen Menge, warum AB und BA dieselbe Auswahl sind, berechnet einen einfachen Binomialkoeffizienten ohne Hilfsmittel und bestätigt ihn durch eine überschaubare Auflistung.',
      'Using a small set, the learner explains why AB and BA are the same selection, calculates a simple binomial coefficient without aids, and checks it by a manageable listing.',
      'In einer frischen Aufgabe werden statt zweier Objekte drei aus einer größeren Menge gewählt. Die lernende Person passt die Anzahl der Anordnungen je Auswahl an und berechnet und deutet den neuen Koeffizienten.',
      'In a fresh problem, three objects rather than two are chosen from a larger set. The learner adjusts the number of arrangements per selection and calculates and interprets the new coefficient.'),
    rationale: 'KEEP: Kombinatorische Bedeutung und Berechnung in einfachen Fällen sind eine zusammenhängende Kompetenz; der Vorgänger deckt die Fakultätenzählung ab. Das betrachtete Bild zeigt für 2 aus 5 korrekt 5·4=20 geordnete Folgen, 2! je Auswahl und 10 ungeordnete Auswahlen. „Ohne Hilfsmittel“ ist in DE und EN gleich enthalten.'
  },
  {
    id: '1b67aeb4-2a55-531f-94da-283b4e3df5f1', decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann in Anwendungsfällen ohne Zurücklegen die Anzahl ungeordneter Auswahlen (z. B. Lottotipps) mit Binomialkoeffizienten bestimmen und das Ergebnis im Kontext deuten.',
    proposedDescriptionEn: 'The learner can use binomial coefficients to determine the number of unordered selections without replacement in applications (e.g. lottery tickets) and interpret the count in context.',
    understandingEvidence: evidence(
      'Der Binomialkoeffizient zählt ungeordnete Auswahlen fester Größe ohne Zurücklegen. Ob die Reihenfolge im Kontext eine Rolle spielt, entscheidet über seine Anwendbarkeit; das Ergebnis ist eine Anzahl von Möglichkeiten, noch keine Wahrscheinlichkeit.',
      'A binomial coefficient counts unordered selections of fixed size without replacement. Whether order matters in context determines its applicability; the result is a count of possibilities, not yet a probability.',
      'Die lernende Person identifiziert in einer vorgelegten Anwendung Grundmenge und Auswahlgröße, begründet das Nichtbeachten der Reihenfolge, berechnet die Anzahl mit einem Binomialkoeffizienten und benennt ihre Bedeutung im Kontext.',
      'In a supplied application, the learner identifies the set and selection size, explains why order is ignored, calculates the number with a binomial coefficient, and states what the count means in context.',
      'Eine neue Aufgabe verwendet eine Teamauswahl statt Lottotipps und ergänzt eine feste Person im Team. Die lernende Person passt Grundmenge und noch freie Plätze an, statt unverändert denselben Koeffizienten einzusetzen.',
      'A new problem uses team selection rather than lottery tickets and requires one named person in the team. The learner adjusts the available set and remaining places rather than reusing the same coefficient.'),
    rationale: 'REVISE: „Anwendungsfälle ... berechnen“/“solve applications” lässt offen, ob eine Anzahl oder Wahrscheinlichkeit zu bestimmen ist. Titel und Vorgänger begrenzen dieses Ziel auf kombinatorische Auswahlen; die Ersatzfassungen benennen deren Anzahl und deuten sie. Sie führen keine Laplace- oder Binomialwahrscheinlichkeiten vorzeitig ein. Keine Visualisierung auf der Seite; vollständige Quellenabstimmung ist aus dem Verweis allein nicht ableitbar.'
  },
  {
    id: 'e495fa38-b198-5280-a405-9e41cafd6d17', decision: 'keep',
    understandingEvidence: evidence(
      'Ein Bernoulli-Versuch hat zwei als Treffer und Nichttreffer zusammengefasste Ausgänge. Eine Bernoulli-Kette besteht aus n gleichartigen, voneinander unabhängigen Versuchen mit derselben Trefferwahrscheinlichkeit p; n und p stammen aus der beschriebenen Situation.',
      'A Bernoulli trial has two outcomes grouped as success and failure. A Bernoulli chain consists of n comparable independent trials with the same success probability p; n and p come from the described situation.',
      'Die lernende Person prüft an einer vorgelegten Situation die Zweiteilung der Ausgänge, Unabhängigkeit und konstante Trefferwahrscheinlichkeit, entscheidet über die Eignung als Bernoulli-Kette und benennt n sowie p mit Kontextbedeutung.',
      'Given a situation, the learner checks the two-outcome classification, independence and constant success probability, decides whether it is a Bernoulli chain, and identifies n and p with their contextual meaning.',
      'In einer frischen Situation ändert sich p nach jedem Versuch. Die lernende Person erkennt, dass trotz zweier Ausgänge keine Bernoulli-Kette mit konstantem p vorliegt, und erklärt die geänderte Bedingung.',
      'In a fresh situation p changes after each trial. The learner recognizes that two outcomes alone do not yield a Bernoulli chain with constant p and explains the changed condition.'),
    rationale: 'KEEP: Erkennen der Kettenbedingungen und Benennen ihrer Parameter sind ein zusammenhängender Modellierungsschritt. Die Beschreibung ist präzise, in DE/EN gleichwertig und bleibt vor der Wahrscheinlichkeitsberechnung der Nachfolger. Kein Bild liegt für dieses Ziel vor. Der Quellenverweis ersetzt keinen geprüften Originalwortlaut.'
  },
  {
    id: '9b6f4d7d-a804-5666-b7ea-85bb3c73da4a', decision: 'keep',
    understandingEvidence: evidence(
      'Für genau k Treffer in n unabhängigen Versuchen mit konstanter Trefferwahrscheinlichkeit p hat jede konkrete Trefferfolge die Wahrscheinlichkeit p^k(1−p)^(n−k). Es gibt n über k solcher Folgen; ihre disjunkten Wahrscheinlichkeiten werden addiert.',
      'For exactly k successes in n independent trials with constant success probability p, each particular success sequence has probability p^k(1−p)^(n−k). There are n choose k such sequences, and their disjoint probabilities are added.',
      'Die lernende Person erläutert an einer selbstständig bearbeiteten kleinen Bernoulli-Kette die Faktoren p^k, (1−p)^(n−k) und den Kombinationsfaktor und begründet daraus die Punktwahrscheinlichkeit für genau k Treffer.',
      'For a small Bernoulli chain worked independently, the learner explains p^k, (1−p)^(n−k) and the combinatorial factor and derives the point probability of exactly k successes.',
      'Eine frische Aufgabe ändert die Definition von „Treffer“ zum bisherigen Gegenereignis. Die lernende Person passt p und k an und erklärt, warum die Formel dieselbe Ereigniswahrscheinlichkeit beschreibt.',
      'A fresh problem redefines “success” as the former complementary outcome. The learner adjusts p and k and explains why the formula describes the same event probability.'),
    rationale: 'KEEP: Die aktuelle Beschreibung verlangt ausdrücklich eine Begründung der Formelfaktoren an einem passenden Beispiel und nennt die kombinatorische wie probabilistische Seite. Das ist klar und bilingual deckungsgleich. Die Formel ist unter den vorausgesetzten Bernoulli-Bedingungen korrekt. Keine Visualisierung auf der Seite; der Quellenverweis allein belegt die genaue Lehrplanformulierung nicht.'
  },
  {
    id: '0408ac7f-0530-5de5-b248-cf581c9b5a17', decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann bei gleichartigen unabhängigen Ziehungen mit Zurücklegen und gleichwahrscheinlichen Einzelergebnissen die Wahrscheinlichkeit für genau k Treffer mithilfe eines Binomialkoeffizienten berechnen und im Beispiel erläutern.',
    proposedDescriptionEn: 'For comparable independent draws with replacement and equally likely elementary outcomes, the learner can use a binomial coefficient to calculate the probability of exactly k successes and explain it in the example.',
    understandingEvidence: evidence(
      'Zurücklegen erhält bei gleichartigen Ziehungen die Einzelwahrscheinlichkeit und macht die Ziehungen unabhängig. Für genau k Treffer führen gleichwahrscheinliche elementare Ziehfolgen zu einer Laplace-Zählung; der Binomialkoeffizient zählt die möglichen Positionen der k Treffer, die Treffer- und Nichttrefferwahrscheinlichkeiten gewichten jede Folge.',
      'Replacement preserves the per-draw probabilities and independence in comparable draws. For exactly k successes, equiprobable elementary draw sequences permit Laplace counting; the binomial coefficient counts placements of the k successes, while success and failure probabilities weight each sequence.',
      'Die lernende Person legt in einem Urnenbeispiel Treffer und Nichttreffer fest, begründet die gleichbleibende Wahrscheinlichkeit je Zug, zählt die Trefferpositionen und berechnet die Wahrscheinlichkeit für genau k Treffer mit einem überprüfbaren kleinen Fall.',
      'In an urn example, the learner defines success and failure, explains why the probability per draw stays constant, counts the placements of successes, and calculates the probability of exactly k successes with a checkable small case.',
      'Eine neue Aufgabe ändert die Urnenzusammensetzung, behält aber Zurücklegen und gleiche Ziehbedingungen bei. Die lernende Person passt p und den Gegenwahrscheinlichkeitsfaktor an und begründet, warum der Positionsfaktor unverändert bleibt.',
      'A new problem changes the urn composition but keeps replacement and equal drawing conditions. The learner adjusts p and the failure factor and explains why the placement factor is unchanged.'),
    rationale: 'REVISE: Die aktuelle Fassung spricht nur von „Wahrscheinlichkeiten mit dem Binomialkoeffizienten“ und lässt das Ereignis sowie die Laplace-Voraussetzung offen. Der Titel beansprucht Ziehen mit Zurücklegen im Laplace-/Binomialmodell. Die Ersatzfassungen konkretisieren genau k Treffer, unabhängige gleichartige Ziehungen und gleichwahrscheinliche Einzelergebnisse, ohne das benachbarte hypergeometrische Ziel hineinzuziehen. Kein Bild liegt vor; der Quellenverweis wurde nicht gegen Originaltext reconciliert.'
  },
  {
    id: 'aa00edfa-cf8d-500e-994f-7e33a5ebd045', decision: 'keep',
    understandingEvidence: evidence(
      'Bei einer binomialverteilten Zufallsgröße unterscheidet ein einzelner Wert P(X=k) sich von einer Intervallwahrscheinlichkeit und einer kumulierten Wahrscheinlichkeit. Letztere entstehen durch Summieren der passenden disjunkten Punktwahrscheinlichkeiten; die Ereignisgrenzen bestimmen die Summe.',
      'For a binomial random variable, a single point probability P(X=k) differs from an interval or cumulative probability. The latter sum the relevant disjoint point probabilities; the event boundaries determine which terms belong in the sum.',
      'Die lernende Person übersetzt eine vorgelegte sprachliche Ereignisfrage in P(X=k), P(a≤X≤b) oder P(X≤k), bestimmt den Wert mit Summenschreibweise oder einem digitalen Werkzeug und deutet ihn als Ereigniswahrscheinlichkeit im Kontext.',
      'The learner translates a supplied verbal event into P(X=k), P(a≤X≤b) or P(X≤k), determines the value using summation notation or a digital tool, and interprets it as an event probability in context.',
      'Eine frische Aufgabe wechselt von „höchstens“ zu „mindestens“ und gibt dieselbe Verteilung als Histogramm statt als Formel an. Die lernende Person wählt die richtigen Balken oder das Gegenereignis und erklärt die neue Grenze.',
      'A fresh task changes “at most” to “at least” and presents the same distribution as a histogram instead of a formula. The learner selects the correct bars or complement and explains the changed boundary.'),
    rationale: 'KEEP: Punkt-, Intervall- und kumulierte Ereignisse sind Varianten derselben Binomialwahrscheinlichkeitskompetenz. Das „oder“ zwischen Summenschreibweise und digitalem Werkzeug bewahrt Methodenwahl. Kontextdeutung ist eng mit dem Wert verbunden, die DE/EN-Fassungen stimmen überein. Keine Visualisierung auf dieser Seite; aus dem Quellenverweis wird keine vollständige Mapping-Prüfung abgeleitet.'
  },
  {
    id: '66f432e9-22d3-51a9-8787-35f91db30616', decision: 'split_review',
    understandingEvidence: evidence(
      'Ein Binomialmodell setzt feste Versuchszahl, zwei Ausgänge, Unabhängigkeit und konstantes p voraus. Ein Histogramm zeigt die Verteilung der Trefferanzahl; seine Gestalt hängt unter anderem von n und p ab. Die Eignung für einen Realfall wird anhand dieser Annahmen beurteilt.',
      'A binomial model assumes a fixed number of trials, two outcomes, independence and constant p. A histogram displays the distribution of the success count; its shape depends in part on n and p. Suitability for a real case is judged against those assumptions.',
      'Die lernende Person erklärt an einer eigenständig vorgelegten Situation die Wahl oder Ablehnung des Binomialmodells, liest aus einem zugehörigen Histogramm typische Merkmale und begründet die Modellgrenze mit einer konkreten verletzten Voraussetzung.',
      'Given an independently presented situation, the learner explains choosing or rejecting a binomial model, reads typical features from a related histogram, and justifies a model limit using a specific violated assumption.',
      'Eine neue Situation verwendet wiederholte Würfe statt unabhängiger Münzwürfe und führt ermüdungsbedingt wechselnde Trefferchancen ein. Die lernende Person trennt die im idealen Histogramm sichtbaren Eigenschaften von der Eignung für diesen veränderten Kontext.',
      'A new setting replaces independent coin tosses with repeated shots whose success chances change through fatigue. The learner separates properties visible in an ideal histogram from suitability for this changed real context.'),
    rationale: 'SPLIT_REVIEW: Der aktuelle Satz koppelt drei eigenständig prüfbare Leistungen: eine Situation binomial modellieren, Histogrammmerkmale erkennen und die Modellgültigkeit kritisch beurteilen. Eine Person kann Histogramme korrekt lesen, ohne einen Realfall geeignet zu modellieren, oder Modellannahmen prüfen, ohne die typische Histogrammgestalt zu erläutern. Eine bloße Kürzung würde diese Trennung verdecken. Das betrachtete Bild zeigt die B(4;0,5)-Balken 1/16, 4/16, 6/16, 4/16, 1/16 korrekt und illustriert die Modellkritik, ersetzt aber keine unabhängige Leistung.'
  },
  {
    id: '9de07e13-6a5f-5b49-a6d4-0decefb95784', decision: 'split_review',
    understandingEvidence: evidence(
      'Bei einer inversen Binomialfrage sind Ereignisform und vorgegebene Wahrscheinlichkeit bekannt, während entweder die Versuchszahl n, die Trefferwahrscheinlichkeit p oder eine ganzzahlige Ereignisgrenze k gesucht wird. Diese Größen haben unterschiedliche zulässige Bereiche und können unterschiedliche Such- oder Lösungswege erfordern.',
      'In an inverse binomial problem, the event and its probability are given while the unknown is either trial count n, success probability p or an integer event boundary k. These quantities have different admissible ranges and may require different search or solution methods.',
      'Die lernende Person bezeichnet in einer vorgelegten inversen Aufgabe die unbekannte Größe, stellt die passende Binomialwahrscheinlichkeit auf, findet einen zulässigen Wert und prüft ihn an Ereignis, Vorgabewert und Kontext.',
      'For a supplied inverse problem, the learner identifies the unknown, formulates the relevant binomial probability, finds an admissible value, and checks it against the event, given probability and context.',
      'Eine neue Aufgabe wechselt von gesuchtem p zu einer gesuchten ganzzahligen Grenze k bei bekanntem n und p. Die lernende Person erkennt die diskrete Grenze und überprüft benachbarte Werte statt eine kontinuierliche Parameterlösung ungeprüft zu übertragen.',
      'A new problem changes from finding p to finding an integer boundary k with n and p known. The learner recognizes the discrete boundary and checks neighboring values rather than carrying over a continuous parameter solution uncritically.'),
    rationale: 'SPLIT_REVIEW: Der Text verlangt alternativ inverse Bestimmung von n, p oder k. Die zulässigen Werte und mathematischen Lösungsschritte sind verschieden: n und k sind ganzzahlig, p liegt zwischen 0 und 1, und Grenzaufgaben können diskrete Schwellen statt exakter Gleichungen sein. Beherrschung einer Variante beweist die anderen nicht. Zusätzlich kann eine vorgegebene Wahrscheinlichkeit ohne spezifizierte Ereignisart keine eindeutige Inversion tragen; der jeweilige Teilzieltext braucht dieses Ereignis. Eine einheitliche Wortkorrektur reicht deshalb nicht. Kein Bild ist gebunden.'
  },
  {
    id: '4d906967-9f4b-5dc8-af7a-d403b95d61f5', decision: 'keep',
    understandingEvidence: evidence(
      'Bei bekanntem p beschreibt ein Prognoseintervall für relative Häufigkeiten einen Bereich, in dem die relative Trefferhäufigkeit einer künftigen Stichprobe mit dem vorgegebenen Abdeckungsgrad liegen soll. Es ist keine Aussage, dass p selbst zufällig in diesem Bereich liegt.',
      'With p known, a prediction interval for relative frequencies describes a range intended to contain the relative success frequency of a future sample at the specified coverage level. It does not say that p itself is random within this range.',
      'Die lernende Person erläutert an einem vorgelegten Intervall die Rolle des bekannten p, des künftigen Stichprobenanteils und des Abdeckungsgrads und korrigiert eine Aussage, die das Intervall fälschlich als Schätzbereich für p bezeichnet.',
      'Given an interval, the learner explains the roles of known p, future sample proportion and coverage level, and corrects a claim that wrongly treats the interval as an estimate for p.',
      'Eine frische Aufgabe ändert die Stichprobengröße. Die lernende Person deutet das neue Prognoseintervall weiterhin als Bereich für eine künftige relative Häufigkeit und erklärt, warum sich seine Breite ändern kann.',
      'A fresh problem changes the sample size. The learner still interprets the new prediction interval as a range for a future relative frequency and explains why its width may change.'),
    rationale: 'KEEP: Der aktuelle Text benennt gerade die entscheidende Richtung bekanntes p → künftige relative Häufigkeit und verlangt Fehlinterpretationen zu berichtigen. Der benachbarte Konfidenzintervallfall ist getrennt. DE und EN sind inhaltlich gleich. Eine detaillierte Abdeckungsinterpretation gehört in das V2-Profil. Keine Visualisierung ist gebunden.'
  },
  {
    id: '5c9ac68c-3928-518c-bbe0-e044667035a6', decision: 'keep',
    understandingEvidence: evidence(
      'Ein Konfidenzintervall wird aus Stichprobendaten berechnet und schätzt eine unbekannte feste Trefferwahrscheinlichkeit p. Das Konfidenzniveau beschreibt die langfristige Abdeckung des Intervallverfahrens über wiederholte Stichproben, nicht eine nachträgliche Zufallswahrscheinlichkeit für p in einem schon berechneten Intervall.',
      'A confidence interval is calculated from sample data and estimates a fixed but unknown success probability p. The confidence level describes long-run coverage of the interval procedure over repeated samples, not a posterior probability for p in one already computed interval.',
      'Die lernende Person deutet die Endpunkte eines vorgelegten Intervalls als Schätzbereich für p und verbessert eine Aussage, die einem bereits berechneten Intervall eine direkte Wahrscheinlichkeit für p zuschreibt.',
      'The learner interprets the endpoints of a supplied interval as a range of plausible estimates for p and corrects a claim that assigns a direct probability to p within an already computed interval.',
      'Eine frische Aufgabe vertauscht die Rollen und gibt p als bekannt sowie eine künftige Stichprobe als unbekannt an. Die lernende Person erkennt, dass nun ein Prognoseintervall und keine Konfidenzintervall-Deutung gefragt ist.',
      'A fresh task reverses the roles by giving p as known and a future sample as unknown. The learner recognizes that a prediction interval rather than a confidence-interval interpretation is required.'),
    rationale: 'KEEP: Der aktuelle Text nennt die Herkunft aus einer Stichprobe und die unbekannte Trefferwahrscheinlichkeit und fordert Korrektur typischer Fehler. Die frequentistische Präzisierung in der Evidenz schützt vor der naheliegenden Fehlinterpretation, ohne den kurzen DE/EN-Zieltext zu überladen. Prognoseintervalle sind im Nachbarziel getrennt. Keine Visualisierung ist gebunden.'
  },
  {
    id: 'ae483d98-54e0-5985-96d2-fc1351d22e4f', decision: 'keep',
    understandingEvidence: evidence(
      'Ein veränderter Stichprobenumfang n verändert die Binomialverteilung der Testgröße. Bei sonst festgehaltenen Hypothesen und Fehlergrenzen können sich dadurch Verwerfungsbereich, Fehlerwahrscheinlichkeiten und eine Entscheidung für vorliegende Daten ändern; diese Aussagen sind getrennt am jeweiligen Test zu prüfen.',
      'Changing sample size n changes the binomial distribution of the test statistic. With hypotheses and error constraints held fixed, this may change the rejection region, error probabilities and a decision for observed data; each effect must be checked for the particular test.',
      'Die lernende Person bearbeitet eine vorgelegte einfache Variation mit neuem n, passt die Entscheidungsschwelle oder Wahrscheinlichkeitsrechnung an und erläutert konkret, welche der im Ziel genannten Testgrößen sich gegenüber dem Ausgangsfall verändert.',
      'The learner works through a supplied simple variation with a new n, adjusts the decision threshold or probability calculation, and explains concretely which of the stated test features changes relative to the original case.',
      'In einer frischen Aufgabe steigt n, während die beobachtete Trefferquote gleich bleibt. Die lernende Person vergleicht die neuen Binomialwahrscheinlichkeiten und begründet die Testentscheidung, ohne pauschal zu behaupten, dass größeres n immer dieselbe Wirkung hat.',
      'In a fresh problem n increases while the observed success proportion stays the same. The learner compares the new binomial probabilities and justifies the decision without claiming that larger n always has the same effect.'),
    rationale: 'KEEP: Einfache Variationen einer Testaufgabe bei geändertem n sind der gemeinsame Gegenstand; Entscheidungsregel, Fehlerwahrscheinlichkeiten oder konkrete Entscheidung sind mögliche Folgen, keine gleichzeitig verpflichtenden unabhängigen Zielthemen. Die Formulierung ist in DE und EN deckungsgleich und bleibt bei einer nachvollziehbaren Variation, nicht bei vollständiger Testplanung. Keine Visualisierung auf der Seite; der Quellenverweis wurde nicht als geprüfter Originalauszug ausgegeben.'
  },
]

const batches = [
  ['m7-q4-process-next12-current-20260923-v1', q4],
  ['m7-q3-stochastics-next12-current-20260923-v1', q3],
]

for (const [directory, judgments] of batches) {
  const round = resolve(parent, directory, 'round-b')
  const campaign = JSON.parse(readFileSync(join(round, 'description-review-campaign.json'), 'utf8'))
  const input = JSON.parse(readFileSync(join(round, 'description-review-input.json'), 'utf8'))
  const batch = campaign.batches[0]
  const batchBytes = readFileSync(join(round, 'batches', `${batch.batchId}.input.jsonl`))
  const nativeRows = batchBytes.toString('utf8').trim().split('\n').map(JSON.parse)
  assert.equal(campaign.batches.length, 1)
  assert.equal(digest(batchBytes), batch.batchInputFingerprint)
  assert.equal(digest(readFileSync(join(round, 'prompt.md'))), campaign.promptFingerprint)
  assert.equal(digest(readFileSync(join(round, 'criteria.md'))), campaign.criteriaFingerprint)
  assert.equal(digest(readFileSync(join(round, 'contracts/goal-description-review-record.schema.json'))), campaign.recordSchemaDigest)
  assert.deepEqual(judgments.map(({ id }) => id), batch.goalIds)
  nativeRows.forEach((row, index) => assert.deepEqual(row.goal, input.goals[index]))

  const runId = `${campaign.roundId}.codex-independent-b`
  const records = judgments.map(({ id, decision, understandingEvidence, rationale, proposedDescriptionDe, proposedDescriptionEn }, index) => {
    const source = nativeRows[index].goal
    assert.equal(id, source.goalId)
    const record = {
      $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
      schemaVersion: 1,
      recordId: `${campaign.roundId}.${id}`,
      runId,
      campaignId: campaign.campaignId,
      roundId: campaign.roundId,
      bundleFingerprint: campaign.bundleFingerprint,
      bookDigest: campaign.bookDigest,
      goalId: id,
      goalFingerprint: source.goalFingerprint,
      pageFingerprint: source.pageFingerprint,
      currentTitleDe: source.currentTitleDe,
      currentTitleEn: source.currentTitleEn,
      currentDescriptionDe: source.currentDescriptionDe,
      currentDescriptionEn: source.currentDescriptionEn,
      decision,
      ...(decision === 'revise' ? { proposedDescriptionDe, proposedDescriptionEn } : {}),
      understandingEvidence,
      rationale,
      evidenceProfileContract: 'positive-understanding-evidence-v2',
      evidenceProfileRecommendation: 'create',
      recordStatus: 'candidate',
      reviewAuthority: 'ai_candidate',
    }
    assert.ok(decision !== 'revise' || (proposedDescriptionDe && proposedDescriptionEn))
    return record
  })
  const recordsText = records.map((record) => JSON.stringify(record)).join('\n') + '\n'
  const metadata = { provider: 'OpenAI', client: 'Codex', model: 'exact serving model not exposed', parameters: 'not exposed' }
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
    model: 'Codex (exact serving model not exposed)',
    role: 'subject_reviewer',
    promptFamilyId: 'goal-description-understanding-evidence-review-v2',
    promptFingerprint: campaign.promptFingerprint,
    criteriaFingerprint: campaign.criteriaFingerprint,
    generationParametersFingerprint: digest(JSON.stringify(metadata)),
    independenceGroupId: campaign.independenceGroupId,
    blindToOtherRuns: true,
    goalIds: batch.goalIds,
    inputArtifacts: [
      { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
      { role: 'review_prompt', digest: campaign.promptFingerprint },
      { role: 'review_criteria', digest: campaign.criteriaFingerprint },
    ],
    startedAt: '2026-09-23T07:32:22Z',
    completedAt: new Date().toISOString(),
    status: 'completed',
    outputDigest: digest(recordsText),
    toolchainVersion: 'skillpilot-native-review-contracts-v1-node20',
  }
  const results = join(round, 'results')
  mkdirSync(results, { recursive: true })
  writeFileSync(join(results, `${batch.batchId}.records.jsonl`), recordsText)
  writeFileSync(join(results, `${batch.batchId}.run.json`), JSON.stringify(run, null, 2) + '\n')
  console.log(`${campaign.roundId}: ${records.length} candidate records`)
}
