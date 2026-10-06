# Chemie/Biologie: Commit-Checkpoint v3

Dieser Nachweis bündelt den aktiven Integrationsstand und die danach separat
eingefrorenen Kandidaten. Chemie bleibt **112/378**, Biologie **67/383**;
Mathematik807/807-M7 und Physik478/478-M7 bleiben geschützt. Seit dem aktiven
Integrationsstand: **0 neue strenge fachliche Abschlüsse**, **0 wiederhergestellte
aktive Bindungen**. Ein Kandidat wird nicht durch seine Existenz fertig.

## Tatsächliche begrenzte Checks

- Vollständiger Schemalauf: **30.439 Dateien**, Exit0; tatsächliche Ausgabe und
  Scriptbinding in [Schema-Receipt](schema.actual.receipt.json).
- Dokumentationslinks und Indexe: tatsächliche Ausgaben in
  [Link-Receipt](docs-links.actual.receipt.json) und
  [Index-Receipt](docs-indexes.actual.receipt.json).
- Betroffene Source-/Applicability-Regression: **sieben Tests**, Exit0;
  [Receipt](affected-regression.actual.receipt.json).
- `git diff --check`: [tatsächlicher Receipt](git-diff-check.actual.receipt.json).

Die finalen Receipts bestehen am stabilen Dokumentationsstand: **281 Dokumente,
acht Indexe, sieben Regressionstests und Diff-Check Exit0**. Ein
vorübergehender Linklauf vor Vorliegen der beiden neuen README-Ziele wird
getrennt erhalten; er wird nicht als bestandener Lauf ausgegeben.

## Versionsfähige Revieweingänge

Der unabhängige Audit findet **1.588 aktive native D-Dateien** sowie **1.010
direkte P/A/M/V-Eingänge**, ohne fehlende Dateien. Der aktuelle Bindungsnachweis
bestätigt alle19 aktiven Integrationsinputs exakt. Zusätzlich sind **13 neue
Kandidatenmanifeste mit 238 eigenen Dateien** und das unabhängige Artefaktaudit
mit sechs eigenen Dateien exakt geprüft. Alle **3.505 neuen nicht ignorierten
JSON-Dateien** wurden tatsächlich eingelesen; keine Parsefehler.

Der [Git-Artefaktnachweis](actual-native-review-artifact-git-readiness.json)
führt die 84 exakt gebundenen, nun versionierbaren nativen Reviewdarstellungen
auf. Allgemeine Bundle-Regeln nehmen 42 PDF und 42 HTML auf; amtliche Downloads
und öffentliche generierte Bücher behalten ihre bestehenden Grenzen.

Zwei erzeugte Transport-ZIPs bleiben unverändert lokal, einschließlich ihrer
historischen Hashes. Produktionschecks lesen diese ZIPs nicht. Eine allgemeine
Qualitätsarchivregel verhindert ihre irrtümliche Aufnahme als übergroße Git-
Blobs. Es gibt keine neue LFS-Abhängigkeit und keine neue Validatorausnahme.

## Fortsetzung

Die [öffentliche Fortsetzungsnotiz](../../../../../../../docs/qa-ci/chemie-biologie-m7-commit-checkpoint-2026-10-06.md)
trennt bestätigte B007-Materialbefunde, offene B008-Korrekturen, die sieben
nativen Biologie-Zielkandidaten mit elf offenen Quellabschnittscodes, sieben
PNG-Autorkandidaten ohne unabhängige V-Freigabe und die offene Neuro-Quellschuld.
Unveränderte gültige Nachweise werden nicht erneut fachlich geprüft.

Der vollständige frühere App-Build und die zentralen/abhängigen maschinellen
Integrationsgates bleiben an ihre 19 unveränderten tatsächlichen Eingänge
gebunden; es wird kein neuer vollständiger Build behauptet. Historische
Artefakte bleiben unverändert. Gespeicherte Autorenwerkzeuge werden für eine
Wiederholung erst in ein eigenes tmp-Isolat kopiert; eingefrorene Pakete sind
keine schreibbaren Arbeitsverzeichnisse.

Dies ist kein Commit, Push, Merge, GitHub-CI-Erfolg, Deployment, menschlicher
Release, menschliche Prüfung oder Erprobung. Das volle M7-Ziel bleibt offen.
