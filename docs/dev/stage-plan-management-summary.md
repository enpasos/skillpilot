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

**Stand: 15. November 2026, 09:12 MEZ (UTC+01:00).**

**Fortschritt: K 0/13 und F 0/7 vollständig abgeschlossen · 0 reale Landespläne
aktiviert · Wirkung auf die vollständigen Stufenrückgriffe noch nicht gemessen.**
Begrenzte Kanten- und Sichtvergleiche sind noch kein vollständiger Vorher-/Nachher-Nachweis.

| Umfang | Stand und verbleibende Arbeit |
| --- | --- |
| K1 | Teilreparatur in #157: elementarer Halbleiterpfad und eigener Transistor-Schaltversuch. Eigener Verstärkerversuch und vollständige Stufenplatzierung offen. |
| K2 | Teilreparatur in #157: vier passende Diagrammaufgaben. Elementare Tabellen-/Diagrammkette und Länderplatzierungen offen. |
| K3–K6, K8–K11 | Fachrecherche und lokale Entwürfe laufen; noch keine abgeschlossene Lieferung dieser Befunde. |
| K7, K12, K13 | Offen: Rheinland-Pfalz, fachliche Voraussetzungen auf Prüfungsaufgaben und konsistente Stufenausschnitte. Vorliegende Bestandsaufnahmen sind keine Reparatur. |
| F1, F2, F6 | Grundlage in #157: Planvertrag, Erzeugung und Diagnosekern. Reale Pläne, vollständige Anbindung und ihre Abnahme fehlen. |
| F3, F4, F7 | Offen: Lernkarte aus erklärten Planeinheiten, Einordnung notwendiger Vorbereitung und zweisprachige Norm. |
| F5 | Fachprüfung teilweise umgesetzt über K1/K2; der vollständige Befundbestand bleibt offen. |

## 15. November 2026, 09:12 MEZ — Halbleiterpfad, Diagrammaufgaben und Stufenplangrundlage

**Stand: lokale Nachweise vorhanden; [PR #157](https://github.com/enpasos/skillpilot/pull/157)
meldet einen CI-Fehler beim Check der Bilddateien. Korrektur läuft;
Integration und frische Main-CI stehen aus.**

- **Fortschritt:** K1/K2 teilweise bearbeitet; F1/F2/F6 als Grundlage.
  K 0/13, F 0/7 abgeschlossen; 0 reale Landespläne aktiviert; vollständige
  Rückgriffswirkung noch nicht gemessen.
- **Ergebnis und Entscheidungen:** Drei neue Kompetenzen und drei neue
  Lernendenaufgaben trennen einfaches Dotierungsmodell, Deutung vorgegebener
  Diodenkennlinien und selbst durchgeführten Transistor-Schaltversuch.
  Ein bestandener Papierauftrag gilt dadurch nicht als eigener Versuch.
  33 Quellenzuordnungen wurden begrenzt korrigiert. Vier neue Diagrammaufgaben
  ersetzen eine unbelegte Abdeckung durch eine Algebraaufgabe; in 18 erzeugten
  Sichten entfallen vier nur durch deren falsche Voraussetzung aufgenommene
  Diagrammziele. Die Kompetenzen selbst bleiben erhalten. Die korrigierten
  Bewertungsraster verlangen alle fachlichen Kernaspekte und lassen
  gleichwertige Antworten zu. Unter `v1.3` entsteht ein Planvertrag als
  Grundlage; dies ist noch keine aktivierte neue Paket-Laufzeitversion.
- **Kontrollstellen:**
  [Halbleiterkompetenzen, eigene Versuchshandlungen und sechs Bewertungsraster](https://github.com/enpasos/skillpilot/blob/5bf8228635aed4eee780fdb98f4b7ee2af6d480a/curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/post-corrected-independent-review-v3/README.md),
  [Diagrammaufgaben, unabhängige Reviews und Änderungen der 18 Sichten](https://github.com/enpasos/skillpilot/blob/5bf8228635aed4eee780fdb98f4b7ee2af6d480a/curricula/DE/Gymnasium/quality/assessment-review/mathematik/diagram-route-repair-20261115-v1/README.md),
  [Planvertrag v1.3 und seine noch fehlende Anbindung](https://github.com/enpasos/skillpilot/blob/5bf8228635aed4eee780fdb98f4b7ee2af6d480a/contracts/curriculum-package/v1.3/README.md).
- **Nachweise:** Die eingecheckte lokale
  [Statusberechnung mit Befehl, Laufzeiten und Ergebnissen](https://github.com/enpasos/skillpilot/blob/5bf8228635aed4eee780fdb98f4b7ee2af6d480a/curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/applicability-followup-v5/final-integrated-status.actual.json)
  und der [Vergleich der unveränderten Mindeststandards](https://github.com/enpasos/skillpilot/blob/5bf8228635aed4eee780fdb98f4b7ee2af6d480a/curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/applicability-followup-v5/after-correction-floor-pass.actual.txt)
  dokumentieren fünf tief geprüfte Fächer sowie 21 Kataloge und zwölf geschützte
  Routen. Mathematik und Physik bleiben lokal M7. Die
  [33 Quellenklauseln](https://github.com/enpasos/skillpilot/blob/5bf8228635aed4eee780fdb98f4b7ee2af6d480a/curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/source-coverage-followup-v4/README.md)
  sind einzeln nachverfolgbar. Das sind gespeicherte Agentenläufe und getrennte
  Agentenreviews; die reproduzierte Remote-CI steht noch aus. Beobachtete
  Lernerfolge werden damit nicht behauptet.
- **Nächster Schritt:** Den CI-Fehler beheben, #157 nach erfolgreicher vollständiger CI integrieren
  und die frische Main-CI abwarten. Danach den Abschluss separat dokumentieren.
  Parallel die Tabellen-/Diagrammkette, den eigenen Verstärkerversuch und die
  belegten Länderplatzierungen bis zur tatsächlichen Integration bearbeiten.

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
