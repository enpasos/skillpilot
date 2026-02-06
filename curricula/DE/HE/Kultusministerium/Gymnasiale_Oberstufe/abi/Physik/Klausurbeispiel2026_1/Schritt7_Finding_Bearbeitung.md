# Schritt 7 - Finding-Bearbeitung

Datum: 2026-02-06

## Bearbeitungsprotokoll

### F-001

- Status: geschlossen
- Geplante Änderungen:
  - Aufgabenblatt auf nicht-LaTeX-Mathematik prüfen und umstellen.
  - Musterlösung auf nicht-LaTeX-Mathematik prüfen und umstellen.
  - Display-Math-Blöcke auf Leerzeilen vor/nach `$$` prüfen.
- Ergebnis:
  - Alle mathematischen Ausdrücke in Aufgabenblatt und Musterlösung auf LaTeX-Notation umgestellt.
  - Inline-Mathematik durchgängig mit `$...$` gesetzt (u. a. Variablen, Gleichungen, Beziehungen, Unsicherheiten, Indizes, griechische Symbole).
  - Kritische Stellen korrigiert (z. B. `\\alpha`, `\\lambda`, `\\mu`, `\\sqrt{...}`, `\\sin(...)`, `\\pm`, `\\approx`, `\\cdot`).
  - Es wurden keine neuen Display-Math-Blöcke (`$$...$$`) eingeführt; damit ist die Leerzeilenregel für Display-Math weiterhin erfüllt.
  - Verbleibende Backticks nur für den Dateipfad-Referenzhinweis in der Musterlösung.

### F-002

- Status: geschlossen
- Geplante Änderungen:
  - Orthografische ASCII-Umschreibungen (`ae/oe/ue`) in den beiden Hauptdokumenten identifizieren.
  - Nur echte Umlautfälle im Fließtext umstellen; technische Bezeichner beibehalten.
- Ergebnis:
  - Aufgabenblatt und Musterlösung sprachlich auf `ä/ö/ü` normalisiert (z. B. *Röntgen*, *Dämpfung*, *Näherung*, *Lösungswege*, *Wörterbuch*, *Schweißnähte*).
  - Mathematik/LaTeX-Strukturen unverändert korrekt beibehalten.
  - Technische Ausnahmen (z. B. *Frequenz*, *Resonanzfrequenz*, *Fotoeffekt* sowie Dateipfade) bewusst nicht verändert.

### F-003

- Status: geschlossen
- Geplante Änderungen:
  - GK Vorschlag D von Röntgen/Q3.3 auf GK-konformes Thema umstellen.
  - Musterlösung inhaltlich passend neu aufbauen.
  - Blueprint um niveauspezifische Themenzuordnung GK/LK ergänzen.
- Ergebnis:
  - GK Vorschlag D ersetzt durch „Franck-Hertz-Versuch und Energiestufen“ (Q3.2/Q3.1).
  - GK-Musterlösung D vollständig neu gerechnet (Anregungsenergie, Photonenergie, Modellvergleich, Unsicherheitsbewertung).
  - Q3.3 verbleibt im LK Vorschlag D; Blueprint entsprechend auf level-spezifische Abdeckung erweitert.

### F-004

- Status: geschlossen
- Geplante Änderungen:
  - In GK Vorschlag A die Änderung der Flussdichte als gleichmäßig/linear präzisieren.
  - Passende Annahme in der Musterlösung explizit machen.
- Ergebnis:
  - Materialtext in GK A ergänzt: „sinkt ... gleichmäßig (linear)“.
  - Lösungsteil A3 ergänzt: Induktionsrechnung mit expliziter Linearitätsannahme.

### F-005

- Status: geschlossen
- Geplante Änderungen:
  - Begriff „Tilger“ im LK Vorschlag B didaktisch einordnen.
  - Aufgabenformulierung sprachlich präzisieren.
- Ergebnis:
  - Materialhinweis eingefügt: Definition Schwingungstilger.
  - Aufgabe B2 präzisiert: „Schwingungstilger bzw. Dämpfungsmaßnahme“.

### F-006

- Status: geschlossen
- Geplante Änderungen:
  - Hilfsmittelhinweis im Aufgabentext eng am Wortlaut des Abiturerlasses formulieren.
  - Einschränkung zur eingeführten Formelsammlung explizit und vollständig aufnehmen.
- Ergebnis:
  - Hilfsmittelzeile in den Allgemeinen Hinweisen angepasst auf „die den Prüfungsaufgaben beigefügte ... und eine eingeführte Formelsammlung (ohne Herleitungen, weitergehende physikalische Erklärungen, Beispielaufgaben)“.

### F-007

- Status: geschlossen
- Geplante Änderungen:
  - GK Vorschlag A um Lenz-Kompetenz ergänzen (Richtungsangabe des Induktionsstroms).
  - Musterlösung um entsprechende qualitative Richtungsdeutung erweitern.
- Ergebnis:
  - Aufgabe A3 erweitert: Betrag der Spannung plus Richtung gemäß Lenz'scher Regel.
  - Lösung A3 ergänzt: Induktionsstrom erzeugt ein Feld, das das abnehmende äußere Feld stützt.

### F-008

- Status: geschlossen
- Geplante Änderungen:
  - Musterlösung zu LK C / Moseley um expliziten Hinweis zur korrekten Linearisierungsdarstellung ergänzen.
- Ergebnis:
  - Lösung C4 ergänzt: zulässiger linearer Plot ist $\sqrt{f_{K\alpha}}$ gegen $Z$ (oder umgekehrt); $f_{K\alpha}$ gegen $Z$ gilt nicht als Linearisierung.

### F-009

- Status: geschlossen
- Geplante Änderungen:
  - Bewertungsgrundsätze um signifikante Stellen/Rundung ergänzen.
  - GK D mit explizitem Rückbezug auf die 15 %-Toleranz aus Material 3 schärfen.
- Ergebnis:
  - Bewertungsgrundsätze enthalten nun die Erwartung „2 bis 3 signifikante Stellen“.
  - GK D (Unsicherheitsprüfung) verweist explizit auf die in Material 3 genannte 15 %-Toleranz.

### F-010

- Status: geschlossen
- Geplante Änderungen:
  - Q4-Wahlpflicht in der Landscape-Datenstruktur explizit mit Mindestanzahl absichern.
  - Keine Vermischung mit der späteren Integration konkreter Abiaufgaben.
- Ergebnis:
  - In `DE_HES_S_GYM_2_PHYSIK.de.json` wurde auf Q4-Ebene `extendedData.q4OptionalSelection` mit `poolId: Q4_OPTIONAL`, `minClusters: 2` und Enforcement-Hinweis ergänzt.

### F-011

- Status: geschlossen
- Geplante Änderungen:
  - Fehlende moderne Teilchenphysik in Q4 ergänzen (Standardmodell).
  - Als optionales Themenfeld mit sauberer GK/LK-Differenzierung modellieren.
- Ergebnis:
  - Neues Q4-Optionalcluster „Elementarteilchen und Standardmodell“ ergänzt.
  - Unterziele ergänzt: Teilchenfamilien, Hadronen aus Quarks, fundamentale Wechselwirkungen, Forschungsbezug CERN (LK/Context).
  - Referenzen (`contains`/`requires`) geprüft: konsistent.

### F-012

- Status: geschlossen
- Geplante Änderungen:
  - Leitideen bei Kernphysik im Bewertungs-/Anwendungsbezug schärfen.
- Ergebnis:
  - `LI_TECHNIK` bei Kernphysik-Cluster und beim Knoten „Beurteilung von Strahlungsrisiken und Kernenergie“ ergänzt.

## Prozesshinweis

- Gemäß Nutzerentscheidung wurde die Integration konkreter Abiaufgaben in die Landscape-Datei in dieser Runde bewusst **nicht** vorgenommen.

### F-013

- Status: geschlossen
- Geplante Änderungen:
  - Nach Stabilisierung von Aufgabenblatt und Musterlösung: Integration in die Landscape-Datei analog zum Mathe-Muster.
  - Struktur mit Exam-Cluster, GK/LK-Unterclustern und `examData` je Vorschlag herstellen.
- Ergebnis:
  - In `DE_HES_S_GYM_2_PHYSIK.de.json` wurde ein neuer Abitur-Cluster `Abiturprüfung Physik (Klausurbeispiel 2026/1)` ergänzt und im Root-Goal verankert.
  - GK- und LK-Untercluster mit je vier Vorschlagszielen (A-D) ergänzt.
  - Für alle 8 Vorschlagsziele wurden `examData.taskContent`, `examData.solutionContent` sowie ein BE-`scoring`-Raster aus dem Klausurbeispiel hinterlegt.
  - Referenzielle Konsistenz (`contains`/`requires`) und JSON-Syntax wurden validiert.
