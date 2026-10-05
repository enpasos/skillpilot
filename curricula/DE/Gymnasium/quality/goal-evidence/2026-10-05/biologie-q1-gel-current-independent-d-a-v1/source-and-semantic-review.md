# Independent reviewer A: Gelelektrophorese

Goal: `8eb86a82-122d-5cae-8f80-bb2850b29c2f`.

Status: AI review candidate. Source and semantic checks below concern the supplied prospective wording. The final description review must be bound to and inspect the completed prospective BookModel, HTML and PDF. No human approval, practical learner evidence, or current strict M7 result is claimed.

## Review isolation and inputs

Read AGENTS.md sections 7.1–7.4, the visualization provider/quality policy, the current canonical goal and its direct context, the biology description-review criteria, the native description schema, the retained official HE PDF and the official BY GA/EA web sources. No other reviewer's D/P/A/M decision, author verdict, earlier description round, or canonical diff was inspected.

Prospective description DE: Die lernende Person kann die Trennung von DNA-Fragmenten durch Gelelektrophorese erklären und vorgegebene Bandenmuster mithilfe eines Größenmarkers begründet auswerten.

Prospective description EN: The learner can explain how gel electrophoresis separates DNA fragments and use a size marker to interpret supplied band patterns with reasons.

Prospective direct prerequisites: DNA-Aufbau `0daa79f6-8f61-5506-98f9-65db83062ba8` and orientation `2d451684-6e53-565e-a987-f362da919d2c`. PCR `a3f483ce-126e-595c-999c-aa4d95106221` remains a separate curricular goal.

## Source checks

- Hessen: the retained PDF's printed page 39, Q1.2, basic level for GK/LK, contains the joint clause “PCR und Gelelektrophorese”. The official online PDF confirms that clause. A gel-only target is a legitimate partial operationalization. It does not itself cover PCR. The current extraction's former full-sentence authored `sourceText` is not the official wording; the final bundle must contain the corrected actual clause and partial mappings.
- Bayern: official year 12 GA and EA section 2.6 both explicitly name gel electrophoresis among the DNA-analytics contents. The competency above those contents also claims medical/social relevance and ethical analysis. Gel separation and band interpretation are a justified partial method component, not full coverage of that broader competency, DNA sequencing, genetic fingerprinting, or ethics. The final bundle must preserve that distinction and its earlier broader-content mapping.
- Neither official content clause requires every learner to physically perform a gel experiment. Explaining the method and interpreting supplied data is a source-faithful operationalization. Claiming a laboratory performance from data interpretation would be unsupported.

Sources checked on 2026-10-05:

- https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf (printed page 39)
- https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/grundlegend (section 2.6)
- https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/erhoeht (section 2.6)
- https://www.genome.gov/genetics-glossary/Electrophoresis (method and marker cross-check)

## Semantic atomicity candidate: atomic

The target is one coherent method competence: explain size-dependent DNA separation well enough to interpret the resulting band positions using a marker. Mechanism and its justified result interpretation are linked in one assessable gel case. They do not introduce the independently acquired PCR routine, laboratory execution, DNA sequencing, or medical/ethical evaluation. Supplied bands and marker constrain the required performance. A wording-only split is not required.

## Memory suitability candidate: no_memory_needed

Success requires causal explanation and reasoned interpretation of supplied bands using a supplied size marker. It does not require recall of a fixed marker ladder, fragment-size list, temperature, reagent recipe, or isolated application catalog. Marker values should be provided as material. Necessary conceptual learning stays within the ordinary goal; a new recall deck is not justified by this wording.

## Prerequisite and assessment limits

DNA structure is an appropriate earlier anchor for what a DNA fragment is. PCR can produce material for a gel but is not necessary for every gel or for interpretation of already supplied gel data. Removing PCR as a universal prerequisite is therefore sound if PCR remains available and correctly mapped separately. Final graph/page evidence must verify that preservation.

A future positive-evidence profile should bind electric field, gel sieving and relative fragment length to an independently reasoned interpretation of fresh supplied lanes and marker. It must distinguish observed bands from inferred fragment lengths and must not infer sequence, identity, diagnosis, or successful PCR from band position alone. Equal-sized fragments may share a band. A meaningful changed case can alter the lane arrangement, marker representation or comparison structure and require the learner to establish the interpretation again; changing only numeric labels is insufficient.

Final D and P records remain pending the completed prospective review inputs and actual page inspection.

## Inactive source candidate inspected

The three supplied candidate files were read directly and their SHA-256 values matched the provided path receipt:

- HE extraction `DE_HE_BIOLOGIE_SEKII_KC2024.m7-q1-gel-current-20261005-v1.source-extraction.json`: `sha256:1bbce07fbf0c7ce3f4f348e6358e5205f8b930391bd7ba38408ca8dfec97f0bb`.
- HE mapping `hessen_biology_upper_secondary_source_extraction_to_canonical_biology.m7-q1-gel-current-20261005-v1.review.json`: `sha256:504f43f21f037a56e3b39695f7538a4b0bb4a68b9899ad36a5096e32c1ac3918`.
- BY mapping `bavaria_biology_source_extraction_to_canonical_biology.m7-q1-gel-current-20261005-v1.review.json`: `sha256:3d40c8542fc0b7a61dd512c0e0f51ca93a1938f3764f7fa9e74ed2b35e57f697`.

The HE candidate changes only source-goal `b5e1cdfd-34ff-4c05-976c-ee69ec041fdb` among the 150 existing source-goal objects, leaves all 19 passage objects unchanged, and replaces source/raw-source/parent text with the actual joint clause. Its reference distinguishes printed page 39 from local extraction ID Q1.2.11. That joint clause maps separately and partially to the Gel and PCR goals. The existing standalone PCR mapping is retained as an unchanged object; its former extraction wording is outside this target's final QA claim.

The new BY Gel mapping is explicitly `partial`. Its existing broad DNA-analytics mapping to `2ef8b0c2-8ba3-54b7-99ff-8c743a4efa63` is retained as an unchanged object. All unaffected old HE/BY mapping objects are present unchanged in the candidates. These results were computed from the actual objects, without adopting the receipt's author conclusions or reading another reviewer's rationale.

No source-blocking defect is found in these local target deltas. Final book source bindings must still show the reviewed candidates and the Gel mapping as partial.

## Final native review completed

The completed prospective native bundle `sha256:c45525c4c4bc6e21c065c3fa6155ea839a823a1cbfd178de076739a3e275e002` and BookModel `sha256:3b5aba4ea00f1a3394137fb2cac80fc2fe59a124b4b8c44d0a06c952c63635ce` were reviewed. All bundle artifact file digests match the manifest. The actual PDF's third physical page was rendered and visually inspected: the full goal occupies one complete page with a qualitative, correctly polarized gel image and its full ID. The exact description and alt text are also present in the HTML. The external prerequisite links name orientation and DNA structure. PCR remains present in the frozen canonical input.

The frozen source candidate copies have the same exact SHA-256 values as the independently inspected files above. The regenerated HE/BY Sek-II GK/LK source views contain this target. These checks establish the scoped prepared input relationships; they do not imply publication, human review, laboratory performance, or mastery.

Final native D decision: `keep`, 1/1 candidate. Round A has only the reviewer's native records/run outputs. The native campaign-results validator passed with exit code 0 and `Goal-description review campaign results valid: 1`. The current D input explicitly contains no evidence profile, so its profile recommendation is `create`.

Separate current A/M candidates are `atomic` and `no_memory_needed`, with fingerprints `sha256:c68cbfc47baf03fce577b935b58d2bb59f5815e1d420ab37916f958317189ba8` and `sha256:5acbc1b7dfbf728f70db62f54b8fec413ca2af1419e6b81e588072015dc23fb9` respectively.

Separate P review found one local German/English mismatch in the inactive supplied inner profile: German `beweist` overstated the English `indicates` and the approximate marker inference. The own inactive revised profile changes only that German expectation to `spricht ... für`. The corrected profile is fachlich PASS as an AI candidate, with exact native profile fingerprint `sha256:e00119670c9ace7b64145a3b0993564cc2187358cf01c19c6548b539e6b5f75d`. Its field hashes and the old local HOLD remain in the separate P review note. Final P record/config integration is the parent's subsequent binding step.

See `final-native-review-a.binding.candidate.json` for the exact current goal/page/asset bindings and the independent outputs. Strict net gain remains 0 until the central strict D/P/A/M/V checker evaluates the activated final records. No human approval is claimed.
