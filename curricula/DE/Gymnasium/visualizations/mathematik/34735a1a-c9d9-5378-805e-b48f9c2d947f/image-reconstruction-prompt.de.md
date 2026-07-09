# Bildrekonstruktionsprompt: Bernoulli-Experimente und -Ketten beschreiben

## SkillPilot-Ziel

- SkillPilot-ID: `34735a1a-c9d9-5378-805e-b48f9c2d947f`
- Titel: Bernoulli-Experimente und -Ketten beschreiben
- Beschreibung: Die lernende Person kann Bernoulli-Experimente und Bernoulli-Ketten identifizieren, ihre Kenngrößen (Länge, Trefferwahrscheinlichkeit) angeben und die Formel $P(X = k) = \binom{n}{k} \cdot p^k \cdot (1 - p)^{n-k}$ aus einem passenden Beispiel heraus begründen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `34735a1a-c9d9-5378-805e-b48f9c2d947f.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, lehrreiches Infografik-Diagramm im Cartoon-Stil auf weißem Hintergrund. Der Haupttitel oben mittig ist in fettgedrucktem Schwarz: "Bernoulli-Experimente und -Ketten beschreiben".

Das Diagramm ist in drei vertikale Spalten unterteilt, jede mit einem blauen, abgerundeten, nach rechts zeigenden Pfeil als Überschrift und einem weißen Inhaltsbereich mit schwarzem Rand.

**Spalte 1: "Bernoulli-Experiment (Einzeldurchführung)"**
- Überschrift: Blauer Pfeil mit "Bernoulli-Experiment" (fett) und darunter "(Einzeldurchführung)" in Schwarz.
- Inhalt:
    - Eine Cartoon-Hand mit hellbrauner Haut und blauem Ärmel wirft eine goldene Münze mit einem Kopfprofil nach oben. Wellenlinien um die Münze zeigen Bewegung an.
    - Zwei mögliche Ergebnisse sind dargestellt, jeweils mit einem blauen Pfeil von der Münze ausgehend:
        - Oben rechts: Ein grüner Kreis mit einem weißen Häkchen, darüber der Text "Erfolg (Treffer)". Darunter ein weißes, abgerundetes Rechteck mit dem Buchstaben "p".
        - Unten rechts: Ein roter Kreis mit einem weißen 'X', darüber der Text "Misserfolg (Niete)". Darunter ein weißes, abgerundetes Rechteck mit dem Text "1-p".
    - Am unteren Rand der Spalte ein hellblaues, abgerundetes Rechteck mit dem Text "Nur zwei Ausgänge!".

**Spalte 2: "Bernoulli-Kette (Mehrfachdurchführung)"**
- Überschrift: Blauer Pfeil mit "Bernoulli-Kette" (fett) und darunter "(Mehrfachdurchführung)" in Schwarz.
- Inhalt:
    - Oben eine horizontale geschweifte Klammer, die drei Elemente umschließt, darüber der Text "Länge n (Anzahl Versuche)".
    - Unter der Klammer eine Reihe von drei goldenen Münzen mit Kopfprofil, die jeweils in Bewegung dargestellt sind (Wellenlinien). Blaue Pfeile zeigen von links nach rechts zwischen den Münzen.
    - Unter jeder Münze ein grünes, sprechblasenartiges Symbol mit einer kleinen goldenen Münze und einem blauen Pfeil nach rechts. Darunter der Buchstabe "p" und darunter in Klammern "(konstant)". Dies wiederholt sich dreimal für jede Münze.
    - Am unteren Rand der Spalte ein hellblaues, abgerundetes Rechteck mit dem Text "Unabhängige Wiederholungen!".

**Spalte 3: "Formel-Herleitung: P(X=k) am Beispiel"**
- Überschrift: Blauer Pfeil mit "Formel-Herleitung: P(X=k) am Beispiel" (fett) in Schwarz.
- Inhalt:
    - Oben links der Text:
        - "Beispiel: 3 Münzwürfe (n=3), fair (p=0.5)."
        - "Gesucht: Genau 2 Treffer (k=2) (z.B. Kopf K)"
    - Darunter links:
        - "Ein Pfad für"
        - "2 Treffer"
        - "(z.B. K-K-Z)"
        - Eine horizontale Reihe von drei verbundenen Kreisen: zwei gelbe Kreise mit "K", ein grüner Kreis mit "Z". Ein blauer Pfeil zeigt von dieser Reihe nach rechts.
    - Rechts neben dem Pfeil:
        - "Anzahl der Pfade"
        - "(Anordnungen)"
        - Darunter drei Zeilen von verbundenen Kreisen, die Permutationen darstellen:
            - Erste Zeile: Gelb "K", Gelb "K", Grün "Z"
            - Zweite Zeile: Gelb "K", Grün "Z", Gelb "K"
            - Dritte Zeile: Grün "Z", Gelb "K", Gelb "K"
        - Ein blauer Pfeil zeigt von diesen Permutationen nach rechts.
    - Rechts neben dem zweiten Pfeil:
        - "Gesamt-"
        - "Wahrscheinlichkeit"
        - Darunter: "P(X=2) ="
        - "Anzahl Wege · Pfad-WK"
        - Ein großer blauer Pfeil zeigt von diesem Text nach unten.
    - Unter der "K-K-Z"-Reihe:
        - "WK = p · p · (1-p)"
        - "= p² · (1-p)¹"
    - Rechts neben "WK = p · p · (1-p)": Ein gelbes, abgerundetes Rechteck mit dem Text "Anzahl = $\binom{n}{k} = \binom{3}{2} = 3$ Wege".
    - Am unteren Rand der Spalte ein großes gelbes, abgerundetes Rechteck mit der Formel: "$P(X = k) = \binom{n}{k} \cdot p^k \cdot (1-p)^{n-k}$".
    - Unterhalb dieser Formel drei hellblaue ovale Formen, jede mit einem blauen Pfeil, der nach oben zu einem Teil der Formel zeigt:
        - Linkes Oval: "Anzahl Pfade" zeigt zu $\binom{n}{k}$.
        - Mittleres Oval: "Treffer-WK" zeigt zu $p^k$.
        - Rechtes Oval: "Nieten-WK" zeigt zu $(1-p)^{n-k}$.
```
