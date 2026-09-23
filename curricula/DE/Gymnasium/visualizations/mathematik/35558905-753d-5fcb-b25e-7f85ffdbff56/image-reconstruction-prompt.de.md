# Bildrekonstruktionsprompt: Zentrische Streckungen am Koordinatenursprung mit Matrizen darstellen

## SkillPilot-Ziel

- SkillPilot-ID: `35558905-753d-5fcb-b25e-7f85ffdbff56`
- Titel: Zentrische Streckungen am Koordinatenursprung mit Matrizen darstellen
- Beschreibung: Die lernende Person kann Abbildungsmatrizen zentrischer Streckungen am Koordinatenursprung bestimmen, untersuchen und die Wirkung auf Bildpunkte berechnen.

## Generator

- Provider: OpenAI / ChatGPT-Codex image generation
- Quellbild: `35558905-753d-5fcb-b25e-7f85ffdbff56.png`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Erzeuge eine eigenständige deutsche Lernillustration im breiten Querformat, ungefähr 16:9, als PNG. Keine Bildvorlage ist erforderlich. Freundlicher klarer Lernplakatstil: warmer, leicht papierartiger cremefarbener Hintergrund, schwarze handgezeichnet wirkende, aber präzise Linien; angenehm lesbare handschriftähnliche Beschriftungen. Blaue und rote Punkte mit feiner schwarzer Kontur. Keine Fotorealistik, zusätzlichen Figuren, Logos, technischen IDs, Wasserzeichen oder Dateinamen.

Oben der gut lesbare Titel:
„Zentrische Streckungen am Koordinatenursprung mit Matrizen darstellen“.

Linke etwa zwei Drittel: kartesisches Koordinatensystem als klarer rechteckiger Gitterausschnitt, x ungefähr von −6 bis 6, y von −2 bis 6. Eine Gitterweite bedeutet auf jeder Achse eine Einheit. x-Achse nach rechts, y-Achse nach oben; kräftige schwarze Achsen mit Pfeilspitzen und den Buchstaben x und y. Zahlenticks am x-Gitter −5 bis 5 und am y-Gitter −1 bis 5, ohne unlesbare Überlagerungen. Ursprung ausdrücklich als Buchstabe O mit „O = (0; 0)“ kennzeichnen; die Achsenziffer 0 davon unterscheiden.

Zeichne exakt vier markierte Punkte:
- Blau P = (1; 2), etwas kleinerer blauer Punkt.
- Blau P′ = (2; 4), etwas größerer blauer Punkt.
- Rot Q = (−2; 1), etwas kleinerer roter Punkt.
- Rot Q′ = (−4; 2), etwas größerer roter Punkt.
Alle Punkte müssen auf den zugehörigen Gitterkreuzungen liegen, nicht nur passende Zahlenlabels tragen. Beschriftungen in der jeweiligen Punktfarbe knapp neben den Punkten, ohne Achsenticks oder Gitterkoordinaten zu verdecken. Ein gerader schwarzer Strahl geht von O durch P und P′ und wird über P′ hinaus fortgesetzt. Ein zweiter gerader schwarzer Strahl geht von O durch Q und Q′ und wird über Q′ hinaus fortgesetzt. Die beiden Bildpunkte liegen jeweils genau doppelt so weit von O entfernt wie ihre Ausgangspunkte. Kein zusätzlicher Bildpunkt oder zweiter Ursprung.

Rechte etwa ein Drittel: ein weißer oder sehr heller großer Rechnungskasten mit schwarzem handgezeichnet wirkendem Rand. Überschrift in einer hellgrauen Kopfleiste: „Abbildungsmatrix und Wirkung“.

Im Kasten oben die Matrix Z in eckigen Klammern:
Z =
erste Zeile 2   0
zweite Zeile 0   2.

Darunter zwei sauber gesetzte Rechnungsgleichungen:
Z · [Spaltenvektor mit oben 1, unten 2] = [Spaltenvektor mit oben 2, unten 4]
Z · [Spaltenvektor mit oben −2, unten 1] = [Spaltenvektor mit oben −4, unten 2].
Die vier Vektoren sind alle tatsächlich vertikal angeordnet und stehen in hohen runden Klammern. An KEINEM dieser vier bereits vertikalen Spaltenvektoren steht ein T oder ein anderes Transpositionszeichen. Die Vektoren haben jeweils exakt zwei Komponenten. Z ist eine 2×2-Matrix; alle Produkte sind 2×2 mal 2×1 = 2×1. Die rechte Spalte darf nicht so schmal sein, dass Matrixeinträge oder Minuszeichen zusammenrutschen.

Unter dem Rechnungskasten zwei schmale Notizkästen:
„Streckungsfaktor k = 2“
„O bleibt Fixpunkt“.
Einfache dünne rechtwinklige Verbindungs-/Hinweispfeile können Matrix, Rechnungen und Notizen verbinden, dürfen aber nicht durch Formeln laufen oder andere Punktzuordnungen behaupten.

Alle mathematischen Werte müssen exakt bleiben: 2·(1;2)=(2;4), 2·(−2;1)=(−4;2), 2·(0;0)=(0;0). Keine zusätzliche Drehung, Spiegelung oder Verschiebung zeigen. Vertrauten warmen, zugänglichen Plakatcharakter und die blaue/rote Zuordnung erhalten; kein steriles CAD-Diagramm und keine unnötigen Dekorationen.

Dies ist ein vollständiger Rekonstruktionsprompt für einen neu zu prüfenden Kandidaten, keine Freigabe und keine Anweisung zur Änderung einer aktiven Datei.
```
