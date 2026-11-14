# Lerneinheiten: Cluster, `after` und Lernfluss

**Stand: 14. November 2026.** Dieses Dokument legt fest, was eine Lerneinheit
ist, wie Einheiten geordnet werden und wie diese Ordnung im Lernfluss wirkt.
Die Festlegungen gelten mit der Übernahme des Dokuments nach `main`. Umgesetzt
ist davon nichts; Abschnitt 10 nennt die Folgearbeiten. Bis sie erledigt sind,
beschreiben die [Graph-Definition §11 bis §13](learning-units.de.md) und der
Einheitenvertrag vom 12. November den umgesetzten Stand.

## 1. Zweck

Der Graph der einzelnen Lernziele ist kreisfrei; das prüft die CI. Fasst man
Ziele zu Blöcken zusammen, können sich Blöcke trotzdem gegenseitig brauchen.
Die Lernkarte zeigt dann Pfeile im Kreis, etwa zwischen Sekundarstufe I und
Sekundarstufe II.

Das ist kein Darstellungsproblem. In 14 Ländern braucht ein Ziel der
Sekundarstufe I zur Diode das „Bändermodell und Dotierung“ aus der vierten
Qualifikationsphase. Wer nur die Sekundarstufe I lernt, bekommt dieses Ziel
über den Voraussetzungsabschluss in den Lernumfang. Abschnitt 9 zeigt, wie
verbreitet das ist.

Die Festlegungen sagen deshalb, welche Blöcke als Ganzes gelernt werden, in
welcher Reihenfolge sie stehen und wie diese Reihenfolge gegen den Bedarf der
einzelnen Ziele geprüft wird. Eine Sonderregel für Stufen oder Schuljahre gibt
es nicht, auch keine Zeitachse.

## 2. Beschlüsse

| Nr. | Beschluss | Abschnitt |
| --- | --- | --- |
| B1 | Eine Einheit ist ein Cluster, der an einem Stück gelernt wird. Das wird erklärt. Nicht jeder Cluster ist eine Einheit, und Fächer sind keine. | 3.1 |
| B2 | Cluster, Einheit und Einheit mit Prüfungen bauen aufeinander auf: Der Cluster gliedert, die Einheit fügt die Reihenfolge hinzu, die Einheit mit Prüfungen den Nachweis. Ob eine Einheit Prüfungen hat, ergibt sich aus ihren Zielen. | 3.1 |
| B3 | Eine Einheit mit Prüfungen enthält ihre Prüfungen: Sie liegen in ihrem Cluster. Eigene Inhaltsziele hat nur eine Einheit mit Prüfungen. | 3.1 |
| B4 | Dass ein Cluster eine Einheit ist, steht im Einheiteneintrag der Platzierungsschicht und nicht im Zielobjekt. | 3.2 |
| B5 | Fachliche Einheiten gelten in allen Ländern. Stufen, Jahrgänge und Phasen sind Planeinheiten eines Landes über die gewählten Fächer, mit fester Reihenfolge. | 3.3 |
| B6 | Die Lernkarte zeigt Einheiten und atomare Ziele. Cluster, die keine Einheit sind, zeigt der Lernzielbaum. | 3.4 |
| B7 | Zwischen Einheiten steht `after`, zwischen atomaren Zielen `requires`. `requires` ist ein besonderes `after`. | 4.1 |
| B8 | Kein Cluster trägt ein `requires`, und kein `after` wird entlang `contains` an Ziele vererbt. Die Regeln stellen sicher, dass beide zusammenpassen. | 4.2 |
| B9 | Wer die selbstständige Anwendung braucht, die eine Einheit belegt, setzt ihre Prüfung voraus. Eine Sperre ganzer Einheiten gibt es nicht. | 4.3 |
| B10 | Für Einheiten gelten die Regeln E1 bis E4. | 5 |
| B11 | Die `after` der fachlichen Einheiten schlägt ein Werkzeug aus den `requires` der Ziele vor; die Fachprüfung bestätigt sie. | 5 |
| B12 | Ein `after` ändert die Frontier nicht. In der Lernweise „Einheit für Einheit“ bestimmt es, welches erreichbare Ziel als nächstes kommt. | 6 |
| B13 | Jedes Land plant die kleinsten fachlichen Einheiten als Ganzes ein. Sein Plan wird auf der Ebene der Einheiten kontrolliert. | 7 |
| B14 | Der Zusatzbedarf einer Fächerauswahl wird in Einheiten angezeigt. In den Lernumfang kommen nur die gebrauchten Ziele. | 7.3 |
| B15 | Eine Voraussetzung sagt, was vorher gelernt sein muss, und nicht, worauf ein Inhalt fachlich beruht. | 8 |
| B16 | Die Regeln werden schrittweise zum Gate: Bericht, Behebung der Ursachen, Sperrklinke, hartes Gate bei null. | 10.3 |

## 3. Cluster und Einheiten

### 3.1 Cluster, Einheit, Einheit mit Prüfungen

Drei Begriffe bauen aufeinander auf. Jeder fügt dem vorigen eine Eigenschaft
hinzu:

| Begriff | Was er ist | Was er hinzufügt | Beispiele |
| --- | --- | --- | --- |
| **Cluster** | ein Knoten der Gliederung, der Ziele enthält | Gliederung | Fach, Themenbereich über mehrere Jahre, Prüfungscluster |
| **Einheit** | ein Cluster, der an einem Stück gelernt wird | Reihenfolge | Sekundarstufe I, Jahrgang 7, Q1; Mechanik als Zusammenfassung von Kinematik und Dynamik |
| **Einheit mit Prüfungen** | eine Einheit, zu deren eigenen Zielen Prüfungen gehören | Nachweis | „Natürliche Zahlen verstehen und darstellen“; eine Einheit mit Syntheseprüfung |

Jede Einheit mit Prüfungen ist eine Einheit, und jede Einheit ist ein Cluster,
so wie jedes `requires` ein `after` ist. Damit gibt es drei Arten von
Clustern: Cluster, die keine Einheit sind, Einheiten ohne Prüfungen und
Einheiten mit Prüfungen.

| Eigenschaft | Gilt für | Was an ihr hängt |
| --- | --- | --- |
| Gliederung | jeden Cluster | Lernzielbaum, abgeleiteter Fortschritt |
| Reihenfolge | jede Einheit | Lernversprechen, `after`, Regeln E1 bis E4, Lernweise „Einheit für Einheit“, Knoten der Lernkarte |
| Nachweis | jede Einheit mit Prüfungen | Regeln R1 bis R5, Anerkennung, Voraussetzung auf ihre Prüfung (Abschnitt 4.3) |

**Einheit.** Eine Einheit wird an einem Stück gelernt: Man beginnt sie,
schließt sie ab und beginnt erst dann, was nach ihr liegt. Dass ein Cluster
eine Einheit ist, wird erklärt. Es folgt nicht aus seiner Stellung in der
Gliederung. Ob die Erklärung trägt, zeigt Regel E2. Ein Cluster, der keine
Einheit ist, gliedert nur: Die Ziele zweier Themenbereiche dürfen sich im
Lernfluss abwechseln.

**Einheit mit Prüfungen.** Eine Einheit hat Prüfungen, wenn unter ihren
eigenen Zielen Prüfungsziele sind. Das wird nicht erklärt; es ergibt sich. Die
Prüfungen liegen in ihrem Cluster wie ihre übrigen Ziele. Dass eine größere
Einheit die Prüfungen ihrer Untereinheiten enthält, macht sie nicht zu einer
Einheit mit Prüfungen.

Die Prüfungen bringen den Nachweis. Ein ausdrückliches Ergebnis an einem
Inhaltsziel belegt Verstehen. Die bestandenen Prüfungen einer Einheit belegen
die selbstständige Anwendung ihrer eigenen Inhaltsziele; diese gelten dann
auch ohne eigenes Ergebnis als beherrscht
([Entscheidung vom 4. November](completion-semantics-clarification-2026-11-04.md)).
Beides zählt gleich. Je Ziel gibt es ein binäres Ergebnis und keine Stufen der
Beherrschung.

Eigene Inhaltsziele hat nur eine Einheit mit Prüfungen. Für sie gelten R1 bis
R5 unverändert: Eine eigene Prüfung setzt jedes eigene Inhaltsziel voraus, und
ein Abdeckungsreview bestätigt, dass sie es prüft. Eine Einheit ohne Prüfungen
fasst Untereinheiten zusammen. Sie ordnet, erkennt aber nichts an.

### 3.2 Was zu einer Einheit gehört

| Bestandteil | Bedeutung |
| --- | --- |
| Lernversprechen | was Lernende nach der Einheit können und wozu das nützt |
| Umfang | alle atomaren Ziele unter ihrem Cluster |
| Untereinheiten | die Einheiten, deren Cluster unter ihrem liegt; direkt ist eine Untereinheit, wenn keine weitere Einheit dazwischen liegt |
| Eigene Ziele | die Ziele ihres Umfangs, die in keiner Untereinheit liegen |
| Abschluss | abgeleitet: Alle Ziele ihres Umfangs sind beherrscht. Gespeichert wird je Ziel ein binäres Ergebnis, für die Einheit nichts. |
| `after` | die Einheiten, nach denen sie liegen soll (Abschnitt 4) |

Die **kleinste Einheit** eines Ziels ist die innerste Einheit, in der es
liegt. Zwischen einer Einheit und ihren Untereinheiten oder Zielen können
Cluster liegen, die keine Einheit sind.

Wo eine Einheit endet, bestimmt weiter das Kriterium der Graph-Definition:
dort, wo ein zusammenhängendes Verständnis sicher sein muss, bevor Neues
darauf aufbaut ([Gestaltungskriterien](learning-unit-design-and-examples.de.md)).

**Ablage.** Dass ein Cluster eine Einheit ist, steht im Einheiteneintrag der
Platzierungsschicht (`programUnits`), der auf den Cluster zeigt. Dort stehen
auch Lernversprechen, Abdeckungsreviews, Revision und `after`. Das Zielobjekt
des Clusters bleibt unverändert, und mit ihm bleiben es die Nachweise, die an
Zielobjekte gebunden sind. Die Platzierungen der Beziehung `own` und das
Elternfeld der Einheit entfallen: Eigene Ziele und Untereinheiten ergeben sich
aus `contains`.

### 3.3 Fachliche Einheiten und Planeinheiten

Gliederungen gibt es zwei. Die kanonische Landschaft eines Fachs gliedert
seine Ziele mit `contains`; sie gilt in allen Ländern. Der Plan eines Landes
gliedert dieselben Ziele in Stufen, Jahrgänge und Phasen, über alle gewählten
Fächer; seine Cluster sind die Abschnitte des Plans. Dasselbe Ziel steht in
Bayern in Jahrgang 8 und in Hessen in der Einführungsphase. Einheiten gibt es
in beiden Gliederungen:

| | Fachliche Einheit | Planeinheit |
| --- | --- | --- |
| Beispiele | „Natürliche Zahlen verstehen und darstellen“ | Sekundarstufe I, Jahrgang 8, Q1 |
| Gilt für | alle Länder | den Plan eines Landes |
| Liegt in | der kanonischen Landschaft ihres Fachs | dem Plan des Landes, über alle gewählten Fächer |
| Enthält | eigene Ziele und Untereinheiten, überall dieselben | die fachlichen Einheiten, die das Land dort vorsieht |
| `after` | fachlich begründet | fest vorgegeben: Stufe nach Stufe, Jahrgang nach Jahrgang |
| Prüfungen | mit oder ohne | in der Regel ohne |

Fächer sind in beiden Gliederungen Cluster und keine Einheiten. Die Ansicht
nach Fächern und die Ansicht nach Stufen zeigen dieselben fachlichen
Einheiten.

Planeinheiten werden je Land einmal erklärt und gelten für alle Fächer. Die
Sichten der Fächer beziehen ihre Abschnitte darauf.

### 3.4 Lernzielbaum und Lernkarte

| Ansicht | Zeigt | Wozu |
| --- | --- | --- |
| Lernzielbaum | alle Cluster und Ziele | Gliederung: etwas finden |
| Lernkarte | Einheiten und atomare Ziele | Reihenfolge: sehen, was worauf folgt |

Die Lernkarte zeichnet einen Pfeil nur dort, wo eine Reihenfolge feststeht:
zwischen Einheiten nach ihrem `after`, zwischen atomaren Zielen nach ihrem
`requires`, auf jeder Ebene zwischen den direkten Untereinheiten und den
eigenen Zielen einer Einheit. Mit Regel E2 bilden diese Pfeile keinen Kreis.

Ein Cluster, der keine Einheit ist, ist kein Knoten der Karte. Ein Fach
erscheint als Farbe oder Spur seiner Einheiten. Ein Prüfungscluster erscheint
nicht; seine Prüfungen stehen in ihren Einheiten.

Solange Ziele in keiner Einheit liegen, zeigt die Karte sie unter ihrem
Cluster als Rahmen, in der Reihenfolge des Plans. Zwischen Rahmen zeichnet sie
keine Pfeile; Rückgriffe kennzeichnet sie.

## 4. `after` und `requires`

### 4.1 Zwei Aussagen über die Reihenfolge

| | `after` | `requires`, das besondere `after` |
| --- | --- | --- |
| Steht zwischen | zwei Einheiten, von denen keine in der anderen liegt | zwei atomaren Zielen |
| Sagt | das Soll: Die andere Einheit ist abgeschlossen, bevor diese beginnt. | das Soll und den Bedarf: Das Ziel liegt nach dem anderen und ist ohne es nicht erreichbar. |
| Herkunft | erklärt, von oben | fachlich, von unten |
| Wirkung | wird an den Regeln gemessen (Abschnitt 5) und ordnet die Auswahl in der Lernweise „Einheit für Einheit“ (Abschnitt 6) | Frontier, Lernumfang, Wissenskontext |

`requires` ist ein `after`, aber ein besonderes: Was für jedes `after` gilt,
gilt auch für jedes `requires`. Umgekehrt ist nicht jedes `after` ein
`requires`. Besonders ist `requires` durch seine Verbindlichkeit und nicht
durch seinen Umfang: Ein `after` ordnet alle Ziele der einen Einheit hinter
alle Ziele der anderen, ein `requires` ein Ziel hinter ein anderes.

`after` beschreibt das Soll des Lernflusses. Ob eine lernende Person die
Einheiten in dieser Reihenfolge lernt, ist etwas anderes; nichts sperrt sie.
Ein `after` sichert deshalb für ein einzelnes Ziel kein Wissen zu.

Zwei Begriffe werden im Folgenden gebraucht:

- Ein Ziel **braucht** ein anderes, wenn es dieses direkt oder über
  Zwischenschritte voraussetzt.
- Eine Einheit **liegt nach** einer anderen, wenn das aus den erklärten
  `after` folgt:
    - Ist für u ein `after` zu v erklärt, liegt u nach v.
    - Liegt u nach v, liegt jeder Teil von u nach jedem Teil von v.
    - Liegt u nach w und w nach v, liegt u nach v.

### 4.2 Abgleich statt Vererbung

In der atomaren Normalform trägt kein Cluster ein `requires`. Das gilt auch
für Einheiten. Ein `after` wird nicht als Bedarf an die Ziele der Einheit
weitergereicht. Stünde „Sekundarstufe II nach Sekundarstufe I“ als `requires`
am Cluster und würde vererbt, wäre kein Ziel der Sekundarstufe II erreichbar,
bevor die ganze Sekundarstufe I beherrscht ist, und der Voraussetzungsabschluss
zöge sie vollständig in jeden Lernumfang.

Betrachtet wird die umgekehrte Richtung: Was sich aus den `requires` der Ziele
ergibt, darf dem `after` der Einheiten nicht widersprechen (Regel E2) und muss
durch es gedeckt sein (Regel E3).

Die Vererbung entlang `contains` bleibt die Lesart des Übergangsbestands
außerhalb des kanonischen Gymnasialkatalogs (Abschnitt 9.7).

### 4.3 Wer die selbstständige Anwendung braucht

`U after V` sagt für jede Einheit dasselbe: V ist abgeschlossen, bevor U
beginnt. Ist V eine Einheit mit Prüfungen, gehört ihr Bestehen dazu. Das Soll
lautet dann: U baut auf der selbstständigen Anwendung von V auf. In der
Lernweise „Einheit für Einheit“ kommen die Prüfungen von V deshalb vor den
Zielen von U.

Ein Bedarf ist das noch nicht. Braucht ein Ziel mehr als das Verstehen einer
einzelnen Kompetenz, setzt es die Prüfung voraus:

| Das Ziel braucht | Es setzt voraus | Erreichbar, sobald |
| --- | --- | --- |
| eine einzelne Kompetenz | das Inhaltsziel | das Inhaltsziel beherrscht ist, durch ein eigenes Ergebnis oder durch Anerkennung |
| die selbstständige Anwendung, die eine Einheit belegt | die Prüfung dieser Einheit | die Prüfung bestanden ist |

Eine Prüfung ist ein atomares Ziel. Die Voraussetzung auf sie ist ein
gewöhnliches `requires`: Sie bleibt in der atomaren Normalform und wirkt in
der Frontier. Weil die Prüfung ihre abgedeckten Ziele voraussetzt, steht keine
zweite Kante auf das Inhaltsziel daneben (transitive Minimalität). E3 verlangt
dann das `after` zwischen den beiden Einheiten. Wer die Kompetenzen schon hat,
legt die Prüfung direkt ab (direkter Prüfungszugang).

Der Katalog enthält solche Kanten bereits: 70 gewöhnliche Ziele in fünf
Fächern setzen Prüfungen voraus (Abschnitt 9.5).

Eine Sperre ganzer Einheiten gibt es nicht. Sie machte aus jedem `after` einen
Bedarf aller Ziele der späteren Einheit, auch derer, die aus der früheren
nichts brauchen. Das Zugangsprofil, das die Graph-Definition §11.5 offen
lässt, entfällt damit.

## 5. Die Regeln

| Regel | Inhalt |
| --- | --- |
| **E1 Baum** | Zwei Einheiten sind ineinander geschachtelt oder haben kein gemeinsames Ziel. Jedes atomare Ziel hat damit höchstens eine kleinste Einheit; ist ein Fach vollständig in Einheiten gefasst, genau eine. |
| **E2 Als Ganzes lernbar** | Es gibt eine Reihenfolge aller Ziele, die jeden Bedarf und jedes `after` einhält und in der jede Einheit an einem Stück steht. |
| **E3 Vollständig** | Braucht ein Ziel a ein Ziel b, und sind ihre kleinsten Einheiten verschieden und nicht ineinander geschachtelt, dann liegt die kleinste Einheit von a nach der von b. |
| **E4 Sparsam** | Kein erklärtes `after` folgt schon aus den übrigen. |

E1 ist die bisherige Regel R4 in der Sprache der Cluster. E2 sagt, dass Plan
und Bedarf zusammenpassen: Kein Ziel kommt nach sich selbst, und keine Einheit
muss für eine andere unterbrochen werden. E3 sagt, dass zwischen Einheiten
nichts Unerklärtes entsteht. E4 hält die Verdrahtung lesbar und entspricht der
transitiven Minimalität.

Ein `after` darf mehr festlegen, als die Ziele brauchen. Das ist die Planung
von oben: Jahrgang 6 liegt nach Jahrgang 5, auch wenn kein Ziel es erzwingt.
Mit E3 legt es nie weniger fest, mit E2 nie etwas Widersprüchliches.

Geprüft wird E2 je Ebene: Unter den direkten Untereinheiten und den eigenen
Zielen einer Einheit darf sich aus Bedarf und `after` kein Kreis ergeben,
ebenso wenig unter den obersten Einheiten und den Zielen ohne Einheit. E3 wird einmal an
den fachlichen Einheiten geprüft, unabhängig von jedem Land. E1, E2 und E4
gelten in der kanonischen Hierarchie und im Plan jedes Landes (Abschnitt 7).

Die `after` der fachlichen Einheiten schlägt ein Werkzeug aus den `requires`
der Ziele vor; die Fachprüfung bestätigt sie. Danach sind sie erklärt, und
eine neue Voraussetzung zwischen Zielen verschiedener Einheiten muss zu ihnen
passen.

### 5.1 Was aus den Regeln folgt

- **Kein Rückgriff.** Liegt u nach v, braucht kein Ziel aus v ein Ziel aus u.
- **Einheit für Einheit ist immer möglich.** Auf jeder Ebene gibt es eine
  Reihenfolge, in der jede Einheit erst beginnt, wenn die Einheiten
  abgeschlossen sind, nach denen sie liegt. Die Lernkarte zeigt zwischen
  Einheiten keine Kreise.
- **Nicht jeder Cluster kann eine Einheit sein.** Zwei Themenbereiche, deren
  Ziele sich über die Jahre abwechseln, lassen sich nicht nacheinander lernen.
  Sie bleiben Cluster, die nur gliedern, oder sie werden kleiner geschnitten.
- **Die Einheit hat eine Schnittstelle.** Was die Ziele einer Einheit von
  außen brauchen, liegt in Einheiten, nach denen sie liegt. Der
  [Wissenskontext](knowledge-context.de.md) jedes ihrer Ziele ist damit durch
  die `after` der Einheit begrenzt und lässt sich in wenigen Namen angeben.
- **Änderungen fallen auf.** Eine neue Voraussetzung zwischen Zielen
  verschiedener Einheiten verletzt E3, solange kein `after` sie deckt. Wer sie
  einträgt, entscheidet, ob die eine Einheit auf der anderen aufbauen soll.

### 5.2 Ein Beispiel

Eine Einheit D fasst die Ziele zur Diode, eine Einheit B das Bändermodell. In
14 Ländern stehen die Ziele von D in der Sekundarstufe I und die von B in der
Sekundarstufe II, und die Sekundarstufe II liegt nach der Sekundarstufe I.
Damit kommt jedes Ziel von B nach jedem Ziel von D. Ein Ziel aus D braucht
heute aber „Bändermodell und Dotierung“ aus B; dieses muss also vor ihm
kommen. Eine Reihenfolge, die beides einhält, gibt es nicht: E2 ist verletzt.
Mit E3 steht der Widerspruch zwischen zwei benannten Einheiten.

Der Verstoß sagt nicht, was falsch ist. Die Sperrschicht einer Diode lässt
sich mit der Dotierung erklären, ohne das Bändermodell zu kennen; das spätere
Ziel fasst beides zusammen. Vermutlich ist die Voraussetzung zu stark, oder
das Ziel ist zu teilen. Das entscheidet die Fachprüfung (Abschnitt 8).

## 6. `after` im Lernfluss

Ein `after` ändert die Frontier nicht. Erreichbar ist jedes offene Ziel,
dessen Bedarf erfüllt ist. Die folgende Lernweise ändert daran nichts; sie
bestimmt, welches erreichbare Ziel als nächstes kommt.

**Lernweise „Einheit für Einheit“.** Ist sie gewählt, schließt das Backend
eine begonnene Einheit ab, bevor es eine neue beginnt, und beginnt Einheiten
in der Reihenfolge ihres `after`. Unter den erreichbaren Zielen wählt es in
dieser Rangfolge:

1. ein Ziel einer begonnenen Einheit; ist in ihr keines erreichbar, ein Ziel,
   das eines ihrer offenen Ziele braucht;
2. ein Ziel einer Einheit, die an der Reihe ist;
3. jedes andere erreichbare Ziel.

Bei geschachtelten Einheiten gilt die Rangfolge zuerst für die äußeren
Einheiten und dann innerhalb der gewählten für die inneren. Bei Gleichstand
bleibt die bisherige Reihenfolge.

| Eine Einheit ist | wenn für die lernende Person gilt |
| --- | --- |
| abgeschlossen | Alle Ziele der Einheit, die zu ihrem Lernumfang gehören, sind beherrscht. |
| begonnen | Mindestens eines dieser Ziele ist beherrscht, und die Einheit ist nicht abgeschlossen. |
| an der Reihe | Alle Einheiten, nach denen sie liegt, sind abgeschlossen. |

Eine Einheit mit Prüfungen ist erst mit ihnen abgeschlossen. Die Lernweise
führt deshalb durch die Prüfungen einer Einheit, bevor die nächste beginnt.

Ein Beispiel: Die Einheit Mechanik enthält Kinematik und Dynamik, Dynamik
liegt nach Kinematik, und daneben steht die Einheit Stromkreise. Erreichbar
sind Ziele aus allen dreien. Ist Kinematik begonnen, kommen ihre übrigen Ziele
und ihre Prüfung. Danach ist Mechanik begonnen und Dynamik an der Reihe.
Stromkreise folgt, wenn Mechanik abgeschlossen ist.

Die Lernweise lässt unverändert:

- **Die Frontier.** Nichts wird gesperrt, und kein Ziel kommt hinzu.
- **Die ausdrückliche Wahl.** Wählt die lernende Person ein Fach, einen Fokus
  oder ein Ziel, geht das vor.
- **Den Vorrang des Lernplans.** Fällige Ziele kommen vor geplanten, geplante
  vor weiteren. Die Lernweise ordnet innerhalb dieser Gruppen, und ein
  Lernplan, der unter ihr entsteht, reiht seine Ziele in derselben Ordnung.
- **Ziele ohne Einheit.** Sie kommen in der bisherigen Reihenfolge.

Die Lernweise ist eine Einstellung im Lernzustand der Person. Gewählt wird sie
in der Oberfläche von SkillPilot, die Auswahl trifft das Backend. Regel E2
sichert, dass sie möglich ist. Ohne die Lernweise hat ein `after` im Lernfluss
keine Wirkung.

## 7. Der Plan eines Landes

### 7.1 Zuordnung

Der Plan eines Landes besteht aus seinen Planeinheiten, ihrer festen
Reihenfolge und der Zuordnung fachlicher Einheiten zu Planeinheiten. Heute
steckt diese Zuordnung in den Ländersichten: Deren Abschnitte
„Sekundarstufe I“, „Jahrgangsstufe 7“ oder „Ph8.3“ sagen, welcher Cluster
wohin gehört.

Ein Land plant jede kleinste fachliche Einheit als Ganzes ein. Verteilt ein
Lehrplan sie auf zwei Jahrgänge, ist sie zu grob geschnitten, oder eines ihrer
Ziele mischt zwei Niveaus. Der erste Fall liegt vor: Die beiden Ziele der
Physik-Einheit zur gleichmäßig beschleunigten Bewegung stehen in Bayern in
Ph8.3 und Ph10.3.

Verteilt ein Land eine größere fachliche Einheit auf mehrere Planeinheiten,
ist sie in seinem Plan keine Einheit; ihre Untereinheiten sind es.

### 7.2 Die Kontrolle braucht nur Einheiten

Ist E3 für die fachlichen Einheiten erfüllt, sagen ihre `after` alles, was ein
Plan wissen muss. Für jedes Land bleibt eine Regel auf Einheitenebene:

> Liegt die fachliche Einheit u nach v, dann steht u in derselben Planeinheit
> wie v oder in einer, die nach der von v liegt.

Das ist E2 im Plan des Landes. Die Kontrolle liest kein einzelnes Ziel. Sie
zeigt den Widerspruch dort, wo er entsteht: zwischen zwei benannten Einheiten
und zwei benannten Planeinheiten.

Die Pläne der 16 Länder kontrollieren damit auch die fachlichen `after`. Lehren
mehrere Länder eine Einheit vor der anderen, obwohl ein `after` das Gegenteil
erklärt, spricht das gegen dieses `after` und den Bedarf dahinter: Die Einheit
braucht die andere nicht, oder diese Länder lehren eine schwächere Fassung.

### 7.3 Fächerauswahl und Zusatzbedarf

Eine Fächerauswahl mit Kursprofilen bestimmt, welche fachlichen Einheiten der
Plan enthält. Der **Zusatzbedarf** einer Auswahl sind die Einheiten außerhalb
der Auswahl, aus denen ein gewähltes Ziel etwas braucht.

Eine Kombination ist fair, wenn ihr Zusatzbedarf benannt und als Vorbereitung
in den Plan aufgenommen wird, jeweils vor der ersten Einheit, die ihn braucht.
Das ist immer möglich; die Frage ist nur, wie groß er ist. In Hessen bauen
16 Ziele des Physik-Leistungskurses auf der Kettenregel auf und 17 auf dem
natürlichen Logarithmus. Beides ist dort Lernziel im Mathematik-Leistungskurs
und nicht im Grundkurs.

Angezeigt wird der Zusatzbedarf in Einheiten. In den Lernumfang kommen weiter
nur die gebrauchten Ziele (Entscheidung vom 10. November).

## 8. Was eine Voraussetzung bedeutet

> Eine Voraussetzung sagt, was vorher gelernt sein muss, damit das Ziel in
> seiner beschriebenen Form erreichbar ist. Sie sagt nicht, worauf ein Inhalt
> fachlich beruht oder womit er später begründet wird.

Wird ein Gegenstand zuerst phänomenologisch und später streng behandelt, sind
das zwei Ziele. Das strenge baut auf dem phänomenologischen auf, nie
umgekehrt. Zeigt eine Voraussetzung vom früheren auf das spätere Ziel,
beschreibt sie das Fundament und nicht den Lernweg.

Jeder Verstoß gegen E2 wird am Fall beurteilt. Er hat vier mögliche
Auflösungen:

| Auflösung | Wann | Was sich ändert |
| --- | --- | --- |
| Voraussetzung korrigieren | Das frühere Ziel braucht das spätere nicht, oder es braucht ein früheres Gegenstück. | eine Kante |
| Ziel oder Einheit teilen | Ein Ziel mischt eine phänomenologische und eine strenge Fassung. | Ziele und ihre Reviews |
| Im Plan vorziehen | Der Lehrplan des Landes sieht die Grundlage früher vor, als unser Plan sie führt. | nur der Plan des Landes |
| Als Vorbereitung einbinden | Der Lehrplan braucht die Grundlage früher, ohne sie zu führen. | nur der Plan des Landes, gekennzeichnet |

Welche zutrifft, entscheidet die Fachprüfung am Beleg. Die beiden letzten
ändern kein Ziel.

### Konkrete Fälle

Die Einschätzungen sind vorläufig; die Fachprüfung entscheidet (F5).

Über acht Kanten greift die Physik der Sekundarstufe I in Mathematik, die
dasselbe Land nur unter der Sekundarstufe II führt:

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

## 9. Der heutige Bestand

Alle Zahlen stammen aus Erkundungsrechnungen vom 14. November 2026 auf dem
kanonischen Katalog und den Ländersichten. Sie verwenden die normative
Voraussetzungsrelation. Die Abschnitte der Sichten stehen stellvertretend für
Planeinheiten; Stufen, Jahrgänge und Phasen sind am Titel erkannt. Die Skripte
sind nicht eingecheckt. Die Zahlen zeigen Größenordnungen, sie sind kein
Gate-Ergebnis.

### 9.1 Früheres braucht Späteres

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

### 9.2 Zwischen den Fächern

In jedem der 16 Länder brauchen 32 bis 74 der 115 bis 146 Physikziele der
Sekundarstufe I Mathematik, die die Mathematiksicht desselben Landes nur unter
der Sekundarstufe II führt. Dahinter stehen die acht Kanten aus Abschnitt 8
und zwei Mathematikziele. Über weitere 30 Kanten greift die Physik der
Sekundarstufe I in Mathematikziele, die die Mathematiksicht des Landes gar
nicht führt.

### 9.3 Physik-Leistungskurs mit Mathematik-Grundkurs

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

### 9.4 Cluster, Einheiten und Prüfungen

| Befund | Mathematik | Physik |
| --- | --- | --- |
| Cluster mit Voraussetzung | 0 | 0 |
| Cluster, die Fachziele und Prüfungen als direkte Kinder enthalten | 0 | 0 |
| Cluster nur mit Prüfungen | 18 | 10 |
| Prüfungen | 166 | 157 |
| Gewöhnliche Ziele, die eine Prüfung direkt oder über Zwischenschritte voraussetzt | 807 von 807 | 413 von 478 |
| Prüfungen im selben Cluster wie eine ihrer direkten Voraussetzungen | 0 | 0 |
| Atomare Ziele mit mehreren Eltern | 75 | 19 |
| Gewöhnliche Ziele ohne Einheit | 801 | 476 |

Die eigenen Ziele der drei vorhandenen Einheiten liegen in zwei bis drei
Clustern: die Fachziele in einem Themencluster, die Prüfungen in einem
Prüfungscluster. Ihre Fachziele sind nur ein Teil der direkten Kinder ihres
Themenclusters: 5 von 19, 1 von 4 und 2 von 8. Für jede dieser Einheiten kommt
deshalb ein Cluster hinzu, der ihre Fachziele und ihre Prüfungen enthält. Ob
die Prüfungen dafür umziehen oder den Cluster der Einheit als weiteren
Elterncluster bekommen, klärt der Trockenlauf (F1).

In Physik setzt keine Prüfung 65 gewöhnliche Ziele voraus. Sie können erst in
eine Einheit, wenn eine Prüfung sie abdeckt.

### 9.5 Voraussetzungen auf Prüfungen

| Fach | Gewöhnliche Ziele, die eine Prüfung voraussetzen | Vorausgesetzte Prüfungen | Kanten |
| --- | --- | --- | --- |
| Physik | 10 | 8 | 80 |
| Chinesisch | 12 | 8 | 24 |
| Informatik | 24 | 4 | 24 |
| Französisch | 12 | 7 | 21 |
| Griechisch | 12 | 7 | 21 |
| Mathematik und die übrigen 15 Fächer | 0 | 0 | 0 |

In Physik setzen die zehn Ziele des Clusters „Biophysik: Auge, Ohr und
neuronale Signalleitung“ jeweils dieselben acht Prüfungen des Clusters
„Übungen Q1“ voraus, das Ziel zum Linsenauge also auch die Prüfung zum
RC-Kreis. So pauschal beschreibt eine Kante eher die Reihenfolge des Plans als
einen Bedarf. Dafür gibt es `after`; die Fachprüfung beurteilt diese Kanten
mit (F5).

### 9.6 Wie groß die Verdrahtung ist

Nimmt man probeweise die heutigen Themencluster als Einheiten und lässt die
Prüfungen beiseite:

| | Mathematik | Physik |
| --- | --- | --- |
| Themencluster mit Fachzielen | 215 | 105 |
| Abgeleitete Abhängigkeiten zwischen ihnen | 445 | 233 |
| Nötige erklärte `after` (sparsam nach E4) | 257 | 120 |
| Cluster, die sich gegenseitig brauchen | 46 in 16 Gruppen | 24 in 10 Gruppen |

Dazu kommen 133 Abhängigkeiten von 61 Physikclustern zu 36
Mathematikclustern. Die Verdrahtung ist also klein, gut eine Aussage je
Einheit. Rund 70 Cluster können so, wie sie geschnitten sind, keine Einheiten
sein.

### 9.7 Voraussetzungen an Clustern

| | Kanonischer Gymnasialkatalog | Übrige untersuchte Landschaften |
| --- | --- | --- |
| Landschaften | 21 | 526 |
| Cluster | 1.029 | 7.974 |
| Cluster mit Voraussetzung | 0 | 1.779 in 525 Landschaften |
| davon mit Voraussetzung auf ein eigenes Kind | 0 | 518 |
| Voraussetzungen atomarer Ziele auf Cluster | 0 | 59 |

Die übrigen Landschaften sind Hochschulen, die weiteren bayerischen
Schulformen und Sprachen; die zurückbehaltenen Länderquellen des Gymnasiums
sind nicht mitgezählt. Im kanonischen Katalog wirkt die Vererbung also nicht
mehr, im Übergangsbestand trägt sie das Verhalten.

Die Vererbung rechnen heute der Voraussetzungscompiler, der Lernumfang und die
Frontier im Backend, die Lernkarte und die Graphansichten der Oberfläche sowie
die Curriculum-Werkzeuge einschließlich des Minimalitätsprüfers. `CQR-001`
weist jede Voraussetzung an einem Cluster zurück. Im eingefrorenen
Reduktionsnachweis betreffen 71 der 1.361 Übertragungen Cluster.

### 9.8 Woran die Folgearbeiten hängen

| Befund | Zahl |
| --- | --- |
| Ländersichten | 88 in Mathematik, 69 in Physik |
| Physiksichten, die die Ziele des Clusters „E.1 Bewegungen und ihre Beschreibung“ einzeln aufzählen | 65 von 69 |
| Mathematiksichten zum Cluster „Zahlenverständnis und Grundoperationen aufbauen“ | 29 als Teilbaum, 25 mit einzeln aufgezählten Zielen, 34 ohne |
| Programme, die den Einheitenvertrag vom 12. November lesen | gut 20 Skripte der Curriculum-Werkzeuge, rund 20 Python-Skripte der Paketkette, 3 Backend-Klassen, 8 Vertragsdateien |
| Regeln der Graph-Definition | 145, davon 15 zu Einheiten und 11 zur Planung |

Ein Clusterobjekt trägt Titel und Beschreibung in zwei Sprachen,
Anwendbarkeit, Gewicht und Dimensionsmerkmale. Jede Änderung an einer
kanonischen Fachdatei zieht außerdem eine bekannte Kette nach sich:
Bindungshashes, feste Zählwerte in Tests, die Paketkette und die
Statusberichte. Weicht die Anwendbarkeit eines Clusters von der seiner Kinder
ab, fällt Mathematik im Status von M7 auf M4.

## 10. Folgearbeiten

### 10.1 Was sich ändert

| Bereich | Änderung |
| --- | --- |
| Graph-Definition | §2: `after` neben `requires`. §11: Einheiten als erklärte Cluster, die Stufung Cluster, Einheit und Einheit mit Prüfungen, Planeinheiten. §11.5: Regeln E2 bis E4; das offene Zugangsprofil entfällt. §12: Der Reihenfolgefehler wird für Planeinheiten ein Verstoß gegen E2. §13: R4 wird E1; R1 bis R5 bleiben. Dazu Regelregister, `AGENTS.md`, Glossar und Entwurfsbogen. |
| Einheitenvertrag | Die Platzierungen `own` und das Elternfeld entfallen. Der Einheiteneintrag zeigt auf seinen Cluster und trägt `after`; Planeinheiten werden je Land erklärt. Das wird Vertrag 1.3. |
| `contains`-Hierarchie | Wo kein Cluster den Zuschnitt einer Einheit hat, kommt einer hinzu, der ihre Fachziele und Prüfungen enthält. Die übrigen Cluster gliedern weiter. Weil kein Cluster eine Voraussetzung trägt, ändert das keine Voraussetzung. |
| Ländersichten | Sie ordnen fachliche Einheiten Planeinheiten zu. Heute zählen sie überwiegend einzelne Ziele auf. |
| Laufzeit | Die Lernweise „Einheit für Einheit“ kommt hinzu. |
| Stufe 3 | Die Anerkennungsrechnung bleibt. Ihr Vertrag und ihr Backend-Teil lesen Einheiten und bekommen dieselbe Vertragsversion 1.3 ([Vorlage zu Stufe 3](../../dev/learning-unit-recognition-runtime-proposal-2026-11-14.md)). |
| Oberfläche | Die Lernkarte zeigt Einheiten und atomare Ziele (Abschnitt 3.4), der Lernzielbaum die Gliederung, und die Fächerauswahl nennt den Zusatzbedarf. |

### 10.2 Die Arbeiten

| Nr. | Arbeit | Braucht vorher | Anhaltspunkt zum Umfang |
| --- | --- | --- | --- |
| F1 | Trockenlauf an zwei Blöcken auf einer Kopie des Katalogs: Einheiten als Cluster schneiden, ihre `after` vorschlagen, gegen die Pläne aller Länder prüfen und auszählen, was sich an Sichten, Clustern und Bindungen ändert | nichts | ein Block je Fach, kein Eingriff in den Katalog; prüft B3 und B13, bevor Daten geändert werden |
| F2 | Bericht „Früheres braucht Späteres“ als eingechecktes Werkzeug, mit erklärter Zuordnung der Sichtabschnitte zu Stufen, Jahrgängen und Phasen | nichts | 157 Sichten; ersetzt die Erkundungsrechnungen aus Abschnitt 9 |
| F3 | Lernkarte nach Abschnitt 3.4: Pfeile nur zwischen Einheiten und zwischen atomaren Zielen; Ziele ohne Einheit als Rahmen in der Reihenfolge der Sicht, Rückgriffe gekennzeichnet | nichts | klein bis mittel |
| F4 | Den Pfeil von Physik nach Mathematik in der Lernkarte des Product Owners klären. Kanonisch setzt kein Mathematikziel ein Physikziel voraus, und keine einzelne Ländersicht erzeugt ihn. | Bundesland und Kursprofil des Product Owners | klein |
| F5 | Fachprüfung der Ursachen, zusammen mit den Kanten zum [Wissenskontext](../../dev/knowledge-context-subject-review-2026-11-14.md) und den Voraussetzungen auf Prüfungen | F2 | rund 40 Ziele je Fach auf Stufenebene, 56 und 10 auf Jahrgangsebene, acht Kanten zwischen den Fächern, 80 Kanten auf Prüfungen in Physik; je geänderte Kante oder geändertes Ziel neue Reviews |
| F6 | Norm anpassen (Abschnitt 10.1) | nichts | zweisprachig; 26 Regeln zu Einheiten und Planung |
| F7 | Vertrag 1.3 für Einheiten als Cluster, `after` und Planeinheiten, zusammen mit den Vertragsinhalten der Stufe 3 | F6 | Schema, Paketvertrag, FWU-OWL-Träger, Feldregister |
| F8 | Werkzeuge umstellen: Validator mit E1 bis E4, gemeinsame Fälle, Paketvalidator, Backend-Lader, Bindungsprojektion, Prüfungswerkzeug, Referenzrechnung der Anerkennung | F7 | Programme aus Abschnitt 9.8 |
| F9 | Die drei vorhandenen Einheiten umstellen | F1, F8 | drei Einheiten; Bindungskette je Fach |
| F10 | Planeinheiten je Land erklären, Sichten darauf beziehen, über Fächer hinweg prüfen, Zusatzbedarf anzeigen | F8 | 16 Länder, G8 und G9, 157 Sichten |
| F11 | Stufe 4 und 5: Einheiten schneiden, ihre `after` erklären, Sichten umstellen | F9, F10 | 801 und 476 gewöhnliche Ziele ohne Einheit |
| F12 | Stufe 3: Backend und Oberfläche der Anerkennung | F8 und die Entscheidungen der Vorlage zu Stufe 3 | wie dort beschrieben |
| F13 | Lernweise „Einheit für Einheit“: Einstellung mit Voreinstellung, Auswahl im Backend, Reihung im Lernplan, Anzeige | F8 | Auswahl des nächsten Ziels im Lernplandienst des Backends |

### 10.3 Reihenfolge

1. **Sofort:** F1 bis F4 und F6. Der Trockenlauf prüft die Beschlüsse zum
   Zuschnitt an echten Daten, bevor etwas geändert wird.
2. **Ein Strang für Vertrag und Werkzeuge:** F7 bis F9. Die Fachprüfung F5
   läuft daneben.
3. **Danach die Fläche:** F10, dann F11. F12 und F13 können beginnen, sobald
   F8 fertig ist.

Die Regeln werden schrittweise zum Gate: zuerst der Bericht, dann die Behebung
der Ursachen, dann eine Sperrklinke, die keinen neuen Verstoß zulässt. Ein
hartes Gate gibt es erst bei null Verstößen.

### 10.4 Was sich nicht ändert

- Der Bedarf steht nur zwischen atomaren Zielen, ist kreisfrei und transitiv
  minimal.
- Frontier, Lernumfang, gespeicherte Ergebnisse und die Anerkennungsregel
  bleiben, wie sie sind.
- Der Wissenskontext eines Ziels wird weiter aus den atomaren Voraussetzungen
  abgeleitet.
- An den Anbieterspuren ist nichts zu tun.
- Der Übergangsbestand außerhalb des Gymnasialkatalogs bleibt, wie er ist.
- Die übrigen 19 kanonischen Fächer folgen nach Mathematik und Physik.
