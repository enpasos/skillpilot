# Bildrekonstruktionsprompt: Bedingte Wahrscheinlichkeiten berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `c3b9c561-dd83-5903-9ec6-49c7f51bafd5`
- Titel: Bedingte Wahrscheinlichkeiten berechnen
- Beschreibung: Die lernende Person kann bedingte Wahrscheinlichkeiten in Sachzusammenhängen identifizieren und sie mit Baumdiagrammen sowie Vier- oder Mehrfeldertafeln aus absoluten oder relativen Häufigkeiten berechnen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `c3b9c561-dd83-5903-9ec6-49c7f51bafd5.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein pädagogisches Diagramm im handgezeichneten Doodle-Stil auf einem hellbeigen Hintergrund mit subtilen, hellbraunen/orangen Kritzeleien wie Sternen und Wirbeln an den Rändern. Der Haupttitel in fetter schwarzer Schrift, zentriert oben, lautet: "Bedingte Wahrscheinlichkeiten berechnen".

Darunter befinden sich zwei große, abgerundete, hellblaue Rechtecke nebeneinander.

Das linke Rechteck enthält oben eine kleinere, abgerundete, hellblaue Sprechblase mit dem Titel "Vierfeldertafel: relative Häufigkeiten" in fetter schwarzer Schrift. Darunter ist eine 4x4-Tabelle mit schwarzen Rändern. Die Kopfzeile und die erste Spalte haben einen hellblauen Hintergrund und enthalten die fetten schwarzen Beschriftungen: "A", "Ā", "Summe" (Kopfzeile) und "B", "B̄", "Summe" (erste Spalte). Die Datenzellen mit weißem Hintergrund enthalten in fetter schwarzer Schrift:
- Reihe 1, Spalte 1: "0.30" mit "P(A∩B)" darunter in kleinerer Schrift. Diese Zelle ist von einem orangefarbenen Kreis umrandet.
- Reihe 1, Spalte 2: "0.20"
- Reihe 1, Spalte 3: "0.50"
- Reihe 2, Spalte 1: "0.10"
- Reihe 2, Spalte 2: "0.40"
- Reihe 2, Spalte 3: "0.50"
- Reihe 3, Spalte 1: "0.40" mit "P(A)" darunter in kleinerer Schrift. Diese Zelle ist von einem orangefarbenen Kreis umrandet.
- Reihe 3, Spalte 2: "0.60"
- Reihe 3, Spalte 3: "1.00"
Unter dieser Tabelle befindet sich ein weiteres abgerundetes, hellblaues Rechteck mit der Formel in fetter schwarzer Schrift: "P(B|A) = P(A∩B) / P(A) = 0.30 / 0.40 = 0.75".
Zwei dicke, schwarze, geschwungene Pfeile zeigen von den orange umkreisten Werten "0.30 P(A∩B)" und "0.40 P(A)" in der Tabelle nach unten zu den entsprechenden Werten "0.30" und "0.40" in der Formel. Ein großer, dicker, schwarzer, geschwungener Pfeil bildet eine Schleife, die von der Formelbox nach oben, links und wieder zur Formelbox zurückführt.

Das rechte Rechteck ist ähnlich aufgebaut. Oben befindet sich eine kleinere, abgerundete, hellblaue Sprechblase mit dem Titel "Baumdiagramm zu P(B|A)" in fetter schwarzer Schrift. Darunter ist ein Baumdiagramm mit schwarzen Linien und fetter schwarzer Schrift:
- Ein Startpunkt "A (0.40)" verzweigt sich nach rechts in zwei Äste.
- Der obere Ast ist beschriftet mit "P(B|A) = 0.75" und führt zu "A∩B 0.30".
- Der untere Ast ist beschriftet mit "P(B̄|A) = 0.25" und führt zu "A∩B̄ 0.10".
- Ein weiterer Startpunkt "Ā (0.60)" darunter verzweigt sich ebenfalls nach rechts in zwei Äste.
- Der obere Ast ist beschriftet mit "P(B|Ā) = 0.33" und führt zu "Ā∩B 0.20".
- Der untere Ast ist beschriftet mit "P(B̄|Ā) = 0.67" und führt zu "Ā∩B̄ 0.40".
Unter diesem Baumdiagramm befindet sich ein weiteres abgerundetes, hellblaues Rechteck mit der Formel in fetter schwarzer Schrift: "P(B|A) = P(A∩B) / P(A) = 0.30 / 0.40 = 0.75".
Ein dicker, schwarzer, geschwungener Pfeil zeigt von "A (0.40)" im Baumdiagramm nach unten zum Wert "0.40" in der Formel. Ein weiterer dicker, schwarzer, geschwungener Pfeil zeigt von "A∩B 0.30" im Baumdiagramm nach unten zum Wert "0.30" in der Formel. Ein großer, dicker, schwarzer, geschwungener Pfeil bildet eine Schleife, die von der Formelbox nach oben, rechts und wieder zur Formelbox zurückführt.
```
