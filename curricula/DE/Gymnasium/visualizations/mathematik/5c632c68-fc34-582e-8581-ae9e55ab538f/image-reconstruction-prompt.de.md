# Bildrekonstruktionsprompt: Induktionsbeweis durchführen

## SkillPilot-Ziel

- SkillPilot-ID: `5c632c68-fc34-582e-8581-ae9e55ab538f`
- Titel: Induktionsbeweis durchführen
- Beschreibung: Die lernende Person kann einen Beweis durch vollständige Induktion führen (Induktionsanfang, -voraussetzung, -schritt) und die Schlussfolgerung korrekt formulieren.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `5c632c68-fc34-582e-8581-ae9e55ab538f.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein helles, freundliches, handgezeichnetes und pädagogisches Diagramm auf einem cremefarbenen Hintergrund. Der Titel oben mittig lautet in schwarzer, fetter Schrift: 'Induktionsbeweis durchführen'. Darunter sind drei gleich große, abgerundete Rechteckfelder mit hellblauem Rand und leichtem Schatten horizontal nebeneinander angeordnet.

**Linkes Feld (1. Schritt):**
Der Titel in schwarzer Schrift ist '1. Induktionsanfang (n=1)'. Darunter steht eine mathematische Formel auf gelbem Hintergrund: '1 + 2 + ... + n = n(n+1) / 2'. Eine geschwungene schwarze Pfeillinie zeigt von dieser Formel auf den Text 'Für n = 1:'. Es folgen die Berechnungen: '1 = 1(1+1) / 2', '1 = 2 / 2', '1 = 1'. Neben der letzten Zeile '1 = 1' ist ein grüner Haken zu sehen, auf den ein hellbrauner Zeigefinger-Mauszeiger zeigt. Rechts daneben ist ein einzelner, hellblauer Würfel mit Schatten dargestellt, darunter der Text '1 Würfel'.

**Mittleres Feld (2. Schritt):**
Der Titel in schwarzer Schrift ist '2. Induktionsvoraussetzung (Annahme)'. Eine Gedankenblase enthält den Text 'Für ein beliebiges n ≥ 1 gilt:' und darunter die gleiche mathematische Formel auf gelbem Hintergrund: '1 + 2 + ... + n = n(n+1) / 2'. Rechts unterhalb der Gedankenblase ist eine Anordnung von hellblauen Würfeln zu sehen, die eine Dreieckszahl bilden, gestapelt in Reihen von unten nach oben (z.B. 5 Würfel in der untersten Reihe, dann 4, 3, 2, 1). Über dem obersten Würfel sind drei Punkte und eine gestrichelte Linie, die andeuten, dass die Reihe fortgesetzt werden könnte. Daneben steht der Text 'Dreieckszahl für n Würfel'. Eine gestrichelte hellblaue Pfeillinie zeigt vom oberen Rand des linken Feldes zum oberen Rand dieses Feldes, um den Übergang zu visualisieren.

**Rechtes Feld (3. Schritt):**
Der Titel in schwarzer Schrift ist '3. Induktionsschritt (n → n+1)'. Darunter steht auf gelbem Hintergrund der Text 'Zu zeigen: 1+...+n+(n+1) = (n+1)(n+2) / 2'. Es folgt der Text 'Wir nutzen die Voraussetzung:'. Darunter die Formel '1 + 2 + ... + n + (n+1)'. Der Teil '1 + 2 + ... + n' ist unterstrichen, und ein schwarzer Pfeil zeigt von diesem unterstrichenen Teil auf die mathematische Expression 'n(n+1) / 2'. Die weiteren Berechnungen sind: '= n(n+1) / 2 + (n+1)', '= n(n+1) / 2 + 2(n+1) / 2', '= (n+2)(n+1) / 2', '= (n+1)(n+2) / 2'. Neben der letzten Zeile ist ein grüner Haken. Rechts daneben ist eine größere Anordnung von hellblauen Würfeln zu sehen, die ebenfalls eine Dreieckszahl bilden, aber eine Reihe mehr als im mittleren Feld (z.B. 6 Würfel in der untersten Reihe, dann 5, 4, 3, 2, 1). Auch hier sind über dem obersten Würfel drei Punkte und eine gestrichelte Linie. Daneben steht der Text 'Dreieckszahl für n+1 Würfel'. Eine gestrichelte hellblaue Pfeillinie zeigt vom oberen Rand des mittleren Feldes zum oberen Rand dieses Feldes, um den Übergang zu visualisieren.

**Fazitfeld:**
Unterhalb der drei Felder, zentriert und über deren gesamte Breite reichend, befindet sich ein abgerundetes Rechteckfeld mit grünem Rand und hellgrüner Füllung. Darin steht in schwarzer Schrift: 'Schlussfolgerung: Damit gilt die Formel für alle natürlichen Zahlen n >= 1.'.

**Hintergrund-Doodles:**
Um den Hauptinhalt herum sind verschiedene handgezeichnete, skizzenhafte mathematische Symbole in hellgrauen, hellblauen und hellgelben Umrissen verstreut, darunter Pluszeichen, Pfeile, ein Divisionszeichen und ein Sigma-Symbol (Σ).
```
