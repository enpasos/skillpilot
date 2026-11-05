# Prismenvolumen und Beschichtungsfläche

Normale Aufgabe mit unverändertem 6/6-Bestehensvertrag. Wiederverwendeter Inhalt aus PR #79; die neue Lerneinheits- und Angebotsbindung hat eigene Nachweise.

## Aufgabe

Im Technikraum wird ein vollständig ausgefüllter Messkeil als gerades Prisma gebaut. Seine Grundfläche ist ein rechtwinkliges Dreieck mit Katheten $6 cm$ und $8 cm$; die dritte Seite ist $10 cm$. Der senkrechte Abstand der beiden Dreiecksflächen beträgt $20 cm$.

1. Berechne den Flächeninhalt einer dreieckigen Grundfläche. (1 BE)
2. Erkläre mit gedanklich übereinandergestapelten, kongruenten Dreiecksschichten, warum hier $V = G · h$ gilt. Berechne damit das Volumen des Keils und deute den Wert am Körper. (2 BE)
3. Berechne den gesamten äußeren Oberflächeninhalt des Keils. Zeige, welche Flächen du zählst, und erkläre, wofür dieser Wert im Technikraum gebraucht werden könnte. (3 BE)

## Lösung

Eine Grundfläche hat $G = 6 \cdot 8 / 2 = 24 cm^2$.

In jeder zur Dreiecksgrundfläche parallelen Schicht bleibt die Dreiecksfläche $24 cm^2$ groß. Bei 1 cm dicken Schichten füllen 20 kongruente Schichten den Keil; daher wird die Grundfläche mit der senkrechten Körperhöhe $h = 20 cm$ multipliziert. Das Volumen ist $V = G \cdot h = 24 \cdot 20 = 480 cm^3$ und beschreibt den Rauminhalt des ausgefüllten Keils.

Die Außenfläche besteht aus zwei kongruenten Dreiecken und drei Mantelrechtecken. Ihre Inhalte sind $2 \cdot 24 = 48 cm^2$ und $(6 + 8 + 10) \cdot 20 = 480 cm^2$. Damit ist $O = 48 + 480 = 528 cm^2$. Das ist die gesamte Fläche, die zum Beispiel bei vollständiger Beschichtung des Keils bedeckt werden müsste, nicht sein Innenraum.

## Normale Bewertung

{
  "maxPoints": 6,
  "passingPoints": 6,
  "steps": [
    {
      "id": "j7_prism_v6_base",
      "points": 1,
      "description": "Flächeninhalt der dreieckigen Grundfläche korrekt mit Quadrateinheit bestimmen."
    },
    {
      "id": "j7_prism_v6_volume",
      "points": 2,
      "description": "0 Punkte ohne Begründung durch kongruente Dreiecksschichten und korrekte Rechnung G · h = 480 cm³; danach 1 Punkt für diesen Kern, 1 Punkt für die Deutung als Rauminhalt."
    },
    {
      "id": "j7_prism_v6_surface",
      "points": 3,
      "description": "0 Punkte ohne beide Grundflächen, alle drei Mantelflächen und korrekt berechnete 528 cm²; danach 2 Punkte für diesen Kern und 1 Punkt für die Deutung als Beschichtungsfläche."
    }
  ]
}
