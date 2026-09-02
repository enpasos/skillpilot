# Bildrekonstruktionsprompt: Bruchterme auf einen gemeinsamen Nenner bringen

## SkillPilot-Ziel

- SkillPilot-ID: `f7a9a0b4-ec64-468f-8da4-59c5055eac1d`
- Titel: Bruchterme auf einen gemeinsamen Nenner bringen
- Beschreibung: Die lernende Person kann aus der Faktorstruktur der Nenner einen geeigneten gemeinsamen Nenner bestimmen, jeden Bruchterm mit den fehlenden Faktoren erweitern und unter Beachtung der Definitionsbedingungen die Wertgleichheit der Umformungen begründen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `f7a9a0b4-ec64-468f-8da4-59c5055eac1d.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, lehrreiches Diagramm im flachen Cartoon-Stil mit abgerundeten Ecken. Der Hintergrund ist oben hellblau und verläuft nach unten in Weiß. Im oberen Bereich sind schemenhaft und transparent hellblaue Zahnräder links und mathematische Symbole (Sprechblase mit Punkten, durchgestrichenes X, Taschenrechner, Plus-Minus-Zeichen, Divisionszeichen) rechts zu sehen.

Oben mittig steht der große, fette, schwarze Titel: "Bruchterme auf einen gemeinsamen Nenner bringen".

Darunter befindet sich eine horizontale Reihe von fünf hellblauen, abgerundeten Rechtecken, die durch dunkelgraue, geschwungene Pfeile miteinander verbunden sind und einen Prozessfluss darstellen.

1.  **Erstes hellblaues Rechteck (links):**
    *   Oben steht der Text "Start: Bruchtherme".
    *   Darunter, horizontal angeordnet: Ein hellgelbes, orange umrandetes Rechteck mit dem Bruch "1/x". Rechts daneben ein großes dunkelgraues Pluszeichen. Rechts daneben ein hellorangefarbenes, orange umrandetes Rechteck mit dem Bruch "2/(x+1)". Rechts daneben ein dunkelgrauer Pfeil, der nach rechts zeigt.
    *   Darunter: Ein kleines Cartoon-Symbol eines lächelnden Kopfes mit braunen Haaren, gefolgt von dem Text "Bedingungen:". Darunter ein gelbes Warndreieck mit rotem Rand, gefolgt von dem Text "x≠0, x≠-1".

2.  **Zweites hellblaues Rechteck:**
    *   Oben steht der Text "Schritt 1: Hauptnenner finden".
    *   Darunter, horizontal ausgerichtet mit den Brüchen des vorherigen Schritts: Ein hellorangefarbenes, orange umrandetes Rechteck mit dem fetten Text "Hauptnenner: x(x+1)". Rechts daneben ein dunkelgrauer Pfeil, der nach rechts zeigt.
    *   Darunter: Der Text "Gemeinsames Vielfaches der Nenner x und (x+1)".

3.  **Drittes hellblaues Rechteck:**
    *   Oben steht der Text "Schritt 2: Erweitern auf Hauptnenner".
    *   Darunter, in zwei Zeilen für die Erweiterung der einzelnen Brüche:
        *   **Obere Zeile:** Ein hellgelbes, orange umrandetes Rechteck mit "1/x". Rechts daneben ein dunkelgrauer Multiplikationspunkt. Rechts daneben ein hellgelbes, orange umrandetes Rechteck mit "(x+1)/(x+1)". Rechts daneben ein dunkelgrauer Pfeil, der nach rechts zeigt. Rechts daneben ein hellgelbes, orange umrandetes Rechteck mit "(x+1)/(x(x+1))".
        *   **Untere Zeile:** Ein hellorangefarbenes, orange umrandetes Rechteck mit "2/(x+1)". Rechts daneben ein dunkelgrauer Multiplikationspunkt. Rechts daneben ein hellorangefarbenes, orange umrandetes Rechteck mit "x/x". Rechts daneben ein dunkelgrauer Pfeil, der nach rechts zeigt. Rechts daneben ein hellorangefarbenes, orange umrandetes Rechteck mit "2x/(x(x+1))".

4.  **Viertes hellblaues Rechteck:**
    *   Oben steht der Text "Schritt 3: Addieren und Vereinfachen".
    *   Darunter: Das hellgelbe, orange umrandete Rechteck mit "(x+1)/(x(x+1))" aus der oberen Zeile des vorherigen Schritts.
    *   Darunter, vertikal zentriert: Ein großes dunkelgraues Pluszeichen.
    *   Darunter: Das hellorangefarbene, orange umrandete Rechteck mit "2x/(x(x+1))" aus der unteren Zeile des vorherigen Schritts.
    *   Rechts von der oberen Bruchbox und dem Pluszeichen, ein dunkelgrauer Pfeil, der nach rechts zeigt.

5.  **Fünftes hellblaues Rechteck (rechts):**
    *   Oben steht der Text "Ergebnis".
    *   Darunter: Ein hellgelbes, orange umrandetes Rechteck mit dem Bruch "(x+1+2x)/(x(x+1))".
    *   Darunter ein dunkelgrauer Pfeil, der nach rechts zeigt.
    *   Darunter: Ein hellorangefarbenes, orange umrandetes Rechteck mit dem Bruch "(3x+1)/(x(x+1))". Ein grünes Häkchen-Symbol überlappt leicht die untere rechte Ecke dieses Rechtecks.
```
