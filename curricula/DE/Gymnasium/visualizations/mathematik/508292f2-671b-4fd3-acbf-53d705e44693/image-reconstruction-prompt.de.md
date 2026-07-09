# Bildrekonstruktionsprompt: Bedingte Wahrscheinlichkeiten mit Baumdiagrammen und Vierfeldertafeln bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `508292f2-671b-4fd3-acbf-53d705e44693`
- Titel: Bedingte Wahrscheinlichkeiten mit Baumdiagrammen und Vierfeldertafeln bestimmen
- Beschreibung: Die lernende Person kann bedingte Wahrscheinlichkeiten in Sachzusammenhängen erkennen und sie mit Baumdiagrammen sowie Vier- oder Mehrfeldertafeln bestimmen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `508292f2-671b-4fd3-acbf-53d705e44693.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, lehrreiches Diagramm im Cartoon-Stil auf einem sehr hellbeigen Hintergrund mit leichter Papiertextur. Alle Texte sind schwarz, fett und in einer abgerundeten, serifenlosen Schriftart gehalten.

Oben mittig steht der große Titel: "Bedingte Wahrscheinlichkeiten mit Baumdiagrammen und Vierfeldertafeln bestimmen".

Darunter, horizontal aufgeteilt, befinden sich zwei Hauptbereiche:

**Linker Bereich: Baumdiagramm**
*   Über dem Diagramm, mittig auf einem hellgrünen Textmarker-Hintergrund, steht der Titel "Baumdiagramm".
*   Das Diagramm ist auf einer unregelmäßigen, weichen, hellgrünen Form platziert.
*   Es zeigt eine baumartige Struktur mit braunen Ästen.
*   Der erste Verzweigungspunkt teilt sich in zwei Äste:
    *   Der obere Ast führt zu einem runden, mittelgrünen Knoten mit dem Buchstaben "A". Darunter steht in Klammern "(Ereignis A)". Links neben diesem Ast steht "P(A)".
    *   Der untere Ast führt zu einem runden, mittelgrünen Knoten mit dem Buchstaben "Ā". Darunter steht in Klammern "(Nicht A)". Links neben diesem Ast steht "P(Ā)".
*   Von jedem dieser Knoten (A und Ā) verzweigen sich wiederum zwei Äste zu blattförmigen, mittelgrünen Endknoten:
    *   Vom Knoten "A":
        *   Der obere Ast führt zu einem Blatt mit "B". Links neben diesem Ast steht "P(B|A)", umgeben von einem gelben Leuchten, und ein geschwungener Pfeil zeigt von Knoten "A" auf "P(B|A)".
        *   Der untere Ast führt zu einem Blatt mit "B̄". Links neben diesem Ast steht "P(B̄|A)". Rechts neben diesem Ast befindet sich ein kleiner hellblauer Taschenrechner, der auf eine hellgrüne Sprechblase mit der Aufschrift "Bedingte Wkt." zeigt.
    *   Vom Knoten "Ā":
        *   Der obere Ast führt zu einem Blatt mit "B". Links neben diesem Ast steht "P(B|Ā)".
        *   Der untere Ast führt zu einem Blatt mit "B̄". Links neben diesem Ast steht "P(B̄|Ā)". Rechts neben diesem Ast befindet sich ein weiterer kleiner hellblauer Taschenrechner, der auf eine hellgrüne Sprechblase mit der Aufschrift "Bedingte Wkt." zeigt.

**Rechter Bereich: Vierfeldertafel**
*   Über der Tabelle, mittig auf einem hellgrünen Textmarker-Hintergrund, steht der Titel "Vierfeldertafel".
*   Eine Tabelle mit abgerundeten Ecken und einem hellblauen Rand ist dargestellt. Die Zellen sind hellblau.
*   Die Kopfzeile der Tabelle enthält die Beschriftungen: "B", "B̄", "Summe".
*   Die erste Spalte (Zeilenköpfe) enthält die Beschriftungen: "A", "Ā", "Summe".
*   Die Zelleninhalte sind:
    *   Zelle (A, B): "P(A∩B)" mit gelbem Hintergrund.
    *   Zelle (A, B̄): "P(A∩B̄)"
    *   Zelle (A, Summe): "P(A)" mit gelbem Hintergrund.
    *   Zelle (Ā, B): "P(Ā∩B)"
    *   Zelle (Ā, B̄): "P(Ā∩B̄)"
    *   Zelle (Ā, Summe): "P(Ā)" mit gelbem Hintergrund.
    *   Zelle (Summe, B): "P(B)"
    *   Zelle (Summe, B̄): "P(B̄)"
    *   Zelle (Summe, Summe): "1"
*   Rechts neben der Zelle "P(Ā)" befindet sich ein kleiner hellblauer Taschenrechner, der auf eine hellgrüne Sprechblase mit der Aufschrift "Benötigte Werte für P(B|A)" zeigt. Die gelben Hintergründe in den Zellen "P(A∩B)" und "P(A)" deuten auf die benötigten Werte hin.

**Verbindungselemente in der Mitte**
*   Zwischen dem Baumdiagramm und der Vierfeldertafel befindet sich ein hellblauer Pfeil, der von links nach rechts zeigt. In der Mitte des Pfeils ist ein graues Zahnrad-Symbol.
*   Über dem Pfeil steht der Text, zweizeilig: "Bestimmen durch Verknüpfung & Quotientenbildung".
*   Unter dem Pfeil ist ein abgerundetes, hellgrünes Rechteck mit einem dunkelgrünen Rand. Darin steht die mathematische Formel: "P(B|A) = P(A∩B) / P(A)".

**Text am unteren Rand**
*   Ganz unten, mittig zentriert, steht ein erklärender Satz: "Erkennen und Berechnen in Sachzusammenhängen. Nutzen Sie Baumdiagramme zur Visualisierung bedingter Pfade und Vierfeldertafeln für die Gesamtübersicht."
```
