# Chemie Q1: unabhängiger P7-Review

Sieben vollständige zweisprachige positive-understanding-evidence-v2-Profile
für den eingefrorenen Autorenkandidaten `chemie-q1-six-source-operator-remediation-current-candidate-v1`,
SHA `70899d0c1f5512fbf5cdd9b5a2cba7f081ff6efca30c17f680036063c07b051b`.
Maßgeblich ist ausschließlich `native-finalbook-v2`: D8-BookDigest
`sha256:4a274ad82263b9032734bd3a647487f4cfb4ef311a72df1e2e886ef0d2192c6f`.

## Ergebnis

- Unabhängige manuelle Wissenschaftsprüfung: **7 KEEP, 0 offene P-Befunde**.
- Gelesen: 16 vollständige DE/EN-Expectations, 7 DE/EN-Variationsachsen und
  14 vollständige DE/EN-Fallaufgaben einschließlich erwarteter Leistung und Fokus.
- Tatsächlicher Eingang: sämtliche aktuellen D8-Zielbeschreibungen, Kontexte,
  Voraussetzungen und Originalquellen; acht volle native PDF-Zielseiten selbst
  exportiert und angesehen; acht Originalbilder tatsächlich angesehen und im
  exakt gefrorenen HTML geladen.
- Native Materialisierung und `positiveGoalEvidenceReview --mode=check`:
  **Exit 0, 7 Needs human review, 0 Approved, 0 Rejected, 0 Blocking issues**.
- Alle sieben Profil-Payloads, Ziel-, Kriterien-, Profil- und Reviewinput-
  Fingerprints sind exakt identisch zum geprüften Autorenkandidaten. Geändert
  sind allein unabhängiger Review-ID, Reviewer, Datum und konkrete Prüfreasons.

Die wissenschaftlichen Ergebnisse wurden vor der nativen Serialisierung und
ohne Kenntnis vollständiger D-A/D-B-Urteile eingefroren:
`independent-science.freeze.manifest.json`,
SHA `22c240a787b90f5e2f3e4caa51c96359f3f9583889cd028947cbce526bd2b638`.
Der Reviewer hatte keine Chemie-Autorenschaft.

## Wichtige Grenzen

`d742` verlangt tatsächliches Planen **und** Durchführen;
`d3cd` tatsächliche quantitative Bestimmungen **beider** Analyten.
Vorbereitete Rechnungen ersetzen diese künftig erforderlichen Leistungen nicht.
`d76` behandelt Wirkweise, Dosierungen und datierte Kategoriebedingungen;
`0d59` bleibt ausschließlich HE SekII LK. `057`, `39c` und `10f` bleiben
ausdrücklich begrenzte eigene Transfers ohne direkte normative Atlaszeile.
Der volle Quellenverbund und die dortigen Operatoren bleiben erhalten.

Die datierten EU2025-Aufgaben sind Unterrichtsmaterial, keine aktuelle Rechts-
oder Produktfreigabe. Das aktuelle offizielle HE-PDF (Stand 21.04.2026) wurde
zusätzlich hier belegt; der historische Autoreninput und alle 310 gefrorenen
Autorenartefakte bleiben bytegenau unverändert.

Alle nativen Records bleiben `ai_candidate`, `needs_human_review`, E1/G1.
Keine menschliche Prüfung oder Erprobung, tatsächliche Laborleistung,
Lernendenleistung, Runtimeänderung oder operative Zielschließung wird behauptet.
Aktive Canon/Registry/QA/Ledger wurden nicht geschrieben; **strikter Nettozuwachs 0**
in diesem unabhängigen Prüfpaket. Die Integration liegt bei Root.

## Reproduzierbare technische Prüfung

Kleine ausführbare Arbeitswurzel:
`tmp/chemie-q1-seven-current-independent-p-v1-native-root`.
Sie enthält fünf identische native Codekopien und explizite Links auf
unveränderte Autoren-Eingänge sowie ausschließlich den eigenen Ausgabepfad.
Keine Vollkopie und keine Sonderregel in einem Validator. Der Autorenbaum
`tmp/chemie-q1-six-source-operator-native-isolated-20261005-v1` wurde nur gelesen.

Aus der eigenen Arbeitswurzel:

```bash
./app/node_modules/.bin/tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-seven-current-independent-p-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-seven-current-independent-p-v1/positive-evidence.candidates.independent.json
./app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --mode=check --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-seven-current-independent-p-v1/positive-evidence.config.json
```

Der erste tatsächliche HTML-Auswertungsversuch las den Abschnittstitel statt
des Beschreibungstexts; die beiden alten Fehlstreams und Codefassungen sind
erhalten. Danach gab es einen dokumentierten transienten Chromium-Startabbruch.
Die unveränderte letzte Auswertung bestand mit acht geladenen Bildern und
acht exakt passenden Zielbeschreibungen. Fehlstreams sind `.txt`; alle
eingefrorenen `.json`/`.jsonl` sind vollständig parsebar. Es fand kein Build statt.
