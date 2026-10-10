# Chemie/Biologie: Commit-Zwischenstand 180/381 und 335/394

## Aktiver geprüfter Stand

Der [versiegelte Integrationsstand](chemie-biologie-m7-chemie180-biologie335-integration-2026-10-10.md) bindet 14 tatsächlich erfolgreiche normale Abschlussprüfungen und die aktuellen strengen Ziel-ID-Mengen.

| Fach | Streng D/P/A/M/V abgeschlossen | Offen | Maschineller Reifegrad |
| --- | ---: | ---: | --- |
| Chemie | 180/381 (47,2 %) | 201 | M6; CQR-303 offen |
| Biologie | 335/394 (85,0 %) | 59 | M6; CQR-303 offen |
| Mathematik | 807/807 | 0 | M7 erhalten |
| Physik | 478/478 | 0 | M7 erhalten |

Gegenüber dem aktuellen lokalen `HEAD` `ee13896d9832a36a1946143191bdbf62f3ec64ff` sind **3 neue fachliche Chemie-Abschlüsse und 20 neue fachliche Biologie-Abschlüsse** vorbereitet. Keine zuvor strengen Ziel-IDs sind verloren gegangen. Drei bereits fachlich geprüfte Chemie-Zielseiten wurden für die ergänzten praktischen Endpunkte neu gebunden; das zählt weder als weiterer fachlicher Abschluss noch als zusätzlicher strenger Nettozuwachs. Chemie hat drei zusätzliche aktuelle curricularAtomic-Ziele; Biologie bleibt bei 394.

Die tatsächlichen Paketketten bleiben getrennt dokumentiert:

- [Chemie: drei BW-Kompetenzen und praktische Endpunkte, 180/381](chemie-biologie-m7-chemie180-biologie315-integration-2026-10-10.md).
- [Biologie: acht aktuelle Abschlüsse, 323/394](chemie-biologie-m7-chemie180-biologie323-integration-2026-10-10.md).
- [Biologie: vier aktuelle Abschlüsse, 327/394](chemie-biologie-m7-chemie180-biologie327-integration-2026-10-10.md).
- [Biologie: acht aktuelle Abschlüsse, 335/394](chemie-biologie-m7-chemie180-biologie335-integration-2026-10-10.md).

## Inaktive Fortsetzungskandidaten

Der größere Chemie-Kandidat liefert im isolierten normalen Fünf-Gate-Bericht 205/398. Er ist **nicht aktiviert**: Die getrennte normale Routenprüfung findet 13 fehlende Motivationswege und neun fehlende Abschlusswege. Ein gezielter separater Autoren-Nachfolger enthält vier begründete `requires`-Kandidaten; die normalen Motivationslücken sinken dort auf null. Neun Abschlusswege, vier aktuelle SemanticKind-Bindungen, Native-Reproduktion und unabhängige Kontextprüfungen bleiben offen. CQR-101 ist deshalb weiterhin FAIL. Der C11-Kurs-Grenzfall bleibt ohne gültigen aktuellen P-Nachweis offen. Die aktive Chemie-M6-Untergrenze wird erhalten.

Das nächste Stoffwechsel-Achterpaket ist mit acht vollständigen DE/EN-Profilen, 16 ganzen Fällen und acht tatsächlichen PNGs als **inaktiver Autor-Kandidat** versiegelt. Die Autor-Sichtprüfungen, normalen P8-Vorbereitungen, Schemas und Portabilität bestehen. Seine getrennt vorbereitete normale technische Basis bildet ausschließlich den geprüften Stand 335/394 ab. Neue Raster-P8-/Native8-Bindungen und zwei unabhängige D/P/V-Prüfungen sind noch erforderlich. Keine Kandidaten fließen in die obigen Fortschrittszahlen ein. Alle beteiligten Paketautoren haben den Schreibstopp erreicht.

## Commit-Prüfungen

Die Abschlussprüfungen für den stabilen Commit-Umfang sind erfolgreich beendet. Tatsächliche Kommandos, Zeiten, Ausgaben und Exitcodes liegen unter `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie180-biologie335-commit-checkpoint-technical-root-v1/checks/`.

| Abschlussprüfung | Tatsächliches Ergebnis |
| --- | --- |
| Normale vollständige Schema-Prüfung nach Schreibstopp | PASS, **57.483 Dateien**, 99,493 s |
| Alle fünf Lernzielbücher | PASS am unveränderten aktiven 335-Stand |
| Veröffentlichungstest mit kompilierter Bundesland-Anwendbarkeit | PASS, 251,157 s |
| Zielmodelle, Quellenatlas-Portabilität und Eingabeisolation | PASS, 120,609 s |
| Kompositionssichten | PASS, **303 Sichten**, 271,274 s |
| Kompositionsrollen | PASS, 30,866 s |
| Backend: echter Buchkatalog und kanonische Lernendenprojektionen | PASS, **59 Tests**, 0 Fehler, 0 übersprungen; Gesamtkommando 147,952 s |
| Quellenverfügbarkeit und Extraktionsinventar | PASS |
| Dokumentationslinks und Indexabdeckung | PASS, 313 Dokumente und acht Indizes |
| Zentraler Bericht, Layer A und neun Reifegrad-Untergrenzen | PASS; operative Eingaben seit dem 335-Integrationscheckpoint unverändert |
| Vollständige geplante Datei-/JSONL-Prüfung und Git-Diff | PASS; relative Bundle-Links nach unveränderter normaler Repository-Regel geprüft |

Die normalen Git-tracked-Eingabetests laufen mit einem temporären vorgesehenen Index, der die drei tatsächlich benötigten neuen Quellenartefakte einschließt. Der reale Git-Index wurde nicht verändert. Alle drei Dateien sind regulär versionierbar und müssen im Commit enthalten sein. Es wurde keine Eingabe durch einen ignorierten Download oder eine neue Checker-Ausnahme ersetzt.

Zwei öffentliche Nachweislinks und fünf Dokumentations-Indexeinträge wurden korrigiert. Die originalen Dokumentbytes vor der Linkkorrektur sowie die fehlgeschlagenen und anschließend erfolgreichen Prüfungen bleiben als technische Historie erhalten. Ein zusätzlicher technischer Datei-Check wurde an die bestehende normale Regel für portable relative Bundle-Links angepasst; die ursprüngliche pauschale Zurückweisung gültiger Links bleibt als fehlgeschlagener Vorlauf erhalten. Kein produktiver Checker, Schema oder Qualitätsgrenzwert wurde geändert.

Der finale technische Nachweis `COMMIT-READY.current335.actual.json` und `FINAL.commit-ready.current335.technical.freeze.json` binden den vollständigen geplanten Datenbestand, offene Kandidaten und tatsächliche erfolgreiche Terminalnachweise. Historische fachliche Reviews und vorherige Integrations-Seals bleiben unverändert.

GitHub meldet für den committed `main`-Stand **28 erfolgreiche Checks, keine Fehler und keine offenen Checks** (10. Oktober, 06:05 UTC); ein optionaler, deaktivierter Dialogtest ist planmäßig übersprungen ([CI-Lauf](https://github.com/enpasos/skillpilot/actions/runs/38007087683)). Diese Remote-Ergebnisse decken die noch uncommitteten Änderungen nicht ab.

Das 100-%-Ziel ist noch nicht erreicht. M7 bezeichnet ausschließlich maschinelle Curriculum-QS. Menschliche fachliche Freigabe, Erprobung und Release-Gates bleiben getrennt. Es werden keine realen Lernendenleistungen und keine Host-/Produktionsakzeptanz behauptet. Dieser Zwischenstand wird hier weder committed noch gepusht.
