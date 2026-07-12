# Dual Curriculum Package Implementation Status

- Stand: 2026-07-11
- Zielbild: [Duale Curriculum-Pakete: JSON-Runtime und Lehrplan-Ontologie](../concept/curriculum-graph/dual-curriculum-package-releases.md)
- Aktive Phase: `P2 – Core-first Ontologieformat vorbereiten`
- Nächster Umsetzungsschritt: `DPK-008d – isolierter Reverse Compiler zum installierbaren JSON-Runtime-ZIP`
- Letzter vollständig abgeschlossener Schritt: `DPK-008c – unabhängige Finished-FWU-OWL-Paket-QS`
- Solider Ausgangsstand: `DPK-008c`
- Abschluss-Gate für DPK-008c: 40 begrenzte Validator-Garantien, exakt gepinnte Offline-Toolchain, realer schema-valider Report mit 18/18 bestandenen Gates, SHACL 0/0, OWL 2 DL, HermiT konsistent/0 unerfüllbar und `./run_ci.sh` grün
- Technische Blocker: keine
- Public-Release-Gates: [konkrete menschliche Reviewliste](../qa-ci/curriculum-package-human-review-gates.md)

Diese Seite ist das kurze, gepflegte Workboard für die Umsetzung. Das Konzeptdokument bleibt die Quelle für Zielarchitektur und endgültige Abnahmekriterien; Git-Historie und CI-Artefakte ersetzen ein langes Umsetzungstagebuch.

## Auf einen Blick

| Phase | Angestrebtes Ergebnis | Status | Nächster Gate |
| --- | --- | --- | --- |
| P0 | Versionierte, ausführbar geprüfte Paket-, Profil- und Äquivalenzverträge samt vollständigem Mathematik-Conformance-Modell | `complete` | abgeschlossen |
| P1 | JSON-Paket als hermetischer SkillPilot-Runtime-Input | `complete` | abgeschlossen |
| P2 | Fachübergreifendes Core-first Ontologieformat mit Reverse Compiler | `in_progress` | DPK-008d: FWU-OWL isoliert zum installierbaren JSON-ZIP zurückübersetzen |
| P3 | Gemeinsamer `contentDigest` und Dual-Release-Gate | `not_started` | Manipulationen beider Varianten sicher erkennen |
| P4 | Generalisierung über Mathematik hinaus | `not_started` | Physik und ein sprachliches Fach bestehen |
| P5 | Signierter Package-Betrieb und Veröffentlichungskatalog | `not_started` | atomare Stable-Promotion und Rollback |
| P6 | Trennung von Curriculum-Erstellung und SkillPilot-Software | `not_started` | Software benötigt keinen produktiven Curriculum-Quellbaum |

Statuswerte: `not_started`, `in_progress`, `complete`, `blocked`, `deferred`. Es ist höchstens ein Schritt gleichzeitig `in_progress`.

## Abgeschlossener Teilschritt: DPK-008c

DPK-008c validiert das fertige FWU-OWL-ZIP ausschließlich aus veröffentlichten Bytes und Repository-Trust-Roots, ohne Import des Exporters. ZIP, Quell-JSON, Reproduzierbarkeits-Peer, ROBOT und Evidenz werden über no-follow Dateideskriptoren, vollständige Dateiidentitäten und Vor-/Nachhashes gebunden. JSON erhält vor dem Parsen Byte-, Tiefen- und Knotengrenzen. Der Validator prüft Manifest, Profil, Support-, Lizenz-, Schema-, Registry-, Core-, Segment-, Bundle-, Binärsidecar- und Reproduzierbarkeitsverträge erneut und erzeugt einen externen schema-validen Report mit achtzehn fest geordneten Gates. pySHACL, ROBOT und HermiT arbeiten netzfrei auf privaten, hashgebundenen Eingabekopien.

Der abschließende Core-Audit hat außerdem eine bislang opaque Kompetenzreferenz korrigiert: Registry-`competency-entry`-Ziele werden nun direkt auf die katalogisierten Kompetenzressourcen projiziert. Exakte Regressionstests decken sowohl `competencyRefs` als auch das kompatible `kompetenzen` ab. Dadurch entfallen 162 künstliche Value-Carrier; das fachliche JSON und sein `contentDigest` bleiben unverändert, der bereinigte RDF-Graph umfasst 823.890 Tripel.

Der reale `.3`-Lauf besteht alle 18 Gates ohne Diagnose:

| Merkmal | Wert |
| --- | --- |
| FWU-OWL-ZIP und Peer | je 2.362.017.770 Byte; SHA-256 `cce674652ed569b06a2f6369c826c29585e44ef9a4d51521bf8d99eabe7c92ac` |
| FWU-OWL-Manifest | SHA-256 `b33cdcc4eb4751998289a41d3d7fc5a1b4df968355d1cfe6be426171e1ca8bba` |
| Inventar | 819 ZIP-Einträge; 817 Manifestrecords; 757 Binärressourcen mit 1.696.390.279 Byte; 32 Reverse-Support-Dateien |
| Semantik | acht Segmente; 823.890 RDF-Tripel; 111 logische Artefakte; 454 Registry-Einträge; eine additive Core-Fallback-Area |
| Ontologie-QS | pySHACL 0.30.1: 0 Violations/0 Warnings; ROBOT 1.9.10: OWL 2 DL; HermiT 1.4.5.456: konsistent/0 unerfüllbare benannte Klassen |
| Gemeinsamer Inhalt | `sha256:e83936aaf3645ff5f6e8132c4a801bd4bd66f55d3c0304a5deda3d6a5d194101` |

`scripts/run_curriculum_fwu_owl_package_conformance.sh` ist der schwere reale Release-Gate. Die normale lokale und gehostete CI provisioniert und verifiziert die exakte Toolchain und führt den auf 40 Garantien begrenzten Validator-Selftest aus, nicht den 2,36-GB-/HermiT-Lauf. Der dabei aufgedeckte Java-Sandbox-Fallback ist ebenfalls geschlossen: der hermetische JSON-Consumer bindet das exakt gepinnte Corretto-JDK per stabilem read-only FD nach dem Repository-Masking ein und besteht real wieder 15/15 Checks ohne Host-Java-Fallback.

DPK-008c ist damit abgeschlossen. DPK-008d muss das validierte FWU-Paket nun ohne Original-JSON und ohne Exportercode in ein unabhängig validierbares, installierbares JSON-Runtime-ZIP rekonstruieren.

## Abgeschlossener Teilschritt: DPK-008b

DPK-008b implementiert den paketgetriebenen Core-first Exporter als generische TypeScript-Toolchain. Er liest die 111 logischen Artefakte und 757 Binärressourcen ausschließlich aus dem unabhängig validierten, eingefrorenen `.3`-JSON-Paket, gleicht jeden beobachteten Wert gegen die 454-Einträge-Feldregistry ab und schreibt acht kanonisch sortierte, deduplizierte N-Triples-Segmente. Present-empty bleibt über `sp:fieldState` von missing unterscheidbar; geordnete Werte behalten explizite Memberships und Positionen. Der Compiler projiziert fachliche Ziele, Bereiche, didaktische Voraussetzungen, Program Units, Placements und Kompetenzachsen so weit wie möglich in den gepinnten FWU-Core. Anwendungsterme bleiben auf nachgewiesene Runtime-, Roundtrip-, Packaging- und Evidenzlücken begrenzt.

Die Deklarationslane wird vor dem RDF-to-OWL-Parsing aus der exakten Registry-/Anwendungsontologie-Union sowie 16 Core-/externen Bootstrap-Properties abgeleitet. Cross-Kind-Punning innerhalb und zwischen diesen Mengen scheitert. Exakte Tests decken die 526 Deklarationen, `sp:fieldState`, alle drei `sp:referenceRole`-Rollen, Core-Area-/Atomic-Typen, authored und additive BFO-Parthood sowie das dreigliedrige `LP_0000554`-Referenzmuster ab. Die korrigierten Shapes vergleichen `goalSemanticKind` RDF-termgenau als `xsd:string`; der inzwischen bereinigte reale Graph umfasst 823.890 Tripel. Die formale, exporterunabhängige SHACL-/OWL-/HermiT-Attestation ist in DPK-008c abgeschlossen.

Der Builder validiert Paketprofil, Schemakatalog und Manifest intern mit Draft 2020-12, bindet Repository-Trust-Roots sowie die Source-JSON-Identität bytegenau und prüft Quell-ZIP und alle Source-Dateien gegen Drift. Inventar, Lizenzdokumente und Redistributionstatus sind geschlossen. Primär- und Peer-Paket entstehen in einer privaten Run-Staging-Area; nur zwei vollständig materialisierte, byteidentische Builds werden als ganzes Verzeichnis atomar promotet, wobei ein vorhandener letzter guter Stand bis dahin erhalten bleibt.

Der reale Mathematikbuild hat folgenden unveränderlichen technischen Stand:

| Merkmal | Wert |
| --- | --- |
| FWU-OWL-ZIP | `skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-conformance.3.fwu-owl.zip` |
| ZIP und Reproduzierbarkeits-Peer | je 2.362.017.770 Byte; SHA-256 `cce674652ed569b06a2f6369c826c29585e44ef9a4d51521bf8d99eabe7c92ac` |
| FWU-OWL-Manifest | SHA-256 `b33cdcc4eb4751998289a41d3d7fc5a1b4df968355d1cfe6be426171e1ca8bba` |
| Inventar | 819 ZIP-Einträge; 817 Manifestrecords; 757 Binärressourcen; 32 Reverse-Support-Dateien |
| Semantik | 111 logische Artefakte; 454 Registry-Einträge; 823.890 RDF-Tripel; eine additive Core-Fallback-Area |
| Gemeinsamer Inhalt | `sha256:e83936aaf3645ff5f6e8132c4a801bd4bd66f55d3c0304a5deda3d6a5d194101` |

DPK-008b ist damit als Exporter-/Materialisierungsschritt abgeschlossen. DPK-008c prüft das fertige ZIP inzwischen ohne Exportercode strukturell und ontologisch mit einem externen schema-validen 18-Gate-Report; DPK-008d rekonstruiert daraus als Nächstes isoliert ein installierbares JSON-Runtime-Paket.

## Abgeschlossener Teilschritt: DPK-008a

DPK-008a legt den ausführbaren Vertrag vor den eigentlichen Ontologieexport. Das innere `fwu-owl-v1`-Manifest inventarisiert genau acht geordnete normative N-Triples-Segmente (`declarations`, `runtime`, `landscape`, `views`, `mappings`, `sources`, `cards`, `assets`). `bundle.nt` ist davon getrennt und darf ausschließlich die bytegenaue Konkatenation dieser Segmente sein. Core-Kopie, XML-Katalog, SkillPilot-Profil, Shapes, alle Paketverträge, Lizenzen und binäre Sidecars besitzen geschlossene Rollen und Hashbindungen.

Das produktive Paketprofil fixiert ZIP32-/Pfad-/Dekompressionsgrenzen einschließlich expliziter JSON-Byte-, Tiefen- und Knotengrenzen, verbietet Symlinks, Sonderdateien, Data Descriptors, Extra Fields und Netzwerkauflösung und verlangt achtzehn benannte Gates von Archiv- und Manifestprüfung über Semantic-Content-Index und Registry-Abdeckung bis zu RDF/SHACL/OWL 2 DL/HermiT und Reproduzierbarkeit. Der gepinnte FWU-Core wird byteidentisch und ehrlich als OWL Functional Syntax deklariert. Statisches SkillPilot-Anwendungsprofil, nicht ausführbare SHACL-Core-Shapes und Core-only-XML-Katalog liegen als versionierte Repository-Trust-Roots vor. Sechs Bootstrap-Schemas und drei globale Semantikverträge sind ebenfalls an Repositorybytes gebunden; der 25-Einträge-Schemakatalog wird daraus und aus dem gepinnten 22-Schema-JSON-Profil deterministisch konstruiert. Der externe Validierungsreport bindet ein exaktes ZIP und Manifest, das unabhängig geöffnete JSON-Quellpaket samt fünf Semantikverträgen, Core/Profil/Registry/Definition-Digest/Shapes/Bundle, Zählwerte, Ontologieevidenz und zwei bytegleiche Builds. Frühe Fehler an falschem Suffix, leerem oder übergroßem Input bleiben als schema-valide `invalid`-/`error`-Receipts darstellbar. Geschlossene `release-support`-Records stellen exakt die 22 JSON-Schemas, das JSON-Releaseprofil sowie Redistribution- und Source-Verification-Evidenz für den isolierten Rückcompiler bereit, ohne logische JSON-Payloads zu verstecken.

Der unabhängige Vertragsvalidator importiert keinen Exporter. Er prüft eine positive, extern am JSON-Quellmanifest verankerte Fixture, zwei ehrliche frühe Fehlerzustände sowie 96 gezielte Mutationen und verwirft doppelte JSON-Keys und nicht-endliche Zahlen. Die Mutationen schließen unter anderem Digest-, Leergraph-, Core-Syntax-, Ontologie-/Shapes-/Schema-/Katalog-Trust-, Deklarationsunion-/Parser-Bootstrap-, vollständige ZIP-Pfad-, NFC-/casefold-sichere Pfad- und Metadatenabgrenzung, JSON-Limit-, Quellpaket-/Quellprofil-, Vertrags-ID-, Support-, Lizenz- und Report-Substitutionen. Die Deklarationslane umfasst exakt 510 deduplizierte Anwendungs- und 16 parserlokale Core-/externe Property-Deklarationen; der hashgebundene `sp:fieldState`-Carrier hält present-empty von missing unterscheidbar und `sp:referenceRole` typisiert Kompetenzachsenreferenzen. Die geschlossene SHACL-Enumeration für `goalSemanticKind` verwendet dieselben expliziten `xsd:string`-Literale wie der Compiler. Eine rein additive, reverse-nichtautoritative Fach-Area-Projektion hält auch die 18 Mathematik-Atomziele ohne authored `curricularArea` Core-/SHACL-konform, ohne die Normalform zu verändern. Der äußere Dual-Release-Vertrag bindet zusätzlich Definition-Digest- und Publikationsevidenzprofil; seine 61 Mutationen prüfen die geschlossene Trust-Menge. Damit ist das Format fail-closed definiert; DPK-008b muss nun den eingefrorenen `.3`-JSON-Kandidaten ausschließlich über diesen Vertrag materialisieren.

## Abgeschlossener Teilschritt: DPK-007a

DPK-007a beseitigt die letzte technische Inhaltslücke vor dem Ontologieexport. Die fachlich und technisch geprüfte Visualisierung für `f40fcaf7-c630-589c-9f48-6c9e69da0b9d` ist als 757. aktives Bild importiert. Der Atomic-Scope umfasst 754 Ziele; keines ist mehr ohne Bild. Die Human-Freigabe bleibt davon getrennt: 136 Visualisierungen sind freigegeben und 621 warten weiterhin auf Review.

Der unveränderliche Input für DPK-008 ist:

| Bindung | Wert |
| --- | --- |
| JSON-Paket | `skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-conformance.3.json.zip` |
| fachlicher `contentDigest` | `sha256:e83936aaf3645ff5f6e8132c4a801bd4bd66f55d3c0304a5deda3d6a5d194101` |
| ZIP | 1.738.161.217 Byte; SHA-256 `403cc0bc6004da549c8b9ed9fafad222fe0ddda1107806fe087cfa871a6dbcf9` |
| Manifest | SHA-256 `32f732fc553fd39a462280eba7b2fa94367af34b3882ec6115a94948da4b1ebe` |
| Inventar | 914 ZIP-Einträge; 912 Manifestrecords; 111 logische und 757 binäre Inhaltsrecords |
| Bilder | 757 eingebettet, zusammen 1.696.390.279 Byte; 69 externe Ressourcen; 826 Ressourcenlinks/-records insgesamt |
| Closure | 2.403 Definitionen; 18.820 Referenzen; `sha256:7e7d704a9c5e17fbe24f6ac881b44b41ae930f5ac945e69738b753c98b999121` |
| Definitionsindex | `sha256:4e99bba1d71d26b94bc23f4ea8251ff4dd3df15a5c63006b7564f7f69948c57d` |

Ontologie- und Publikationsprofil sind auf `1.1.1` angehoben. Ihre Core-Positions- und SkillPilot-Order-Lanes werden durch Compiler und unabhängigen Validator gegen die Feldregistry geprüft. Die Registry selbst bleibt mit 454 Einträgen und SHA-256 `2e536c3f8d63e2acf45690375ace69ec0c6a6e92787bc8a16957b80120c4ca48` unverändert. Gezielte Mutationen beweisen, dass ein veraltetes `containedGoal` oder ein Predicate in der falschen Lane fail-closed scheitert.

Das vollständige CI-Gate deckte zusätzlich eine bereits reviewte Saarland-Zuordnung auf, deren Einheitskreisziel noch nicht in den DE-SL-CrossStage-Views lag. Die GK- und LK-Views enthalten dieses Ziel jetzt explizit; damit sind wieder alle 9.977 Mathematik-Source-Goals in den vorgesehenen Bundesland-Views abgedeckt und Mathematik bleibt auf M6.

Der Kandidat ist technisch vollständig und operabel, aber nicht publikationsbereit. Er bleibt `not-ready-incomplete`, weil 621 fachliche Visualisierungsreviews, 757 Bildrechte plus drei Nicht-Binärklassen (760 Redistribution-Entscheidungen insgesamt) und 479 Source-Text-Entscheidungen offen sind. Sechs Bildrecords enthalten eine nutzerbereitgestellte Erzeugungsbehauptung; auch diese ist keine Rechtefreigabe.

## Abgeschlossener Teilschritt: DPK-005a

DPK-005a schließt die Vertrauens-, Archiv- und Review-Grundlage zwischen dem entpackten DPK-004-Modell und dem realen JSON-Paket:

- jeder Manifest-Record besitzt genau eine explizite semantische Bindungsart: logisches Artefakt mit `logicalId` und `normalizationRole`, Binärressource mit `resourceId` oder bewusst ausgeschlossene generierte Paketmechanik;
- `full-standalone-v1` pinnt jetzt alle 22 normativen Payload-Schemas, verlangt deren vollständigen Offline-Schema-Katalog, bindet fünf paketlokale Semantic Contracts und schreibt je Rolle die exakten zulässigen `validationSchemaId`-Werte vor;
- `semantic-content-index` ist eine eigene verpflichtende Singleton-Rolle; Build-/Validierungsprovenienz bleibt mehrfach inventarisierbar, aber ausdrücklich außerhalb der fachlichen Normalform;
- der Readiness-Gate trennt Vertragsgültigkeit und Publikationsrecht: offene oder verbotene Redistribution bleibt ein formal darstellbarer Staging-Kandidat, führt aber fail-closed zu `not-ready-incomplete` über `publication.redistribution-cleared`; beschädigte Identitäts-/Vertragsclaims bleiben `invalid`;
- der aus dem Legacy-Exporter extrahierte Streaming-ZIP32-Writer erzeugt byteidentische bestehende Exporte, sortiert deterministisch, schreibt ausschließlich STORE-Einträge mit fixer UTC-DOS-Zeit und 0644, erzwingt alle ZIP32-/Profilgrenzen und lehnt unsichere Pfade, Mehrdeutigkeit, Symlinks, Nicht-Dateien, Source-Drift, Data Descriptors, Extras und ZIP64 ab;
- ein Redistribution-Ledger bindet alle 756 realen Bilder und alle 23 Nicht-Binärrollen. Nur die exakte Root-`LICENSE`-gebundene Softwarevertragsklasse ist automatisch Apache-2.0; 756 Bilder, davon sechs nutzerbereitgestellte Erzeugungsbehauptungen, und drei Artefaktklassen bleiben ehrlich offen;
- eine Source-Verification-Lane reduziert die offene Textprüfung reproduzierbar von 9.977 auf 479 Datensätze: 9.493 Texte liegen zusammenhängend in authored Passage-Carriern, fünf weitere in einer hashgebundenen, nur temporär erzeugten `pdftotext -layout`-Projektion. Kein Maschinentreffer wird als Human-Freigabe gezählt und kein vollständiger extrahierter amtlicher PDF-Text wird neu versioniert;
- abgeschlossene Source-Entscheidungen sind an `reviewEvidenceSha256` gebunden; Text-, Passage-, PDF- oder Locator-Drift macht sie stale. Die [zentrale Human-Review-Liste](../qa-ci/curriculum-package-human-review-gates.md) trennt fachliche Bildprüfung, Bild-/Datenrechte, Source-Text-Prüfung, Ontologie-Sign-off und Stable-Promotion.

Gezielte QS:

- Manifest/Profile: eine gültige Fixture und 61 exakt erwartete Negativfälle;
- Offline-Schema-Katalog: vollständiger 22-Schema-Trustsatz, 34 Negativ- und 12 Bindingfälle ohne Remote-Fetch;
- Readiness: fünf Dialekt-Fixtures, Redistribution-Fall, Policy-/Report-Forgery, sieben adversariale ZIPs und 10-fache Exitmatrix;
- Redistribution: realer Check plus 17 fail-closed Mutationen;
- Source Verification: realer Check, acht Mutationen, Duplicate-Key-/stale-Review-Nachweis und optionaler bytegleicher Replay aller neun PDF-Projektionen;
- ZIP32: Golden Bytes, echter byteidentischer Latein-Alt/Neu-Export und 22 Struktur-/Safety-Garantien;
- vollständiges `./run_ci.sh` auf dem final dokumentierten Stand grün.

Bewusste Grenze dieses abgeschlossenen Teilschritts: DPK-005a erzeugte noch nicht das rund 1,7-GB-Mathematik-ZIP. Diese Materialisierung ist inzwischen in DPK-005b technisch umgesetzt; offene Human-Gates verhindern weiterhin jede öffentliche Promotion.

## Abgeschlossener Teilschritt: DPK-005b

DPK-005b materialisiert das vollständige DPK-004-Modell als echtes `full-standalone-v1`-JSON-ZIP. Der [Builder](../../app/scripts/buildFullStandaloneCurriculumPackage.ts) erzeugt aus genau einem freigegebenen Release-Modell ein geschlossenes Inventar, kopiert alle Binärressourcen, legt die 22 vertrauenswürdig gebundenen Schemas und fünf semantischen Verträge paketlokal bei und schreibt Manifest, `SHA256SUMS`, Lizenzdokumente und explizite Review-Evidenz. Seine ZIP-Operation baut intern zweimal in unterschiedlicher Eingabereihenfolge und promotet nur bytegleiche Ergebnisse atomar.

Der [unabhängige Finished-ZIP-Validator](../../scripts/validate_full_standalone_curriculum_package.py) importiert keinen Buildercode. Er prüft tatsächliche ZIP-Struktur und Bytes, Inventar, Runtime- und Offline-Schema-Katalog, Hard-Reference-Closure, `contentDigest` und alle 756 Binärressourcen gegen package-local Daten und den externen Software-Trust-Root. JSON-Dateien sind durch das v1-Profil sichtbar auf 64 MiB, Tiefe 128 und 5.000.000 Knoten begrenzt; der Validator hat dafür keine strengeren versteckten Grenzen.

Der reale Mathematik-Gate erwartet exakt:

| Merkmal | Erwarteter Wert |
| --- | ---: |
| ZIP-Einträge | 913 |
| inventarisierte Manifestdateien | 911 |
| Binärressourcen | 756 |
| fachlicher `contentDigest` | `sha256:3b44444b50b41f45ec1cb12d4d912a4524effe9d560d539788cfe36d4d7ffc60` |

`scripts/run_curriculum_release_model_conformance.sh` baut weiterhin zwei bytegleiche Release-Modell-Verzeichnisse und ruft danach den realen ZIP-Builder genau einmal auf; dessen interner Doppelbuild beweist die ZIP-Reproduzierbarkeit. Der Wrapper schreibt ZIP, Build-Zusammenfassung, unabhängigen Validator-, Consumer- und Readiness-Report unter `tmp/curriculum-release-model/full-standalone-package/`; die verifizierten Assembly-/Evidence-Bäume und ihre externen Manifeste liegen unter `tmp/curriculum-release-model/package-consumer-smoke/`. Der Kandidat muss technisch valide sein, bleibt wegen offener Redistribution-Entscheidungen aber ehrlich `not-ready-incomplete`. DPK-006a–c laden, aktivieren und bedienen ihn inzwischen exakt; DPK-007 beweist zusätzlich den Betrieb ohne `curricula/`- oder fachlichen `app/public`-Fallback.

Gezielte QS ist grün:

- Builder-Selftest einschließlich Closed-Inventory-, Limits-, Symlink-/Source-Drift-, atomarer Promotion- und Doppelbuild-Garantien;
- unabhängiger Validator-Selftest mit adversarialen ZIP-/Trust-/Digest-/Closure-Fällen;
- realer Plan mit 913/911/756 und dem erwarteten `contentDigest`;
- TypeScript-, Lint-, Python-, Shell-, Workflow- und Dokumentationsprüfungen.

Das vollständige `./run_ci.sh` ist auf diesem final dokumentierten Stand grün. DPK-005b ist damit technisch abgeschlossen; die offenen Human-Gates verhindern weiterhin ausdrücklich eine Publikationsfreigabe.

## Abgeschlossener Teilschritt: DPK-006a

DPK-006a führt den ersten Backend-Consumer für bereits sicher vorvalidierte und content-adressiert entpackte Pakete ein. `skillpilot.curriculum.source` trennt `repository` und `package` explizit. Im Package-Modus ist ein exakter, nach Package-ID sortierter Mehrpaket-Lock verpflichtend; ein fehlender oder ungültiger Lock bricht den Start ab. Der Consumer scannt keine Paketverzeichnisse, wählt kein `latest`, schreibt weder Store noch Lock und fällt in diesen Komponenten weder auf Repository, Classpath noch Netzwerk zurück.

Die Vertrauenskette wurde nach einem unabhängigen Replay-Audit auf Validatorreport v2 gehärtet:

1. der Report bindet Outer-ZIP-SHA und -Bytezahl sowie den exakten Manifest-SHA;
2. derselbe Report bindet `contentDigest`, `closureDigest` und `definitionIndexDigest` und genau sechs vollständig bestandene Finished-Package-Gates;
3. Install-Record und Lock binden den Report-Hash und dieselben Identitäten;
4. der Loader hasht vor Snapshot-Publikation jede der 911 manifestinventarisierten Dateien erneut.

Ein v1-Report oder ein ausgetauschtes Manifest mit nachgezogenen Lock-/Receipt-Hashes wird fail-closed abgewiesen. Der Readiness-Evaluator trägt wegen dieser stärkeren Evidenzsemantik die Version `1.2.0`. Die stabile fachliche Consumer-API-Version ist unabhängig vom Gradle-Buildqualifier und aktuell `0.1.0`; frisch gebaute Conformance-Pakete deklarieren deshalb ehrlich `>=0.1.0 <1.0.0`.

Dateizugriffe werden vom Dateisystemroot aus über `SecureDirectoryStream` und `NOFOLLOW_LINKS` verankert. Lock, Receipt, Report und Paket-JSON verwenden Duplicate-Key- und Trailing-Token-Erkennung sowie die sichtbaren Profilgrenzen. Der Lock ist auf 256 aktive Pakete begrenzt. Der vollständig geladene Snapshot bewahrt Paketidentitäten, Root-/Module-Landschaften, Scope-Dimensionen und Composites, Capabilities, Views, deklarierte Single-/Merge-Offerings, Decks, eingebettete und externe Ressourcen, Migrationen sowie Definitionseigentum. Mehrdeutige IDs oder Definitionen blockieren die gesamte Generation; ein fehlgeschlagener Reload lässt exakt den bisherigen Snapshot aktiv.

Qualitätsnachweis:

- fokussierte Backend-Suite für Lock, Receipt, Validator-v2, sichere Pfade, Manipulationen, Kompatibilität, Scope-/Merge-Semantik, Mehrpaketkonflikte, Snapshot-Immutabilität und atomaren Reload grün;
- Full-Package-Validator v2 mit 28 Garantien und Readiness-1.2-Selftest einschließlich acht Validatorreport-Fälschungen grün;
- echte read-only Loaderprobe über das 1,7-GB-Mathematikpaket: 1 Landschaft, 88 Views, 88 Offerings, 12 Decks, 825 Ressourcen und 2.402 Closure-Definitionen, alle Manifestbytes erneut geprüft;
- vollständiges `./run_ci.sh` auf dem final dokumentierten Stand grün.

Bewusste Grenze: DPK-006a konsumiert nur einen bereits vertrauenswürdig provisionierten Store. Exakte ZIP-Extraktion, `SHA256SUMS`-/Tree-Identität, Store-Schreibautorität, CAS-Aktivierung und Rollback folgen in DPK-006b. Runtime-Services und Frontend lesen noch nicht aus dem Snapshot; diese Umschaltung folgt in DPK-006c. `embedded-fragment` bleibt bis zur fachübergreifenden Closure-Lane ausdrücklich fail-closed. Erst DPK-007 darf den vollständigen SkillPilot-Betrieb ohne Quellcheckout und statische fachliche Fallbacks behaupten.

## Abgeschlossener Teilschritt: DPK-006b

DPK-006b ergänzt die schreibende, vom Runtime-Prozess getrennte Store-Seite. Der [Provisioner](../../scripts/provision_curriculum_package.py) kopiert ein Eingabe-ZIP zunächst unter stabiler Dateiidentität in einen privaten, deterministisch nach äußerem SHA benannten Quarantänepfad. Er akzeptiert ausschließlich einen kanonischen Validator-v2-Report mit exakt bestandenen sechs Gates und extrahiert danach selbst nochmals streamingbasiert ohne `extractall`. Manifest, `SHA256SUMS`, vollständiger Datei- und Verzeichnisbaum, Profilgrenzen, Bytes und SHA-256 werden vor der Promotion erneut geprüft.

Das Store-Protokoll besitzt drei externe, geschlossene Betriebsverträge für Validatorreport, Install-Record und aktiven Lock. Sie bleiben bewusst außerhalb des paketlokalen 22-Schema-Trustsatzes und verändern weder Paketformat noch fachlichen Digest. Objektverzeichnisse werden `0555`, Payload- und Kontrollfiles `0444`; Ownership- oder Modusdrift scheitert ebenso wie zusätzliche leere Verzeichnisse. Report und Install-Record binden ZIP, Manifest, Closure, Definition-Index und `contentDigest` bytegenau. Ein vorhandenes content-adressiertes Objekt wird vor jeder Fortsetzung vollständig gegengeprüft; deterministische Quarantänepfade machen auch einen Crash zwischen Objekt-, Report- und Record-Promotion idempotent reparierbar.

Installation und Aktivierung sind getrennt. Erst ein expliziter `activate`-Aufruf erzeugt einen strikt nach `packageId` sortierten Lock. Die beobachtete Vorgängerversion wird als SHA-256-CAS vor und unmittelbar vor `replace` erneut geprüft und vor Überschreiben unveränderlich archiviert. Rollback verwendet dieselbe Revalidierung und CAS-Semantik. Consumer-SemVer, Definitionskonflikte, globale Landscape-/View-/Offering-/Resource-Identitäten, öffentliche Resource-URLs und die derzeit nicht unterstützte `embeddedDependencies`-Capability werden vor Aktivierung fail-closed geprüft. Es gibt keine `latest`-Discovery.

Qualitätsnachweis:

- Operational Contracts: drei gültige Dokumente und 23 gezielte Negativ-/Raw-JSON-Fälle zusätzlich zur unveränderten Manifest-Suite 1/61;
- schneller Provisioner-Selbsttest mit 38 Lebenszyklus-, Crash-, Path-, Symlink-, Truncation-, Replay-, Permission-, Tree-, Poisoning-, CAS-, Rollback-, Consumer- und Mehrpaketgarantien;
- realer Conformance-Wrapper: reproduzierbares 1,7-GB-Mathematik-ZIP wird unabhängig validiert, sicher installiert, vollständig verifiziert und atomar aktiviert;
- derselbe Store wird anschließend vom echten Java-Repository/Loader gelesen: 911 Manifestfiles, 1 Landschaft, 88 Views, 88 Offerings, 12 Decks, 825 Ressourcen, 756 öffentliche Assets und 2.402 Definitionen;
- vollständiges `./run_ci.sh` auf dem final dokumentierten Stand grün.

Bewusste Grenze: Der Store ist nun vertrauenswürdig provisioniert und aktivierbar, aber die bisherigen Landschafts-, View-, Deck-, Mapping- und Asset-Services lesen noch nicht durchgängig aus dem Snapshot. Diese Umschaltung ist DPK-006c. Erst DPK-007 beweist den kompletten Backend-/Frontend-Betrieb in einer Umgebung ohne Curriculum-Checkout und statische fachliche Fallbacks. Publisher-Signaturen bleiben DPK-011; offene menschliche Freigaben werden durch technische Installation nicht ersetzt.

## Abgeschlossener Teilschritt: DPK-006c-a

DPK-006c-a vervollständigt den read-only Snapshot als alleinige Grundlage für die nachfolgenden Service-Umschaltungen. Er enthält jetzt jedes der 911 manifestinventarisierten realen Mathematikartefakte, nicht nur die Runtime-Katalogrollen. Damit sind auch nicht runtime-erforderliche, aber für Mapping, Quellenanzeige, Quality-Evidenz und späteren Ontologie-Roundtrip benötigte Rollen generationgebunden auffindbar. Jeder Record bewahrt Rolle, MIME-Type, Länge, SHA-256, Runtime-Pflicht, semantische Bindungsart, `logicalId`/`normalizationRole` beziehungsweise `resourceId`, Validierungsschema sowie Lizenz-, Provenienz- und Redistributionsstatus.

Eine eigene package-only Artefaktfassade akzeptiert ausschließlich einen Schlüssel aus genau diesem unveränderlichen Snapshot. Sie traversiert wieder über den sicheren Store-Reader und prüft bei jedem Zugriff Dateityp, Dateiidentität, Bytegrenze, Länge und SHA-256 erneut. Weder absolute Storepfade noch beliebige relative Pfade werden nach außen gegeben. Das synthetische Store-Fixture führt nun dieselben semantischen Manifestbindungen wie ein reales Paket, sodass Tests die Vertrauenskette nicht über einen schwächeren Sondervertrag umgehen.

Die Java-/TypeScript-Modelle bewahren außerdem den geschlossenen Landscape-Vertrag verlustfrei: `$schema`, `landscapeFormatVersion`, Compatibility-Flags, `phase`, `courseLevel`, `themenfeld`, `leitideen`, `kompetenzen`, Experimentdaten, `semanticKind`, `semanticAtomic` und `examData.reviewNote`. Ein fehlendes `core` bleibt von explizitem `false` unterscheidbar; das bestehende boolesche `isCore()`-Verhalten bleibt kompatibel. Auch die lokalisierte API-Kopie erhält diese Felder.

Qualitätsnachweis:

- Package-Modellsuite einschließlich absent-vs.-false, Semantic-/Experiment-/Review-Roundtrip und unveränderlichem Artefaktindex grün;
- adversariale Artefaktleseproben für unbekannte Keys, zu enge Bytegrenzen und Hashdrift grün;
- reale 1,7-GB-Store-Probe mit exakt 911 Artefakten sowie expliziter Mapping-/Quality-Evidence-Bindung grün;
- TypeScript, ESLint, Diff-Gates und vollständiges `./run_ci.sh` grün.

Bewusste Grenze: DPK-006c-a stellt die vertrauenswürdige Datenebene bereit, ändert aber noch keine fachlichen Service-Endpunkte. Landschaften und Mappings folgen in DPK-006c-b, exakte Katalog-/View-Auflösung in DPK-006c-c, Decks und Bilder in DPK-006c-d, Frontend und paketierte Quellenanzeige in DPK-006c-e/f. Der hermetische Gesamtnachweis bleibt DPK-007.

## Abgeschlossener Teilschritt: DPK-006c-b

DPK-006c-b schaltet `LandscapeService` und `GoalMappingService` strikt zwischen Repository- und Package-Quelle um. Im Package-Modus entsteht genau ein lock- und generationsgebundener Domain-State aus den katalogisierten `canonical-landscape`-, `mapping`- und `source-index`-Artefakten; `LandscapeProperties`, Repositorypfade und Classpath-Dateien sind an diesem Pfad nicht beteiligt. Root-Reihenfolge, Landscape- und Goal-Indizes stammen ausschließlich aus dem Snapshot. Payload- und Katalogmetadaten, doppelte Goal-IDs, unbekannte Mappingziele und inkonsistente Source-Metadaten blockieren den Start.

Der Mapping-Compiler bewahrt alle autoritativen Kanten in Paketreihenfolge. Mehrere Ziele pro Source Goal sind fachlich erlaubt, ausdrücklich auch mehrere `exact`-Ziele sowie gemischte `exact`-/`partial`-Kanten. Nur eine identische Kante, ein Match-Type-Konflikt für dasselbe Source-/Canonical-Paar oder eine mehrdeutige SourceGoal-Eigentümerschaft scheitert fail-closed. Der singuläre Kompatibilitätszugriff liefert deshalb bei Fanout keinen willkürlichen ersten Treffer; der produktive Mehrfachzugriff bleibt verlustfrei. Diagnoseherkünfte sind opake `package:<packageId>/...#<mappingCollectionId>`-Labels und keine Storepfade.

Die kanonische Paketlandschaft enthält bereits fertig kompilierte effektive `applicability`. Der Package-Service übernimmt sie unverändert und führt weder die alte Mapping-/Contains-Ableitung noch Repository-Provenienz- oder Override-Registries erneut aus. Der amtliche Source-Index ist dagegen die autoritative Quelle für `sourceLandscapeId → jurisdiction`; Mapping-Metadaten werden strikt dagegen geprüft. SourceGoal-Zugehörigkeit ist aus den veröffentlichten Kanten verfügbar. Eine nicht paketierte historische Source-Cluster→Atomic-Closure und Compatibility-Archive bleiben bewusst leer statt auf den Quellbaum zurückzufallen.

Qualitätsnachweis:

- 13 neue Compiler-/State-Tests für Mehrfach-`exact`, gemischte Kanten, Counts, geschlossene Felder, Duplikate, Match-Type- und Eigentumskonflikte, 1:1-Source-Join, unbekannte Ziele, Multi-Package-Merge und tiefe Immutabilität;
- konditionale Spring-Konfiguration mit absichtlich konfliktbehaftetem Repository-Poison beweist, dass Package-Mode ausschließlich den Paketstand liefert und ungültige Package-Aktivierung nicht zurückfällt;
- reale 1,7-GB-Store-Probe bindet 1 Landschaft/1.079 Ziele, 31 Source Collections, 55 Dokumente, 9.977 Source Goals, 10.021 Entscheidungen und alle 33.382 geordneten Kanten; alle 16 Jurisdiktionen sind ableitbar und die ausgeschlossene Applicability-Projektion bleibt unverändert;
- gezielte Package-/Landscape-/Mapping-Suiten, Diff-Gates und vollständiges `./run_ci.sh` grün.

Bewusste Grenze: Die aktive Package-Generation ist derzeit eine Prozessstart-Grenze. Ein direkter öffentlicher Snapshot-Reload ist gesperrt, bis ein späterer Aktivierungskoordinator Snapshot und sämtliche abgeleiteten Resolver gemeinsam publizieren kann; die externe CAS-Lock-Aktivierung bleibt davon unberührt. Composition Views/Offerings sind inzwischen DPK-006c-c; Decks und Bilder folgen in DPK-006c-d, Frontend und Quellenanzeige in DPK-006c-e/f. Erst DPK-007 erbringt den hermetischen Gesamtbeweis.

## Abgeschlossener Teilschritt: DPK-006c-c

DPK-006c-c macht Runtime-Katalog, Offerings und Composition Views zu paketautoritativen Laufzeitdaten. Ein generationsgebundener, tief unveränderlicher `PackageCompositionViewState` prüft beim Start die View-Payloads gegen den Snapshot, die deklarierten Scope-Dimensionen, eindeutige Strukturknoten und die einmalige Sichtbarkeit expandierter Ziele. Jede View muss mindestens über ein Offering erreichbar sein. Single-Offerings müssen exakt denselben Scope wie ihre View tragen; ein Merge ist ausschließlich über eine deklarierte Composite-Dimension, deren geordnete Mitglieder und die explizite View-Reihenfolge zulässig. Freie `merged:`-IDs, GK/LK-Heuristiken und Teilmengen-Fallbacks existieren im Package-Modus nicht.

`CompositionViewService` wird nun je Quellmodus genau einmal konfiguriert. Der Repository-Modus behält seine bisherigen Authoring-Heuristiken; der Package-Modus kennt weder `LandscapeProperties` noch `Files.walk`, Classpath oder Repository-Dateien. `GET /api/ui/curriculum-catalog` liefert eine typisierte, geordnete und pfadfreie Projektion von Packages, Roots, Landscapes, Views und Offerings. `GET /api/ui/composition-views/offerings/{offeringId}` löst eine explizite Offering-ID auf; der bestehende `/match`-Übergangspfad trifft paketgebunden nur den exakten veröffentlichten Scope.

Auch nachgelagerte Verbraucher unterscheiden jetzt zwischen nicht verwalteten Repository-Inhalten und paketverwalteten, aber nicht angebotenen Scopes. Der bestehende kanonische Gymnasium-Adapter lässt Lernendenfilter und Champion-Metriken im zweiten Fall fail-closed leer, statt still auf alle gefilterten Ziele oder alte Hessen-Projektionen zurückzufallen. Eine tatsächlich leere Lernendenkonfiguration wählt dagegen das katalogisierte Default-Offering. Interne Prerequisite-/Scope-Berechnungen verwenden nun einen ausdrücklich ungescopten Strukturpfad und verwechseln dessen früheres `{}`-Sentinel nicht mehr mit einer Lernendenauswahl. `goalEntry` wird wie im Frontend als genau ein opaker projizierter Laufzeit-Leaf materialisiert; nur `canonicalSubtree` expandiert Unterziele. Die Topic-Zuordnung schneidet diese projizierten Leaves gegen die ungescopte strukturelle Closure, sodass ein opaker Cluster separat im View platzierte direkte Kinder nicht verschluckt. Aktivierung und Mastery validieren denselben projizierten Leaf statt der dahinterliegenden kanonischen Clusterdefinition, damit jedes angebotene atomare Frontier-Ziel auch abschließbar ist. Jede im Snapshot katalogisierte Landscape gilt im Package-State als paketverwaltet, auch wenn sie selbst kein Offering besitzt. Andere Frameworks werden bis zur generischen Offering-Auswahl in DPK-006c-e nicht durch den Gymnasium-Adapter interpretiert und bleiben dort fail-closed leer.

Qualitätsnachweis:

- neue State-, Konfigurations-, Controller- und Consumer-Tests für exakte Single-/Composite-/Default-Auflösung, Scope-/Reihenfolgedrift, unangebotene Views, doppelte sichtbare Ziele auch nach Merge, widersprüchliche Merge-Strukturen, Immutabilität, unbekannte Offering- und freie Merge-IDs, opake `goalEntry`-Knoten einschließlich Topic-Closure, getrennte Strukturauflösung sowie die beiden verhinderten All-Goals-Fallbacks;
- bestehende Integrationsgates stimmen mit dem Frontend-Compiler überein: der generische Physik-View liefert den opaken Newton-Cluster statt verdeckter Kinder und prüft dessen vollständigen Aktivierungs-/Mastery-Workflow, Hessen-Physik zählt 189 learner-facing quellengleiche Ziele und der einzige nicht-atomare Mathematik-`goalEntry` ersetzt seine drei Kinder durch genau einen Leaf (Hessen LK G8/G9: 777/785);
- unveränderte Repository-Composition-View-Suite einschließlich der bisherigen Authoring-Fallbacks grün;
- reale Store-Probe: alle 88 View-Payloads und 88 Offerings des 1,7-GB-Mathematikpakets laden, jedes Offering ist per ID und exakt gleichem Scope identisch auflösbar, nicht deklariertes GK+LK und freie Merge-IDs bleiben unaufgelöst;
- vollständiges `./run_ci.sh` auf dem final dokumentierten Stand grün.

Bewusste Grenze: Der Katalog enthält in diesem Schritt noch keine öffentlichen Deck-/Ressourcen-Hrefs; Deckdateien und Visualisierungsbytes werden noch nicht durch den Package-Resolver ausgeliefert. Das ist DPK-006c-d. Frontend und paketierte Quellenanzeige folgen in DPK-006c-e/f, der hermetische Gesamtbeweis in DPK-007. Offene fachliche und rechtliche Human-Gates bleiben durch die technische View-Auflösung unverändert.

## Abgeschlossener Teilschritt: DPK-006c-d

DPK-006c-d macht Decks, Karten und eingebettete Bilder zu paketautoritativen Runtime-Ressourcen. Ein unveränderlicher `PackageCurriculumResourceState` bindet sie an dieselbe Snapshot- und Domain-Generation wie Landschaften, Mappings und Views. Decks werden öffentlich ausschließlich über `packageId + packageVersion + deckId + locale` identifiziert; der interne Paketpfad dient nur zusammen mit dem besitzenden Ziel als streng geprüfte Kompatibilitätsbindung. Jedes Memory-Ziel muss genau einen nichtleeren `srs-deck:<deckId>`-Tag tragen, und seine de-/en-Quellen müssen auf katalogisierte Artefakte derselben Landschaft und Deck-ID zeigen. Freie Dateinamensuche oder Locale-Raten gibt es im Package-Modus nicht.

Eingebettete Ressourcen werden über `packageId + packageVersion + resourceId` beziehungsweise den exakt katalogisierten `publicUrl` aufgelöst. V1 liefert ausschließlich manifestgebundene JPEG-/PNG-Bilder eines existierenden Ziels aus. Rolle, Capability, MIME-Type, semantische Bindung, Runtime-Pflicht, Eigentum und 64-MiB-Grenze werden beim State-Aufbau geprüft; bei jedem Abruf prüft die sichere Artefaktfassade Dateiidentität, Länge und SHA-256 erneut. Externe HTTPS-Ressourcen bleiben reine Metadaten-Hrefs und besitzen bewusst keinen Byte-Endpunkt.

`DeckResourceService`, Deck- und Asset-Controller sind jetzt strikt nach Repository- und Package-Modus verdrahtet. Nur der Authoring-Modus behält seine Repository-/Classpath-Kompatibilität. Der Package-Controller liefert versionsgebundene Hrefs mit MIME, ETag und immutable Cache-Control; die unversionierten `/ai-assets`- und Goal-Visualization-Aliasse lösen ausschließlich den exakten Paket-`publicUrl` auf und erzwingen Revalidierung. `/data/**` wird im Package-Modus explizit mit 404 beantwortet, damit der generische Static-Handler nicht zum versteckten fachlichen Classpath-Fallback wird. Der öffentliche Curriculum-Katalog enthält nun geordnete, pfadfreie Deck- und Ressourceneinträge einschließlich ihrer Hrefs, aber keine Store- oder Artefaktpfade. Auch die Backend-SRS-Logik lädt Karten zielgebunden aus demselben State.

Qualitätsnachweis:

- State-, Service-, Controller-, Routing-, Modus- und Konfigurationstests für exakte Version/Deck/Locale-/Goal-/Resource-Auflösung, falsche SRS-Bindungen, semantische Manifestdrift, Traversal, externe Metadaten, Immutabilität, ETag/Cache und explizit blockierte Static-Fallbacks;
- Manipulation eines bereits geladenen Bildes wird beim nächsten Abruf durch die erneute SHA-256-Prüfung erkannt, ohne Repository-/Classpath-Ersatz;
- bestehender vollständiger Verified-Recall-/SRS-Workflow im Repository-Modus unverändert grün;
- reale Store-Probe: 12 Deckvarianten mit 128 Karten, 756 eingebettete Bilder (748 JPEG/8 PNG, 1.695.291.325 Byte), 69 externe Ressourcen, beide Sprachquellen eines Memory-Ziels sowie echte Deck- und Bildbytes verifiziert;
- vollständiges `./run_ci.sh` auf dem final dokumentierten Stand grün.

Bewusste Grenze: Der Backend-Katalog und die Bytes sind jetzt paketautoritative Runtime-Daten. Das bestehende Frontend liest Roots, Offerings und Ressourcen aber noch nicht durchgängig aus diesem Katalog; diese Umschaltung ist DPK-006c-e. Die paketgebundene Quellenanzeige folgt in DPK-006c-f, der hermetische Nachweis ohne Curriculum-Checkout und fachliche App-Fallbacks in DPK-007. Offene fachliche und rechtliche Human-Gates bleiben unverändert.

## Abgeschlossener Teilschritt: DPK-006c-e

DPK-006c-e schaltet den Browser-Consumer auf den pfadfreien Runtime-Katalog um. Der neue strikt validierende Adapter kennt genau drei Zustände: Ein gültiger Katalog der API-Version `1.1` aktiviert den Package-Modus, ausschließlich ein HTTP-`404` den Repository-Kompatibilitätsmodus; unbekannte Versionen, ungültige Cross-References, Mehrdeutigkeiten, unsichere Hrefs, Netzwerk- und Serverfehler bleiben fail-closed. Ein solcher Fehler darf weder `/match` noch `/data`, rohe Bildpfade oder andere fachliche Legacyprovider aktivieren.

Im Package-Modus werden gespeicherte oder verlinkte Landscape-IDs ausschließlich gegen die katalogisierten Landscapes und Roots normalisiert. Composition Views kommen nur noch über eine exakt deklarierte Offering-ID und `GET /api/ui/composition-views/offerings/{offeringId}`. Eine leere fachliche Konfiguration wählt das katalogisierte Default-Offering; explizite Offering-IDs aus Profil oder URL sowie vollständig abgeleitete Gymnasium-Scopes müssen exakt zum Katalog passen. Unbekannte oder nur teilweise passende Scopes fallen nicht auf `/match` oder eine freie Merge-Heuristik zurück. Repositorybetrieb behält seinen bisherigen Authoring-Pfad ausdrücklich als getrennten Zweig.

Alle drei SRS-Verbraucher erhalten Deck-URLs nun über die exakte Katalogidentität aus Landscape, genau einem `srs-deck:<deckId>`-Tag und Locale `de-DE` beziehungsweise `en`. Goal Cards lösen eingebettete Visualisierungen über Goal-Eigentum und katalogisierten `publicUrl` auf den paket- und versionsgebundenen Resource-Href auf; externe Tools bleiben katalogisierte HTTPS-Metadaten. Die öffentliche Backend-Projektion verwendet dafür den autoritativen Katalogtyp `external-tool` statt des detaillierteren Authoring-Typs `tool`. GPT-Verifikationsprompts betten Bilder nicht mehr als Chat-Images ein, sondern verweisen bei visueller Orientierung auf die normale Cockpit-Ansicht.

Qualitätsnachweis:

- ausführbarer TypeScript-Selbsttest für fremde Sentinel-Roots, Default-/exakte Offerings, de-/en-Decks, eingebettete und externe Ressourcen, API-Origin-Auflösung und Repository-Kompatibilität;
- Negativmatrix für unbekannte API-Version, falsche Roots/Default-Offerings/Views, doppelte Scope-/Deck-/Resource-Bindungen, unsichere Hrefs sowie Netzwerk-/Serverfehler ohne Legacy-Fallback;
- Backend-API-Integration über echte Package-Services für Katalog → Root → Default-Offering → View, Deck und Bild, unbekanntes Offering und gesperrtes `/data/**`;
- konditionales Controller-Gate für Package- gegenüber Repository-Modus, TypeScript, ESLint und vollständiges `./run_ci.sh` grün.

Bewusste Grenze: Die Quellenbegründungen in `GoalCard` stammen noch aus zwei eingebrannten, zusammen rund 69 MB großen Mathematik-/Physik-Indizes und dürfen deshalb noch nicht als hermetischer Package-Pfad gelten. Ihre zielgenaue, generationgebundene Ablösung ist DPK-006c-f. Erst DPK-007 beweist den vollständigen Betrieb ohne Curriculum-Checkout und fachliche App-Fallbacks. Offene fachliche und rechtliche Human-Gates bleiben unverändert.

## Abgeschlossener Teilschritt: DPK-006c-f

DPK-006c-f löst die letzte direkt eingebrannte fachliche Frontendquelle ab. Catalog API `1.2` veröffentlicht für jedes Paket mit SourceGoal-Evidenz eine pfadfreie Discovery aus Paket, Version, Ziellandschaft, geprüften Umfangszahlen und den tatsächlich verfügbaren Ziel-/Jurisdiktionspaaren. Der Browser zeigt das Quellen-Symbol ausschließlich aus dieser Discovery und lädt erst beim Öffnen genau einen Goal-Beleg. Der Request bindet die aktive Kataloggeneration als URL-Parameter; dadurch bleiben ETag und `immutable`-Cache auch nach einer späteren Lock-Aktivierung korrekt getrennt. Fehler, leere Evidenz und ungültige Antworten bleiben ohne Repository-Fallback geschlossen.

Der Backend-State liest ausschließlich das manifestgebundene `source-goal-reference-index`-Artefakt. Er prüft Rolle, Schema, logische Bindung, sichere Bytes, UTF-8-Text-Hashes, alle Counts sowie Collection-, Landscape-, Document-, Mapping- und Goal-Cross-References. Routen bevorzugen `exact` vor `partial` und erhalten innerhalb eines Typs die deklarierte globale Mapping-Kantenreihenfolge. Bekannte Ziele und Mappingziele sind auf die deklarierte Ziellandschaft begrenzt. Ein Paket ohne dieses optionale Evidenzartefakt bleibt lauffähig und veröffentlicht keine Discovery; ein Duplikat oder eine inkonsistente Bindung blockiert den Start.

Die bisherigen Mathematik-/Physik-Indizes bleiben nur noch als je eine öffentliche Repository-Authoring-Kompatibilitätsdatei erhalten. Ihre zusammen rund 69 MB großen Duplikate unter `app/src/data` wurden entfernt. Der Produktionsbuild enthält statt zweier großer Hash-Assets nur einen etwa 2,73-kB großen dynamischen Repository-Loader; weder JavaScript noch PWA-Precache enthalten die Payloads. Die UI benennt `sourceText` korrekt als geprüfte quellennahe Formulierung und behauptet ausdrücklich kein wörtliches amtliches Zitat.

Qualitätsnachweis:

- Backend-State-, Controller-, Modus-, Konfigurations- und API-Kettentests für 200/204/400/404, Generation, Cache, optionale/duplizierte Rollen, Hash-/Count-/Join-Drift, Ziellandschaft und Routenauswahl;
- reale 1,7-GB-Store-Probe mit 31 Collections, 55 Dokumenten, 9.977 SourceGoals, 33.382 Mappingkanten, 869 belegten Zielgoals und einer echten `DE-BY`-`exact`-Route;
- ausführbare Frontend-Selftests für Catalog Discovery, Jurisdiktions-/Generationsbindung, strikte Payloadprüfung und sämtliche fail-closed Fehlerpfade;
- Vite-/PWA-Build-Gate gegen Hash-Assets, Inline-Payloads und Precache-Einträge sowie Repository-Index-/Generated-Report-Konsistenz;
- TypeScript, ESLint, Diff-Gates und vollständiges `./run_ci.sh` grün.

Bewusste Grenze: DPK-006c-f beweist die einzelnen Backend- und Browserverträge, aber noch nicht den gesamten gestarteten Anwendungsfluss in einer Umgebung ohne Curriculum-Checkout und ohne fachliche statische App-Daten. Diesen Dateizugriffs-/Resource-Trace erbringt DPK-007. Offene Source-Text-, Bildfachlichkeits- und Rechte-Reviews werden durch die technische Quellenanzeige nicht geschlossen.

## Abgeschlossener Teilschritt: DPK-007

DPK-007 schließt den Nachweis, dass das JSON-Paket tatsächlich alleiniger fachlicher Input einer gestarteten SkillPilot-Instanz sein kann. Ein eigener Package-Consumer-Frontendbuild setzt `publicDir: false`, übernimmt daher weder Decks noch Visualisierungen oder Quellenindizes aus `app/public` und wird als kleiner, hashgebundener App-Shell-Build in eine schlanke Java-Runtime assembliert. Die Backend-Assembly enthält nur Produktionsklassen, Runtime-Abhängigkeiten und den H2-Treiber für den isolierten Test; der rund 3 GB große Repository-Static-Baum wird nicht kopiert.

Der Runner startet diese Assembly mit dem real provisionierten 1,7-GB-Mathematikpaket in getrennten User-, PID-, Netzwerk-, IPC- und UTS-Namespaces. `bubblewrap --clearenv` und eine feste Allowlist verhindern geerbte Hostkonfiguration. Nur Loopback ist erreichbar, der content-adressierte Package-Store ist read-only eingebunden und der vollständige Python-/Java-/HTTP-Probe-/Node-/Chromium-Prozessbaum wird mit `strace -f -yy` protokolliert. Das Repository selbst wird im Namespace verdeckt. Fünf explizite Poison-Lanes für `curricula/`, `app/public/data`, `app/src/data`, den QA-Status unter `docs/` und statische Backenddaten blieben im realen Trace unbeobachtet.

Der geschlossene funktionale Satz prüft dynamisch aus dem Katalog, ohne fest codierte Mathematik-IDs:

- App-Shell, genau ein aktives Paket, Kataloggeneration, Root-Landschaft und transitive Runtime-Closure;
- Default-Offering und dieselbe Composition View über den Scope-Matcher;
- einen neu angelegten Lernenden mit dynamisch gesetztem Paketcurriculum und 213 nichtleeren Frontier-Zielen, sämtlich innerhalb der Paket-Closure;
- ein katalogisiertes Deck, eine echte Verified-Recall-Abfrage, Bildbytes über versionierte Route und öffentlichen Alias sowie den geladenen Migrationsträger;
- generationgebundene Source-Evidence einschließlich Negativpfaden und 404 für Legacy-, Repository- und rohe Paketdatenrouten.

Ein echter Playwright-1.59.1-/Chromium-Fluss rendert dabei paketabgeleiteten Lernzieltext aus Catalog, Closure und View. Ein getrennt simulierter Catalog-404-Fall zeigt den stabilen Fail-closed-Zustand und löst weder Landscape- noch View-Fallbackrequests aus.

Der externe `package-consumer-smoke-report` bindet den Nachweis an ZIP-Größe und -SHA, Paket-/Release-ID, Manifest, `contentDigest`, Closure- und Definition-Index-Digest, den vollständigen aktiven Lock, dessen Generation, den policy-gepinnten Runner, sechs Runner-Helper sowie Frontend-, Backend-, Konfigurations-, Trace-, Assembly- und Evidence-Tree-Hashes. Readiness-Evaluator `1.3.0` führt ausschließlich diesen Runner selbst aus, bindet Exitcode, Timeout und Frische und berechnet beide kanonischen Bäume unabhängig neu. Vorhandene externe Reports bleiben unbezeugt. No-follow-/atomare Ausgabe und vollständige Pfaddisjunktheit schützen ZIP, Store, Arbeitsbaum und Ontologie-Checkout bereits vor der ersten Mutation. Die Replay-/Forgery-Matrix verwirft abweichende ZIPs, Locks, Generationen, App-Artefakte, Isolationsergebnisse, Checkreihenfolgen, nichtkanonisches JSON und 29 gezielte Consumer-Fälschungen. Ein bestandener Consumer-Gate überschreibt ausdrücklich keine offenen Rechte- oder Fachfreigaben: der reale Kandidat bleibt korrekt `not-ready-incomplete`.

Der letzte direkte Repository-Probe im Package-Modus wurde ebenfalls entfernt: `CurriculaService` erhält die Qualitätsprojektion nun über source-spezifische Provider. Nur Repository-Modus liest `docs/qa-ci/status/curriculum-quality-status.json`; Package-Modus kennt diese Pfade nicht und liefert bis zu einem eigenen Paketartefakt eine definierte leere Projektion.

Qualitätsnachweis:

- realer 1.737.052.540-Byte-Kandidat mit 15/15 funktionalen Prüfungen, fünf unbeobachteten Poison-Lanes, read-only Store und loopback-only Namespace;
- rund 28-MB-Datei-/Netzwerk-Trace ohne Checkout- oder externen Netzwerkzugriff;
- 61 Manifest-, 23 Provisioner-, sieben Readiness-, acht Validator- und 29 Consumer-Negativfälle einschließlich Repack-Replay;
- externe `assembly-manifest.json` und `evidence-bundle-manifest.json`; lokal bleiben die verifizierten Bäume erhalten, CI lädt Reports, beide Manifeste und das Evidence-Bundle für 14 Tage hoch, nicht aber die große Assembly;
- Package-/Repository-Provider-, Poison- und Spring-Kontexttests, TypeScript, Lint, Diff-Gates und vollständiges `./run_ci.sh` grün.

Die damalige technische Bildlücke ist in DPK-007a geschlossen. Resource-Index, Quality-Evidence, `contentDigest`, ZIP-Identität und die späteren Variantenbindungen verwenden seitdem ausschließlich den unveränderlichen Kandidaten `0.1.0-conformance.3`. Fachliche Bildfreigabe, Bild-/Datenrechte und Source-Text-Review bleiben menschliche Release-Gates.

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

Der historische DPK-004b-Kandidat `org.skillpilot.curriculum.de.gymnasium.mathematik@0.1.0-conformance.2` verwendete das damalige Publikationsprofil `1.1.0`. Sein Inhaltsindex umfasste 111 logische Artefakte plus 756 Binärrecords und ergab:

`sha256:3b44444b50b41f45ec1cb12d4d912a4524effe9d560d539788cfe36d4d7ffc60`

Die fail-closed Scalar-Prüfung hat dabei reale PDF-/OCR-Altlasten gefunden: C0-Steuerzeichen und nicht gepaarte UTF-16-Surrogate wurden in den Authoring-Quellen bereinigt. Die Release-Kompilation akzeptiert solche Werte nicht und ersetzt sie nicht stillschweigend durch Surrogate oder bereinigte Texte.

Die 9.977 SourceGoal-Records sind eine verlustfrei veröffentlichte, reviewte und quellennahe Authoring-Projektion, keine pauschale Behauptung wortgleicher PDF-Zitate. Der aktuelle Bestand enthält weiterhin OCR-/Transliterationsschuld; nach zusätzlicher hashgebundener PDF-Projektion bleiben 479 `sourceText`-Werte ohne maschinell hinreichenden zusammenhängenden Nachweis. Vor einer Release-Promotion bleibt deshalb eine eigene Source-Verification-QA-Lane offen, auch wenn JSON↔OWL den veröffentlichten Wortlaut bereits exakt erhält.

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
| DPK-005a | Paketweite semantische File-Bindings, kompletter Offline-Trustsatz, deterministischer sicherer ZIP32-Writer sowie Rechte- und Source-Verification-Gates eingeführt | 1/61 Manifestfälle, 22 Schemas, 34+12 Katalogfälle, komplette Readiness-Adversarialmatrix, 756 Asset-/23 Rollenbindungen, 9.493+5 maschinelle Source-Treffer/479 Humanqueue, 22 ZIP-Garantien; vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-005b | Vollständigen `full-standalone-v1`-Builder und unabhängigen Finished-ZIP-Validator umgesetzt; der reale Gate bindet 913 ZIP-Einträge, 911 Manifestdateien, 756 Bilder und den erwarteten Inhaltsdigest und klassifiziert offene Rechte ehrlich als `not-ready-incomplete` | Builder-/Validator-Selftests, Real-Plan, Finished-ZIP-Validierung und vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-006a | Read-only Backend-Consumer für einen exakt gepinnten, vorvalidierten content-adressierten Store mit Validator-v2-Trustkette und unveränderlichem Runtime-Snapshot | 29 fokussierte Backend-Tests; Validator v2 mit 28 Garantien; Readiness 1.2 mit acht Report-Fälschungen; reale 1,7-GB-Loaderprobe; vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-006b | Sicheren Quarantäne-/Streaming-Provisioner, immutable content-addressed Store, externe Betriebsverträge sowie atomare CAS-Aktivierung und Rollback umgesetzt | Operational 3/23; Provisioner 38 Garantien; reale 1,7-GB-Install-/Verify-/Activate-Strecke und echter Java-Loader; vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-006c-a | Vollständiges manifestgebundenes Runtime-Artefaktinventar, erneut verifizierende Lesefassade und verlustfreie Java-/TypeScript-Modellparität eingeführt | 911 reale Artefakte; absent-vs.-false-/Semantic-/Experiment-/Review-Tests; Limit-/Unknown-Key-/Hashdrift-Proben; vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-006c-b | Landschaften, Root-/Goal-Indizes, amtliche Source-Metadaten und verlustfreie Mehrfach-Mappings ausschließlich aus einer Package-Generation bereitgestellt; Repository-/Classpath-Fallback im Package-Modus entfernt | 13 Compiler-/State-Tests; Poison-/Konfigurationsgates; reale Probe mit 1.079 Zielen, 31 Collections, 55 Dokumenten, 9.977 Source Goals, 10.021 Entscheidungen und 33.382 Kanten; vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-006c-c | Runtime-Katalog, Views und Offerings generationsgebunden und exakt aufgelöst; freie Merge-/Scope-Heuristiken im Package-Modus entfernt und Verbraucher bei nicht angebotenen Scopes fail-closed geschaltet | State-/Konfigurations-/Controller-/Consumer-Gates; Repository-Regression; reale Probe mit 88 Views und 88 Offerings; vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-006c-d | Decks, Karten und Bilder ziel-, paket-, versions- und generationsgebunden aufgelöst; Package-Modus ohne Repository-, Classpath- oder Static-Data-Fallback | Resolver-/Binding-/Tamper-/Routing-/Cache-/Modus-Gates; reale Probe mit 12 Decks/128 Karten, 756 Bildern und 69 externen Ressourcen; vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-006c-e | Frontend strikt zwischen Package-, Repository- und Fehlerzustand getrennt und auf katalogisierte Roots, exakte Offerings, Decks, Bilder und externe Ressourcen umgestellt | TypeScript-Adapter-/Negativmatrix; Backend-API-Kette; Modus-/Fallback-Gates; TypeScript/ESLint; vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-006c-f | Quellenanzeige generationgebunden aus paketierter SourceGoal-Evidenz; keine eingebetteten fachlichen Indizes | State-/API-/Frontend-Negativmatrix; reale 31/55/9.977/33.382/869-Probe; Build-/Precache-Gates; vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-007 | Hermetischen Package-only Mathematik-Consumer einschließlich echter Browserdarstellung und checkout-freiem Trace umgesetzt | 15/15 reale Consumer-Prüfungen, fünf unbeobachtete Poison-Lanes, 29 Fälschungsfälle; vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-007a | Letzte Visualisierung technisch importiert, Core-/Registry-Lanes ausgerichtet und unveränderlichen `.3`-Kandidaten eingefroren | 914/912/757, Digest-/ZIP-/Manifest-/Closure-Pins, Profilalignment-Mutationen; vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-008a | Geschlossenen FWU-OWL-Vertragskern mit gepinnten Core-/Profil-/Shapes-/Schema-Trust-Roots und externem 18-Gate-Report definiert | 96 FWU-OWL- und 61 Dual-Release-Mutationen, Raw-JSON-Fälle und vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-008b | Generischen Core-first Exporter und atomaren reproduzierbaren FWU-OWL-ZIP-Builder auf dem eingefrorenen `.3`-JSON-Paket umgesetzt | 819/817/757/32/111, nach Core-Referenzkorrektur 823.890 RDF-Tripel, byteidentisches Buildpaar, TypeScript-/Compiler-/ZIP-Gates und vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-008c | Unabhängigen Finished-FWU-OWL-Validator samt gepinnter Offline-Ontologie-Toolchain und direkter Kompetenzressourcen-Projektion umgesetzt | 40 Selftest-Garantien; realer schema-valider 18/18-Report für 819/817/8/823.890/111/454/757; SHACL 0/0, OWL 2 DL, HermiT konsistent/0 unerfüllbar; hermetischer JSON-Consumer 15/15; vollständiges `./run_ci.sh` grün | 2026-07-11 |

## Verbleibende Roadmap

| ID | Phase | Ergebnis | Abhängigkeit | Status |
| --- | --- | --- | --- | --- |
| DPK-001 | P0 | JSON-Manifest-/Profilvertrag v1 und Conformance-Validator | DPK-000 | `complete` |
| DPK-002 | P0 | Runtime-Katalogschema, paketlokaler Offline-Schema-Katalog, Artefaktrollen und ehrliche Readiness-Auswertung | DPK-001 | `complete` |
| DPK-003 | P0 | Feldsemantik-/RDF-Mappingregistry, versionierte Normalform sowie Release-Index-/Äquivalenzreport-Schemas | DPK-001 | `complete` |
| DPK-004 | P0 | Closure-, Ownership-, Konflikt- und Migrationsverträge; vollständige Mathematik-Conformance-Kompilation in das neue Release-Modell | DPK-002–DPK-003 | `complete` |
| DPK-004a | P0 | Entpacktes Runtime-Modell mit strikten Payload-Schemas, Semantic-Kind-Ledger, Fixpunkt-Closure, Migration, Ressourcenbindung und realer Mathematik-Kompilation | DPK-002–DPK-003 | `complete` |
| DPK-004b | P0 | Mapping-, Quellen- und Quality-Felder vollständig als Runtime-, Publikations-Evidenz oder Authoring-only klassifizieren und in die Mathematik-Conformance aufnehmen | DPK-004a | `complete` |
| DPK-005 | P1 | Mathematik-JSON-Paket nach `full-standalone-v1` bauen, strikt validieren und Human-Review-Schuld als maschinenlesbare Release-Gates führen | DPK-002–DPK-004 | `complete` |
| DPK-005a | P1 | Package-Trust, File-Semantik, deterministisches ZIP32 sowie Redistribution-/Source-Review-Lanes | DPK-002–DPK-004 | `complete` |
| DPK-005b | P1 | Vollständiges reales Mathematik-Inventar und ZIP materialisieren, paketlokal validieren und reproduzieren | DPK-005a | `complete` |
| DPK-006 | P1 | Manifestbasierter Backend-Package-Loader mit lokalem Store und Lock | DPK-005 | `complete` |
| DPK-006a | P1 | Exakten vorvalidierten Store read-only laden und atomaren unveränderlichen Runtime-Snapshot aufbauen | DPK-005 | `complete` |
| DPK-006b | P1 | ZIP sicher provisionieren, content-adressiert promoten sowie Lock per CAS aktivieren und zurückrollen | DPK-006a | `complete` |
| DPK-006c | P1 | Landschafts-, View-, Deck-, Mapping- und Asset-Services ohne Fallback auf den Snapshot umstellen | DPK-006b | `complete` |
| DPK-006c-a | P1 | Vollständiges Manifestinventar, sichere Artefaktfassade und Runtime-Modellparität | DPK-006b | `complete` |
| DPK-006c-b | P1 | Landschafts- und Mapping-Services ausschließlich aus dem Snapshot bedienen | DPK-006c-a | `complete` |
| DPK-006c-c | P1 | Exakten Runtime-Katalog und Offering-/Composition-View-Auflösung bereitstellen | DPK-006c-b | `complete` |
| DPK-006c-d | P1 | Paket- und generationsgebundene Deck-/Bildauflösung ohne Classpath-Fallback | DPK-006c-c | `complete` |
| DPK-006c-e | P1 | Frontend auf katalogisierte Roots, Offerings und Ressourcen umstellen | DPK-006c-d | `complete` |
| DPK-006c-f | P1 | Paketgebundene Quellenanzeige statt eingebrannter fachlicher Daten | DPK-006c-e | `complete` |
| DPK-007 | P1 | Package-only Mathematik-Smoke-Test einschließlich Views, Karten und Bildern | DPK-006 | `complete` |
| DPK-007a | P2 | Letzte fehlende Mathematik-Visualisierung technisch importieren und unveränderlichen `.3`-Content-Freeze erzeugen | DPK-007 | `complete` |
| DPK-008 | P2 | FWU-OWL-Manifest/-Profil, Ontologie-Exporter und Reverse Compiler auf Paketverträge umstellen | DPK-003–DPK-005, DPK-007a | `in_progress` |
| DPK-008a | P2 | Geschlossenes FWU-OWL-Manifest, Paketprofil und externes Validierungsreport-Format | DPK-007a | `complete` |
| DPK-008b | P2 | Paketgetriebenen Core-first Exporter und reproduzierbares FWU-OWL-ZIP implementieren | DPK-008a | `complete` |
| DPK-008c | P2 | Unabhängige RDF-, SHACL-, OWL-2-DL- und HermiT-Paket-QS vervollständigen | DPK-008b | `complete` |
| DPK-008d | P2 | Isolierten Reverse Compiler zum installierbaren JSON-Runtime-ZIP implementieren | DPK-008c | `in_progress` |
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
| DPK-005a | Manifest 1/61; vollständiger 22-Schema-Katalog 1/34 + 12 Bindings; Readiness einschließlich Redistribution; 756 Bild-/23 Rollen-Lizenzbindungen und 17 Mutationen; Source Verification 9.493+5+479, 8 Mutationen und PDF-Replay; ZIP32 Golden-/Safety-/Legacy-Bytegleichheit; Doku-, Workflow-, Lint-, TypeScript- und Diff-Gates | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-005b | Builder- und unabhängiger Validator-Selftest; Real-Paket 913/911/756 plus Digest; Finished-ZIP-, Readiness-, Code-, Workflow- und Doku-Integration | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-006a | 29 Backend-Package-Tests; Report-v2-Replay-/Tamper-/Path-/Conflict-Gates; Validator 28; Readiness 1.2; Builder; reale Paket-/Loaderprobe; Doku- und Diff-Gates | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-006b | Operational Contracts 3/23; Provisioner-Selftest 38; Crash-/Poison-/Permission-/Replay-/CAS-/Rollback-/Multi-Package-Gates; realer Build→Validator→Store→Activate→Java-Loader; Workflow-, Doku- und Diff-Gates | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-006c-a | Package-Modellparität; vollständiger Artefaktindex; Unknown-Key-/Limit-/Hashdrift-Gates; reales Inventar 911 einschließlich Mapping/Quality; TypeScript, ESLint, Doku und Diff | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-006c-b | Geschlossener Mapping-/Source-Compiler; Mehrfach-`exact`-/Mixed-/Count-/Join-/Conflict-/Immutability-Gates; konditionale Services und Repository-Poison; reale 31/55/9.977/10.021/33.382-Paketprobe; Landscape-/Mapping-Regression | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-006c-c | Exakte View-/Offering-Indizes; Single-/Merge-/Scope-/Order-/Visibility-/Immutability-Gates; konditionale Repository-/Package-Services; Catalog-/Offering-API; Consumer-Fail-closed; reale 88/88-Paketprobe | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-006c-d | Exakte Deck-/Goal-/Locale- und Resource-/PublicUrl-Indizes; Semantic-Binding-/Capability-/Owner-/Limit-/Tamper-Gates; konditionale Services/Controller; Static-Fallback-Sperre; pfadfreie Hrefs; reale 12/128/756/69-Paketprobe | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-006c-e | Frontend-Katalogadapter und Modustrennung; Root-/Offering-/Deck-/Resource-Resolver samt Negativmatrix; Backend-API-Kette und Controller-Modus; TypeScript, ESLint, Doku- und Workflow-Gates | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-006c-f | SourceGoal-Evidence-State und 200/204/400/404-API; Generation-/Cache-/Hash-/Count-/Crossref-/Order-/Optionalitäts-Gates; Frontend-Discovery und Lazy-Fetch; kein großer Build-/Precache-Index; reale 31/55/9.977/33.382/869-Probe | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-007 | Source-spezifische Quality-Provider; Catalog-only Frontend/Runtime; echter React-/Chromium-Fluss und 404-Fail-closed; evaluator-gesteuerte Runner-Attestation; bwrap-/strace-Isolation; fünf Poison-Lanes; 29 Consumer-Fälschungen, Output-Destruktions- und Replay-Gates | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-007a | Letzter Bildimport; 754/754 Atomic-Scope-Abdeckung; 914/912/757-Paketfreeze; Profile `1.1.1`; unveränderte 454-Einträge-Registry und Core-/Order-Lane-Mutationen; unabhängige Modell-/ZIP-/Readiness-Prüfung | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-008a | FWU-OWL-Verträge: eine positive Fixture, zwei frühe nicht-erfolgreiche Receipts, 96 fail-closed Mutationen, zwei Raw-JSON-Fälle, 14 Rollen, 12 Bindungen, 18 Gates, 510+16 geschlossene Deklarationen, extern gepinnte Core-/Katalog-/Profil-/Shapes-/Schema-/Semantik-Trust-Roots sowie 61 getrennte Dual-Contract-Mutationen | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-008b | TypeScript-Selftest für 454 Registry-Einträge, 526 Deklarationen, Core-Projektionen, Feldzustände, Referenzrollen, Punning- und Pfad-/Integritätsguards; realer atomarer Doppelbuild 819/817/757/32/111, nach direkter Kompetenzressourcen-Korrektur 823.890 Tripel und byteidentische 2.362.017.770-Byte-ZIPs | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-008c | 40 Validator-Sicherheits-/Semantikgarantien; exakte jsonschema-/pySHACL-/RDFLib-/owlrl-/ROBOT-/Corretto-Pins; realer 18/18-Report mit SHACL 0/0, OWL 2 DL, HermiT konsistent/0 unerfüllbar, 757 bytegeprüften Sidecars und byteidentischem Peer; Java-FD-Sandbox-Selftest und realer Consumer 15/15 | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |

Rohlogs und temporäre Artefakte bleiben unter `tmp/` oder in CI-Artefakten und werden nicht in dieser Seite dupliziert.

## Pflege- und Commit-Konvention

- Ein Schritt wird erst `complete`, wenn seine gezielten Prüfungen und danach das vollständige `./run_ci.sh` bestanden haben.
- Nach erfolgreicher Qualitätssicherung wird genau dieser abgegrenzte Stand committed.
- Schlägt ein Gate fehl, bleibt der Schritt `in_progress`; es gibt keinen Zwischencommit mit nur teilweise erfüllter Abnahme.
- Vor dem finalen CI-Lauf eines Schritts werden diese Tabellen bereits auf den erwarteten Abschlussstand gesetzt. Der Commit erfolgt nur, wenn der Lauf tatsächlich grün bleibt.
- Der nächste Schritt beginnt erst auf dem sauberen Commit des vorherigen Schritts.
- Maschinenlesbare paketbezogene Readiness-Berichte bleiben temporäre Build-/CI-Artefakte unter `tmp/exports/readiness/`; diese authored Seite bleibt die Quelle für Arbeitsstand und Priorisierung.
