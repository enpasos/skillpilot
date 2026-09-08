# Bildrekonstruktionsprompt: Strahlendosis und Schutz

## SkillPilot-Ziel

- SkillPilot-ID: `e6a50c74-c922-508c-aa27-07bac2566955`
- Titel: Strahlendosis und Schutz
- Beschreibung: Die lernende Person kann Energiedosis, Äquivalentdosis und effektive Dosis unterscheiden, die zur Fragestellung passende Dosisgröße unter benannten Modellannahmen aus gegebenen Daten bestimmen und die Wirksamkeit einer Abschirmung unter sonst vergleichbaren Expositionsbedingungen anhand der Dosisreduktion beurteilen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Quellbild: `e6a50c74-c922-508c-aa27-07bac2566955.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, lehrreiches Infografik-Design auf einem hellen pfirsichfarbenen/beigen Hintergrund (ähnlich #FDF5EF).

Der Haupttitel, zentriert, groß und fett in Schwarz, lautet: "Strahlendosis: Größe und Modell unterscheiden".

Darunter befinden sich drei horizontal angeordnete, gleich große, abgerundete Rechtecke mit einem dünnen dunkelbraunen Rand. Jedes Rechteck hat einen hellbeigen Hintergrund und einen helleren pfirsichfarbenen/rosa horizontalen Streifen (ähnlich #FBEAE3) in der Mitte. Der Text in den Boxen ist schwarz.

**Erste Box (links):**
Oben links steht fett: "Energiedosis D".
Darunter die mathematische Formel: "D = E_abs / m", wobei 'E_abs' als tiefgestelltes 'abs' und 'm' als Nenner dargestellt ist.
Rechts neben der Formel sind zwei kleine Icons vertikal angeordnet: oben ein gelber Blitz in einem Kreis, unten ein graues Gewichtssymbol mit einem kleinen 'm'.
Darunter steht: "absorbierte Energie pro Masse".
Auf dem helleren Streifen steht fett: "Einheit: Gray (Gy = J/kg)".
Unter dem Streifen steht: "E_abs ist ausdrücklich Energie, nicht die effektive Dosis."

**Zweite Box (Mitte):**
Oben mittig steht fett: "Äquivalentdosis H_T", wobei 'H_T' als tiefgestelltes 'T' dargestellt ist.
Darunter die mathematische Formel: "H_T = Σ_R w_R ⋅ D_T,R", wobei 'H_T' als tiefgestelltes 'T' dargestellt ist, 'Σ' einen tiefgestellten Index 'R' hat, 'w_R' als tiefgestelltes 'R' und 'D_T,R' als tiefgestelltes 'T,R' dargestellt ist.
Rechts neben der Formel ist eine Gruppe kleiner Icons: oben links ein rotes Strahlungssymbol in einem Kreis, oben rechts ein blaues Zell-/Molekülsymbol, und darunter ein Querschnitt von Haut/Gewebe mit einem Pfeil, der darauf zeigt und einen kleinen sternförmigen Einschlag darstellt.
Darunter steht: "Strahlungsarten im Gewebe gewichten".
Auf dem helleren Streifen steht fett: "Einheit: Sievert (Sv)".
Unter dem Streifen steht: "D_T,R: Energiedosis im Gewebe T durch R."

**Dritte Box (rechts):**
Oben rechts steht fett: "Effektive Dosis E_eff", wobei 'E_eff' als tiefgestelltes 'eff' dargestellt ist.
Darunter die mathematische Formel: "E_eff = Σ_T w_T ⋅ H_T", wobei 'E_eff' als tiefgestelltes 'eff' dargestellt ist, 'Σ' einen tiefgestellten Index 'T' hat, 'w_T' als tiefgestelltes 'T' und 'H_T' als tiefgestelltes 'T' dargestellt ist.
Rechts neben der Formel sind vier kreisförmige Icons, die Organe darstellen: oben links eine Torso-Umriss, oben rechts ein Magen, unten links eine Leber, unten rechts Muskelgewebe. Die Icons haben rosa/rötliche Umrisse und weiße Füllungen.
Darunter steht: "Gewebe T zusätzlich gewichten".
Auf dem helleren Streifen steht fett: "Einheit: Sievert (Sv)".

Unter diesen drei Boxen, zentriert und in kleinerer schwarzer Schrift, steht: "Vereinfachtes Gewebemodell: w_R und w_T sind vorgegebene, dimensionslose Gewichtsfaktoren.", wobei 'w_R' als tiefgestelltes 'R' und 'w_T' als tiefgestelltes 'T' dargestellt ist.

Ein weiterer Haupttitel, zentriert, groß und fett in Schwarz, lautet: "Abschirmung anhand derselben Dosisgröße vergleichen".
Darunter, kleiner und zentriert in Schwarz: "Illustrative Modelldaten; Skizzen nicht maßstäblich".

**Linke Seite des Vergleichs (ohne Abschirmung):**
Links ausgerichtet in Schwarz steht: "ohne Abschirmung:".
Darunter, fett in Schwarz: "D = 4 µGy".
Rechts davon ist ein Diagramm: Ein gelbes Strahlungssymbol in einem Kreis, das drei gekrümmte graue Linien als Strahlungswellen aussendet. Ein dicker, leuchtend oranger Pfeil zeigt von der Strahlungsquelle nach rechts. Der Pfeil endet an einem grauen rechteckigen Detektor-Icon, das oben ein weißes Ausrufezeichen in einem orangefarbenen umgekehrten Dreieck und unten einen kleinen weißen Kreis zeigt.

**Rechte Seite des Vergleichs (mit Abschirmung):**
Rechts ausgerichtet in Schwarz steht: "mit Abschirmung:".
Darunter, fett in Schwarz: "D = 1 µGy".
Links davon ist ein Diagramm: Ein gelbes Strahlungssymbol in einem Kreis, das drei gekrümmte graue Linien als Strahlungswellen aussendet. Diese Wellen passieren ein Abschirmungselement. Das Abschirmungselement besteht aus drei geschichteten, leicht gekrümmten rechteckigen Platten (braun, hellbraun, grau), gefolgt von einer grauen schildartigen Form. Ein dicker, leuchtend oranger Pfeil zeigt von der Abschirmung nach rechts, wobei die Strahlungswellen nach dem Passieren der Abschirmung sichtbar abgeschwächt und blasser erscheinen. Der Pfeil endet an einem grauen rechteckigen Detektor-Icon, das identisch mit dem auf der linken Seite ist (weißes Ausrufezeichen in einem orangefarbenen umgekehrten Dreieck oben, kleiner weißer Kreis unten).

Ganz unten, zentriert und fett in Schwarz, steht: "Dosisreduktion: 3 µGy (75 % des Ausgangswerts)".
Darunter, zentriert in Schwarz: "Gleiche Quelle, Dauer und Geometrie; hier nur D.".
Darunter, zentriert und fett in Schwarz: "Dosisreduktion ist keine Sicherheitsgarantie."
```
