# B038h: HE G9 10.2 — sieben Kinder und drei Logarithmus-Verweise

Status 2026-09-06: **AI-Kandidat, nicht übernommen; Routenabschluss noch offen.** Eigenständige aktuelle Quellen-/DAG-Prüfung, keine menschliche Freigabe und keine Übernahme historischer D-/P-Urteile. Gemäß Arbeitsauftrag bleiben alle sieben Clusterkinder als B038h offen; B038 wird zunächst nur mit den 13 unabhängigen Zielen weitergeführt. Diese Datei ersetzt nicht die unveränderten B20-Records.

## Tatsächlich gelesene Quellen

Die aktuelle lokale Original-PDF-Seite 38 des G9-Lehrplans (PDF-Seite 39) einschließlich Tabelle 10.2 und Erläuterungen sowie KC 7.3, gedruckte S. 29, wurden gezielt gelesen. Amtliche Online-Fassungen wurden in der vorangegangenen Diagnose geprüft. Das KC ist binding-core, die G9-Jahrgangslinie eine im Repository ausdrücklich so bezeichnete legacy-grade-sequencing-reference.

- [KC Mathematik Gymnasium](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf): einfache Potenz-/Exponentialfunktionen und Darstellungen.
- [G9 Mathematik, 10.2, S. 38](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-mathematik.pdf): reale Wachstums-/Zerfallskontexte, konkrete Exponentialgraphen, Halbierungs-/Verdopplungszeiten, Logarithmus als Umkehrung, Logarithmusgraphen, Modelle aus Daten und Modellgrenzen. Kein Auftrag zur Ableitung von e^x, kein Zwang zu kontinuierlichen e-Modellen, keine BY-Grenzwertdominanz.

Quell-Extraktion: `curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_MATHEMATIK_SEKI_KC_G8_G9.source-extraction.json:1195`; einzelne Quellziele 10.2 ab `:15012`. Vollständige Originalformeln wurden mittels `pdftotext -f 39 -l 40 -layout .../g9-mathematik.pdf -` und `pdftotext -f 29 -l 29 -layout .../kerncurriculum_mathematik_gymnasium.pdf -` kontrolliert.

## Fachliche Entscheidung je Kind

| B038-Seite | ID | HE-G9-Vorschlag und Grenze |
| --- | --- | --- |
| 7 | 781f133a-08bb-54b9-8fda-efa2f8f9b12c | Behalten, neu konkret auf Kontextzeile 03 mappen; Interpretation aus Darstellungen ist stufengerecht. Ableiten ist keine Voraussetzung. |
| 8 | 346efb31-c400-5bd3-a698-dd9a7e1bc3f7 | Bestehende partial-Kante aus Zeile 04 behalten. Keine neue Zuordnung nötig. |
| 9 | 628928a6-4f48-54dc-952d-dec0e69dc856 | Aus dieser Sek-I-Quellprojektion entfernen: die kanonische Leistung schließt Ableitung und Begründung von e^x-Eigenschaften ein. Inhalt nicht abschwächen. |
| 10 | f05acdc5-4949-54c7-b8cd-56ddd1fbdbad | Aus dieser Sek-I-Quellprojektion entfernen: explizites kontinuierliches Modellieren mit e^x ist nicht durch den allgemeinen Wachstumsauftrag gefordert. Kein Ersatz-Mapping bloß wegen mathematischer Darstellungsäquivalenz. |
| 11 | d900e0a4-0c45-50dd-a37b-01f9f91a134c | Behalten, konkret partial auf Zeile 06 mappen. Logarithmieren löst den unbekannten Exponenten; Kontext und Prüfung beruhen zusätzlich auf dem Anwendungszusammenhang. Voraussetzung muss Logarithmusverständnis statt e^x-Ableitung sein. |
| 12 | ab720928-9dbc-53c2-a1f8-865dda92122d | Behalten, konkret partial auf Datenmodellierungszeile 08 mappen. Prognosen bleiben modellgebunden; Zeile 09 benennt Grenzen. |
| 13 | 49f9059a-876c-5051-8146-d008b5cc691c | Aus dieser Sek-I-Quellprojektion entfernen. Konkreter Graphvergleich aus Zeile 05 rechtfertigt nicht den asymptotischen e^x-/Potenz-Grenzwertvergleich. Kanonischer/BY-Inhalt bleibt erhalten. |

## Exaktes Mapping-Delta

Native Datei:
`curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json`.

Entfernen, bisher exact:

- `he-math-seki-g9-10-2-07-5e841891` → `48e7615d-3e6e-4b5c-9df3-310e510f91f0` (Mapping `:5791`, Quellentscheid `:14627`).

Ergänzen, jeweils **partial**, keine Behauptung, dass eine einzelne Zeile jede kanonische Teilleistung wörtlich abdeckt:

- `he-math-seki-g9-10-2-03-4efce4b0` → `781f133a-08bb-54b9-8fda-efa2f8f9b12c`.
- `he-math-seki-g9-10-2-06-6ae4d32a` → `d900e0a4-0c45-50dd-a37b-01f9f91a134c`.
- `he-math-seki-g9-10-2-08-f88dcace` → `ab720928-9dbc-53c2-a1f8-865dda92122d`.

Die drei vorhandenen Verweise von Zeile 07 bleiben, werden aber von exact auf partial präzisiert:

- `3c1d6ce7-099e-4267-9ff2-3d1526209a89`: inverse Operation passend; numerische Logarithmenbestimmung steht ausdrücklich in Zeile 06.
- `c15fe32d-1c83-4127-b1a4-9125af3d8f5d`: passende Anwendung von Umkehrbarkeit und Definitions-/Wertemenge auf Exponential-/Logarithmusfunktionen; keine vollständige Untersuchung beliebiger Familien aus dieser einen Zeile ableiten.
- `dbc13bb0-963b-49a8-a441-2183f4b64c8e`: Beziehung der betreffenden Umkehrgraphen passend; allgemeine Graphrelation wird hier konkret angewandt.

Die vier betroffenen `decisions` (03, 06, 07, 08) erhalten jeweils dieselben Zielmengen wie ihre `mappings`, aktuelle individuelle AI-Kandidatenbegründungen und offen als AI-Kandidat ausgewiesene Review-Metadaten. Andere bisherige Zuordnungen dieser Zeilen werden nicht neu freigegeben. Zeile 04 und übrige Quellen bleiben unverändert. Anzahl der Mapping-Kanten insgesamt: netto +2; kein neues Quellziel.

## Kleinster fachlicher Requires-Kandidat innerhalb der erlaubten 7+3

Die tatsächlichen Zieldefinitionen zeigen zwei falsche Calculus-Voraussetzungen: `858113c5-e53b-57bb-b01f-ba95c3ddcb6f` bedeutet **Ableitungen elementarer Funktionen berechnen**, `b9bbd2a8-1379-5ffb-817f-41467d48abef` den **Hauptsatz der Differential- und Integralrechnung**. Beides ist für die betreffenden elementaren Kompetenzen nicht notwendig.

| Ziel | requires vorher | requires nachher, Kandidat |
| --- | --- | --- |
| 781f133a-08bb-54b9-8fda-efa2f8f9b12c | 71cec9fb-3751-4d61-8b34-c5adbbf6e5f2; 858113c5-e53b-57bb-b01f-ba95c3ddcb6f | 71cec9fb-3751-4d61-8b34-c5adbbf6e5f2 |
| d900e0a4-0c45-50dd-a37b-01f9f91a134c | 628928a6-4f48-54dc-952d-dec0e69dc856 | 3c1d6ce7-099e-4267-9ff2-3d1526209a89 |
| c15fe32d-1c83-4127-b1a4-9125af3d8f5d | b9bbd2a8-1379-5ffb-817f-41467d48abef; 858113c5-e53b-57bb-b01f-ba95c3ddcb6f; 71cec9fb-3751-4d61-8b34-c5adbbf6e5f2 | 71cec9fb-3751-4d61-8b34-c5adbbf6e5f2 |

Eine zusätzliche Bindung von d900 an Verdopplungs-/Halbwertszeitberechnungen wäre fachlich unnötig; die passende inverse Operation ist im bestehenden 3c1-Ziel enthalten. Die Grundoperationen/Potenzen sind dort bereits upstream. Das ab-Ziel bleibt an d900 gebunden; dbc13 bleibt an c15 gebunden. Keine ID-, Titel-, Beschreibungs-, contains-, Tag-/core- oder Jurisdiktionsänderung vorgeschlagen. Diese Requires-Änderungen sind kanonisch, also nicht nur HE-wirksam; ihre tatsächliche spätere Übernahme benötigt die normale frische Bindung/QA.

**Noch offene Grenze, ausdrücklich nicht grün:** `71cec9fb-3751-4d61-8b34-c5adbbf6e5f2` ist der E-Orientierungseinstieg „Warum Mathematik?“, in der aktuellen HE-G9-Zielmenge nicht sichtbar. Nach den vorgeschlagenen mathematischen Bereinigungen bleiben drei direkte offene Orientierungskanten von 781, c15 und dbc13. Keine stille Ersetzung durch eine andere Motivation, kein fingiertes Mastery und keine neue View-Mutation. Als nächster kleinster Abschluss-Schritt ist genau diese Orientierung-/Projektionsentscheidung im bestehenden Layer-A-Modell zu klären, nicht nochmals der ganze Fachbereich.

## Read-only-Emitter, Prüfungen und nativer Folgeweg

`emit-he-g9-exponential-scope-proposal-v1.mjs` in diesem Verzeichnis besitzt ausschließlich Lesefunktionen und stdout-Ausgabe, keinen write/apply-Modus:

```bash
node curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-038-derivative-applications-and-exponentials-20-v1/emit-he-g9-exponential-scope-proposal-v1.mjs /home/enpasos/projects/skillpilot
```

Er prüft die exakten zehn semantischen Zielzustände, vier Quellziele und vier Mapping-/Decision-Slices. Bei relevanter Drift bricht er ab; Bild-/unabhängige Zieländerungen werden nicht unnötig gesperrt. Ausgabe: konkrete before/after-Mappingkanten, vier native Decision-Kandidaten, drei requires-Deltas, Bindungsdigests und offene Abhängigkeiten. Syntaxcheck und tatsächliche Ausführung bestanden. Betroffene Requires-Closure bleibt azyklisch; die zurückbehaltenen Wachstums-/Parameter-/Gleichungs-/Modell-/Umkehrwege ziehen weder 628 noch die falschen Ableitungs-/Hauptsatzvoraussetzungen zurück hinein.

Die identische atomare Mapping-Expansion des bestehenden Generators ergibt **nur drei entfallende HE-G9-Ziele: 628, f05, 49; keine hinzugefügten Ziele**. Die anderen vier Clusterkinder werden durch die konkreten neuen/bestehenden Quellenkanten erhalten. Ein rein im Speicher ausgeführter nativer Composition-Compiler-Test der entsprechenden Sicht und drei Requires-Deltas ergab keine Findings. Die zusätzliche explizite Direktkantenprüfung findet jedoch die genannten drei offenen 71-Orientierungskanten. Deshalb ausdrücklich `SOURCE_DELTA_PREPARED_ROUTE_COMPLETION_OPEN`, `adoptionReady: false`.

Generator-Pointer: `app/scripts/generateMathDurationCompositionViews.ts:597` (Quellmapping), `:605` (contains-Expansion), `:935` (HE-Sek-I-Erzeugung), `:1550` (Direct-Requirement-Check), `:1642` (Ausgabeschleife). Der derzeitige Direct-Requirement-Check prüft nur kanonische J5–J10/SekI-Nodes; die hier gemappten E-/Q2-Nodes werden übersprungen. Daher genügt dessen „grün“ allein nicht.

Nach gesondert autorisierter Übernahme und regulärer Synchronisation des kanonischen Semantic-/Source-Fingerprints sowie der gebundenen Duration-Layout-Policy zuerst den bestehenden Generator **ohne Schreibflag** ausführen:

```bash
cd app
./node_modules/.bin/tsx scripts/generateMathDurationCompositionViews.ts
```

Diese vollständige native Generatorausführung wurde mit dem Kandidaten noch nicht behauptet oder durch vorgetäuschte Policy-Freigaben ermöglicht. Erst die autorisierte Folgearbeit leitet generierte Ansichten ab und prüft exakte Scope-/Prerequisite-Deltas. Keine Änderung aller GK-/LK-Sichten aus einem Titel; keine Handkorrektur generierter HE-Sichten. Zusätzlich zur B038h-Siebenergruppe ist c15 eine tatsächliche Requires-Fingerprint-Änderung; dbc13 ist mittelbar für die Route zu prüfen. Bestehende Qualitäts-/Maturity-Floors bleiben bindend.

Einzige geschriebene Dateien dieser Folgeprüfung: diese Notiz und der read-only-Emitter. Keine Übernahme, keine Kanonik-/Mapping-/View-/QA-/Registryänderung. B20 bleibt historische aktuelle Review-Evidenz, keine nachträgliche Änderung seiner Entscheidungen.
