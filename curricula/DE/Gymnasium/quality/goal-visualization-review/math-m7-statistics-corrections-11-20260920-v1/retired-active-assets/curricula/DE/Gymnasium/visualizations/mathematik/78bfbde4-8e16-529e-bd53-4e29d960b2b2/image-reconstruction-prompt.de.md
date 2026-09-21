# Bildrekonstruktionsprompt: Fehlerwahrscheinlichkeiten berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `78bfbde4-8e16-529e-bd53-4e29d960b2b2`
- Titel: Fehlerwahrscheinlichkeiten berechnen
- Beschreibung: Die lernende Person kann zu einer gegebenen Entscheidungsregel die Fehlerwahrscheinlichkeiten α und β bestimmen, auch mit digitalen Werkzeugen berechnen und rechnerisch nachvollziehen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `78bfbde4-8e16-529e-bd53-4e29d960b2b2.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein detailliertes, lehrreiches Infografik-Diagramm im Cartoon-Stil mit klaren Linien und Pastellfarben. Das Diagramm ist von einem dünnen schwarzen Rahmen umgeben.

Oben befindet sich ein hellblauer Banner mit dem fetten schwarzen Titel "Fehlerwahrscheinlichkeiten berechnen (α und β)". Links im Banner ist ein kleines Cartoon-Taschenrechner-Symbol (grau mit orangefarbenen, grünen, blauen und grauen Tasten), rechts ein kleines Cartoon-Gehirn-Symbol (rosa mit roten Linien).

Unter dem Banner ist der Hauptinhalt in zwei vertikale Spalten unterteilt, getrennt durch eine gestrichelte schwarze Linie.

**Linke Spalte: "1. Entscheidungsregel festlegen"**
Der Titel "1. Entscheidungsregel festlegen" ist fett und schwarz.
Darunter befindet sich eine Illustration: Eine Cartoon-Person mit hellbraunem Haar und blauem Hemd steht hinter einer offenen Holzkiste, die mit "Qualitätskontrolle (n=20)" beschriftet ist. Die Person greift in die Kiste, die mehrere kleine blaue und rote rechteckige Gegenstände enthält. Drei grüne Häkchen in Kreisen schweben über der Kiste und sind mit dünnen Linien zu den Gegenständen verbunden. Links von der Kiste ist ein Teil einer weiteren braunen Kartonschachtel sichtbar, aus der ein Gegenstand gezogen wird.

Unter dieser Illustration folgt ein Flussdiagramm aus drei abgerundeten, weißen Sprechblasen, die durch dicke hellblaue Pfeile verbunden sind:
1.  **Erste Sprechblase:** "Hypothesen:" gefolgt von "H₀: p ≤ 0,10 (Ausschuss gering)" und "H₁: p > 0,10 (Ausschuss zu hoch)".
2.  **Zweite Sprechblase:** "Testgröße:" gefolgt von "X = Anzahl defekte Teile".
3.  **Dritte Sprechblase:** "Ablehnungsbereich für H₀:" gefolgt von "X ≥ k (z.B. k=5)".
Rechts neben der dritten Sprechblase steht eine kleine Cartoon-Person mit hellbraunem Haar und blauem Hemd, die eine Lupe hält und auf die Sprechblase blickt.

**Rechte Spalte: "2. Fehlerwahrscheinlichkeiten bestimmen"**
Der Titel "2. Fehlerwahrscheinlichkeiten bestimmen" ist fett und schwarz.
Darunter befinden sich zwei Hauptabschnitte, jeweils in einem umrandeten Kasten.

**Oberer Kasten (Szenario 1):**
Der Kasten hat einen hellroten Hintergrund und einen dünnen schwarzen Rahmen.
Die Überschrift lautet "Szenario 1: H₀ ist WAHR (p=0,10)" in fetter schwarzer Schrift.
Darunter steht "Binomialverteilung (n=20, p=0,10)".
Ein Balkendiagramm zeigt eine Binomialverteilung. Die X-Achse ist von 0 bis 20 beschriftet mit "Anzahl defekte X". Die Y-Achse hat einen nach oben zeigenden Pfeil. Die Balken sind blau, wobei die Balken von 'k' bis '20' rot gefärbt sind. Ein roter, halbtransparenter Bereich überlagert die roten Balken von 'k' bis '20'. Innerhalb dieses Bereichs steht: "α = P(H₀ ablehnen | H₀ wahr)" und darunter "= P(X ≥ k)".
Rechts neben dem Diagramm befindet sich ein gelbes Warndreieck mit einem schwarzen Ausrufezeichen. Darunter steht "Fehler" und "1. Art (α)".
Unten rechts in diesem Kasten sind zwei Hände zu sehen, die ein Smartphone mit einer Taschenrechner-App halten.

**Unterer Kasten (Szenario 2):**
Der Kasten hat einen hellvioletten Hintergrund und einen dünnen schwarzen Rahmen.
Die Überschrift lautet "Szenario 2: H₁ ist WAHR (z.B. p=0,25)" in fetter schwarzer Schrift.
Darunter steht "Binomialverteilung (n=20, p=0,25)".
Ein Balkendiagramm zeigt eine Binomialverteilung. Die X-Achse ist von 0 bis 20 beschriftet mit "Anzahl defekte X". Die Y-Achse hat einen nach oben zeigenden Pfeil. Alle Balken sind blau. Ein violetter, halbtransparenter Bereich überlagert die Balken von '0' bis 'k-1'. Innerhalb dieses Bereichs steht: "β = P(H₀ nicht verwerfen | H₁ wahr)" und darunter "= P(X < k)".
Rechts neben dem Diagramm befindet sich ein gelbes nachdenkliches Emoji. Darunter steht "Fehler" und "2. Art (β)".
Unter dem Emoji ist eine weiße Sprechblase mit abgerundeten Ecken, die die Texte "P(X ≥ 5) ≈ 0.043" und "P(X < 5) ≈ 0.414" enthält.

**Unterer Bereich der rechten Spalte:**
Ein hellblauer Kasten mit dünnem schwarzem Rahmen am unteren Rand der rechten Spalte.
Darin steht der Text: "Digitales Werkzeug nutzen (z.B. Taschenrechner, App):" und darunter "α und β berechnen & prüfen".
Links überlappen zwei Hände, die einen Taschenrechner halten, diesen Kasten. Rechts überlappen zwei Hände, die ein Tablet mit leerem Bildschirm halten, diesen Kasten.
```
