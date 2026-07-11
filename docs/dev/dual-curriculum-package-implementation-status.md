# Dual Curriculum Package Implementation Status

- Stand: 2026-07-11
- Zielbild: [Duale Curriculum-Pakete: JSON-Runtime und Lehrplan-Ontologie](../concept/curriculum-graph/dual-curriculum-package-releases.md)
- Aktive Phase: `P1 – JSON-Paket als hermetischer Runtime-Input`
- Nächster Umsetzungsschritt: `DPK-006c-b – Landschafts- und Mapping-Services auf das Package-Inventar umstellen`
- Letzter vollständig abgeschlossener Schritt: `DPK-006c-a – vollständiges Runtime-Artefaktinventar und DTO-Parität`
- Solider Ausgangsstand: `DPK-006c-a`
- Abschluss-Gate für DPK-006c-a: 911 reale Manifestartefakte, sichere Reverify-Fassade, Modellparität und vollständiges `./run_ci.sh` grün
- Technische Blocker: keine
- Public-Release-Gates: [konkrete menschliche Reviewliste](../qa-ci/curriculum-package-human-review-gates.md)

Diese Seite ist das kurze, gepflegte Workboard für die Umsetzung. Das Konzeptdokument bleibt die Quelle für Zielarchitektur und endgültige Abnahmekriterien; Git-Historie und CI-Artefakte ersetzen ein langes Umsetzungstagebuch.

## Auf einen Blick

| Phase | Angestrebtes Ergebnis | Status | Nächster Gate |
| --- | --- | --- | --- |
| P0 | Versionierte, ausführbar geprüfte Paket-, Profil- und Äquivalenzverträge samt vollständigem Mathematik-Conformance-Modell | `complete` | abgeschlossen |
| P1 | JSON-Paket als hermetischer SkillPilot-Runtime-Input | `in_progress` | DPK-006c-b–f/007: Services, Frontend und Smoke-Test umstellen |
| P2 | Fachübergreifendes Core-first Ontologieformat mit Reverse Compiler | `not_started` | Mathematik ohne Original-JSON rekonstruieren |
| P3 | Gemeinsamer `contentDigest` und Dual-Release-Gate | `not_started` | Manipulationen beider Varianten sicher erkennen |
| P4 | Generalisierung über Mathematik hinaus | `not_started` | Physik und ein sprachliches Fach bestehen |
| P5 | Signierter Package-Betrieb und Veröffentlichungskatalog | `not_started` | atomare Stable-Promotion und Rollback |
| P6 | Trennung von Curriculum-Erstellung und SkillPilot-Software | `not_started` | Software benötigt keinen produktiven Curriculum-Quellbaum |

Statuswerte: `not_started`, `in_progress`, `complete`, `blocked`, `deferred`. Es ist höchstens ein Schritt gleichzeitig `in_progress`.

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

`scripts/run_curriculum_release_model_conformance.sh` baut weiterhin zwei bytegleiche Release-Modell-Verzeichnisse und ruft danach den realen ZIP-Builder genau einmal auf; dessen interner Doppelbuild beweist die ZIP-Reproduzierbarkeit. Der Wrapper schreibt ZIP, Build-Zusammenfassung, unabhängigen Validatorreport und Readiness-Report unter `tmp/curriculum-release-model/full-standalone-package/`. Der Kandidat muss technisch valide sein, bleibt wegen offener Redistribution-Entscheidungen aber ehrlich `not-ready-incomplete`. DPK-006a lädt einen vorvalidierten Store inzwischen exakt; DPK-006b/006c/007 müssen noch sichere Provisionierung und den Betrieb ohne `curricula/`- oder `app/public`-Fallback beweisen.

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
| DPK-005a | Paketweite semantische File-Bindings, kompletter Offline-Trustsatz, deterministischer sicherer ZIP32-Writer sowie Rechte- und Source-Verification-Gates eingeführt | 1/61 Manifestfälle, 22 Schemas, 34+12 Katalogfälle, komplette Readiness-Adversarialmatrix, 756 Asset-/23 Rollenbindungen, 9.493+5 maschinelle Source-Treffer/479 Humanqueue, 22 ZIP-Garantien; vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-005b | Vollständigen `full-standalone-v1`-Builder und unabhängigen Finished-ZIP-Validator umgesetzt; der reale Gate bindet 913 ZIP-Einträge, 911 Manifestdateien, 756 Bilder und den erwarteten Inhaltsdigest und klassifiziert offene Rechte ehrlich als `not-ready-incomplete` | Builder-/Validator-Selftests, Real-Plan, Finished-ZIP-Validierung und vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-006a | Read-only Backend-Consumer für einen exakt gepinnten, vorvalidierten content-adressierten Store mit Validator-v2-Trustkette und unveränderlichem Runtime-Snapshot | 29 fokussierte Backend-Tests; Validator v2 mit 28 Garantien; Readiness 1.2 mit acht Report-Fälschungen; reale 1,7-GB-Loaderprobe; vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-006b | Sicheren Quarantäne-/Streaming-Provisioner, immutable content-addressed Store, externe Betriebsverträge sowie atomare CAS-Aktivierung und Rollback umgesetzt | Operational 3/23; Provisioner 38 Garantien; reale 1,7-GB-Install-/Verify-/Activate-Strecke und echter Java-Loader; vollständiges `./run_ci.sh` grün | 2026-07-11 |
| DPK-006c-a | Vollständiges manifestgebundenes Runtime-Artefaktinventar, erneut verifizierende Lesefassade und verlustfreie Java-/TypeScript-Modellparität eingeführt | 911 reale Artefakte; absent-vs.-false-/Semantic-/Experiment-/Review-Tests; Limit-/Unknown-Key-/Hashdrift-Proben; vollständiges `./run_ci.sh` grün | 2026-07-11 |

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
| DPK-006 | P1 | Manifestbasierter Backend-Package-Loader mit lokalem Store und Lock | DPK-005 | `in_progress` |
| DPK-006a | P1 | Exakten vorvalidierten Store read-only laden und atomaren unveränderlichen Runtime-Snapshot aufbauen | DPK-005 | `complete` |
| DPK-006b | P1 | ZIP sicher provisionieren, content-adressiert promoten sowie Lock per CAS aktivieren und zurückrollen | DPK-006a | `complete` |
| DPK-006c | P1 | Landschafts-, View-, Deck-, Mapping- und Asset-Services ohne Fallback auf den Snapshot umstellen | DPK-006b | `in_progress` |
| DPK-006c-a | P1 | Vollständiges Manifestinventar, sichere Artefaktfassade und Runtime-Modellparität | DPK-006b | `complete` |
| DPK-006c-b | P1 | Landschafts- und Mapping-Services ausschließlich aus dem Snapshot bedienen | DPK-006c-a | `in_progress` |
| DPK-006c-c | P1 | Exakten Runtime-Katalog und Offering-/Composition-View-Auflösung bereitstellen | DPK-006c-b | `not_started` |
| DPK-006c-d | P1 | Paket- und generationsgebundene Deck-/Bildauflösung ohne Classpath-Fallback | DPK-006c-c | `not_started` |
| DPK-006c-e | P1 | Frontend auf katalogisierte Roots, Offerings und Ressourcen umstellen | DPK-006c-d | `not_started` |
| DPK-006c-f | P1 | Paketgebundene Quellenanzeige statt eingebrannter fachlicher Daten | DPK-006c-e | `not_started` |
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
| DPK-005a | Manifest 1/61; vollständiger 22-Schema-Katalog 1/34 + 12 Bindings; Readiness einschließlich Redistribution; 756 Bild-/23 Rollen-Lizenzbindungen und 17 Mutationen; Source Verification 9.493+5+479, 8 Mutationen und PDF-Replay; ZIP32 Golden-/Safety-/Legacy-Bytegleichheit; Doku-, Workflow-, Lint-, TypeScript- und Diff-Gates | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-005b | Builder- und unabhängiger Validator-Selftest; Real-Paket 913/911/756 plus Digest; Finished-ZIP-, Readiness-, Code-, Workflow- und Doku-Integration | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-006a | 29 Backend-Package-Tests; Report-v2-Replay-/Tamper-/Path-/Conflict-Gates; Validator 28; Readiness 1.2; Builder; reale Paket-/Loaderprobe; Doku- und Diff-Gates | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-006b | Operational Contracts 3/23; Provisioner-Selftest 38; Crash-/Poison-/Permission-/Replay-/CAS-/Rollback-/Multi-Package-Gates; realer Build→Validator→Store→Activate→Java-Loader; Workflow-, Doku- und Diff-Gates | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |
| DPK-006c-a | Package-Modellparität; vollständiger Artefaktindex; Unknown-Key-/Limit-/Hashdrift-Gates; reales Inventar 911 einschließlich Mapping/Quality; TypeScript, ESLint, Doku und Diff | `./run_ci.sh`, lokal, 2026-07-11, Exit 0 | `passed` |

Rohlogs und temporäre Artefakte bleiben unter `tmp/` oder in CI-Artefakten und werden nicht in dieser Seite dupliziert.

## Pflege- und Commit-Konvention

- Ein Schritt wird erst `complete`, wenn seine gezielten Prüfungen und danach das vollständige `./run_ci.sh` bestanden haben.
- Nach erfolgreicher Qualitätssicherung wird genau dieser abgegrenzte Stand committed.
- Schlägt ein Gate fehl, bleibt der Schritt `in_progress`; es gibt keinen Zwischencommit mit nur teilweise erfüllter Abnahme.
- Vor dem finalen CI-Lauf eines Schritts werden diese Tabellen bereits auf den erwarteten Abschlussstand gesetzt. Der Commit erfolgt nur, wenn der Lauf tatsächlich grün bleibt.
- Der nächste Schritt beginnt erst auf dem sauberen Commit des vorherigen Schritts.
- Maschinenlesbare paketbezogene Readiness-Berichte bleiben temporäre Build-/CI-Artefakte unter `tmp/exports/readiness/`; diese authored Seite bleibt die Quelle für Arbeitsstand und Priorisierung.
