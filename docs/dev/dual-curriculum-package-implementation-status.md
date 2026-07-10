# Dual Curriculum Package Implementation Status

- Stand: 2026-07-10
- Zielbild: [Duale Curriculum-Pakete: JSON-Runtime und Lehrplan-Ontologie](../concept/curriculum-graph/dual-curriculum-package-releases.md)
- Aktuelle Phase: `P0 – Verträge festschreiben`
- Nächster Schritt: `DPK-003 – Feldsemantik, Normalform und Äquivalenzverträge`
- Letzter abgeschlossener Schritt: `DPK-002 – Runtime-/Schema-Katalog und Readiness-Auswertung`
- Solider Ausgangsstand dieses Schritts: `bc9d27f2` (`DPK-001`), vollständiges `./run_ci.sh` am 2026-07-10 grün
- Blocker: keine

Diese Seite ist das kurze, gepflegte Workboard für die Umsetzung. Das Konzeptdokument bleibt die Quelle für Zielarchitektur und endgültige Abnahmekriterien; Git-Historie und CI-Artefakte ersetzen ein langes Umsetzungstagebuch.

## Auf einen Blick

| Phase | Angestrebtes Ergebnis | Status | Nächster Gate |
| --- | --- | --- | --- |
| P0 | Versionierte, ausführbar geprüfte Paket-, Profil- und Äquivalenzverträge | `in_progress` | DPK-003 vollständig grün und committed |
| P1 | JSON-Paket als hermetischer SkillPilot-Runtime-Input | `not_started` | Mathematik package-only laden |
| P2 | Fachübergreifendes Core-first Ontologieformat mit Reverse Compiler | `not_started` | Mathematik ohne Original-JSON rekonstruieren |
| P3 | Gemeinsamer `contentDigest` und Dual-Release-Gate | `not_started` | Manipulationen beider Varianten sicher erkennen |
| P4 | Generalisierung über Mathematik hinaus | `not_started` | Physik und ein sprachliches Fach bestehen |
| P5 | Signierter Package-Betrieb und Veröffentlichungskatalog | `not_started` | atomare Stable-Promotion und Rollback |
| P6 | Trennung von Curriculum-Erstellung und SkillPilot-Software | `not_started` | Software benötigt keinen produktiven Curriculum-Quellbaum |

Statuswerte: `not_started`, `in_progress`, `complete`, `blocked`, `deferred`. Es ist höchstens ein Schritt gleichzeitig `in_progress`.

## Abgeschlossener Schritt: DPK-002

Ziel ist die paketlokale, vollständig explizite Discovery- und Schemaauflösung sowie eine Readiness-Aussage, die Legacy-Erfolge nicht mit Standalone-Fähigkeit verwechselt.

Scope:

- strikter Runtime-Katalogvertrag für Root-Landschaften, interne Rollen, angebotene Scopes, kompilierte View-Auflösung, Decks, Ressourcen, Capabilities und Dependency-Verweise;
- paketlokaler Offline-Schema-Katalog als gehashte Resolver-Tabelle ohne Remote-Fetch oder paketgesteuerte Trust Root;
- vier byte-, hash-, rollen- und größengebundene Bootstrap-Verträge sowie explizite `validationSchemaId`-Zuordnung der beiden Katalogartefakte;
- versionierte Readiness-Policy und Report-Schema mit fail-closed Pflichtchecks;
- unabhängiger Evaluator, der heutige Subject-Exports ausdrücklich als `not-ready-legacy`, partielle Zielclaims als `invalid`, fremde Verträge als `unsupported` und formal erkennbare, aber noch nicht vollständig bewiesene Zielkandidaten als `not-ready-incomplete` klassifiziert;
- positive und gezielt negative Vertrags-Fixtures sowie lokale und gehostete CI-Gates;
- echte ZIP-Sicherheits-, Manipulations-, Policy-, Forgery-, Ressourcenlimit- und Exitcode-Tests;
- ZIP-hashgebundene Readiness-Berichte, aus denen Legacy-Validator, Publikationsindex und finales Release-Gate ihre Zielaussage ableiten.

Bewusste Nicht-Ziele dieses Schritts:

- noch keine Ausgabe eines `full-standalone-v1`-ZIPs durch den Subject-Exporter;
- noch keine Migration aller Landschafts-, View-, Karten-, Ressourcen-, Closure- und Migrationsschemas in den öffentlichen Offline-Katalog;
- noch keine vollständige Schema-/Semantikvalidierung aller Runtime-Payloads, semantische Digestberechnung oder transitive Closure-Prüfung;
- noch kein Package Loader und kein hermetischer Consumer-Smoke-Test;
- bewusst keine künstliche `ready`-Fixture, solange diese Gates fehlen.

Abnahme:

- Runtime- und Schema-Katalog bestehen ihre strikten Schemas und semantischen Referenzprüfungen;
- Schema-Auflösung erfolgt ausschließlich gegen vorab gehashte Paketdateien und benötigt kein Netzwerk;
- Duplicate Keys, IDs/Pfade/Hashes, Limits, unbekannte Referenzen und unvollständige Katalogabdeckung sind negativ getestet;
- heutige Legacy-Manifeste bleiben trotz grüner Legacy-QS `not-ready-legacy`;
- ein partieller Zielclaim kann niemals als Legacy zurückgestuft werden;
- ein formal korrekter Zielvertrag ohne spätere Pflichtgates bleibt `not-ready-incomplete`;
- gezielte Vertragsprüfungen und anschließend `./run_ci.sh` sind grün;
- der geprüfte Stand wird als eigener Git-Commit festgehalten.

## Abgeschlossener Schritt: DPK-001

Ziel ist eine vertrauenswürdige Vertragswurzel für spätere JSON-Runtime- und Ontologiepakete.

Scope:

- striktes JSON Schema für das JSON-Runtime-`package-manifest` v1;
- maschinenlesbares Profil `full-standalone-v1` mit erlaubten Rollen und Cardinalitäten;
- positive und gezielt negative Conformance-Fixtures;
- unabhängiger Validator für Schema, Profil, Pfade, Digestformate, Vertragsbindungen, Rollen, Lizenzauflösung, Größen- und Archivgrenzen sowie Asset-Redistribution;
- Ausführung dieses Validators in `./run_ci.sh` und den betroffenen GitHub-Workflows;
- diese zentrale, aus den relevanten Doku-Indizes verlinkte Statusseite.

Bewusste Nicht-Ziele dieses Schritts:

- heutige Subject-Exportpakete werden noch nicht als `full-standalone-v1` ausgegeben;
- noch kein Runtime-Katalog, Package Loader oder berechneter/verifizierter `contentDigest`; das Manifest reserviert das Digestfeld bereits als verpflichtenden Vertragspunkt;
- noch keine eingebettete Cross-Subject-Closure;
- noch kein FWU-OWL-Manifest/-Profil, öffentliches Ontologie-ZIP oder Release-Index.

Diese Grenze ist fachlich wichtig: Das heutige Physikpaket deklariert externe Mathematikziele, enthält ihre Definitionen aber noch nicht. DPK-001 darf deshalb keine Standalone-Fähigkeit vortäuschen.

Abnahme:

- das Schema ist Draft-2020-12-gültig und strikt;
- die gültige Fixture besteht;
- jede ungültige Fixture scheitert aus dem erwarteten, einzeln geprüften Grund;
- der Validator verwendet das vertrauenswürdige Repository-Schema, nicht unbesehen eine Schemakopie aus einem Paket;
- vorhandene Legacy-Exporter und -Validatoren bleiben unverändert funktionsfähig;
- gezielte Vertragsprüfungen und anschließend `./run_ci.sh` sind grün;
- der geprüfte Stand wird als eigener Git-Commit festgehalten.

## Erreicht

| Schritt | Ergebnis | Qualitätsnachweis | Abschluss |
| --- | --- | --- | --- |
| DPK-000 | Bestehenden Export, Roundtrip, Runtime-Kopplungen und neues FWU-Core-Profil analysiert; Zielkonzept beschlossen | Roundtrip- und Doku-Gates; Baseline `./run_ci.sh` auf `0d419930` grün | 2026-07-10 |
| DPK-001 | Strikten JSON-Manifest-/Profilvertrag v1 mit ausführbarer Conformance-Matrix und lokalen wie gehosteten CI-Gates eingeführt | Vertragsvalidator: 1 gültige Fixture und 39 gezielte Negativfälle; vollständiges `./run_ci.sh` lokal, Exit 0 | 2026-07-10 |
| DPK-002 | Explizite Runtime-Discovery, offline und vertrauenswürdig gebundene Schemaauflösung sowie fail-closed Readiness-Klassifikation eingeführt; Legacy-ZIPs bleiben nachweisbar nicht standalone | Manifest 1/49, Runtime 1/31 + 8 Bindings, Schema-Katalog 1/34 + 12 Bindings, Readiness-Adversarialmatrix, realer Latein-Publikationspfad 37/37; vollständiges `./run_ci.sh` lokal, Exit 0 | 2026-07-10 |

## Verbleibende Roadmap

| ID | Phase | Ergebnis | Abhängigkeit | Status |
| --- | --- | --- | --- | --- |
| DPK-001 | P0 | JSON-Manifest-/Profilvertrag v1 und Conformance-Validator | DPK-000 | `complete` |
| DPK-002 | P0 | Runtime-Katalogschema, paketlokaler Offline-Schema-Katalog, Artefaktrollen und ehrliche Readiness-Auswertung | DPK-001 | `complete` |
| DPK-003 | P0 | Feldsemantik-/RDF-Mappingregistry, versionierte Normalform sowie Release-Index-/Äquivalenzreport-Schemas | DPK-001 | `not_started` |
| DPK-004 | P0 | Closure-, Ownership-, Konflikt- und Migrationsverträge; verlustfreie Mathematik-Conformance-Kompilation in das neue Release-Modell | DPK-002–DPK-003 | `not_started` |
| DPK-005 | P1 | Mathematik-JSON-Paket nach `full-standalone-v1` bauen und strikt validieren | DPK-002–DPK-004 | `not_started` |
| DPK-006 | P1 | Manifestbasierter Backend-Package-Loader mit lokalem Store und Lock | DPK-005 | `not_started` |
| DPK-007 | P1 | Package-only Mathematik-Smoke-Test einschließlich Views, Karten und Bildern | DPK-006 | `not_started` |
| DPK-008 | P2 | FWU-OWL-Manifest/-Profil, Ontologie-Exporter und Reverse Compiler auf Paketverträge umstellen | DPK-003–DPK-005 | `not_started` |
| DPK-009 | P3 | Semantischer Digest, Äquivalenzreport und reproduzierbares Variantenpaar | DPK-008 | `not_started` |
| DPK-010 | P4 | Physik-Closure und fachübergreifende Profile | DPK-004, DPK-009 | `not_started` |
| DPK-011 | P5 | Signierter Release-Index, Distributionskatalog und atomare Promotion | DPK-009–DPK-010 | `not_started` |
| DPK-012 | P6 | Curriculum-Toolchain und Inhalte aus dem Software-Repository lösen | DPK-007, DPK-011 | `not_started` |

Die IDs strukturieren solide, einzeln commitbare Schritte. Sie ersetzen nicht die detaillierten Phasen und Abnahmekriterien im Zielkonzept.

## Qualitätsnachweise

| Stand | Gezielte Prüfungen | Vollständige CI | Ergebnis |
| --- | --- | --- | --- |
| Baseline `0d419930` | vorhandene Doku- und Roundtrip-Prüfungen | `./run_ci.sh`, lokal, 2026-07-10, Exit 0 | `passed` |
| DPK-001 | Vertragsvalidator (1 gültige Fixture, 39 Negativfälle), Workflow-Syntax, Doku-Links und Diff-Check | `./run_ci.sh`, lokal, 2026-07-10, Exit 0 | `passed` |
| DPK-002 | Manifest 1/49; Runtime 1/31 + 8 Bindings; Schema-Katalog 1/34 + 12 Bindings; Readiness: 5 Manifest-, 4 Policy-Tamper-, 5 Forgery-, 3 Raw-JSON-, 7 adversariale ZIP-, 2 Early-Limit- und 10 Exitcode-Fälle; realer Latein-Build/Validator/Repro/Index 37/37; Lint, TypeScript, Doku, Workflow-YAML und Diff-Check | `./run_ci.sh`, lokal, 2026-07-10, Exit 0 | `passed` |

Rohlogs und temporäre Artefakte bleiben unter `tmp/` oder in CI-Artefakten und werden nicht in dieser Seite dupliziert.

## Pflege- und Commit-Konvention

- Ein Schritt wird erst `complete`, wenn seine gezielten Prüfungen und danach das vollständige `./run_ci.sh` bestanden haben.
- Nach erfolgreicher Qualitätssicherung wird genau dieser abgegrenzte Stand committed.
- Schlägt ein Gate fehl, bleibt der Schritt `in_progress`; es gibt keinen Zwischencommit mit nur teilweise erfüllter Abnahme.
- Vor dem finalen CI-Lauf eines Schritts werden diese Tabellen bereits auf den erwarteten Abschlussstand gesetzt. Der Commit erfolgt nur, wenn der Lauf tatsächlich grün bleibt.
- Der nächste Schritt beginnt erst auf dem sauberen Commit des vorherigen Schritts.
- Maschinenlesbare paketbezogene Readiness-Berichte bleiben temporäre Build-/CI-Artefakte unter `tmp/exports/readiness/`; diese authored Seite bleibt die Quelle für Arbeitsstand und Priorisierung.
