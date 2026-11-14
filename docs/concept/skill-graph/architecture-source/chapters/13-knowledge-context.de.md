## Wissenskontext: Was bei Lernenden vorausgesetzt werden darf {#sec:sga-knowledge-context}

Jeder Inhalt, der zu einem Lernziel gehört, ob Erklärung, Beispiel, Aufgabe, Lernkarte, Lernzielbild oder ein Satz des Coachs, richtet sich an Lernende, die manches wissen und anderes noch nicht. Dieses Kapitel bestimmt dieses Wissen als Projektion des Skill-Graphen und nennt, was der Graph dafür leisten muss.

**Stand, 13. November 2026.** Konzept und Anforderung des Product Owners. Die Ableitung gibt es als Werkzeug im Repository (`npm --prefix app run knowledge-context`, [knowledgeContext.ts](repo:app/scripts/lib/knowledgeContext.ts)). Sonst ist nichts umgesetzt: Kein Gate, keine Erzeugungspipeline und kein Coach benutzt den Kontext. Die Zahlen stammen aus diesem Werkzeug an diesem Tag. Diese Seite ändert keine Lernziele, Graphkanten, Prüfungen oder das Verhalten des Coachs.

### Die Anforderung {#sec:sga-kc-requirement anchors="the-requirement"}

Der Wissenskontext der Lernenden muss eingehalten werden. Der Product Owner verlangt dreierlei:

- Der Wissenskontext eines Lernziels wird **deterministisch aus den im Graphen gespeicherten Daten** abgeleitet. Niemand schreibt ihn von Hand.
- Er ist so **kompakt**, dass er jeden einzelnen Schritt begleiten kann.
- Er steht **jedem KI-Schritt, der Inhalte der Skill-Landschaft erzeugt oder prüft**, als ständiger Abgleich zur Verfügung und dem **Coach** zusammen mit dem jeweiligen Ziel.

Anlass waren Inhalte, die Stoff benutzen, der Lernenden an dieser Stelle noch nicht begegnet ist: Eine Einheit zum Ableiten ganzrationaler Funktionen darf in einer Anwendung oder einem Lernzielbild weder $\sin x$ noch $e^x$ zeigen, solange trigonometrische Funktionen und Exponentialfunktionen später kommen. Den umgekehrten Fehler gibt es ebenfalls: eine Aufgabe, die quadratische Gleichungen braucht, obwohl kein Voraussetzungspfad sie bereitstellt.

### Definition {#sec:sga-kc-definition anchors="definition"}

Sei $g$ ein atomares Lernziel. Seine **gesicherten Ziele** $W(g)$ sind die atomaren Ziele, die $g$ nach der normalisierten Relation der [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md) direkt oder transitiv benötigt: vererben, auf atomare Ziele expandieren, transitiv abschließen. Der **Wissenskontext** von $g$ ist die folgende Projektion:

| Teil | Ableitung | Bedeutung |
| --- | --- | --- |
| Ziel | Titel und Beschreibung von $g$ | was hier erarbeitet wird |
| Baut auf | die Ziele aus $W(g)$, die kein anderes Ziel aus $W(g)$ benötigt | die Eingangskompetenzen |
| Gesichert | alle Ziele aus $W(g)$, nach Bereich gruppiert | darf benutzt werden |
| Darauf baut auf | die Ziele, die $g$ direkt benötigen | darf nicht vorweggenommen werden |
| Noch nicht | die ersten Ziele desselben Bereichs außerhalb von $W(g)$: jene, die kein anderes solches Ziel benötigen | der naheliegende Nachbarstoff |
{cols="14%,44%,42%"}

Eine Regel gilt für Generator, Reviewer und Coach gleichermaßen: **Was ein Ziel des Katalogs erarbeitet, darf nur benutzt werden, wenn dieses Ziel für $g$ gesichert ist.** Was $g$ selbst erarbeitet, ist Gegenstand der Arbeit. Was kein Ziel des Katalogs erarbeitet, gilt als Grundwissen, etwa Alltags- und Grundschulwissen, und wird im Review beurteilt.

Aufgeführt werden nur gewöhnliche Ziele. Prüfungs-, Lernkarten- und Orientierungsziele auf einem Voraussetzungspfad tragen den Pfad, erarbeiten aber keinen eigenen Stoff. Ein Bereich ist ein Cluster direkt unter der Fachwurzel der Landschaft oder eine eigene Wurzel.

Die Projektion hat zwei Ausgaben mit fester Reihenfolge der Einträge. Der **Kern** besteht aus Ziel, „baut auf", „darauf baut auf" und „noch nicht"; er begleitet den Coach. Die **Vollform** ergänzt die gesicherten Ziele; sie begleitet Erzeugung und Review.

Dieselbe Definition deckt die übrigen Knotenarten. Ein Prüfungs- oder Lernkartenziel $q$ erarbeitet nichts; sein Inhalt darf $W(q)$ benutzen. Der Wissenskontext einer Lerneinheit ist die Vereinigung der Kontexte ihrer eigenen Ziele und Prüfungen; für eine Einheit wird nichts von Hand geschrieben. Weil die Voraussetzungsrelation kanonisch ist, ist der Wissenskontext in jedem Lehrplankontext derselbe.

Für den Wissenskontext wird nichts Neues gespeichert. Er ist eine Projektion aus `contains`, `requires`, Titeln und Beschreibungen, so wie die Frontier eine Projektion aus Voraussetzungen und Beherrschung ist.

### Was die Ableitung zeigt {#sec:sga-kc-prototype anchors="what-the-derivation-shows"}

Das Werkzeug leitet den Wissenskontext jedes gewöhnlichen atomaren Ziels des kanonischen Katalogs ab. Für Mathematik und Physik:

| Größe | Mathematik, Median | Mathematik, 90. Perzentil | Physik, Median | Physik, 90. Perzentil |
| --- | --- | --- | --- | --- |
| Ziele | 807 | | 478 | |
| Baut auf | 1 | 2 | 1 | 3 |
| Gesichert | 30 | 51 | 54 | 113 |
| Darauf baut auf | 1 | 4 | 1 | 4 |
| Noch nicht | 16 | 25 | 11 | 29 |
| Kern, Zeichen der Titel | 985 | 1.425 | 700 | 1.529 |
{cols="28%,18%,18%,18%,18%"}

Der Kern ist kompakt: etwa 250 bis 450 Tokens an Titeln. Die gesicherten Ziele füllen selten einen ganzen Cluster und lassen sich deshalb nicht auf Clusternamen verkürzen; die Vollform zählt sie auf.

Der zweite Befund wiegt schwerer. **Der abgeleitete Kontext ist genau so gut wie die Kanten.** Für das Mathematikziel „Ganzrationale Funktionen ableiten" sichert der Graph 34 Ziele, und keines davon betrifft lineare, quadratische, Potenz- oder ganzrationale Funktionen; „Ganzrationale Funktionen über Term und Graph beschreiben" und „Potenzen mit natürlichen Exponenten deuten und berechnen" stehen unter „noch nicht". Das Ziel „Ganzrationale Funktionen mit Differentialrechnung analysieren" hat das Ziel zum Ableiten ganzrationaler Funktionen nicht auf seinem Voraussetzungspfad. Die vorhandenen Gates stellen fest, dass `requires` azyklisch, atomar und transitiv minimal ist. Keines stellt fest, dass die Voraussetzungen eines Ziels ausreichen.

In anderen Fächern modelliert der Graph wenige oder keine Voraussetzungen, und der Kontext ist dort leer: Kein gewöhnliches Ziel in Englisch (89 Ziele), Geschichte (156) oder Latein (115) hat eine Voraussetzung, ebenso wenig 178 der 268 Ziele in Deutsch und 339 der 413 Ziele in Politik und Wirtschaft.

### Hinlänglichkeit: Die Eigenschaft, die der Graph gewinnen muss {#sec:sga-kc-sufficiency anchors="sufficiency-the-property-the-graph-must-gain"}

Der Wissenskontext kann Inhalte nur dort binden, wo der Graph **hinlänglich** ist:

- **Ein Ziel ist hinlänglich**, wenn jemand, der $W(g)$ und Grundwissen besitzt, $g$ so lernen kann, wie es beschrieben ist.
- **Ein Artefakt ist kontexttreu**, wenn es nur $W(g)$ benutzt und das, was $g$ erarbeitet.

Ein Review mit dem Wissenskontext als Eingabe liefert drei Arten von Befunden:

| Befund | Behandlung |
| --- | --- |
| Eine benötigte Kompetenz ist ein vorhandenes Ziel außerhalb von $W(g)$. | Kandidat für eine `requires`-Kante. Sie ist eine didaktische Modellierungsentscheidung mit ehrlicher Herkunft und durchläuft die Fachprüfung; die transitive Minimalität gilt weiter. |
| Die Beschreibung des Ziels greift in späteren Stoff. | Befund zur Grenze oder zur Einordnung des Ziels. Der Text wird nie stillschweigend verengt. |
| Eine benötigte Kompetenz ist kein Ziel des Katalogs und kein Grundwissen. | Befund zu einer Lücke. Kein Ziel wird erfunden. |
{cols="42%,58%"}

Die Ableitung ist deterministisch. Ob ein Text im Kontext bleibt, ist ein Review durch ein Modell oder einen Menschen. Der Kontext macht aus diesem Review eine Frage mit prüfbarer Antwort: Welche Ziele des Katalogs setzt dieser Text voraus, und sind sie alle gesichert?

Urteile sind **monoton**. Eine ergänzte Kante vergrößert $W(g)$ nur, sodass ein hinlängliches Ziel und ein kontexttreues Artefakt es bleiben. Nur wenn $W(g)$ ein Ziel verliert, muss der Inhalt von $g$ erneut geprüft werden, und ein Vergleich zweier Graphstände findet diese Ziele deterministisch.

### Wer den Kontext erhält {#sec:sga-kc-consumers anchors="who-receives-the-context"}

| Empfänger | Verwendung |
| --- | --- |
| Erzeugung und Review von Zieltexten und Kanten | Die Frage nach der Hinlänglichkeit für jedes Ziel; das Review schlägt Kandidatenkanten vor und ergänzt sie nie selbst. |
| Lernzielbilder | Der Bild-Prompt trägt den Kontext; heute trägt er nur Titel und Beschreibung des Ziels. Das Bildreview hält die Kontexttreue fest. |
| Lernkarten, Übungsaufgaben und Prüfungen | Der Kontext des Prüfungs- oder Lernkartenziels begrenzt Aufgabe, Lösung und Raster. |
| Lerneinheiten | Der Kontext der Einheit ersetzt jede von Hand geschriebene Angabe ihres Stoffs; das Abdeckungsreview einer eigenen Prüfung erhält ihn. |
| Lernzielbuch | Der Kontext des Ziels begrenzt dessen Seite. |
| Coach | Der Kernkontext des aktiven Ziels. Das Backend verbindet ihn mit dem Stand der lernenden Person: Ein gesichertes Ziel, das noch nicht beherrscht ist, wird nicht vorausgesetzt, und ein Ziel aus „noch nicht", das die Person beherrscht, darf benutzt werden. |
{cols="30%,70%"}

Der Coach erhält Titel von Zielen und Beherrschungsstände, die sein Kontext an anderer Stelle bereits trägt. Kein Chattext fließt an das Backend zurück, und die Auswahl bleibt beim Backend.

### Reihenfolge der Einführung {#sec:sga-kc-order anchors="order-of-introduction"}

1. **Ableiten.** Ein deterministisches Werkzeug im Repository und ein Bericht je Fach. Kein Gate ändert sich. Diesen Schritt gibt es.
2. **Hinlänglichkeit prüfen**, blockweise, beginnend mit einem Pilotblock je Fach. Der Anteil der Ziele mit Befund zeigt, was es kostet, ein Fach hinlänglich zu machen. Im Pilot vom 13. November 2026 (Ableitungseinstieg der Mathematik, Kinematik der Einführungsphase der Physik) fanden beide unabhängigen Reviewer die Voraussetzungen bei 20 von 39 Zielen nicht ausreichend; die Einstiegskette der Analysis sichert keine Algebra der Klassen 7 bis 9 ([Pilotprotokoll](repo:docs/dev/knowledge-context-sufficiency-pilot-2026-11-13.md)).
3. **Kontexttreue prüfen** bei Bildern, Karten und Aufgaben, zusammen mit dem Entwurf der Lerneinheiten eines Blocks.
4. **Den Coach bedienen**, je Fach, sobald das Fach hinlänglich ist. Ein Kontext aus einem nicht hinlänglichen Graphen würde verbieten, was Lernende tatsächlich wissen.

Zwei Entscheidungen sind offen: ob die Hinlänglichkeit ein Meilenstein-Gate wird und an welchem Meilenstein; und ob Titel und Beschreibungen als gespeicherte Daten genügen oder ob Ziele die Begriffe nennen sollen, die sie einführen, damit sich Texte maschinell vorprüfen lassen. Beide werden mit den Zahlen der Pilotblöcke entschieden.
