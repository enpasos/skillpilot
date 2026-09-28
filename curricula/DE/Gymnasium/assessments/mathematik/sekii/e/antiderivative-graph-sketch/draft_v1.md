# Aus einem f-Graphen einen Stammfunktionsgraphen zeichnen

Status: am 28. September 2026 fachlich gegengeprüft, zweisprachig synchronisiert und maschinell als Assessment freigegeben. Keine unabhängige menschliche Freigabe oder Lernenden-Erprobung; ein realer Coach-Host wurde hierfür nicht getestet.

## Curriculare Bindung und Abgrenzung

- Kanonisches Inhaltsziel: `21676dae-8619-59d1-89e3-a35bb2297e2c`.
- [BY LehrplanPLUS M12 1.1](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/regulaer): Aus dem Graphen von f auf den Graphen einer zugehörigen Stammfunktion schließen und das Vorgehen begründen. Die zusätzliche Termermittlung bei ganzrationalen Funktionen wird **nicht** durch diese Aufgabe geprüft.
- [HE KC 2024 E.2, S. 32](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf): Ableitungs- und Funktionsgraphen begründet wechselseitig darstellen; Begriff der Stammfunktion.
- Für HE ist dies eine E.2-Aufgabe, für BY wird dasselbe stabile kanonische Ziel im M12/J12-Abschnitt gezeigt. Es wird keine Aussage über andere Länder abgeleitet.

## Aufgabe (DE; zur Übernahme in `taskContent`)

Der folgende Graph von f auf `0 ≤ x ≤ 6` besteht aus geraden Strecken. Der Plot ist nicht maßstabsgerecht; die Eckpunkte `(0|0), (1|2), (2|0), (3|−2), (4|0), (5|2), (6|0)` legen ihn genau fest. Ein Funktionsterm ist nicht gegeben.

```text
 f(x)
  2 |    ●               ●
  1 |  ╱   ╲           ╱   ╲
  0 |●       ●       ●       ●
 −1 |          ╲   ╱
 −2 |            ●
    +-------------------------
     0   1   2   3   4   5   6  x
```

1. Zeichne in ein Koordinatensystem mit derselben x-Skala den Graphen **einer möglichen Stammfunktion F** mit `F(0) = 0`. Zeichne eine passende gekrümmte Form und waagerechte Tangenten. Markiere die Intervalle, auf denen F steigt und fällt, sowie die inneren Hoch- und Tiefpunkte.
2. Begründe anhand von `F′ = f` und den Vorzeichen von f die Form bei `x = 2` und `x = 4`. Vergleiche die Steigungen von F bei `x = 1` und `x = 2`.
3. Zeichne in dasselbe Koordinatensystem den Graphen einer zweiten Stammfunktion G mit `G(0) = 1` und erkläre seine Lage zu F.

Gib deine **F- und G-Zeichnung** als Foto oder digitale Zeichnung ab. Eine bloße Beschreibung ersetzt die graphische Leistung nicht. Es wird weder ein Stammfunktionsterm noch ein bestimmtes Integral verlangt.

## Task (EN; to be copied into `taskContentEn`)

The following graph of f on `0 ≤ x ≤ 6` consists of straight segments. The plot is not to scale; its vertices `(0,0), (1,2), (2,0), (3,−2), (4,0), (5,2), (6,0)` specify it exactly. No formula for f is given.

```text
 f(x)
  2 |    ●               ●
  1 |  ╱   ╲           ╱   ╲
  0 |●       ●       ●       ●
 −1 |          ╲   ╱
 −2 |            ●
    +-------------------------
     0   1   2   3   4   5   6  x
```

1. In a coordinate system with the same x-scale, draw **one possible antiderivative graph F** with `F(0) = 0`. Draw an appropriate curved shape with horizontal tangents. Mark the intervals where F rises and falls and its interior maxima and minima.
2. Using `F′ = f` and the signs of f, justify the shape at `x = 2` and `x = 4`. Compare the slopes of F at `x = 1` and `x = 2`.
3. In the same coordinate system, draw a second antiderivative graph G with `G(0) = 1` and explain its position relative to F.

Submit your **F and G drawings** as a photo or digital drawing. A description alone does not demonstrate the graphical skill. Neither an antiderivative formula nor a definite integral is required.

## Lösung und fachliche Prüfung (DE; für `solutionContent`)

- Der f-Graph verbindet die angegebenen sieben Punkte mit sechs geraden Segmenten. Er ist auf `(0,2)` und `(4,6)` positiv, auf `(2,4)` negativ und bei x = 0, 2, 4, 6 null.
- Für F gilt `F′ = f`. Deshalb steigt F auf `(0,2)`, fällt auf `(2,4)` und steigt auf `(4,6)`. Bei x = 2 liegt ein innerer Hochpunkt, bei x = 4 ein innerer Tiefpunkt; dort sind die Tangenten waagerecht. Auch bei den Randstellen x = 0 und x = 6 ist die Tangente waagerecht, soweit eine einseitige Tangente gemeint ist. Es gibt keinen inneren Hoch- oder Tiefpunkt allein wegen der Randnullstellen.
- Ein maßstäblich möglicher F-Sketch durchläuft `(0|0), (1|1), (2|2), (3|1), (4|0), (5|1), (6|2)`. Er verbindet sie **nicht** geradlinig: Auf jedem linearen f-Segment ist F gekrümmt. Zum Beispiel ist `F′(1) = f(1) = 2`, aber `F′(2) = f(2) = 0`.
- Die zweite Stammfunktion ist `G = F + 1`: gleiche Form und gleiche Steigungen an jeder Stelle, überall um eine Einheit nach oben verschoben.
- Bei einer qualitativen Zeichnung sind die exakten Zwischenwerte von F nicht nötig. Entscheidend sind ein konsistenter, tatsächlich gezeichneter Kurvenverlauf, die Nullstellen-/Vorzeicheninformation und die vertikale Verschiebungsfreiheit.

## Solution and mathematical check (EN; for `solutionContentEn`)

- The graph of f joins the seven vertices by straight segments. f is positive on `(0,2)` and `(4,6)`, negative on `(2,4)`, and zero at `x = 0, 2, 4, 6`.
- Since `F′ = f`, F rises on `(0,2)`, falls on `(2,4)`, and rises on `(4,6)`. It has an interior maximum at `x = 2` and an interior minimum at `x = 4`, with horizontal tangents at both points. One-sided horizontal tangents at the endpoints do not create additional interior extrema.
- One possible F graph with `F(0) = 0` passes through `(1,1), (2,2), (3,1), (4,0), (5,1), (6,2)`. It is **not** piecewise linear: F is curved on each straight segment of f. In particular, `F′(1) = f(1) = 2`, whereas `F′(2) = f(2) = 0`.
- The second antiderivative is `G = F + 1`: it has the same shape and slopes and is shifted up by one unit everywhere.
- Exact intermediate F values are not required for a qualitative sketch. What matters is a consistent, actually drawn curve, correct sign/zero implications, and the vertical-shift freedom.

## Bewertungsvorschlag: 12 Punkte, Bestehen ab 11

| Leistung | Punkte |
| --- | ---: |
| F tatsächlich gezeichnet: `F(0)=0`, passende gekrümmte Form, Steig- und Fallintervalle, waagerechte Tangenten und innere Extrema | 7 |
| Vorzeichen und Steigung mit `F′ = f` begründet, insbesondere bei `x = 1, 2, 4`; ohne erkennbaren Bezug zwischen f-Wert und F-Steigung 0 Punkte für diesen Schritt | 3 |
| G tatsächlich gezeichnet **und** als reine vertikale Verschiebung von F erklärt; fehlt entweder die Zeichnung oder die Erklärung, 0 Punkte für diesen Schritt | 2 |

Die Mindestleistung bei 11/12 Punkten beträgt rechnerisch mindestens 6/7 für die F-Zeichnung, 2/3 für die Begründung und 1/2 für G. Ohne F-Zeichnung sind höchstens 5 Punkte, ohne Begründung höchstens 9 Punkte und ohne G höchstens 10 Punkte erreichbar. Die Kopplung von G-Zeichnung und Erklärung ist eine verbindliche Bewertungsanweisung; das bestehende Backend prüft serverseitig nur die Gesamtsumme, nicht diese Teilleistung. Die Gegenbeispiele `7+0+0`, `7+3+0`, `0+3+2` sowie reine Textantworten sind als fachliche Negativfälle geprüft und dürfen nicht bestehen; eine tatsächliche Coach-Bewertung mit Foto-/Digitalabgaben ist davon zu unterscheiden. Reale Host-/Beta-Erprobung bleibt separat offen. Eine niedrigere, lernfreundlichere Bestehensgrenze erfordert eine technisch durchgesetzte Teilmindestleistung. Diese maschinelle Inhaltsfreigabe ist kein D-/P-/V-Nachweis oder menschlich erprobte Aufgabe.

EN scoring: 7 points for the actual F drawing, 3 for reasoning using `F′ = f`, and 2 for an actual G drawing **together with** an explanation of its pure vertical shift. Award 0 in the last step if either the G drawing or its explanation is missing. Pass at 11/12, requiring at least 6/7, 2/3, and 1/2 respectively. The current server enforces only the total score; the step conditions require targeted local coach tests and separate real-host beta acceptance.
