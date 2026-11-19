## Curriculum Release Model Conformance {#sec:qal-release-model}

The compiler translates the Mathematics authoring state into a strict, unpacked release model as a bridge to the standalone JSON package (@ref{sec:qal-package-readiness}). Three states must remain distinct: immutable historical `DPK-004`–`DPK-008d` evidence, the separately retained 1.0/1.1/1.2 contracts, and the unpublished common 1.3 candidate currently selected by the JSON conformance wrapper. Model conformance does not establish publication, source or rights clearance, or human trials.

### Overview and Trusted Inputs {#sec:qal-release-inputs}

The active [run_curriculum_release_model_conformance.sh](repo:scripts/run_curriculum_release_model_conformance.sh) explicitly selects the [1.3 build profile](repo:contracts/curriculum-package/v1.3/profiles/de-gymnasium-mathematik-release-model-v1.3.profile.json). Its counters as of 19 November 2026 are: one landscape, **1,310 goals**, 16 program units, 334 placements, six competency-axis entries, **100 views**, twelve deck files containing 128 card rows, and 940 resource links (864 embedded binary assets totaling 1,636,716,703 bytes and 76 external resources). The learning-unit inventory names two learning units, nine own placements, and three coverage reviews. These are build-profile bindings, not results from a fresh real ZIP or consumer run.

Four input classes remain separate:

1. The build profile pins source paths, output, package identity, resources, relocations, and exact counts.
2. The hash-pinned ontology profile binds the FWU Core repository, commit, file, IRI, and digest.
3. The [semantic-kind ledger](repo:curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json) classifies all 1,310 goals without title/ID heuristics: 807 `curricularAtomic`, 241 `curricularArea`, 236 `practiceAssessment`, seven `programStructure`, six `memory`, eleven `runtimeSupport`, and two `orientation`.
4. The 1.3 field-semantics registry, normalization profile, and closed schemas bind serialized fields. `field-coverage.json` distinguishes observed instance fields from schema-only fields.

### Generated Model Layout, Digests, and Publication Evidence {#sec:qal-release-structure}

Atomic staging beneath `tmp/` produces the canonical landscape, views, cards, resource index, runtime catalog, dependency closure, migration aliases, source and mapping evidence, and quality/build reports. The 1.3 lane transports `learningUnitsV1`, `assessmentMaterialsV1`, bound learning-unit reviews, and the explicit local `childOrder.after` partial order. Assessment stimuli retain their exact bytes; a transported image dependency is neither a pedagogical prerequisite nor a learner result.

`semantic-content-index.json` binds each model's contents independently of paths. Goal, task, view, or asset changes require current digests and reviews; historical hashes do not transfer to the candidate. The wrapper pins **1,120 ZIP entries, including 1,118 manifest file records**, and 864 binary assets for the optional full-package build. These counters are neither goal counts nor official curriculum-requirement counts. The historical `DPK-007a` freeze and `DPK-008c`/`008d` OWL/reverse evidence remain bound to their original artifacts; they establish no 1.3 OWL roundtrip.

Mappings, official source index, source-goal reference index, and quality evidence remain separate publication roles. `requires` describes preparation; `examData.coveredGoalIds` and bound task/rubric reviews support separate coverage claims. A technical model pass does not close pending redistribution or source-text decisions.

### Verification Commands and Hosted PDF Mode {#sec:qal-release-commands}

```bash
PROFILE=contracts/curriculum-package/v1.3/profiles/de-gymnasium-mathematik-release-model-v1.3.profile.json
python3 -B scripts/compile_curriculum_release_model.py \
  --profile "$PROFILE" --output tmp/curriculum-release-model/mathematik-v1.3-a
python3 -B scripts/validate_curriculum_release_model.py \
  --profile "$PROFILE" --release-root tmp/curriculum-release-model/mathematik-v1.3-a
bash scripts/run_curriculum_release_model_conformance.sh
```

The normal wrapper validates the model, current review bindings, and two byte-identical model builds. Only `SKILLPILOT_FULL_PACKAGE_CONFORMANCE=true` adds the real ZIP, independent package validation, provisioning, and hermetic consumer. That lane explicitly selects `--contracts-dir contracts/curriculum-package/v1.3`. Model reports do not replace these additional execution records.

Local source PDFs must be regular, byte-hashed files; symlinks fail. For hosted checkouts missing ignored PDFs, `SKILLPILOT_SOURCE_PDF_MODE=committed-bindings` permits committed byte/hash bindings only for genuinely absent files. Present but modified files still fail.
