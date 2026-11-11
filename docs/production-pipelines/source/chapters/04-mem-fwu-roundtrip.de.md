## MEM/FWU-Core-Roundtrip-Pipeline {#sec:pp-mem-fwu-roundtrip}

Diese Pipeline beweist, dass ein SkillPilot-Publikationspaket in ein Core-first-RDF/OWL-Bündel auf Basis der FWU-Lehrplan-Ontologie (`tmp/lehrplan-ontologie`, `src/ontology/components/lehrplan-core.owl`, IRI `https://w3id.org/lehrplan/ontology/lp/components/lehrplan-core.owl`) transformiert und anschließend **ohne Zugriff auf das Original-JSON oder den Checkout** verlustfrei rekonstruiert werden kann ([Duale Release-Verträge](repo:docs/qa-ci/dual-curriculum-release-contracts.md), [Menschliche Review-Gates](repo:docs/qa-ci/curriculum-package-human-review-gates.md)).

### Zwei koexistierende Lanes (`DPK-007a`/`008c`/`008d` vs. Slim-Pilot) {#sec:pp-roundtrip-lanes}

1. **Produktive `fwu-owl-v1`-Release-Konformität (`DPK-008a`–`008d`):** Nimmt das eingefrorene `DPK-007a`-JSON-Artefakt (`skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-conformance.3.json.zip`, `1.738.161.217` Byte, SHA-256 `403cc0bc6004da549c8b9ed9fafad222fe0ddda1107806fe087cfa871a6dbcf9`, `contentDigest` `sha256:e83936aaf3645ff5f6e8132c4a801bd4bd66f55d3c0304a5deda3d6a5d194101`), erzeugt den byteidentischen 2,36-GB-FWU-OWL-Träger (`DPK-008c`: `2.362.455.128` Byte, SHA-256 `abab1d8aac3e9394af26c614bbf231954ba45ab11f725dd0f93f088820dc3f94`, Manifest `29f308424d1aeba9095f0e800253acadcdfaca0562dfa1fc37741c77c76023b3`, `819` Einträge, `757` Bild-Sidecars, `824.452` Tripel über 8 RDF-Segmente, 18/18 Gates bestanden, Placement-Schlüssel `goalId@unitId@index`) und übersetzt diesen in `DPK-008d` isoliert unter `bubblewrap --clearenv` (`python -I -S`, kein Netzwerk, Host-Rawtrace-ELF-Audit) in zwei byteidentische JSON-ZIPs zurück (`1.737.571.471` Byte, SHA-256 `7dcd233dd495900f6d6bd971ff6e86bdcdcfe5701f3522ed480be8336de23195`, Manifest `8d7970435431ff78743d0bf413a54bbebee009bbaafe35f1283ebcb89b4f2ff0`, 111/111 Normalform-Oracles; das öffentliche Äquivalenzurteil folgt erst in `DPK-009`).
2. **Legacy-Slim-Pilot (`tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip`):** Schnelle Regressions-Lane unter `tmp/roundtrip/mem-fwu/.../slim/` (`declarations.nt` mit exakt `526` Deklarationstripeln, `landscape.nt`, `assets.nt`, `sources.nt`, `mappings.nt`, `views.nt`, `cards.nt`, abgeleitetes `bundle.nt`, `catalog-v001.xml`, `skillpilot-mem-fwu-profile.ttl`, `manifest.json`). Da der Legacy-Comparator `null`-Felder verwirft und Arrays teilweise als Mengen vergleicht, gelten seine Berichte ausschließlich als Regressionsnachweis (`not-ready-legacy`), niemals als öffentliches Äquivalenzurteil.

### Core-First-Abbildungsregeln und Bild-Sidecars {#sec:pp-roundtrip-mapping}

:::table{cols="4.2cm,4.4cm,X",longtable=true}
| SkillPilot-Konzept | Primäre FWU-Core-Darstellung | Anwendungs-Erweiterung / Rückübersetzungsanker |
| --- | --- | --- |
| Fachliches Atomziel (`curricularAtomic`) | `LP_0000336` (*Fachbezogene Kompetenzspezifikation*; ohne Bereichs-Eltern zusätzlich unter deterministischem Fallback-Bereich `LP_0000349`) | `sp:LearningGoal` + `sp:AtomicGoal` (Fallback-Bereich wird bei Rekonstruktion ignoriert) |
| Fachlicher Cluster (`curricularArea`) | `LP_0000349` (*CE-Bereich*) | `sp:LearningGoal` + `sp:ClusterGoal` |
| Prozessachsen `K1`–`K6` / Leitideen `L1`–`L5` | `27` `LP_0030265`- bzw. `5` `LP_0000268`-Ressourcen; Verweis über `LP_0030065` (`LP_0030071`/`LP_0030072`) | `sp:referenceRole` trennt authored `competencyRefs` von abgeleiteten `dimensionTags`; `sp:dimensionTagsJson` sichert Verlustfreiheit |
| Jahrgang / Schulstufe | `LP_0000026` (`LP_2000005`–`LP_2000010`), `LP_0000047` (Sek I/II) | `sp:ProgramUnit` & Placement-Metadaten (`goalId@unitId@index`) |
| Fachliches `contains` | `BFO_0000051` (*hat Teil*, transitiv) | Direktes `sp:containsGoal` verhindert falsche direkte Kinder durch BFO-Inferenz |
| Fachliches vs. Laufzeit-`requires` | Reifiziertes `LP_0000554` (*Didaktische Voraussetzung*, aus `FWU-DE/lehrplan-ontologie#9`) | `sp:didacticRequires` für Übungs-, Prüfungs-, Memory- und Orientierungsknoten |
| Titel / Beschreibung / Kurzschlüssel | `LP_0030056` / `LP_0030051` / `LP_0030057` $\to$ `LP_0000344` | `rdfs:label`, `dcterms:description`, `sp:shortKey` |
| Bild auf Fachziel vs. Laufzeitziel | `LP_0030065` auf `schema:ImageObject` mit Position `LP_0000460` | `sp:GoalVisualizationReference` für Laufzeitziele; gehashte Binär-Sidecars (nie Base64 in `.nt`; Limits: `64 MiB`/Bild, `8 GiB` gesamt) |
| Quellen & Mappings | `LP_0000438` (*Lehrplan*), `LP_0000261` (*Curriculares Element*), `LP_0030065` | `sp:OfficialSourceDocument` für Zusatzdokumente; `exact`/`partial`-Prädikat; Qualitätsdaten bleiben rein in `sp:*` |
:::

Kompakte JSON-Metadaten nutzen `xsd:string` (kein privater Datentyp, damit OWL 2 DL erhalten bleibt; `sp:fieldState` bewahrt leere Kollektionen). Während Legacy-Bundles OCR-Steuerzeichen über `sp:quarantinedRecordJson` kapseln konnten, weist der `DPK-004`-Release-Compiler C0-Steuerzeichen und ungepaarte UTF-16-Surrogate strikt ab. Die gepinnte Core-Datei (OWL Functional Syntax, `text/owl-functional`) sowie Anwendungsontologie, SHACL-Shapes (ohne SPARQL/JS) und XML-Katalog unter `contracts/curriculum-package/v1/ontology/` bilden externe Trust-Roots.

### Produktions- und Pilot-Kommandos {#sec:pp-roundtrip-commands}

Gepinnte Offline-Toolchain (`jsonschema 4.26.0`, `pySHACL 0.30.1`, `RDFLib 7.6.0`, `owlrl 7.6.2`, `ROBOT 1.9.10`, `HermiT 1.4.5.456`, Amazon Corretto), Selbsttests und die schweren 2,36-GB-Produktionsläufe vom Repository-Root:

```bash
python3 -m pip install -r scripts/curriculum_fwu_owl_validation_requirements.txt
bash scripts/provision_pinned_robot.sh
python3 -B scripts/check_curriculum_fwu_owl_validation_tools.py \
  --report tmp/curriculum-release-model/fwu-owl-validation/tools-report.json
python3 -B scripts/validate_fwu_owl_curriculum_package.py --self-test
python3 -B scripts/reconstruct_json_curriculum_package_from_fwu_owl.py --self-test
python3 -B scripts/run_fwu_owl_reverse_compiler_hermetic.py --self-test
python3 -B scripts/validate_curriculum_fwu_owl_reverse_compilation_contract.py \
  --self-test
bash scripts/run_curriculum_fwu_owl_package_conformance.sh
bash scripts/run_curriculum_fwu_owl_reverse_conformance.sh
```

Ausführung des schnellen Legacy-Slim-Piloten aus `app/` (semantisch, OWL-2-DL-/HermiT-Reasoning und optionaler technischer Zeilen-Träger):

```bash
cd app
npm run export:subject-package -- --subject Mathematik --version 0.1.0
npm run export:subject-packages:validate -- \
  --zip ../tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip
npm run roundtrip:mem-fwu:semantic
ROBOT_JAR=/abs/path/to/robot.jar npm run roundtrip:mem-fwu:owl:reason
npm run roundtrip:mem-fwu
```
