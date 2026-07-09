# Bildrekonstruktionsprompt: Ereignisse darstellen und Baumdiagramme nutzen

## SkillPilot-Ziel

- SkillPilot-ID: `2a1158e5-d4ca-51d4-860c-f43bd5a86836`
- Titel: Ereignisse darstellen und Baumdiagramme nutzen
- Beschreibung: Die lernende Person kann mehrstufige Zufallsexperimente in Baumdiagrammen darstellen, Pfadregeln anwenden und Wahrscheinlichkeiten an konkreten Beispielrechnungen berechnen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `2a1158e5-d4ca-51d4-860c-f43bd5a86836.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, lehrreiches Infografik-Diagramm im Cartoon-Stil auf einem hellblauen Hintergrund mit einem subtilen weißen Gittermuster, das an kariertes Papier erinnert. Ein großes, weißes, abgerundetes Rechteck dient als Hauptinhaltsbereich und ist leicht transparent, sodass das Gitter darunter sichtbar ist.

Oben mittig im weißen Inhaltsbereich steht der Titel in großer, fetter, schwarzer serifenloser Schrift: "Ereignisse darstellen und Baumdiagramme nutzen".

In der oberen linken Ecke befindet sich eine weiße, cartoonartige Denkblase mit schwarzem Umriss. Darin steht in schwarzer serifenloser Schrift: "Mehrstufige Zufallsexperimente". Links vom Text ist ein weißer Würfel mit schwarzen Punkten (zeigt die Seiten 3, 4 und 5 Punkte). Rechts vom Text ist ein kleiner Stapel aus drei goldenen Münzen.

Unterhalb der Denkblase hält eine Cartoon-Hand mit hellblauem Ärmel einen gelben Bleistift mit rosa Radiergummi. Die Bleistiftspitze zeigt auf den "Start"-Knoten eines Baumdiagramms.

Der "Start"-Knoten ist mit "Start (100%)" beschriftet.

Vom "Start"-Knoten gehen zwei schwarze Pfeile aus:
1.  Ein nach oben führender schwarzer Pfeil, überlagert mit Hellblau, zeigt auf den Text "Kopf (K)". Darunter steht die Wahrscheinlichkeit "P(K) = ½".
2.  Ein nach unten führender schwarzer Pfeil zeigt auf den Text "Zahl (Z)". Darunter steht die Wahrscheinlichkeit "P(Z) = ½".

Vom ersten "Kopf (K)"-Knoten gehen zwei weitere schwarze Pfeile aus:
1.  Ein nach oben führender schwarzer Pfeil, überlagert mit Orange, zeigt auf den Text "Kopf (K)". Darunter steht die Wahrscheinlichkeit "P(K|K) = ½".
2.  Ein nach unten führender schwarzer Pfeil, überlagert mit Hellblau, zeigt auf den Text "Zahl (Z)". Darunter steht die Wahrscheinlichkeit "P(Z|K) = ½".

Vom ersten "Zahl (Z)"-Knoten gehen zwei weitere schwarze Pfeile aus:
1.  Ein nach oben führender schwarzer Pfeil, überlagert mit Hellblau, zeigt auf den Text "Kopf (K)". Darunter steht die Wahrscheinlichkeit "P(K|Z) = ½".
2.  Ein nach unten führender schwarzer Pfeil zeigt auf den Text "Zahl (Z)". Darunter steht die Wahrscheinlichkeit "P(Z|Z) = ½".

Rechts von den Endknoten des Baumdiagramms sind die Ergebnisse aufgeführt, vertikal ausgerichtet:
-   Rechts vom obersten "Kopf (K)" (zweite Ebene) zeigt ein schwarzer Pfeil auf den Text "Ergebnis: KK".
-   Rechts vom "Zahl (Z)" (zweite Ebene, vom ersten "Kopf") zeigt ein schwarzer Pfeil auf den Text "Ergebnis: KZ".
-   Rechts vom "Kopf (K)" (zweite Ebene, vom ersten "Zahl") zeigt ein schwarzer Pfeil auf den Text "Ergebnis: ZK".
-   Rechts vom untersten "Zahl (Z)" (zweite Ebene) zeigt ein schwarzer Pfeil auf den Text "Ergebnis: ZZ".

Unterhalb von "Ergebnis: KK" befindet sich ein orangefarbenes abgerundetes Rechteck mit dem Text: "Pfadregel 1 (Multiplikation - UND): P(KK) = P(K) ⋅ P(K|K) = ½ ⋅ ½ = ¼".

Unten rechts im weißen Inhaltsbereich befindet sich ein hellblaues abgerundetes Rechteck mit dem Text: "Pfadregel 2 (Addition - ODER): P(genau einmal K) = P(KZ) + P(ZK) = ¼ + ¼ = 2/4 = ½".
Zwei hellblaue Pfeile zeigen von den Texten "Ergebnis: KZ" und "Ergebnis: ZK" nach unten auf dieses hellblaue Rechteck, um ihre Beziehung zu verdeutlichen.

Alle Texte sind in schwarzer, serifenloser Schrift gehalten. Mathematische Brüche werden klar mit horizontalen Bruchstrich dargestellt.
```
