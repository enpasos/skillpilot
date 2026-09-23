# Bildrekonstruktionsprompt: Vierfeldertafeln interpretieren

## SkillPilot-Ziel

- SkillPilot-ID: `52e57eb5-7cd1-5df0-a8c6-7b090f097d9f`
- Titel: Vierfeldertafeln interpretieren
- Beschreibung: Die lernende Person kann Vier- bzw. Mehrfeldertafeln aus Sachtexten erstellen, absolute und relative Häufigkeiten eintragen und gemeinsame sowie bedingte Wahrscheinlichkeiten an konkreten Beispielen ablesen.

## Generator

- Provider: OpenAI / ChatGPT-Codex image generation
- Quellbild: `52e57eb5-7cd1-5df0-a8c6-7b090f097d9f.png`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Erzeuge eine eigenständige deutsche Lerninfografik als PNG im breiten Querformat, ungefähr 16:9. Das Bild muss ohne Referenzbild verständlich und rekonstruierbar sein. Freundlicher, klarer, abstrakter Comic-Lernplakatstil: hellblauer Hintergrund mit etwas dunklerem blauem Außenrand und weißem abgerundetem Innenrahmen. Kräftige schwarze, angenehm runde, handschriftnahe Schrift; deutliche schwarze Tabellenlinien. Großzügige Abstände, gelbe linke und grüne rechte Tabelle. Keine Fotorealistik, technischen IDs, URLs, Dateinamen, Logos oder Wasserzeichen.

Oben zentrierter Titel: „Vierfeldertafeln interpretieren“.

Obere Bildhälfte: zwei nebeneinander stehende Vierfeldertafeln, getrennt durch eine dünne schwarze senkrechte Linie.

Links Überschrift „Absolute Häufigkeiten“. Spaltenüberschriften A, nicht A, Summe. Zeilenbeschriftungen B, nicht B, Summe. Exakt folgende Einträge:
- Zeile B: unter A 30, unter nicht A 20, Summe 50.
- Zeile nicht B: unter A 10, unter nicht A 40, Summe 50.
- Summenzeile: unter A 40, unter nicht A 60, Gesamtsumme 100.
Die linke Tabelle hat sanft gelbe Kopf- und normale Zellen; Zahlen dunkelblau. Zeilen-/Spaltenüberschriften schwarz.

Rechts Überschrift über zwei Zeilen „Relative Häufigkeiten (Wahrscheinlichkeiten)“. Dieselben Spalten- und Zeilenbeschriftungen. Exakt folgende Einträge:
- Zeile B: 0.30, 0.20, 0.50.
- Zeile nicht B: 0.10, 0.40, 0.50.
- Summenzeile: 0.40, 0.60, 1.00.
Die rechte Tabelle ist sanft grün, mit kräftig lesbaren Zahlen. Jeder rechte Wert entspricht dem linken Wert geteilt durch 100.

In BEIDEN Tafeln die gesamte Bezugszeile B dezent rosa/rot markieren. Links neben dieser Zeile ein rotes Klammerzeichen und gut lesbarer kleiner Hinweis „Bezugszeile B“. Das Zeilenlabel B darf nicht unlesbar verdeckt werden. In BEIDEN Tafeln die Bezugsspalte A dezent violett markieren und mit einer violetten Klammer sowie darunter der Beschriftung „Bezugsspalte A“ verbinden. Klammern und Text müssen außerhalb der Zahlen liegen. Die gemeinsame Zelle A∩B gehört zu beiden Markierungen; keine widersprüchlichen Zahlen und keine harte Überdeckung erzeugen. Die Randwerte sind Summen, keine zusätzlich zu zählenden Fälle: Zeile B hat 30+20=50 Fälle, Spalte A hat 30+10=40 Fälle.

Untere Bildhälfte: drei nebeneinander stehende abgerundete Erklärungskarten. Keine langen Pfeile von einer bedingten Wahrscheinlichkeit nur zu einer einzelnen Innen- oder Randzelle.

1. Linke Karte blau umrandet, hellblau gefüllt. Überschrift auf dunklerem blauem Band „Gemeinsam“. Darunter groß:
P(A ∩ B) = 30/100 = 0,30.
30/100 als gut lesbaren echten Bruch mit 30 über 100 setzen.
Kleiner Erklärungstext:
„Anteil der Fälle, in denen
A und B gleichzeitig eintreten.“

2. Mittlere Karte rot umrandet, hellrosa gefüllt. Überschrift auf dunkelrotem Band „Unter den 50 B-Fällen“. Darunter:
P(A | B) = 30/50 = 0,60.
30/50 als echten Bruch setzen.
Erklärung:
„Anteil der A-Fälle
unter allen B-Fällen
(Bezugsgruppe: 50).“

3. Rechte Karte violett umrandet, hellviolett gefüllt. Überschrift auf dunklerem violettem Band „Unter den 40 A-Fällen“. Darunter:
P(B | A) = 30/40 = 0,75.
30/40 als echten Bruch setzen.
Erklärung:
„Anteil der B-Fälle
unter allen A-Fällen
(Bezugsgruppe: 40).“

Alle Formeln müssen in ihren Karten vollständig und groß lesbar bleiben. Bedingungsstrich | und Schnittzeichen ∩ unterscheiden. In den Tabellen Dezimalpunkte wie oben angegeben, in den drei Karten die angegebenen Dezimalkommas verwenden; das sind dieselben Werte. Die rechte Tabelle veranschaulicht die Wahrscheinlichkeiten bei zufälliger gleichwahrscheinlicher Auswahl aus den 100 Fällen; keine automatische Gleichsetzung einer beliebigen Stichprobenhäufigkeit mit einer unbekannten Populationswahrscheinlichkeit behaupten.

Erhalte die zugängliche farbige Plakatsprache und die klare Paarung von absoluter und relativer Tafel. Keine Zusatzaufgaben oder weiteren Tabellen. Dies ist eine vollständige Rekonstruktionsanweisung für einen anschließend neu zu prüfenden Kandidaten, keine Freigabe oder Importanweisung.
```
