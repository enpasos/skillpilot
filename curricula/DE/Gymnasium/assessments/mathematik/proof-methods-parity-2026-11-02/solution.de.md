# Beispiel einer vollständigen Lösung

Dies ist ein möglicher Lösungsweg. Die aufgeführten Alternativen sind nicht abschließend; eine vollständige gültige Begründung pro gefordertem Teil genügt.

## A. Kontraposition

Für eine beliebige ganze Zahl $n$ bezeichne $A$ die Aussage „$n^2$ ist gerade“ und $B$ die Aussage „$n$ ist gerade“. Die Kontraposition lautet $\neg B\Rightarrow\neg A$, hier also:

> Ist $n$ ungerade, dann ist $n^2$ ungerade.

Bei ganzen Zahlen ist „nicht gerade“ gleichbedeutend mit „ungerade“. Sei daher $n=2k+1$ mit $k\in\mathbb Z$. Dann gilt

$$n^2=(2k+1)^2=4k^2+4k+1=2(2k^2+2k)+1.$$

Da $2k^2+2k$ ganzzahlig ist, ist $n^2$ ungerade. Damit ist die Kontraposition für alle ganzen $n$ bewiesen. Gleichwertig kann man für ungerades $n$ mit $n\equiv1\pmod2$ und daraus $n^2\equiv1\pmod2$ argumentieren oder eine andere Darstellung ungerader Zahlen benutzen.

### Warum reicht das für die Ausgangsaussage?

Eine Implikation $A\Rightarrow B$ ist genau dann falsch, wenn $A$ wahr und $B$ falsch ist. Die Kontraposition $\neg B\Rightarrow\neg A$ ist genau dann falsch, wenn $\neg B$ wahr und $\neg A$ falsch ist, also ebenfalls genau bei $A$ wahr und $B$ falsch. Beide Implikationen haben deshalb unter jeder Wahrheitsbelegung denselben Wahrheitswert und sind logisch äquivalent. Weil die Kontraposition bewiesen ist, gilt somit auch die Ausgangsaussage.

Eine gleichwertige Begründung ist beispielsweise die vollständige Wahrheitstafel:

| $A$ | $B$ | $A\Rightarrow B$ | $\neg B\Rightarrow\neg A$ |
|---|---|---|---|
| wahr | wahr | wahr | wahr |
| wahr | falsch | falsch | falsch |
| falsch | wahr | wahr | wahr |
| falsch | falsch | wahr | wahr |

Die letzten beiden Spalten stimmen in allen vier Fällen überein. Ebenso genügt eine erklärte Umformung

$$(A\Rightarrow B)\ \equiv\ (\neg A\lor B)\ \equiv\ (B\lor\neg A)\ \equiv\ (\neg B\Rightarrow\neg A).$$

Keine dieser drei Äquivalenzbegründungen muss zusätzlich zu einer anderen wiederholt werden. Die Umkehrung $B\Rightarrow A$ ist nicht die Kontraposition. Dass in diesem Zahlenbeispiel auch die Umkehrung wahr ist, macht einen bloßen Beweis der Umkehrung nicht zum verlangten Kontrapositionsbeweis.

## B. Vollständige Fallunterscheidung

Jede ganze Zahl ist gerade oder ungerade. Diese zwei Fälle decken daher ganz $\mathbb Z$ ab.

**Fall 1: $n$ ist gerade.** Dann ist $n=2k$ mit einem $k\in\mathbb Z$. Somit

$$n(n+1)=2k(2k+1)=2\bigl(k(2k+1)\bigr).$$

Der Klammerausdruck ist ganzzahlig; das Produkt ist gerade.

**Fall 2: $n$ ist ungerade.** Dann ist $n=2k+1$ mit einem $k\in\mathbb Z$. Somit

$$n(n+1)=(2k+1)(2k+2)=2\bigl((2k+1)(k+1)\bigr).$$

Auch dieser Klammerausdruck ist ganzzahlig; das Produkt ist gerade.

In jedem der vollständigen Fälle ist das Produkt gerade. Also gilt die Behauptung für alle ganzen Zahlen, einschließlich null und negativer Zahlen. Eine zusätzliche Einzelprüfung dieser Zahlen ist nach dem allgemeinen Beweis nicht nötig.

Eine gleichwertige knappe Lösung erklärt: Ist $n$ gerade, ist es selbst der gerade Faktor. Ist $n$ ungerade, ist $n+1$ gerade. Ein gerader ganzzahliger Faktor macht das Produkt gerade. Zusammen mit der Vollständigkeit dieser Fälle genügt das ohne Ausmultiplizieren. Andere vollständige Überdeckungen, etwa vier Restklassen modulo 4, sind ebenfalls zulässig, wenn jeder Fall allgemein behandelt wird. Fälle müssen alle Möglichkeiten abdecken; paarweise Disjunktheit ist keine zusätzliche Voraussetzung des Lernzielvertrags.

## Bewertung und faire Fehlerbehandlung

Die zehn Kriterien der zugehörigen Rubrik ergeben jeweils 0, 1 oder 2 BE. Insgesamt sind 20 BE erreichbar; ab 12 BE ist die Prüfung bestanden. Zuerst werden die sachlich verdienten Einzelpunkte addiert. Nur wenn mindestens eine der folgenden zentralen Handlungen **ganz fehlt oder konzeptionell verfehlt** ist, wird derselbe Gesamtscore anschließend auf höchstens 11 BE begrenzt:

- ein erkennbarer allgemeiner Beweis der richtigen Kontraposition in A;
- eine inhaltliche logische Äquivalenzbegründung in A; bloße Berufung auf den Methodennamen genügt nicht;
- eine vollständige Fallüberdeckung mit allgemeinen Argumenten für die Fälle in B.

Eine richtige Methodenbezeichnung ist nicht entscheidend: Der Inhalt der Begründung zählt. Eine anderweitig bezeichnete Lösung erhält den gleichen Kredit, wenn sie tatsächlich die richtige Kontraposition und deren Äquivalenz bzw. den vollständigen Fallbeweis ausführt. Auch ein Widerspruchsargument innerhalb eines ausdrücklich nachvollziehbaren Beweises der Kontraposition ist zulässig. Ein reiner anderer Beweis ohne die verlangte methodische Handlung erhält seine sachlich zutreffenden Einzelpunkte, ersetzt diese Handlung aber nicht.

Knappe natürliche Sprache, eine fehlende Schlusssatzformel trotz klaren allgemeinen Schlusses, oder das Fehlen eines bestimmten Musterlösungsformats rechtfertigen keinen Punktabzug. Die inhaltlich richtige vollständige Methode verlangt keine volle Punktzahl in jedem Kriterium. Ein isolierter Rechen-, Übertragungs- oder Schreibfehler wird am betroffenen Kriterium gewertet und löst keine automatische Kappung aus. Beispiel: Aus $(2k+1)^2$ wird versehentlich $4k^2+2k+1$; der Koeffizient ist falsch, der korrekt angelegte allgemeine Paritätsweg aber erkennbar. Nachvollziehbare, zum Fehler konsistente Folgearbeit wird weiter bewertet; derselbe Fehler wird nicht wiederholt abgezogen. Ein ungeklärter systematischer Fehlschluss, nur Zahlenproben, ein fehlender Fall oder ein bewusst zu enger Definitionsbereich wird dagegen nicht als isolierter Rechenfehler behandelt.

Die Kappung gehört zur normalen Rubrikbewertung dieses einen Gesamtscores. Sie erzeugt keinen zweiten Teilpass, keine Zusatzqualifikation und keinen neuen Lernzustand. Nach der Bewertung gibt der Coach die Einzelpunkte, gegebenenfalls die Kappung mit konkretem Grund und gezieltes fachliches Feedback zurück.
