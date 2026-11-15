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

**Stand: 15. November 2026, 10:38 MEZ (UTC+01:00).**

**Fortschritt: K 0/13 und F 0/7 vollständig abgeschlossen · 0 reale Landespläne
aktiviert · Wirkung auf die vollständigen Stufenrückgriffe noch nicht gemessen.**
Begrenzte Kanten- und Sichtvergleiche sind noch kein vollständiger Vorher-/Nachher-Nachweis.

| Umfang | Stand und verbleibende Arbeit |
| --- | --- |
| K1 | Teilreparatur in #157: elementarer Halbleiterpfad und eigener Transistor-Schaltversuch. Eigener Verstärkerversuch und vollständige Stufenplatzierung offen. |
| K2 | Vier passende Diagrammaufgaben in #157; zusätzlich lokal drei elementare Aufgaben und vier korrigierte Voraussetzungskontexte. Physikrückgriffe und Länderplatzierungen bleiben offen. |
| K3–K6, K8–K11 | Fachrecherche und lokale Entwürfe laufen; noch keine abgeschlossene Lieferung dieser Befunde. |
| K7, K12, K13 | Offen: Rheinland-Pfalz, fachliche Voraussetzungen auf Prüfungsaufgaben und konsistente Stufenausschnitte. Vorliegende Bestandsaufnahmen sind keine Reparatur. |
| F1, F2, F6 | Grundlage in #157: Planvertrag, Erzeugung und Diagnosekern. Reale Pläne, vollständige Anbindung und ihre Abnahme fehlen. |
| F3, F4, F7 | Offen: Lernkarte aus erklärten Planeinheiten, Einordnung notwendiger Vorbereitung und zweisprachige Norm. |
| F5 | Fachprüfung teilweise umgesetzt über K1/K2; der vollständige Befundbestand bleibt offen. |

## 15. November 2026, 10:38 MEZ — Halbleiterpfad, Tabellen-/Diagrammaufgaben und Stufenplangrundlage

**Stand: lokale Nachweise bestanden; aktualisierte Lieferung für
[PR #157](https://github.com/enpasos/skillpilot/pull/157). Erfolgreiche vollständige
PR-CI, Integration und frische Main-CI stehen aus.**

- **Fortschritt:** K1/K2 teilweise umgesetzt; F1/F2/F6 als Grundlage.
  **K 0/13, F 0/7 abgeschlossen; 0 reale Landespläne aktiviert.** Die Wirkung
  auf sämtliche Stufenrückgriffe ist noch nicht gemessen. Lokal sinkt etwa
  die Zahl vorausgesetzter Kompetenzen für „Tabellen erstellen“ von 27 auf vier.
- **Ergebnis und Entscheidungen:** Drei neue Physikkompetenzen und drei
  zugehörige Lernendenaufgaben trennen einfaches Dotierungsmodell,
  vorgegebene Diodenkennlinien und einen selbst durchgeführten
  Transistor-Schaltversuch. 33 Quellenzuordnungen sind begrenzt korrigiert.
  Vier neue Diagrammaufgaben ersetzen eine unbelegte Abdeckung durch eine
  Algebraaufgabe; vier dadurch fälschlich einbezogene Diagrammziele entfallen
  aus 18 erzeugten Sichten. Hinzu kommen vier korrigierte elementare
  Voraussetzungsketten und drei Aufgaben für Tabellenaufbau, Tabellenlesen
  und Diagrammlesen. Vollständige Zieltexte und Evidenzprofile bleiben erhalten;
  die Raster verlangen alle fachlichen Kernaspekte und erlauben gleichwertige
  Antworten. `v1.3` beschreibt den neuen Planvertrag, noch keine aktivierte
  Paket-Laufzeitversion.
- **Kontrollstellen:**
  [Physik: Kompetenzen, Versuchshandlungen und Bewertungsraster](https://github.com/enpasos/skillpilot/blob/e5154f263880f8699a3130883c07269d4827737a/curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/post-corrected-independent-review-v3/README.md),
  [Mathematik: elementare Kette, Gegenbeispiele und unveränderte Zielumfänge](https://github.com/enpasos/skillpilot/blob/e5154f263880f8699a3130883c07269d4827737a/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/k2-elementary-representations-current-v1/README.md),
  [Planvertrag v1.3 und fehlende Anbindung](https://github.com/enpasos/skillpilot/blob/e5154f263880f8699a3130883c07269d4827737a/contracts/curriculum-package/v1.3/README.md).
- **Nachweise:** Der [gemeinsame lokale Liefernachweis](https://github.com/enpasos/skillpilot/blob/e5154f263880f8699a3130883c07269d4827737a/curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/ci-followup-v6/README.md)
  verlinkt tatsächliche Befehle, Ausgaben, Fehlversuche und Reviews. Vollständiger
  Anwendungsbuild mit fünf Lernzielbüchern, 119.906 Schemadateien, alle fünf
  tief geprüften Fächer sowie unveränderte Mindeststandards für 21 Kataloge und
  zwölf Routen bestehen. Mathematik bleibt M7 mit 807, Physik mit 481
  Kompetenzen. Die drei korrigierten Backendtests bestehen; 128 konkrete
  Zielmengen sind gegen frühere Datenstände abgeglichen. Der erste PR-Lauf
  scheiterte in sechs Jobs; ihre Ursachen sind lokal behoben. Das sind
  automatisierte Checks und getrennte Agentenreviews, keine beobachtete
  Lernwirkung oder bereits erfolgreiche neue Remote-CI.
- **Nächster Schritt:** Den gemeinsamen Stand in #157 vollständig prüfen,
  integrieren und nach frischer Main-CI abschließen. Danach die bereits
  vorbereiteten Fachreparaturen und Normquellen integrieren. Eigener
  Verstärkerversuch, weitere falsche Kompetenznachweise, Länderplatzierungen
  und reale Planaktivierung bleiben ausdrücklich Teil des Gesamtauftrags.

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
