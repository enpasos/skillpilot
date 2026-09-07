# B040 Physik: begrenzte Split-Vorprüfung

Abgeschlossen als Untersuchung, **keine Umsetzung**. codex / OpenAI / Modell unknown / Modellversion unknown. Keine Humanfreigabe. Verbindlicher konkreter Entwurfsstand: `layer-a-split-authoring-plan.blind-b.json`; dessen sieben DE/EN-Texte präzisieren den vorläufigen Markdown-Plan. Die JSON-Datei ist ein externer Authoring-Plan und wird von keiner Runtime als kanonische Landschaft geladen.

## Klausuren: beide vollständig gelesen, keine reale Teilabdeckung nachgewiesen

Gelesen wurden alle Goal-Felder, Voraussetzungen, examData, vollständige taskContent/solutionContent und sämtliche scoring-Schritte von `335a75b0-f691-5867-8ce3-3c971d541b9f` und `4a58df57-f791-502f-8b8d-9ba155e46035`. Die vollständigen Aufgaben-/Lösungs-/Bewertungstexte sind im JSON-Plan unter `assessmentChecks` festgehalten.

Beide haben dieselben vier abstrakten Arbeitsaufträge mit 8/10/6/6 BE:

| Teil | Tatsächlicher Textinhalt | Nachweis für S/T/B/DM/DE/G/U oder Kepler |
| --- | --- | --- |
| 1 | Relevante Größen, Modelle und Zusammenhänge darstellen | Kein konkretes Modell oder Objekt benannt; kein Teilziel einzeln nachgewiesen. |
| 2 | Gegebene Mess-/Materialdaten rechnerisch auswerten | Es sind keine solchen Daten enthalten; kein Teilziel einzeln nachgewiesen. |
| 3 | Ergebnis deuten und Modellgrenzen prüfen | Kein konkretes Ergebnis/Modell vorhanden; kein Teilziel einzeln nachgewiesen. |
| 4 | Anwendung/Entscheidung mit physikalischen Kriterien beurteilen | Keine Anwendung/Entscheidung vorgegeben; kein Teilziel einzeln nachgewiesen. |

Der Kontext nennt nur den jeweiligen Klausurtitel. Die Lösung und Bewertung wiederholen die allgemeinen Tätigkeiten; weitere Materialien, externe Aufgabenlinks oder versteckte fachliche Unterfragen existieren in diesen beiden vollständigen Goal-Objekten nicht. `reviewStatus: released` und 14 bzw. 65 `coveredGoalIds` sind vorhandene Metadaten, kein Nachweis tatsächlich geprüfter Inhalte. Root hat diesen Volltextbefund unabhängig bestätigt.

Daher enthalten die Pläne **keinen** Fan-out der drei alten Klausur-IDs auf sieben neue Kinder. `confirmedNewChildCoverage` ist leer, `proposedCoveredGoalIds` ausdrücklich `null` statt einer erfundenen grünen Abdeckung. Root hat die spätere fachliche Assessment-Autorenschaft innerhalb Layer A erlaubt, für jetzt jedoch nur Abschluss dieses Plans angeordnet. Vor operativer Übernahme sind konkrete Materialien, Aufgaben, Lösungen und scoring zu schreiben und dann nur die wirklich geprüften Ziele gemeinsam in `requires` und `coveredGoalIds` aufzunehmen. Der Befund erfordert keinen Runtimeeingriff.

## Q4-Karten: genau eine betroffene Herkunft

Vollständig gelesen: alle 16 Karten in `curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_structure_q4.de.json`, alle 16 zugehörigen Origin-Records in `quality/memory-card-review/canonical-physics-full.cards.review.jsonl`, die drei bisherigen Goal-Entscheidungen und die komplette native Memory-Config. Public-Runtime-Datei: `app/public/data/de_gymnasium_physics_flashcards_structure_q4.de.json`.

Nur `physics_q4_c15` (Rotverschiebung) hat eine Herkunft unter den drei Sammelzielen: bisher ausschließlich `e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9`. Keine Karte verweist auf c940 oder 5db. Die 15 anderen Karten und ihre bestehenden Herkünfte bleiben unangetastet.

Konkreter Plan: c15 mit unveränderter Card-/Deck-ID behalten; Herkunft und `goal:`-Tag auf B `c52d55c3-b687-586c-b0f9-8ffcd1069424` umstellen. Den missverständlichen bisherigen Klammerausdruck „Doppler-Effekt bzw. kosmologische Expansion“ durch die im JSON-Plan vollständig formulierte kosmologische Wellenlängenstreckung ersetzen. Keine zusätzliche Rotverschiebungsrechnung oder CMB/DM/DE-Memorykarte erzeugen. B erhält die begründete Entscheidung `memory_required`, Memoryziel bleibt `266b6cf8-d49d-5197-862c-9998fcf179a5`, Deck bleibt `de_gymnasium_physics_structure_q4`; die übrigen sechs neuen Ziele erhalten einzeln begründet `no_memory_needed` als Autorenentwurf, noch keine operative Review-Freigabe. Im Q4-Memoryziel c940 als Voraussetzung durch B ersetzen, nicht durch alle Kinder. Alle übrigen bestehenden Voraussetzungen bleiben unverändert.

Es gibt derzeit keine separate englische Q4-Public-Deck-Datei. Die englische Kartenerläuterung im Plan ist Reviewhilfe, keine autorisierte neue Deckveröffentlichung. Alte Ziel-/Karten-Fingerprints werden nach einer tatsächlichen Änderung nativ erneuert; kein bloßes Umbinden als fachlicher Ersatz.

## Runtime: native Komponentenprüfung mit positiver und negativer Kontrolle

Die unveränderten Produktionspfade wurden im Quelltext gelesen und ihre kompilierten Methoden auf einem ausschließlich im Speicher geklonten Physikgraphen aufgerufen. Helper: `tmp/PhysicsB040RuntimeAudit.java`. Es gab keine Datenbank, HTTP-Sitzung, Learner-State-, Runtimequelltext- oder kanonische Änderung. Java 25.0.2; bestehende Lookup-Dienste werden gemockt, die eigentlichen getesteten Aggregations-/Projektions-/Statistikmethoden und der Provenienz-Merge sind native Methoden.

Primärer Beleg: `runtime-cluster-mastery.readonly-receipt-v2.json`, beobachtet 2026-09-07T01:07:56.233202332Z bis 01:07:57.974569914Z, **11/11 Kontrollen PASS**. Der frühere Zehn-Kontrollen-Beleg bleibt historisch erhalten; v2 ergänzt ausdrücklich den externen Registry-Fall. Quellen-/Class-/Helper-Hashes und technische JVM-/Mockito-Warnungen stehen unverändert im Receipt.

- `LearnerService.java:6580` und `:6623`: Cluster-Effektivwert und Cluster-Prerequisitewert werden bei vorhandenen Kindern aus den Kindwerten berechnet. Alter Elternwert 1, neue Kinder ohne Werte ergibt 0 für Kinder und Eltern. Ein echter Kindwert 1 verändert Geschwister nicht.
- `LearnerService.java:8098`: `computeAtomicStats` zählt `type=cluster` nicht als atomare Beherrschung. Testscope sieben neue Kinder plus bestehendes Kepler: 0/8 gemeistert trotz drei alten Elternwerten 1. `:7155` nutzt genau diese Atomstatistik für `scopeCompleted`.
- `LearnerService.java:5772` und `:5958`: Frontier entscheidet anhand des zielindividuellen effektiven Werts und dessen effektiver Voraussetzungen. Neue Kindwerte bleiben 0; eine Eltern-1 unterdrückt sie nicht. `:10639` vererbt zwar Cluster-Voraussetzungen, nicht aber Eltern-Mastery; darum müssen die drei Cluster ihre alte breite Requires-Kette verlieren.
- `app/src/hooks/useMasteryCalculation.ts:29`: Frontendwert wird für Blätter aus eigener UUID/ShortKey gelesen, für Cluster aus Kindern aggregiert. `useAppCore.ts:827` bindet diese Funktion ein. `LearnerView.tsx:1411` traversiert Containerkinder weiter, statt einen alten Containerwert als Abbruch zu benutzen.
- **Negativkontrolle:** `LearnerService.java:1972–2080` projiziert exact Legacy-Mastery auf neue sichtbare Kinder, wenn deren aufgelöste Provenienz `splitFromCanonicalGoalId` auf den Elternknoten zeigt. Dieser Schlüssel ist operativ und darf für diesen Split nicht gesetzt werden.
- `LandscapeService.java:559–589`: Provenienz stammt sowohl aus `canonical-goal-provenance-registry.json` als auch `extendedData.provenance`; embedded überschreibt Registrywerte. Die v2-Kontrolle bestätigt native Masteryprojektion durch beide Orte getrennt. Daher reicht „keine extendedData am Goal“ als Sicherheitsprüfung nicht.
- Weitere Negativkontrolle: Fehlen im Projektionsgraphen **alle** Kinder eines Clusters, kann der effektive Elternwert auf den gespeicherten Wert zurückfallen. Die sichere Authoringbedingung ist daher ein explizit korrekter target-/prerequisiteOnly-Baum mit allen tatsächlich intendierten Kindern, keine unsichtbaren neuen Ziele hinter einem leeren sichtbaren Cluster.

Die drei aktuellen Physik-Registryeinträge enthalten nur ihre tatsächlichen HE-`sourceLandscapeId`/`sourceGoalId`, keinen `splitFromCanonicalGoalId`. Die sieben vorgeschlagenen IDs existieren dort noch nicht. Der sichere Plan führt Split-Herkunft extern im Review-/Authoring-Plan und echte fachliche Quellen separat; er schreibt den operativen Mastery-Projektionsschlüssel an **keinem** der beiden Orte und erzeugt keine neuen exact Legacy→Kind-Masteryzuordnungen.

Grenze des Belegs: native Komponentenprüfung plus gelesene Aufrufer, kein vollständiger HTTP-/Browser-End-to-End-Test eines bereits implementierten Splits. Für den noch nicht geschriebenen konkreten Composition-Diff kann dieser Test keine zukünftige Sichtbarkeit garantieren; diese wird nach dem tatsächlichen Authoring zusätzlich nativ geprüft.

## Konkreter Authoringstand

`layer-a-split-authoring-plan.blind-b.json` enthält sieben vollständige DE/EN-Zielobjekte, drei Alt-ID-Clusteränderungen, 13 genaue Before-/After-Requires-Änderungen einschließlich Q4-Memory, c15-Text-/Origin-Diff, HE-Einzelzuordnungen und explizite enge Landes-Scopes. G fordert dort bewusst keine zusätzlichen Galaxienverbandsdetails; BW-Doppler und HH-Zeitleiste werden nicht als Beleg für das gesamte Kosmologiepaket umgedeutet. DE hat hier nur HE als direkten Quellenscope.

In-Memory-Graphcheck am 2026-09-07T01:10:23.111Z: keine neuen ID-Kollisionen, keine fehlenden neuen Voraussetzungsknoten, keine Requires- oder Contains-Zyklen. Das ist keine Freigabe der noch fehlenden konkreten Assessment- und Composition-Diffs. Vorbereitungsuntersuchung abgeschlossen; kanonische Umsetzung bleibt unangetastet und wird gesondert beauftragt.
