# NI-Zwischenstand und gesicherter Chemiekandidat

Gültiger aktueller Maschinen-QS-Zwischenstand: Chemie **104/376**, Biologie **67/383**. Neu abgeschlossen sind **18 Biologieziele**; fünf vorhandene D-Bindungen und eine P-Kontextbindung erzeugen keinen Zählergewinn. Chemie und Biologie bleiben M6; CQR-303/M7 sind offen. Mathematik 807/807 und Physik 478/478 bleiben M7. Alle neun geschützten Reifegrad-Untergrenzen bestehen.

## Aktuelle Nachweise

- [Fortsetzungsbericht](../../../../../../../docs/qa-ci/chemie-biologie-m7-ni-quantitative-continuation-2026-10-06.md)
- [Aktueller zentraler Bericht](stable-checkpoint-four-subject-central.stdout.txt) und [echter Terminalbeleg](stable-checkpoint-four-subject-central.terminal.receipt.json)
- [Exakte aktuelle IDs und Nettofortschritt](stable-checkpoint-exact-current-strict-progress.actual.json)
- [Gebundene aktuelle Validierungsübersicht](stable-checkpoint-current-validation-summary.actual.json)
- [Bestandener vollständiger Anwendungsbuild](stable-checkpoint-application-build.terminal.receipt.json)
- [Bestandene neun geschützte Floors](stable-checkpoint-operative-mapping-protected-floors.terminal.receipt.json)
- [Tatsächlicher ausgewählter synthetischer Lernenden-API-Test](actual-selected-learner-api-junit-summary.json)

## Erhaltene Kandidaten und frühere Prüfergebnisse

Der zwischenzeitliche Bericht **112/378 Chemie** gehört zur probeweisen Achterpaket-Integration. Die anschließende verpflichtende Layer-A-QS fand zwei unbelegte BY-Zuordnungen und eine fehlende Paraben-LK-Route. Deshalb ist das Paket vollständig zum geprüften Vorgänger zurückgeführt; alle betroffenen Kandidatenbytes und vorherigen Ergebnisse bleiben erhalten. Das Paket trägt **0** zum aktuellen Abschlusszähler bei.

- [Gesicherte tatsächliche Rückkehr](chemistry-reviewed-predecessor-restoration.actual.json)
- `chemistry-before-application/`: exakt gesicherte Vorgängereingänge.
- `chemistry-attempt.before-stable-restoration/`: vollständige betroffene Eingänge vor der Rückkehr.
- Die alten `stable-current-*` und `stable-final-*` Dateien enthalten echte frühere Ergebnisse, einschließlich gescheiterter Läufe. Für den aktuellen Stand gelten die ausdrücklich ausgewählten Terminalbelege in der aktuellen Validierungsübersicht.
- [Portabilität der exakt referenzierten nativen HTML-Dateien](CURRENT-NATIVE-HTML-PORTABILITY.md).

## Grenzen und Commitumfang

Positive Evidenz bleibt `ai_candidate`/`needs_human_review`; maschinelle QS ist weder Lernendenleistung noch menschliche Prüfung, Erprobung oder Release-Freigabe. Der separate unveränderte App-Abhängigkeitsaudit bleibt rot (20 Befunde, davon zwölf hohe); [tatsächlicher Beleg](stable-current-dependency-audit.terminal.receipt.json). Ein grüner GitHub-CI-Lauf wird nicht behauptet.

Die neuen aktiven Nachweisdossiers und `app/scripts/testDeepUnderstandingSupersessionChains.ts` müssen zusammen mit den getrackten Änderungen in einen späteren Commit aufgenommen werden. Ein Commit ausschließlich zuvor getrackter Dateien wäre unvollständig. Es wurden keine Git-Dateien gestaged, kein Commit erstellt und nichts gepusht.
