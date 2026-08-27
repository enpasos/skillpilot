# Bildrekonstruktionsprompt: Widerstandswirkungen in Reihen- und Parallelschaltungen deuten

## SkillPilot-Ziel

- SkillPilot-ID: `8f833b36-4126-52db-b210-79fb0023c7d9`
- Titel: Widerstandswirkungen in Reihen- und Parallelschaltungen deuten
- Beschreibung: Die lernende Person kann bei konstanter Quellenspannung vorhersagen und begründen, wie das Hinzufügen, Entfernen oder Ändern eines Widerstands in einer Reihen- oder Parallelschaltung den Gesamtwiderstand und die Stromstärken beeinflusst, und die Vorhersage an einem Grenzfall prüfen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Quellbild: `8f833b36-4126-52db-b210-79fb0023c7d9.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein detailliertes, handgezeichnetes Diagramm im Stil einer Skizze auf einem weißen Hintergrund mit leichter Papiertextur. Der Gesamtstil ist klar und lehrreich, mit einer Mischung aus Schaltplänen, mathematischen Ausdrücken und erklärendem Text.

Oben mittig steht der große, schwarze Titel "Widerstandswirkungen deuten und prüfen" in einer umrissenen, schraffierten Schriftart mit weißer Füllung und leichtem Schatten.

Das Bild ist in drei Hauptbereiche unterteilt: zwei obere Bereiche (links und rechts) und einen unteren Bereich, der sich über die gesamte Breite erstreckt.

Der linke obere Bereich ist von einem hellblauen, handgezeichneten Rechteck mit abgerundeten Ecken umrahmt. Oben in diesem Bereich befindet sich ein dunkelblau gefülltes, abgerundetes Rechteck mit weißem Text: "LINKS – Reihenschaltung". Darunter sind zwei Unterabschnitte horizontal angeordnet.
Der linke Unterabschnitt ist mit "Ausgang:" (dunkelblau) überschrieben. Darunter ist ein einfacher Reihenschaltkreis gezeichnet: Eine Spannungsquelle (Batteriesymbol, langes Segment für Plus, kurzes für Minus) mit der Beschriftung "U = 6 V" links davon. Rechts davon ist ein rot schraffierter Widerstand mit der Beschriftung "R = 3 Ω" in Reihe geschaltet. Alle Linien sind schwarz. Unter dem Schaltkreis befindet sich ein hellblaues, abgerundetes Rechteck mit dunkelblauem Text: "R_ges = 3 Ω" und darunter "I = 2 A".
Rechts davon, zwischen den beiden Unterabschnitten, zeigt ein großer, dunkelblauer, handgezeichneter Pfeil nach rechts.
Der rechte Unterabschnitt ist mit "Danach: zweiten R = 3 Ω in Reihe" (dunkelblau) überschrieben. Darunter ist ein Reihenschaltkreis gezeichnet: Eine Spannungsquelle mit der Beschriftung "U = 6 V" links davon. Rechts davon sind zwei rot schraffierte Widerstände vertikal übereinander in Reihe geschaltet, beschriftet mit "R_1 = 3 Ω" und "R_2 = 3 Ω". Alle Linien sind schwarz. Unter diesem Schaltkreis befindet sich ein hellblaues, abgerundetes Rechteck mit dunkelblauem Text: "R_ges = 6 Ω" und darunter "I = 1 A".
Ganz unten im linken Bereich, unter den beiden Schaltkreisen, befindet sich ein langes, hellblaues, abgerundetes Rechteck mit dunkelblauem Text: "Widerstand hinzu → R_ges größer → Strom kleiner". Die Pfeile sind einfache, nach rechts zeigende Pfeile.

Der rechte obere Bereich ist von einem hellgrünen, handgezeichneten Rechteck mit abgerundeten Ecken umrahmt. Oben in diesem Bereich befindet sich ein dunkelgrün gefülltes, abgerundetes Rechteck mit weißem Text: "RECHTS – Parallelschaltung". Darunter sind zwei Unterabschnitte horizontal angeordnet.
Der linke Unterabschnitt ist mit "Ausgang:" (dunkelgrün) überschrieben. Darunter ist ein einfacher Parallelschaltkreis gezeichnet: Eine Spannungsquelle mit der Beschriftung "U = 6 V" links davon. Rechts davon ist ein grün schraffierter Widerstand mit der Beschriftung "R = 6 Ω" parallel geschaltet. Alle Linien sind schwarz. Unter dem Schaltkreis befindet sich ein hellgrünes, abgerundetes Rechteck mit dunkelgrünem Text: "R_ges = 6 Ω" und darunter "I_ges = 1 A".
Rechts davon, zwischen den beiden Unterabschnitten, zeigt ein großer, dunkelgrüner, handgezeichneter Pfeil nach rechts.
Der rechte Unterabschnitt ist mit "Danach: zweiten 6-Ω-Zweig parallel" (dunkelgrün) überschrieben. Darunter ist ein Parallelschaltkreis gezeichnet: Eine Spannungsquelle mit der Beschriftung "U = 6 V" links davon. Rechts davon sind zwei grün schraffierte Widerstände parallel geschaltet, beide beschriftet mit "R = 6 Ω". Unter dem linken Widerstand zeigt ein Pfeil nach unten auf den dunkelgrünen Text "je Zweig:". Unter dem rechten Widerstand zeigt ein Pfeil nach unten auf den dunkelgrünen Text "I = 1 A". Alle Linien sind schwarz. Unter diesem Schaltkreis befindet sich ein hellgrünes, abgerundetes Rechteck mit dunkelgrünem Text: "R_ges = 3 Ω" und darunter "I_ges = 2 A".
Ganz unten im rechten Bereich, unter den beiden Schaltkreisen, befindet sich ein langes, hellgrünes, abgerundetes Rechteck mit dunkelgrünem Text: "Zweig hinzu → R_ges kleiner → Gesamtstrom größer". Die Pfeile sind einfache, nach rechts zeigende Pfeile.

Der untere Bereich ist von einem hellvioletten, handgezeichneten Rechteck mit abgerundeten Ecken umrahmt und erstreckt sich über die gesamte Breite des Bildes. Oben links in diesem Bereich befindet sich ein dunkelviolett gefülltes, abgerundetes Rechteck mit weißem Text: "UNTEN – Grenzfall prüfen". Darunter sind drei Elemente horizontal angeordnet.
Links ist ein Schaltkreis gezeichnet: Eine Spannungsquelle mit der Beschriftung "U = 6 V" links davon. Rechts davon ist ein offener Schaltkreis mit zwei Anschlüssen dargestellt. Zwischen diesen Anschlüssen steht der violette Text "R → ∞". Alle Linien sind schwarz.
In der Mitte befindet sich ein hellviolettes, abgerundetes Rechteck mit violettem Text: "R → ∞ ⇒ I → 0" und darunter "offener Stromkreis".
Rechts befindet sich ein großes, violettes, handgezeichnetes Häkchen in einem violetten, handgezeichneten Kreis. Rechts daneben steht der violette Text: "Passt die Vorhersage" und darunter "auch im Grenzfall?".

Alle Texte sind in einer klaren, serifenlosen Schriftart gehalten, die einen leicht informellen, handgezeichneten Charakter hat.
```
