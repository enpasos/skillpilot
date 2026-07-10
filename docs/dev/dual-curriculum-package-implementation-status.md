# Dual Curriculum Package Implementation Status

- Stand: 2026-07-10
- Zielbild: [Duale Curriculum-Pakete: JSON-Runtime und Lehrplan-Ontologie](../concept/curriculum-graph/dual-curriculum-package-releases.md)
- Abgeschlossene Phase: `P0 – Verträge und vollständiges Mathematik-Release-Modell`
- Nächste Phase: `P1 – JSON-Paket als hermetischer Runtime-Input`
- Nächster Schritt: `DPK-005 – Mathematik-JSON-Paket nach full-standalone-v1 bauen und strikt validieren`
- Letzter fachlich abgeschlossener Schritt: `DPK-004b / DPK-004 – Publikations-Evidenz und vollständige Mathematik-Conformance`
- Solider Ausgangsstand: `DPK-004b / DPK-004`, vollständiges `./run_ci.sh` am 2026-07-10 grün
- Abschluss-Gate für den DPK-004b-Commit: gezielte QS und vollständiges `./run_ci.sh` grün
- Blocker: keine

Diese Seite ist das kurze, gepflegte Workboard für die Umsetzung. Das Konzeptdokument bleibt die Quelle für Zielarchitektur und endgültige Abnahmekriterien; Git-Historie und CI-Artefakte ersetzen ein langes Umsetzungstagebuch.

## Auf einen Blick

| Phase | Angestrebtes Ergebnis | Status | Nächster Gate |
| --- | --- | --- | --- |
| P0 | Versionierte, ausführbar geprüfte Paket-, Profil- und Äquivalenzverträge samt vollständigem Mathematik-Conformance-Modell | `complete` | abgeschlossen; DPK-005 beginnt P1 |
| P1 | JSON-Paket als hermetischer SkillPilot-Runtime-Input | `not_started` | Mathematik package-only laden |
| P2 | Fachübergreifendes Core-first Ontologieformat mit Reverse Compiler | `not_started` | Mathematik ohne Original-JSON rekonstruieren |
| P3 | Gemeinsamer `contentDigest` und Dual-Release-Gate | `not_started` | Manipulationen beider Varianten sicher erkennen |
| P4 | Generalisierung über Mathematik hinaus | `not_started` | Physik und ein sprachliches Fach bestehen |
| P5 | Signierter Package-Betrieb und Veröffentlichungskatalog | `not_started` | atomare Stable-Promotion und Rollback |
| P6 | Trennung von Curriculum-Erstellung und SkillPilot-Software | `not_started` | Software benötigt keinen produktiven Curriculum-Quellbaum |

Statuswerte: `not_started`, `in_progress`, `complete`, `blocked`, `deferred`. Es ist höchstens ein Schritt gleichzeitig `in_progress`.

## Abgeschlossener Teilschritt: DPK-004b

Ziel ist die vollständige, verlustfreie Mathematik-Conformance-Kompilation: Neben den Runtime-Artefakten aus DPK-004a werden jetzt auch die veröffentlichungsrelevanten Mappings, amtlichen Quellen, SourceGoal-Belege und Quality-Entscheidungen strikt projiziert und in denselben fachlichen `contentDigest` aufgenommen.

Die Paketrolle bleibt generisch und konsumierbar; die spezifischere `normalizationRole` wählt das geschlossene Payload-Schema und die Feldsemantik:

| Paketrolle | `normalizationRole` | Output | `contentDigest` | Runtime-Closure |
| --- | --- | --- | --- | --- |
| `mapping` | `source-to-canonical-mappings` | `data/mappings/source-to-canonical.json` | enthalten | ausgeschlossen |
| `source-index` | `official-source-index` | `data/sources/source-index.json` | enthalten | ausgeschlossen |
| `source-goal-reference-index` | `source-goal-reference-index` | `data/sources/source-goal-references.json` | enthalten | ausgeschlossen |
| `quality-evidence` | `release-quality-evidence` | `metadata/quality/release-quality-evidence.json` | enthalten | ausgeschlossen |

Diese Trennung ist absichtlich: Publikations-Evidenz gehört zur fachlichen Identität und muss den JSON↔OWL-Roundtrip bestehen, ist aber kein navigations- oder frontier-relevanter Runtime-Input. Der reale Closure-Report enthält deshalb keine der vier Publikationsrollen, weiterhin aber die vollständigen 2.402 Runtime-Definitionen und 18.815 harten/weichen Referenzrecords.

Realer Publikationsnachweis:

| Bereich | Geprüfter Umfang und Entscheidung |
| --- | --- |
| Mapping-Truth | 31 Collections, 10.021 autoritative Review-Entscheidungen und 33.382 daraus projizierte `exact`-/`partial`-Kanten |
| Review-Mappingzeilen | 33.334 Kanten; 48 autoritative Entscheidungskanten fehlen dort, 23 explizite Decision-vs-Row-Konflikte werden zugunsten der Decision aufgelöst und 2.599 nicht auf Decision-Ebene typisierte Kanten erhalten ihren edge-spezifischen Reviewwert; 0 bleiben unaufgelöst |
| Legacy-Mappings | 2.539 Zeilen bleiben Rückwärtskompatibilitäts-/Auditmaterial; 695 Source-IDs liegen außerhalb historischer Membership, 8 Ziele hängen; keine Legacy-Zeile wird Mapping-Truth |
| Amtliche Quellen | 31 Source Collections, 52 Curriculum-Dokumente, 3 amtliche Zusatzdokumente, 9.977 Source Goals und 16 Jurisdiktionen |
| Quality-Evidence | 754 Atomicity-, 754 Memory-Goal-, 64 aktive Karten- und 756 aktive Visualisierungsentscheidungen, zusammen 2.328 veröffentlichte Entscheidungen; Atomic-Scope 754, davon 1 ohne aktives Bild |
| Visualisierungsfreigabe | 136 human-approved, 620 aktive Reviews offen und 1 Atomic Goal ohne Bild; deshalb ehrlich `publicationStatus: not-ready` |

Die Feldregistry umfasst 454 Regeln: 323 Runtime-Regeln, 130 Regeln für die vier Publikationsnormalformen und einen historischen generischen Eintrag. Eine hashgebundene Rollentabelle typisiert 52 tatsächliche Curriculum-Dokumente als Core-`Lehrplan` und drei amtliche Zusatzdokumente als `sp:OfficialSourceDocument`; unbekannte, ungenutzte oder widersprüchliche Rollen scheitern fail-closed. Source Goals verwenden konservativ Core-`Curriculares Element`, Source→Canonical-Kanten Core-`CE-Verweis`; nur `exact`/`partial` benötigt eine kleine SkillPilot-Erweiterung. Quality-Evidence bleibt vollständig Anwendungsevidenz und erzeugt keine falschen Core-Aussagen.

Der reale Kandidat `org.skillpilot.curriculum.de.gymnasium.mathematik@0.1.0-conformance.2` verwendet das Publikationsprofil `1.1.0`. Sein Inhaltsindex umfasst 111 logische Artefakte plus 756 Binärrecords und ergibt:

`sha256:3b44444b50b41f45ec1cb12d4d912a4524effe9d560d539788cfe36d4d7ffc60`

Die fail-closed Scalar-Prüfung hat dabei reale PDF-/OCR-Altlasten gefunden: C0-Steuerzeichen und nicht gepaarte UTF-16-Surrogate wurden in den Authoring-Quellen bereinigt. Die Release-Kompilation akzeptiert solche Werte nicht und ersetzt sie nicht stillschweigend durch Surrogate oder bereinigte Texte.

Die 9.977 SourceGoal-Records sind eine verlustfrei veröffentlichte, reviewte und quellennahe Authoring-Projektion, keine pauschale Behauptung wortgleicher PDF-Zitate. Der aktuelle Bestand enthält weiterhin OCR-/Transliterationsschuld; 484 `sourceText`-Werte sind im jeweiligen authored Passage-Carrier nicht als zusammenhängender, whitespace-normalisierter Text selbstverifizierbar. Vor einer Release-Promotion bleibt deshalb eine eigene Source-Verification-QA-Lane offen, auch wenn JSON↔OWL den veröffentlichten Wortlaut bereits exakt erhält.

Gezielte QS:

- Compiler und unabhängiger Validator rekonstruieren und prüfen alle vier Publikationsartefakte getrennt;
- 9 gültige Fixture-Dokumente, 22 gezielte Negativfälle und 47 benannte Produktions-/Adversarialtests sind grün;
- zwei Realbuilds liefern denselben Dateibaum, dieselben 111+756 Inhaltsrecords und denselben `contentDigest`;
- unbekannte oder nicht beobachtete Feldklassifikationen, Mapping-Truth-Abweichungen, Legacy-Leakage, falsche Counts, Source-Join-Verlust, Quality-Fingerprint-/Asset-Abweichungen und Publikationsrollen in der Runtime-Closure scheitern fail-closed;
- das vollständige `./run_ci.sh` ist auf dem final dokumentierten Stand grün.

Bewusste Grenze: DPK-004 erzeugt weiterhin ein entpacktes Conformance-Modell, kein installierbares ZIP. Manifest, paketlokaler Schema-Katalog, Lizenzen, komplettes Dateiinventar, Bildmaterialisierung und fertige Archivprüfung beginnen mit DPK-005.

## Abgeschlossener Teilschritt: DPK-004a

Ziel ist ein reales, strikt validiertes und reproduzierbares Mathematik-Release-Modell zwischen Authoring-Quellen und späterem ZIP. Dieser Teilschritt beweist die Runtime-relevante Kompilation zunächst als entpackten Verzeichnisbaum unter `tmp/`; er behauptet ausdrücklich noch keine Paket-Readiness.

Scope:

- strikte, geschlossene Payload-Schemas für kompilierte Landschaften, Composition Views samt Index, Kartendecks samt Index und den Ressourcenindex;
- versionierte Verträge für typisierte Definitionsdigests, harte Referenz-Closure, Ownership und eingebettete Fragmente, Definitionkonflikte sowie Goal-Migrationen mit fail-closed Mastery-/History-Policy;
- ein explizites Mathematik-Buildprofil sowie ein selbst hash- und Namespace-hash-gebundenes Core-first Ontologieprofil, das Repository, Checkout, FWU-Core-IRI, Commit, Quellpfad und Datei-Hash bindet und alle verwendeten Core-Terme gegen die gepinnten OWL-Bytes prüft;
- eine fachlich geprüfte, fingerprint-gebundene Semantic-Kind-Ledger statt Titel-, ID- oder Pfadheuristiken: 1.079 Ziele sind vollständig als curriculare Atome/Bereiche, Programmstruktur, Übung/Assessment, Memory, Orientierung oder Runtime-Support klassifiziert;
- vollständige Feldsemantik für die in diesem Teilschritt kompilierten Runtime-Rollen einschließlich `none`, Identität, harter und weicher Referenzsemantik;
- deterministische Mathematik-Kompilation mit expliziten Pfadumschreibungen, ohne basename-basierte Kollisionen, sowie paketpfadneutralem semantischem Inhaltsindex;
- lexikalisch abgesicherter Output strikt unter `tmp/`, privater Staging-/Rename-Promotion und Regressionstests gegen direkte wie über Elternpfade eingeschleuste Symlink-Ziele;
- Fixpunkt-Closure über alle als hart registrierten Referenzen, kanonische Definitions- und Closure-Digests, Konfliktprüfung und initiales, leeres Migrations-Baseline-Artefakt;
- vollständige Runtime-Discovery über Katalog, View- und Card-Index; referenzierte Assessment-Quellen werden in paketlokale Zielpfade kopiert;
- alle aktiven Bildreferenzen werden als Binärrecords mit Bytezahl und SHA-256 in den gemeinsamen `contentDigest` aufgenommen; externe Tool-Links bleiben explizite, nicht runtime-erforderliche Ressourcen;
- unabhängige Modellvalidierung, reproduzierbarer Doppelbuild, fünf ausführbare Release-Modell-Fixtures mit acht Mutationen, eine Compiler-Emissionsprobe und 25 benannte Selbsttests einschließlich Programmstrukturzyklen, Sonderdatei-Ablehnung und des schema-kompatiblen Felds `kompetenzen`.

Realer Mathematik-Nachweis:

| Inhalt | Geprüfter Umfang |
| --- | ---: |
| Landschaften / Ziele | 1 / 1.079 |
| Program Units / Goal Placements / Kompetenzkatalogeinträge | 14 / 249 / 6 |
| Composition Views | 88 |
| Kartendecks / Karten | 12 / 128 |
| Ressourcenlinks | 825 |
| eingebettete Bilder / Bildbytes | 756 / 1.695.291.325 |
| externe Ressourcen | 69 |
| ungelöste harte Referenzen / externe Runtime-Abhängigkeiten / Definitionskonflikte | 0 / 0 / 0 |

Bewusste Nicht-Ziele dieses Teilschritts:

- der Output ist noch kein `full-standalone-v1`-ZIP: Paketmanifest, paketlokaler Schema-Katalog, vollständiges Dateiinventar, Lizenzen, Checksummendatei und fertige Archivgrenzen folgen in DPK-005;
- die 756 Bilder werden in DPK-004a gehasht und semantisch gebunden, aber noch nicht in den entpackten Output kopiert; die ZIP-Materialisierung folgt in DPK-005;
- Mapping-, Quellen- und Quality-Evidenz waren bewusst auf DPK-004b verschoben und sind dort inzwischen vollständig klassifiziert und kompiliert;
- noch kein FWU-OWL-Exporter, isolierter Ontologie-Reverse-Compiler oder öffentlicher Dual-Release-Äquivalenznachweis;
- noch kein Package Loader und kein hermetischer SkillPilot-Consumer-Test.

Abnahme:

- das reale Mathematikprofil kompiliert exakt den oben ausgewiesenen Umfang in alle strikten Runtime-Artefakte;
- unbekannte Felder, veraltete Semantic-Kind-Fingerprints, falsche Digests, fehlende Ziele, Views, Karten oder Bilder, ungelöste harte Referenzen, fremde Runtime-Abhängigkeiten und widersprüchliche Definitionen scheitern fail-closed;
- zwei unabhängige Builds liefern denselben semantischen Inhalt und denselben Dateibaum;
- gezielte Prüfungen und anschließend `./run_ci.sh` sind grün;
- der geprüfte Stand wird als eigener Git-Commit festgehalten.

Die strikte Closure-Prüfung hat dabei zwei bislang unentdeckte Altlasten im Authoring-Bestand sichtbar gemacht und im selben grünen Schritt bereinigt: ein `goalPlacement` auf einen bereits entfernten Prozesskompetenz-Cluster sowie zehn kanonische Mathematik-Decks mit einer veralteten Landscape-ID.

Details zu Output, Grenzen und QS: [Curriculum Release Model Conformance](../qa-ci/curriculum-release-model-conformance.md).

## Abgeschlossener Schritt: DPK-003

Ziel ist ein ausführbarer, fail-closed Vertrag dafür, wann JSON- und FWU-OWL-Variante fachlich gleich sind und wie beide von einem gemeinsamen Release-Index gebunden werden.

Scope:

- striktes Schema und versionierte Baseline-Registry für Feldklassen, Kardinalität, Sprache, Missing-/Null-/Default-Semantik, dynamische Map-Keys, Normalisierung, Core-first RDF-Abbildung und exakte Reverse-Abbildung;
- verbindliche Ordnungssemantik mit expliziten RDF-Positionen für Goals, direkte `contains`-/`requires`-Kanten, Resource Links, Composition-View-Kinder, Karten und Scoring-Schritte;
- begrenzte, begründete `registered-canonical-json-literal`-Lanes statt eines vollständigen JSON-Landschaftscarriers;
- versioniertes Normalisierungsprofil und semantischer Inhaltsindex, der logische Artefakte sowie Bild-/Binärressourcen paketpfadneutral in einen gemeinsamen `contentDigest` überführt;
- strikte Schemas für Äquivalenzreport und externen Dual-Release-Index einschließlich FWU-Core-, Toolchain-, Feldabdeckungs-, Graph-/View-/Card-/Asset-, Ontologie-, Consumer-, Reproduzierbarkeits-, Provenienz- und Signaturbindung;
- unabhängiger Validator mit positiven Fixtures, Hash-/Cross-Binding-Prüfung, Digest-Neuberechnung und adversarialer Mutationsmatrix;
- lokale und gehostete CI-Integration sowie zentrale QA-Dokumentation.

Bewusste Nicht-Ziele dieses Schritts:

- die 17 Registry-Einträge frieren die kritischen Mappingfamilien und Ordnungsentscheidungen ein; die vollständige Abdeckung aller heute kompilierten Mathematikfelder entsteht erst in DPK-004;
- die positiven Dual-Release-Fixtures sind synthetische Conformance-Beispiele und kein realer Curriculum-Release;
- noch kein produktives JSON- oder FWU-OWL-ZIP, kein produktiver `contentDigest`, kein FWU-OWL-Paketmanifest und kein isolierter Reverse Compiler;
- bestehende Legacy-Roundtrip-Berichte bleiben Evidenzquellen und werden nicht als neuer Äquivalenzreport ausgegeben;
- die Readiness-Auswertung kann weiterhin nicht `ready` liefern.

Abnahme:

- alle fünf authored Vertragsdokumente bestehen ihre strikten Draft-2020-12-Schemas und semantischen Cross-Invarianten;
- ein Inhaltsindex berechnet reproduzierbar den erwarteten gemeinsamen Digest und bindet Registry sowie Normalform bytegenau;
- vollständige Registry-Abdeckung, identische drei Normalformen, geordnete Graph-/View-/Card-Semantik, bytegleiche Bilder, Ontologie-QS, hermetische Consumer-Tests und zwei reproduzierbare Builds sind notwendige Bedingungen für `passed`;
- der Vertrag definiert eine nicht selbstreferenzielle Signing-Projection; bis zur kryptographischen Prüfung in DPK-011 weist der aktuelle Gate jeden `verified`-Claim und jede `stable`-Promotion fail-closed zurück;
- gezielte Prüfungen und anschließend `./run_ci.sh` sind grün;
- der geprüfte Stand wird als eigener Git-Commit festgehalten.

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
| DPK-003 | Core-first Feld-/RDF-Semantik, versionierte Normalform mit Inhaltsindex sowie externe Äquivalenz- und Dual-Release-Verträge eingeführt | 5 gültige Dokumente, 17 Registry-Einträge, 54 semantische Mutationstests und 8 Raw-JSON-Fälle; vollständiges `./run_ci.sh` lokal, Exit 0 | 2026-07-10 |
| DPK-004a | Reales Mathematik-Authoring verlustfrei in ein striktes, entpacktes Runtime-Release-Modell mit typisierter Fixpunkt-Closure, Semantic-Kind-Ledger, Migration, Ressourcenbindung und gemeinsamem `contentDigest` kompiliert | Reales Profil: 1.079 Ziele, 88 Views, 12 Decks/128 Karten, 825 Ressourcenlinks einschließlich 756 gehashter Bilder; 0 ungelöste harte Referenzen, externe Runtime-Abhängigkeiten und Definitionskonflikte; 5 Fixture-Dokumente/8 Mutationen, Compilerprobe, 25 Selbsttests, sicherer Doppelbuild und vollständiges `./run_ci.sh`, Exit 0 | 2026-07-10 |
| DPK-004b / DPK-004 | Autoritative Mappings, Quellen, SourceGoal-Belege und ehrliche Quality-Evidence als vier digest-relevante, nicht runtime-erforderliche Publikationsartefakte ergänzt; P0 damit fachlich und technisch vollständig | 10.021 Mapping-Entscheidungen/33.382 Kanten, 9.977 Source Goals, 2.328 Quality-Entscheidungen plus 1 explizite Bildlücke, 111+756 Inhaltsrecords; 9 gültige Fixture-Dokumente, 22 Negativfälle, 47 Produktions-/Adversarialtests; gezielte QS und vollständiges `./run_ci.sh` grün | 2026-07-10 |

## Verbleibende Roadmap

| ID | Phase | Ergebnis | Abhängigkeit | Status |
| --- | --- | --- | --- | --- |
| DPK-001 | P0 | JSON-Manifest-/Profilvertrag v1 und Conformance-Validator | DPK-000 | `complete` |
| DPK-002 | P0 | Runtime-Katalogschema, paketlokaler Offline-Schema-Katalog, Artefaktrollen und ehrliche Readiness-Auswertung | DPK-001 | `complete` |
| DPK-003 | P0 | Feldsemantik-/RDF-Mappingregistry, versionierte Normalform sowie Release-Index-/Äquivalenzreport-Schemas | DPK-001 | `complete` |
| DPK-004 | P0 | Closure-, Ownership-, Konflikt- und Migrationsverträge; vollständige Mathematik-Conformance-Kompilation in das neue Release-Modell | DPK-002–DPK-003 | `complete` |
| DPK-004a | P0 | Entpacktes Runtime-Modell mit strikten Payload-Schemas, Semantic-Kind-Ledger, Fixpunkt-Closure, Migration, Ressourcenbindung und realer Mathematik-Kompilation | DPK-002–DPK-003 | `complete` |
| DPK-004b | P0 | Mapping-, Quellen- und Quality-Felder vollständig als Runtime-, Publikations-Evidenz oder Authoring-only klassifizieren und in die Mathematik-Conformance aufnehmen | DPK-004a | `complete` |
| DPK-005 | P1 | Mathematik-JSON-Paket nach `full-standalone-v1` bauen, strikt validieren und die offene Source-Verification-QA-Schuld als maschinenlesbares Release-Gate führen | DPK-002–DPK-004 | `not_started` |
| DPK-006 | P1 | Manifestbasierter Backend-Package-Loader mit lokalem Store und Lock | DPK-005 | `not_started` |
| DPK-007 | P1 | Package-only Mathematik-Smoke-Test einschließlich Views, Karten und Bildern | DPK-006 | `not_started` |
| DPK-008 | P2 | FWU-OWL-Manifest/-Profil, Ontologie-Exporter und Reverse Compiler auf Paketverträge umstellen | DPK-003–DPK-005 | `not_started` |
| DPK-009 | P3 | Semantischer Digest, Äquivalenzreport und reproduzierbares Variantenpaar | DPK-008 | `not_started` |
| DPK-010 | P4 | Physik-Closure und fachübergreifende Profile | DPK-004, DPK-009 | `not_started` |
| DPK-011 | P5 | Signierter Release-Index, Distributionskatalog und atomare Promotion nur bei geschlossenen Visualisierungs- und Source-Verification-Gates | DPK-009–DPK-010 | `not_started` |
| DPK-012 | P6 | Curriculum-Toolchain und Inhalte aus dem Software-Repository lösen | DPK-007, DPK-011 | `not_started` |

Die IDs strukturieren solide, einzeln commitbare Schritte. Sie ersetzen nicht die detaillierten Phasen und Abnahmekriterien im Zielkonzept.

## Qualitätsnachweise

| Stand | Gezielte Prüfungen | Vollständige CI | Ergebnis |
| --- | --- | --- | --- |
| Baseline `0d419930` | vorhandene Doku- und Roundtrip-Prüfungen | `./run_ci.sh`, lokal, 2026-07-10, Exit 0 | `passed` |
| DPK-001 | Vertragsvalidator (1 gültige Fixture, 39 Negativfälle), Workflow-Syntax, Doku-Links und Diff-Check | `./run_ci.sh`, lokal, 2026-07-10, Exit 0 | `passed` |
| DPK-002 | Manifest 1/49; Runtime 1/31 + 8 Bindings; Schema-Katalog 1/34 + 12 Bindings; Readiness: 5 Manifest-, 4 Policy-Tamper-, 5 Forgery-, 3 Raw-JSON-, 7 adversariale ZIP-, 2 Early-Limit- und 10 Exitcode-Fälle; realer Latein-Build/Validator/Repro/Index 37/37; Lint, TypeScript, Doku, Workflow-YAML und Diff-Check | `./run_ci.sh`, lokal, 2026-07-10, Exit 0 | `passed` |
| DPK-003 | Dual-Release-Validator: 5 positive Dokumente, 17 Registry-Einträge, 54 semantische Mutationstests, 8 Raw-JSON-Fälle; Schema-, Digest-, Trust-, Cross-Binding-, Doku-, Workflow- und Diff-Gates | `./run_ci.sh`, lokal, 2026-07-10, Exit 0 | `passed` |
| DPK-004a | Strikte Schema-/Profil-/Ledger-/Core-Pin-Prüfung; reale Mathematik-Kompilation mit exakten Umfangsgates; 5 Fixture-Dokumente/8 Mutationen; Compilerprobe; 25 unabhängige Selbsttests; sichere Output-Promotion; unabhängige Digest-, Feldabdeckungs-, Referenz-, Closure-, Ownership-, Konflikt-, Migrations-, Index- und Ressourcenprüfung; bytegleicher Doppelbuild | `./run_ci.sh`, lokal, 2026-07-10, Exit 0 | `passed` |
| DPK-004b / DPK-004 | Compiler plus unabhängiger Validator; 9 gültige Fixture-Dokumente, 22 Negativfälle und 47 Produktions-/Adversarialtests; Mapping-Truth-/Raw-/Legacy-Differenzen, Source-Joins/Lineage, Core-Term-Trust, Source-Semantik-Overclaims, unabhängig abgeleitete Quality-Status, stabile Schlüssel, 454 Registry-Regeln, 111+756 Inhaltsrecords, 0 Publikationsrollen in der Runtime-Closure und bytegleicher Doppelbuild | `./run_ci.sh`, lokal, 2026-07-10, Exit 0 | `passed` |

Rohlogs und temporäre Artefakte bleiben unter `tmp/` oder in CI-Artefakten und werden nicht in dieser Seite dupliziert.

## Pflege- und Commit-Konvention

- Ein Schritt wird erst `complete`, wenn seine gezielten Prüfungen und danach das vollständige `./run_ci.sh` bestanden haben.
- Nach erfolgreicher Qualitätssicherung wird genau dieser abgegrenzte Stand committed.
- Schlägt ein Gate fehl, bleibt der Schritt `in_progress`; es gibt keinen Zwischencommit mit nur teilweise erfüllter Abnahme.
- Vor dem finalen CI-Lauf eines Schritts werden diese Tabellen bereits auf den erwarteten Abschlussstand gesetzt. Der Commit erfolgt nur, wenn der Lauf tatsächlich grün bleibt.
- Der nächste Schritt beginnt erst auf dem sauberen Commit des vorherigen Schritts.
- Maschinenlesbare paketbezogene Readiness-Berichte bleiben temporäre Build-/CI-Artefakte unter `tmp/exports/readiness/`; diese authored Seite bleibt die Quelle für Arbeitsstand und Priorisierung.
