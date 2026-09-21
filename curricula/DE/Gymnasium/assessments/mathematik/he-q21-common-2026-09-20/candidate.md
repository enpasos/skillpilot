# HE Q2.1: gemeinsame lokale Assessment-Kandidaten

Stand: 20. September 2026. Autorenkandidaten; noch keine unabhängige Freigabe.

Quelle: HMKB Kerncurriculum Mathematik gymnasiale Oberstufe 2024,
Q2.1, S. 40, grundlegendes Niveau (GK und LK), Spiegelstriche 1–3.
Eigenständig verfasste Übungsaufgaben, keine amtlichen Prüfungsaufgaben.
Neue Inhalte werden nicht ergänzt; die Endpunkte prüfen zehn bereits bestehende
Inhaltsziele. Die separate Scope-/Kantenentscheidung ist im B049-Reparaturbeleg
vom selben Datum dokumentiert.

## Kehrwertpotenzen und Quadratwurzel vergleichen

Lernziel-ID: `bbb340ed-1009-4966-ae96-bfea4437505a`.

Abdeckung / direkte Voraussetzungen:

- `61686d85-0301-550e-bab9-bd9411c3e7ce`
- `5dabf0b3-89b1-59a6-ae57-014f92becd3b`
- `6517427b-cf4e-5ebf-9a76-e1035617687c`

### Aufgabe

Vergleiche die Funktionen $r_1(x)=1/x$, $r_2(x)=1/x^2$ und $w(x)=\sqrt{x}$.

1. Gib Definitions- und Wertemenge an. Skizziere die Graphen mit charakteristischen Punkten und begründe vorhandene Symmetrien. Beschreibe bei den Kehrwertfunktionen das Verhalten beiderseits von $x=0$ und für große positive bzw. negative $x$. Erläutere, warum $x=0$ für $w$ keine Polstelle ist. (8 BE)
2. Übertrage deine Aussagen auf $r_n(x)=1/x^n$ mit positiver ganzer Zahl $n$. Welche Eigenschaften hängen davon ab, ob $n$ gerade oder ungerade ist? (4 BE)
3. Bestimme die Ableitungen von $r_n$ und $w$ auf den zulässigen Bereichen. Begründe die Schritte durch Potenzschreibweise und Potenzregel. Erkläre mit dem rechtsseitigen Differenzenquotienten, weshalb $w$ bei $x=0$ keinen endlichen Ableitungswert besitzt. (6 BE)

### Lösung und Bewertung

1. Für $r_1$ gilt $D=W=\mathbb R\setminus\{0\}$; der Graph ist punktsymmetrisch zum Ursprung. Für $r_2$ gilt $D=\mathbb R\setminus\{0\}$ und $W=(0,\infty)$; der Graph ist y-achsensymmetrisch. Punkte $(1|1)$ sowie $(-1|-1)$ bzw. $(-1|1)$ sichern die Skizzen. Bei $x\to0^+$ wachsen beide Funktionen unbegrenzt; bei $x\to0^-$ fällt $r_1$ gegen $-\infty$, während $r_2$ gegen $+\infty$ wächst. Bei $|x|\to\infty$ nähern sich die Werte null. Asymptoten sind $x=0$ und $y=0$. Für $w$ gilt $D=W=[0,\infty)$; der Graph wächst und enthält $(0|0)$, $(1|1)$ und $(4|2)$. Er ist weder y-achsen- noch ursprungssymmetrisch. Für $x\to0^+$ gilt $w(x)\to0$; deshalb liegt keine Polstelle vor.

2. Für jedes positive ganze $n$ gilt $D(r_n)=\mathbb R\setminus\{0\}$. Bei ungeradem $n$ gelten die Symmetrie, Wertemenge und einseitigen Grenzwerte von $r_1$, bei geradem $n$ diejenigen von $r_2$. Bei $|x|\to\infty$ gilt stets $r_n(x)\to0$.

3. Aus $r_n(x)=x^{-n}$ folgt $r_n'(x)=-n x^{-n-1}$ für $x\ne0$. Aus $w(x)=x^{1/2}$ folgt $w'(x)=1/(2\sqrt{x})$ für $x>0$. Am Rand $0$ ist der rechtsseitige Differenzenquotient $\sqrt{h}/h=1/\sqrt{h}$ für $h>0$ nach oben unbeschränkt; ein endlicher Ableitungswert existiert dort nicht.

Bewertung: Teil 1: D/W der Kehrwertfunktionen 2 BE, deren Skizzen/Symmetrien 2 BE, Polstellen und Verhalten im Unendlichen 2 BE, Wurzelfunktion einschließlich Skizze und Abgrenzung der Polstelle 2 BE. Teil 2: Definitionsbereich 1 BE, Unterscheidung gerade/ungerade einschließlich W/Symmetrie/Polverhalten 2 BE, gemeinsames Fernverhalten 1 BE. Teil 3: Ableitung r_n mit Begründung und Bereich 2 BE, Ableitung w mit Begründung und Bereich 2 BE, Randargument bei null 2 BE. Fachlich gleichwertige Darstellungen sind zulässig.

Gesamt: 18 BE; Bestehensschwelle: 9 BE.
Eine bestandene Aufgabe ist kein automatischer Einzelnachweis jedes abgedeckten Inhaltsziels.

## Einen unbekannten Graphen gezielt umformen

Lernziel-ID: `46bb8422-a822-46e1-8bcc-8b6475994b3a`.

Abdeckung / direkte Voraussetzungen:

- `dd6c5e08-0cc6-53c0-b317-ebaba277c776`
- `772b11c9-1348-5ab9-bc3f-458c46b312b6`
- `a12bef54-7595-5f48-a7a8-9cfe1d8e9729`
- `4c6369b0-4b58-5ac0-915c-82c348ae1c14`
- `62a1c6f2-1775-5a19-98e0-ed3dd722039f`

### Aufgabe

Eine auf $\mathbb R$ differenzierbare Funktion $f$ ist nicht durch einen Term vorgegeben. Ihr Graph enthält $P(0|1)$ und $Q(2|3)$. Betrachte $h(x)=-2f(-(x-1)/2)+3$.

1. Leite her, wohin ein beliebiger Graphenpunkt $(u|v)$ von $f$ übergeht. Bestimme die Bildpunkte von $P$ und $Q$ und stelle die ursprünglichen Punkte und ihre Bildpunkte in einem Koordinatensystem dar. Erläutere eine korrekte Reihenfolge der Verschiebungen, Streckungen und Spiegelungen in beiden Koordinatenrichtungen. Erkläre den Zusammenhang der beiden Achsenspiegelungen mit einer Punktspiegelung. (8 BE)
2. Jemand liest den inneren Faktor $-1/2$ als horizontale Stauchung auf die Hälfte. Prüfe das anhand deiner Punktabbildung. Welche horizontale Wirkung hätte stattdessen $k(x)=-2f(-2(x-1))+3$? (3 BE)
3. Zusätzlich sei $f$ gerade. Begründe die Symmetrieachse von $h$ und anhand gespiegelter Tangentensteigungen die Symmetrie des Graphen von $h'$. Skizziere dazu einen möglichen geraden differenzierbaren Graphen durch $P$ und $Q$ und seinen nach der Vorschrift transformierten Graphen; markiere Symmetrieachse und entsprechende Punkte. (7 BE)

### Lösung und Bewertung

1. Aus $u=-(x-1)/2$ folgt $x=1-2u$, und der neue Funktionswert ist $3-2v$. Daher gilt $(u,v)\mapsto(1-2u,3-2v)$, also $P\mapsto(1,1)$ und $Q\mapsto(-3,-3)$. Diese vier Punkte sind korrekt einzuzeichnen. Horizontal: Spiegelung an der y-Achse und Streckung mit Faktor 2, danach Verschiebung um 1 nach rechts. Vertikal: Spiegelung an der x-Achse und Streckung mit Faktor 2, danach Verschiebung um 3 nach oben. Beide Achsenspiegelungen zusammen bilden $(u,v)\mapsto(-u,-v)$, die Punktspiegelung am Ursprung; die abschließenden Verschiebungen sind davon zu unterscheiden.

2. Der Abstand zum späteren Zentrum $x=1$ wird verdoppelt, nicht halbiert. Bei $k$ ergibt $u=-2(x-1)$ dagegen $x=1-u/2$: horizontale Stauchung auf die Hälfte, Spiegelung und anschließende Verschiebung nach rechts.

3. Weil $f$ gerade ist, gilt $h(1+t)=-2f(-t/2)+3=-2f(t/2)+3=h(1-t)$. Somit ist $x=1$ Symmetrieachse. Die Tangenten an gespiegelten Stellen haben entgegengesetzte Steigungen: $h'(1+t)=-h'(1-t)$. Der Ableitungsgraph ist punktsymmetrisch zu $(1,0)$; insbesondere $h'(1)=0$. Ein mögliches Skizzenbeispiel ist $f(x)=x^2/2+1$ mit $h(x)=1-(x-1)^2/4$. Dazu gehören etwa die Punkte $(-2,3),(0,1),(2,3)$ auf $f$ und $(5,-3),(1,1),(-3,-3)$ auf $h$. Andere passende gerade differenzierbare Ausgangsgraphen sind ebenso richtig; ein Term muss nicht bestimmt werden. Die Skizze illustriert die vorher allgemein begründete Aussage.

Bewertung: Teil 1: allgemeine Punktabbildung 2 BE, Bildpunkte und korrekte grafische Darstellung 2 BE, Reihenfolge und Skalierungsrichtungen 2 BE, Spiegelungen einschließlich Punktspiegelung 2 BE. Teil 2: Widerlegung mit Abstandsfaktor 2 BE, Alternative k mit Faktor 1/2 und Spiegelung 1 BE. Teil 3: begründete Achse 2 BE, Tangentenargument und Punktsymmetrie der Ableitung 3 BE, passende Ausgangs- und Bildskizze 2 BE. Fachlich gleichwertige Lösungswege sind zulässig.

Gesamt: 18 BE; Bestehensschwelle: 9 BE.
Eine bestandene Aufgabe ist kein automatischer Einzelnachweis jedes abgedeckten Inhaltsziels.

## Eine Umkehrfunktion durch Einschränkung ermöglichen

Lernziel-ID: `1429363f-628f-4f42-80e5-8a9a935147cc`.

Abdeckung / direkte Voraussetzungen:

- `c15fe32d-1c83-4127-b1a4-9125af3d8f5d`
- `dbc13bb0-963b-49a8-a441-2183f4b64c8e`

### Aufgabe

Betrachte $p(x)=x^2$.

1. Jemand behauptet, $p$ mit Definitionsmenge $\mathbb R$ habe die Umkehrfunktion $\sqrt{x}$. Prüfe die Behauptung mit einem konkreten Gegenbeispiel und erkläre das Problem. (3 BE)
2. Beschränke $p$ auf $[0,\infty)$. Bestimme die Umkehrfunktion mit Definitions- und Wertemenge. Begründe, warum nun wirklich eine Umkehrfunktion vorliegt. (3 BE)
3. Skizziere den eingeschränkten Graphen und seinen Umkehrgraphen. Markiere die zueinander gehörenden Punkte für $x=0,1,2$ auf dem ursprünglichen Graphen und begründe die geometrische Beziehung. Welche Umkehrfunktion entstünde stattdessen bei der Einschränkung auf $(-\infty,0]$? Gib auch deren Definitions- und Wertemenge an. (4 BE)

### Lösung und Bewertung

1. Es gilt $p(2)=p(-2)=4$: Ein Funktionswert besitzt zwei Urbilder. Insbesondere ist $\sqrt{p(-2)}=2\ne-2$. Die Quadratwurzel ist also keine Umkehrfunktion der auf ganz $\mathbb R$ definierten Quadratfunktion.

2. Auf $[0,\infty)$ ist $p$ streng monoton steigend und bildet den Bereich auf $[0,\infty)$ ab. Aus $y=x^2$ und $x\ge0$ folgt $x=\sqrt{y}$. Die Umkehrfunktion lautet $p^{-1}(x)=\sqrt{x}$ mit $D=W=[0,\infty)$.

3. Die Punkte $(0,0),(1,1),(2,4)$ gehen in $(0,0),(1,1),(4,2)$ über. Der Koordinatentausch ist die Spiegelung an $y=x$; Definitions- und Wertemenge tauschen die Rollen. Die Skizze zeigt beide Halbgraphen und die Spiegelgerade. Auf $(-\infty,0]$ ist $p$ streng monoton fallend. Die Umkehrfunktion lautet dann $-\sqrt{x}$ mit $D=[0,\infty)$ und $W=(-\infty,0]$.

Bewertung: Teil 1: gleiches Bild zweier verschiedener Stellen 1 BE, konkrete Widerlegung der behaupteten Rückrichtung 1 BE, Erklärung der fehlenden Eindeutigkeit 1 BE. Teil 2: Umkehrterm 1 BE, korrekte Bereiche 1 BE, Begründung der Eindeutigkeit 1 BE. Teil 3: beide Graphen und passende Punkte 1 BE, begründeter Koordinatentausch bzw. Spiegelung 1 BE, negative Wurzel mit korrekten Bereichen und Begründung 2 BE. Fachlich gleichwertige Gegenbeispiele und Lösungswege sind zulässig.

Gesamt: 10 BE; Bestehensschwelle: 5 BE.
Eine bestandene Aufgabe ist kein automatischer Einzelnachweis jedes abgedeckten Inhaltsziels.
