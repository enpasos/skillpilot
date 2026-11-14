# Lerneinheiten: Cluster, Verdrahtung und Plan – Konzeptentwurf vom 14. November 2026

**Stand: 14. November 2026. Entwurf, nicht entschieden.** Dieses Dokument hält
die Richtung fest, die der Product Owner am 14. November 2026 für die Struktur
der Lerneinheiten vorgegeben hat, und arbeitet sie zu einem prüfbaren Modell
aus. Abschnitt 2 gibt die Vorgaben wieder. Die Abschnitte 3 bis 5 sind die
Ausarbeitung; sie ist ein Vorschlag. Abschnitt 7 nennt, was zu entscheiden ist.
Nichts davon ist umgesetzt. Bis zu einer Entscheidung gelten die
[Graph-Definition §11 bis §13](learning-units.de.md) und der Einheitenvertrag
vom 12. November unverändert.

## 1. Worum es geht

Die Lernkarte zeigte Pfeile im Kreis: zwischen Sekundarstufe I und
Sekundarstufe II und zwischen Mathematik und Physik. Der Graph der einzelnen
Lernziele ist kreisfrei; das prüft die CI. Ein Kreis entsteht erst, wenn Ziele
zu Blöcken zusammengefasst werden und es Voraussetzungen in beide Richtungen
gibt. Die Graph-Definition kennt diesen Fall
([§11.5](learning-unit-progression.de.md)): Ein kreisfreier Graph garantiert
noch keine Reihenfolge ganzer Einheiten.

Das ist kein Darstellungsproblem. In 14 Ländern braucht ein Ziel der
Sekundarstufe I zur Diode das „Bändermodell und Dotierung“ aus der vierten
Qualifikationsphase. Wer nur die Sekundarstufe I lernt, bekommt dieses Ziel
heute über den Voraussetzungsabschluss in den Lernumfang. Abschnitt 8 zeigt,
wie verbreitet das ist.

Gesucht ist deshalb ein Mechanismus, der auf der Ebene der Einheiten trägt:
Er soll solche Widersprüche zwischen dem Plan der Schule und dem Bedarf der
Ziele ausschließen, ohne eine Sonderregel für Stufen oder Schuljahre.

## 2. Vorgaben des Product Owners vom 14. November 2026

1. **Keine Sonderregel.** Sekundarstufe I und II sollen Einheiten sein wie
   andere Einheiten auch. Der Mechanismus muss auf Einheitenebene tragen.
2. **Die Schule plant von oben.** Erst kommt die Sekundarstufe I, dann die
   Sekundarstufe II; auch die Schuljahre haben eine feste Reihenfolge. Liegen
   darunter Ziele, die sich in der anderen Richtung bedingen, ist das ein
   echtes Problem für Lernende.
3. **Einheiten sind besondere Cluster.** Die `contains`-Hierarchie bleibt das
   Gerüst. Ein Cluster ist nicht notwendig eine Einheit, kann aber eine sein;
   dafür kommt eine neue Eigenschaft hinzu.
4. **Fächer sind keine Einheiten.** Mathematik und Physik sind Gruppierungen.
   Sekundarstufe I und II sind Einheiten, und zwar über die Fächer hinweg, für
   eine bestimmte Fächerauswahl.
5. **Keine Zeitachse.** Die Planung von oben wird nicht als Zeitstrahl
   eingeführt, sondern als feste Voraussetzungen zwischen Einheiten. Sie
   ergeben sich nicht von unten aus den Zielen; sie sind vorgegeben.
6. **Einheiten werden ausdrücklich verdrahtet.** Ihre Voraussetzungen werden
   erklärt, und sie müssen widerspruchsfrei zu den Voraussetzungen der Ziele
   passen. Ausdrücklich heißt auch: Es darf keine weiteren Abhängigkeiten
   zwischen Einheiten geben, die nur indirekt entstehen.
7. **Fächer müssen kombinierbar sein.** Physik setzt Mathematik voraus.
   Physik-Leistungskurs und Mathematik-Grundkurs sollen fair kombinierbar
   sein; in der Schulpraxis gab es an dieser Stelle Probleme.
8. **Jeder Rückgriff wird am konkreten Fall beurteilt.** Es ist zulässig,
   etwas zuerst phänomenologisch zu behandeln und erst später auf ein solides
   Fundament zu stellen.

Die Punkte 3, 5 und 6 hat der Product Owner als Wunsch oder Überlegung
geäußert, nicht als Beschluss.

## 3. Das Modell

### 3.1 Einheiten sind ausgezeichnete Cluster

Eine **Einheit** ist ein Cluster der `contains`-Hierarchie, der als Einheit
ausgezeichnet ist. Ihr **Umfang** sind alle atomaren Ziele unter diesem
Cluster. Liegt der Cluster einer Einheit unter dem einer anderen, ist sie deren
**Untereinheit**. Die **kleinste Einheit** eines Ziels ist die innerste
Einheit, in der es liegt; die Ziele, deren kleinste Einheit eine Einheit ist,
sind ihre **eigenen Ziele**.

Lernversprechen, eigene Prüfungen, geprüfte Abdeckung und die Regeln R1 bis R5
bleiben Eigenschaften der Einheit. Neu ist, woher eine Einheit ihre Ziele und
ihre Untereinheiten hat: aus `contains`, nicht aus einer eigenen Aufzählung.

### 3.2 Zwei Arten von Voraussetzungen

| | Zwischen atomaren Zielen | Zwischen Einheiten |
| --- | --- | --- |
| Name | Voraussetzung (`requires`) | Einheitsvoraussetzung |
| Herkunft | fachlich, von unten | erklärt, von oben |
| Bedeutung | Das Ziel ist erst erreichbar, wenn das andere gelernt ist. | Im Plan ist die vorausgesetzte Einheit abgeschlossen, bevor die andere beginnt. |
| Wirkung | Frontier, Lernumfang, Wissenskontext | Prüfung des Plans, Ordnung der Darstellung |

Ein Ziel **braucht** ein anderes, wenn es dieses direkt oder über
Zwischenschritte voraussetzt.

Die Einheitsvoraussetzung ist eine eigene Beziehung. Sie wird nicht auf die
Ziele der Einheit vererbt. Sonst setzte jedes Ziel der Sekundarstufe II jedes
Ziel der Sekundarstufe I voraus: Der Voraussetzungsabschluss zöge die gesamte
Sekundarstufe I in jeden Lernumfang, und die transitive Minimalität wäre
verletzt. Genau diese Form, Voraussetzungen an Clustern, hat die atomare
Normalisierung gerade beseitigt. Die Graph-Definition nennt die
Einheitsvoraussetzung bereits in §11.5, bisher ohne Darstellung und ohne
Regeln.

Aus den erklärten Einheitsvoraussetzungen folgt, wann eine Einheit **nach**
einer anderen liegt:

- Setzt u die Einheit v voraus, liegt u nach v.
- Liegt u nach v, liegt jede Untereinheit von u nach jeder Untereinheit von v.
- Liegt u nach w und w nach v, liegt u nach v.

### 3.3 Die Regeln

| Regel | Inhalt |
| --- | --- |
| **E1 Baum** | Zwei Einheiten sind ineinander geschachtelt oder haben kein gemeinsames Ziel. Jedes atomare Ziel hat damit höchstens eine kleinste Einheit; ist ein Fach vollständig in Einheiten gefasst, genau eine. |
| **E2 Widerspruchsfrei** | Keine Einheit liegt nach sich selbst. Eine Einheitsvoraussetzung verbindet nie zwei Einheiten, von denen eine in der anderen liegt. |
| **E3 Vollständig** | Braucht ein Ziel a ein Ziel b, und liegt von ihren kleinsten Einheiten keine in der anderen, dann liegt die kleinste Einheit von a nach der von b. |
| **E4 Sparsam** | Keine Einheitsvoraussetzung folgt schon aus den übrigen. |

E1 ist die bisherige Regel R4 in der Sprache der Cluster. E2 und E3 sind die
beiden Hälften der sechsten Vorgabe: E2 verlangt, dass die Erklärungen zu den
Zielen passen, E3, dass nichts Unerklärtes zwischen Einheiten entsteht. E4
entspricht der transitiven Minimalität und hält die Verdrahtung lesbar.

Eine Einheitsvoraussetzung darf mehr verlangen, als die Ziele brauchen. Das
ist die Planung von oben: „Jahrgang 6 setzt Jahrgang 5 voraus“ gilt, auch wenn
kein Ziel es erzwingt. Sie darf nie weniger verlangen und nie etwas
Widersprüchliches.

### 3.4 Was aus den Regeln folgt

- **Kein Rückgriff.** Liegt u nach v, braucht kein Ziel aus v ein Ziel aus u.
  Sonst läge nach E3 auch v nach u und damit u nach sich selbst.
- **Jede Ebene lässt sich ordnen.** Alle Abhängigkeiten zwischen Einheiten
  sind erklärt und kreisfrei. Auf jeder Ebene gibt es deshalb eine
  Reihenfolge, in der jede Einheit nach allem kommt, was sie braucht. Die
  Lernkarte kann keine Kreise mehr zeigen.
- **Die Einheit hat eine Schnittstelle.** Was die Ziele einer Einheit von
  außen brauchen, liegt in Einheiten, nach denen sie liegt. Der
  [Wissenskontext](knowledge-context.de.md) jedes ihrer Ziele ist damit durch
  die erklärten Voraussetzungen der Einheit begrenzt und lässt sich in wenigen
  Namen angeben.
- **Änderungen fallen auf.** Eine neue Voraussetzung zwischen Zielen
  verschiedener Einheiten verletzt E3, solange keine Einheitsvoraussetzung sie
  deckt. Wer sie einträgt, muss entscheiden, ob die eine Einheit wirklich auf
  der anderen aufbauen soll.

### 3.5 Ein Beispiel

Angenommen, eine Einheit D fasst die Ziele zur Diode und eine Einheit B das
Bändermodell. Ein Ziel aus D braucht heute „Bändermodell und Dotierung“. Nach
E3 muss D nach B liegen. In 14 Ländern stehen die Ziele von D in der
Sekundarstufe I und die von B in der Sekundarstufe II, und die
Sekundarstufe II setzt die Sekundarstufe I voraus. Damit liegt B nach D.
Beides zusammen ergibt: D liegt nach sich selbst. E2 ist verletzt, und der
Widerspruch steht zwischen zwei benannten Einheiten.

Der Verstoß sagt nicht, was falsch ist. Die Sperrschicht einer Diode lässt
sich mit der Dotierung erklären, ohne das Bändermodell zu kennen; das spätere
Ziel fasst beides zusammen. Vermutlich ist also die Voraussetzung zu stark,
oder das Ziel ist zu teilen. Das entscheidet die Fachprüfung (Abschnitt 5).

## 4. Fachliche Einheiten und Planeinheiten

### 4.1 Warum es zwei Arten gibt

Dasselbe Ziel steht in Bayern in Jahrgang 8 und in Hessen in der
Einführungsphase. Was zu einer Stufe oder einem Jahrgang gehört, bestimmt der
Lehrplan des Landes. Was fachlich zusammengehört, ist überall gleich. Daraus
ergeben sich zwei Arten von Einheiten mit denselben Regeln:

| | Fachliche Einheit | Planeinheit |
| --- | --- | --- |
| Beispiele | „Natürliche Zahlen verstehen und darstellen“ | Sekundarstufe I, Jahrgang 8, Q1 |
| Gilt für | alle Länder | den Plan eines Landes |
| Inhalt | eigene Ziele und Untereinheiten, überall dieselben | die Einheiten, die das Land dort vorsieht, über alle gewählten Fächer |
| Einheitsvoraussetzungen | fachlich begründet | fest vorgegeben: Stufe nach Stufe, Jahrgang nach Jahrgang |

Fächer sind in beiden Fällen nur Gruppierung. Die Ansicht nach Fächern und die
Ansicht nach Stufen sind zwei Darstellungen derselben Einheiten.

### 4.2 Der Plan eines Landes

Der Plan eines Landes besteht aus seinen Planeinheiten, deren festen
Einheitsvoraussetzungen und der Zuordnung fachlicher Einheiten zu
Planeinheiten. Heute steckt diese Zuordnung in den Ländersichten: Deren
Abschnitte „Sekundarstufe I“, „Jahrgangsstufe 7“ oder „Ph8.3“ sagen, welcher
Cluster wohin gehört. Sie sind die Planung von oben, nur noch nicht als
prüfbare Aussage.

Ein Land plant jede kleinste fachliche Einheit als Ganzes ein. Verteilt ein
Lehrplan sie auf zwei Jahrgänge, ist sie zu grob geschnitten, oder eines ihrer
Ziele mischt zwei Niveaus. Der erste Fall liegt vor: Die beiden Ziele der
Physik-Einheit zur gleichmäßig beschleunigten Bewegung stehen in Bayern in
Ph8.3 und Ph10.3.

### 4.3 Die Prüfung eines Plans braucht nur Einheiten

Für die fachlichen Einheiten wird E3 einmal geprüft, unabhängig von jedem
Land: Jede Voraussetzung zwischen Zielen verschiedener Einheiten ist durch die
fachliche Verdrahtung gedeckt. Danach sagt die Verdrahtung alles, was ein Plan
wissen muss. Für jedes Land bleibt eine Regel auf Einheitenebene:

> Liegt die fachliche Einheit u nach v, dann steht u in derselben Planeinheit
> wie v oder in einer, die nach der von v liegt.

Für fest gereihte Planeinheiten ist das E2 im zusammengesetzten Baum. Die
Prüfung liest kein einzelnes Ziel. Sie zeigt den Widerspruch dort, wo er
entsteht: zwischen zwei benannten Einheiten und zwei benannten Abschnitten des
Plans.

Die Pläne der 16 Länder prüfen damit auch die fachliche Verdrahtung. Lehren
mehrere Länder eine Einheit vor der anderen, obwohl die Verdrahtung das
Gegenteil erklärt, ist das ein Beleg gegen die Voraussetzung in dieser Form:
Die Einheit braucht die andere nicht, oder diese Länder lehren eine schwächere
Fassung.

### 4.4 Fächerauswahl und Zusatzbedarf

Eine Fächerauswahl mit Kursprofilen bestimmt, welche fachlichen Einheiten der
Plan enthält. Der **Zusatzbedarf** einer Auswahl sind die Einheiten, nach
denen eine gewählte Einheit liegt, die aber nicht zur Auswahl gehören.

Eine Kombination ist fair, wenn ihr Zusatzbedarf benannt und als Vorbereitung
in den Plan aufgenommen wird, jeweils vor der ersten Einheit, die ihn braucht.
Das ist immer möglich; die Frage ist nur, wie groß er ist. In Hessen bauen
16 Ziele des Physik-Leistungskurses auf der Kettenregel auf und 17 auf dem
natürlichen Logarithmus. Beides ist dort Lernziel im Mathematik-Leistungskurs
und nicht im Grundkurs. Der Voraussetzungsabschluss nimmt solche Ziele heute
einzeln in den Lernumfang auf. Eine Aussage über die Kombination als Ganzes
gibt es nicht.

## 5. Was eine Voraussetzung bedeutet

Die achte Vorgabe verlangt, jeden Rückgriff am Fall zu beurteilen. Dafür
braucht es eine klare Bedeutung der Voraussetzung zwischen Zielen:

> Eine Voraussetzung sagt, was vorher gelernt sein muss, damit das Ziel in
> seiner beschriebenen Form erreichbar ist. Sie sagt nicht, worauf ein Inhalt
> fachlich beruht oder womit er später begründet wird.

Wird ein Gegenstand zuerst phänomenologisch und später streng behandelt, sind
das zwei Ziele. Das strenge baut auf dem phänomenologischen auf, nie
umgekehrt. Zeigt eine Voraussetzung vom früheren auf das spätere Ziel,
beschreibt sie das Fundament und nicht den Lernweg.

Ein Widerspruch nach E2 hat vier mögliche Auflösungen:

| Auflösung | Wann | Was sich ändert |
| --- | --- | --- |
| Voraussetzung korrigieren | Das frühere Ziel braucht das spätere nicht, oder es braucht ein früheres Gegenstück. | eine Kante |
| Ziel oder Einheit teilen | Ein Ziel mischt eine phänomenologische und eine strenge Fassung. | Ziele und ihre Reviews |
| Im Plan vorziehen | Der Lehrplan des Landes sieht die Grundlage früher vor, als unser Plan sie führt. | nur der Plan des Landes |
| Als Vorbereitung einbinden | Der Lehrplan braucht die Grundlage früher, ohne sie zu führen. | nur der Plan des Landes, gekennzeichnet |

Welche zutrifft, entscheidet die Fachprüfung am Beleg. Die beiden letzten
ändern kein Ziel.

### Konkrete Fälle

Über acht Kanten greift die Physik der Sekundarstufe I in Mathematik, die
dasselbe Land nur unter der Sekundarstufe II führt. Die Einschätzung ist
vorläufig und keine Fachprüfung.

| Physikziel der Sekundarstufe I | braucht das Mathematikziel | Länder | Einschätzung |
| --- | --- | --- | --- |
| Bewegungen mit Weg-Zeit-Diagrammen beschreiben | Achsen, Skalen und Einheiten lesen | 15 | Der Bedarf ist echt, das Ziel hängt aber in einem Cluster der Einführungsphase. Das einfachere Ziel „Diagramme lesen“ der Sekundarstufe I führen nur 6 von 23 Grundkurs-Sichten. Vorziehen oder Kante auf das frühere Gegenstück richten. |
| Tonhöhe, Lautstärke und Geräusche unterscheiden | Achsen, Skalen und Einheiten lesen | 15 | wie oben |
| Die Strom-Spannungs-Kennlinie einer Diode experimentell bestimmen | Achsen, Skalen und Einheiten lesen | 3 | wie oben |
| Induktion durch Änderung des magnetischen Flusses | Achsen, Skalen und Einheiten lesen | 2 | wie oben; zudem wirkt das Physikziel mit Φ = B · A · cos(α) wie auf dem Niveau der Sekundarstufe II beschrieben |
| Die Gleichrichterfunktion einer Diodenschaltung erklären | Achsen, Skalen und Einheiten lesen | 2 | wie oben |
| Bewegungen mit Diagrammen untersuchen | Mittlere Änderungsrate berechnen und deuten | 3 | Phänomenologisch zuerst: Die Sekundarstufe I liest Steigungen und bildet Δs/Δt, der Differenzenquotient als Begriff kommt in der Einführungsphase. Die [Fachprüfung vom 14. November](../../dev/knowledge-context-subject-review-2026-11-14.md) empfiehlt für dieses Ziel bereits einen engeren Text. Teilen oder Kante korrigieren. |
| Bewegungen mit Videoanalyse untersuchen | Mittlere Änderungsrate berechnen und deuten | 2 | wie oben |
| Elektrische Stromstärke als Ladungsrate deuten | Mittlere Änderungsrate berechnen und deuten | 1 | Phänomenologisch zuerst: I = ΔQ/Δt braucht einen Quotienten, nicht den Begriff der Änderungsrate. |

Innerhalb der Fächer zeigen sich dieselben Muster:

| Früheres Ziel | braucht späteres Ziel | Einschätzung |
| --- | --- | --- |
| Warum eine Diode beim Umpolen sperrt (Sekundarstufe I) | Bändermodell und Dotierung (Q4) | Phänomenologisch zuerst; die Voraussetzung beschreibt das Fundament. |
| Kraft und Verformung experimentell untersuchen (Sekundarstufe I) | SI-Einheiten in physikalischen Beispielen nutzen | Das Ziel gehört kanonisch zu den Denk- und Arbeitsweisen der Sekundarstufe I, Hessen führt es nur unter Q4 Astrophysik. Vorziehen. |
| Idealen Transformator quantitativ deuten (Q1) | Bewegungsinduktion und Ladungstrennung (Q2) | offen: Reihenfolge der Phasen oder zu starke Kette |
| Diagramme lesen (Jahrgang 5) | Zuordnungen analysieren (Jahrgang 7), über „Informationen aus Tabellen entnehmen“ und „Tabellen erstellen und beschriften“ | Vermutlich ist die Kante von „Tabellen erstellen und beschriften“ zu stark. |

## 6. Verhältnis zu bestehenden Festlegungen

**Unverändert bleiben:**

- Voraussetzungen stehen nur zwischen atomaren Zielen, sind kreisfrei und
  transitiv minimal.
- Je atomarem Ziel wird ein binäres Ergebnis gespeichert. Der Abschluss einer
  Einheit wird abgeleitet.
- Die Anerkennungsregel und R1 bis R5 gelten für fachliche Einheiten wie
  bisher. Die Rechnung braucht nur eigene Ziele, eigene Prüfungen und
  Voraussetzungen; woher die eigenen Ziele stammen, ist ihr gleich.
- Der persönliche Lernumfang ist der Abschluss über die atomaren
  Voraussetzungen (Entscheidung vom 10. November).
- Der Wissenskontext eines Ziels wird aus den atomaren Voraussetzungen
  abgeleitet (Anforderung vom 13. November). Eine Einheitsvoraussetzung
  sichert für ein einzelnes Ziel nichts zusätzlich; sie begrenzt, was der
  Kontext enthalten kann.
- Ob eine Einheitsvoraussetzung den Zugang sperrt, bleibt unentschieden. Sie
  prüft den Plan, den wir anbieten, und sperrt niemanden.

**Ändern würde sich:**

- **Die Ablage der Einheiten.** Nach dem Vertrag vom 12. November zählt eine
  Einheit ihre Ziele über Platzierungen der Beziehung `own` auf und nennt ihr
  Elternteil. Als ausgezeichneter Cluster bekäme sie beides aus `contains`.
- **Die Stellung von Stufen und Jahrgängen.** Die Graph-Definition nennt
  Schuljahre mögliche Planungsanker und keine Lerneinheiten. Sie würden
  Planeinheiten.
- **Die Einheitsvoraussetzung** bekäme eine Darstellung und die Regeln E2 bis
  E4. Der „Reihenfolgefehler“ aus §12 wäre für Planeinheiten ein Verstoß gegen
  E2; die Budgetprüfung aus §12 bliebe ein freiwilliges Profil.
- **Die `contains`-Hierarchie** müsste um Einheiten herum geordnet werden
  (Abschnitt 8.4). Weil kein Cluster eine Voraussetzung trägt, ändert das
  keine Voraussetzung. Es ändert die Bäume der Ländersichten und alles, was an
  sie gebunden ist.
- **Die Ländersichten** würden fachliche Einheiten zu Planeinheiten zuordnen.
  Planeinheiten gälten über die Fächer eines Landes hinweg.

**Stufe 3** des Umsetzungsplans, die Anerkennung zur Laufzeit, ist in der
Sache nicht berührt. Zwei Darstellungen aus der
[Vorlage zu Stufe 3](../../dev/learning-unit-recognition-runtime-proposal-2026-11-14.md)
hängen aber an der Ablage: die Platzierungsbeziehung für Ziele, die nie
anerkannt werden, und der Vertragsstand einer Einheit.

## 7. Offene Entscheidungen

| Nr. | Frage | Empfehlung |
| --- | --- | --- |
| K1 | Wo steht die Einheiteneigenschaft eines Clusters? | Im Einheiteneintrag der Platzierungsschicht, der auf den Cluster zeigt. Zielobjekte und alle an sie gebundenen Nachweise bleiben unverändert; Lernversprechen, Abdeckungsreviews und Revision stehen dort schon. Die Platzierungen `own` und das Elternfeld entfielen. |
| K2 | Gelten E2 bis E4 wie in Abschnitt 3.3? | Ja. Offen ist eine Feinheit: Eigene Ziele neben Untereinheiten sollten nur Einstieg (Orientierung) oder Abschluss (zusammenführende Prüfung, Lernkarten) sein; eigene Fachziele gehören in eine Untereinheit. |
| K3 | Zwei Arten von Einheiten nach Abschnitt 4.1? | Ja. Anders lässt sich nicht fassen, dass dieselbe fachliche Einheit in zwei Ländern in verschiedenen Jahrgängen steht. |
| K4 | Plant jedes Land die kleinsten fachlichen Einheiten als Ganzes ein? | Ja. Das macht die Länderpläne zur Prüfbedingung für den Zuschnitt und deckt Ziele auf, die zwei Niveaus mischen. Es führt stellenweise zu kleinen Einheiten. |
| K5 | Woher kommt die fachliche Verdrahtung? | Ein Werkzeug schlägt sie aus den Voraussetzungen der Ziele vor, die Fachprüfung bestätigt sie. Danach ist sie erklärt, und neue Voraussetzungen müssen zu ihr passen. |
| K6 | Wo werden die Planeinheiten eines Landes erklärt, sodass sie für alle Fächer dieselben sind? | Offen. Heute führt jede Fachsicht eigene Abschnitte, und jedes Fach eigene Programmeinheiten `stage`, `year` und `phase`. |
| K7 | Was fügt eine Fächerauswahl ihrem Plan hinzu: ganze Einheiten des Zusatzbedarfs oder nur die gebrauchten Ziele? | Zur Laufzeit weiter nur die gebrauchten Ziele, wie am 10. November entschieden. Angezeigt wird der Zusatzbedarf in Einheiten. |
| K8 | Wie wird aus der Prüfung ein Gate? | Zuerst ein Bericht, dann Behebung der Ursachen, dann eine Sperrklinke: Kein neuer Verstoß kommt hinzu. Ein hartes Gate erst bei null. |

K1 und K4 sollten fallen, bevor in Stufe 4 weitere Einheiten verfasst werden.
Beide bestimmen, wie eine Einheit abgelegt und geschnitten wird.

## 8. Befunde im heutigen Bestand

Alle Zahlen stammen aus Erkundungsrechnungen vom 14. November 2026 auf dem
kanonischen Katalog und den Ländersichten. Sie verwenden die normative
Voraussetzungsrelation. Die Abschnitte der Sichten stehen stellvertretend für
Planeinheiten; Stufen, Jahrgänge und Phasen sind am Titel erkannt. Die Skripte
sind nicht eingecheckt. Die Zahlen zeigen Größenordnungen, sie sind kein
Gate-Ergebnis.

### 8.1 Früheres braucht Späteres

| Ebene | Physik | Mathematik |
| --- | --- | --- |
| Stufen | 34 von 34 Sichten mit beiden Stufen | 44 von 46 |
| Jahrgänge | 6 von 6 Gruppen, alle in Bayern | 33 von 44 Gruppen |
| Phasen E, Q1 bis Q4 | 60 von 60 Gruppen | 0 von 10 |
| Ursachen auf Stufenebene | 39 Ziele, 44 Kanten | 39 Ziele, 50 Kanten |
| Ursachen auf Jahrgangsebene | 10 Ziele | 56 Ziele, 74 Kanten |
| Ursachen auf Phasenebene | 4 Ziele | keine |

Eine Ursache ist die erste Stelle eines Pfads, an der ein früherer Abschnitt
in einen späteren greift. Wenige Ursachen erzeugen viele Folgefälle.

Unabhängig von jeder vorgegebenen Reihenfolge lassen sich 257 von 5.608
Geschwistergruppen der Physiksichten und 617 von 12.332 der Mathematiksichten
gar nicht ordnen, weil sich ihre Mitglieder gegenseitig brauchen. Fast alle
liegen auf den oberen Ebenen.

### 8.2 Zwischen den Fächern

In jedem der 16 Länder brauchen 32 bis 74 der 115 bis 146 Physikziele der
Sekundarstufe I Mathematik, die die Mathematiksicht desselben Landes nur unter
der Sekundarstufe II führt. Dahinter stehen die acht Kanten aus Abschnitt 5
und zwei Mathematikziele. Über weitere 30 Kanten greift die Physik der
Sekundarstufe I in Mathematikziele, die die Mathematiksicht des Landes gar
nicht führt.

### 8.3 Physik-Leistungskurs mit Mathematik-Grundkurs

Der Physik-Leistungskurs eines Landes braucht 129 bis 168 Mathematikziele. Je
nach Land sind 9 bis 45 davon kein Lernziel im Mathematik-Grundkurs. Die
meisten führt auch der Mathematik-Leistungskurs des Landes nicht; vermutlich
sind das Lücken der Sichten oder Kanten auf ein Ziel, das die Sicht in anderer
Fassung führt. Stoff, den nur der Leistungskurs führt, ist es in drei Ländern:

| Land | Mathematik nur im Leistungskurs | Physik-LK-Ziele, die darauf aufbauen |
| --- | --- | --- |
| Hessen | natürlicher Logarithmus als Umkehrfunktion und als Stammfunktion von 1/x | 17 |
| Hessen | Kettenregel | 16 |
| Hessen | Produktregel, Vektorprodukt | je 4 |
| Bayern | Kettenregel | 25 |
| Bayern | natürlicher Logarithmus, Umkehrfunktionen | je 1 |
| Schleswig-Holstein | Vektorprodukt | 4 |

### 8.4 Die `contains`-Hierarchie und Einheiten

| Befund | Mathematik | Physik |
| --- | --- | --- |
| Cluster mit Voraussetzung | 0 | 0 |
| Cluster, die Fachziele und Prüfungen zugleich enthalten | 0 | 0 |
| Cluster nur mit Prüfungen | 18 | 10 |
| Prüfungen im selben Cluster wie eine ihrer direkten Voraussetzungen | 0 von 166 | 0 von 157 |
| Atomare Ziele mit mehreren Eltern | 75 | 19 |

Die eigenen Ziele der drei vorhandenen Einheiten liegen in zwei bis drei
Clustern: die Fachziele in einem Themencluster, die Prüfungen in einem
Prüfungscluster. Eine Einheit als Cluster verlangt, dass ihre Prüfungen bei
ihren Fachzielen liegen.

### 8.5 Wie groß eine Verdrahtung wäre

Nimmt man probeweise die heutigen Themencluster als Einheiten und lässt die
Prüfungen beiseite:

| | Mathematik | Physik |
| --- | --- | --- |
| Themencluster mit Fachzielen | 215 | 105 |
| Abgeleitete Abhängigkeiten zwischen ihnen | 445 | 233 |
| Nötige Einheitsvoraussetzungen nach E4 | 257 | 120 |
| Cluster, die sich gegenseitig brauchen | 46 in 16 Gruppen | 24 in 10 Gruppen |

Dazu kommen 133 Abhängigkeiten von 61 Physikclustern zu 36
Mathematikclustern. Die Verdrahtung ist also klein, gut eine Aussage je
Einheit. Rund 70 Cluster müssten anders geschnitten werden, bevor sie
Einheiten sein können.

### 8.6 Nicht erklärt

Der Pfeil von Physik nach Mathematik in der Lernkarte des Product Owners ist
nicht erklärt. Kanonisch setzt kein Mathematikziel ein Physikziel voraus, und
keine einzelne Ländersicht erzeugt ihn. Er entsteht vermutlich beim
Zusammenführen von Grund- und Leistungskurs. Zur Klärung fehlt die
Konfiguration.

## 9. Nächste Schritte

1. Der Product Owner entscheidet über Abschnitt 7.
2. Das Entschiedene geht in die Graph-Definition §11 und §12, in `AGENTS.md`
   und in den Umsetzungsplan ein.
3. Ein Pilot fasst die drei vorhandenen Einheiten und ihre Nachbarschaft als
   Cluster, erklärt ihre Verdrahtung und prüft sie gegen die Pläne der Länder.
4. Die Fachprüfung beurteilt die Ursachen aus Abschnitt 8.1, beginnend mit den
   Zielen, in die am häufigsten gegriffen wird.
