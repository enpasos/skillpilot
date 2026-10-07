# Chemie B008 v9: unabhängige gezielte Materialprüfung A

Die tatsächlichen zwölf geänderten DE/EN-Fälle und exakt 60 geänderten Materialfelder wurden gegen die eingefrorenen v8-Befunde und ihre jeweiligen fachlichen Voraussetzungen geprüft. Autoreneinschätzungen wurden nicht als Freigabe übernommen. Die alten v8-A/B-Befunde dienen ausdrücklich als erlaubter Ausgangsbefund; aktuelle unabhängige Gegenprüfungsurteile wurden nicht gelesen.

**Ergebnis: elf Fälle KEEP, ein Fall REVISE; 58 Felder KEEP, zwei Felder REVISE.** Der neue Befund `A-V9-01` betrifft ausschließlich `transfer.de/en` des Falls `upper-hypothesis-investigation-colour-analysis` (Index 9). Die neue Antwort A ≈ 0,410 / c = 5,0 wird aus dem außerhalb liegenden A = 0,810 vorhergesagt, obwohl die bereitgestellte Kalibration nur bis 6 mg/L gilt. Das synthetische Lehrmodell macht diese Bereichserweiterung nicht gültig. Eine zweifache Verdünnung ist ein sinnvoller Prüfversuch; ein neuer gültiger Messwert muss die Konzentration und Rückrechnung begründen. Der alte Apparaturbefund ist unabhängig davon aufgelöst.

Die weiteren alten Befunde sind für die tatsächlich geänderten Materialien aufgelöst: Leitfähigkeitsmaßstab und temperaturgleicher Vergleich, Wärmeaufnahme bei verdünnter NaCl-Lösung nahe 25 °C, konkrete Standard-/Temperatur-/Indikator-/Puffer-/Volumetrieausstattung, ehrliche Zusatzdokumentation R2/W3, Validierungsvorbehalt des fiktiven X/Y-Tests und begrenzter Modellvergleich. Offizielle Primärquellen wurden tatsächlich gezielt gelesen; Nachweise und eigenständige Berechnungen stehen in `targeted-primary-facts-and-independent-calculations.actual.json`.

Ein dokumentierter Ausführungsrand bleibt für die Leitfähigkeitsmessung zu beachten: Das Standardintervall reicht bis 2010 µS/cm, über den 2000-µS/cm-Niedrigbereich. Der bereitgestellte höhere Bereich muss bei Bedarf nach der Geräteanleitung gewählt und hinsichtlich seiner echten Genauigkeit geprüft werden. Die Materialien behaupten weder eine bereits erfolgte Prüfung noch eine aus der Anzeigeauflösung abgeleitete Genauigkeit.

Die **40 unveränderten Fälle und 26 Beschreibungen/Profile wurden ausschließlich über exakte historische Wert- und Dateibindungen übernommen**, fachlich nicht erneut geprüft. Die historische v8-Autorenhülle und beide v8-Review-Freezes samt eingefrorenen eigenen Dateien bleiben exakt erhalten. Die 19 aktuellen zentralen Integrationsbindungen wurden gezielt überprüft und sind unverändert. Ein etwaiger anderer aktueller AGENTS-Hash wird separat dokumentiert; vollständige Gleichheit aller historischen externen Eingänge wird nicht behauptet.

## Artefakte

- `twelve-changed-cases-and-sixty-fields.independent-a.review.json`: eigene konkrete Entscheidung pro Fall und verändertem Feld.
- `old-findings-resolution-and-new-transfer-finding.independent-a.review.json`: Auflösung der alten Befunde und neuer eng begrenzter offener Befund.
- `literal-sixty-field-and-forty-case-hash-reuse.actual.json`: tatsächlicher Differenzvergleich, unveränderte Fälle/Profile und geschützte Bindungen.
- `targeted-primary-facts-and-independent-calculations.actual.json`: tatsächliche Primärlektüre, Maßstab, Vorzeichen, Titration und Volumenrechnung.
- `native-gate-limits-and-exact-review-inputs.actual.json`: konkrete Eingangsbindungen und offene native Schritte.
- `independent-a-v9-material-deltas.final.freeze.json`: Abschlussfreeze dieser unabhängigen Prüfung.

## Aussagegrenzen

Diese Dateien sind inerte maschinelle Material-QS. Alle Kandidaten-UUIDs bleiben `null`; Autorenprofile/-fälle bleiben `ai_candidate` / `needs_human_review`. Es entstehen keine nativen D/P/A/M/V-Freigaben, keine fachlichen M7-Abschlüsse und keine wiederhergestellten aktiven Bindungen. Der neue Transferbefund bleibt offen. Unabhängige Folgeprüfung, tatsächliche native Ziel-/Seiten-/Quellen-/Kontextbindungen sowie getrennte menschliche Freigaben und reale Erprobung bleiben erforderlich. Keine aktive Canonical-, Registry-, Ledger-, Laufzeit-, Bild-, Plugin- oder Veröffentlichungsänderung, kein vollständiger Build und keine Git-Operation wurde durchgeführt.

`materialize-independent-a-review.py` berechnet gezielt die Eingangsdifferenzen und Bindungen und schreibt ausschließlich dieses neue Reviewpaket. Ein erfolgreicher technischer Differenz-/Freeze-Check löst den wissenschaftlichen Befund nicht auf.
