# Plan: E-Phase Mechanik Uebungen (Abi-Niveau)

## 1) Ziel

Unter dem Knoten `Einführungsphase Mechanik` in  
`curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json`  
soll der Uebungsbereich auf Abi-Niveau fachlich und formal sauber aufgesetzt werden.

Wichtig:
- Nur Inhalte, die in den Skill-Knoten der E-Phase Mechanik abgedeckt sind.
- Keine Themen, die erst spaeter kommen (Beispiel: Federaufgaben).
- Bestehende Knotenstruktur moeglichst stabil halten (IDs behalten, Inhalte verbessern).

## 2) Ist-Stand (relevante Knoten)

- Hauptknoten Mechanik: `25bd8476-0c87-4777-b9f5-0bba9ad1b06e`
- Uebungsknoten: `56df0c93-e489-4534-9063-a98c6ff2411c`
- GK-Sammelknoten: `f02dcb66-48ca-4c48-995e-04fc626158b5`
- LK-Sammelknoten: `c611dca5-a45e-4b6a-aca2-c8f652f95534`
- Aktuelle Vorschlaege: GK A-D (`835...`, `57e...`, `cbd...`, `a0b...`), LK A-D (`73c...`, `80f...`, `6df...`, `ab0...`)

## 3) Harte Scope-Regeln (fachlich)

Zulaessig sind nur Themen aus dem Unterbaum von `Einführungsphase Mechanik`, insbesondere:
- Methoden E-Phase (`541b3c87-...`)
- Bewegungen (`af70212d-...`)
- Newton/Erhaltung (`52c3d2e8-...`)
- Reibung/weitere Bewegungen (`3d235018-...`, `242f0487-...`)
- Waagerechter Wurf/Superposition (`b552ca1c-...`)
- Kreisbewegung (`a109d4fe-...`)
- Gravitation (`44882cb3-...`)
- Thermodynamik-Grundlagen (`98c7a125-...`)
- Drehbewegungen (`3f0058c3-...`)

Nicht zulaessig:
- Themen ohne Skill-Abdeckung in dieser E-Phase-Teilstruktur.
- Konkretes Beispiel fuer Ausschluss: Federmodelle/Federpuffer/Federkonstante, solange dafuer im E-Phase-Mechanik-Unterbaum kein expliziter Skill-Knoten vorhanden ist.

## 4) Vorgehensmodell (angelehnt an `abi/Physik/prompt.md`)

### Schritt 1: Scope-Audit und Mapping

- Fuer jede geplante GK/LK-Aufgabe ein `coveredSkills`-Mapping erstellen (intern in Notizen oder in `extendedData`).
- Pro Aufgabe mindestens 2-3 direkte Skill-Bezuege.
- Jede Teilaufgabe muss einem oder mehreren dieser Skills eindeutig zugeordnet sein.

### Schritt 2: Blueprint vor dem Umschreiben

- Blueprint-Tabelle fuer 8 Vorschlaege (GK A-D, LK A-D):
  - Zielknoten-ID
  - Themenfokus
  - GK/LK
  - AB-Niveau (GK AB2, LK AB3)
  - Materialtyp (Tabelle/Diagramm/Text)
  - betroffene Skill-IDs
- Benutzeridee aufnehmen:
  - LK-Vorschlag mit ueberhoehter Kurve auf Autorennstrecke und maximaler Kurvengeschwindigkeit (Kreisbewegung, Reibung, Kraeftezerlegung).

### Schritt 3: Aufgabeninhalt neu schreiben

- Aktuelle Klausurknoten inhaltlich ueberarbeiten (nicht nur minimal patchen).
- Aufgaben sollen materialgebunden, selbsterklaerend und selbstaendig bearbeitbar sein.
- Keine Copy/Paste-Strukturen aus Abi-Referenzen.

### Schritt 4: Musterloesung + Bewertung

- Jede Teilaufgabe mit nachvollziehbarem Loesungsweg.
- Punkteschritte transparent; Summe der Schrittpunkte == `maxPoints`.
- `passingPoints` konsistent (GK typischerweise 15/25, LK 18/30, falls nicht fachlich begruendet abweichend).

### Schritt 5: Sprach- und Formelsanierung (Pflicht-QS)

- Deutsche Texte mit echten Umlauten im Fliesstext (nicht `ae/oe/ue`, ausser in technischen Bezeichnern).
- Alle Formeln in LaTeX:
  - inline: `$...$`
  - abgesetzt: `$$...$$`
- Keine Pseudocode-Formeln mehr wie `sqrt(mu/r)` oder `A -> B` im finalen Inhalt.
- Einheiten und Symbolik konsistent (z. B. `\mu`, `\Delta`, `\omega`, SI-Einheiten).

### Schritt 6: JSON-Integration

- Vorzugsweise bestehende Vorschlags-IDs beibehalten und Inhalte aktualisieren.
- `requires` je Vorschlag gegen Scope pruefen (nur zulaessige E-Phase-Mechanik-Goals referenzieren).
- Nur dann neue IDs anlegen, wenn Struktur fachlich zwingend geaendert werden muss.

### Schritt 7: Technische Validierung

- Graph/Schema lokal validieren:
  - `cd app && npm run validate:graph`
- Zusaetzlich gezielt auf Qualitaetsprobleme pruefen:
  - kein ASCII-Umlaut-Ersatz in deutschen Aufgaben-/Loesungstexten
  - keine nicht-LaTeX-Formelreste in `examData.taskContent` und `examData.solutionContent`
- Danach finaler manueller Fach-Review.

## 5) Entwickler-Vorgabe (Definition of Done)

Ein PR ist fuer diesen Abschnitt nur dann fertig, wenn alle Punkte erfuellt sind:

- [ ] Uebungsknoten unter `Einführungsphase Mechanik` ist fachlich strikt innerhalb der E-Phase-Mechanik-Skills.
- [ ] Alle 8 Vorschlaege (GK A-D, LK A-D) sind fachlich sauber und abiturorientiert.
- [ ] Kein unzulaessiges Thema (insb. keine Federaufgaben) in diesem Abschnitt.
- [ ] Alle Formeln in LaTeX, keine ASCII-Formelersatzsyntax.
- [ ] Deutsche Rechtschreibung im Fliesstext mit Umlauten und konsistenter Fachsprache.
- [ ] Scoring ist in jedem Vorschlag rechnerisch konsistent (`steps`-Summe = `maxPoints`).
- [ ] `npm run validate:graph` laeuft ohne Fehler.

## 6) Empfohlene inhaltliche Verteilung (Kurz)

- GK A: Bewegungsanalyse + freier Fall
- GK B: Kraeftebilanz/Newton + Reibung
- GK C: Energie/Impuls in alltagsnahen Stoss- oder Sicherheitskontexten (ohne Feder)
- GK D: Kreisbewegung + Gravitation + Thermodynamik-Basis
- LK A: Mehrphasenbewegung + Modellpruefung + Unsicherheiten
- LK B: Autorennstrecke mit ueberhoehter Kurve und `v_max` (Benutzeridee)
- LK C: Orbitaldynamik + Energiebilanzen
- LK D: Thermodynamik + Drehbewegung + Wirkungsgradbewertung
