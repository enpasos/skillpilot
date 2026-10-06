# Biologie: aktuelle Originalquellen-Auswahl im Build

Dieses Dossier behebt den belegten Quellenverbraucher-HOLD durch eine generische Build-/QS-Korrektur. Quellenatlas-Bücher benutzen ihre aktuelle `mappingPaths`-Auswahl aus dem bestehenden `.inputs.json`-Begleiter. Buch, Canon, Semantic-Ledger und Quellenmanifest müssen zum tatsächlichen BookModel passen. Nichtleere eindeutige lokale Mapping-Pfade und passende Mapping-/Extraktionsbindungen sind erforderlich. Historische Mapping-Reviews bleiben bytegenau erhalten. Ältere authored Atlanten ohne Eingabebegleiter behalten ihre bisherige Projektion.

Der gemeinsame Compiler, der vollständige Publikationsbuilder, der Quellen-Sidecar-Builder und der maschinelle Publikationschecker verwenden dieselbe Auswahl. Die Änderung umfasst fünf Build-/QS-/Testdateien; aktive Curriculum-Eingaben und Runtime-/UI-/Backend-/Plugin-Dateien wurden dabei nicht geändert.

## Tatsächlicher fachlicher Befund

Die alte Projektion reproduziert am vollständig SHA-identischen v2-Isolat den aufgezeichneten HOLD. Für exakt vier künftige Ziele koppelte sie zusätzlich Quellenverweise für Stand 01.08.2025, gedruckte S. 39, an die ältere `2024-11`-URL. Die neue Projektion entfernt diese vier falschen Zusatzbindungen und erhält die gültige `sourceDocumentKey`-Route `KC2024_BIOLOGIE_SEKII_STAND_20250801` zur amtlichen `2025-10`-URL. Gültige ältere Quellenbindungen bleiben erhalten.

Betroffene künftige Ziele:

- `946ce2e7-c30d-5670-839d-003b0619c284` – Transkriptionsfaktoren.
- `0ac51522-352c-50d1-8b95-8d3992b4db15` – Methylierungsbegleiter.
- `a3f483ce-126e-595c-999c-aa4d95106221` – PCR.
- `8eb86a82-122d-5cae-8f80-bb2850b29c2f` – Gel/Elektrophorese.

Alle 38 v2-Zukunftsdateien sind vor und nach dieser ausschließlich lesenden Untersuchung SHA-identisch. Zieltexte, Bilder, BookModel, Ziel- und Seitenfingerprints sowie sämtliche exakten Applicability-Tupel bleiben unverändert. `prospective-v2-four-source-hold-deltas.actual.json` enthält die tatsächlichen vollständigen Vorher-/Nachher-Zitate. Der vollständige Vier-Ziele-Quellenentscheid ist dadurch noch kein Abschluss ihrer ausstehenden D-/P-Reviews.

## Gemessener aktueller Layer-A-Fußabdruck

| Aktuell integriertes Buch | Geänderte Ziel-Zitatmengen | Quellenzeugen vorher → nachher | Neue leere Matrixzellen |
| --- | ---: | ---: | ---: |
| Mathematik | 0 | 6685 → 6685 | 0 |
| Physik | 0 | 6356 → 6356 | 0 |
| Chemie | 0 | 10786 → 10786 | 0 |
| Biologie | 1: Gel | 2709 → 2708 | 0 |

Die aktuellen Mathematik-/Physik-Sidecars sind bytegleich zur bisherigen Projektion. Die einzige aktuelle Biologie-Änderung entfernt einen historischen zusätzlichen Gel-Zeugen; die aktuelle Quellenroute bleibt belegt. Keine aktuelle Curriculum- oder Reifegradgrenze wird herabgesetzt. Aktiver strenger Stand bleibt **Chemie 85/376, Biologie 38/363, Mathematik 807/807, Physik 478/478**. Neue fachliche Abschlüsse aus diesem Dossier: **0**.

## Abgeschlossene maschinelle Prüfungen

- `npm --prefix app run test:goal-book-original-sources` – exit 0. Regression umfasst konfligierende alte/aktuelle Quellen, Historienerhaltung, direkte/vererbte Zeugen, Jurisdiktions-/Dauer-/Kursfacetten, mehrdeutige Dokumente und fehlerhafte explizite Auswahl.
- `tsx app/scripts/testGoalBookSourceAtlasInputs.ts` – exit 0.
- `npm --prefix app run test:goal-book-build` – exit 0.
- Native `verifyPublishedGoalBook` verwirft die bisherige kontaminierte Biologie-Sidecar als veraltet. Die vorhandenen unveränderten BookModel-/PDF-/RenderManifest-/Index-Bytes bestehen für **alle vier registrierten Bücher** mit aktuellen Quellen-Sidecars in eigener temporärer Ausgabe den vollständigen maschinellen Publikationscheck. Diese Ausgabe wurde anschließend entfernt. Es gab dabei keinen App-/PDF-Neubuild und keine Schreiboperation auf Root-Publikationsdateien.

Die terminalen Ergebnisse und tatsächlichen Hashbindungen sind in den `*.terminal.receipt.json`-Dateien und `native-publication-source-selection.actual.receipt.json` gespeichert. Der nächste stabile Integrationsbuild muss die betroffene Biologie-Sidecar regulär neu erzeugen.

Zwei vorbereitende Prüfskriptfehler wurden vor dem erfolgreichen Nachweis korrigiert: fehlende async-Kapselung außerhalb des ESM-App-Verzeichnisses sowie ein fälschlich angenommener Download-URL-Monat. Die amtliche Standangabe lautet 01.08.2025; ihre tatsächlich gespeicherte URL liegt unter `2025-10`. Die Prüfskriptkorrekturen waren keine fachlichen Änderungen an Kandidaten oder amtlichen Quellen.

## Grenzen und Fortsetzung

Root hat die fünf Code-Diffs unabhängig geprüft und den generischen Build-/QS-Ansatz als passend bestätigt. Ein frisches inaktives BIO-v3-Buch wird als nächster eigener Kandidat für die noch ausstehenden unabhängigen D-Reviews vorbereitet. Das historische v2-Dossier bleibt unverändert. Adoption, neue strenge Abschlüsse, menschliche Prüfung/Freigabe, Erprobung und Produktion sind nicht durch dieses Dossier belegt.

Technischer Code und Entwicklerdokumentation: Apache-2.0. Lernzielinhalte und eigene didaktische Medien behalten ihre CC-BY-4.0-Zuordnung; amtliche Quellen behalten ihre eigenen Rechte.
