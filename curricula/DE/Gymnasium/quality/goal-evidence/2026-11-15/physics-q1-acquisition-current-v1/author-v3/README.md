# Q1-Aufgabenkandidat v3 – kohärenter Autoren-Nachfolger

**Entwurf; unabhängige exakte Delta-Prüfung und native Freigabe stehen aus.**

Der vollständige Kandidat steht in content-candidate.json: 27 neue Aufgaben für
35 ganze gewöhnliche Q1-Ziele. Versiegelte v1-/v2-Dateien bleiben unverändert.
v3 übernimmt sämtliche 84 direkten Schrittschranken und beide Geometrie-
präzisierungen aus v2. Jeder Vierpunkte-Schritt erhält bei fehlender
wesentlicher Aussage/Übertragung höchstens 1 Punkt; ausschließlich die
normale Schrittsumme entscheidet. Höchste Summe bei Auslassung M−3,
Bestehen M−2; ein kleiner Fehler bei vorhandenen Kernen erreicht M−1.

Root las Indizes 0–8 unabhängig, physics_release_finish Indizes 9–26.
Der abgeschlossene Inhaltsdurchgang ergab die folgenden begrenzten Befunde;
dieses Dokument behauptet ihre nachträgliche Abnahme nicht.
exact-v2-to-v3-delta.json zeigt exakt 15 geänderte Felder in 6 Aufgaben,
alle anderen Werte sind identisch zum gepinnten v2-Kandidaten:

- Index 7 / c6b7efac: Lauf B ergibt 1,76047728495·10^11 C/kg, daher vierstellig
  gerundet 1,760 statt 1,761 in DE/EN.
- Index 13 / 381f58b8: signierte Anfangsstromrelationen und τ=RC ausdrücklich
  als Materialhilfe, weil der gesicherte Kontext kein Ohmsches Gesetz enthält.
  Der positive 40-µA-Wert gehört ausdrücklich zur Ladephase.
- Index 14 / 7653d84d: N konkret als erwartete Anzahl verbleibender instabiler
  Kerne benannt; vollständiges Abnahmemodell gegeben, kein Kernphysikvorwissen.
- Index 16 / 09c50c4c: elementare gaußsche Flusshilfe mit normaler Feldkomponente,
  Deckelflächen und Mantelfluss null statt vorausgesetztem Oberflächenintegral.
  Physikalische Begründung und Plattenüberlagerung bleiben Lernendenaufgabe.
- Index 18 / 0236971f: beide Kondensatoren vor der Motorentladung ausdrücklich
  von sämtlichen Quellen getrennt, wie die Energiebilanz bereits voraussetzt.
- Index 21 / a2a7d916: klare vier Zeit-/Spannungswerte in DE/EN; qualitative
  magnetische Richtungsregel als Materialhilfe. Raster und Lösung verlangen
  kein formales Kreuzprodukt. Richtung/Ladung, Geschwindigkeitsabhängigkeit
  und Arbeitsvergleich bleiben verlangt.

Keine Änderung fügt eine gewöhnliche Kompetenz oder ein Prärequisit hinzu.
Whole-P-Profile, native Kontexte und bisherige 63 Zahlenchecks sind über
review-input-references.json mit genauen v1-/v2-Pins gebunden.
review-pack.json enthält das qualitative CRT-Kriterium und Gegenantworten.

final-author-checks.json prüft alle 84 betroffenen Schritte über sämtliche
zulässigen Ganzzahlsummen und ergänzt 7 numerische Konsistenzchecks.
Der positive RC-Sensorwert passt zu einem möglichen Ladezeitfenster; dies
behauptet keinen tatsächlich gemessenen Zeitpunkt. Autorenchecks sind keine
unabhängige Inhaltsprüfung oder Lernendenleistung.

Keine aktiven Canonical-/View-/Registry-/Git-/Ergebnisdateien geändert.
Die eigene frühe 72eff-Aufgabe liegt separat unter
tmp/physics-seki-digital-acquisition-20261115-v1/ und behält 8×2 mit 15/16.
