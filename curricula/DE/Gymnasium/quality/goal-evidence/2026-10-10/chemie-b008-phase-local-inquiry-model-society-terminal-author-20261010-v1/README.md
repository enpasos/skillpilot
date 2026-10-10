<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# B008: echte lokale terminale Prüfungen – Autorenkandidat

**Status: AUTHOR / inactive / needs_review / nicht aktivieren.** Dieser Nachfolger enthält fünf neue vollständige Prüfungsaufgaben samt Lösungen und Bewertungsrastern und einen neuen Sek-I-Modulzweig. Er ist weder ein unabhängiges Beschreibungs- oder P-Review noch eine Freigabe. Chemie bleibt aktiv bei dem geschützten Stand **180/381**; strenger Zuwachs, neue fachliche Abschlüsse und wiederhergestellte aktive Bindungen sind jeweils **0**. Der aktuelle strenge Nenner dieses Kandidaten bleibt **null**, bis echte aktuelle Kind-Entscheidungen vorliegen.

Der eingefrorene Ausgangspunkt ist `chemie-b008-whole22-targeted-current-route-author-checkpoint-20261010-v1/candidate/whole511.inactive.route-author-four-edges.json` mit SHA-256 `be33f5cb6095570300972b27f20ac331754b25524a8f25693888789d59db00af`. Dessen vier bereits entworfene `requires`-Änderungen werden exakt mitgeführt. Der vollständige neue Entwurf ist [whole517.inactive.terminal-assessment-author.json](candidate/whole517.inactive.terminal-assessment-author.json).

## Neue Aufgaben und tatsächliche Zielpflichten

| Neues Ziel | Lokaler Prüfungsumfang | Vollständige abgedeckte Ziel-IDs |
| --- | --- | --- |
| `2f53dea4-1ea9-59ad-bd2d-0492107627ee` | Sek I: eigene tatsächliche Salzwasser-Untersuchung, Reflexion eigener Ergebnisse und tatsächlich gehaltene eigene analoge/digitale Präsentation | `38e30bb9-6145-5da0-80b8-36e3c45e15d0`, `99d41b0f-e958-54cf-a077-9bed1704a303` |
| `ab315f52-a9e3-5c1c-a404-7fb1a96a3eaf` | Q3-Protolyse/Analytik: eigene theoriegestützte Frage/Hypothese, selbst gewählte qualitative **und** quantitative Analyse, betreute reale Durchführung, eigene Rohdaten, mathematische/digitale Auswertung und Prozessreflexion | `503dedcb-0efc-5e6b-bbc9-20761a0951f5`, `f79f15c0-e848-5e17-9eb5-26753d35c93b`, `9e3fae29-84d5-5600-bfb3-82d49ea3f1b5`, `99d41b0f-e958-54cf-a077-9bed1704a303` |
| `7bfe515c-e59f-521c-9781-b75e33caf0ec` | Oberstufen-Prozessmodul: alle vier vollständigen Modellfamilien einschließlich Rezeptor **und** Enzym, eigene analoge/digitale Produkte und Modellprüfung, Grenzen/Weiterentwicklung und tatsächliche Präsentation | `86d34f1f-692d-5522-a9a4-a71c65b24de7`, `38e30bb9-6145-5da0-80b8-36e3c45e15d0` |
| `b406eff8-3cd9-551b-a913-c6dda7223645` | BY, lokales Q4-Nachhaltigkeitsmodul: alle fünf Gültigkeitskriterien mit belastbarem Gegenbefund vs. Messfehler, historische/heutige Wirkungen, ökologische/ökonomische/soziale Bewertung und eigenes Handeln | `a0080b5f-13ff-56bc-b8ff-2ff6273e2ec1`, `9f892457-c4e5-56da-830c-bf6cac0c98d7` |
| `eed5eda3-2daf-5d48-b935-23dadd622d9b` | **Separater C11-HOLD**: sechs konkrete Einflüsse auf chemische Wissensentwicklung, historische Perspektive und empirische Gültigkeit vs. Zustimmung | `e5a5dcd8-053c-55fd-b5c7-bba93779da53` |

Der neue Sek-I-Modulcluster hat ID `b86d12c6-8b84-53c6-b1f9-26ba7728b411`. Er nimmt keine deutschlandweite Jahrgangsplatzierung vor. Prozesskompetenzzweige sind nach AGENTS 6.3 zulässig; Q3/Q4 sind die lokal begründeten Aufgabenzuordnungen im bestehenden Raster und keine neuen amtlichen Quellenbelege. Der Modellzweig bleibt bewusst phasenübergreifend, weil das vollständige aktuelle Ziel mehrere Unterrichtsgebiete nennt. Er wird nicht durch eine beliebige Rechenprüfung ersetzt.

## Ganze Ziele, Quelle und Route

Alle neun bestehenden Zielkörper sind vollständig **unverändert** erhalten. Von den 511 Eingangszielen bleiben 507 exakt; vier bestehende Cluster erhalten ausschließlich neue `contains`-Kinder: Chemie-Wurzel, Übungen Q3, Übungen Sekundarstufe II Chemie und Übungen Q4. Es werden keine bestehenden Aufgaben um fremde `requires` ergänzt und keine alten fest angeleiteten BW-Praktika als selbst geplante Forschung umgedeutet. Jeder neue Examensknoten hat `requires` **identisch** zu `examData.coveredGoalIds`, jeweils entsprechend seiner tatsächlichen Aufgabe. Bestehende Bilder und deren Ressourcenreferenzen bleiben exakt erhalten; dekorative Prüfungsbilder wurden nicht erzeugt.

Die [ganzen Vorher-/Nachher-Zielkörper und Routenbegründungen](author/nine-whole-goals-and-terminal-rationales.json) sowie die [vier ganzen Clusteränderungen](author/four-existing-parent-changes.whole-before-after.json) sind die Autorenübergabe. Die neun wörtlich übernommenen bestehenden Source24-Kinderentscheidungen und 21 Partneroperatoren stehen in [den gebundenen Eingabeauszügen](inputs/nine-frozen-source-scope-extracts.exact.json). Sie sind **bestehender Input**, kein neuer Autoren-Source-Review. Alle Quellenpartner bleiben begrenzt und partiell. Experiment/Modell-Alternativen in amtlichen Partnern werden nicht umgeschrieben; das ganze aktuelle Experimentziel wird im Entwurf tatsächlich experimentell geprüft.

`e5a5dcd8` hat nur `C11.1.11`, `sourceCourseLevel=unspecified`, keine expliziten Scope-Keys und **P unselected**. Deshalb ist sein neuer Entwurf separat, behält die Jahrgang-11-Evidenz, erhält keine GK-/LK-Kurszuweisung und trägt `HOLD_UNSPECIFIED_C11`. Weder G9 noch J11 noch technische Tags des bestehenden Ziels lösen den Kurs-HOLD. Historische Perspektive und empirische Gültigkeitstrennung sind didaktische Operationalisierungen des aktuellen Gesamtziels; sie werden nicht als wörtliche vollständige C11-Quelle ausgegeben. C12/13-Aufgaben liefern keinen C11-Proxy.

## Tatsächliche technische Prüfung und offene Gates

Der **unveränderte vollständige aktuelle** normale Evaluator (`generateCurriculumQualityStatus.ts`, SHA-256 `6573cddd37778f22aa993ecbf0dacb72cf945c0979dfdd4b63556982555a338b`) wurde über seinen vorhandenen reinen technischen Export gelesen. Das bestehende native Capsule wurde **nicht verändert**. Mit dessen unverändertem Vor-Terminal-Applicability-/Composition-Kontext ergeben sich:

- DAG und explizite Typen: **PASS**; 517 eindeutige IDs.
- CQR-101 für den ganzen übergebenen Graphen: Motivation **0→0**, fehlende terminale Pfade **9→0**, **PASS**.
- CQR-202: **FAIL**, ausschließlich wegen `reviewStatus=needs_review` für die vier neuen Oberstufenprüfungen. Kein Platzhalter-/Scoring-/Text-Fehler. Dieser echte Freigabe-HOLD bleibt erhalten.
- CQR-203: **WARN**, die neuen Prüfungen sind nicht veröffentlicht.
- Kind-Entscheidungen: **8 bestehende Fingerprints stale** (die früheren vier plus die vier neuen Clusterkontexte), **6 neue Ziele ohne aktuelle Entscheidung**. Kein Fingerprint wurde umetikettiert.
- Normale gezielte JSON-Prüfung und explizites Runtime-Schema: **PASS**; zwölf Eingabebindungen exakt, keine Symlinks oder ignorierten Paketdateien.

Die vollständigen normalen Vorher-/Nachherberichte stehen in [normal-whole-graph-route-kind-and-release.actual.json](checks/normal-whole-graph-route-kind-and-release.actual.json); Terminalprozesse und Exitcodes stehen daneben. Der vorhandene Applicability-/Composition-Kontext wurde **nicht** für 517 neu erzeugt. Diese Prüfung ist daher kein aktueller nativer Seiten-/Projektionsnachweis und kein Gesamt-M6/M7-Ergebnis.

Zwei anfängliche Hilfsfehler sind unverändert protokolliert: fehlendes eigenes Check-Ausgabeverzeichnis beim ersten Schema-Lauf und eine fälschlich erwartete CQR-202-PASS-Assertion trotz echter `needs_review`-Sperre. Danach wurden nur diese technischen Assertions/Ausgabevoraussetzungen korrigiert; Prüfungsstatus, Regeln, Schwellen und Zielauswahl blieben streng. Die zweiten Prozesse endeten jeweils mit Exit **0**, während die normalen Draft-HOLD-Regeln ausdrücklich nicht bestanden sind.

Offen bleiben unabhängige aktuelle D-/P-/Kontext- und Assessment-Prüfungen einschließlich der geänderten Eltern, genuine Kind-Entscheidungen, native aktuelle Applicability-/Composition-/Seitenreproduktion, source-scoped Sichtbarkeit, die amtliche C11-Kursplatzierung und eine wahrheitsgemäße spätere Beurteilung eigener praktischer/kommunikativer Leistungsbelege. Die aktuellen Textentwürfe verlangen ausdrücklich vollständige eigene Durchführung/Präsentation; die vorhandene reine Punkteschwelle beweist solche Leistungen nicht. Vor einer späteren Freigabe muss geprüft werden, wie der komplette Beleg im bestehenden Bewertungsablauf tatsächlich vorliegt. Es wurde keine Lernendenleistung behauptet oder ein Runtime-/Plugin-Ablauf verändert.

## Herkunft und Rechte

Aufgaben, Lösungen und Wissenslandschaftskandidaten: SkillPilot, **CC-BY-4.0**. Technische Prüf-/Assemblerdateien: **Apache-2.0**. Die historischen Kurzangaben stützen sich auf [BASF, Unternehmenschronik 1913](https://www.basf.com/global/en/who-we-are/history/chronology/1902-1924/1913); der zeitgebundene Nachhaltigkeitskontext stützt sich auf [IEA, *Ammonia Technology Roadmap* (2021)](https://www.iea.org/reports/ammonia-technology-roadmap) und deren [Executive Summary](https://www.iea.org/reports/ammonia-technology-roadmap/executive-summary), IEA CC-BY-4.0. Die eigenen kurzen Paraphrasen enthalten keine vollständigen Quellentexte. Sämtliche Modell-/Mess-/Entscheidungswerte sind ausdrücklich konstruierte didaktische Daten; keine reale Messung oder Empirie wird erfunden. Rechte oder Quellenfreigaben Dritter werden nicht neu vergeben.
