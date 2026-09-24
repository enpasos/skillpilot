# Batch-local assessment — M7 Q2 bodies (eight goals)

Date: 2026-09-24
Scope: `m7-q2-bodies-open-eight-after-volume-three-20260924-v1` only.
This is machine curriculum-QS and AI synthesis only. Nothing here claims human review, release approval, or learner testing. Canonical goal text, direct source mappings, the central registry, and the in-flight ledger were not changed. Earlier evidence and stale bindings remain untouched.

## Current input and bound pages

The reserved batch was prepared from the current GoalBook PDF and HTML using the local Poppler tools supplied for the work. The repository `prepare` and `check` flows imported and checked those artifacts; no fingerprint-only refresh stood in for import. The correct eight goal pages are physical PDF pages **3–10** (PDF cover and contents are pages 1–2). Both fresh blind reviews received only these current bound pages, with their PNG hashes and goal/page mapping in `candidates/independent-review-cli-runs.receipt.json`.

- GoalBook PDF SHA-256: `03dd9203496ea54fff4a6902aa8f7e9a37cb9e21570acb65366f4576c8252991`
- GoalBook HTML SHA-256: `953b92eb4d5f3dceea3da4a89b8db1451b127987ffa08afd4c603eb66d066fe7`
- Eight-goal book-model digest: `sha256:d83bcf19781074eb04d4271ed26ea695edc630c125d0d6135c0f8d121c6f48d2`
- Review bundle fingerprint: `sha256:a4bcdffd25104ae9319a70d1ab26f01b7e6c3171bb2d258d72dfb5cbafbc8a8d`
- Review input fingerprint: `sha256:78807fea2262f5e5698530e922707db9b0d9c8be1a758d587167ae2517f1e3bd`

| Goal ID | Current goal fingerprint | Current page fingerprint | Physical PDF page |
|---|---|---|---:|
| `288633c1-f61c-5b48-af7e-a80357f96cad` | `sha256:4f2a2cf5fc81453d2f08a4a2d0b59b6892b4e4c5423aa1942360e1634cb4670c` | `sha256:01660c39cd1e0374920a5f315883cafd540f0cb8b3c0105af29ae94d2305c292` | 3 |
| `944dd479-9f30-5acb-ab32-3ea0b6dc8e06` | `sha256:3aaa5cb57ae815d136b464cecc37d6e44023a24a6352da72fd2232590ecbab81` | `sha256:c9f9291662b568373f018b5eb811fb7598b29e3834dabfda045e23f395e829e2` | 4 |
| `a594dec0-3977-5c43-9432-d4254a7f6130` | `sha256:c0971d4e073a9ba69602fb467e29d943bcfe42bdd9e5070b0a78229e2f567e18` | `sha256:7bc32869f8e91bc4ae49b06a8e3fee639123c4bc2ab8f0c1a39fd7b407ad8a55` | 5 |
| `e8237315-654e-5150-97de-49c4cb49b3d1` | `sha256:3eb0814db632f12215d2df7891f5475fa0890d690a95977ec852b0c7581f79b5` | `sha256:3d66c39c7fdb68e412b1fa1beea5b79f1ff0c0a5fb751693f42a5be6f6dd236e` | 6 |
| `50eb5156-5046-5887-80dc-3128c5f8cbd6` | `sha256:76c2582ea504910a6336c29515f141f1a9f35131c6815173ffae1c956f244de8` | `sha256:7a7254bcad9e4e125a4d49f35e4c8882e24a391536ac45429b26e72e41b4bd84` | 7 |
| `b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2` | `sha256:b7d79a05add53c31621e2d41cc657ac1ab04972835384ecc3351b61bc03a1cf8` | `sha256:4e906b0949e2c248df5d90f6d200e357ba848ff7ede36e9b5b15e5c58dadcd07` | 8 |
| `5f548596-9bc3-532e-88a0-81d5029809e9` | `sha256:ce1ddb2cdb26e3b7e00c5a57a194112c3d53a09bb0cb873f88450cef74ff3341` | `sha256:eb10eccf73bf119a8fd90cfc65efde4d883beebe95bb0b3d925854f7e78a77b9` | 9 |
| `9f9c7ece-b81c-55fa-8073-dd816d7d4778` | `sha256:b1d663e951a03e245c7fb43f14097fc76865bcb0d95f7a2713c30efd60610715` | `sha256:48a0a7b4ac5f063a9489b30e63dd445649926be02654ffb19d2a8be28cd33261` | 10 |

Pages 4 and 5 visibly render raw TeX for the scalar-triple-product formulas. This remains an actual learner-facing page-readability blocker for `944…` and `a594…`; no content-fingerprint adjustment can resolve it. The first A/B attempt attached PDF pages 1–8 and is discarded for qualification. Only corrected runs with pages 3–10 are used below.

## Independent current A/B runs

- Round A: run `math-q2-body8-20260924-a-gpt6sol-bound-p3to10`, explicit Codex CLI model `gpt-6-sol` (catalog display `GPT-6-Sol`).
- Round B: run `math-q2-body8-20260924-b-gpt6luna-bound-p3to10`, explicit Codex CLI model `gpt-6-luna` (catalog display `GPT-6-Luna`).
- Both used local Codex CLI 0.155.0-alpha.16.3, high reasoning, read-only sandbox, separate campaigns/independence groups, and blind prompts. The CLI event stream does not report its model/provider; the receipt records the explicit `--model` choices and matching local model catalog entries. Both provider labels are OpenAI; model identities are distinct.
- Correct raw record digests: A `sha256:6aa6311340301ca2f81a679bda52d9ad407d3b307606bae193ffe1cac4cc3526`; B `sha256:4437a7ef3e6ee47b8d11f809a9929eeeb4ca3a66f5487b7e8f73a9d2c7cba2d2`.
- The receipt includes exact PDF page numbers, goal IDs, current page fingerprints, PNG hashes, result/manifest hashes and run times. No prompts or provider traces with private thread IDs were persisted.
- Dual validator: `require_distinct_provider_or_model` satisfied. It reports 8 disagreements, 8 requiring synthesis, and no automatic acceptance. This is expected; the validator result by itself does not close any target.

## Exact-target D synthesis and disposition

Two current resolutions are materialized under `candidate-resolutions/` and passed the repository dual-round-resolution validator with `strictDescriptionComplete=true`. These are current D-gate candidates only; other layers still block package completion.

| Goal ID | Current A / B | Exact-bound synthesis | D result |
|---|---|---|---|
| `288633c1-f61c-5b48-af7e-a80357f96cad` | KEEP / REVISE | Leave open. The current page illustrates the pyramid/prism comparison, but the canonical goal has no direct `sourceRef`, and HMKB Q2.2 p. 41 does not state the specific one-third relation. The prior two-round record's page fingerprint is from the five-goal page, so it is stale and is not rebound. | Open: exact curriculum-source support for the formula/relation is missing. |
| `944dd479-9f30-5acb-ab32-3ea0b6dc8e06` | BLOCK / REVISE | Leave open. The definition is rendered as raw TeX on the exact current page; the visible notation cannot be responsibly accepted as learner-facing. The canonical goal has no direct `sourceRef`, and the checked broad vector-product curriculum statement does not establish the scalar-triple-product definition and orientation claim. | Blocked by page readability and source coverage. |
| `a594dec0-3977-5c43-9432-d4254a7f6130` | BLOCK / REVISE | Leave open. Both volume equations render as raw TeX on the exact current page. The canonical goal has no direct `sourceRef`; the checked vector-product source statement does not explicitly support the scalar triple product as a volume or the tetrahedron factor `1/6`. | Blocked by page readability and source/formula coverage. |
| `e8237315-654e-5150-97de-49c4cb49b3d1` | KEEP / REVISE | Leave open. The current diagram shows a cone and cylinder with equal base radius and perpendicular height, resolving the visual equality cue; the bilingual description still leaves the precise same-radius/same-height comparison implicit. The canonical goal has no direct `sourceRef`, and the checked source does not state the one-third formula. The earlier current-bound REVISE findings remain preserved; the fresh corrected pair is not unanimous. | Open: source support and wording/decision conflict remain. |
| `50eb5156-5046-5887-80dc-3128c5f8cbd6` | KEEP / KEEP | Synthesis keeps current text. Both reviews accept the scope; the compatible evidence differences were merged to require a new solid/representation, relevant lengths and angles, a justified geometric/vector method, and transfer to a changed orientation or coordinate choice. Direct HMKB `Q2.2, S. 41, Spiegelstrich 4` and the exact current page support this scope. | **Strict D candidate resolved.** See `candidate-resolutions/50eb5156-5046-5887-80dc-3128c5f8cbd6.resolution.json`. |
| `b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2` | KEEP / REVISE | Synthesis keeps current text. It already names the assessable competency—determine and describe axes/planes of symmetry. The additional rotation/reflection criterion is retained in the selected current understanding-evidence profile. The revise proposal is bound as explicit rejected-revision dissent. Direct HMKB `Q2.2, S. 41, Spiegelstrich 4` names symmetry axes/planes; the current textual page supports review without an illustration. | **Strict D candidate resolved.** See `candidate-resolutions/b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2.resolution.json` and its batch-local `candidates/synthesis/` decision manifest. |
| `5f548596-9bc3-532e-88a0-81d5029809e9` | REVISE / REVISE | Leave open. Both rounds find “Eigenschaften … nutzen” / “suitable situations” underspecified for this AB3 volume goal; proposals differ on justified model selection, dimensions, decomposition and context. The source reference is current, but the canonical wording must be changed and then reviewed against a new exact page binding. No canonical change is permitted in this package. | Open: genuine wording change and fresh A/B needed. |
| `9f9c7ece-b81c-55fa-8073-dd816d7d4778` | REVISE / REVISE | Leave open. Both rounds find the description does not make the selection and combination of faces for lateral versus total area assessable; their proposals differ in how to express it. The source reference is current, but this needs canonical wording change and fresh A/B. | Open: genuine wording change and fresh A/B needed. |

No new goal text was written. The strict D candidate count is **2/8**; the package has **0/8 full strict closures** because D candidates and the other gates must all be current and valid.

## Other gates, exact current status

| Goal ID | P: positive-understanding-evidence-v2 | Atomicity / memory | V: visualization QA |
|---|---|---|---|
| `288633c1-f61c-5b48-af7e-a80357f96cad` | Current profile/scope check passes; status remains truthfully `needs_human_review` / `ai_candidate`. | Current `atomic`; `no_memory_needed`; included in green full-math checks. | Existing good PNG kept; current asset hash `sha256:10fc4e45edd3c4708b0466b2a7a3cb806ab72973eb265500fa6154342def165a` has current machine approval. |
| `944dd479-9f30-5acb-ab32-3ea0b6dc8e06` | Existing text-only profile input is stale; expected current input fingerprint `sha256:dcf3a1214b50159158e5baf3bbf5c901c893bf38cd14354791fd2fbc81322f04`. Not refreshed. | Current `atomic`; `no_memory_needed`; full-math checks green. | Missing/deferred machine approval. Batch PNG remains an unapproved candidate. |
| `a594dec0-3977-5c43-9432-d4254a7f6130` | Existing text-only profile input is stale; expected current input fingerprint `sha256:8473f38d5cc8483450eb61d0676efeffbecc71a2c8004e2e09c7690ffdd35677`. Not refreshed. | Current `atomic`; `no_memory_needed`; full-math checks green. | Missing/deferred machine approval. Batch PNG remains an unapproved candidate. |
| `e8237315-654e-5150-97de-49c4cb49b3d1` | Current profile/scope check passes; status remains `needs_human_review` / `ai_candidate`. | Current `atomic`; `no_memory_needed`; full-math checks green. | Existing good PNG kept; current asset hash `sha256:cc856d368af2a51ed0376c680f514606fcd68cf03bdeb7086b298e4e4f81b9d6` has current machine approval. |
| `50eb5156-5046-5887-80dc-3128c5f8cbd6` | Current image-bound candidate and scope check pass; status remains `needs_human_review` / `ai_candidate`. | Current `atomic`; `no_memory_needed`; full-math checks green. | Existing good JPG kept; current asset hash `sha256:4b0815f7e8b0afe6329bb1963991270383af089033bab28dc7b49912676e71bb` has current machine approval. |
| `b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2` | Existing text-only profile input is stale; expected current input fingerprint `sha256:2cb1517981a424fbe2d9d3f165f82926757639acb3d104f573d81c14150ed9d0`. Not refreshed. | Current `atomic`; `no_memory_needed`; full-math checks green. | Missing/deferred machine approval. Batch PNG remains an unapproved candidate. |
| `5f548596-9bc3-532e-88a0-81d5029809e9` | Current image-bound candidate and scope check pass; status remains `needs_human_review` / `ai_candidate`. | Current `atomic`; `no_memory_needed`; full-math checks green. | Existing good JPG kept; current asset hash `sha256:08dad308422eec5bd8226ab5104ef16c4aa20ef04b95c6f24f6da23eb9efe706` has current machine approval. |
| `9f9c7ece-b81c-55fa-8073-dd816d7d4778` | Current image-bound profile/scope check passes; status remains `needs_human_review` / `ai_candidate`. | Current `atomic`; `no_memory_needed`; full-math checks green. | Existing good JPG kept; current asset hash `sha256:0a3f207f19a1160ad39cb48a976b790f02f0452d7a8e608f1076e6a2aa3099d3` has current machine approval. |

Full configured machine checks found 797 math content leaves with zero missing/stale semantic-atomicity decisions and 797 ordinary atomic goals with zero missing/stale memory decisions or card reviews. All eight target decisions are current `atomic` and `no_memory_needed`; no memory cards or visibility-scope checks are due for them. Five of eight P-v2 profiles are current and machine-valid; three remain missing/stale. Their candidate/review statuses are not human approvals.

Five existing visual assets have current machine approvals and were kept. Three targets have no current visualization approval. The PNGs and prompts under `candidates/visualizations/` are unapproved package candidates only; image generation and inspection are not approval. No canonical image, prompt mapping or visualization ledger was changed in this package.

## Source evidence and unmodified historic bindings

Direct current `sourceRef` values exist for `50eb…`, `b4fd…`, `5f548…`, and `9f9c…`, each pointing to HMKB Q2.2 p. 41 bullet 4. The page covers geometric properties of simple solids, symmetry axes/planes and use of properties in volume/surface work. I checked the linked HMKB PDF (SHA-256 `d53bd18522ee045c9b3142a9576eb3fef0a212b6a1e712d50fc084856dae5953`) including rendered/text pages. This supports those broad target scopes, not unbounded claims beyond them.

The canonical goals `288…`, `944…`, `a594…`, and `e823…` have no direct `sourceRef`. Provenance mappings to imported source-goal IDs are not a substitute for direct, checked source coverage. HMKB Q2.2 p. 41 generally supports simple-body properties and volume/surface calculations; Q2.3 p. 43 discusses the vector product particularly for normals and areas. Those statements do not explicitly establish the pyramid/cone one-third comparisons, scalar triple product's orientation definition, or tetrahedron volume factor `1/6`. These source/formula gaps remain open.

The six old 14-goal bindings for `944…`, `a594…`, `50eb…`, `b4fd…`, `5f548…`, and `9f9c…` were not rebound. Older `288…` findings with the five-goal page fingerprint remain stale. Earlier current-bound `e823…` REVISE findings were preserved; the corrected exact-page A/B pair adds a fresh KEEP/REVISE conflict. No old review records were overwritten or qualified by changed hashes.

## Progress accounting

- Correct current exact-page A/B reviews: **8/8**. Their separate model identities are recorded; pages 3–10 and all rendered image digests are bound.
- Strict D candidate resolutions: **2** (`50eb…`, `b4fd…`), both validator-confirmed.
- New substantive curricular text changes: **0**.
- Restored historical bindings: **0**.
- Full strict package closures: **0/8**.
- Current P-v2 machine profiles: **5/8**; three remain stale/missing.
- Current machine visualization approvals: **5/8**; three remain missing/deferred.
- Semantic atomicity and memory: **8/8 current**.
- No human approval, classroom testing, release approval, or visual approval is claimed.

Next authorized work is to resolve the exact source and rendered-notation blockers for `288…`, `944…`, `a594…`, `e823…`; make batch-local P-v2 and visualization QA current where evidence permits; and, for `5f548…` and `9f9c…`, develop proposed wording candidates followed by new exact-context independent reviews. Keep all six old 14-goal records stale and untouched.

## Commands and validators

Successful current checks:

- `quality:goal-description-rollout-batch prepare` and `check` for this exact config (Poppler paths supplied to `prepare`; standalone check reports eight goals).
- `validate:goal-description-review-campaign` for round A: 8 valid; round B: 8 valid.
- `validate:goal-description-review-dual-round --diversity-policy require_distinct_provider_or_model`: exit 0, distinct model identities, 8 disagreements, no automatic acceptance.
- `validate:goal-description-dual-round-resolution` on the two candidate resolutions: `strictDescriptionComplete=true` for `50eb…` and `b4fd…`.
- `quality:semantic-atomicity:check` with `canonical-math-full.config.json`: green.
- `quality:memory-card-review:check` with `canonical-math-full.config.json`: green.
- Scoped current positive-evidence checks: green for the five current profile targets listed above; old profile configs report the three expected stale P-v2 inputs.
- `check:goal-visualization-qa`: green for subject ledgers while identifying this batch's three missing/deferred approvals.

Only batch-local output files and these candidate reports/resolutions were added or edited.
