# Skill-Graph-CI: festes Normenregister vom 6. November 2026

Dieser abgegrenzte Korpus enthält **494 unabhängige Regel-IDs**: 415 deterministische Prädikate, 63 Anforderungen an Artefakt-/Reviewevidenz und 16 menschliche Urteile. Die redaktionelle Inventur der unten genannten Quellen ist abgeschlossen. Das ist weder ein Nachweis hinreichender CI-Abdeckung noch ein M6/M7- oder Wirksamkeitsnachweis.

Die [maschinenlesbare Fassung](skill-graph-ci-rule-corpus-2026-11-06.json) enthält für jede Regel Prädikat, Vertragsstand, Klasse, Scope, Quellenpfad, Abschnitt, exakte Revision und SHA-256 der Quelle. Sie ist der feste ID-Nenner für die getrennten statischen, Runtime- und Content-Präsentationsmatrizen. Die alten 147 ZIP-Zeilen waren ein Ausgangszensus, kein Vollständigkeitsbeweis. Mehrfachpflichten wurden mit stabilen Suffixen aufgeteilt; Plan/Periode, QA, Quellen, Bilder, Bücher und Pakete wurden aus den tatsächlichen Quellen ergänzt.

## Vertragsstände und Prüfbarkeit

- **M / `main`**: bereits geltende Main-Norm bei `0ce5a8d791eeb9783a919195fd8590bfb79f3595`. Noch unimplementierte oder nur bei Nutzung eines optionalen Profils geltende Konzepte bleiben als solche bezeichnet.
- **K6 / `main+clarification6Nov`**: Main plus ausdrücklich bestätigte Cardgoal-/Verified-Recall-Klarstellung, dokumentiert bei `2adcc31e734b6ce10432b575b915fd25c36b7f5e`.
- **T / `PR83target`**: zusätzlicher oder abweichender Zielvertrag ausschließlich bei eingefrorenem PR83 `52619b960e7b261e1cc18d070063c8e7aca74e21`.
- **M-alt** bleibt aktuell Main, wird aber ausschließlich im eingefrorenen PR83-Ziel durch dessen neue Anerkennungsformel ersetzt. `supersededOnlyInFrozenTarget` verhindert die falsche Einstufung als bereits abgelöst.
- **D** = endliches deterministisches Prädikat; **E** = erforderliche Artefakt-/Reviewevidenz; **H** = fachliches menschliches Urteil. Ein prüfbares Review-Manifest beweist nicht die Wahrheit seines Inhalts.
- Eine ID bezeichnet eine unabhängig diagnostizierbare fachliche Invariante. Parameter einer einzigen Formel, eines Schemas oder eines Zustandsübergangs bleiben zusammen; nicht jedes Wort erhält einen künstlichen eigenen Gate.

## Fester Quellenumfang und Ausschlüsse

Redaktionell abgeschlossene Inventur der unten abgegrenzten aktiven Quellen und des eingefrorenen PR83-Deltas; nicht aller Normen des Repositorys.

Alle 20 direkten Markdown-Dateien unter `docs/concept/skill-graph/` wurden dispositionspflichtig aufgenommen. Hinzu kommen das eingefrorene PR83-Delta, die sechs fachlichen TeX-Kapitel und die unten ausdrücklich bezeichneten Querverträge. Verlinkungen erweitern den Umfang nicht rekursiv. Formale Paralleltexte werden nach Invariante dedupliziert. Die vollständigen Quellhashes und Regelzuordnungen stehen im JSON.

| Kürzel | Quelle / Fassung | Bereich und Behandlung |
|---|---|---|
| G | [docs/concept/skill-graph/graph-definition.md](../../docs/concept/skill-graph/graph-definition.md) · Main | Gesamte formale Graphspezifikation §§1–12; Empfehlung, optionales Profil und Pflichtinvariante bleiben im jeweiligen Prädikat unterscheidbar. |
| G@T | [docs/concept/skill-graph/graph-definition.md](https://github.com/enpasos/skillpilot/blob/52619b960e7b261e1cc18d070063c8e7aca74e21/docs/concept/skill-graph/graph-definition.md) · PR83 | Gesamte formale Graphspezifikation §§1–12; Empfehlung, optionales Profil und Pflichtinvariante bleiben im jeweiligen Prädikat unterscheidbar. |
| A | [docs/concept/skill-graph/assessment-gated-completion.md](../../docs/concept/skill-graph/assessment-gated-completion.md) · 6.11.-Klarstellung | Gesamter Anerkennungsvertrag §§1–8; Main-Fassung und eingefrorene PR83-Fassung getrennt. Aktuelle SRS-Klarstellung im Main-Vertrag berücksichtigt. |
| A@T | [docs/concept/skill-graph/assessment-gated-completion.md](https://github.com/enpasos/skillpilot/blob/52619b960e7b261e1cc18d070063c8e7aca74e21/docs/concept/skill-graph/assessment-gated-completion.md) · PR83 | Gesamter Anerkennungsvertrag §§1–8; Main-Fassung und eingefrorene PR83-Fassung getrennt. Aktuelle SRS-Klarstellung im Main-Vertrag berücksichtigt. |
| U | [docs/concept/skill-graph/learning-units.md](../../docs/concept/skill-graph/learning-units.md) · Main | Begriff, direkte Zuständigkeit, rekursiver Abschluss und Konzeptgrenzen; keine Ermächtigung zu neuer Runtime oder Zerlegung. |
| UP | [docs/concept/skill-graph/learning-unit-progression.md](../../docs/concept/skill-graph/learning-unit-progression.md) · Main | Gesamter fachlicher Progressionsvertrag; Unit-Zugangspolitik ausdrücklich noch unentschieden. |
| UD | [docs/concept/skill-graph/learning-unit-design-and-examples.md](https://github.com/enpasos/skillpilot/blob/52619b960e7b261e1cc18d070063c8e7aca74e21/docs/concept/skill-graph/learning-unit-design-and-examples.md) · PR83 | Nur eingefrorener PR83-Zieltext: fachliche Entwurfsbeispiele und menschliche Unit-Beurteilung, keine zusätzliche algorithmische Gate-Semantik. |
| N | [docs/concept/skill-graph/node-types.md](../../docs/concept/skill-graph/node-types.md) · 6.11.-Klarstellung | Aktive Goal-Typen, Card-/Exam-Verträge und SRS-Klarstellung; Scheduler- und Batchregeln getrennt von Mastery. |
| V | [docs/concept/skill-graph/view-projection-and-goal-placement.md](../../docs/concept/skill-graph/view-projection-and-goal-placement.md) · Main | Projektions-, Rollen-, Platzierungs- und Default-Tree-Verträge; Beispiele erzeugen keine zusätzlichen Pflichtdaten. |
| GS | [docs/concept/skill-graph/general-goal-system-and-migration.md](../../docs/concept/skill-graph/general-goal-system-and-migration.md) · Main | Goal/Program/Placement/Competency-Axis-Trennung und Migrationsinvarianten; vorgeschlagene spätere Ontologie ist kein implementierter Schemazwang. |
| CR | [docs/concept/skill-graph/canonical-gymnasium-rollout.md](../../docs/concept/skill-graph/canonical-gymnasium-rollout.md) · Main | Kanonischer Rollout, Scope-Vertrag, Migrationszustände und bewahrte Lerneridentität; historische Rolloutzahlen sind keine festen Normnenner. |
| SR | [docs/concept/skill-graph/source-and-resource-links.md](../../docs/concept/skill-graph/source-and-resource-links.md) · Main | Gesamter Provenienz-, Quellbeleg-, Didaktikressourcen- und Darstellungsvertrag. |
| CI | [docs/concept/skill-graph/content-integration.md](../../docs/concept/skill-graph/content-integration.md) · Main | §§3.1–3.7 Content-Integration: Quellinhalt, Ressourcen und Lernendenpräsentation; allgemeine Provider-/Deploymenttechnik ausgenommen. |
| IM | [docs/concept/skill-graph/atomic-goal-visualizations.md](../../docs/concept/skill-graph/atomic-goal-visualizations.md) · Main | Assets, Qualität/Review, Provenienz, kanonisches JSON und lernzielbezogener Renderablauf. Allgemeine Provider-CLI, OAuth, CSP und Installation ausgenommen. |
| BK | [docs/concept/skill-graph/learning-goal-book-and-evidence-review-pipeline.md](../../docs/concept/skill-graph/learning-goal-book-and-evidence-review-pipeline.md) · Main | Graph-, Modell-, Review- und Publikationsregeln §§1–7, 8.2–8.3, 9.4.1, 9.6, 10–14. Custody/Retention §§8.4–8.5 nur als notwendige Artefakt-Vertrauensgrenze, kein vollständiger Security-Katalog. |
| PK | [docs/concept/skill-graph/dual-curriculum-package-releases.md](../../docs/concept/skill-graph/dual-curriculum-package-releases.md) · Main | Normativer Paketvertrag einschließlich Closure, Roundtrip, Identität, Digest, Registry und sicherer Installation. Historische Pilotergebnisse, Beispielhashes und offene Hosting-/Repositoryentscheidungen ausgenommen. |
| HR | [docs/concept/skill-graph/human-readable-source-rationales.md](../../docs/concept/skill-graph/human-readable-source-rationales.md) · Main | Als Konzeptvorschlag gelesen: Herkunftsnachweis und maschinenprüfbare Bindung an geprüften Inhalt. Kein neuer universeller 100%-Source-Rationale-Autorenpflichtgate aus vorgeschlagenen Formaten oder Rechercheabläufen. |
| MEM | [docs/concept/skill-graph/mem-fwu-roundtrip-plan.md](../../docs/concept/skill-graph/mem-fwu-roundtrip-plan.md) · Main | Graphsemantischer MEM/FWU-Roundtrip und Profilgrenzen; externe PR-/Issue-Zusammenarbeit und angekündigte Implementierung sind keine zusätzlichen CI-Gates. |
| TP | [docs/concept/skill-graph/teacher-goal-book-time-planning.md](../../docs/concept/skill-graph/teacher-goal-book-time-planning.md) · Main | Erste Ausbaustufe und Sicherheitsgrenzen der lokalen Lehrkraft-Zeitplanung; keine implizite serverseitige Veröffentlichung. |
| AG | [AGENTS.md](https://github.com/enpasos/skillpilot/blob/main/AGENTS.md) · 6.11.-Klarstellung | Skill-Graph-, Mastery-, QA-, Content- und Planungsregeln §§1–7, 10.1–10.2 sowie feste Lizenzzuordnung. Providerrelease, OAuth, Hosting und sonstige Plattform-/Securityregeln außerhalb dieses Korpus. |
| PS | [docs/concept/levels-of-personalization.md](../../docs/concept/levels-of-personalization.md) · Main | Level 2/3/4, Curriculum-Manifest und Scope-/Fokusinvarianten; allgemeine Kontoprofil-/Providerplattform ausgenommen. |
| LS | [docs/concept/didactic/unified-learning-plan-status.md](../../docs/concept/didactic/unified-learning-plan-status.md) · Main | Gesamter aktiver einheitlicher Plan-/Periodenstatusvertrag einschließlich Formeln, Bezugszeitraum und fachlicher Anzeigegrenzen. |
| TA | [docs/concept/didactic/curriculum-time-axis-and-pacing.md](../../docs/concept/didactic/curriculum-time-axis-and-pacing.md) · Main | Aktive Statuskorrekturen; §§1–3, 6.1, 7.3–7.4, 19.1–19.2 und die dort ausdrücklich verbindlichen Regeln der laufenden Piloten. Ablöste CoverageEvent-/CoverageLedger-/Attestation-/manuelle Unterrichts-IST-Entwürfe und historische Stufenarchitektur ausgeschlossen. Optionale formale Planung nach G §12.5–12.6/TEX. |
| EP | [docs/concept/runtime-workflows/exam-preparation-planning.md](../../docs/concept/runtime-workflows/exam-preparation-planning.md) · Main | Gesamter aktiver Prüfungsabschnitts-/Vervollständigungsvertrag; keine neue Prüfungsart oder zusätzliche Unit-Gatepolitik. |
| HQ | [docs/concept/curriculum-quality-and-human-trial.md](../../docs/concept/curriculum-quality-and-human-trial.md) · Main | Qualitätsregeln, unabhängiger KI-Review, menschliche Erprobung und Wirksamkeitsnachweis. Historische Counts/Farben und Umsetzungspläne sind keine neue Pflichtregel. |
| GV | [docs/qa-ci/graph-validation-rules.md](../../docs/qa-ci/graph-validation-rules.md) · Main | Alle dokumentierten GVR/APV/CPV- und ergänzenden Graph-/Content-Prüfverträge einschließlich Scope- und Warning-Grenzen. Undokumentierte technische Zusatzchecks werden nicht zur Norm erfunden. |
| QM | [docs/qa-ci/curriculum-quality-maturity-and-routes.md](../../docs/qa-ci/curriculum-quality-maturity-and-routes.md) · Main | Scope-/Curriculum-Reife, Regelstatus und sämtliche CQR-Regelblöcke. Der Widerspruch Scope max M3 versus M4-Tabelle bleibt D-QS; historische aktuelle Fachcounts sind keine Norm. |
| HRG | [docs/qa-ci/curriculum-package-human-review-gates.md](../../docs/qa-ci/curriculum-package-human-review-gates.md) · Main | Menschliche Review-Gates HR-001 bis HR-006 soweit mit aktueller fester Lizenzentscheidung vereinbar; historische Pending-Zahlen und überholte Eigenmaterial-Einzellizenzfreigabe sind keine aktuelle Pflicht. |
| LIC | [LICENSING.md](https://github.com/enpasos/skillpilot/blob/main/LICENSING.md) · Main | Feste funktionale Lizenzzuordnung und Grenzen für Drittmaterial, Attribution und exportierte Artefakte; keine pauschale Neulizenzierung. |
| TEX | [docs/concept/skill-graph/latex/graph-planning.tex](../../docs/concept/skill-graph/latex/graph-planning.tex) · Main | Formale optionale Erwerbs-/Zeitplanung als Präzisierung von G §§12.5–12.6; keine zusätzliche produktive Laufzeit oder Planpflicht. |
| X-index | [docs/concept/skill-graph/index.md](../../docs/concept/skill-graph/index.md) · Main | Navigationsindex; keine unabhängige Regel. |
| X-curriculum-levels | [docs/concept/skill-graph/curriculum-levels.md](../../docs/concept/skill-graph/curriculum-levels.md) · Main | Kompatibilitätsverweis auf neue Learning-Unit-Terminologie; keine eigene Norm. |
| X-curriculum-level-gates | [docs/concept/skill-graph/curriculum-level-gates.md](../../docs/concept/skill-graph/curriculum-level-gates.md) · Main | Kompatibilitätsverweis; keine zusätzliche Zugangspolitik. |
| X-completion-semantics-clarification-2026-11-04 | [docs/concept/skill-graph/completion-semantics-clarification-2026-11-04.md](../../docs/concept/skill-graph/completion-semantics-clarification-2026-11-04.md) · Main | Entscheidungshistorie: aktive Main-Anerkennung über A@M/G@M und U35–U38 erfasst. Nicht kumulativ neben dem eingefrorenen PR83-Nachfolger anzuwenden. |
| TEX-graph-core | [docs/concept/skill-graph/latex/graph-core.tex](../../docs/concept/skill-graph/latex/graph-core.tex) · Main | Formale Parallelfassung zu G/A/U/UP/V; nach fachlichen Invarianten dedupliziert. Kein eigener zweiter Regelnenner. |
| TEX-graph-assessment | [docs/concept/skill-graph/latex/graph-assessment.tex](../../docs/concept/skill-graph/latex/graph-assessment.tex) · 6.11.-Klarstellung | Formale Parallelfassung zu G/A/U/UP/V; nach fachlichen Invarianten dedupliziert. Kein eigener zweiter Regelnenner. |
| TEX-graph-learning-units | [docs/concept/skill-graph/latex/graph-learning-units.tex](../../docs/concept/skill-graph/latex/graph-learning-units.tex) · Main | Formale Parallelfassung zu G/A/U/UP/V; nach fachlichen Invarianten dedupliziert. Kein eigener zweiter Regelnenner. |
| TEX-graph-context | [docs/concept/skill-graph/latex/graph-context.tex](../../docs/concept/skill-graph/latex/graph-context.tex) · Main | Formale Parallelfassung zu G/A/U/UP/V; nach fachlichen Invarianten dedupliziert. Kein eigener zweiter Regelnenner. |
| TEX-graph-appendix | [docs/concept/skill-graph/latex/graph-appendix.tex](../../docs/concept/skill-graph/latex/graph-appendix.tex) · Main | Formale Parallelfassung zu G/A/U/UP/V; nach fachlichen Invarianten dedupliziert. Kein eigener zweiter Regelnenner. |

Nicht enthalten sind:

- Providerveröffentlichung, allgemeine OAuth-/Session-/Hosting-/Security- und Plattformnormen außerhalb des angegebenen graphbezogenen Paketvertrags.
- Immutable Archive, bereits veröffentlichte Evidence-/Release-Artefakte und historische Reviews als aktive Normquellen.
- Ablöste Coverage-/Preparation-discharge-Modelle außer ausdrücklich bezeichneten historischen Vergleichen.
- Beispiele, aktuelle Counts, Empfehlungen, vorgeschlagene spätere Formate und undokumentierte Code-Zusatzchecks als erfundene universelle Pflicht.
- Keine rekursive Aufnahme jedes Hyperlinks: nur das explizite Quellenregister und seine Bereichsgrenzen bestimmen den Nenner.

Die Quellinventur behauptet ausdrücklich nicht:

- Vollständigkeit aller technischen Implementierungsdetails in jedem referenzierten Schema.
- Fachliche Richtigkeit der Curriculuminhalte oder hinreichende didaktische Prüfungsabdeckung.
- CI-Abdeckung, wirksame harte Gates, bestandene frische CI oder erreichte M6/M7-Reife.

## Stabile Alt-IDs

Diese Alias-IDs sind keine zusätzlichen Regeln und zählen nicht zum Nenner. Alle übrigen bisherigen IDs bleiben erhalten.

| Alte ID | Unabhängige Nachfolger |
|---|---|
| G01 | G01a, G01b |
| V31 | V31a, V31b, V31c |
| V32 | V32a, V32b |
| R19 | R19a, R19b |
| R21 | R21a, R21b |
| U17 | U17a, U17b |
| N09 | N09a, N09b |
| N14 | N14a, N14b |
| N17 | N17a, N17b, N17c |
| N22 | N22a, N22b |
| N26 | N26a, N26b |

## Offene und entschiedene Vertragsfragen

| Entscheidung | Regeln | Stand | Befund und Konsequenz |
|---|---|---|
| D-ID | G01a, G01b, K21, K49 | open-scope-and-migration | Die UUID-Domäne der formalen Graphnorm und stabile Identitäten treffen auf aktive Alt-/Importdaten. Die erweiterte 593-Datei-Inventur fand 164 Nicht-UUID-Goals, 327 entsprechende Referenzen; unter 56024 qualifizierten Schlüsseln liegen 147 Mehrfachserialisierungen und 19 tatsächlich verschiedene contains/requires-Definitionen vor. Diese Bestandszahlen sind Auditbefunde, keine Normnenner. **Konsequenz:** Verbindliches Loader-/Exportuniversum, kanonische Eigentümerschaft und schonende Migration festlegen. Kein stilles Umbenennen, first-file-wins oder Vereinigungsgraph. |
| D-WEIGHT | G02, R05, R06 | open-norm-scope | G §§2.1–2.2 verlangt Weight > 0; compiled-landscape.schema.json erlaubt bei weight minimum 0. Die erweiterte Bestandsinventur fand 39704 Nullgewichte und 16467 positive Gewichte, überwiegend Hochschul-Struktur-/Importdaten. **Konsequenz:** Anwendungsbereich tatsächlicher Kompetenzen gegenüber kompatiblen Programm-/Strukturknoten und beabsichtigte Gewichtungssemantik klären; keine automatische Umgewichtung oder Abschwächung. |
| D-MIN-SCOPE | G17 | open-rollout-scope-not-formula | §7.3 definiert die goal-node-Relation R_effective. Nach Entfernen einer authored Kante wird Vererbung neu berechnet. Die pauschale atomare Lesart des alten ZIP-Zensus war falsch. Der vorhandene S0-Auditor verwendet bereits die spezifizierte goal-node-Relation. **Konsequenz:** Verbindliches Eingabeuniversum und fachliche Behandlung der vorhandenen Befunde festlegen. Kein automatisches didaktisches Kantenlöschen und keine scheinbare Lösung durch bloßen Baseline-/Warning-Verzicht. |
| D-QS | Q04 | open-documentation-conflict | QM beschreibt Scope-Reife im Fließtext als höchstens M3; unmittelbar danach enthält die Tabelle M4 und Curriculum M5 verlangt Scope M4. **Konsequenz:** Den dokumentarischen Rangkonflikt an der beabsichtigten aktiven Reifelogik ausdrücklich auflösen; keine Senkung der Fach-Mindeststände. |
| D-RECOGNITION | U02, U20, U35, U36, U37, U38 | separated-contract-versions | Globale Anerkennungswirkung ist bereits seit 4. November Main-Norm. Main enthält den lokalen I_U-Vertrag; PR83 ergänzt/ersetzt ihn durch qualifiziertes unveränderliches C(q) und dessen Vereinigung. **Konsequenz:** Implementierung und Tests müssen jeweils den bezeichneten Vertragsstand nachweisen; weder Main als bloße PR83-Zukunft abtun noch beide Formeln kumulativ als widerspruchsfreie Istnorm behandeln. |
| D-SRS | N07, N11, N12, N28 | resolved-owner-clarification6Nov | Wiederholtes Kartenlernen und abschließender Verified Recall gehören zum selben Cardgoal. Alle benötigten Karten müssen explizit bestanden sein; bestandene Karten bleiben über Batches hinweg bestanden. Fälligkeit entzieht weder Verifikation noch Mastery; bestandene Karten werden nicht erneut geprüft. **Konsequenz:** Kein neuer Policyentscheid offen. Die irreführende historische No-due-/Retest-/29.-Oktober-Abweichungsbehauptung ist ersetzt; bestehende Guards belegen den vereinbarten Ablauf. |
| D-LICENSE | K56, K57, K58, K59, K61 | resolved-by-explicit-precedence | Die feste Owner-Zuordnung vom 21. September (Software Apache-2.0, eigene Landschaftsinhalte CC-BY-4.0) geht älteren individuellen Eigenmaterial-Lizenzwarteschlangen vor. **Konsequenz:** Drittmaterialrechte, Provenienz und Qualitätsreview bleiben getrennte Pflichten; keine zusätzliche allgemeine Einzellizenzfreigabe eigener Goals. |
| D-TECHNICAL-ADDITIONS | — | excluded-without-normative-source | Zusätzliche technische Prüfungen können sinnvoll sein, sind aber ohne Quelle im festgelegten Normuniversum keine erfundenen Korpusregeln; Beispiel CPV217 für doppelte Phase-Geschwister. CPV216 ist dagegen dokumentiert und implementiert. **Konsequenz:** Technische Zusatzprüfungen gesondert führen; eine spätere Normerweiterung verlangt eine explizite Änderung des Quellenregisters. |

## G: Graphstruktur und effektive Voraussetzungen (43)

| ID | Stand | Art | Scope | Präzises Prädikat | Normquelle |
|---|---|---|---|---|---|
| G01a | M | D | Basis | Jede kanonische Goal-ID gehört zur UUID-Domäne der Graphspezifikation; historische Kurz-/Slug-IDs werden als Befund behandelt, nicht still umnummeriert. | G §§2.1–2.3 |
| G01b | M | D | Basis | Unterschiedliche Ziele haben im aufgelösten Graph unterschiedliche kanonische IDs; Sprachserialisierungen derselben Identität sind keine neuen Ziele. | G §§2.1–2.3 |
| G02 | M | D | Basis | Attributwerte erfüllen ihre deklarierten Domänen, insbesondere positives Gewicht. | G §§2.1–2.2 |
| G03 | M | D | ShortKey | Optionaler ShortKey ist pro logischer Landschaft eindeutig; gleiche Goal-ID darf sprachübergreifend denselben Key tragen, verschiedene IDs nicht. | G §2.3.1; GV GVR010 |
| G04 | M | D | Basis | Atomar genau dann, wenn `contains` leer ist; explizite Atom-/Clustermetadaten müssen damit übereinstimmen. | G §2.4; GV GVR009 |
| G05 | M | D | Basis | Sämtliche `contains`-/`requires`-Endpunkte existieren im aufgelösten Graph, einschließlich fachübergreifender Referenzen. | G §3; §10 |
| G06 | M | D | Basis | `contains` ist azyklisch. Mehrere Eltern sind im allgemeinen Graph erlaubt. | G §4.2 |
| G07 | M | D | Basis | `requires` ist azyklisch. | G §5.3 |
| G08 | M | D | Basis | `requires` bedeutet Konjunktion aller Anforderungen; Pfeilrichtung Verbraucher → Voraussetzung. | G §5.1 |
| G09 | M | D | entsprechende Darstellung | Inverse Lernflussdarstellung ist als solche bezeichnet und keine unabhängig gepflegte zweite Relation. | G §5.1 |
| G10 | M | D | Basis | Effektive Voraussetzungen sind direkte plus Voraussetzungen sämtlicher `contains`-Vorfahren; doppelte Forderungen werden vereinigt. | G §6.1 |
| G11 | M | D | Basis | Vererbung ist nicht bereits transitive Hülle; beide Operationen dürfen nicht verwechselt werden. | G §§6.1–6.4 |
| G12 | M | D | Basis | Clusteranforderungen werden in atomaren Bedarf expandiert, bevor dessen transitive Hülle berechnet wird. | G §6.4 |
| G13 | M | D | Basis | Auch Voraussetzungen der durch Clusterexpansion erreichten Atome werden weiter verfolgt. | G §6.4 |
| G14 | M | D | Basis | Effektive/atomar normalisierte Voraussetzungshülle ist unabhängig vom aktuellen Mastery-Zustand. | G §6.4; A@M §3 |
| G15 | M | D | Basis | Effektive Voraussetzungen bleiben azyklisch; insbesondere keine geerbte Selbstanforderung. | G §7.1 |
| G16 | M | D | Basis | Lokale Minimalität: keine direkte Anforderung, die schon aus einem `contains`-Vorfahren geerbt wird. | G §7.2 |
| G17 | M | D | Gesamter aufgelöster Graph; konkretes verpflichtendes CI-Eingabeuniversum gesondert festzulegen | Für jede verfasste Kante (g,p): diese Kante entfernen, effective(C,R ohne Kante) vollständig neu berechnen; p darf von g darin nicht mehr erreichbar sein. Die Norm prüft Goal-Knoten, nicht automatisch eine atomar expandierte Ersatzrelation. | G §7.3; GV Einleitung |
| G18 | M | D | Bedingt Baumprofil | Ein als Baum/Wald deklarierter Graph erlaubt höchstens einen `contains`-Elternknoten. Nicht auf die allgemeine Polyhierarchie übertragen. | G §8.3 |
| G19 | M | D | GV-Profil | Keine eigene Voraussetzung entlang der Vorfahrenlinie. Nur dort hart, wo entsprechendes GVR-Profil es festlegt. | G §8.2; GV GVR001/003 |
| G20 | M | D | GV-Profil | Im ausgewiesenen GVR-006-Profil darf ein Goal keines seiner direkten contains-Kinder direkt erfordern. Das allgemeinere Vermeiden aller Nachfahren ist G§8.1-Empfehlung, keine zusätzliche universelle Pflicht. | G §8.1; GV GVR-006 |
| G21 | M | D | ausgewiesene Reife-/Mathprofile | Kanonischer direkter atomarer Sequenzgraph trägt den nachgewiesenen Einstieg-/Abschlussweg jedes curricularen Atoms. | G §8.5; GV GVR011/012; QM CQR101/102 |
| G22 | M | D | Math-SekI/SekII | Ein direkter didaktischer Weg nutzt ausschließlich zugelassene Knotenarten und den jeweils geprüften Stage-Scope. | G §8.5; GV GVR012 |
| G23 | M | D | Math-SekI/SekII | Jeder geprüfte kanonische Mathematik-Knoten hat eine vollständige, eindeutige semantische Stage-/Kind-Zuordnung. | G §8.5; GV GVR012 |
| G24 | M | D | Math-SekI/SekII | Auf einem Abschlussweg kommt mindestens ein normales curriculares Atom vor; Prüfungen dürfen den Erwerbsweg nicht ersetzen. | G §8.5; GV GVR012 |
| G25 | M | D | Math-SekI/SekII | Merk-/Abrufziele liegen auf diesem Weg nach normalem Erwerb; Orientierung bleibt reine Orientierung. | G §8.5; GV GVR012 |
| G26 | M | D | aufgelöste Kompositionssicht | Geprüfte direkte kanonische Anforderungen jedes sichtbaren Zielatoms sind in der Projektion als `target` oder `prerequisiteOnly` vorhanden. | G §8.5; V Projektionsvertrag |
| G27 | M | D | aufgelöste Kompositionssicht | Fehlende explizite Level-2-Referenzen sind Konfigurationsfehler, keine Optimismus-Ausnahme und kein erfolgreicher leerer Graph. | G §8.5; AG §2.3 |
| G28 | M | D | Konfigurierte CQR-103-Reiferouten | Jeder vom CQR-103-clusterSelector erfasste Cluster hat leeres requires. | QM CQR-103 |
| G29 | M | D | abgeleitete Darstellung | Clusterabhängigkeitsdarstellungen werden aus atomaren Routen abgeleitet und erzeugen keine zusätzlichen Autorenkanten. | G §8.6 |
| G30 | M | D | Konfigurierte GVR-013-Atomrouten | Jede direkte lokale requires-Kante eines ausgewählten Routenatoms endet an einem Atom, nicht an einem Cluster. | GV GVR-013 |
| G31 | M | D | Legacy-Phase-Validatorprofil | Effektive Voraussetzungen zeigen bei vergleichbaren verfassten Phasenlabels nicht in eine spätere Phase; diese Profilregel ist keine universelle Graphsemantik. | GV GVR-002 |
| G32 | M | D | HE-GO-Rollout ohne Overview | Der erste atomare Knoten ist der konfigurierte Motivationsanker. | GV GVR-004 |
| G33 | M | D | GVR-005/GVR-011-Profilselector | Jedes ausgewählte Atom erreicht mindestens einen konfigurierten Motivationsanker über effektive requires. | GV GVR-005 und GVR-011 |
| G34 | M | D | MIT-OCW-Module | Jedes Modulatom besitzt die vorgeschriebenen concept-, practice- und assessment-Quellenlinks. | GV GVR-007 |
| G35 | M | D | Alle geladenen Landschaften | Goal-Hilfslinks verwenden das kanonische resourceLinks-Feld; konkurrierende Goal-Linkfelder sind unzulässig. | GV GVR-008 |
| G36 | M | D | Kanonische Mathematik Sek I/II | Jeder verfasste Orientierungspfad verwendet bereichs- und stufengültige curricularArea-Wurzeln sowie atomare curricularAtomic-Einstiege und Meilensteine. | GV GVR-015 |
| G37 | M | D | Kanonische Mathematik Sek I/II | Jeder Orientierungseinstieg erfordert seinen Orientierungsanker direkt. | GV GVR-015 |
| G38 | M | D | Kanonische Mathematik Sek I/II | contains belegt die Orientierungspfad-Mitgliedschaft; eine direkte stufengültige atomare requires-Route belegt die Folgeordnung. | GV GVR-015 |
| G39 | M | D | examData taskContent/solutionContent einschließlich EN | Bei mindestens zwei aufeinanderfolgenden durch Pipes begrenzten Zeilen ist Zeile2 eine gültige GFM-Trennzeile und jede Tabellenzeile hat dieselbe Spaltenzahl. | GV Exam Markdown table integrity |
| G40 | M | D | Curriculum-Manifest | Manifesttitel stimmen mit den referenzierten Landschaftstiteln überein; übersetzte Labels ersetzen keine Identität. | GV Core validator checks |
| G41 | M | D | Deklarierte Metadatenprofile | phase-, leitideen- und kompetenzen-Werte erfüllen das jeweilige deklarierte Vokabular beziehungsweise Tagformat. | GV Core validator checks |
| G42 | M | D | Atomar normalisierter Gesamtgraph | Die atomare Expansion effektiver Anforderungen ist azyklisch; ein auf Goal-Ebene azyklischer Graph genügt hierfür nicht. | G §6.4 |

## V: Sichten, Scope und Projektion (46)

| ID | Stand | Art | Scope | Präzises Prädikat | Normquelle |
|---|---|---|---|---|---|
| V01 | M | D | Basis | Kanonische Kompetenzidentität bleibt unabhängig von Jahr, Semester, Stage, Kurs oder Kalenderplan. | GS Ziel-/Programmlayer; AG §2.3 |
| V02 | M | D | Basis | Struktur-/Programmknoten werden nicht durch Titel-, ID-, Phasen- oder Zeichenfolgenheuristiken erfunden. | V Non-negotiable projection rules |
| V03 | M | D | Basis | Jede sichtbare Baumkante hat eine ausdrücklich zugelassene Autorenquelle (`contains`, Placement, Programmeltern, Achsenref oder Komposition). | V Non-negotiable projection rules |
| V04 | M | D | Basis | Eine Ansicht verwendet eine eindeutige primäre Strukturfamilie; geprüfte Komposition hat Vorrang vor Placement-Fallback. | V Non-negotiable projection rules |
| V05 | M | D | Basis | Jeder sichtbare Goal erscheint in einer aufgelösten Standardsicht höchstens einmal. | V Non-negotiable projection rules |
| V06 | M | D | Basis | Jeder sichtbare Goal hat dort höchstens einen sichtbaren primären Elternknoten. | V Non-negotiable projection rules |
| V07 | M | D | Placements | Sekundäre/assessed Placements sind Overlays, keine zusätzlichen Goal-Bauminstanzen. | V Non-negotiable projection rules |
| V08 | M | D | Komposition | Kompositionssichten enthalten Struktur und kanonische Referenzen, keine eingebetteten neu verfassten atomaren Goals. | V Scope-specific composition view contract |
| V09 | M | D | Komposition | Kompositionssichten verfassen keine eigene didaktische `requires`-Relation. | V Scope-specific composition view contract |
| V10 | M | D | Komposition | Jede referenzierte kanonische Teilbaumwurzel existiert; überlappende Referenzen erfordern ausdrücklich geprüfte Auflösung. | V Scope-specific composition view contract |
| V11 | M | D | Komposition | Rollen sind nur `target`/`prerequisiteOnly`; fehlende Rolle bedeutet `target`. | V Scope-specific composition view contract |
| V12 | M | D | Komposition | Rollenpräzedenz: direktes `goalEntry` vor Teilbaum; tiefster passender Teilbaum vor breiterem; nur bei gleicher Spezifität gewinnt `target`. | V Scope-specific composition view contract |
| V13 | M | D | Komposition | Projektionrolle wird niemals automatisch aus `requires`, Jahr, Stage oder Phase abgeleitet. | V Scope-specific composition view contract |
| V14 | M | D | Basis | Nur `target` gehört in normalen Baum, Frontier, Fortschritt und Abschlussnenner. | V Rollenvertrag; AG §2.3 |
| V15 | M | D | Basis | `prerequisiteOnly` behält kanonische ID und globale Mastery und ist für entsprechende Voraussetzungsprüfung verfügbar. | V Rollenvertrag; AG §2.3 |
| V16 | M | D | Basis | Projektion verändert weder kanonische IDs noch Mastery noch fachliche Kanten. | V Kompilierungsvertrag |
| V17 | M | D | Komposition | `curricularArea` darf kein direktes `goalEntry` vortäuschen. | G §11.2; GV CPV009 |
| V18 | M | D | Content-Sicht | Kanonische Content-Sicht folgt ausschließlich `contains`; Wurzeln sind explizit bzw. elternlos, Mehrfachelternauflösung deterministisch. | V Default content tree contract |
| V19 | M | D | Content-Sicht | Geschwisterreihenfolge folgt autorisiertem Strukturvertrag; Filterung verbirgt und hängt Knoten nicht still um. | V Default content tree contract |
| V20 | M | D | Programmsicht | Programmsicht folgt `parentUnitId`/expliziter Ordnung; synthetischer Strukturknoten steht genau für eine Programmeinheit. | V Default program tree contract |
| V21 | M | D | Programmsicht | Höchstens ein primäres Placement je sichtbarer Einordnung; Mehrdeutigkeit benötigt explizite geprüfte Auflösung, fehlendes primäres Placement keine erfundene Zuordnung. | V Default program tree contract |
| V22 | M | D | Achsensicht | Kompetenzachsen sind eigener Katalog/eigene Sicht und werden nicht als Content-Eltern umgedeutet. | V Default competency view contract |
| V23 | M | D | Basis | Applicability filtert Mitgliedschaft, nicht Elternbeziehung oder kanonische Identität. | V Interaction with applicability |
| V24 | M | D | Basis | Fehlende Applicability-Dimension bedeutet unbeschränkt, vorhandene leere Menge bedeutet keine Werte. | G §11.1 |
| V25 | M | D | Basis | Query-Sentinel `ALL` wird nicht als verfasster Applicability-Wert serialisiert. | V Interaction with applicability |
| V26 | M | D | Overrides | Applicability-Override bleibt deklarierte Ausnahme/Ergänzung; keine eigenständige Filterdimension oder Quellenabdeckungsbehauptung. | G §11.1.1; QM CQR003 |
| V27 | M | D | verwendete Supplementgrenzen | `applicabilityMappingInheritance=boundary` unterbricht breite Vorfahren-Quellenvererbung; direkte Evidenz und Kindvereinigung bleiben wirksam. | AG §2.3 |
| V28 | M | D | verwendetes Profil | `applicabilityFromRequires=true` ist auf zulässige Praxis-/Prüfungsendpunkte begrenzt und erzeugt nur Applicability-, keine Quellenbelege. | AG §2.3 |
| V29 | M | D | Basis | Vollständige globale atomare Hülle wird vor Scope-Einschränkung berechnet; außerhalb liegende Zwischenknoten kürzen Pfade nicht. | G §§11.2–11.4 |
| V30 | M | E | kompiliertes Profil | Kompilierte und gespeicherte Projektion dürfen nicht unbemerkt auseinanderlaufen; Drift ist gesondert ausweisbar, nicht still kanonisch. | GV APV203 |
| V31a | M | D | entsprechende CPV-Regeln | Erforderliche View- und Node-Metadaten entsprechen dem Kompositionsvertrag (CPV-001). | GV CPV001/007/216 |
| V31b | M | D | entsprechende CPV-Regeln | Ein in der kompilierten View verbleibender Strukturknoten ist nicht leer (CPV-007). | GV CPV001/007/216 |
| V31c | M | D | entsprechende CPV-Regeln | Learner-facing Kompositionslabels enthalten keine internen Authoring-Prozessnamen wie Source-Extraction (CPV-216). | GV CPV001/007/216 |
| V32a | M | D | Projektionsprofil | Sichtbare Anforderungen sind im zugelassenen Ziel-/Supportscope auflösbar (APV-102). | GV APV102/103 |
| V32b | M | D | Projektionsprofil | Jedes projizierte Ziel ist von den deklarierten Projektionswurzeln erreichbar (APV-103). | GV APV102/103 |
| V33 | M | D | Retained unsichtbare Kompatibilitätscluster | Nicht mehr learner-facing Kompatibilitätscluster deklarieren applicabilityProjection=excluded und gelangen nicht durch child-union zurück in die Sicht. | GV Accepted-warning handling |
| V34 | M | D | Mathematik Sek I Views | Jede einschlägige View enthält den überprüften Sek-I-Orientierungsanker. | GV CPV-210 |
| V35 | M | D | Mathematik Sek I Views | Die erforderlichen Jahrgangsprüfungsordner und ihre individuellen Prüfungsatome sind vollständig sichtbar. | GV CPV-211 und CPV-212 |
| V36 | M | D | Mathematik Sek I Prüfungsordner | Jedes enthaltene Prüfungsziel ist atomar, besitzt examData, hat keine Clusteranforderung und kommt genau einmal vor; alte Aggregatendpunkte gehören nicht in diese Ordner. | GV CPV-212 |
| V37 | M | D | Mathematik Sek I Views | Die alte aggregierte Übungen-Sekundarstufe-I-Branch wird nicht zusätzlich veröffentlicht. | GV CPV-213 |
| V38 | M | D | Mathematik Sek II/CrossStage Views | Die View enthält den überprüften Sek-II-Orientierungsanker. | GV CPV-214 |
| V39 | M | D | Mathematik Sek II/CrossStage Views | Die View enthält wenigstens einen atomaren Autonomie-/Assessmentendpunkt der überprüften Sek-II-Terminalcluster. | GV CPV-215 |
| V40 | M | E | HE-Mathematik G8/G9-Projektion | Jeder aktuelle überprüfte Dauer-/Jahrgangs-Quellenbeleg wird durch verfasste Jahresstruktur oder duration-spezifisches Placement repräsentiert. | GV Notes on scope; CR §8 |
| V41 | M | E | Angebotene Gymnasium-Dauermodelle | Ein angebotenes Dauer-/Kursmodell besitzt eine explizite überprüfte Scope-/Duration-Policy; fehlende Dauersemantik wird nicht aus duplizierten kanonischen Zielen geraten. | CR §§7.1,8 |
| V42 | M | D | Kanonische Migration | Der deklarierte Migrationszustand erfüllt seine Übergangsbedingungen; nur cutover_ready erlaubt den betreffenden Lernendeneinstieg umzuschalten. | CR Migration State Model |
| V43 | M | D | Kanonische Migration | Legacy-Lernstand wird im Übergang nicht ohne autorisierte bedeutungserhaltende ID-/Mastery-Migration auf neue Ziele übertragen. | CR Learner-State Migration Policy |

## R: Mastery, Fortschritt und Frontier (27)

| ID | Stand | Art | Scope | Präzises Prädikat | Normquelle |
|---|---|---|---|---|---|
| R01 | M | D | Anerkennungskonzept; Implementierungsstand separat | Der einzige gespeicherte atomare Zielergebniswert ist binär; abgeleitete Anerkennung ist kein zusätzlich gespeichertes Ergebnis. | A@M §1; G §9; AG §4 |
| R02 | M | D | Basis | Clusterzufriedenheit ist ausschließlich abgeleitet; Clusterabschluss schreibt keine Kinder-Mastery. | G §9; AG §2.2 |
| R03 | M | D | Anerkennungskonzept; Implementierungsstand separat | Atomare/Cluster-Zufriedenheit verwendet die effektive Mastery, bei Clustern eindeutige atomare Nachfahren. | G@M §9; A@M §4 |
| R04 | M | D | Basis | Ein leerer oder ungültiger Ziel-/Supportscope ist nicht automatisch vollständig bestanden. | G §9; A@M §§2–3 |
| R05 | M | D | Basis | Gewichteter Fortschritt zählt jedes atomare Ziel genau einmal, auch bei mehreren Eltern. | AG §3 `weight`; G §9 |
| R06 | M | D | HE Math GO | Im Hessischen Mathematik-GO-Profil haben Atome Gewicht 1 und Cluster Gewicht der eindeutigen atomaren Nachfahren. | AG §3 `weight` |
| R07 | M | D | Basis | Normale Frontier enthält nur unbeherrschte zulässige atomare Ziele, deren relevante Voraussetzungen erfüllt sind. | G §9.1 |
| R08 | M | D | Basis | Normaler Fokus ist Vereinigung gewählter Wurzeln und Nachfahren, geschnitten mit Personal-Curriculum-Zielen. | G §11.2; AG §2.3 |
| R09 | M | D | Basis | Normalmodus prüft nur effektive Anforderungen im Fokus; externe Anforderungen blockieren nicht und werden dadurch nicht gemeistert. | G §11.3 |
| R10 | M | D | Normalmodus | Scope-relative Clusteranforderung verwendet nur zugehörige relevante Atome; leerer externer Support erzeugt weder Blockade noch Mastery. | G §11.3 |
| R11 | M | D | Strict | Strict-Modus prüft vollständige globale Anforderungen einschließlich Support; Strict-Frontier ist Teilmenge optimistischer Frontier. | G §11.4 |
| R12 | M | D | Bedingt | Relaxed-Prerequisite-Scope ist eigenes ausdrücklich gewähltes Profil; seine Semantik darf nicht still den Strict-Modus ersetzen. | G §11.6 |
| R13 | M | D | Diagnostik | Diagnostik fehlender Ziele/fehlender Atome verwendet dieselbe Normalisierung/Hülle, dedupliziert und schreibt keine Kanten. | G §11.5 |
| R14 | M | D | Personal Curriculum | Level-2-Konfiguration enthält explizite Stage; Kursprofil LK impliziert keine Stage, fehlende Stage bleibt unaufgelöst. | PS Level 2: Personal Curriculum; AG §2.3 |
| R15 | M | D | Personal Curriculum | Level-2-Änderung revalidiert Fokus/aktives Goal, erhält stabile IDs und globale Mastery. | PS Level 2: Personal Curriculum; AG §2.3 |
| R16 | M | D | Coachprofil | Level-2-Bearbeitung nutzt autorisierten First-party-Ablauf und gemeinsame Backendvalidierung; OpenAI-Coach editiert diese Konfiguration nicht. | PS Level 2: Personal Curriculum; AG §2.3 |
| R17 | M | D | Basis | Aktives Lernziel ist genau ein Atom; Fokus und aktive atomare Wahl sind getrennte Zustände. | PS Level 3: Learning Focus and Active Goal; AG §2.3 |
| R18 | M | D | Basis | Fokusweitung erst nach tatsächlichem aktuellem Fokusabschluss, nicht allein bei leerer Frontier. | PS Level 3: Learning Focus and Active Goal; AG §2.3 |
| R19a | M | D | Basis | Jede veröffentlichte Fokusweitungsoption ist eine strikte Obermenge des bisherigen Fokus und fügt wenigstens ein unbeherrschtes Ziel hinzu. | PS Level 3: Learning Focus and Active Goal; AG §2.3 |
| R19b | M | D | Basis | Geeignete Fokusweitungsvorfahren werden vom nächstgelegenen nach außen angeboten. | PS Level 3: Learning Focus and Active Goal; AG §2.3 |
| R20 | M | D | Mehrwurzelfokus | Mehrwurzel-Weitung ersetzt nur betroffenen Zweig; vollständige geordnete Optionspayload erhält unabhängige Wurzeln. | PS Level 3: Learning Focus and Active Goal; AG §2.3 |
| R21a | M | D | Coach | Der Coach übernimmt die veröffentlichte frische Fokusweitungsoption mit ihrer vollständigen geordneten Payload unverändert. | PS Level 3: Learning Focus and Active Goal; AG §2.3 |
| R21b | M | D | Coach | Eine vorgeschlagene Fokusweitung wird erst nach Zustimmung der lernenden Person gespeichert. | PS Level 3: Learning Focus and Active Goal; AG §2.3 |
| R22 | M | D | Anerkennungskonzept; Implementierungsstand separat | Ein global wirksam anerkannter gewöhnlicher Goal darf durch Fokuswechsel/-weitung nicht als Pflichtarbeit wieder geöffnet werden. | A@M §§1,4; AG §2.3 |
| R23 | M | D | Curriculumkatalog | Curriculum-Manifest enthält nur tatsächlich auswählbare Wurzeln, keine enthaltenen Module; referenzierte IDs existieren und Rootmenge entspricht berechneter Auswahl. | PS Curriculum Manifest (Root Curricula); GV Core validator checks |
| R24 | M | D | BY Math Übergangsprofil | Bayern-Math GK umfasst gesamten Pflichtkurs, LK zusätzlich alle fünf Vertiefungsmodule; Fokus auf drei verkleinert Level-2-Zielnenner nicht. | AG §2.3 |
| R25 | M | D | Chemistry Übergangsprofil | Chemie-Themen sind im beschlossenen Übergangsprofil vollständig Zielscope; optionale offizielle Themen werden dadurch weder universal verpflichtend noch als persönlich gewählt behauptet. | AG §2.3 |

## U: Anerkennung und rekursive Lerneinheiten (44)

| ID | Stand | Art | Scope | Präzises Prädikat | Normquelle |
|---|---|---|---|---|---|
| U01 | T | D | Anerkennungskonzept; Implementierungsstand separat | Atomare Mengen gewöhnlicher Goals O, Prüfungen Q und Abrufziele K sind disjunkt; Struktur-/Orientierungsziele werden nicht still gewöhnliche Kompetenz. | A@T §1; G@T §12.2 |
| U02 | T | D | Anerkennungskonzept; Implementierungsstand separat | Implizite Anerkennung ist exakt Vereinigung qualifizierter Coverage explizit bestandener Q minus M; effektive Mastery ist M vereinigt mit dieser Menge. | G@T §12.2; A@T §1 |
| U03 | T | D | Anerkennungskonzept; Implementierungsstand separat | Nur explizit bestandene Q speisen Coverage; kein rekursiver Beweis aus implizit anerkannten Goals und kein Fixed-point-Erweitern. | A@T §1 |
| U04 | T | D | Anerkennungskonzept; Implementierungsstand separat | Coverage enthält ausschließlich gewöhnliche atomare Goals, keine Q, K, Cluster oder Orientierung. | A@T §4; G@T §12.2 |
| U05 | T | D | Anerkennungskonzept; Implementierungsstand separat | `examData.coveredGoalIds` ist einzige verfasste Quelle der Coverage; `requires` allein ist niemals Beweis. | A@T §4 |
| U06 | T | D | Anerkennungskonzept; Implementierungsstand separat | Ungeprüfte, unbekannte oder nicht qualifizierte Coverage ist leer; `released` allein qualifiziert keinen Beweis. | A@T §4 |
| U07 | T | D | Anerkennungskonzept; Implementierungsstand separat | Qualifizierte Coverage ist feste Liste atomarer IDs; kein später wachsender Cluster-/Nachfahren-Platzhalter. | A@T §4 |
| U08 | T | D | Anerkennungskonzept; Implementierungsstand separat | Jede gedeckte Kompetenz liegt in der vollständigen atomaren Voraussetzungserreichbarkeit des Q. Fehlender Pfad ist Graphfehler, kein automatisch generierter Beweis-/Sequenzgraph. | G@T §12.2; A@T §3 |
| U09 | M | E | Anerkennungskonzept; Implementierungsstand separat | Gleiches Q-ID bedeutet unveränderliche Beweisbedeutung für alle historisch zugelassenen bestandenen Varianten. | A@M §4; A@T §4 |
| U10 | T | D | Anerkennungskonzept; Implementierungsstand separat | Stärkere oder historisch nicht belegbare Beweisbedeutung benötigt neue Q-ID; neuer Fingerprint verstärkt alte Resultate nicht. | A@T §4 |
| U11 | M | E | Migration | Historische Prüfungsversionen und ihre damalige Beweisbedeutung bleiben nachvollziehbar; alte lokale Anzeige ist kein neuer Coverage-Beleg. | A@M §4; A@T §§4,8 |
| U12 | T | H | Anerkennungskonzept; Implementierungsstand separat; fachliche Bewertung nicht rein maschinell | Jede gewöhnliche gedeckte Kompetenz muss in jeder zulässigen Bestehensroute vollständig durch Aufgabe plus normale Rubrik nachgewiesen werden. | A@T §5 |
| U13 | M | D | Anerkennungskonzept; Implementierungsstand separat | Bestehen hat einen gewöhnlichen gemeinsamen Bewertungsvertrag; keine versteckte Coach-Minimalregel und kein zweites gespeichertes Qualifikationsergebnis. | A@M §§1,5; A@T §5 |
| U14 | T | D | gewählter Default | Praktische und schriftliche Facetten dürfen durch eine mehrteilige reguläre Q mit einem binären Resultat nachgewiesen werden; getrennte unvollständige Teil-Q werden nicht automatisch zum Vollnachweis kombiniert. | A@T §5 |
| U15 | M | D | Migration | Ein bereits gemeistertes gewöhnliches Goal darf nicht unter gleicher ID zur Prüfung umtypisiert werden und dadurch Prüfungsresultat erzeugen. | A@M §5; A@T §5 |
| U16 | M | D | LearningUnit | Direkte Erwerbsownership ist je aufgelöster Hierarchie/Revision eindeutig; Vorfahren aggregieren, teilen aber nicht die direkte Ownership. | A@M §2; G@M §12.1 |
| U17a | M | D | LearningUnit | Die aufgelöste Unit-Kindrelation ist endlich und azyklisch. | A@M §2; G@M §12.1 |
| U17b | M | D | LearningUnit | Der aufgelöste verpflichtende Zielumfang jeder gültigen Lerneinheit ist nicht leer. | A@M §2; G@M §12.1 |
| U18 | M | D | LearningUnit | Ownership/Kindrollen werden aus autorisierten Placements oder geprüfter Komposition für einen aufgelösten Scope bestimmt. | U §§1–2; G@M §12.1 |
| U19 | M | D | LearningUnit | Versteckte Voraussetzungen werden fachlich berücksichtigt, vergrößern aber nicht still den sichtbaren Erwerbs-/Abschlussnenner. | A@M §2; G@M §12.1 |
| U20 | T | D | freigegebene Erwerbsunit | Für jede erlaubte Required-own-Q-Alternative deckt deren qualifizierte Coverage sämtliche eigenen gewöhnlichen Ziele. | G@T §12.2; A@T §2 |
| U21 | T | D | freigegebene Erwerbsunit | Erforderliche eigene Q liegen wirklich unter den eigenen Q; unbenutzte Alternativprüfungen werden nicht pauschal Pflicht. | G@T §12.2 |
| U22 | T | D | Anerkennungskonzept; Implementierungsstand separat | Parent-/fremde qualifizierte Q dürfen gewöhnliche Kompetenz global sofort belegen, auch bei noch offenen lokalen Q/K. | A@T §§1–2 |
| U23 | M | D | LearningUnit | Fremder/Eltern-Beweis ersetzt keine verpflichtenden eigenen/Kind-Q oder K; diese erfordern explizite Resultate. | A@M §§2,6; G@M §12.3 |
| U24 | M | D | LearningUnit | Unitabschluss genau aus wirksamen eigenen Ergebnissen und sämtlichen erforderlichen Kindabschlüssen; kein separat gespeichertes Unit-Ergebnis. | A@M §6; G@M §12.3 |
| U25 | M | D | LearningUnit | Aggregation zählt gemeinsame atomare Ziele einmal; eine pauschale Nachfahrenvereinigung liefert keinen Prüfungsbeweis. | A@M §§2,4,8; G@M §§12.1–12.3 |
| U26 | M | D | LearningUnit | Eine atomare fremde Voraussetzung fordert nicht automatisch Abschluss der gesamten fremden Unit. | UP; AG §2.4 |
| U27 | M | D | Bedingt Whole-unit-Claim | Behauptete ungeteilte Whole-unit-Reihenfolge benötigt zusätzlich azyklischen projizierten Blockgraphen an allen relevanten Grenzen. | G@M §12.4; UP |
| U28 | M | D | Whole-unit-Claim | Blockprüfung enthält geerbte, indirekte, Cluster-, versteckte und fachübergreifende Anforderungen. | G@M §12.4; AG §2.4 |
| U29 | M | D | Anerkennungskonzept; Implementierungsstand separat | Aktueller Unitvertrag führt keine neue Zugriffssperre ein: direkte Prüfungsversuche bleiben bei gültigem Zugriff/Session/Aufgabe verfügbar. | A@M §7; A@T §7; UP |
| U30 | M | D | Assessmentdiscovery | Prüfungsentdeckung ist vollständig paginierbar und ohne Fortschrittsmutation. | A@M §7; A@T §7 |
| U31 | M | D | Basis | Freiwillige Wiederholung bleibt verfügbar und widerruft nicht bloß durch Start vorhandene Kompetenz. | A@M §7; A@T §7 |
| U32 | M | D | Integrität | Widerruf, Korrektur oder entfernte explizite Q berechnet globale effektive Anerkennung neu; alternative weiterhin gültige Beweise bleiben wirksam. | A@M §§1,4; LS §5.2 |
| U33 | M | D | Anerkennungskonzept; Implementierungsstand separat | Änderung von Q/Coverage/Graph/Scope muss abhängige Ableitungen und Cachegültigkeit korrekt binden; kein gemischter alter Beweis/neuer Graph. | A@M §4; LS §7.4 |
| U34 | T | D | Einführung 6.11. | Migration behauptet ohne qualifizierten Nachweis keine rückwirkenden Fortschrittsgewinne und ändert nicht pauschal andere Fächer. | A@T §8 |
| U35 | M-alt | D | Gültige dauerhaft anwendbare direkte Unitverträge | Mit P_U=Own(U) geschnitten mit Q vereinigt K und N_U=Reach*(P_U ohne M) gilt I_U=Own(U) ohne (M vereinigt P_U vereinigt N_U); nur explizites M geht in diese Ableitung ein. PR83 ersetzt diese Formel durch U02. | A@M §4; G@M §12.2 |
| U36 | M-alt | D | Direkt besessene gewöhnliche Unitziele | Jedes eigene gewöhnliche Ziel besitzt einen eigenen lokalen Prüfungsverbraucher in der vollständigen normalisierten Relation; ein Memoryendpunkt allein genügt nicht. PR83 stärkt dies zu U20. | A@M §2 |
| U37 | M-alt | H | Qualifikation der main-Anerkennungsverträge | Für jedes verschiedene freigebende protected-consumer-Set und jede erlaubte Aufgabenvariante belegen tatsächliche Aufgaben und normale Bestehensrubrik zusammen jede wesentliche anerkannte Kompetenz ohne kompensierbares vollständiges Fehlen. PR83 verlangt U12 je qualifiziertem Q. | A@M §5; BK Application-based recognition |
| U38 | M-alt | D | main-Anerkennung | M_eff ist M vereinigt mit allen I_U dauerhaft anwendbarer unveränderlicher Verträge; Fokusbesuche oder T(U) als Ersatz für Own(U) erzeugen keinen neuen Vertrag. PR83 ersetzt die Ableitung durch U02. | A@M §4 |
| U39 | M | D | Pflicht-Memory-Ownership | Erforderlicher Recall gehört zur tatsächlichen Ersterwerbseinheit; ein Parent-Supportverweis erfüllt keine fehlende Kinderpflicht. | A@M §2; U §§2–3 |
| U40 | T | H | Qualifikation eines PR83-Q | Ein realistischer Bestehensfall mit gesichertem Verständnis und beiläufigem Rechenfehler bleibt zulässig; vollständiges Fehlen einer wesentlichen beanspruchten Kompetenz muss scheitern. | A@T §5 |
| U41 | T | D | Aktivierung geänderter normaler Prüfungsregeln | Zusätzliche veröffentlichte Kernkriterien werden im gemeinsamen normalen Bewertungsvertrag und allen betroffenen Adaptern umgesetzt; keine versteckte Coach-Sonderqualifikation. | A@T §5 |
| U42 | T | H | PR83-Coverage-Qualifikation | Vollständige Zielbedeutung, Aufgaben, Hilfen, alle zulässigen Varianten und normale Rubrik tragen die feste Coverage; Ziele werden nicht zur Anpassung an bestehende Aufgaben verkürzt. | A@T §4 |
| U43 | T | D | PR83-Coverage | Qualifizierte Prüfungscoverage wird nicht als amtlicher Quellenbeleg oder Applicability-Evidenz gewertet. | A@T §4 |

## N: Goal-Typen, Karten und Prüfungen (39)

| ID | Stand | Art | Scope | Präzises Prädikat | Normquelle |
|---|---|---|---|---|---|
| N01 | M | D | Basis | Semantische Art und struktureller Atom-/Clustertyp sind getrennte Dimensionen. | N Summary |
| N02 | M | D | Orientierung | Orientierung ist reines Blatt ohne prerequisites, examData, memoryData oder Übungen; autorisierte Kind-Zuordnung hat Vorrang vor Heuristik. | N Orientation |
| N03 | M | D | Orientierung | Orientierung erhält keine normale bewertete Aufgaben-/Prüfungsoberfläche. | N Orientation |
| N04 | M | D | Orientierung | Orientierungsabschluss braucht Auswahl, passende Folgeinteraktion, Abschlussangebot und gesonderte Zustimmung; bloßes Label genügt nicht. | N Orientation |
| N05 | M | D | Orientierung | Nullfortschritts-Einstieg wählt nur offene passende Orientierungen; bestehender Lernstand wird nicht zurückgesetzt. | N Orientation |
| N06 | M | D | SRS | Training und Verifikation sind getrennte Abläufe; Training setzt keine Verifikations-Mastery. | N Flashcard practice and learning-coach/GPT-led hard recall |
| N07 | K6 | D | SRS | Verified Recall darf für berechtigte noch nicht verifizierte Karten begonnen werden, ohne zuvor die fällige Übungswarteschlange zu leeren. | N Key principles Nr.5; N Due and mastery semantics |
| N08 | M | D | implementiertes SM2-Profil | SM2-Erfolg q≥3 erhöht Wiederholungen und verwendet Intervalle 1, 6, anschließend gerundet altes Intervall × EF. | N Scheduling logic (SM-2) |
| N09a | M | D | SM2-Profil | Der aktualisierte SM-2-Leichtigkeitsfaktor folgt der definierten Formel und unterschreitet 1.3 nicht. | N Scheduling logic (SM-2) |
| N09b | M | D | SM2-Profil | Bei quality kleiner 3 werden repetition=0 und interval=1 gesetzt; ef bleibt nach dem beschriebenen SM-2-Profil unverändert. | N Scheduling logic (SM-2) |
| N10 | M | D | SRS | Fälligkeit wird aus Zeitstempel bzw. fehlendem Zustand ermittelt, nicht aus einem erfundenen Learner-Outcome. | N Due and mastery semantics |
| N11 | K6 | D | Bestehender Memory-Workflow; keine neue Prüfungsart | Memory-Mastery besteht genau bei erfolgreichem Verified Recall aller erforderlichen Karten eines gültigen vollständig aufgelösten Decks; SRS-Fälligkeit und gewöhnliche Übung entziehen weder Verifikation noch Mastery. | N Due and mastery semantics; AG §4; Owner-Klärung 6.11.2026 |
| N12 | K6 | D | Verified Recall | Nur noch nicht erfolgreich verifizierte Karten sind für Verified Recall zulässig; ein fehlgeschlagener Versuch lässt diese Karte offen, bereits bestandene Karten werden nicht erneut geprüft. | N Runtime behavior und Queue order; Owner-Klärung 6.11.2026 |
| N13 | M | D | SRS | Kartenselbstbewertung 1/4 ändert Planung, nicht unmittelbar globale Goal-Mastery. | N Flashcard practice and learning-coach/GPT-led hard recall |
| N14a | M | D | Training | Due-Karten werden für die Übung sitzungsbezogen gemischt. | N Queue order |
| N14b | M | D | Training | Eine gewöhnliche Übungscharge enthält höchstens 20 Karten. | N Queue order |
| N15 | M | D | Verifikation | Verifikationscharge, Anzahl, Reihenfolge und Capability werden serverseitig festgelegt; Modell kürzt/zerlegt sie nicht. | AG §7.2 Verified Recall batch contract |
| N16 | M | D | Verifikation | Verifikationsresultate entsprechen exakt geordneter vollständiger Charge; atomare Speicherung statt Teilkartenfortschritt. | AG §7.2 Verified Recall batch contract |
| N17a | M | D | Verifikation | Verified-Recall-Schreiben prüft die autorisierte Session und den passenden aktuellen Zustand. | AG §7.2 Verified Recall batch contract |
| N17b | M | D | Verifikation | Die serverseitig gebundene Idempotenz verhindert doppelte Wirkung desselben Verified-Recall-Schreibens. | AG §7.2 Verified Recall batch contract |
| N17c | M | D | Verifikation | Feedback allein gilt nicht als gespeichertes Verified-Recall-Ergebnis; erst ein erfolgreicher atomarer Schreibvorgang begründet das Ergebnis. | AG §7.2 Verified Recall batch contract |
| N18 | M | D | Verifikation | Beim vereinbarten Verifikationsablauf ist Zustimmung zur atomaren Speicherung nach Feedback erforderlich; Folgeablauf bleibt servergeführt. | AG §7.2 Verified Recall batch contract |
| N19 | M | D | Exam | Prüfungsgoal enthält Task, Lösung, Scoring, maxPoints/passThreshold und vollständig identifizierte Bewertungsschritte mit Punkten/Beschreibung. | N Schema extension (examData); QM CQR-201 |
| N20 | M | D | mehrsprachige Exam | Lokalisierungsfallback erhält zusammenpassendes Aufgaben-/Lösungs-/Rubrikpaar; keine Mischung verschiedener Prüfungsvarianten. | N Localization |
| N21 | M | D | Exam | Prüfungsversuch ist unabhängig von vorbereitender Frontier verfügbar; Remediation nutzt dennoch vollständigen normalisierten Bedarf. | N Requires semantics; A@M §7 |
| N22a | M | D | normales Exam-Grading | Die Prüfungs-Gesamtpunktzahl ist min(Summe der gültigen Schritt-Punkte, maxPoints). | N Scoring and mastery |
| N22b | M | D | normales Exam-Grading | Der normale Prüfungsabschluss ist bestanden genau ab passThreshold. | N Scoring and mastery |
| N23 | M | D | Exam | Eine bestandene Prüfung schreibt ihren binären Prüfungsabschluss; sie erzeugt keinen zweiten gespeicherten Qualifikationsstatus. | N Scoring and mastery |
| N24 | M | D | Exam | Fehlgeschlagene Prüfung schreibt nach aktuellem Vertrag keine Mastery und keinen persistierten Fehlversuch-/Punktestand; Wiederholung bleibt möglich. | N Scoring and mastery |
| N25 | M | D | Exam | Fehlgeschlagenes Backendschreiben darf nicht als erfolgreich gespeicherte Mastery gemeldet werden. | N Scoring and mastery |
| N26a | M | H | Exam-Coach, semantischer Teil nicht vollständig deterministisch | Der Coach präsentiert die Prüfungsaufgabe unverändert und ohne lösungsgebende Hilfen. | N Exam Mode (AI exam supervisor) |
| N26b | M | D | Exam-Coach, semantischer Teil nicht vollständig deterministisch | Der Coach beginnt die Prüfungsauswertung erst nach vollständiger Abgabe. | N Exam Mode (AI exam supervisor) |
| N27 | M | D | Coach | Nach Ergebnis kein neues Lernziel ohne den vorgesehenen Zustimmungs-/Handoffablauf. | N Exam Mode (AI exam supervisor) |
| N28 | K6 | D | Verified Recall | Ein erfolgreicher Kartennachweis bleibt über weitere Chargen erhalten; Abschluss verlangt keinen erneuten gesamten Deckdurchlauf in einem einzigen Versuch. | N Runtime behavior; AG §7.2 |
| N29 | M | D | OpenAI-Kartenpraxis | Die normale Praxisbewertung known/not_known ändert ausschließlich die zugehörige Kartenplanung und weder Mastery noch aktives Ziel. | AG §7.2 |
| N30 | M | D | OpenAI-Kartenpraxis | Front-/Rückseiten und Due-Batch bleiben in privater Komponentenmetadatenprojektion; model-visible Ergebnisse enthalten nur begrenzten Status/Fortschritt. | AG §7.2 |
| N31 | M | D | Kartenkomponente | Umdrehen sowie Vor-/Zurücknavigation innerhalb der gelieferten Charge bleiben lokal und erzeugen keine Tools oder Zustandsschreibvorgänge. | AG §7.2 |
| N32 | M | D | Verified Recall | Die vollständigen erwarteten Antworten werden erst nach vollständiger Lernendenabgabe freigegeben. | AG §7.2 |
| N33 | M | D | Verified Recall | Bewertungsprosa verbleibt im Providerdialog; der persistierte atomare Batch enthält genau die serverseitig vorgegebenen geordneten passed-Ergebnisse. | AG §7.2 |

## P: Lernplan, Periodenstatus und optionale Zeitplanung (80)

| ID | Stand | Art | Scope | Präzises Prädikat | Normquelle |
|---|---|---|---|---|---|
| P01 | M | D | Persönlicher Lernplanstatus | Das Backend berechnet und formuliert den gemeinsamen Status; Clients übernehmen ihn ohne eigene fachliche Nachrechnung. | LS §§1,7.1 |
| P02 | M | D | Planmenge G | G ist die bei Planerstellung festgehaltene Menge fortschrittswirksamer Ziele ohne damalige explizite Mastery; spätere Abschlüsse oder aktuelle Anerkennung entfernen keine IDs aus G. | LS §3.1 |
| P03 | M | D | Fachpläne | Mehrere aktive Pläne eines Fachs werden vor Berechnung nach stabiler Goal-ID vereinigt; pro ID gilt genau der früheste gültige Solltermin. | LS §3.2 |
| P04 | M | D | Fachpläne | Fachsalden bleiben getrennt; Fortschritt eines Fachplans gleicht keinen anderen aus. | LS §§2.3,3.2 |
| P05 | M | D | Planmenge | Wiederholung, Prüfungsblock oder übergeordneter Cluster erzeugt für dieselbe atomare Ziel-ID keinen zweiten Sollbeitrag. | LS §3.2 |
| P06 | M | D | Statusabfrage | Eine Statusabfrage ist read-only hinsichtlich Plan, Mastery, Fokus und aktivem Goal. | LS §§3.3,7.1 |
| P07 | M | D | Aktive Bestandspläne | Überschrittenes Planende entfernt offene Ziele eines weiterhin aktiven Plans nicht aus der Bilanz. | LS §3.3 |
| P08 | M | D | Unklare Bestandsbasis | Unzuverlässige Planbasis wird als eingeschränkt/nicht auswertbar markiert und nicht aus heutiger Mastery rekonstruiert. | LS §§3.3,10 |
| P09 | M | D | Gesamt-IST | Standardmäßig I=Anzahl G geschnitten M_eff; die gespeicherte Option nur-explizit verwendet allein für Plan-I die Menge M. | LS §3.4; A@M §8 |
| P10 | M | D | Explizit-Zählpräferenz | Die standardmäßig ausgeschaltete Präferenz gilt pro SkillPilot-ID in allen Kanälen gleich und ändert keine Mastery, Voraussetzungen oder Prüfungszugänge. | LS §3.4 |
| P11 | M | D | Periodenereignisse | H zählt jede ID aus G höchstens einmal mit verlässlich datiertem explizitem Abschluss innerhalb der Periode und weiterhin wirksamem Abschluss. | LS §5.2; A@M §8 |
| P12 | M | D | Periodenereignisse | Importzeit, Anzeige, Plan-/Profilwechsel, erneute Zustandsübermittlung und implizite Anerkennung erzeugen kein Abschlussereignis oder erfundenes Datum. | LS §§3.4,5.2 |
| P13 | M | D | Periodenereignisse | Bekannte Mastery ohne verlässliches Datum darf zu I, nicht zu H zählen; ein technischer Ladefehler wird nicht H=0. | LS §5.2 |
| P14 | M | D | Outcome-Korrektur | Eine explizite Rücknahme entfernt deren I-/H-Beitrag; unabhängig gültige Anerkennung kann I erhalten. Dies ist keine fälligkeitsgesteuerte Memory-Rücknahme. | LS §5.2 |
| P15 | M | D | Periodenkonfiguration | Gespeicherte Basis ist Tag oder Woche; ohne Wahl gilt Woche, eine vorhandene ausdrückliche Tageswahl bleibt erhalten. | LS §4 |
| P16 | M | D | Zeitgrenzen | Tag und Montag-bis-Sonntag-Woche werden an lokalen Kalendergrenzen in Europe/Berlin bestimmt, einschließlich Zeitumstellung. | LS §4 |
| P17 | M | D | Wochenmodus | S reicht bis Ende der laufenden Woche; vergangene Tage derselben Woche erzeugen keinen zusätzlichen Rückstand. | LS §§4,5.1 |
| P18 | M | D | Statusgrößen | S,P,I,H sind ganze Zahlen über derselben G-Menge mit 0≤P≤S≤Anzahl G und 0≤H≤I≤Anzahl G; ungültige Eingaben werden nicht still gekappt. | LS §5.1 |
| P19 | M | D | Statusrechnung | D=max(0,S−I); offenes Periodenpensum=min(D,max(0,P−H)); Rückstand=D−offenes Pensum; Vorsprung=max(0,I−S); erfülltes Pensum=P−offenes Pensum. | LS §5.3 |
| P20 | M | D | Statusrechnung | P wird nicht wegen bereits beherrschter Ziele gekappt; durch Vorarbeit erfülltes Pensum bleibt erreicht und wird nicht kein Pensum. | LS §5.3 |
| P21 | M | D | Statusrichtung | behind gilt genau bei Rückstand>0, ahead bei Vorsprung>0, ansonsten on_track; der Rohsaldo allein bestimmt die Richtung nicht. | LS §5.4 |
| P22 | M | D | Statusausgabe | Alle aktiven Fächer erscheinen in stabiler Reihenfolge mit backendseitigen festen DE/EN-Texten; Sprachwechsel ändert keine Zahlen. | LS §§6.1–6.4 |
| P23 | M | D | Status und aktives Goal | status.text enthält keine Goal-Ankündigung; der exakte lokalisierte aktive Titel kommt separat und beginnt auf reine Statusfrage keine Aufgabe. | LS §6.5 |
| P24 | M | D | Periodenanzeige | Bei P>0 ist needlePosition=completed/P; bei P=0 sind completed=target=0 und needlePosition=null; bei unzuverlässigem Fachstatus ist periodGauge=null. | LS §7.2 |
| P25 | M | D | Bilanzanzeige | net=Vorsprung−Rückstand; typische Menge ist aufgerundeter Median der positiven vollständigen deduplizierten Periodenpensen; scaleLimit=2×typische Menge. | LS §7.2 |
| P26 | M | D | Bilanzanzeige | Positive Nadel=min(1,net/scaleLimit), negative Nadel=max(−1,net/(scaleLimit+1)); severeBehind genau bei net<−2M, strongAhead genau bei net≥2M. | LS §7.2 |
| P27 | M | D | Bilanzanzeige | Ohne positives Pensum ist balanceGauge=null; ein weiterhin gültiger Fachstatustext und die erste Anzeige bleiben davon unabhängig. | LS §7.2 |
| P28 | M | D | Chatprojektion | Tatsächlich übertragene strukturierte und Textprojektionen enthalten keine redundanten Plan-Zählfelder oder Cockpit-Gauges; Guidance liefert keine eigene Bilanzrechnung. | LS §7.3 |
| P29 | M | D | Statusaktualität | Eine Auswertung verwendet denselben kohärenten Plan-/Mastery-/Ereignis-/Konfigurations-/Curriculumstand und passende Periodengrenzen; neue Periodenwerte mischen keinen alten Rückstand hinein. | LS §7.4 |
| P30 | M | D | Coach-Status | Der abschließend gültige Backendstatus wird höchstens einmal pro Antwort wörtlich ausgegeben; unveränderter Status wird nicht vor jeder Aufgabe wiederholt. | LS §8.1 |
| P31 | M | D | Plandetails | Fehlende Termine/Puffer bleiben fehlend statt Nullwerte; ein vorhandener Puffer mit null Resttagen bleibt sichtbar. | LS §8.3 |
| P32 | M | D | Planbezogene Auswahl | Im Wochenmodus sind zugängliche Ziele der ganzen laufenden Woche schon zu Wochenbeginn wählbar; ältere offene Plantermine werden vor aktuellen bevorzugt. | LS §9 |
| P33 | M | D | Planbezogene Auswahl | Eine laufende weiterhin zulässige Aufgabe wird durch Periodenwechsel nicht verdrängt; konkrete Voraussetzungen und Personal Curriculum bleiben maßgeblich. | LS §9 |
| P34 | M | D | Fortsetzung | Nur autorisierte Fortsetzung setzt temporären Planfokus; Statusfrage, Pause/Stopp, aktiver Prüfungsmodus oder ungeklärter Fachwechsel lösen keine automatische Planfortsetzung aus. | LS §9 |
| P35 | M | D | Fortsetzung | Erfülltes Periodenpensum sperrt weiteres Lernen nicht; neue zusätzliche Arbeit beginnt nur auf Wunsch beziehungsweise bestehende autorisierte Fortsetzung. | LS §9 |
| P36 | M | D | Teilauswertbarkeit | Ein ungültiger Teilplan verhindert eine scheinbar vollständige Fachbilanz; andere gültige Fächer bleiben sichtbar. Fehlend ist weder 0-von-0 noch erreicht/on_track. | LS §10 |
| P37 | M | D | Lokale Lehrkraftplanung | Die autoritative Kursprojektion begrenzt die Zielauswahl; ein öffentliches Buchziel ist nicht allein deshalb übernehmbar. | TP Erste Ausbaustufe und Sicherheitsgrenzen |
| P38 | M | D | Lokale Lehrkraftplanung | Buchauswahl ändert nur den Entwurf; Speichern verändert den lokalen Plan; bestätigte Übernahme verändert erst den persönlichen Plan. | TP Erste Ausbaustufe |
| P39 | M | D | Lokale Lehrkraftplanung | Curriculum-/Buchupdates schreiben weder Planziele noch Termine automatisch um; ungültig gewordene Zuordnungen erscheinen als Konflikt. | TP Sicherheitsgrenzen |
| P40 | M | D | Lokale Lehrkraftplanung | Alte manuelle Unterrichtsabdeckung bleibt erhalten, erzeugt keine Mastery und dient nicht als Ersatz-Fortschrittsquelle. | TP Sicherheitsgrenzen; TA Statuskorrektur |
| P41 | M | D | Buchabruf aus Planung | Öffentliche Buchabrufe enthalten keine Klassen- oder Lernendenkennung; lokale Klassenbezeichnungen/Mitgliedschaften bleiben lokal. | TP Sicherheitsgrenzen |
| P42 | M | D | Optionales Zeitplanprofil | Kalenderdaten liegen in separater Planung, nicht auf kanonischen Goals, Program Units, Placements oder Composition Views. | G §12.5; TA §2 |
| P43 | M | D | Optionales Referenzplanprofil | Jedes geplante Atom hat genau einen Ersterwerbszeitraum; die ausdrücklich angenommene Eintrittsbasis ist disjunkt von den Planzielen. | G §12.5; TEX graph-planning Plan Eintrittsbasis |
| P44 | M | D | Hypothetischer Plancheck | Nur deklarierte Eintrittskompetenzen beenden die rekonstruierte Vorgeschichte; alle anderen geerbten, Cluster-, versteckten und fachübergreifenden Anforderungen bleiben vollständig. | G §12.5 |
| P45 | M | D | Strukturelle Machbarkeitsbehauptung | Jede Periode besitzt einen global voraussetzungstreuen Erwerbszeugen aus Eintrittsbasis und früheren Perioden; keine direkten Prüfungssprünge oder vorweggenommene Anerkennung. | G §12.5 |
| P46 | M | D | Planungsdiagnose | Eine erforderliche Kompetenz außerhalb Eintrittsbasis und Planmenge ist Planungslücke; spätere Zuordnung ist Reihenfolgekonflikt; gleiche Periode ist bei vorhandenem Zeugen zulässig. | G §12.5 |
| P47 | M | D | Hypothetische Planung | Eintrittsannahmen und Plansimulation schreiben oder setzen keine Mastery und verändern keine Fokus-/Zugriffspolitik. | G §§12.5–12.6 |
| P48 | M | E | Optionale Workload-Behauptung | Die Behauptung bindet Referenzlernende, Eintrittsbasis, Auswahl, Aktivitäten, Curriculum-/Planrevision, Zeitkapazität, Schätzmethode und Unsicherheit. | G §12.6; TEX graph-planning Aufwand |
| P49 | M | D | Optionales Budgetprofil | Pro Periode gilt Work≥0, Reserve≥0, Budget>0 und Work+Reserve≤Budget in derselben kalibrierten Zeiteinheit. | G §12.6; TEX graph-planning Aufwand |
| P50 | M | D | Optionales Budgetprofil | Geschützte Reserve wird nicht zugleich verplant; bereits als Work erfasste Übung/Prüfung wird nicht erneut als Reserve gezählt. | G §12.6; TEX graph-planning Aufwand |
| P51 | M | D | Optionales Budgetprofil | Gemeinsamer Kompetenzerwerb zählt einmal; echte zusätzliche Anwendung darf eigene Zeit kosten. weight oder rohe Zielzahlen sind keine Zeitschätzung. | G §12.6; TEX graph-planning Aufwand |
| P52 | M | D | Optionales fachübergreifendes Budgetprofil | Neben dem Gesamtbudget bestehen alle deklarierten Fach-, Stundenplan- und Ressourcengrenzen ohne doppelte Zeitbuchung. | G §12.6 |
| P53 | M | E | Workload-Gültigkeitsclaim | Ohne belastbare Aufwandsschätzung wird ausschließlich strukturelle Machbarkeit behauptet, keine belegte Zeitmachbarkeit für Lernende. | G §12.6 |
| P54 | M | D | Statusmonotonie bei festem Plan/Zeitraum | Ein zusätzlicher gültiger Abschluss verschlechtert weder erfülltes Pensum noch Rückstand. | LS §12 |
| P55 | M | D | Klausurstoff/Zuordnung | Ausgewählter sichtbarer Themenumfang, hinterlegte coveredGoalIds-Aufgabenabdeckung und requires-Vorbereitungsbedarf bleiben drei getrennte Mengen; keine davon ist ein neuer Kompetenznachweis. | EP Drei verschiedene Aussagen |
| P56 | M | D | Klausurabdeckung | Die Ansicht zeigt beide Mengendifferenzen zwischen gewählten Themen und gewählten Aufgaben; nur ausgewählte Pakete zählen, Prüfungsziele werden getrennt und IDs dedupliziert. | EP Drei verschiedene Aussagen |
| P57 | M | D | Klausurabdeckung | Eine versteckte kanonische Clusterreferenz darf nur bereits sichtbare Kursatome zusammenfassen; sie nimmt keine ausgeblendeten Atome in den Kurs auf. | EP Drei verschiedene Aussagen |
| P58 | M | D | Klausurpakete | Ungültige oder nicht verfügbare Aufgaben werden ausgewiesen und nicht eingeplant; offene Metadaten erzeugen keine Vollständigkeitszusage und blockieren nicht die gültige Auswahl. | EP Drei verschiedene Aussagen |
| P59 | M | D | Vorbereitungsvorschau | Öffnen der Vorschau schreibt keinen Plan; der vorgesehene Zeitraum endet vor der Klausur und enthält mindestens einen Werktag. | EP Vorbereitung vervollständigen |
| P60 | M | D | Vorbereitungsauswahl | Standardmäßig wird nur explizit gewählter Stoff vorbereitet; zusätzliche Aufgabenthemen/Grundlagen sind zunächst deaktivierte Vorschläge und externe Voraussetzungen werden nie still zu Kurszielen. | EP Vorbereitung vervollständigen |
| P61 | M | D | Vorbereitungsübernahme | Übernahme erzeugt einen aktiven Abschnitt mit den gewählten kanonischen Wurzeln, verändert den Klausurstoff nicht und plant rechtzeitig bereits zugeordnete Ziele nicht doppelt. | EP Vorbereitung vervollständigen |
| P62 | M | D | Vorgezogene Planarbeit | Verschiebung aus anderen Abschnitten benennt alle betroffenen Abschnitte und verlangt Zustimmung; dadurch leere Abschnitte bleiben inaktiv erhalten. | EP Vorbereitung vervollständigen |
| P63 | M | D | Vorbereitungsbasis | Ergänzung erhält die vorhandene unveränderliche persönliche Planungsbasis; eine neue Zeitstempelaufnahme ersetzt sie nicht. | EP Vorbereitung vervollständigen |
| P64 | M | D | Fehlgeschlagene Übernahme | Fehlgeschlagene Speicherung lässt die Vorschau mit konkretem Fehler offen und behauptet keine Übernahme. | EP Vorbereitung vervollständigen |
| P65 | M | D | Aktive Planabschnitte | Fehlendes active gilt für Bestandsdaten als true; inaktive Abschnitte werden vor Zielzuordnung/Deduplizierung ausgeschlossen und erzeugen weder Soll/Pufferwirkung noch nächsten Termin. | EP Aktive und inaktive Abschnitte |
| P66 | M | D | De-/Reaktivierung | Deaktivierung ändert keine Mastery oder persönlichen Kursziele; Reaktivierung erhält Termine und berücksichtigt aktuellen Lernstand, Terminverschiebung bleibt explizite Änderung. | EP Aktive und inaktive Abschnitte |
| P67 | M | D | Undatierter Klausurumfang | Explizit gewählter aktiver Klausurstoff ist auch ohne datierte Vorbereitung lernbar; Fortschritt zählt alle gewählten sichtbaren Atome einschließlich erreichter, ohne erfundenes Pensum/Rückstand/Bilanzskala. | EP Lernstand und Lernfokus; AG §10.2 |
| P68 | M | D | Mehrere Klausurtermine | Ein gemeinsamer Resolver wählt zunächst den nächsten aktiven Termin, bei Datumsgleichheit stabil nach Abschnitts-ID; er vereinigt keine Klausurstoffmengen. | EP Lernstand und Lernfokus |
| P69 | M | D | Klausuraktivierung | Explizite Aktivierung übernimmt den vollständigen gewählten atomaren Klausurumfang als Fokus; aktives Einzelziel oder Fortsetzung verkleinert/erweitert ihn nicht still. | EP Lernstand und Lernfokus |
| P70 | M | D | Laufender Klausurfokus | Datumssprung oder neues Ergebnis ersetzt den laufenden Umfang nicht ungefragt durch einen anderen Klausurtermin; Speichern/Statusfrage verdrängt kein laufendes Goal. | EP Lernstand und Lernfokus |
| P71 | M | D | Lokaler Kurskontext | Browserplan-Schlüssel bindet Klasse, Root, Fach und wirksamen Level2-Kontext; Kontextwechsel lädt keinen anderen Kursplan still weiter. | TA §19.1 |
| P72 | M | D | Lokale Planrevision | Jede gespeicherte Änderung und Undo erzeugt eine Revision; offener Entwurf wird nicht über eine alte Publikationsbestätigung übernommen. | TA §19.1 |
| P73 | M | D | Lokaler Planexport | JSON-Planexport enthält keine Klassen-ID, Namen, Lernenden-ID oder Masterywerte; erhaltene Altdokumentation erzeugt keinen neuen Ergebnisstand. | TA §19.1 |
| P74 | M | D | Lokale Planzeit | Werktagsverteilung verwendet Montag–Freitag und Berlin-Datum; fehlende Feiertags-/Ferien-/reale Kapazitätsdaten werden als Grenze ausgewiesen. | TA §19.1 |
| P75 | M | D | Persönliche Planübergabe | Übergabe ist eine ausdrücklich bestätigte eigenständige Fachplankopie; sie erzeugt keine neue institutionelle Klassen-/Lehrkraftberechtigung oder Übertragung privater Klassen-/Coverage-/Masterydaten. | TA §19.2 |
| P76 | M | D | Persönliche Planvalidierung | Server prüft eingehende Goal-IDs gegen aktuellen Fachumfang; neue bereits abgeschlossene IDs werden nicht zu neuer Planarbeit, vorhandene Plan-IDs dürfen zur Kontinuität erhalten bleiben. | TA §19.2 |
| P77 | M | D | Planrevision/Personalisierung | expectedRevision verhindert stilles Überschreiben; geänderter relevanter Personal-Curriculum-Fingerprint macht den Plan stale und löst keinen Fokuswechsel aus. | TA §19.2 |
| P78 | M | D | Mehrfachplanaktivierung | Bestätigte gemeinsame Aktivierung ist atomar alle Fachkopien oder keine; ein Startreconcile füllt nur fehlendes aktives Goal und verdrängt kein laufendes. | TA §19.2 |
| P79 | M | D | Planmodus ohne Kandidat | Ungültiger/staler/fehlender Plan oder kein geeigneter fälliger Kandidat erzeugt kein erfundenes Ersatzziel; allgemeiner Autopilot bleibt bei aktivem Planmodus unterdrückt. | TA §19.2 |
| P80 | M | D | Plantermin-Conformance | Lehrer- und Lerneransicht verwenden dieselbe kumulative Rundung und voraussetzungstreue Atomordnung; beschränkte Konfliktreparatur verändert nur Reihenfolge innerhalb gewählter Blöcke und scheitert ohne vollständig gültige Endprüfung. | TA §19.2 |

## Q: Qualität, Reife und Review (55)

| ID | Stand | Art | Scope | Präzises Prädikat | Normquelle |
|---|---|---|---|---|---|
| Q01 | M | D | Curriculum-Maturity | M0–M7 sind kumulativ; eine höhere Stufe setzt alle im jeweiligen Profil verlangten niedrigeren Bedingungen voraus. | HQ §2; QM Curriculum-Reife |
| Q02 | M | D | CQR-Status | pass, warn, fail und not_configured bleiben verschiedene Ergebnisse; fehlende Konfiguration zählt nicht als bestandene Prüfung. | QM Regelstatus |
| Q03 | M | D | M0–M6-Ableitung | Die erreichte Stufe folgt exakt der veröffentlichten CQR-Bedingungstabelle und den aktuellen konfigurierten Routen-/Reviewscopes, nicht einem manuell vergebenen Badge. | QM Curriculum-Reife |
| Q04 | M | D | Scope-Maturity | Die Scope-Stufe folgt der CQR-101/102/103/104/201/202/203-Tabelle; der Widerspruch maximal M3 versus Tabelle M4 bleibt als D-QS dokumentiert. | QM Scope-Reife |
| Q05 | M | D | Geschützte Curricula | Aktuelle Curriculum-QA darf eine geschützte Maturity-Untergrenze nicht unterschreiten; betroffene nicht bestandene CQR-Regeln werden konkret ausgewiesen. | AG §7.2 |
| Q06 | M | E | Änderung geschützter Untergrenzen | Eine Absenkung benötigt eine ausdrückliche Product-Owner-Entscheidung mit dokumentierter fachlicher Begründung in der Floor-Policy. | AG §7.2 |
| Q07 | M | D | Kanonische Änderungen | Nach Beschreibungs-, Assessment-, Routen-, Mapping- oder Kompositionsänderungen wird der aktuelle Qualitätsstatus aus Quellen neu erzeugt und die Floor-Policy geprüft. | AG §7.2 |
| Q08 | M | D | M7-Nenner | Die autoritative Semantic-Kind-Liste bestimmt die eindeutige nichtleere vollständige aktuelle curricularAtomic-ID-Menge des bezeichneten Fachs. | HQ §3.1; QM CQR-303 |
| Q09 | M | D | M7-Abdeckung | Strikt abgeschlossen sind genau die IDs in D geschnitten P geschnitten A geschnitten M geschnitten V; Summen, Mittelwerte oder gerundete100Prozent ersetzen keinen Vollabgleich. | HQ §§3.1–3.2; QM CQR-303 |
| Q10 | M | D | M7-Abschluss | M7 setzt M6, vollständige strenge ID-Abdeckung, alle erforderlichen Fachprüfungen und null relevante Blocker voraus. | HQ §3.1; QM CQR-303 |
| Q11 | M | D | M7-Berechnung | Der zentrale Fünf-Gate-Bericht ist die einzige M7-Berechnungsquelle; Oberflächen und andere Reports projizieren ihn. | HQ §3.1; QM CQR-303 |
| Q12 | M | D | M7-V | Gate V verwendet aktuelle KI-Bildentscheidung am exakten aktiven Asset-Hash mit gültigen Ziel-/Text-/Asset-Bindungen; humanApproved und humanIssueIdentified erfüllen oder vetoieren V nicht. | HQ §3.3; QM CQR-303 |
| Q13 | M | D | M7-V | deferred_provider_limitation und deferred_quality_review sind offene Arbeit und erfüllen V nicht. | QM CQR-303 |
| Q14 | M | E | Beschreibungsgate D | Jedes verlangte Ziel besitzt zwei unabhängig erzeugte aktuelle Beschreibungsreviews und eine abgeschlossene gebundene Synthese mit geklärten Entscheidungen. | HQ §3.1; BK §9.4.1 |
| Q15 | M | E | V2-Verständnisgate P | Jedes verlangte positive-understanding-evidence-v2-Profil bindet die aktuelle vollständige Goal-/Reviewinput-/Schema-/Kriterienfassung. | HQ §3.1; BK §§4.1.1,4.2 |
| Q16 | M | D | Profilstatus | Fingerprintabweichung macht einen alten Review stale und für aktuelle Guidance/Runtime ungeeignet, selbst bei gespeichertem approved. | BK §§4.2–4.3 |
| Q17 | M | E | Profilfreigabe | AI-Autor, Reviewer und Synthese vergeben keine menschliche approved-Entscheidung; aktuelle menschliche Freigabe bleibt erforderlich, wo das Profil autoritativ werden soll. | BK §4.3; AG §7.4 |
| Q18 | M | E | Reviewkampagne | Jede Runde bindet vor Start exakte Buch-/Seiten-/Goal-/Prompt-/Kriterien-/Batchinputs; Ergebnisse decken jede zugewiesene Goal-ID genau einmal in verlangter Reihenfolge ab. | BK §9.4.1 |
| Q19 | M | E | Bilinguale Beschreibungskorrektur | revise liefert genau eine DE- und eine bedeutungsäquivalente EN-Ersetzung; split_review/block erlauben keine reine Wortlautreparatur. | BK §9.4.1 |
| Q20 | M | E | Kontrollierte Autorenänderung | Nur ausdrücklich menschlich akzeptierte Beschreibungsersetzungen gelangen in den betreffenden kontrollierten Change-Set; IDs und Graphrelationen bleiben erhalten und betroffene Evidenz wird inhaltlich neu geprüft. | BK §9.4.1 |
| Q21 | M | E | Zweite Blindrunde | Externe V2-Runde stammt aus anderem Provider/Modellfamilie und erhält weder V1-Review noch Adjudikation oder V1→V2-Diff; der Reviewvertrag bleibt gebunden. | BK §9.4.1 |
| Q22 | M | E | Reviewsynthese | Synthese erhält Dissens und unterschiedliche Inputbindungen; substantielle Abweichung wird entschieden und nicht durch Mehrheitszählung oder automatisches Umschreiben beseitigt. | BK §§4.3,6.4,9.4.1 |
| Q23 | M | E | Semantische Atomizität | Jedes ausgewählte gewöhnliche Contentblatt hat genau einen aktuellen gültigen Reviewdatensatz; fehlende, stale, obsolete, non_atomic oder needs_developer_review Records verhindern pass. | AG §7.1; QM CQR-301 |
| Q24 | M | D | Atomizitätsscope | Orientierung, Memory, Practice/Assessment und examData-Ziele gehören nicht in die gewöhnliche semantische Contentatomizitätslane. | AG §7.1; QM CQR-301 |
| Q25 | M | H | Fachliche Atomizität | Ein Contentblatt umfasst genau ein fachliches Lernziel; zusammenhängendes Berechnen-und-Deuten darf eins sein, unabhängige Routinen müssen getrennt oder zur Fachprüfung gestellt werden. Keywords allein entscheiden dies nicht. | AG §7.1 |
| Q26 | M | E | Memory-Entscheidungen | Jedes relevante gewöhnliche Atom des konfigurierten Scopes besitzt einen aktuellen begründeten no_memory_needed-, memory_required- oder needs_developer_review-Datensatz. | AG §7.2; QM CQR-302 |
| Q27 | M | D | memory_required | Jede memory_required-Entscheidung referenziert existierende Memory-Goals und mindestens ein von ihnen bereitgestelltes lesbares Deck. | AG §7.2; QM CQR-302 |
| Q28 | M | D | Memory-Views | In jeder konfigurierten visibilityScope-View hat ein sichtbares memory_required-Ziel wenigstens einen seiner referenzierten Memory-Goals sichtbar. | AG §7.2; QM CQR-302 |
| Q29 | M | E | Aktive Primärkarten | Jede aktive Primärkarte besitzt einen aktuellen eindeutigen Card-Review mit kept, necessary=true und mindestens einem konkreten originGoalId. | AG §7.2; QM CQR-302 |
| Q30 | M | D | Kartenursprung | Jedes originGoalId einer behaltenen Karte ist ein aktuelles memory_required-Atom und referenziert genau das betreffende Deck. | AG §7.2; QM CQR-302 |
| Q31 | M | D | Entfernte Karten | Ein Card-Review mit remove darf als Auditspur bleiben, die Karte darf jedoch in keiner aktiven Deckdatei weiter enthalten sein. | AG §7.2; QM CQR-302 |
| Q32 | M | D | Memory-Trace | Jeder Memory-Goal im konfigurierten Scope ist über behaltene Karten und wenigstens eine aktuelle memory_required-Entscheidung begründet. | AG §7.2; QM CQR-302 |
| Q33 | M | D | Memory-Namens-/Ablageprofil | Kanonische DE-Gymnasium-Deck-/aktive Karten-/Datei-IDs kodieren keine Source-Bundeslandpräfixe; Source-Herkunft bleibt Provenance und Sichtauswahl bleibt Viewsemantik. | AG §7.2; QM CQR-302 |
| Q34 | M | D | Memory-Reports | Lesbare Memory-Berichte werden aus den Ledgern erzeugt und nicht als zweite Wahrheit manuell gepflegt. | AG §7.2 |
| Q35 | M | H | Memory-Eignung | Memory ist nur für begründet abrufpflichtige kompakte Inhalte erforderlich; no_memory_needed darf nicht ohne Einzelprüfung massenhaft als Freigabe gesetzt werden. | AG §7.2 |
| Q36 | M | D | M6 | Fehlende/offene Memorykonfiguration blockiert M6, nicht den fachlich bereits erfüllten M5-Kern. | QM CQR-302 |
| Q37 | M | D | M5-View-Verfügbarkeit | Mindestens eine gültige learner-facing Composition View ist dem Curriculum zugeordnet. | QM CQR-401 |
| Q38 | M | D | Applicability-Warnschuld | pass verlangt null aktuelle nicht akzeptierte Warnungen und null obsolete akzeptierte Registryeinträge; APV-202 bleibt separate Diagnose. | QM CQR-501 |
| Q39 | M | E | M7 und Human-Freigaben | Maschinenabschluss verändert keine Human-Freigaben oder Human-Befunde; ein verpflichtendes menschliches Release-Gate bleibt separat wirksam. | HQ §§3.3,4 |
| Q40 | M | D | QS und Erprobung | Maturity und menschliche Erprobung sind getrennte Statusachsen; M7 oder hundertprozentige Mastery erzeugt keinen Human-tested-Status. | HQ §§2,5,6 |
| Q41 | M | D | Champion-Beginn | Ab M5 signalisiert eine aktive passende Champion-Rolle mit mindestens einem abgeschlossenen Goal im zugeordneten Scope oder explizitem Start laufende Erprobung; Registrierungsalter ist unerheblich. | HQ §5.1; AG §7.5 |
| Q42 | M | D | Champion-Pause/Ende | Pause oder beendete Rolle wird nicht durch vorhandenen Fortschritt aufgehoben; bestehende gültige Abschlussnachweise bleiben erhalten. | HQ §§5.1,6.3 |
| Q43 | M | E | Human-tested-Abschluss | Ein einzelner zugeordneter Champion besitzt vollständige aktuelle inhaltsgebundene praktische Nachweise für den gesamten gebundenen Umfang; Teilmengen verschiedener Personen werden nicht addiert. | HQ §5.2 |
| Q44 | M | E | Human-tested-Abschluss | Keine bekannten relevanten Blocker sind offen und eine ausdrückliche Abschlussbestätigung liegt vor; Lernzielabschluss erledigt keinen gemeldeten Fehler automatisch. | HQ §§5.2–5.3 |
| Q45 | M | D | Erprobungsscope | Eine explizite Erprobungsaktion bindet ihren Umfang; spätere Personalization verändert ihn nicht still und Teilnachweise werden nicht auf ganze Fächer übertragen. | HQ §6.1 |
| Q46 | M | E | Änderungen nach Review/Erprobung | Neue oder materiell geänderte Inhalte benötigen aktuelle betroffene Nachweise; unveränderte gültige Nachweise bleiben bestehen, historische werden nicht umgedeutet. | HQ §6.2 |
| Q47 | M | D | QS-Sammelanzeigen | Einzelne reife/erprobte Fächer übertragen ihren höchsten Status nicht auf die ganze Sammlung; alle Oberflächen verwenden dieselbe zentrale Ableitung. | HQ §§7.3,8 |
| Q48 | M | D | Öffentliche QS-Artefakte | Öffentliche Prüf-/Erprobungsberichte enthalten keine privaten Lernenden-, Session-, Chat- oder Credentialdaten. | HQ §8; AG §7.4 |
| Q49 | M | H | Neue gewöhnliche Kompetenzformulierungen | Titel/Beschreibung benennen prüfbare lernendenverständliche Kompetenz; bloßes Nachschlagen und Einsetzen ist ohne fachliche Begründung kein Lernziel. | AG §7 |
| Q50 | M | E | Formelsammlung-Ausnahme | Eine Formelsammlungsnennung in kanonischer Kompetenz ist nur durch exakten normativen Quellenbezug und Zitat in competency-wording-exceptions.json zugelassen. | AG §7 |
| Q51 | M | E | Textkorrekturen | Umlaut-/Schreibkorrekturen werden einzeln im Wort-/Feldkontext geprüft; eine mechanische Ersetzung oder Hasherneuerung ist keine neue Sachfreigabe. | AG §7 |
| Q52 | M | E | Reviewportabilität | Committable Reviewinputs sind exakte Dateien oder repo-relative Verweise auf committable Ziele; absolute lokale oder ignorierte Scratchziele sind unzulässig. | AG §7.4 |
| Q53 | M | D | Reviewformate | Geschriebene JSON/JSONL-Dateien werden vollständig erneut geparst; rohe Kommandoausgabe bleibt Text und wird nicht als gültiges JSON ausgegeben. | AG §7.4 |
| Q54 | M | E | Historische Reviewreparatur | Fehlerhafte historische Serialisierungen werden durch bytegetreue Roharchive und additive gültige Nachfolger repariert; ursprüngliche fachliche Urteile bleiben nachvollziehbar. | AG §7.4 |
| Q55 | M | H | Wirksamkeitsclaim | M7 und vollständiger Champion-Durchlauf behaupten weder garantierte Fehlerfreiheit noch nachgewiesene allgemeine Unterrichtswirksamkeit. | HQ §§3.2,5.4 |

## S: Quellen, Provenienz und didaktische Ressourcen (31)

| ID | Stand | Art | Scope | Präzises Prädikat | Normquelle |
|---|---|---|---|---|---|
| S01 | M | E | Registrierte Source-Snapshots | Jeder registrierte Source-Snapshot ist lesbar und hat strukturierte sourceDocument/sourceDocuments-Metadaten mit amtlicher HTTP(S)-Original-URL. | QM CQR-000 |
| S02 | M | D | Source-Ingestion | Alle aus lesbaren Snapshots extrahierten Source-Goal-IDs und Source-Atom-IDs sind in Membership/Closure registriert. | QM CQR-000 |
| S03 | M | E | Deklarierte Quellenabdeckung | Jede betrachtete Bundesland/Fach/Stufe/Dauer-Zelle hat passende Quellenextraktion oder eine explizite überprüfte Entscheidung, dass keine gesonderte Quelle/Projektion nötig ist. | QM CQR-000 |
| S04 | M | D | Source-Cache | Fehlende versionierte Original-PDF allein ist kein Quellenfehler bei gültiger offizieller URL und lesbarer Extraction; eine neu verarbeitende Pipeline verlangt verfügbare oder reproduzierbar beschaffbare Originalbytes. | QM CQR-000 |
| S05 | M | D | Bundesland-Quellenabdeckung | Jedes sichtbare atomare Ziel besitzt für genau dieses Bundesland direkte Provenance, überprüftes Mapping oder einen ausdrücklich überprüften zulässigen Surrogatbeleg. | QM CQR-003 |
| S06 | M | D | Rückwärtsabdeckung | Die vollständige atomare Closure jedes registrierten Source-Originalziels mappt auf kanonische Atome der betreffenden Bundesland-View. | QM CQR-003 |
| S07 | M | D | Belegrollen | Overrides, child-union und automatische requires-closure sind keine curricularen Quellenbelege. | QM CQR-003; SR §1 |
| S08 | M | E | requires-closure-Surrogate | Ein akzeptierter indirekter Quellenbeleg ist ausdrücklich reviewt und begründet nur die logische Sequenzlücke; er erfindet kein neues amtliches Thema. | QM CQR-003 |
| S09 | M | D | Mappingfit und Vollständigkeit | partial-Mappings können vollständige Inhaltsabdeckung belegen, bleiben aber als eingeschränkter Fit sichtbar; ihre bloße Existenz beweist nicht Vollabdeckung. | QM CQR-003 |
| S10 | M | D | CQR-003-Pass | Beidseitige vollständige registrierte Abdeckung sowie keine Projektionswarnungen/-fehler sind für pass erforderlich; akzeptierte Applicabilitywarnungen ersetzen dies nicht. | QM CQR-003 |
| S11 | M | D | Source-Kursniveau | LK-Sourceziele verlangen LK-Zieltag; GK_LK-Sourceziele verlangen beide Tags GK und LK. | QM CQR-004 |
| S12 | M | E | Unspecified-Kursniveau | unspecified wird konservativ GK_LK; LK-only ist nur durch explizite begründete courseLevelDecision zugelassen. | QM CQR-004 |
| S13 | M | D | CQR-004-Kursniveauabdeckung | Kursniveau-relevante Sourceziele bleiben nicht ungemappt; partial-Kanten zählen vor fachlicher Klärung nicht als akzeptierte Kursniveauabdeckung. | QM CQR-004 |
| S14 | M | H | Amtliche Vollständigkeit | Die Extraktion bildet den relevanten Inhalt und Stand der tatsächlichen Originalquelle sachgerecht ab; Registryvollständigkeit allein beweist keine vollständige PDF-/HTML-Inhaltsauswertung. | QM CQR-000; SR §1 |
| S15 | M | E | Source-Text-Verifikation | Verbatim-, normalisierte Transkriptions- oder Paraphrasenclaims tragen passende aktuelle Original-/Passage-/Locator-/Texthash-Evidenz und bewahren ihren jeweiligen Claimtyp. | HRG HR-004 |
| S16 | M | E | Source-Text-Human-Restfälle | Eine erforderliche menschliche Restentscheidung enthält Reviewer, Zeitpunkt, Begründung und passende reviewEvidenceSha256; maschineller Texttreffer wird nicht menschliche oder rechtliche Freigabe. | HRG HR-004 |
| S17 | M | D | Quellen versus Lernmaterialien | Quellen-/Provenancebelege bleiben im Curriculum; neue optionale externe Lernmaterialien werden ausschließlich in separaten Contentpaketen auf stabile Goal-IDs gemappt. | SR §§1–2; CI §3.1 |
| S18 | M | D | Content-Ownership | Contentzuordnung liegt außerhalb der kanonischen Kompetenzdefinition; die autorisierte Materialauswahl gehört zur SkillPilot-ID. | CI §§3.2–3.3; SR §3 |
| S19 | M | D | Contentauswahl | Paketaktivierung verändert keine Goalbedeutung, requires, Personal Curriculum, Frontier, Mastery oder Abschlussbedingung. | CI §3.4; SR §§3–4 |
| S20 | M | D | Contentresolver | Das Backend liefert nur für aktuellen Goal und autorisierte Materialauswahl passende begrenzte Referenzen. | SR §4; CI §3.3 |
| S21 | M | D | Optionales Lernmaterial | Keine Auswahl, fehlendes Mapping, zurückgezogenes Material oder unerreichbare Seite lässt den normalen Lernweg verfügbar. | SR §4; CI §3.5 |
| S22 | M | D | Externe Links | Materiallinks übertragen keine Lernenden-ID, Session, Fortschritt, Chattexte oder automatisch angehängte Trackingparameter. | SR §4 |
| S23 | M | D | Coach-Quellenbehauptung | Ein vom Backend gelieferter URL allein wird nicht als tatsächlich gelesener oder ausgewerteter Seiteninhalt dargestellt. | SR §4 |
| S24 | M | D | Materialzugriff | Aktivierung, vorhandene Zugangsberechtigung und erlaubte KI-Nutzung bleiben getrennte Zustände; Aktivierung behauptet keine Rechtefreigabe. | SR §4; CI §3.7 |
| S25 | M | E | Contentmigration | Eine reine Verlagerung erhält Goal-IDs/-Texte/-Kanten, amtliche Quellen und Visualisierungen; historische praktische Evidenz wird nur mit eng gebundener Migrationsevidenz angepasst. | SR §5 |
| S26 | M | E | Contentmigration | Live-Publikationen und Qualitätsreports werden aus Autoreninputs neu erzeugt; eingefrorene Source-Snapshots, veröffentlichte Pakete und Reviewreceipts bleiben unverändert. | SR §§2,5 |
| S27 | M | H | Materialmapping | Ein überprüftes Mapping besagt Unterstützung des genannten Goals, keine vollständige Abdeckung, Fehlerfreiheit, Providerbefürwortung oder Lerner-Mastery. | SR §3; CI §3.6 |
| S28 | M | D | Nachvollziehbare Quellenrationale | Eine ausgegebene curriculare Begründung unterscheidet tatsächlichen Originalbeleg, überprüfte Modellierungsentscheidung und offene Lücke; Wortlautähnlichkeit oder offizieller Domainname allein gilt nicht als Beleg. | SR §1; HR Existing Evidence Chain |
| S29 | M | E | Retained Source-Artefakte | Retained Assets bleiben dem bezeichneten Bundesland und Quellenstand zugeordnet; gemischte Ablage erzeugt keine neue amtliche Identität. | CR §9 |
| S30 | M | D | Source-Landscape-Registry | Ein referenzierter lokaler Sourcepfad löst auf die deklarierte Landscape-ID auf; Mehrdeutigkeit ist kein gültiger Registryeintrag. | QM CQR-000; GV Core validator checks |
| S31 | M | D | Kanonisches DE-Gymnasium-Landschaftsverzeichnis und Reviewinputs | curricula/DE/Gymnasium/canonical enthält SkillLandscape-JSON, keine Memorydecks; temporäre Reviewcapsules und Caches liegen außerhalb curricula. | AG §§7.2,7.4 |

## I: Lernzielbilder und Darstellung (25)

| ID | Stand | Art | Scope | Präzises Prädikat | Normquelle |
|---|---|---|---|---|---|
| I01 | M | D | Kanonische Bildlinks | Ein Goalbild ist resourceLinks.type=goal-visualization, resourceType=image und skillpilotId gleich der enthaltenden Goal-ID. | AG §7.3; IM Canonical JSON Format |
| I02 | M | D | Bildassetidentität | Bild-URL und Quelldatei verwenden die Goal-ID plus Dateiendung und den deklarierten Assetpfad; Provider/Lizenz/Sprache/Reviewstatus und zugänglicher Alttext sind vorhanden. | AG §7.3; IM Asset Layout |
| I03 | M | D | Aktive und kopierte Assets | Kanonisches Original, öffentliche und backendseitige Kopie entsprechen der referenzierten aktuellen Assetidentität und den gebundenen Bytes/Hashes. | IM Production Pipeline; HQ §3.3 |
| I04 | M | E | Bildproduktion | Provenance nennt den tatsächlichen bekannten Provider/Tool/Modell, den tatsächlich verwendeten Prompt-/Referenzansatz sowie Kandidaten-/Aktivhash und Reviewentscheidung; Hilfsskriptdefaults beweisen keine Herkunft. | IM Provider priority and exception policy |
| I05 | M | E | Bildgenerierung | Ein erzeugtes oder importiertes Bild wird erst nach gesonderter tatsächlicher Sichtprüfung mit gebundener Entscheidung als kuratiert behandelt. | IM Hard Review Gate |
| I06 | M | H | Fachliche Bildqualität | Das konkrete Bild ist zum Goal passend, korrekt und nicht irreführend in Wert, Geometrie, Einheit, Beschriftung oder Notation; korrekter Begleittext heilt keine falsche Darstellung. | IM Quality Checklist und Hard Review Gate |
| I07 | M | H | Darstellungsqualität | Bild und Alttext sind altersgerecht, lesbar und barrierearm für die vorgesehenen Darstellungsgrößen; Herkunft allein entscheidet nicht über Qualität. | IM Quality Checklist |
| I08 | M | E | KEEP und Ersatz | Gute vorhandene Bilder und gültige Reviews bleiben erhalten; Ersatz erfordert didaktische Lücke oder dokumentierte Schwäche, keinen bloßen Providerwechsel. | IM Provider priority and exception policy |
| I09 | M | E | Programmgenerierte Endbilder | Ein programmgeneriertes Diagramm/SVG ist eine eng begrenzte dokumentierte fachlich begründete Ausnahme und erfüllt dieselbe Qualitätsprüfung. | IM Provider priority and exception policy |
| I10 | M | E | Substantielle Bildänderung | Betroffene Goal-/Seiten-/Kontext-/Evidenzbindungen werden inhaltlich neu geprüft; bloßes Hashnachführen ist keine Freigabe. | IM Provider priority and exception policy; HQ §4 |
| I11 | M | D | Bildprompts | Providerprompts enthalten keine technischen SkillPilot-IDs oder privaten Klassen-/Lernenden-/Session-/Chatdaten. | AG §7.3; IM Provider priority and exception policy |
| I12 | M | E | Rejected/Deferred-Bilder | Fachlich ungeeignete Kandidaten bleiben inaktiv; ungeeignete aktive Links/Kopien werden entfernt und tatsächliche Fehlversuche/Befunde erhalten. Unverfügbarkeit allein ist kein Fehlerbeleg. | IM Hard Review Gate |
| I13 | M | D | Bildstatus | pilot bleibt bis tatsächlicher zutreffender Releaseprüfung bestehen; Assetexistenz, öffentlicher Pfad oder Link erzeugt keine Freigabe. | IM Hard Review Gate |
| I14 | M | D | Bildfreigabe-Releasegate | Eine aktuelle Human- oder zulässige aktuelle AI-Bildfreigabe kann das separate Display-/Releasegate erfüllen; ein ausdrücklicher aktueller menschlicher Fehlerbefund bleibt dort blockierend. | HQ §4 |
| I15 | M | D | Bild-M7-Abgrenzung | Display-/Releasefreigabe und strikt maschinelles M7-V sind getrennte Prüfverträge und werden nicht auseinander abgeleitet. | HQ §§3.3,4 |
| I16 | M | H | Atomic-Split | Ein korrektes gutes Aggregatbild wird nach einem Goalsplit als Parent-Überblick erhalten, soweit es den verbleibenden Gesamtinhalt weiterhin korrekt repräsentiert. | AG §7.3; IM Provider priority and exception policy |
| I17 | M | D | Bildbedeutung | Visualisierung ist Orientierungshilfe und kein Quellenbeleg, Assessment, Lösungs-/Leistungsnachweis oder Ersatz für Erklärung und Übung. | AG §7.3 |
| I18 | M | D | OpenAI-Bildangebot | Bildangebot erfordert aktives Atom, passenden sicheren kanonischen Link und nicht deaktivierte showGoalVisualizationsInChat-Präferenz. | AG §7.3; IM OpenAI MCP Apps Image Delivery |
| I19 | M | D | Bildrenderer | Rendern bleibt read-only und erzeugt weder Mastery, Goalwahl, Autorisierung noch dauerhafte Lernendenidentität. | AG §7.3; IM OpenAI MCP Apps Image Delivery |
| I20 | M | D | Einmalige Renderautorisierung | Nach Lernendenzustimmung autorisiert genau das frische unveränderte goalId/stateVersion-Paar einen unmittelbaren Renderaufruf; Wiederholung benötigt ausdrücklichen neuen Wunsch und frische Autorisierung. | AG §7.3 |
| I21 | M | D | Feedback-/Abschlussphase | Ein Nachfolgebild wird erst nach Zustimmung zur Fortsetzung und vor Unterricht des zugehörigen aktiven Goals gezeigt; Feedback oder offener Abschluss autorisiert es nicht. | AG §7.3 |
| I22 | M | D | Bildausfall | Fehlende/ungültige Daten oder Ladefehler kollabieren die optionale Komponente und verhindern weder vollständigen Unterrichtstext noch normale Zustands-/Autorisierungssemantik. | AG §7.3 |
| I23 | M | D | Content-addressed Bild-UI | Genau eine aktive Renderer-URI ist an den SHA256 ihrer HTMLbytes gebunden; früher tatsächlich beworbene URIs bleiben byteidentisch lesbar. | AG §7.3 |
| I24 | M | D | Bildkomponente | Sichtbar ist ausschließlich das freigegebene Bild; Validierungsmetadaten wie Titel, ID und Cockpitlink erscheinen nicht als zusätzliche Caption. | AG §7.3 |
| I25 | M | E | Hostanzeige-Claim | Servererfolg oder Ressourcenlesen wird nicht als Beleg sichtbarer Host-Komponentenausführung beziehungsweise Bildanzeige dargestellt. | AG §7.3; IM OpenAI MCP Apps Image Delivery |

## B: Lernzielbuch und Review-Artefakte (38)

| ID | Stand | Art | Scope | Präzises Prädikat | Normquelle |
|---|---|---|---|---|---|
| B01 | M | D | GoalBook HTML/PDF | HTML und PDF konsumieren dasselbe serialisierte versionierte BookModel; keine unabhängige Inhaltsauswahl, Relationsermittlung oder Reihenfolge. | BK §§2,5.1 |
| B02 | M | D | Initiale atomare Buchedition | Genau die durch explizite überprüfte Sourceviews bestimmten curricularAtomic-target-IDs sind enthalten; Memory, Orientierung, Praxis/Exam und Runtime-Support erhalten keine Goalpages. | BK §§2,5.2 |
| B03 | M | D | Goalpages | Jede enthaltene Goal-ID besitzt genau eine vollständige eigene physische PDF-Seite; weder Duplikat, gemeinsames Goalblatt noch Fortsetzung auf zweiter Seite. | BK §§2,5.2–5.3 |
| B04 | M | D | Goalpages | Jede Goalpage enthält ungekürzte öffentliche Lernziel-ID, kanonischen Titel/Beschreibung, Publikationsversion und gebundenen Goalfingerprint. | BK §§2,5.5 |
| B05 | M | D | Buchnavigation | Eine ausdrücklich gebundene überprüfte Navigation-View platziert exakt die Atlaszielmenge einmal; Sourceview-Union entscheidet Mitgliedschaft und Applicability, nicht erste gefundene Elternfolge. | BK §§3.1,5.3 |
| B06 | M | D | Buchreihenfolge | Jede enthaltene direkte Voraussetzung steht vor ihrem Verbraucher; reviewed Kompositionsordnung und zuletzt stabile Goal-ID brechen Gleichstände deterministisch. | BK §5.4 |
| B07 | M | D | Buchrelationen | Jede direkte requires- und abgeleitete reverse-requires-Referenz löst auf das korrekte stabile Ziel auf; fehlende, mehrdeutige oder unsichere Ziele lassen den Build scheitern. | BK §5.6 |
| B08 | M | D | Buchexternes Prerequisite | Eine externe Relation bindet ihre fachliche Quelllandschaft und den tatsächlich auflösenden versionierten Buchkontext getrennt. | BK §5.6 |
| B09 | M | D | Fail-closed Layout | Alle Pflichtinhalte liegen ohne Abschneiden/Überlauf/Überschneidung in ihren Bereichen; kein automatisches Schrumpfen unter freigegebene Mindestgröße verdeckt einen Fehler. | BK §5.7 |
| B10 | M | D | HTML/PDF-Parität | Goal-ID-Menge, Reihenfolge, Relationen, Versionen und Inhaltsfingerprints beider Renderformen sind identisch. | BK §§5.1,5.7 |
| B11 | M | D | Buchreproduzierbarkeit | Bytegleiche Eingaben erzeugen gleiches BookModel, Ziele, Ordnung, Destinations und semantisches Manifest; volatile PDF-Metadaten sind kein Anspruch byteidentischer PDF-Builds. | BK §§3.3,5.4 |
| B12 | M | E | Publikationsmanifest | Das Manifest bindet Generator-/Schema-, kanonische Input-, Sourceview-, Navigation-, Dauerpolicy-, Goal-/Profil-/Asset-, Feedbackziel- und Ausgabehashes für genau Locale und Scope. | BK §11 |
| B13 | M | D | Publikationsfrische | Eine Änderung gebundener Inputs macht die Publikation stale bis Modell, PDF und Manifeste aus demselben Stand neu erzeugt sind. | BK §12 Nr.16 |
| B14 | M | D | Nationwide Atlas | Die enthaltene Menge ist exakt die deduplizierte Union der ausdrücklich enumerierten effektiven überprüften Projektionen; Dateisystemdiscovery ist kein Publikationsvertrag. | BK §§3.1,5.2 |
| B15 | M | D | Atlas-Applicability | Zulässige Applicabilityeinträge sind exakte Bundesland/Stufe/Dauer/Kurs-Tupel; getrennte Dimensionslisten werden nicht kartesisch kombiniert. | BK §§2 Nr.14,5.2 |
| B16 | M | D | Atlasfilter | null bedeutet ausdrücklich keine Unterscheidung in diesem Tupel und ist kein Wildcard für G8/G9/GK/LK; Dauerfilter verlangt das zugehörige Bundesland. | BK §5.2 |
| B17 | M | D | Buchpräorder | Ein gemeinsamer lückenloser treeOrder-Präorder erhält das verfasste Ineinander von Kapitel- und Atomgeschwistern. | BK §5.3 |
| B18 | M | D | PDF-Navigation | Named destinations, Inhaltsverzeichnis und vollständige Outline stimmen in Zielseiten, Titeln, Reihenfolge und Elternbeziehungen mit dem BookModel überein. | BK §5.6 |
| B19 | M | D | Print-Ressourcen | Der lokale PDF-Renderer liest ausschließlich erlaubte lokale Assets ohne Netzwerk; Originalasset bleibt unverändert und Printderivatprofil/-hash ist separat gebunden. | BK §5.7 |
| B20 | M | D | Review versus Public | publicationMode=review darf aktuelle QA-gebundene Kandidaten enthalten; public verlangt aktuelle Publikationsfreigabe und übernimmt keine Reviewlockerung. | BK §5.7 |
| B21 | M | D | Öffentlicher Reviewatlas | Ein öffentlich erreichbarer Reviewatlas bleibt ausdrücklich review markiert mit tatsächlichen Assetstatus; Erreichbarkeit verleiht keine Public-Freigabe. | BK §5.7 |
| B22 | M | E | Originalquellen-Cache | Nicht versionierte Originaldownloads besitzen reviewed Pfad-/amtlicheURL-/SHA256-Bindung; vorhandene Cachebytes passen dazu und cachefreier Checkout erzeugt denselben Atlas. | BK §3.1 |
| B23 | M | D | Buchdaten und Generierung | Autorendaten und Renderer sind die Wahrheit; generierte BookModels/PDFs/Indizes werden nicht händisch als zweite Datenquelle repariert. | AG §7.4; BK §§3.1,3.3 |
| B24 | M | D | CI-Publikationsartefakt | Registrierte Buchausgaben werden vor App-Paketierung gebaut und ein geprüftes Artefakt wird jobübergreifend verwendet; fehlende Ausgabe oder stale Cache umgeht keine Prüfung. | AG §7.4 |
| B25 | M | D | Reviewbundle | Exaktes PDF, normalisiertes Modell-/Profil-JSON und daraus gerendertes Markdown bezeichnen denselben gebundenen Inhalt; OCR erzeugt keine neue Semantik. | BK §5.8 |
| B26 | M | E | Reviewfinding | Jedes akzeptierte Finding referenziert exakte im Bundle enthaltene Goal-ID und Fingerprint sowie Beobachtung, Kriterium, Reproduktionsfall, Evidenzgrad und zulässigen Claimscope. | BK §§5.8,6.3 |
| B27 | M | E | Generischer Multi-AI-Review | Die erste Runde ist blind; ein normaler Batch erfüllt die genannten Rollen-/Promptfamilien- und verfügbare Providerdiversität, gebunden durch tatsächliche Runmanifeste. Wiederholung desselben Modells/Prompts ist keine unabhängige Quelle. | BK §6.2 |
| B28 | M | E | Generalisierung G2 | Eine archetypweite G2-Regel benötigt mindestens E3, mehrere Goals aus mindestens zwei Kapiteln und einen bestandenen Gegenversuch. | BK §7.3 |
| B29 | M | E | Generalisierung G3 | Eine Fach-/Stufenregel benötigt stratifizierte relevante Stufen-/Archetypstichprobe und unabhängige Replikation. | BK §7.3 |
| B30 | M | E | Generalisierung G4 | Eine globale Coach-/Masteryregel benötigt Mathematik- und Physikevidenz, mehrere Archetypen, unabhängige Offline-Replikation und kontrollierte Feld-/Canaryphase vor allgemeinem Release. | BK §7.3 |
| B31 | M | E | Findingautorität | Der tatsächliche Änderungsscope überschreitet den belegten Claimscope nicht; Mehrheit, Dringlichkeit oder laute Einzelmeinung macht keinen lokalen Mechanismus universal. | BK §§6.4,7.2–7.3 |
| B32 | M | D | Feedbackautorität | Ein Public-Feedbackeintrag mutiert keine kanonischen Goals/Profiles, genehmigt sich nicht selbst und bildet keine automatische globale Regel. | BK §§2,8.3 |
| B33 | M | D | Feedbackbindung | Feedback bindet unveränderliche Goal-/Publikations-/Locale-/Scope-/Manifestidentität; ein historischer Link wird nicht still auf eine neue Goalrevision umgebunden. | BK §§8.2,11 |
| B34 | M | D | Öffentliche Buch-/Reviewdaten | Buch, Profile, Bundles und Feedbacklinks enthalten keine privaten Lernenden-/Session-/Chat-/Credentialdaten; öffentliche Lernziel-ID bezeichnet keine Person. | BK §§2,8.2; AG §7.4 |
| B35 | M | D | Feedbacktrust | Externes Feedback bleibt als untrusted getrennt vom serververifizierten historischen Publikationskontext; sein Text löst weder Befehle noch ungefragte URLabrufe oder kanonische Änderungen aus. | BK §§8.2,8.5 |
| B36 | M | E | Spätere Runtimeintegration | Profilguidance oder M7 behauptet keine serverseitig erzwungene Lernenden-Mastery; Runtime-/Masteryprojektion benötigt ihren eigenen ausdrücklich definierten Akzeptanzvertrag. | BK §10 |
| B37 | M | E | Neue didaktische Publikationen | Topictext/Arbeitsblätter verwenden erst die dafür freigegebenen aktuellen Profile, nennen abgedeckte Goal-IDs und führen keine stillen neuen Ziele oder Masteryregeln ein. | BK §9.6 |
| B38 | M | D | Buchlayoutfehler | Ein Layoutfehler nennt betroffene Goal-ID und Region und beendet die Freigabe erfolglos; stiller Inhaltsschwund gilt nicht als erfolgreicher Build. | BK §5.7 |

## K: Pakete, Roundtrip, Lizenz und Veröffentlichung (66)

| ID | Stand | Art | Scope | Präzises Prädikat | Normquelle |
|---|---|---|---|---|---|
| K01 | M | D | Dualer Release | JSON- und Ontologiepaket sind aus denselben Authoringdaten erzeugte Artefakte; Korrekturen erfolgen an Quellen, nicht im fertigen ZIP. | PK Verbindliche Architekturentscheidungen |
| K02 | M | D | Runtimeformat | Das JSON-Release-Modell ist normative Runtime-Referenz; ein Ontologieimport rekonstruiert dasselbe Modell statt einer zweiten Fachsemantik. | PK Verbindliche Architekturentscheidungen |
| K03 | M | D | Ontologiebau | Das Ontologiepaket wird ausschließlich aus dem fertigen JSON-Paket erzeugt und bindet dessen ZIP-Hash. | PK Verbindliche Architekturentscheidungen |
| K04 | M | D | Variantenparität | Alle fachlich normativen Datensätze erfüllen ihre definierte Feldnormalformgleichheit; binäre Ressourcen sind byteidentisch. | PK Normativer Äquivalenzvertrag |
| K05 | M | D | Releaseidentität | Paketidentität und Rolle stammen aus dem Manifest; inneres Manifest wiederholt konsistente Release-/Paket-/Versions-/Digest-/Vertragswerte und enthält nicht den Hash des eigenen äußeren ZIPs. | PK Release-Einheit und Artefakte |
| K06 | M | D | V1-Releaseprofil | Ein V1-Kandidat nennt full-standalone-v1 und enthält jede darin vorgeschriebene Artefaktrolle; ein fehlendes Profil oder Pflichtartefakt ist ungültig. | PK Gemeinsamer Release-Index |
| K07 | M | D | Paketloader | Der Loader folgt ausschließlich inventarisierten Manifestrollen und ihren Pfaden; beliebige JSON-Dateien werden nicht per Pfad-/Dateinamensheuristik als Fachsemantik geladen. | PK Normative Bestandteile |
| K08 | M | D | Normalisierungsrollen | Jede normalisierte Artefaktrolle besitzt genau eine vertrauenswürdig gebundene spezifische normalizationRole; fehlende/doppelte/widersprüchliche Bindung blockiert den Build. | PK Normative Bestandteile |
| K09 | M | D | Publikationsevidenz | Mapping-/Source-/Quality-Normalformen gehen in contentDigest ein, dienen jedoch nicht als Runtime-Closureseeds oder zusätzliche Navigationsziele. | PK Normative Bestandteile |
| K10 | M | D | Schemas | Jede normative JSON-Datei hat eine explizite Schema-Zuordnung, deren inventarisierte gehashte Schemaressource ausschließlich offline aufgelöst wird. | PK Normative Bestandteile |
| K11 | M | D | Schematrust | Consumervertragsversion und gepinnte Bootstrap-Schemas haben Vorrang vor paketgelieferten Trustbehauptungen; schemas/catalog.json ist keine eigene Trustroot. | PK Normative Bestandteile |
| K12 | M | D | Runtimekatalog | Der paketlokale Katalog enthält vollständig Roots/Rollen, Scopeangebote/Views, Decks/Ressourcen, Dependencies und erforderliche Migrations-/Capabilitydaten. | PK Paketlokaler Runtime-Katalog |
| K13 | M | D | Kompilierte Applicability | Das Runtimepaket enthält fertige effektive Applicability; der Consumer rekonstruiert Sichtbarkeit nicht aus Authoring-Mappings oder Source-Registries. | PK Paketlokaler Runtime-Katalog |
| K14 | M | D | Scopeauflösung | Jeder angebotene Scope nennt genau eine View oder einen vertraglich geordneten Merge; jeder auswählbare Root hat Angebot und eindeutigen Default. | PK Paketlokaler Runtime-Katalog |
| K15 | M | D | Module/Fragmente | Nicht auswählbare Module/Fragmente sind von einem Root aus erreichbar und werden nicht automatisch auswählbare Curricula. | PK Paketlokaler Runtime-Katalog |
| K16 | M | D | Standalone-Runtime | Navigation/Frontier/Betrieb funktionieren ohne curricula-Checkout, app/public-/TypeScript-Fachdatenfallback oder Netzwerk-Nachladen von Goaldefinitionen. | PK Alleiniger fachlicher Input |
| K17 | M | D | Standalone-Ressourcen | Alle harten Runtime-Karten/Bild-/Scope-Metadaten sind im Paket; externe Quellen-URLs dürfen für den Offlinebetrieb unerreichbar sein. | PK Alleiniger fachlicher Input |
| K18 | M | D | Dependency Closure | Die Closure folgt sämtlichen schema-definierten harten Referenzfeldern einschließlich Placements, Views, Coverage, Karten, Decks, Ressourcen und Migrationen bis zum Abschluss. | PK Closure Ownership und eingebettete Abhängigkeiten |
| K19 | M | D | Closure-Abgrenzung | Weiche Provenance-URLs und optionale Materialien erzeugen keine harte Runtimeabhängigkeit; inverse fremde Eltern/Views werden nur bei eigener harter Referenz aufgenommen. | PK Closure Ownership und eingebettete Abhängigkeiten |
| K20 | M | E | Embedded-Ownership | Jedes eingebettete fremde Record trägt ownerPackageId, sourceReleaseId, fragmentOfLandscapeId und Digest, ohne eine vollständige fremde Landschaft zu behaupten. | PK Closure Ownership und eingebettete Abhängigkeiten |
| K21 | M | D | Mehrpaketinstallation | Gleiche stabile Goal-ID wird nur bei identischer kanonischer Definition dedupliziert; abweichende Definitionen scheitern, statt nach Installationsreihenfolge überschrieben zu werden. | PK Closure Ownership und eingebettete Abhängigkeiten |
| K22 | M | D | Paketintegrität | Alle Landscape-/Goal-/View-/Deck-/Resourceidentitäten sind eindeutig und alle harten Referenzen, Graphen und Scopeprojektionen erfüllen die zugehörigen G/V-Verträge. | PK Strikte Schema- und Installationsprüfung |
| K23 | M | D | Assetintegrität | Jede eingebettete Karte/Ressource löst mit deklarierter Identität, MIME, Größe und SHA256 auf die inventarisierten Bytes auf. | PK Strikte Schema- und Installationsprüfung |
| K24 | M | D | Transportmodelle | Exporter/TS/Java verwenden denselben versionierten Schemavertrag; Domainadapter bestehen bidirektionale Conformance inklusive Defaults, unbekannter Felder und Serialisierungsroundtrip. | PK Strikte Schema- und Installationsprüfung |
| K25 | M | E | Hermetischer Consumer | Original und rekonstruiertes JSON-Paket bestehen unabhängige Finished-ZIP-Validierung sowie tatsächlichen hermetischen Runtime-Smoke ohne Authoring-Quellbaum. | PK Verbindlicher Roundtrip |
| K26 | M | D | FWU-Corebindung | Core-IRI, Commit und lokale Corebytes/SHA sind exakt gepinnt und offline über den gebundenen Katalog auflösbar. | PK Vertrag des Lehrplan-Ontologie-Pakets |
| K27 | M | H | Core-first-Semantik | Core-Terme werden nur bei passender Bedeutung verwendet; Anwendungserweiterungen schließen dokumentierte echte Lücken statt fachlich falscher Corezuordnung. | PK Verbindliche Architekturentscheidungen; HRG HR-005 |
| K28 | M | D | Ontologiefelder | Jedes Runtime-relevante Feld hat eine registrierte verlustfreie RDF-/Reverse-Abbildung; neue unregistrierte Felder blockieren den Ontologierelease. | PK Vertrag des Lehrplan-Ontologie-Pakets |
| K29 | M | D | Ontologiecarrier | Das Ontologiepaket enthält keine versteckte vollständige JSON-Paket-/Landschaftskopie; kanonische JSON-Literale sind ausschließlich eng registrierte begrenzte Erweiterungen. | PK Verbindliche Architekturentscheidungen |
| K30 | M | D | RDF-Listen | Beobachtbare Reihenfolge bleibt durch explizite RDF-Liste oder eindeutige lückenlose Positionsressourcen erhalten; N-Triples-Dateireihenfolge ersetzt dies nicht. | PK Feldsemantik-Registry |
| K31 | M | D | RDF-Segmente | bundle.nt ist genau die geordnete deterministische Konkatenation normativer Segmente und kein zweiter Inhalt oder zusätzlicher contentDigest-Beitrag. | PK Vertrag des Lehrplan-Ontologie-Pakets |
| K32 | M | D | Ontologievalidität | RDF-Syntax, OWL2DL, SHACL/Struktur und HermiT-Konsistenz bestehen für das bezeichnete fertige Paket. | PK Vertrag des Lehrplan-Ontologie-Pakets |
| K33 | M | D | Semantische Nodeart | Jeder kompilierte Goal hat explizites unterstütztes semanticKind; Releasecompiler rät nicht aus Titel, Präfix oder Mathe-ID. | PK Fachübergreifende Ontologieprofile |
| K34 | M | D | Feldregistry-Auflösung | RFC6901-segmentweise Pointermuster und deklarierte Spezifität ergeben genau eine Regel; gleichspezifisch überlappende Muster sind Vertragsfehler. | PK Feldsemantik-Registry |
| K35 | M | D | Literal-Unterbaum | Ein registrierter JSON-Literalcarrier enthält nur erlaubten begrenzten Teilbaum und lässt spezifischer abgebildete Nachfahren aus; Reverse-Merge prüft Konflikte. | PK Feldsemantik-Registry |
| K36 | M | D | Semantische Normalform | Normalisierung erhält Unicode, endliche Zahlen, beobachtbare Reihenfolge und Unterschiede von fehlend/null/leer/default, außer der explizite Feldvertrag erlaubt Gleichsetzung. | PK Feldsemantik-Registry |
| K37 | M | D | Mapping-Truth | Autoritative reviewed Entscheidungen bestimmen Mappingkanten; expliziter Decision-Matchtype hat Vorrang, sonst gilt der überprüfte kantenspezifische Typ, niemals pauschal fehlend=exact. | PK Feldsemantik-Registry |
| K38 | M | D | Contentdigest | contentDigest ist der kanonisch sortierte längengeframte Hash der logischen rollen-/ID-/MIME-/Längen-/Payloadrecords einschließlich Binärhashes; Verpackungsunterschiede und generierte Doku zählen nicht fachlich mit. | PK Gemeinsamer Content Digest |
| K39 | M | E | Isolierter Reverse-Compiler | Rekonstruktion liest nur Ontologiepaket und Sidecars, ohne Zugriff auf Original-JSON, Authoringcheckout oder alte Rekonstruktionen; erst der nachgelagerte Vergleicher erhält beide Oracles. | PK Verbindlicher Roundtrip |
| K40 | M | E | Paketreproduzierbarkeit | Zwei frische isolierte vollständige Builds mit gepinnter Toolchain/Locale/Zeitzone/Dateiordnung/Kompression/Source-Epoch erzeugen je Variante bytegleiche ZIPs. | PK Verbindlicher Roundtrip |
| K41 | M | E | Äquivalenzbericht | Der Report bindet finale ZIP-/Manifest-/Contenthashes, Vertrags-/Core-/Toolfassungen, vollständige Rollen-/Feld-/Graph-/Assetprüfungen und tatsächliche Smoke-/Repro-Ergebnisse samt allen Abweichungen. | PK Äquivalenzreport |
| K42 | M | D | Paketinstallation | Validierung erfolgt in Quarantäne/temporärem Root vor contentadressierter Ablage und atomarer Lockaktivierung; ungültiger Kandidat verändert den aktiven Stand nicht. | PK Sichere Installation |
| K43 | M | D | Package-Lock | Aktivierter Lock pinnt exakte Version und Digests; kein ungepinntes latest und keine unbemerkten Dependencies. | PK Globaler Veröffentlichungskatalog; Sichere Installation |
| K44 | M | D | Paketrollen-/Runtimeisolation | Katalog, Domainmodelle, Views, Karten, Bilder und Evidenz stammen aus derselben verifizierten Packagegeneration; Packagefehler lösen keinen Repositoryfallback aus. | PK Entkopplung der SkillPilot-Runtime |
| K45 | M | D | Ressourcenzugriff | Öffentliche Deck-/Resource-Hrefs binden Paket und Version; eingebettete Bytes werden gegen Manifestintegrität geprüft, externe Materialien sind keine serverseitigen Byteproxies. | PK Ablösung heutiger Kopplungen |
| K46 | M | D | Noch nicht unterstützte Packagefähigkeit | Ein Consumer weist nicht unterstützte embedded-fragment/Capability explizit zurück, statt sie teilweise oder mit Fallback zu laden. | PK Entkopplung der SkillPilot-Runtime |
| K47 | M | D | Technische Kompatibilität | Paketformat, Runtimevertrag, unterstützte Consumersemver und Ontologieprofil werden getrennt geprüft; inkompatible Vertragsmajors werden abgewiesen. | PK Versionierung und Kompatibilität |
| K48 | M | D | Unveränderliche Releases | Veröffentlichte Releases werden nicht überschrieben; Korrektur oder Neuverpackung erhält neue packageVersion, bei reiner Verpackung mindestens Patch. | PK Versionierung und Kompatibilität |
| K49 | M | D | ID-Bedeutung | Stabile Goal-/Landscape-/View-/Deck-/Resource-IDs werden nicht für neue Bedeutungen wiederverwendet; entfernte/ersetzte IDs benötigen explizite Migration. | PK Versionierung und Kompatibilität |
| K50 | M | D | Lernergebnismigration | Nur bedeutungsgleiches renamed übernimmt Lernstand automatisch; split/replace/merge verlangt explizite versionierte Mastery-/Historyregel oder bewusste Neueinstufung. | PK Versionierung und Kompatibilität |
| K51 | M | D | ZIP-Pfade/-Einträge | ZIP enthält nur erlaubte reguläre Dateitypen ohne ausführbare Inhalte, Pfadaustritt, Pfadkollisionen, verschachtelte Archive oder unzulässige JSON-Duplikatschlüssel. | PK Sicherheit Provenienz und Lizenzen |
| K52 | M | D | V1-Paketgrößen | Das V1-Profil begrenzt ZIP auf 3_500_000_000 Byte/60_000 Einträge, allgemeine Entries auf 1_000_000_000 Byte, JSON/Bild/Manifest jeweils 64MiB, Bildsumme auf 3_000_000_000 Byte, entpackte Summe auf 8_000_000_000 Byte, Pfad auf 240 UTF8-Byte, JSON auf 128 Ebenen/5_000_000 Knoten, Inventar auf 59_998 Dateien/1_024 Lizenzen und Kompression auf 100:1 je Entry/25:1 insgesamt. Builder/Validatoren/Loader verwenden dieselben Grenzen. | PK Sicherheit Provenienz und Lizenzen |
| K53 | M | E | Stable-Signatur | Öffentliches stable besitzt verifizierte Releaseindex-Signatur mit zulässiger gepinnter Schlüssel-/Issuer-/Repository-/Workflowidentität und Buildprovenienz; mathematisch gültige fremde Signatur genügt nicht. | PK Release-Einheit und Artefakte |
| K54 | M | D | Signingprojection | Die versionierte Signingprojection entfernt vor Kanonisierung den vollständigen authentication.releaseIndexSignature-Block; die Distributionsdatei bleibt separat gehasht. | PK Release-Einheit und Artefakte |
| K55 | M | E | Stable-Promotion | Beide finale Varianten, Evidenzen, Signaturen und zutreffende Freigaben werden am endgültigen Downloadziel geprüft, bevor die zusammengehörige Releasegruppe atomar stable wird. | PK Globaler Veröffentlichungskatalog; HRG HR-006 |
| K56 | M | E | Lizenzallocation | Eigene Software/technische Verträge tragen Apache-2.0, eigene fachliche Landschaften/Lerninhalte CC-BY-4.0; Funktion entscheidet, nicht Dateiendung. Klar eigene Inhalte brauchen keine neue Einzelgoalfreigabe. | LIC Fixed allocation; AG Project licensing |
| K57 | M | E | Drittrechte | Fremd-/unklarer Inhalt behält tatsächliche Bedingungen; provenanceClass, licenseExpression und redistributionStatus bleiben getrennt, AI-generated ist keine Rechteklärung. | LIC Third-party material; PK Sicherheit Provenienz und Lizenzen |
| K58 | M | D | Publikationsrechte | review-required/prohibited blockiert öffentlichen Release; ein technisch valider Staging-Kandidat mit null-Lizenz bleibt ausdrücklich not-ready-incomplete. | PK Sicherheit Provenienz und Lizenzen |
| K59 | M | D | Lizenzartefakte | Jeder veröffentlichte Lizenzidentifier löst auf inventarisierten Lizenztext auf; NONE/NOASSERTION, verwaiste Texte und pauschale Mischpaket-Umlizenzierung sind unzulässig; Attribution-/Quell-/Änderungshinweise bleiben enthalten. | PK Sicherheit Provenienz und Lizenzen; LIC Applying the rule |
| K60 | M | D | Medienneutrale Ressourcen | runtimeRequired erzwingt eingebettetes Sidecar; neue Medien benötigen zugelassene versionierte MIME-/Größen-/Sicherheitscapability und unbekannte/ausführbare Typen werden zurückgewiesen. | PK Sicherheit Provenienz und Lizenzen |
| K61 | M | E | Human-Fach-/Ontologiefreigabe | Soweit das konkrete Releaseprofil menschliche Bild-/Ontologiesemantik-/Drittrechtefreigabe verlangt, bindet sie exakt den geprüften Artefaktstand; technischer Roundtrip oder M7 ersetzt sie nicht. | HRG HR-001 und HR-005; HQ §4 |
| K62 | M | D | Releasepaar | JSON und Ontologie desselben Releasepaars haben dieselbe packageVersion und denselben contentDigest. | PK Versionierung und Kompatibilität |
| K63 | M | D | MEM/FWU-Prerequisiteprofil | Nur das spezialisierte LP_0000554-Quell-/Verweis-/Zielmuster trägt requires; generischer CE-Verweis ist keine didaktische Voraussetzung. | MEM Expected Ontology Profile |
| K64 | M | D | MEM/FWU-direkte Contains | Jede verfasste direkte contains-Kante bleibt unabhängig von BFO-Transitivinferenz als skillpilot:containsGoal erhalten; inferierte Nachfahren werden keine zusätzlichen Autorenkanten. | MEM Expected Ontology Profile |
| K65 | M | H | MEM/FWU-Core-Parthood | BFO_0000051 repräsentiert nur genuine curriculare Teil-Ganzes-Beziehung; UI-Platzierung, Memory/Praxis/Orientierung und lose Assoziation werden nicht als Coreparthood ausgegeben. | MEM Expected Ontology Profile |
| K66 | M | D | Ontologie-Binärressourcen | Binärbilder werden als explizit gehashte Sidecars mit Mediaidentität und nicht als opaque Base64-RDF-Literale transportiert. | MEM Planned Test; PK Vertrag des Lehrplan-Ontologie-Pakets |

## Integrationsgrenze

Jede kanonische ID wird genau einmal in einer zuständigen CI-Matrix bewertet. Vorhandener Code, ein Testname, ein erfolgreicher Einzeltest, ein Warnungsregister und ein harter Merge-Gate sind unterschiedliche Nachweise. Fehlende Implementierung oder strittiger Datenbestand ändern den Normnenner nicht. Reifegrade und ihre Fach-Mindeststände dürfen durch die Inventur weder abgesenkt noch durch Metadatenkorrekturen als fachlich wiederhergestellt ausgegeben werden.

SRS ist geklärt; transitive Minimalität hat eine bestimmte mathematische Semantik. Die verbleibenden Identitäts-/Loader-, Gewichts- und Reifetextkonflikte sind im Entscheidungsregister begrenzt. Sie dürfen nicht durch stilles Umnummerieren, Umgewichten, automatisches didaktisches Kantenlöschen oder eine neue Unit-Zerlegung scheinbar gelöst werden.
