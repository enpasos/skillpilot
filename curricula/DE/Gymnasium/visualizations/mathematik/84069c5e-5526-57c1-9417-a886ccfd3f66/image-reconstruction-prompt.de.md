# Bildrekonstruktionsprompt: Daten mit Verteilungen vergleichen

## SkillPilot-Ziel

- SkillPilot-ID: `84069c5e-5526-57c1-9417-a886ccfd3f66`
- Titel: Daten mit Verteilungen vergleichen
- Beschreibung: Die lernende Person kann Histogramme und Kennwerte von Datensätzen mit einfachen theoretischen Verteilungen vergleichen, Abweichungen beschreiben und die Eignung eines Modells beurteilen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `84069c5e-5526-57c1-9417-a886ccfd3f66.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein detailliertes, lehrreiches Infografik-Poster im freundlichen Cartoon-Stil mit einer hellen, warmen Farbpalette und handgezeichneter Ästhetik. Der Hintergrund ist ein hellbeiges kariertes Papier mit schwachen, skizzenhaften mathematischen Symbolen wie Pluszeichen, Multiplikationszeichen, Fragezeichen, Pfeilen, einfachen Graphen und Würfelumrissen.

Oben mittig steht der Haupttitel in großer, fetter, schwarzer serifenloser Schrift: "Daten mit Verteilungen vergleichen".

Darunter sind drei horizontal angeordnete, abgerundete, rechteckige Kästen mit leichtem Schatten und hellbeigem Hintergrund. Jeder Kasten hat einen fetten, schwarzen serifenlosen Titel oben. Helle, abgerundete Pfeile mit dunkler Umrandung verbinden die Kästen von links nach rechts.

**Der linke Kasten ist betitelt: "1. Datensammlung & Beobachtung"**
In diesem Kasten ist eine Cartoon-Hand mit hellem Hautton und blauem Ärmel zu sehen, die einen weißen Würfel mit schwarzen Punkten hält, als würde sie ihn werfen. Um den Würfel herum sind Bewegungslinien dargestellt. Über der Hand schwebt eine Denkblase mit dem schwarzen Text "Fairer Würfel?". Unter der Hand liegt ein Haufen von etwa 25-30 verstreuten weißen Würfeln mit schwarzen Punkten. Rechts neben dem Würfelhaufen befindet sich eine Tabelle mit einem hellbraunen Rand und weißen Zellen. Die Kopfzeile der Tabelle lautet links "Augenzahl" und rechts "Anzahl (n=60)". Die Zeilen darunter zeigen:
- 1: "IIII IIII" (Strichliste), "9"
- 2: "IIII IIII" (Strichliste), "9"
- 3: "IIII IIII I" (Strichliste), "10"
- 4: "IIII IIII I" (Strichliste), "10"
- 5: "IIII IIII II" (Strichliste), "11"
- 6: "IIII IIII II" (Strichliste), "11"
Unter dem Würfelhaufen und der Tabelle steht in fetter, schwarzer serifenloser Schrift: "Beobachtete Daten (Stichprobe)".

**Der mittlere Kasten ist betitelt: "2. Vergleich: Histogramm vs. Modell"**
Dieser Kasten zeigt ein Histogramm mit einem hellblauen Hintergrund und dunkelblauen, schwarz umrandeten Balken. Die Y-Achse ist mit einem nach oben zeigenden Pfeil versehen und mit "Häufigkeit" (90 Grad gegen den Uhrzeigersinn gedreht) beschriftet. Die X-Achse ist mit einem nach rechts zeigenden Pfeil versehen und mit "Augenzahl (x)" beschriftet. Die Beschriftungen auf der X-Achse sind 1, 2, 3, 4, 5, 6. Die Balkenhöhen sind von links nach rechts:
- Balken für x=1: Höhe 9, mit der Zahl "9" darüber.
- Balken für x=2: Höhe 9, mit der Zahl "9" darüber.
- Balken für x=3: Höhe 10, mit der Zahl "10" darüber.
- Balken für x=4: Höhe 10, mit der Zahl "10" darüber.
- Balken für x=5: Höhe 11, mit der Zahl "11" darüber.
- Balken für x=6: Höhe 11, mit der Zahl "11" darüber.
Eine gestrichelte rote horizontale Linie verläuft auf der Höhe 10 über das Histogramm. Links neben dieser Linie steht in rotem Text "Erwartete Häufigkeit = 10", von dem ein roter, gekrümmter Pfeil zur gestrichelten Linie zeigt. Über dem Histogramm steht in schwarzem Text: "Theoretisches Modell (Fairer Würfel, P(x)=1/6 ≈ 0.17)". Unter dem Histogramm steht in schwarzem Text: "Kleine Abweichungen sind sichtbar", von dem ein gekrümmter schwarzer Pfeil zu den Histogrammbalken zeigt.

**Der rechte Kasten ist betitelt: "3. Beurteilung & Fazit"**
In diesem Kasten sind zwei Cartoon-Taschenrechner nebeneinander dargestellt. Der linke Taschenrechner ist hellblau mit dunkelblauen Tasten und einem weißen Bildschirm. Darunter steht in schwarzem Text: "empirischer Mittelwert ≈ 3.57". Der rechte Taschenrechner ist rot mit dunkelroten Tasten und einem weißen Bildschirm. Darunter steht in schwarzem Text: "theoretischer Erwartungswert = 3.5". Zwischen den Taschenrechnern befindet sich ein horizontaler Doppelpfeil (blau nach links, rot nach rechts), unter dem in schwarzem Text "Geringe Differenz" steht. Darunter sind zwei abgerundete, rechteckige Textfelder mit hellblauem Hintergrund und leichtem Schatten. Jedes Feld hat ein grünes Häkchen-Symbol links.
- Das obere Textfeld enthält den schwarzen Text: "Abweichungen sind durch Stichprobenvariation plausibel."
- Das untere Textfeld enthält den schwarzen Text: "Das Modell ist geeignet (nicht bewiesen)."
Rechts neben diesen Textfeldern steht ein Cartoon-Junge mit hellem Hautton, braunen Haaren und blauem Hemd. Er hält eine Lupe in seiner rechten Hand und zeigt mit seiner linken Hand einen Daumen hoch, während er auf die Textfelder blickt.
```
