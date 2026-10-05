# Chemie/Biologie M7: Commit-Zwischenstand vom 5. Oktober

Dieser Zwischenstand sichert die geprüften Curriculumänderungen und die getrennt eingefrorenen Kandidaten. Die Zielverfolgung bleibt pausiert; neue M7-Pakete werden nicht begonnen. Menschliche Prüfung, Freigaben, Erprobung und Veröffentlichung bleiben gesondert. Der [Abschlussbeleg](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-commit-ready-checkpoint-v1/final-checkpoint-qa.actual.receipt.json) bindet die tatsächlichen lokalen Prüfergebnisse.

## Strenger Stand und Fortschritt seit dem Basis-Commit

Basis: `693872e8ea8663384281d06f61858b0f8fef332f`. Maßgeblich ist der vollständig abgeschlossene [zentrale Bericht](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-redox-one-current-integration-v1/central-one-new-complete.report.json), nicht die Anzahl gespeicherter Kandidaten.

| Fach | Basis-Commit | Aktuell streng abgeschlossen | Offen | Reifegrad / CQR-303 |
| --- | --- | --- | --- | --- |
| Chemie | 58/376 | **80/376 (21,3 %)** | 296 | M6 / WARN |
| Biologie | 35/363 | **37/363 (10,2 %)** | 326 | M6 / WARN |
| Mathematik | 807/807 | **807/807 (100 %)** | 0 | Geschütztes M7 / PASS |
| Physik | 478/478 | **478/478 (100 %)** | 0 | Geschütztes M7 / PASS |

Seit dem Basis-Commit: **22 neue fachliche strenge Chemieabschlüsse und zwei neue fachliche strenge Biologieabschlüsse, netto +24, keine bloßen Bindungswiederherstellungen**. Darin enthalten sind die zwei Biologie-Test-/Therapieziele, acht Chemie-Energieziele, vier korrigierte Energieziele, neun Stoffmengenziele und das zuletzt integrierte Redoxziel. Die einzelnen datierten Paketstände bleiben im [QA-Index](index.md) erreichbar. Chemie und Biologie haben M7 noch nicht erreicht.

Die neun geschützten Reifegrad-Untergrenzen bestehen auch nach den abschließenden QS-Korrekturen. Die kanonischen Mathematik- und Physikdateien sind bytegleich zum Basis-Commit. Die aktuellen Chemie-/Biologie-Zieluniversen und ihre Nenner bleiben unverändert. Das In-flight-Ledger reserviert acht Pakete mit 39 eindeutigen aktuellen offenen Ziel-IDs.

## Geprüfte Integration und erhaltene Grenzen

Die integrierten Ziele besitzen aktuelle D/P/A/M/V-Bindungen. Beschreibungsbefunde wurden fachlich aufgelöst, positive Verständnisprofile unabhängig geprüft und gute vorhandene Bilder erhalten. Notwendige PNG-Korrekturen wurden tatsächlich fachlich und visuell geprüft. Historische Bild-, Prompt- und Reviewstände bleiben erhalten. P-Profile bleiben wahrheitsgemäß `ai_candidate` / `needs_human_review`, E1/G1; maschinelles M7 behauptet keine menschliche Freigabe oder tatsächliche Lernendenleistung.

Das offene Gleichungsziel `11bea4c6-7b8a-47e0-8293-2eb1ce34cf66` erhielt eine englische Angleichung an den bereits vollständigen deutschen Inhalt. Seine strukturellen und Quellenbefunde bleiben ausdrücklich offen und im Ledger reserviert. Diese Sprachangleichung ist kein neuer fachlicher strenger Abschluss.

Die Buchpublikationen unter `app/public/lernzielbuch/`, Runtimekopien und lokale Original-PDF-/HTML-Caches bleiben generierte beziehungsweise lokale Arbeitsdateien. Der vollständige HE-PDF-Textextraktionscache wird ebenfalls Git-ignoriert; seine vorhandenen Bytes und Quellen-/Hashbelege bleiben lokal erhalten. Quellenrechte, Qualität und menschliche Release-Gates werden dadurch nicht verändert.

## Eingefrorene größere Kandidaten

Die drei letzten Arbeitszuständigkeiten sind beendet und ihre Dateien stabil. Eine [abschließende Byteprüfung](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-commit-ready-checkpoint-v1/three-larger-candidates-frozen.actual.receipt.json) bestätigt die unveränderten 150 gebundenen Artefakte. Dies ist eine Bindungsprüfung, keine zusätzliche fachliche Freigabe.

- **Chemie B010, sieben Ziele:** Der [eingefrorene Quellen-/Beschreibungskandidatenreview](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-seven-independent-source-description-review-a-v1/README.md) enthält fünf Revisionen und zwei Split-Befunde mit vollständigen DE/EN-Alternativen. Quellen-, Jahrgangs-, Voraussetzungspfad- und Gitterbild-HOLDs bleiben offen. Die offengelegte Kenntnis historischer Zusammenfassungen verhindert eine Anrechnung als blinder Final-Book-D2-Review.
- **Chemie B014, elf Ziele:** Der [Autorencheckpoint](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-eleven-current-source-description-candidate-v1/README.md) hält fünf KEEP-, drei REVISE- und drei SPLIT_REVIEW-Urteile fest. Memory-/Kartenarbeit, drei Visualisierungsbefunde sowie gezielte Quellen- und Stufenbindungen bleiben offen. Bildkorrekturbriefs und konkrete neue Karten sind ausdrücklich noch nicht erstellt.
- **Biologie NI, zehn bisherige Klauselteile:** Der [Autorencheckpoint](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-ten-source-hold-remediation-candidate-v1/README.md) enthält neun neue DE/EN-Vorlagen mit `id: null`, bestehenden 440-Kontextreuse, 16 vollständige Klauselroutenvorschläge sowie zwei Memoryziel-/Deckvorlagen mit zehn zweisprachigen Karten. Unabhängige Reviews, stabile IDs, Platzierungen, origin-gebundene Kartenreviews und tatsächliche Memorysichtbarkeit fehlen. Die globale 9f-Korrektur erhält ihre molekulare Oberstufenroute; regionale Quellen-/Kontextbindungen bleiben gezielt zu prüfen.

Diese Kandidaten, die fünf isoliert importierten NI-PNGs und die weiteren Q1-/Chemie-Restvorschläge bleiben inaktiv. Sie erzeugen keine zusätzlichen aktuellen strengen Abschlüsse, Nenneränderungen oder menschlichen Freigaben.

## Behobene QS-Inkonsistenzen

- **Dokumentation:** 40 Links in neun neuen Arbeitsstanddokumenten wurden auf die für die veröffentlichte Doku passenden GitHub-Ziele umgestellt. Neue Berichte werden im QA-Index aufgenommen. Fachliche Aussagen der früheren Paketstände bleiben erhalten.
- **Memory-All-Prüfung:** Die operative Auswahl folgt jetzt den bereits registrierten aktuellen Memory-Nachfolgern. Fach, Review-ID, Prüfregel, Scope und Sichtbarkeit müssen dem Vorgänger entsprechen; Abweichungen werden abgewiesen. Alle zehn aktiven Konfigurationen bestehen. 61 historische Memory-Dateien bleiben bytegleich.
- **Generierte Status-Registry:** Notices und Register folgen denselben aktiven Memory-Nachfolgern. Der frühere Chemie-Memory-Bericht bleibt bytegleich zum Basis-Commit als gesondert registrierter historischer Snapshot erhalten; er wird nicht durch den All-Runner neu erzeugt und liefert keine aktuellen Abschlussnachweise.
- **Chemie-Bildzählung:** Der bestehende native Generator aktualisiert den Rolloutbericht auf 354 aktive Hauptbilder und 22 offene Providerfälle. Alle 354 verlinkten Bilder stimmen mit QA, Quelle und Frontend überein. Ein historischer flacher Ledger-Abgleich beim Blei-Akkumulator bleibt sichtbar; seine aktuelle hashgebundene maschinelle QA wird nicht durch eine erfundene historische Freigabe ersetzt.
- **Chemie-Evidence-Watch:** Der alte Baseline-Snapshot ist separat erhalten. Der native aktuelle technische Referenzstand berücksichtigt die tatsächlich integrierten Texte und vier versionierten Mappingreviews. Der vollständige Watch besteht. Diese technische Aktualisierung erteilt keine neuen fachlichen Freigaben und schließt keine offenen Kandidatenbefunde.

## Lokale Prüfungen und noch ausstehende Entscheidung

Tatsächlich mit Exit-Code 0 abgeschlossen: zentraler Fünf-Gate-Bericht; neun geschützte Untergrenzen; Graphprüfung; 297 Composition Views; View-Filter; Kursniveaukonsistenz; Quellenabdeckungscheck; alle zehn Memory-Konfigurationen; Visualisierungsdateien, vier Bild-QA-Ledger, Approval-Coverage und Zählparität; KI-Transparenzinventar und Transparenzprüfung des tatsächlich gebauten Artefakts; Kompetenzwortlaut und Spelling-Checker in dessen erklärtem Mathematik-/Physikscope; vollständiger Neubau aller vier Lernzielbücher mit Publikationsprüfung; gesamte Goal-Book-Testpipeline; TypeScript-/Vite-Anwendungsbuild und Frontend-Shellprüfung. Die geänderten QS-Skripte bestehen zusätzlich ihren gezielten strengen TypeScript-Check. Alle vier abschließenden Dokumentationschecks bestehen: 269 verlinkte Dokumente, acht Indexe, 31 generierte Notices und aktuelle Status-Registry. Tatsächliche Exits, UTC-Zeiten und Protokolle sind im Abschlussbeleg gebunden; frühere Fehlerprotokolle bleiben als zeitliche Snapshots erhalten.

**Der native Abhängigkeitsaudit bleibt am unveränderten main-Lockfile offen:** zwölf hohe, sechs mittlere und zwei niedrige Meldungen. Manifest und Lockdatei sind bytegleich zum Basis-Commit; diese Funde wurden nicht durch die Curriculumänderungen eingeführt. Ein separater isolierter Lockfile-Kandidat innerhalb der bestehenden Versionsbereiche hat Audit Exit 0 mit null Funden. Seine Übernahme wurde ausdrücklich angefragt, weil der Goaltext Sicherheits-/Runtimeänderungen ausschließt. Bis zur Antwort bleibt die aktive Lockdatei unverändert. Ein tatsächlicher Installations-/Buildnachweis dieses Kandidaten fehlt; der vorhandene grüne Build bezieht sich auf den aktiven Lockstand.

Dieser Stand behauptet daher keinen vollständig grünen GitHub-CI-Lauf. Es wurde kein Commit erstellt, kein Push ausgeführt, nichts gemergt, deployt oder veröffentlicht. Die endgültigen M7-Abschlussprüfungen und abhängigen Layer-A-Abschlussgates für 100 % Chemie/Biologie bleiben offen. Eine spätere Fortsetzung beginnt mit den dokumentierten aktuellen offenen IDs und erhält gültige Nachweise unveränderter Ziele.
