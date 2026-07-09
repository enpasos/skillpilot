# Bildrekonstruktionsprompt: Grenzwerte des Differenzenquotienten bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `b42bdfcc-3db7-5697-8b3e-69e50962ca86`
- Titel: Grenzwerte des Differenzenquotienten bestimmen
- Beschreibung: Die lernende Person kann Grenzwerte des Differenzenquotienten mit der h-Methode (h → 0) tabellarisch oder numerisch bestimmen und den Übergang von der Sekante zur Tangente begründen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `b42bdfcc-3db7-5697-8b3e-69e50962ca86.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Erstelle eine lehrreiche Infografik im handgezeichneten Cartoon-Stil auf weißem Hintergrund. Der Gesamtstil ist klar, freundlich und leicht verständlich, mit kräftigen schwarzen Umrissen und einer informellen, abgerundeten Schriftart.

Oben mittig steht der Haupttitel in großer, fetter, schwarzer Schrift: "Grenzwerte des Differenzenquotienten bestimmen".

Darunter sind drei horizontale, nebeneinanderliegende Abschnitte angeordnet, die jeweils in einem abgerundeten Rechteck mit unterschiedlicher Hintergrundfarbe dargestellt sind. Zwischen den Abschnitten 1 und 2 sowie 2 und 3 befinden sich hellblaue Pfeile mit schwarzem Umriss, die von links nach rechts zeigen.

**Abschnitt 1: Links, hellblauer Hintergrund**
Der Titel dieses Abschnitts ist "I. Die Sekante (Tabellarisch)" in fetter, schwarzer Schrift.
Darunter befindet sich ein Diagramm mit einer schwarzen y-Achse, beschriftet mit "f(x)" (nach oben zeigend), und einer schwarzen x-Achse (nach rechts zeigend). Eine blaue, geschwungene Funktion f(x) ist eingezeichnet. Zwei Punkte auf der Kurve sind markiert: P(x₀, f(x₀)) und Q(x₀+h, f(x₀+h)). Punkt P liegt links von Punkt Q. Gestrichelte schwarze Linien verbinden P mit x₀ auf der x-Achse und Q mit x₀+h auf der x-Achse. Eine gestrichelte grüne Linie, die die Punkte P und Q verbindet, ist als Sekante dargestellt. Ein grüner Pfeil zeigt von dieser Sekante auf den grünen, fetten Text "Sekante (Steigung ≈ Tangenten- steigung)".
Unterhalb des Diagramms befindet sich eine Tabelle mit einem gelben Kopfbereich und weißen Datenzeilen. Die Spaltenüberschriften sind "h" und "Differenzenquotient". Die Zeilen enthalten folgende Werte:
- h=1, Differenzenquotient=1.5
- h=0.1, Differenzenquotient=1.9
- h=0.01, Differenzenquotient=1.99...
Rechts neben der Tabelle ist ein graues Taschenrechner-Symbol mit einer '0' auf dem Display und orangefarbenen Tasten abgebildet. Darunter steht der schwarze Text "Werte berechnen".

**Abschnitt 2: Mitte, hellgrüner Hintergrund**
Der Titel dieses Abschnitts ist "2. Die h-Methode (h → O Numerisch)" in fetter, schwarzer Schrift.
Darunter befindet sich ein Diagramm mit einer schwarzen y-Achse, beschriftet mit "f(x)", und einer schwarzen x-Achse. Eine blaue, geschwungene Funktion f(x) ist eingezeichnet. Ein fester Punkt (implizit P) und ein beweglicher Punkt Q sind auf der Kurve dargestellt. Eine gestrichelte schwarze Linie verbindet Q mit der x-Achse. Auf der x-Achse ist ein horizontaler Pfeil nach links gezeichnet, beschriftet mit "h → 0". Mehrere gestrichelte grüne Linien, die Sekanten darstellen, gehen vom festen Punkt aus und nähern sich der Kurve am Punkt Q, wobei sie immer steiler werden und sich einer Tangente annähern, wenn h kleiner wird. Der Abstand 'h' ist auf der x-Achse zwischen dem x-Wert des festen Punktes und dem x-Wert von Q markiert.
Unterhalb des Diagramms stehen drei Zeilen mit schwarzem Text, jeweils mit einem kleinen schwarzen Pfeil:
- "h=0.1 → Quotient ≈ 1.9"
- "h=0.01 → Quotient ≈ 1.99"
- "h=0.001 → Quotient ≈ 1.999..."
Rechts daneben ist eine weiße Gedankenblase mit einer gelben '2' im Inneren und kleinen gelben Strahlen abgebildet. Ein schwarzer Pfeil zeigt von der Gedankenblase auf den schwarzen Text "Annäherung an den Grenzwert".

**Abschnitt 3: Rechts, hellroter/rosa Hintergrund**
Der Titel dieses Abschnitts ist "3. Die Tangente (Begründung)" in fetter, schwarzer Schrift.
Darunter befindet sich ein Diagramm mit einer schwarzen y-Achse, beschriftet mit "f(x)", und einer schwarzen x-Achse. Eine blaue, geschwungene Funktion f(x) ist eingezeichnet. Ein einzelner Punkt P(x₀, f(x₀)) ist auf der Kurve markiert. Eine gestrichelte schwarze Linie verbindet P mit x₀ auf der x-Achse. Eine durchgezogene rote Linie, die die Kurve im Punkt P berührt, ist als Tangente dargestellt. Ein roter Pfeil zeigt von dieser Tangente auf den roten, fetten Text "Tangente (Steigung = Grenzwert)".
Unterhalb des Diagramms befindet sich eine weiße Sprechblase, die die mathematische Formel enthält:
"lim (f(x₀+h) - f(x₀)) / h = f'(x₀)"
"h→0" ist unter "lim" geschrieben.
Darunter steht der abschließende schwarze Text in fetter Schrift: "Der Grenzwert ist die Tangentensteigung!".
```
