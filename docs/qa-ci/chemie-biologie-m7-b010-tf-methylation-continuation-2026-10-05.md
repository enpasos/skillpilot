# Chemie/Biologie M7: B010 und Genregulation, 5. Oktober 2026

Dieser Fortsetzungsstand folgt dem [Commit-Zwischenstand](chemie-biologie-m7-commit-checkpoint-2026-10-05.md). Die Zielverfolgung ist wieder aktiv und betrifft ausschließlich Chemie und Biologie. Der frühere pausierte Zwischenstand bleibt als historischer Nachweis unverändert.

## Aktueller strenger Stand

Der tatsächliche zentrale Vier-Fächer-Lauf auf der [aktiven Registry](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json) endete am 5. Oktober 2026 um 18:30:16 UTC mit Exit 0. Alle sechs erforderlichen Prüfungen bestehen je Fach; der Bericht enthält keine Bindungs- oder Validierungsfehler. Ein bestandener Lauf mit Teilabdeckung bedeutet weiterhin kein M7.

| Fach | Vorher | Aktuell streng abgeschlossen | Netto neue fachliche Abschlüsse | Bestehende Bindungen wiederhergestellt |
| --- | --- | --- | --- | --- |
| Chemie | 85/376 | **90/376 (23,9 %)** | **+5** | 4; kein zusätzlicher Zählergewinn |
| Biologie | 38/363 | **40/364 (11,0 %)** | **+2** | 1; kein zusätzlicher Zählergewinn |
| Mathematik | 807/807 | **807/807 (100 %)** | 0 | 0 |
| Physik | 478/478 | **478/478 (100 %)** | 0 | 0 |

Maßgeblich sind die aktuellen Ziel-IDs und die vollständige Schnittmenge aus D/P/A/M/V. Das neue eigenständige DNA-Methylierungsziel vergrößert den aktuellen Biologie-Nenner um eins. Alle zuvor abgeschlossenen 85 Chemie- und 38 Biologie-Ziele bleiben streng abgeschlossen. Die geschützten Mathematik- und Physik-Einträge wurden bei beiden Integrationen unverändert erhalten.

Nachweise: [aktueller zentraler Bericht](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-b010-tf-methylation-integration-v1/central-current-combined.stdout.txt), [tatsächlicher Laufbeleg](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-b010-tf-methylation-integration-v1/central-current-combined.terminal.receipt.json), [Zielmengenvergleich und Gate-Ergebnisse](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-b010-tf-methylation-integration-v1/integrated-strict-progress-and-preserved-current-ids.actual.json).

## Integrierte Pakete

### Chemie B010

Fünf neue fachliche Abschlüsse betreffen Ionenkristalle, alkalische Lösungen von Metallen und Metalloxiden, Elemente und ihre Verbindungen, Kalk als Werkstoff sowie Mineraldünger. Beide unabhängigen Beschreibungsreviews prüfen neun aktuelle Zielseiten: die fünf neuen Ziele und vier durch das Paket betroffene bestehende Abschlüsse. Die Synthese und native Abschlussprüfung haben keine offenen Befunde.

Die fünf positiven Verstehensprofile sind fachlich separat geprüft und nativ an die aktuellen Eingaben gebunden. Semantische Atomarität und Memory-Entscheidungen sind aktuell; erforderliche bestehende Karten und Sichtbarkeiten bleiben erhalten. Zwei belegte Bildfehler wurden mit PNGs korrigiert: Natrium reagiert an der Wasseroberfläche, und die Phosphatroute bleibt von der Nitratroute getrennt. Die tatsächlich erzeugten Bilder wurden unabhängig im Original und bei 360/680 Pixel Breite geprüft. Gute vorhandene Bilder bleiben erhalten. Die alten JPGs und ihre damaligen Prompts sind mit exakten Bytes im historischen Dossier bewahrt.

Eine notwendige native QA-Normalisierung änderte die Zeilenreihenfolge und entfernte führenden Leerraum einer bestehenden Notiz. Wissenschaftliche Urteile, Bild-SHAs und menschliche Freigabefelder bleiben exakt. Daraus wird kein fachlicher Abschluss abgeleitet. Der erste fehlgeschlagene technische Lauf bleibt erhalten; der neue Lauf und die anschließende aktive Gesamtprüfung bestehen.

Nachweis: [eingefrorenes Integrationsdossier](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-nine-reviewed-integration-candidate-v4/README.md).

### Biologie: Transkriptionsfaktoren und DNA-Methylierung

Zwei neue fachliche Abschlüsse betreffen Transkriptionsfaktoren und das eigenständige Ziel zur kontextabhängigen DNA-Methylierung. Zusätzlich ist die bestehende Gel-Zielbindung wiederhergestellt. Zwei unabhängige Reviews prüfen die drei tatsächlichen aktuellen PDF-/HTML-Zielseiten sowie die betroffenen Originalquellen und Kontextbindungen. Die separat geprüften positiven Verstehensprofile haben aktuelle Bildbindungen. Alle 38 bestehenden Abschlüsse bleiben geschützt.

Die aktuelle Quelle wird mit einer eigenen Dokumentversion und ihrem tatsächlich geprüften SHA dokumentiert. Unveränderte andere Quellenbindungen werden nicht pauschal auf eine neue Ausgabe umgeschrieben. Breitere oder abweichende Quellenoperatoren bleiben offen. Insbesondere wird aus dem Methylierungsziel keine vollständige Freigabe sämtlicher epigenetischer Mechanismen oder ganzer Quellengruppen abgeleitet.

Nachweis: [eingefrorener Integrationsplan](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-current-integration-candidate-v4/proposed-active-inputs.freeze.json).

## Technische Quellenkorrektur

Der Lernzielbuch-Quellencompiler verwendet bei einem konfigurierten Atlas dessen tatsächlich ausgewählte Mapping-Dateien. Zuvor konnten historische Mapping-Dateien zusätzliche widersprüchliche Quellenzitate liefern. Die Korrektur ist allgemein und enthält keine Ausnahme für einzelne Ziel-IDs oder Fächer. Ungültige ausgewählte Eingaben werden zurückgewiesen. Historische Quellen und Review-Artefakte bleiben erhalten.

Die betroffenen Tests und Quellenprüfungen der vier Publikationen sind im [separaten technischen Dossier](https://github.com/enpasos/skillpilot/tree/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-original-source-active-mapping-remediation-v3) dokumentiert. Diese Build-/QS-Korrektur schafft keine menschliche oder fachliche Freigabe. Der vollständige Build wird am nächsten stabilen größeren Integrationsstand gebündelt geprüft.

## Geschützte Reifegrade

Die erste anschließende Statusprüfung zeigte zwei konkrete Integrationsfehler: Der Statusgenerator entdeckte die aktive Biologie-Atomaritätskonfiguration außerhalb seines historischen Suchordners nicht; ein Chemie-Cluster führte Baden-Württemberg trotz fehlender aktueller Zuordnung aller drei Kinder weiter. Der [fehlgeschlagene erste Floor-Lauf](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-b010-tf-methylation-integration-v1/integrated-protected-maturity-floors.terminal.receipt.json) und sein Status-Snapshot bleiben erhalten.

Der Generator lädt die von der zentralen Registry gewählten Atomaritätskonfigurationen nun direkt und prüft ihre Landschaftsidentität. Die Änderung ist allgemein; sie enthält keine Sonderregel für Fach, Pfad oder Ziel. Beim Chemie-Cluster wurde ausschließlich die explizite Länderunion an seine drei tatsächlich zugeordneten Kinder angepasst. Alle übrigen 473 Goal-Objekte und sämtliche 90 streng abgeschlossenen Ziele bleiben exakt. Die Quellen-Atlasbindung wurde anschließend nativ neu erzeugt und geprüft. Diese technische Wiederherstellung zählt keinen fachlichen Abschluss.

Die [erneute native Statusprüfung](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-b010-tf-methylation-integration-v1/integrated-curriculum-status-after-floor-remediation.terminal.receipt.json) bestätigte die aktuellen strengen 90/376 und 40/364. Am 5. Oktober 2026 um 18:46:15 UTC bestand der [abschließende Floor-Lauf dieses Integrationsstands](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-b010-tf-methylation-integration-v1/integrated-protected-floors-after-restoration.terminal.receipt.json) mit Exit 0: **alle neun geschützten Untergrenzen erhalten**. Chemie und Biologie bleiben M6; Mathematik und Physik bleiben M7. Keine Qualitätsgrenze wurde abgesenkt.

## Offene Arbeit und nächste Schritte

Das [aktive In-flight-Ledger](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json) enthält nach der Integration neun Pakete mit 47 eindeutigen offenen aktuellen Zielen. Abgeschlossene Ziele wurden nur aus den aktiven Reservierungen entfernt; die historischen Batch-Dateien bleiben unverändert. [Native Ledger-Prüfung](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-b010-tf-methylation-integration-v1/integrated-current-in-flight-ledger.terminal.receipt.json) und [Bilddatei-Prüfung](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-b010-tf-methylation-integration-v1/integrated-visualization-assets.terminal.receipt.json) bestehen.

Die zusätzliche klar abgegrenzte Reservierung der sieben offenen Einführungsphasen-Ziele bringt das aktuelle Ledger auf zehn Pakete mit 54 eindeutigen offenen IDs. Die [erneute native Ledger-Prüfung](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-b010-tf-methylation-integration-v1/integrated-current-ledger-after-ephase-seven-reservation.terminal.receipt.json) besteht. Es gibt keine überlappenden Zuständigkeiten und keine als offen reservierten bereits abgeschlossenen Ziele.

Als Nächstes werden 14 Chemie-Kandidaten zu Carbonsäuren, Seifen und Konservierung plus eine betroffene bestehende Bindung integriert, sobald ihre aktuelle native Synthese vollständig geprüft ist. Ein unabhängig gefundener falscher englischer Titel zur Esterbildung wurde korrigiert und von beiden Reviewern gezielt auf den neuen tatsächlichen Seiten nachgeprüft. Der historische BLOCK bleibt erhalten; die übrigen 14 vollständigen Eingangsobjekte bleiben exakt und ihre fachlichen Urteile werden mit explizitem Gleichheitsbeleg fortgeführt.

Für Bakterienbau/Zweiteilung liegen zwei unabhängige aktuelle D-Reviews sowie separat geprüfte P/A/M/V-Kandidaten vor; die betroffene bestehende Zelltypen-Kontextbindung wurde gezielt mitgeprüft. Die native Zusammenführung und Integration stehen noch aus. Parallel werden die sieben Einführungsphasen-Kandidaten unabhängig geprüft. Unintegrierte Kandidaten und offene Quellen-/Operatorgrenzen sind im obigen strengen Zähler nicht enthalten. Die weiteren Abschlussprüfungen und abhängigen Layer-A-Prüfungen folgen an stabilen Integrationsständen.

## Maschinelle und menschliche Gates

Chemie und Biologie haben weiterhin Teilabdeckung; CQR-303/M7 sind noch nicht abgeschlossen. Positive Profile bleiben wahrheitsgemäß `ai_candidate`, `needs_human_review`, E1/G1. Keine tatsächliche Lernendenleistung, menschliche Prüfung, Erprobung oder Release-Freigabe wird behauptet. Die unabhängigen menschlichen Release-Gates bleiben erhalten. Laufzeit-, Datenschutz-, Sicherheits-, Plugin-, Veröffentlichungs- und Produktionsänderungen sind nicht Bestandteil dieses Auftrags.
