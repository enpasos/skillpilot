## Duale Curriculum-Pakete: JSON-Runtime und Lehrplan-Ontologie {#sec:sga-dual-packages}

Jeder versionierte Curriculum-Release veröffentlicht **genau einen fachlichen Stand** in zwei semantisch gleichwertigen Darstellungen – ohne doppelte Fachpflege und ohne Zugriff einer SkillPilot-Installation auf den `curricula/`-Quellbaum (aktueller Checkpoint: [Umsetzungsstand Duale Pakete](repo:docs/dev/dual-curriculum-package-implementation-status.md); operative Verträge: [Paketbereitschaft](repo:docs/qa-ci/curriculum-package-readiness.md), [Release-Modell-Konformität](repo:docs/qa-ci/curriculum-release-model-conformance.md), [Duale Release-Verträge](repo:docs/qa-ci/dual-curriculum-release-contracts.md) und [Paketprovisionierung](repo:docs/production-pipelines/curriculum-package-provisioning.en.md)).

### Sieben verbindliche Architekturentscheidungen und Release-Artefakte {#sec:sga-dp-architecture}

```text
Authoring-Quellen -> Release-Compiler -> Normalisiertes Release-Modell
  -> JSON-Runtime-ZIP (<id>-<ver>.json.zip)
       -> Core-first-Ontologie-Exporter -> FWU/OWL-ZIP (<id>-<ver>.fwu-owl.zip)
            -> Isolierter Reverse-Compiler (bubblewrap, kein Quell-JSON)
                 -> Rekonstruiertes JSON-Modell -> Semantisches Aequivalenz-Gate
```

1. **Keine doppelte Fachpflege:** Beide ZIPs entstehen aus demselben Quellstand; Korrekturen erfolgen ausschließlich in den Authoring-Quellen.
2. **Das JSON-ZIP ist die normative Runtime-Referenz (`full-standalone-v1`):** Enthält `metadata/manifest.json` (explizite Artefaktrollen, Offline-`schemas/catalog.json`), `data/runtime/{catalog.json,dependency-closure.json,migration-aliases.json}`, fertig kompilierte `applicability`, `canonical/`, `views/`, `cards/`, `resources/`, `mappings/`, `sources/`, `metadata/quality/`, `assets/` und `licenses/`, lauffähig ohne `curricula/`- oder `app/public`-Fallbacks unter festen ZIP32-Grenzen (`3,5 GB` Archiv, `60.000` Einträge, `64 MiB` je JSON/Bild, JSON-Tiefe `128`, Kompressionsfaktor `100:1`/`25:1`).
3. **Das Ontologie-ZIP wird strikt aus dem fertigen JSON-ZIP abgeleitet:** Enthält `rdf/{declarations,runtime,landscape,views,mappings,sources,cards,assets,bundle}.nt`, `skillpilot-curriculum-profile.ttl`, `catalog-v001.xml`, gepinnte `ontology/{lehrplan-core.owl,shapes.ttl}` sowie identische Binär-Sidecars (geprüft auf RDF-Syntax, SHACL, OWL 2 DL via ROBOT und HermiT-Konsistenz).
4. **Semantische Äquivalenz & gemeinsamer `contentDigest`:** Gesteuert durch eine geschlossene **454-Regeln-Feldsemantik-Registry** (`323` Runtime-Felder + `130` Publikationsnormalformen + `1` Historieneintrag; `scalar`, `ordered-list`, `set`, `map`, `binary-reference`, `generated-non-semantic`; abgebildet über `fwu-core`, `skillpilot-profile`, eng begrenztes `registered-canonical-json-literal` oder `excluded-generated`). Unregistrierte Felder blockieren den Build; Placement-Identitäten lauten `goalId@unitId@index`.
5. **Core-first statt Core-only:** Deklarative Fachprofile bilden das verpflichtende `semanticKind` (`curricularAtomic`, `curricularArea`, `programStructure`, `practiceAssessment`, `memory`, `orientation`, `runtimeSupport`) ohne Titelraten ab.
6. **Keine versteckte JSON-Vollkopie:** Zwei netzlose `bubblewrap --clearenv`-Läufe (`DPK-008d`) beweisen die verlustfreie Rekonstruktion allein aus RDF und Sidecars.
7. **Externer Release-Index & Signing-Projection:** `<id>-<ver>.release.json`, `.equivalence.json`, `.provenance.json`, `.SHA256SUMS` und `.release.json.sig` (Entfernung von `authentication.releaseIndexSignature` vor Kanonisierung/Hash) samt signiertem Veröffentlichungskatalog (`staging` $\to$ `stable`, niemals ungepinntes `latest`).

### Generische Runtime-Entkopplung, Versionierung und Phasen 0–6 {#sec:sga-dp-runtime-phases}

Vier generische Bausteine lösen SkillPilot von Repositorypfaden: `CurriculumPackageRepository` (Read-only-Lock-/CAS-Leser), `JsonCurriculumPackageLoader` (schema- und hashprüfender Modellaufbau), `CurriculumResourceResolver` (versionsgebundene Hrefs für `(packageId, deckId, locale)` und `(packageId, resourceId)`) sowie `CurriculumActivationService` (Quarantäne-Extraktion, Dry-Run-Prüfung, atomarer CAS-Lock-Wechsel, Rollback). Versionsachsen bleiben orthogonal (`packageVersion`, `curriculumEdition`, `packageFormatVersion`, `runtimeContractVersion`, `supportedSkillpilotSoftware` aktuell `>=0.1.0 <1.0.0` für Consumer `0.1.0`, `ontologyProfileVersion` sowie gepinnter FWU-Core-Commit/SHA), während `migration-aliases.json` `renamed` (automatische Mastery-Übernahme) von `replacedBy`, `splitInto`, `mergedInto` und `removed` trennt. Lizenzen führen `licenseExpression`, `provenanceClass` und `redistributionStatus` getrennt (`review-required` hält Staging-Kandidaten ehrlich auf `not-ready-incomplete`).

| Phase | Umfang & erreichter Meilensteinstand |
| --- | --- |
| **Phase 0** | **Technisch abgeschlossen (`DPK-004` / `DPK-007a`):** Eingefrorener Mathematikstand `0.1.0-conformance.3` (`914` ZIP-Einträge, `757` Bilder, 454-Regeln-Registry; bewusst `not-ready-incomplete` bis zum Abschluss menschlicher Bild-/Rechte-/Quellentext-Gates). |
| **Phase 1** | **Technisch abgeschlossen (`DPK-005b`–`DPK-007`):** Hermetischer `bubblewrap`- + Corretto- + Playwright-Consumer verifiziert (`1.079` Ziele, `33.382` Source-Mappings, `88` Views, `12` Decks, `757` Bilder, null Repository-Zugriffe unter `strace`). |
| **Phase 2** | **Technisch abgeschlossen (`DPK-008a`–`DPK-008d`):** Reproduzierbares FWU-OWL-Paket (`824.452` Tripel, SHACL/ROBOT/HermiT grün) und isolierte bytegleiche JSON-ZIP-Rekonstruktion (`911` Einträge, `111` logische Artefakte). |
| **Phase 3** | **Nächster Schritt (`DPK-009`, `not_started`):** Nachgelagerter Äquivalenz-Oracle-Abgleich, dualer hermetischer Consumer-Smoke-Test, isolierte `JSON -> FWU`-Paarreproduzierbarkeit und signierter externer `release.json`. |
| **Phasen 4–6** | Mehr-Fächer-Ausbau (Mathe $\to$ Physik mit eingebetteter Closure $\to$ Sprachen $\to$ Chemie) $\to$ produktiver Mehrpaket-/Upgrade-Betrieb $\to$ Repository-Trennung zwischen Curriculum-Tooling und SkillPilot-Software. |
{cols="18%,82%"}
