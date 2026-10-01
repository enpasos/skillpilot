# Genmutationen analysieren — one-goal candidate v1

**Status:** Separate AI authoring candidate for `ffef97e3-12d6-5090-9816-46ab9e57fae2`. This is not a blind D or P review: the current audit and the earlier three-goal candidate README were consulted for binding status, but their proposal JSON files were not used. No canonical, mapping, source-view, registry, learner-state, or central gate change was made. This package is not a D decision, P approval, V approval, or human acceptance.

## Scope and source

- The current canonical DE/EN text says the learner explains substitution, deletion, insertion, and duplication and estimates consequences. It leaves the level and evidence for those consequences open. The new bilingual wording in `description-proposal.json` keeps the four types and makes a possible consequence for the encoded protein conditional on a supplied gene context.
- The local official Hessen KCGO Biology PDF (`curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf`, SHA-256 `52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558`) lists the four mutation types in Q1.1 on printed page 38 at the basic GK/LK level. That section also lists protein biosynthesis and relationships among genetic material, gene products, and traits. The proposed protein-consequence wording is a didactic operationalization using that context and the current goal; it is not a verbatim official competency sentence.
- The HE source-extraction goal `ed4cdb55-2514-4483-9db6-eb4d74bd6663` repeats an authored learning-goal paraphrase as `rawSourceText`. It must not be presented as the PDF's exact wording. The canonical goal's direct prerequisite `475eebb4-4eb0-524f-b1ec-4a672bf856d2c` is protein biosynthesis.
- `positive-evidence-v2.candidates.json` is a profile-content draft aligned to the proposed description, with two new application cases. It has no future canonical fingerprint or independent P-review binding and is not registered.

## Source-binding issues to resolve before adoption

1. **Hessen:** The active HE upper-secondary review maps the paraphrased Q1.1.4 extraction goal 1:1 as `exact`. A revised canonical text requires a fresh review of what `exact` means against the official bullet, then a check of both HE Sek-II GK/LK source views and their new bindings. The current source-projection receipt states `newSourceReview: false`.
2. **Bavaria:** The active BY mapping is also `exact` for source goal `ef3a58c6-09b3-5e91-80a0-fb3857268603` (B12-EA.2.17, merged with B12-GA.2.12). Its extracted source text additionally addresses mutagenic influences, protein function, and the significance of protection. This proposal does not claim all of those clauses. The BY mapping and GK/LK view coverage need a separate source-level decision; the old `exact` status cannot simply follow the new wording.
3. **Other states and stage:** MV, NI, RP, SH, SN, ST, and TH have broad Sek-I source-to-goal links marked `partial` in the current mapping reviews, and their Sek-I source views include this Q1-labeled canonical ID. The new coding-sequence and protein-consequence demand may exceed the relevant Sek-I source or stage. Recheck each actual mapping and projection instead of treating the canonical `phase: Q1` tag as a scope filter.

## Candidate illustration

`visualization/genmutationen-candidate.png` is a generated 1672 × 941 PNG, close to 16:9. The prompt, correction and actual 360/680 px inspection are recorded in `visualization/prompt.md` and `visualization/review.md`. This image is a candidate only; it is absent from the active goal visualization registry and has no independent V-QA decision.

## Required follow-up if adopted

Review the bilingual proposal against HE and every affected state source; choose and rebind the actual source mappings and views. Then run two independent current-text D reviews, independently review and register a fingerprint-bound P-v2 profile, recheck A/M against the new text, and perform independent V-QA with the active asset and alt text before rerunning the central five-gate report. The old Q1 twelve-batch findings remain historical and do not pass the new text.
