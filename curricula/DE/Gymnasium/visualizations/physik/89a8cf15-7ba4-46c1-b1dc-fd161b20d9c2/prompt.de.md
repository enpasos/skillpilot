# Lernzielvisualisierung: Waagerechter Wurf analysieren

## SkillPilot-Ziel

- SkillPilot-ID: `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2`
- Titel: Waagerechter Wurf analysieren
- Beschreibung: Die lernende Person kann den waagerechten Wurf experimentell untersuchen, als Überlagerung von horizontaler und vertikaler Bewegung deuten und die Flugbahn im x-y-Diagramm darstellen.

## Generator

- Provider: SkillPilot / reviewed repo-native SVG
- Status: accepted
- Quellbild: `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2.png`
- Public Asset: `/assets/goal-visualizations/physik/89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2/89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2.png`

## Prompt

```text
Erstelle eine eigenständige, vollständig lesbare deutschsprachige Physik-Lernübersicht im Querformat 1600 × 900 Pixel. Sehr heller blaugrauer Hintergrund, weiße abgerundete Inhaltsfelder mit dünnen blaugrauen Rändern. Dunkelblaue serifenlose Schrift, bevorzugt DejaVu Sans; Titel etwa 36 Pixel, Paneltitel 26–30 Pixel, Erklärungstexte überwiegend 20–23 Pixel. Funktionskurven blau, ausgewählte Gegenkräfte beziehungsweise Ausgangssignale orange. Keine Fotografien, dekorativen Formeln, Logos, technischen IDs oder internen Layoutmaße im Bild. Alle Wörter, Indizes und mathematischen Zeichen vollständig und ohne Überlagerung rendern. Die folgenden Angaben beschreiben eine bereits tatsächlich betrachtete kontrollierte Diagrammfassung; ihre Beziehungen dürfen nicht durch bloß plausible Freihandgeometrie ersetzt werden.

Titel: „Waagerechter Wurf: zwei Teilbewegungen, eine Zeit“. Direkt darunter ein breites hellblaues Modellband mit zwei vollständigen Zeilen:
„Modell: Start (0, 0); vₓ = 2 m/s konstant; vᵧ(0) = 0; g = 10 m/s² (vereinfacht).“
„Luftwiderstand vernachlässigt. Die positive y-Richtung zeigt nach unten.“

LINKS ein großes quantitatives x-y-Diagramm. Ursprung im oberen linken Diagrammbereich, x nach rechts, positive y-Richtung ausdrücklich nach unten. x-Achse gleichmäßig von 0 bis mindestens 6 m, y-Achse gleichmäßig von 0 bis 50 m mit 5-m-Schritten; Achsenbeschriftungen „x / m“ und „y / m“ dürfen nicht mit Hilfslinien oder Zahlen kollidieren. Unterschiedliche physikalische Einheiten pro Pixel auf den beiden Achsen sind erlaubt; jede einzelne Achse muss linear und gleichmäßig skaliert sein.
Zeichne die blaue Flugbahn exakt als y = 1,25 x² im angegebenen Modell, mit waagerechter Tangente am Start und zunehmend steilerem Verlauf nach rechts unten. Sie beginnt exakt bei (0, 0) und reicht etwas über (6, 45) bis zur unteren Diagrammgrenze.
Markiere vier Punkte mit zugehörigen Zeitangaben: t = 0 s bei (0, 0), t = 1 s bei (2, 5), t = 2 s bei (4, 20), t = 3 s bei (6, 45). Gestrichelte waagerechte und senkrechte Hilfslinien müssen für jeden Punkt exakt die richtigen Achsenwerte treffen. Kontrollierbare Layoutabbildung bei einer 1600-Pixel-Grafik: Pixel-x = 140 + 85·x, Pixel-y = 233 + 9·y; diese internen Pixelregeln nicht ins Bild schreiben.
Unter dem Diagramm die beiden Sätze „x wächst gleichmäßig; y wächst quadratisch.“ und „Alle Punkte gehören zum selben Zeitparameter.“

RECHTS oben ein eigenes Tabellenfeld mit Titel „Berechnete Modellwerte“. Spalten „t / s“, „x / m“, „y / m“. Exakt vier Datenzeilen:
0 | 0 | 0
1 | 2 | 5
2 | 4 | 20
3 | 6 | 45
Keine erfundenen Messwerte oder vom Diagramm abweichende Startzeile. Die Daten sind berechnet und werden nicht als Experiment ausgegeben.

Rechts darunter ein Erklärfeld „Überlagerung und Flugbahn“ mit den drei korrekt gesetzten Formeln
x = vₓ · t
y = ½ g · t²
y = [g / (2 vₓ²)] · x²
Die letzte Formel folgt aus t = x/vₓ; das Quadrat gehört sowohl zu vₓ im Nenner als auch zu x rechts außerhalb der Klammer. Die Modellwerte ergeben y in Metern für x in Metern.
Darunter gut lesbar: „Gleiche Zeiten: gleiche x-Zuwächse,“ / „aber wachsende y-Zuwächse.“ / „Die Flugbahn ist eine Parabel.“
Keinen zusätzlichen vertikalen Anfangsgeschwindigkeitsanteil, keine nach oben positive y-Achse und keinen Luftwiderstand ergänzen. Alle vier Graphpunkte, Tabellenzeilen, Zeitlabels und Formeln müssen dasselbe Modell beschreiben.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
