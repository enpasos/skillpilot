# Informierter zweiter KI-Bildreview: Stochastische Matrizen

Prüfzeit: 2026-09-13T20:26:51Z. Lernziel-ID:
`6aa593a3-6690-581d-9b7d-37cac78187a1`.

Entscheidung: **fachlich geeigneter KI-Bildkandidat** (`pass`, `ai_candidate`).
Der zusätzliche Matrixfaktor aus dem B045-Hold ist entfernt. Dies ist eine
informierte Bildprüfung nach Kenntnis der alten Befunde, kein blinder D-Review,
keine menschliche Bildfreigabe und kein fachlicher Abschluss. Der ursprüngliche
BLOCK/KEEP-Dissent bleibt unverändert erhalten. Es wurde weder importiert noch
eine Kanonik-, QA-, P- oder Registrybindung verändert.

## Geprüfte Dateien und Zielbindung

- Kandidat: `candidate-v1.png`, SHA-256
  `f34042afdc514ce3c7195579a89409352a54e21cd480c2b624d9e255cee759df`.
- Original: `app/public/assets/goal-visualizations/mathematik/6aa593a3-6690-581d-9b7d-37cac78187a1/6aa593a3-6690-581d-9b7d-37cac78187a1.jpg`,
  SHA-256 `7b8e8e1bfb93b1a06ab1bc83fe2f8f142dd7cb1901a7a12d3bdec151146edcdb`.
- Beide vollständigen tatsächlichen Dateien wurden mit `view_image` geöffnet;
  der PNG-Kandidat wurde in Originalauflösung geprüft. Die Beurteilung beruht
  auf sichtbaren Formeln, Zahlen und Beschriftungen, nicht nur auf dem Prompt.
- Aktuelles Ziel: Übergangsprozesse als Markov-Ketten mit stochastischen
  Matrizen modellieren, Wahrscheinlichkeiten begründet festlegen und die Matrix
  im Kontext interpretieren. Die aktuelle deutsche und englische Beschreibung
  tragen dieselbe Kompetenz. Das Anbieterbeispiel ist dafür passende
  Orientierung; das Bild ersetzt keine eigenständige Modellbegründung.

## Konkrete fachliche Prüfung

Die untere Produktdarstellung beginnt nun direkt mit der ausgeschriebenen
Matrix. Davor steht kein zusätzliches `M`. Oben wird korrekt `v1=M*v0`
angegeben. Die vollständig gelesene untere Gleichheitskette lautet:

```text
[[0.8, 0.3], [0.2, 0.7]] * (0.9, 0.1)^T
  = (0.72+0.03, 0.18+0.07)^T
  = (0.75, 0.25)^T
```

Sie beschreibt genau einen Schritt. Ein versehentlicher zweiter Schritt würde
`(0.675,0.325)^T` ergeben und steht nirgends im Kandidaten. Die darüber nochmals
ausgeschriebenen beiden Skalarprodukte sind ebenfalls korrekt.

Alle vier Tabellenzellen wurden gegen Zeilen- und Spaltenüberschriften geprüft:

- A nach A: `0.8`, 80% bleiben bei A.
- B nach A: `0.3`, 30% wechseln zu A.
- A nach B: `0.2`, 20% wechseln zu B.
- B nach B: `0.7`, 70% bleiben bei B.

Spalten stehen für Ausgangszustände, Zeilen für Zielzustände. Die Matrix ist
quadratisch; beide Achsen verwenden denselben Zweizustandsraum. Alle Einträge
sind nichtnegativ; `0.8+0.2=1` und `0.3+0.7=1` stimmen mit den gedruckten
Spaltensummen überein. Beide Summenpfeile gehören zur richtigen Spalte.

Aus `v0=(0.9,0.1)^T` folgen rechnerisch `0.8*0.9+0.3*0.1=0.75` und
`0.2*0.9+0.7*0.1=0.25`. Die im Bild mehrfach wiederholten Anteile 90%/10%
beziehungsweise 75%/25% sind sämtlich konsistent und summieren sich jeweils zu
100%. Eine zusätzliche lokale Matrixmultiplikation bestätigt die Werte;
binäre Dezimalrundung ist kein dargestellter Sachfehler.

## Darstellung und Grenzen

Das neue Bild erhält den pastellfarbenen Tabellenaufbau, die abgerundeten
Informationsfelder und die gut unterscheidbaren Ausgangs-/Zielbeschriftungen
des Originals. Alle sichtbaren Matrixeinträge, Vektorklammern, Dezimalpunkte,
Prozentangaben und Überschriften sind in der geprüften Datei lesbar. Es wurden
keine überdeckten entscheidenden Werte, falschen Faktoren, neuen Formelfehler
oder sonstigen blockierenden Darstellungsprobleme gefunden.

Die beiden kleinen gleich großen Personengruppen sind unverändert dekorative
Anbietersymbole. Sie bilden keine proportionale Personenzählung ab; die
Verteilung wird eindeutig durch die ausgeschriebenen Prozentwerte angegeben.
Daraus wird weder ein weiterer Fehler noch ein Nachweis einer mengengetreuen
Piktogrammstatistik abgeleitet. Die festen Zahlen dienen als Beispiel einer
gewählten Matrix; eine datenbasierte Begründung der Übergangswahrscheinlichkeiten
muss im Unterricht beziehungsweise im separaten P-Profil stattfinden.

Der Review gilt nur für die gebundenen vollständigen PNG-Bytes. Eine später
gerenderte Buchseite, mobile Hostdarstellung oder tatsächliche Lernleistung
wurde nicht geprüft. Erst neue aktuelle D-Inputs und die getrennten vorgesehenen
Prüfungen können einen fachlichen Abschluss tragen; der alte KEEP-Record darf
nicht stillschweigend auf diese neue Bilddatei übertragen werden.
