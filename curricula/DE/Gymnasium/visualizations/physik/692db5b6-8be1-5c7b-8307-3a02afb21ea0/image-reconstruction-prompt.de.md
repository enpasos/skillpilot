# Bildrekonstruktionsprompt: Ein- und Ausschaltvorgänge analysieren

## SkillPilot-Ziel

- SkillPilot-ID: `692db5b6-8be1-5c7b-8307-3a02afb21ea0`
- Titel: Ein- und Ausschaltvorgänge analysieren
- Beschreibung: Die lernende Person kann Strom- und Spannungsverläufe beim Ein- und Ausschalten eines idealisierten RL-Stromkreises mit der Zeitkonstante τ = L/R quantitativ analysieren und die Induktivität aus einem solchen Verlauf bestimmen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Quellbild: `692db5b6-8be1-5c7b-8307-3a02afb21ea0.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein detailliertes, schematisches Diagramm im Stil von Lehrbuchillustrationen, mit klaren Linien und Vektorgrafiken auf einem weißen Hintergrund.

Oben mittig steht der Titel in großer, fetter, blauer, serifenloser Schrift: "Ein- und Ausschaltvorgänge analysieren".

Darunter befinden sich zwei nebeneinander angeordnete, abgerundete Rechtecke mit einem dünnen grauen Rand und hellgrauer Füllung.

Das linke Rechteck ist überschrieben mit dem zentrierten, fetten, schwarzen, serifenlosen Titel "Einschalten". Darunter verläuft eine dünne horizontale graue Linie. Innerhalb dieses Rechtecks ist ein Stromkreis dargestellt:
Ein rechteckiger Schaltkreis aus schwarzen Linien. Links befindet sich ein Batteriesymbol (längere Linie oben, kürzere Linie unten) mit einem schwarzen Pluszeichen (+) über der oberen Linie und einem schwarzen Minuszeichen (-) unter der unteren Linie. Eine dünne graue Linie verbindet das Batteriesymbol mit dem Text "Batterie" darunter. Oben im Schaltkreis ist ein orangefarbenes, rechteckiges Widerstandssymbol mit schwarzem Rand, darüber steht der Buchstabe "R". Eine dünne graue Linie verbindet den Widerstand mit dem Text "Widerstand R" rechts daneben. Rechts im Schaltkreis ist ein orangefarbenes Spulensymbol (Induktivität) mit schwarzem Rand, daneben steht der Buchstabe "L". Eine dünne graue Linie verbindet die Spule mit dem Text "Spule" darüber und dem Text "Induktivität" rechts daneben. Eine weitere dünne graue Linie verbindet die Spule mit dem Text "Selbstinduktion" darunter. Rote, geschwungene Pfeile zeigen den Stromfluss im Uhrzeigersinn an, und innerhalb der Schleife steht in fetter, kursiver, roter Schrift "I(t)".
Unter diesem Schaltkreis, innerhalb eines abgerundeten Rechtecks mit hellblauem Rand und hellblauer Füllung, steht die mathematische Formel in fetter, kursiver Schrift: "$I(t) = I_{max} (1 - e^{-\frac{t}{\tau}})$".

Das rechte Rechteck ist überschrieben mit dem zentrierten, fetten, schwarzen, serifenlosen Titel "Entladen". Darunter verläuft eine dünne horizontale graue Linie. Innerhalb dieses Rechtecks ist ein Stromkreis dargestellt:
Ein rechteckiger Schaltkreis aus schwarzen Linien, ähnlich dem linken, jedoch ohne Batteriesymbol. Oben im Schaltkreis ist ein orangefarbenes, rechteckiges Widerstandssymbol mit schwarzem Rand, darüber steht der Buchstabe "R". Eine dünne graue Linie verbindet den Widerstand mit dem Text "Widerstand R" rechts daneben. Rechts im Schaltkreis ist ein orangefarbenes Spulensymbol (Induktivität) mit schwarzem Rand, daneben steht der Buchstabe "L". Eine dünne graue Linie verbindet die Spule mit dem Text "Spule L" darunter und dem Text "Selbstinduktion" rechts daneben. Rote, geschwungene Pfeile zeigen den Stromfluss gegen den Uhrzeigersinn an, und innerhalb der Schleife steht in fetter, kursiver, roter Schrift "I(t)".
Unter diesem Schaltkreis, innerhalb eines abgerundeten Rechtecks mit hellblauem Rand und hellblauer Füllung, steht die mathematische Formel in fetter, kursiver Schrift: "$I(t) = I_0 e^{-t/\tau}$".

Unterhalb der beiden Hauptrechtecke, mittig auf dem weißen Hintergrund, befindet sich ein weiteres abgerundetes Rechteck mit einem dünnen grauen Rand und hellgrauer Füllung. Darin steht die mathematische Formel in fetter, kursiver Schrift: "$\tau = L/R$".

Der gesamte Stil ist klar, präzise und didaktisch, mit gut lesbaren Texten und mathematischen Symbolen.
```
