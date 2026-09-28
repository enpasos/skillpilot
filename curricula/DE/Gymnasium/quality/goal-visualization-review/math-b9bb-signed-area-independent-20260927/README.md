# Unabhängige Bildprüfung: Hauptsatz und orientierte Flächenbilanz

KI-Review-Kandidat vom 27.09.2026; **keine menschliche Freigabe**, kein Import
und keine Änderung des aktiven QA-Ledgers.

- Ziel: `b9bbd2a8-1379-5ffb-817f-41467d48abef`, aktueller kanonischer
  Text „Hauptsatz der Differential- und Integralrechnung nutzen“: den
  Ableitung-Integral-Zusammenhang beschreiben, mit einer passenden
  Stammfunktion `F(b)-F(a)` berechnen und als orientierte Flächenbilanz
  deuten.
- Kandidat: `/home/enpasos/.codex/generated_images/01a03a32-5c3d-7122-a394-13d4f26b0054/exec-5b11ddea-97dc-43a1-ae51-bf43c093a390.png`,
  1672 × 941 Pixel, SHA-256
  `00d1970fc7a39e34038b04a78f4f776b6e79e3b4e4c079227f06c224c2466884`.
  Der Prüfgegenstand ist genau diese Datei, nicht ein späterer Import.

## Fachliche Sichtprüfung

- Die blaue Gerade `f(x)=2x−2` verläuft durch die beschrifteten Punkte
  `(0,−2)`, `(1,0)` und `(3,4)`; auch bei `x=2` liegt sie sichtbar bei
  `y=2`. Achsenticks, Nulldurchgang und senkrechte Intervallgrenzen bei
  `x=0` und `x=3` passen zur Funktion.
- Unter der x-Achse liegt auf `[0,1]` ein Dreieck mit Grundseite 1 und
  Höhe 2: sein **orientierter** Beitrag ist `−1`. Auf `[1,3]` liegt ein
  Dreieck mit Grundseite 2 und Höhe 4: sein Beitrag ist `+4`. Orange und
  Türkis sind richtig getrennt; `−1+4=3` ist keine geometrische
  Gesamtfläche, sondern die geforderte Bilanz.
- `F(x)=x²−2x` hat `F′(x)=2x−2=f(x)`; `F(3)=9−6=3` und `F(0)=0`.
  Deshalb gilt `∫₀³ f(x) dx = F(3)−F(0)=3`. Alle sichtbaren Zahlen,
  Vorzeichen und Gleichheitszeichen sind korrekt.
- Das Bild demonstriert genau die aktuelle Zielverengung: eine passende
  Stammfunktion nutzen, das bestimmte Integral berechnen und die negative
  mit der positiven Teilfläche verrechnen. Es behauptet **nicht**, die
  selbständige Bildung beliebiger Polynom-Stammfunktionen zu prüfen.

Bei einer diagnostischen Darstellung mit 360 Pixel **Gesamtbreite** blieben
Titel, Graph, Zahlen, `F′=f` und `−1+4=3` lesbar. Die Integralzeile ist der
kleinste Textbereich, aber noch erkennbar; ein normaler Mobil-Zoom verbessert
sie zusätzlich. Keine überlappenden Labels, abgeschnittenen Formeln oder
anderen sichtbaren Artefakte.

**Urteil: AI-KEEP-Kandidat für V-Inhaltsqualität.** Kein erkennbarer
fachlicher oder mobiler Blocker. Eine spätere formale V-Entscheidung muss
nach Import den tatsächlichen aktiven Asset-Hash, die Kopien, Alt-Text und
die aktuelle Zielbindung erneut prüfen; diese Notiz allein setzt kein Gate.
