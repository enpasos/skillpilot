# Nachtrag: CI-Reparatur der Länder-Teilordnungen vom 17. November 2026

Diese Belege ergänzen den unveränderten Stand vom 16. November.
Ausgangspunkt ist PR #160 auf `2c20e11117c130f898b42d929078cd673094590f`.
Dessen [vollständige CI](https://github.com/enpasos/skillpilot/actions/runs/44025354365)
endete mit zehn erfolgreichen und vier fehlgeschlagenen Jobs.
Die hier geprüften lokalen Korrekturen sind noch keine erfolgreiche neue PR-
oder Main-CI und keine Produktionsbereitstellung.

## Konkrete Korrekturen

- Zwei veraltete generierte Mathematik-Sek-I-Ausschnitte (MV/SL) werden durch
  den vorhandenen Generator reproduziert. Sechs native Kontexte behalten
  exakt dieselben S-/L-Mengen; zwölf tatsächliche Kartenfixtures sind bytegleich.
  18 Stufenbretter und 822 Innenbretter haben keine Strukturfehler oder Rückflüsse.
- Der Physik-Bildstatus zählt die bereits vorhandenen 850 statt 841 Ziele;
  der geprüfte Bildumfang von 485 Fachzielen bleibt unverändert.
- Tests prüfen die tatsächlichen Landes- und Fach-/Stufenwrapper, unabhängige
  Fokusse und notwendige Vorbereitung. Die Kartenprüfung wird auch im
  Navigationsfixture über Verified Recall abgeschlossen. Laufzeitregeln und
  sämtliche kanonischen Ziele, Aufgaben und Voraussetzungen bleiben unverändert.
- Der unveröffentlichte Paketkandidat erhält ausschließlich den neuen
  Inhaltsdigest. Menschliche Rechte-/Publikationsfreigaben werden nicht erteilt.

## Unabhängige Reviews und maschinelle Prüfungen

[Unabhängiges Review der sechs anfänglichen Korrekturdateien](independent-review/README.md)
prüft Generatorreplay, konkrete Retirementpfade, S/L und die Bildzählung.
[Separates Legacy-StagePlan-Testreview](stage-plan-independent-review/review.actual.json)
prüft die isolierte 1.1-Fixturekorrektur; es erteilt keine Freigabe für die neue
StagePlan-Implementierung des Folgepakets.
[Unabhängiges Review der Root-Test- und Digestkorrekturen](backend-root-independent-review/README.md)
prüft fachliche Mengenänderungen, Navigationsfälle, Verified Recall und Paketbytes.
Die vom Reviewer selbst verfassten Controller-Fixtures wurden durch Root
[separat geprüft](backend-fixture-root-review.actual.json).

[Alle 240 Fälle der vier vollständigen Backendklassen](backend-four-classes.actual.json)
bestehen, ohne Fehler oder übersprungene Fälle. Die
[52 exakten Sek-I-Fixtures](../pr160-backend-ci-repair-v1/README.md)
binden S und die unbeschnittene Voraussetzungshülle L. Kompatible Dauer-Fallbacks
werden nicht als amtliche G8-/G9-Angebote ausgegeben.
Die vollständige Mathematik-Prüfkette, Offering-Prüfung, StagePlan-Nachbarprüfungen
und der [erneute Qualitätsstatus](quality-status-check.actual.json) bestehen;
alle 21 Kataloge und zwölf geschützten Scopes halten ihre bisherigen Untergrenzen.

Zwei unabhängige Modellexporte sind in allen 213 Dateien bytegleich.
Das neue ZIP hat 1.120 Einträge, 1.118 Manifestdateien und 864 Binärassets.
Alle [sechs Offlinegates](package/full-package-validation-report.json) bestehen.
Paketdigest: `sha256:c2df283bfd359ba5ecf8bfe2ae1abf311e193871e923035074b493cbac754a8f`.
Der [Buildbericht](package/standalone-build.log) bindet das tatsächliche ZIP.
Die erhaltenen historischen Zwischenberichte nennen ihren damaligen Prüfstand;
später abgeschlossene Läufe sind durch die zusätzlichen terminalen Belege gebunden.

## Grenzen

Keine neuen Landes-StagePlans aktiviert. Kein K-/F-Gesamtabschluss und keine
Unterrichts- oder Lernwirksamkeitsabnahme. Die separat gemessenen acht fehlenden
Ordnungsbeziehungen bei gemischten Hessen-Kursprofilen gehören zum aktiven
Folgeauftrag, ebenso die unabhängige inhaltliche Kinematik-Prüfung. Frische
Remote-CI, Merge und Main-CI werden erst nach ihrem tatsächlichen Abschluss
im Managementbericht ergänzt.
