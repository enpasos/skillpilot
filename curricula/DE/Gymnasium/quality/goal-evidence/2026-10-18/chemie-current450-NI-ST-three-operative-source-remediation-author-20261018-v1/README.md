# NI/ST: drei operative Quellenlücken — inaktiver Autorenkandidat

**Keine Aktivierung, kein neues Qualitätsvotum, kein beobachteter Lernendenvollzug.** Die bisherigen HOLDs bleiben bis zur gezielten unabhängigen Prüfung und eventuellen Integration erhalten. Das getrennte MV-SekI-Whole-Original-HOLD bleibt offen.

## Bewertbare Änderungen

| Amtliche Quelle | Bestehender Owner | Ergänzung und Grenze |
| --- | --- | --- |
| NI EP5, Source004, S.16: schematische Darstellungen technischer Prozesse nutzen | `8ceb1749-fce0-584f-a2b8-0a309282329a` | Ein eigener NI-Fall mit tatsächlich gegebenem zweisprachigem Raffinerieschema und frischem fehlerhaftem Bypass. Verlangt Schemabenutzung zur Erklärung. Der vorhandene HB-SekI-Fall samt eigener Schemazeichnung bleibt unverändert HB-spezifisch. |
| ST7/8 Source064, S.22: Magnesiumoxid herstellen | `e81a4aed-9695-533e-8eb7-7a0c714346ea` | Persönliche beaufsichtigte Herstellung im bedeckten Tiegel, vollständige Anleitung, echte Beobachtungs-/Handlungsevidenz und leeres Protokoll. Theorie oder Vorführung ersetzt die Pflicht nicht. |
| ST7/8 Source122, S.27: Magnesiumhydroxid-Lösung herstellen | derselbe vorhandene e81-Owner | Eigener kalter Ansatz aus geprüftem MgO und Wasser, Blindvergleich, Trennung von Feststoff und klarer Phase, tatsächliche Indikatorbeobachtung und leeres Protokoll. Mg ist Erdalkalimetall; Mg(OH)₂ ist schwer löslich. Suspension und gelöster Anteil werden getrennt benannt. |

Die drei Quellen-/P-Beziehungen bleiben **partiell**. Technische CrossStage-GK/LK-Platzierungen behaupten für ST keine amtliche Oberstufenpflicht; NI betrifft die Einführungsphase. Beide Owner und alle direkten Voraussetzungen sind in den vier heutigen Views bereits sichtbare Targets. Der tatsächliche pure Targetset-Delta ist leer.

## Dateien

- `AUTHOR.three-source-remediation-matrix.pending.json`: genau drei Vorschläge und erforderliche Folgeprüfungen.
- `DELTA.two-whole-profile-additions.pending.json` und `profiles/`: zwei ganze P-Nachfolger. Drei Erwartungen, drei Fälle und drei Transferachsen werden addiert. Alle bisherigen Erwartungen, Fallkörper, HB-Grenzen und Abdeckungsanforderungen sind exakt erhalten; keine Bildänderung.
- `materials/THREE.complete-DE-EN-source-cases.pending.json`: vollständiges zweisprachiges Lehrmaterial einschließlich Vorbereitung, Geräte, sicherem Ablauf, Stopp/Entsorgung, Referenzerklärung, Transfer und zwei vollständig leeren ST-Beobachtungsprotokollen. Status `proposed_not_learner_executed`.
- `DELTA.five-mapping-files-three-source-rows.pending.json`: genaue aktuelle CAS-Objekte und inaktive partielle Zuordnungsvorschläge für alle fünf gefundenen Mapping-/Reviewdateien, sieben Zeilen. Alte Datums-/Reviewerfelder sind historische Daten und keine Annahme des Kandidaten.

Die vorhandenen ganzen C/P wurden zuerst geprüft. Der aktuelle fa203-Magnesiumfall fordert ausdrücklich keine eigene Durchführung; ein Datenfall schließt die ST-Lücke nicht. Das Alkalimetallziel16a80 passt fachlich nicht zu Magnesium. Der allgemeine Cluster277 ist kein konkreter NI-Schemanachweis.

## Sicherheit und Primärbelege

Die MgO-Herstellung nutzt die aktuelle [RSC-Tiegelmethode mit Schülerblatt](https://edu.rsc.org/download?ac=545226) und [Lehrkrafthinweisen, 2026](https://edu.rsc.org/download?ac=545227). Eine örtliche fachkundige Gefährdungsbeurteilung und Schülerfreigabe nach [KMK-RiSU](https://www.kmk.org/fileadmin/veroeffentlichungen_beschluesse/1994/1994_09_09-Sicherheit-im-Unterricht.pdf), insbesondere optischer Schutz, bleibt Voraussetzung. Der Text erhält die [DGUV-Grenzen für Magnesiumbrände](https://publikationen.dguv.de/widgets/pdf/download/article/3447). Für die Wasserreaktion dienen die [kleine MgO-Wasser-Untersuchung](https://www.experimentas.de/experiments/view/927.pdf) und das [Roth-Mg(OH)₂-Stoffdatenblatt](https://www.carlroth.com/downloads/sdb/de/9/SDB_9453_DE_DE.pdf) als Primärbelege. Der zweite Versuch verwendet frisches geprüftes MgO, keine ungeprüften Brandrückstände.

Diese Autorvorbereitung ersetzt weder unabhängige Chemie-/Sicherheitsprüfung noch eine örtliche Freigabe. Die zwei ST-Pflichten bleiben für die tatsächliche spätere Schülerdurchführung offen; keine Messwerte oder erfolgreiche Durchführung wurden erfunden.

## Begrenzte Prüfung

Stock-v2-Profil-Schema, Erhalt aller ganzen Vorläuferteile, drei ganze Quellenobjekte, fünf Mappingdateien/sieben Zeilen, zwei leere ST-Protokolle, vier aktuelle pure Platzierungen samt direkten Voraussetzungen und Stock-Symlinkfunktion: PASS. Keine Compiler-, AP- oder Ganzläufe; keine neuen D/P/A/M/V-Stimmen.

```bash
python curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-NI-ST-three-operative-source-remediation-author-20261018-v1/tools/check-finite-candidates.py
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-NI-ST-three-operative-source-remediation-author-20261018-v1/tools/check-four-existing-placements.ts
```
