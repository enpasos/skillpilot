## Human Review Gates for Curriculum Releases (`HR-001`–`HR-006`) {#sec:qal-human-review-gates}

This chapter consolidates the six strictly independent human sign-off gates that the automated toolchain is forbidden to decide on its own (initially scoped to `org.skillpilot.curriculum.de.gymnasium.mathematik`; any hash or content drift automatically marks affected prior approvals stale).

**Current bindings, 19 November 2026:** The 1.3 model candidate uses `de-gymnasium-mathematik-v1.3-partial-order-20261116.review.json`, with 864 pending binary assets, including unchanged assessment stimuli, and three pending non-binary classes. The separately retained 1.0 review file contains 836 assets; these inventories are not interchangeable. The source-text ledger records 481 pending human decisions and 9,497 technical matches. The Apache-2.0/CC-BY-4.0 allocation in `LICENSING.md` remains separate from source rights, asset evidence, and approval. M7 denotes machine QA and grants no human approval.

### Overview of the Six Independent Gates {#sec:qal-hr-overview}

:::table{cols="2.2cm,4.2cm,2.8cm,X",longtable=true}
| Gate | Open scope | Blocks | Primary work source |
| --- | --- | --- | --- |
| `HR-001` Visual quality | Current hash-bound visual inventory; human approvals separate from M7 | Domain publication readiness | `curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json` |
| `HR-002` Image rights | `864` asset decisions in the 1.3 ledger | Public redistribution | `curricula/DE/Gymnasium/quality/package-redistribution/de-gymnasium-mathematik-v1.3-partial-order-20261116.review.json` |
| `HR-003` Non-binary rights | `3` class decisions (`skillpilot-data`, `official-source-evidence`, `generated-metadata`) | Public redistribution | Same redistribution ledger |
| `HR-004` Source-text verification | `481` record decisions (alongside `9,497` technical matches) | Source QA / promotion | `curricula/DE/Gymnasium/quality/source-verification/de-gymnasium-mathematik-v1.review.json` |
| `HR-005` Ontology sign-off | `1` hash-bound domain/ontology and legal expert sign-off | Ontology promotion | `DPK-008c` FWU receipt & `DPK-008d` reverse receipt |
| `HR-006` Signature & `stable` | `1` trust/release decision per release group | Public `stable` release | Future `DPK-011` release index |
:::

### Domain, Rights, and Source-Text Gates (`HR-001` through `HR-004`) {#sec:qal-hr-content-rights}

- **`HR-001` (Domain visual sign-off):** Verifies mathematical accuracy of all values/relations, fit to learning goal and age group, legibility, language, and alt text on the exact asset hash (`human-approved`, `rejected`, `deferred-provider-limitation`).
- **`HR-002` (Binary asset rights):** The current 1.3 ledger binds 864 assets to exact hashes and records `pending-human-review`, `review-required`, and `licenseExpression: null`; 19 are marked user-provided. Provenance labels grant no license. Rights decisions require source or provider terms, license expression, evidence, reviewer, and timestamp. Assets lacking clearance must be removed or replaced before public release.
- **`HR-003` (Non-binary artifact rights):** Only `software-contracts` (bound to the root `LICENSE` hash) clears automatically as Apache-2.0. Open classes are (1) `skillpilot-data`, (2) `official-source-evidence` (distinguishing bare facts/metadata, original paraphrase, and protected wording), and (3) `generated-metadata`.
- **`HR-004` (Source-text verification):** The current ledger contains 481 pending human decisions alongside 9,497 technical matches. Technical matching grants no rights clearance. Decisions (`verified-verbatim`, `verified-normalized-transcription`, `reviewed-paraphrase`, `rejected`) remain bound through `reviewEvidenceSha256` to source text, passage, PDF, and locator.

### Ontology Sign-Off and Stable Promotion (`HR-005` & `HR-006`) {#sec:qal-hr-ontology-promotion}

The exact receipts below are historical DPK-008 evidence. They transfer no ontology or publication approval to the 1.3 candidate.

- **`HR-005` (Core-first ontology sign-off):** Hash-bound expert sign-off across the `DPK-008c` FWU-OWL ZIP (`2,362,455,128` bytes, SHA-256 `abab1d8aac3e9394af26c614bbf231954ba45ab11f725dd0f93f088820dc3f94`, manifest `29f308424d1aeba9095f0e800253acadcdfaca0562dfa1fc37741c77c76023b3`), reconstructed JSON ZIP (`1,737,571,471` bytes, SHA-256 `7dcd233dd495900f6d6bd971ff6e86bdcdcfe5701f3522ed480be8336de23195`, manifest `8d7970435431ff78743d0bf413a54bbebee009bbaafe35f1283ebcb89b4f2ff0`), `DPK-008d` reverse receipt (`12,185` bytes, `94035f2d88e2c2b7588f13f01cb44b917c83900b9f839c66558ea7eae585884f`), 20-file evidence manifest (`3,483` bytes, `31c256ff612aa7a346fb0792c83b109d4bc01df52fdc36e98a8c717bf9b8eafc`, inventory digest `8483f5ce428cc54cca1353668370ae09f32f51166af6a3235a2ff19ccb88ea1e`), and 454-entry registry (`2e536c3f8d63e2acf45690375ace69ec0c6a6e92787bc8a16957b80120c4ca48`). Reviewers confirm semantic fidelity of every FWU Core term, strict minimality of extensions and JSON literals, clean layer separation, and license/Share-Alike duties (`CC-BY-SA-4.0`; until sign-off, the bundled Core file keeps `review-required` and `licenseExpression: null`).
- **`HR-006` (Signature and `stable` promotion after `DPK-011`):** Approves the trusted signing identity and verifies that all prior human gates are closed on the bound hashes before atomically promoting the JSON/OWL release group from `staging` to `stable`.
