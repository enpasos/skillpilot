# Bildrekonstruktionsprompt: Bestände und Mittelwerte modellieren

## SkillPilot-Ziel

- SkillPilot-ID: `809ef78a-f282-5593-89be-0f2cb95570ac`
- Titel: Bestände und Mittelwerte modellieren
- Beschreibung: Die lernende Person kann in Sachsituationen Bestände, rekonstruierte Bestände, mittlere Bestände und mittlere Änderungsraten mit bestimmten Integralen modellieren, berechnen und die Ergebnisse interpretieren.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `809ef78a-f282-5593-89be-0f2cb95570ac.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, lehrreiches Vektorgrafik-Diagramm im Cartoon-Stil auf einem weißen Hintergrund, der mit sehr hellgrauen, skizzierten Schulmaterialien wie Bleistiften, Linealen, Radiergummis und einem Rucksack verziert ist.

Oben mittig steht der große, fette schwarze Titel "Bestände und Mittelwerte modellieren".

Darunter befindet sich eine Reihe von fünf vertikalen Boxen, die den Hauptinhalt darstellen, gefolgt von einer breiten Ergebnisbox am unteren Rand.

**Linke Diagrammgruppe (Startzustand):**
Links neben der ersten Box ist ein Diagramm, das einen grauen Wasserhahn mit blauem Griff zeigt, aus dem hellblaues Wasser mit weißen Glanzlichtern in ein klares Glasbecherglas fließt. Eine schwarze Linie mit Pfeil zeigt vom Wasserhahn auf den schwarzen Text "Änderungsrate r(t) = 2t (Liter/min)". Das Becherglas ist teilweise mit hellblauer Flüssigkeit gefüllt und hat rechts Volumenmarkierungen. Links vom Becherglas ist ein blau-weißer Stoppuhr-Icon mit dem schwarzen Text "Zeit t = 0 min" darunter. Im Becherglas steht der schwarze Text "Anfangsbestand B(0) = 10 Liter". Unter dem Becherglas erstreckt sich ein schwarzer horizontaler Doppelpfeil mit der Beschriftung "Zeitraum [0, 3] min".

**Erste Box: "Bestandsänderung (Integral)"**
Diese Box hat einen hellblauen Kopf mit dem fetten schwarzen Text "Bestandsänderung" und darunter "(Integral)". Der weiße Körper der Box enthält den schwarzen Text "Änderung auf [0, 3]", gefolgt von der mathematischen Notation:
```
∫³ 2t dt
⁰
= [t²]³
⁰
= 3² - 0²
= 9 Liter
```
Darunter zeigt ein blauer Pfeil nach unten auf eine hellblaue, spritzende Form mit weißen Glanzlichtern, die den schwarzen Text "9 Liter hinzugefügt" enthält. Ein blauer Pfeil zeigt von dieser Form nach rechts.

**Zweite Box: "Rekonstruierter Bestand"**
Diese Box hat einen hellgrünen Kopf mit dem fetten schwarzen Text "Rekonstruierter Bestand". Der weiße Körper der Box enthält den schwarzen Text "Endbestand B(3)", gefolgt von der mathematischen Notation:
```
B(3) = B(0) + ∫³ r(t) dt
⁰
= 10 + 9
= 19 Liter
```
Darunter ist ein Diagramm, das einen grauen Wasserhahn mit blauem Griff zeigt, aus dem hellblaues Wasser mit weißen Glanzlichtern in ein klares Glasbecherglas fließt. Dieses Becherglas ist höher mit hellblauer Flüssigkeit gefüllt als das erste und hat ebenfalls Volumenmarkierungen. Links vom Becherglas ist ein blau-weißer Stoppuhr-Icon mit dem schwarzen Text "Zeit t = 3 min" darunter. Im Becherglas steht der schwarze Text "19 Liter". Rechts vom Becherglas ist eine hellblaue Sprechblase mit dem schwarzen Text "Rekonstruierter Bestand = Anfangsbestand + Änderung".

**Dritte Box: "Mittlere Änderungsrate"**
Diese Box hat einen hellgelben Kopf mit dem fetten schwarzen Text "Mittlere Änderungsrate". Der weiße Körper der Box enthält den schwarzen Text "Durchschnittliche Rate (auf [0, 3])", gefolgt von der mathematischen Notation:
```
B(3) - B(0)   9
----------- = -
   3 - 0      3
= 3 Liter pro Minute
```
Darunter ist ein Diagramm mit zwei nebeneinander stehenden Bechergläsern. Das linke Becherglas ist mit hellblauer Flüssigkeit bis "10L" gefüllt, darunter "t = 0". Das rechte Becherglas ist mit hellblauer Flüssigkeit bis "19L" gefüllt, darunter "t = 3". Zwischen den Bechergläsern ist ein grauer Wasserhahn, von dem ein blauer Pfeil nach rechts zum rechten Becherglas zeigt. Über dem Wasserhahn und Pfeil steht der schwarze Text "konstante Rate = 3 L/min". Unter den Bechergläsern ist ein graues Waage-Icon. Darunter steht der schwarze Text "Gesamtänderung / Zeitspanne".

**Vierte Box: "Mittlerer Bestand (Optional)"**
Diese Box hat einen hellorangen Kopf mit dem fetten schwarzen Text "Mittlerer Bestand" und darunter "(Optional)". Der weiße Körper der Box enthält den schwarzen Text "Durchschnittlicher Wasserstand (auf [0, 3])", gefolgt von der mathematischen Notation:
```
1   ∫³
--- ∫  (10 + t²) dt
3-0 ⁰
```
Darunter ist ein Liniendiagramm mit einer X-Achse, die mit "t" beschriftet ist und Markierungen bei 0, 1, 2, 3 hat, und einer Y-Achse, die mit "B(t) ▲" beschriftet ist und Markierungen bei 10 und 19 hat. Eine blaue Kurve beginnt bei (0, 10) und steigt bis (3, 19). Die Fläche unter der Kurve von t=0 bis t=3 ist mit hellblauen diagonalen Linien schattiert. Eine gestrichelte horizontale Linie erstreckt sich von y=13 bis zum rechten Rand der schattierten Fläche und ist mit "13 Liter" beschriftet. Unter dem Diagramm ist ein graues Waage-Icon. Darunter steht der schwarze Text "Flächeninhalt (Bestand) / Zeitspanne".

**Ergebnisbox am unteren Rand:**
Eine breite, rechteckige Box mit abgerundeten Ecken und einem dicken blauen Rand. Der Kopf der Box enthält den fetten schwarzen Text "Ergebnisbox: Das Wichtigste". Der weiße Körper der Box enthält den schwarzen Text "Integral liefert Bestandsänderung." und darunter "Mittelwerte entstehen durch Teilen durch die Intervalllänge.". Darunter sind zwei Icons nebeneinander: Links eine hellblaue, spritzende Form mit weißen Glanzlichtern, beschriftet mit "Änderung (Integral)". Rechts ein graues Waage-Icon, beschriftet mit "Mittelwert (Durchschnitt)".
```
