# Bildrekonstruktionsprompt: Entscheidungsregeln und Verwerfungsbereiche bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `677be619-5f0a-59bf-9730-0071c7d3f150`
- Titel: Entscheidungsregeln und Verwerfungsbereiche bestimmen
- Beschreibung: Die lernende Person kann zu vorgegebenen Signifikanzniveaus Entscheidungsregeln sowie kritische Werte bzw. Verwerfungsbereiche für ein- oder zweiseitige binomiale Tests bestimmen, dabei systematisches Probieren nutzen und Sigma-Regeln als Hilfsmittel einordnen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `677be619-5f0a-59bf-9730-0071c7d3f150.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, modernes Diagramm im Flat-Design-Stil mit abgerundeten Ecken und sanften Schatten. Der Hintergrund ist weiß. Ein großer, hellblauer Rahmen mit abgerundeten Ecken umgibt das gesamte Diagramm. Oben mittig steht der Titel in schwarzer, fetter Sans-Serif-Schrift: "Entscheidungsregeln und Verwerfungsbereiche bestimmen".

Das Diagramm ist in drei vertikale Spalten unterteilt, die von links nach rechts durch große, hellblaue Pfeile verbunden sind.

**Spalte 1: '1. Hypothesen & Testvariable'**
Oben befindet sich ein hellblauer Kasten mit abgerundeten Ecken und schwarzem Rand. Links im Kasten ist ein Sprechblasen-Symbol mit einem Fragezeichen, rechts ein Lupen-Symbol. Der Text im Kasten ist "1. Hypothesen & Testvariable" in schwarzer, fetter Schrift.
Darunter sind zwei nebeneinanderliegende Kästen.
Der linke Kasten ist hellblau, abgerundet und hat einen schwarzen Rand. Er enthält den Text: "H0" (fett), "(Nullhypothese)", "Basisannahme,", "z.B. p ≤ 0.10", "(Ausschussquote)".
Der rechte Kasten ist hellorange, abgerundet und hat einen schwarzen Rand. Er enthält den Text: "H1" (fett), "(Alternativhypothese)", "Gegenannahme,", "z.B. p > 0.10".
Unter diesen beiden Kästen befindet sich ein weiterer hellblauer, abgerundeter Kasten mit schwarzem Rand. Er enthält den Text: "Testvariable X" (fett), "(vor Datenbeobachtung)", "z.B. X = Anzahl defekte", "bei n=20".
Links unter diesem Kasten ist eine Sprechblase mit einem Fragezeichen, von der eine gestrichelte Linie zu einem hellblauen, abgerundeten Kasten mit schwarzem Rand führt. Dieser Kasten enthält den Text: "Signifikanzniveau α", "(vorgegeben)".

Ein großer, hellblauer Pfeil zeigt von der Unterseite der Spalte 1 zur Oberseite der Spalte 2.

**Spalte 2: '2. Kritische Werte & Verwerfungsbereich finden'**
Oben befindet sich ein hellblauer Kasten mit abgerundeten Ecken und schwarzem Rand. Links im Kasten ist ein Lupen-Symbol. Der Text im Kasten ist "2. Kritische Werte & Verwerfungsbereich finden" in schwarzer, fetter Schrift.
Darunter ist ein Histogramm oder Balkendiagramm einer Binomialverteilung. Die x-Achse ist mit "Kritischer Wert k" beschriftet. Die Balken sind hellblau und stellen die Verteilung dar. Über dem Diagramm steht der Text: "n = 20", "Binomialverteilung", "B(20, p) unter H0". Eine vertikale, gestrichelte schwarze Linie markiert den kritischen Wert "k". Die Balken rechts von dieser Linie sind orange/rot gefärbt und stellen den Verwerfungsbereich dar. Über diesen orange/roten Balken befindet sich ein helloranger, abgerundeter Kasten mit schwarzem Rand, der den Text "Verwerfungsbereich für H0 (z.B. X ≥ k)" enthält. Ein weiterer helloranger, abgerundeter Kasten mit schwarzem Rand, leicht links davon und ebenfalls über den orange/roten Balken, enthält den Text "Gesamtwahrscheinlichkeit ≤ α (Fehler 1. Art)" und hat einen kleinen Pfeil, der nach unten auf die orange/roten Balken zeigt.
Unter dem Diagramm sind zwei nebeneinanderliegende Kästen.
Der linke Kasten ist hellblau, abgerundet und hat einen schwarzen Rand. Er enthält den Text: "Methode:" (fett), "Systematisches" (fett), "Probieren" (fett), "(mit Tabelle/Rechner)".
Der rechte Kasten ist hellorange, abgerundet und hat einen schwarzen Rand. Rechts im Kasten ist ein Lupen-Symbol. Er enthält den Text: "Hilfsmittel:" (fett), "Sigma-Regeln" (fett), "(nur zur Orientierung)".

Ein großer, hellblauer Pfeil zeigt von der Unterseite der Spalte 2 zur Oberseite der Spalte 3.

**Spalte 3: '3. Entscheidungsregel anwenden'**
Oben befindet sich ein hellblauer Kasten mit abgerundeten Ecken und schwarzem Rand. Links im Kasten ist ein Lupen-Symbol mit einem grünen Häkchen. Der Text im Kasten ist "3. Entscheidungsregel anwenden" in schwarzer, fetter Schrift.
Darunter sind zwei vertikale Zweige.
Der obere Zweig beginnt mit einem hellblauen, abgerundeten Kasten mit schwarzem Rand. Er enthält den Text: "Beobachteter Wert", "X_beobachtet fällt in den", "Verwerfungsbereich", "(X_beobachtet ≥ k)". Ein hellblauer Pfeil zeigt von diesem Kasten zu einem hellorangen, abgerundeten Kasten mit schwarzem Rand. Dieser enthält den Text: "Entscheidung:" (fett), "H0 verwerfen" (fett). Rechts neben dem Text ist ein Richterhammer-Symbol.
Der untere Zweig beginnt mit einem hellblauen, abgerundeten Kasten mit schwarzem Rand. Er enthält den Text: "Beobachteter Wert", "X_beobachtet fällt NICHT in", "den Verwerfungsbereich", "(X_beobachtet < k)". Ein hellblauer Pfeil zeigt von diesem Kasten zu einem hellorangen, abgerundeten Kasten mit schwarzem Rand. Dieser enthält den Text: "Entscheidung:" (fett), "H0 nicht verwerfen" (fett), "(Daten reichen nicht gegen H0)". Rechts neben dem Text ist ein Symbol einer Person, die mit erhobenen Händen die Schultern zuckt.
```
