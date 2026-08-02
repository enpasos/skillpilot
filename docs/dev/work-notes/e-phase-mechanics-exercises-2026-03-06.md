# Plan: E-Phase Mechanik Uebungen (Abi-Niveau)

> Historical work-notes record, 6 March 2026. It documents how this work was done at that time.
> It is not current process and not a source of truth.
> Current reference: [graph definition](../../concept/skill-graph/graph-definition.md)

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
- Direkte Unterknoten unter dem Uebungsknoten (ohne GK/LK-Zwischenebene):
  - GK: `835...`, `57e...`, `cbd...`, `a0b...`
  - LK: `73c...`, `80f...`, `6df...`, `ab0...`
- Titelkonvention: keine Praefixe wie `Vorschlag A (LK) -`, stattdessen direkt der Themenname.

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

## 4) Vorgehensmodell (angelehnt an `abi/Physik/exam-example-authoring-guide.md`)

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
- Story-Regel: Eine Aufgabe = eine Gesamtstory. Alle Materialien und Teilaufgaben muessen eindeutig zum selben Szenario gehoeren.
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
- Strukturvorgabe: Nur ein Clusterknoten `Uebungen E-Phase Mechanik`; GK/LK-Sammelknoten entfallen.
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
- [ ] Keine GK/LK-Zwischenebene im Baum unter dem Uebungsknoten; die 8 Aufgaben haengen direkt darunter.
- [ ] Alle 8 Vorschlaege (GK A-D, LK A-D) sind fachlich sauber und abiturorientiert.
- [ ] Aufgabentitel sind themenorientiert benannt (ohne `Vorschlag ...`-Praefix).
- [ ] Story-Regel eingehalten: pro Aufgabe genau eine Gesamtstory, keine unverbundenen Szenarien.
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

## 7) Nachtrag TeX-Rendering fuer ChatGPT (2026-02-12)

Problembeobachtung:
- Im Cockpit werden Formeln korrekt gerendert (ReactMarkdown + `remark-math` + `rehype-katex`).
- In der ChatGPT-Ausgabe wurden Teile aus `examData.taskContent`/`examData.solutionContent` teilweise roh angezeigt (z. B. `$v$`, `$\\Delta v$`).

Ursache:
- AI-Responses liefen ohne allgemeine Delimiter-Normalisierung.
- Eine Sonderbehandlung existierte nur fuer eine einzelne Goal-ID (`bc60e300-96be-599a-89b6-8fcca380803d`), nicht fuer Physik-Aufgaben allgemein.

Technische Anpassung:
- Datei: `backend/src/main/java/com/skillpilot/backend/ai/LearnerAiController.java`
- Anpassungen:
  - Allgemeine Normalisierung fuer AI-Examtexte eingefuehrt:
    - Inline-Math: `$...$` -> `\\(...\\)`
    - Display-Math: `$$...$$` -> `\\[...\\]`
  - Normalisierung wird jetzt fuer `taskContent`, `taskContentEn`, `solutionContent`, `solutionContentEn` angewendet.
  - Bestehende Bildlink-Normalisierung (`/assets/...` -> `/ai-assets/...`) bleibt unveraendert.

Nutzen:
- Ein robustes, ChatGPT-freundlicheres Rohformat fuer mathematische Inhalte.
- Weniger renderer-abhaengige Unterschiede zwischen Cockpit und ChatGPT-Ausgabe.
