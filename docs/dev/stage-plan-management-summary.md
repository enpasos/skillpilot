# Management Summary zu Lernfluss und Stufenplänen

Ziel ist die vollständige Umsetzung von **K1–K13 und F1–F7** aus
[PR #156](https://github.com/enpasos/skillpilot/pull/156), integriert auf
`main` mit frischer erfolgreicher CI. Die Agenten verantworten Recherche,
Entscheidungen und Umsetzung; der Product Owner kontrolliert die Ergebnisse.
Der verbindliche Umfang steht in der [Übergabe](stage-plan-units-handover-2026-11-15.md).

Jedes Paket erhält einen datierten Eintrag mit Uhrzeit und Zeitzone, Fortschritt,
Ergebnis und Entscheidungen, Kontrollstellen, Nachweisen, Integrationsstand
und nächstem Schritt. Die Fortschrittszahlen zählen vollständig abgeschlossene
Arbeiten, keine gewichteten Prozentwerte. Entwürfe und Teilreparaturen bleiben
offen. Der neueste Paketeintrag steht oben; sein Zeitstempel wird bis zum
Abschluss aktualisiert. Frühere Abschlüsse bleiben erhalten.

Offene Einträge verweisen auf den PR. Erst der Abschluss nennt den geprüften
Implementierungscommit und den erfolgreichen Main-CI-Lauf. Dessen Jobzahl
wird getrennt von zusätzlichen oder zeitgesteuerten Commit-Checks angegeben.
Ein kleiner Doku-Abschlusscommit oder kurzlebiger Doku-PR ist danach erlaubt;
er erhält die Dokumentationschecks. Die große CI schließt `docs/dev/**` und
`AGENTS.md` bei reinen Änderungen dieser Pfade derzeit aus. Der dokumentierte
CI-Nachweis gilt weiterhin für den benannten Implementierungscommit.

## Gesamtstand

**Stand: 15. November 2026, 12:02 MEZ (UTC+01:00).**

**Fortschritt: K 0/13 und F 0/7 vollständig abgeschlossen · 0 reale Landespläne
aktiviert · Wirkung auf die vollständigen Stufenrückgriffe noch nicht gemessen.**
Begrenzte Kanten- und Sichtvergleiche sind noch kein vollständiger Vorher-/Nachher-Nachweis.

| Umfang | Stand und verbleibende Arbeit |
| --- | --- |
| K1 | Teilreparatur in #157: elementarer Halbleiterpfad und eigener Transistor-Schaltversuch. Eigener Verstärkerversuch und vollständige Stufenplatzierung offen. |
| K2 | Vier Diagrammaufgaben und drei elementare Aufgaben in #157; die jüngste Korrektur trennt Tabellenkompetenz und Zahlenvorbereitung der anspruchsvolleren Aufgabe. Physikrückgriffe und Länderplatzierungen bleiben offen. |
| K3–K6, K8–K11 | Fachrecherche und lokale Entwürfe laufen; noch keine abgeschlossene Lieferung dieser Befunde. |
| K7, K12, K13 | Offen: Rheinland-Pfalz, fachliche Voraussetzungen auf Prüfungsaufgaben und konsistente Stufenausschnitte. Vorliegende Bestandsaufnahmen sind keine Reparatur. |
| F1, F2, F6 | Grundlage in #157: Planvertrag, Erzeugung und Diagnosekern. Reale Pläne, vollständige Anbindung und ihre Abnahme fehlen. |
| F3, F4 | Offen: Lernkarte aus erklärten Planeinheiten und Einordnung notwendiger Vorbereitung. |
| F7 | Zweisprachiger Normkandidat lokal umgesetzt und unabhängig geprüft; noch nicht integriert. |
| F5 | Fachprüfung teilweise umgesetzt über K1/K2; der vollständige Befundbestand bleibt offen. |

## 15. November 2026, 12:02 MEZ — Halbleiterpfad, Tabellen-/Diagrammaufgaben und Stufenplangrundlage

**Stand: Lokale Korrekturen und Qualitätschecks bestanden. Der bisherige Durchgang
von [PR #157](https://github.com/enpasos/skillpilot/pull/157) endete mit neun
erfolgreichen und fünf fehlgeschlagenen Jobs. Die gebündelte Korrektur geht jetzt
in die erneute vollständige PR-CI; Integration und frische Main-CI stehen aus.**

- **Fortschritt:** K1/K2 teilweise umgesetzt; F1/F2/F6 als Grundlage mit
  isolierten Testdaten. **K 0/13, F 0/7 abgeschlossen; 0 reale Landespläne
  aktiviert.** Die Gesamtwirkung auf Stufenrückgriffe ist noch nicht gemessen.
  Die jüngste Tabellenkorrektur entfernt vier unnötige fachliche Vorleistungen
  des elementaren Ziels; die stärkere Aufgabe behält ihre vollständige Vorbereitung.
- **Ergebnis und Entscheidungen:** Drei neue Physikkompetenzen und drei
  Lernendenaufgaben trennen einfaches Dotierungsmodell, vorgegebene
  Diodenkennlinien und einen selbst durchgeführten Transistor-Schaltversuch.
  33 Quellenzuordnungen sind begrenzt korrigiert. Vier Diagrammaufgaben ersetzen
  eine unbelegte Abdeckung durch eine Algebraaufgabe; vier dadurch fälschlich
  einbezogene Diagrammziele entfallen aus 18 erzeugten Sichten. Vier elementare
  Voraussetzungsketten und drei Aufgaben für Tabellenaufbau, Tabellenlesen und
  Diagrammlesen ergänzen den Pfad. Der zweite CI-Durchgang fand eine falsch
  vorgezogene J6-Voraussetzung am J5-Tabellenziel: Die Zahlenvorbereitung sitzt
  jetzt ausdrücklich an der anspruchsvolleren Aufgabe. Zieltexte und Raster
  bleiben vollständig erhalten. `v1.3` beschreibt den Planvertrag, noch keine
  aktivierte Paket-Laufzeitversion.
- **Kontrollstellen:**
  [Physik: Kompetenzen, Versuchshandlungen und Bewertungsraster](https://github.com/enpasos/skillpilot/blob/e5154f263880f8699a3130883c07269d4827737a/curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/post-corrected-independent-review-v3/README.md),
  [Mathematik: Tabellenkompetenz, Aufgabengrenze und aktuelle Inhaltsreviews](https://github.com/enpasos/skillpilot/blob/e6eb2add29a325204dae9a24f37d89dc0e2a9425/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/k2-table-task-boundary-current-v2/README.md),
  [Planvertrag v1.3 und fehlende Anbindung](https://github.com/enpasos/skillpilot/blob/e5154f263880f8699a3130883c07269d4827737a/contracts/curriculum-package/v1.3/README.md).
- **Nachweise:** Die [aktuelle lokale Qualitätsberechnung](https://github.com/enpasos/skillpilot/blob/e6eb2add29a325204dae9a24f37d89dc0e2a9425/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/k2-table-task-boundary-current-v2/integrated-validation/full-quality-and-maturity-comparison.actual.json)
  bestätigt alle fünf M7-Fächer und unveränderte Reifegrade für alle 21 Kataloge;
  die Mindeststandards für zwölf Routen halten. Mathematik hat 807, Physik 481
  vollständig maschinell geprüfte Kompetenzen. Die Lernrouten-Tests bestehen
  mit 25/25 Fällen. Zwei frische unabhängige Inhaltsreviews bestätigen das
  Tabellenziel; die [technische Gegenprüfung](https://github.com/enpasos/skillpilot/blob/e6eb2add29a325204dae9a24f37d89dc0e2a9425/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/k2-table-task-boundary-current-v2/completion-audit/README.md)
  bestätigt 18 unveränderte Sichten und unveränderte Voraussetzungsmengen für
  128 Konfigurationen. Der Paketvalidator besteht mit 51 Negativfällen.
  Veraltete Paket-, Berichts- und Testbindungen sind korrigiert; die
  Freigabeentscheidungen bleiben erhalten. Das sind lokale automatisierte
  Checks und getrennte Agentenreviews, keine beobachtete Lernwirkung oder
  bereits erfolgreiche neue Remote-CI.
- **Nächster Schritt:** Den erneuten vollständigen CI-Durchgang von #157
  auswerten und die Lieferung nach Merge plus frischer Main-CI abschließen. Danach die vorbereiteten Fachreparaturen und Normquellen
  integrieren. Eigener Verstärkerversuch, weitere falsche Kompetenznachweise,
  Länderplatzierungen und reale Planaktivierung bleiben Teil des Gesamtauftrags.

## 15. November 2026, 09:09 MEZ — Offene Ausgangslieferungen integriert

**Abgeschlossen; rückblickender Eintrag, CI-Zählung am angegebenen Zeitpunkt korrigiert.**

- **Fortschritt:** Zwei Ausgangs-PRs integriert; K 0/13 und F 0/7 abgeschlossen,
  0 reale Landespläne aktiviert, keine gemessene Gesamtwirkung auf Rückgriffe.
- **Ergebnis und Entscheidungen:**
  [#156 Übergabe](https://github.com/enpasos/skillpilot/pull/156) und
  [#153 Lernkartenvorschau](https://github.com/enpasos/skillpilot/pull/153)
  nach erfolgreichen PR-Checks integriert. Beide bilden die Arbeitsgrundlage;
  sie beheben noch keinen der übernommenen Fachbefunde.
- **Kontrollstellen:** [Auftragsumfang und Abnahmebedingungen](stage-plan-units-handover-2026-11-15.md#7-lieferstand-des-delegierten-auftrags)
  sowie die [Vorschau in #153](https://github.com/enpasos/skillpilot/pull/153).
- **Nachweis und Integration:** Die frische
  [Main-CI 43674399591](https://github.com/enpasos/skillpilot/actions/runs/43674399591)
  für [Commit a7c7e9ceb2](https://github.com/enpasos/skillpilot/commit/a7c7e9ceb26f06194e25f29e32941d4e4cb17c32)
  endete am 15. November 2026 um 05:54 MEZ erfolgreich: **14/14 Jobs bestanden**.
  Die früher genannten 25 erfolgreichen und zwei übersprungenen Checks waren
  eine zeitgebundene Summe mehrerer Workflows am Commit, nicht die Jobzahl
  dieses Laufs.
- **Nächster Schritt:** K1–K13 und F1–F7 in zusammenhängenden Lieferungen umsetzen.
