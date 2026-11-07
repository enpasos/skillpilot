# Quellprüfungen parallel zum Buchbau

Der bisherige Curriculumjob wartete vor sämtlichen Quellprüfungen auf den
vollständigen Lernzielbuchbau. Der neue Job `graph-validation` mit Anzeigename
`Curriculum source contracts` beginnt ohne diese Abhängigkeit. Er enthält
weiterhin die harten Graph-, Assessment-, QA-, Statusdrift- und Floorprüfungen
sowie die vom Buchbau unabhängigen Schema-, UUID- und Archivprüfungen.

Der abschließende Job `curriculum-ci` behält den Anzeigenamen `Curriculum CI`.
Er hängt direkt von den Quellprüfungen und `goal-book-publication` ab. Sowohl
der Job als auch sein erster Schritt verwenden `always()`: Der tatsächliche
Bashguard erlaubt ausschließlich zwei erfolgreiche Vorläufer. Fehler,
Abbruch, übersprungene, fehlende oder unbekannte Ergebnisse werden abgewiesen.
Danach folgen die bestehenden Integrationsprüfungen mit dem vollständigen
verifizierten Buchartefakt aus demselben Workflowlauf.

Alle 85 bisherigen Schrittblöcke sind mit ihren Befehlen, Bedingungen,
Umgebungswerten und Optionen erhalten. Zehn Setupschritte werden für den
zusätzlichen Runner wiederholt. Alle sieben übrigen Jobs sowie Trigger,
Pfadfilter, Berechtigungen und Concurrency bleiben gleich. Branchregeln wurden
nicht geändert. Die fachlichen Untergrenzen und Ausnahmenliste sind unverändert.

Die [unabhängige Analyse](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/curriculum-ci-parallel-core-proposal/README.md)
und der [geprüfte Implementierungskandidat](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/curriculum-ci-parallel-core-implementation-candidate/README.md)
enthalten den vollständigen Schrittvergleich, 49 tatsächlich ausgeführte
Bashkombinationen mit genau einem erlaubten Ergebnis und 19 zurückgewiesene
DAG-/Artefaktmutationen. Nach aktiver Übernahme besteht auch der vollständige
normale Workflowtestentry: 16/16, keine Skips oder Abbrüche.

Die [Root-Ausführungsbelege](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/curriculum-ci-parallel-core-root/application.json)
trennen die lokale Übernahme vom noch erforderlichen frischen Remotelauf.
Die Änderung soll Quellfehler früher melden. Ein gemessener Zeitgewinn wird
nicht behauptet; zusätzliche Runnerinitialisierung und Warteschlangen können
die Gesamtdauer beeinflussen. Ein lokaler Statusguardtest beweist kein
GitHubverhalten bei Runnerverlust.

Der Vorgängerlauf auf `9bbfebfc411b218cce139b9e99fbe80638fc660d` endete
tatsächlich mit fünf erfolgreichen und drei fehlgeschlagenen Hauptjobs.
Die strengen Deep-QA-Selbsttests bestanden, die anschließende tatsächliche
Meilensteinprüfung verweigerte die Freigabe für die sieben offenen Fächer.
Frontend und Backend fanden zusätzlich einen veralteten Bildinventarbericht
und eine noch unvollständige kanonische Physics-Testfixture. Diese Befunde
werden separat repariert. Der Vorgängerlauf ist kein Remotenachweis des
aufgeteilten Workflows.
