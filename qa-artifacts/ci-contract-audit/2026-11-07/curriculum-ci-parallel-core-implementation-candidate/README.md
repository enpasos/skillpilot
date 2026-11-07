# Curriculum CI: geprüfter privater DAG-Kandidat

Dieser Nachfolger konkretisiert ausschließlich den abgeschlossenen Vorschlag unter `qa-artifacts/ci-contract-audit/2026-11-07/curriculum-ci-parallel-core-proposal/`. Aktiver Ausgangspunkt ist `9bbfebfc411b218cce139b9e99fbe80638fc660d`; die Workflowdatei hat SHA-256 `2920020ba64bad08ecfee400ee41ef13ac94c09884cfb86dc490e5517349b975`. Inventar, Seal und alle sieben Vorschlagspayloads wurden nachgerechnet. Die zwölf ursprünglichen Eingangsdateien sind weiterhin hashgleich.

`candidate/.github/workflows/ci.yml` ist bytegleich mit Astras geprüftem Vorschlag (SHA-256 `ab5220869fb0f7a846fbea12b8caa30ff91a8953d4300370baccc8f93db60291`). `candidate/scripts/plugin_ci_workflows.test.mjs` enthält die komplette bisherige Testdatei unverändert und danach exakt die drei vorgeschlagenen zusätzlichen Tests. Die beiden Patches beziehen sich auf den aktuellen aktiven Ausgangspunkt. Nichts wurde in den aktiven Workflow oder die aktive Testdatei übernommen.

Der bestehende Job `graph-validation` startet strukturell ohne `needs` als **Curriculum source contracts**. Der neue Job `curriculum-ci` trägt als einziger den bisherigen Pflichtkontext **Curriculum CI**, hat direkte Abhängigkeiten von Core und Buchbau und verwendet `always()`. Sein erster Schritt läuft vor Disk-/Checkout-/Downloadschritten, mit eigenem Bash-Shell und `runner.temp` als Arbeitsverzeichnis. Er erlaubt ausschließlich beide Ergebnisse `success`. Nach einem Guardfehler erhalten die folgenden Integrationsschritte keine zusätzliche Erfolgs- oder Skipausnahme.

## Vollständigkeit der bisherigen Gates

Der unabhängige Abgleich kombiniert geparste YAML-Strukturen und die ursprünglichen 85 Schrittblockhashes aus `step-allocation.json`. Ein terminaler Blockzeilenumbruch wird für den Inventarhash wie im Ursprung außen abgeschnitten; die vollständig geparsten Schrittwerte einschließlich sämtlicher `run`-Strings werden zusätzlich exakt verglichen. Es fehlen keine Befehle, Umgebungswerte, Arbeitsverzeichnisse, Actionsversionen, Optionen oder Zeitlimits.

Core enthält 69 Schritte, der finale Job 27. Nur die ursprünglichen zehn Runner-Setupschritte 1–8, 69 und 72 erscheinen doppelt. Genau ein neuer semantischer Schritt ist vorhanden: der Statusguard. Die einzige dokumentierte relative Umordnung innerhalb des finalen ursprünglichen Pfads verschiebt Buch-Restore 14 unmittelbar vor Anwendungsbuild 66. Die Runtime-Asset-Erzeuger/-Verbraucherkette bleibt davor zusammen. Alle anderen ursprünglichen Schrittfolgen behalten ihre Reihenfolge.

Die sieben anderen Jobs und der äußere Workflowrahmen sind bytegleich: Buchbau, Frontend, Backend, Action Regression, OpenAI MCP App, Claude Connector und OpenAI Public Edge. Trigger, Pfadfilter, Berechtigungen und Concurrency wurden nicht geändert. Source-A-, Graph-, UUID-, Readiness-, Statusdrift- und Floorbefehle bleiben unverändert erhalten.

Der unveränderte Same-run-Download bleibt bei `goal-book-publication-${{ github.sha }}` nach `app/public/lernzielbuch/`, ohne fremde Run-ID, Repositorytoken, Pattern oder Katalogersatz. Die normale Buchproduktion behält `--force`, anschließenden Publikationsbindingscheck, Uploadreihenfolge und versteckte Cachedatei. Anwendung, Package-only-Frontend, Buildrationale und bestehende Paketkonformität bleiben nach dem Restore im finalen Pflichtjob.

## Tatsächlich ausgeführte lokale Prüfungen

1. **Normaler vollständiger Testentry:** `node --test scripts/plugin_ci_workflows.test.mjs` in der privaten Kandidatenstruktur. Alle 13 bisherigen plus drei neue Tests bestanden: 16 Tests, 16 Erfolge, null Fehler, Skips, Abbrüche oder Todos. Keine Namensfilter oder ausgelassenen fachfremden Tests. Der Prozess lief mit read-only Rootdateisystem und ausschließlich privatem Schreibbereich unter `/dev/shm`.
2. **49 Bashfälle separat:** Der `run`-Wert des tatsächlichen ersten Kandidatenschritts wurde aus YAML extrahiert und unverändert mit `bash --noprofile --norc -c` ausgeführt. Sieben Werte pro Vorläufer: `success`, `failure`, `cancelled`, `skipped`, leer, fehlend und unbekannt (`neutral`). Genau `success/success` ergibt Exit 0, alle 48 anderen Kombinationen Exit 1. `status-matrix.json` enthält jede tatsächliche Rückgabe und Ausgabe; `status-guard.extracted.sh` ist der ausgeführte Originalkörper.
3. **19 DAG-/Artefaktmutationen separat:** Validatorfunktionen und sämtliche 19 konkreten Mutationsausdrücke wurden aus der tatsächlich getesteten Kandidatentestdatei extrahiert. Der Originalworkflow besteht; alle 19 tatsächlich verschiedenen Mutanten werden verworfen. Einzelne Namen, Mutantenhashes und Ablehnungsgründe stehen in `dag-artifact-mutations.json`. Darunter sind verlorenes `always`, falscher Pflichtname, entfernte direkte Abhängigkeiten, fehlender/später Guard, weiche/bedingte/fehlende Integration sowie fehlender/fremder Artefaktdownload und verlorene Buchpublikationsprüfungen.
4. **Abschlussguard:** Die zwölf aktiven Eingangsdateien, aktive Workflow- und Testdatei sowie das ursprüngliche Vorschlagspaket wurden nach diesen Prüfungen erneut gehasht. Kein aktiver Drift wurde erzeugt.

Die 49er Matrix läuft zusätzlich bereits im normalen vollständigen Nodeentry; der separate Lauf liefert Einzelreceipts. Entsprechend wurden die 19 Mutationen sowohl im normalen Testentry als auch separat bestätigt. Die Wiederholung ist die ausdrücklich verlangte Belegsicherung und keine neue Workflowprobe.

## Grenzen vor aktiver Übernahme

Dies sind lokale Struktur- und Statusbelege. Kein eigentlicher Source-A-, Graph-, QA-, Readiness-, Floor-, PDF-, Anwendungs- oder Paketkonformitätsbefehl wurde ausgeführt. Die vorhandenen normalen Node-Wiringtests lesen diese Befehle als Workflowtexte. Keine Source-A-Nativeprobe wurde gestartet, angepasst oder durch einen anderen Ausführungsweg ersetzt. Curriculumquellen, QA-Floors, fachliche Gates, privater PoWi-Aliascode und dessen geschlossener Loader sind unberührt.

Ein `always()`-Guard beweist lokal nicht die GitHub-Runnerausführung nach Workflowabbruch oder Runnerverlust. Der spätere normale Remote-Lauf muss den frühen Corebeginn, den tatsächlichen Pflichtkontext und seinen roten Abschluss bei negativen Vorläufern zeigen. Bei beidem Erfolg muss der vollständige Same-run-Buchupload vor der Integration geladen sein. Es gibt keinen frischen Remote-Pass dieses Kandidaten und keine gemessene Beschleunigung. Doppelte Runnerinitialisierung und Queuezeiten können die Gesamtdauer beeinflussen.

Root kann den begrenzten Workflow-/Testpatch nach Review getrennt übernehmen. Es wurden keine Branchregeln, Gitrefs, Releases, Produktionsdaten oder aktiven Workflowdateien geschrieben.
