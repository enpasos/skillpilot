# Independent v2 QA: `ffef97e3-12d6-5090-9816-46ab9e57fae2`

**Verdict: PASS_CANDIDATE_ONLY** for the complete v2 authoring package. The v1 image HOLD is resolved in this inactive candidate. This is an independent candidate review, **not** a current-canonical D/P/A/M/V gate decision, active visualization QA record, source approval, registry entry, human approval, or learner outcome.

## What was checked

- I compared the parsed v1 and v2 JSON files. `description-proposal.json` is byte-identical in both packages (SHA-256 `fd9a4616eff54a9f496ac9d9d6fd80f80ce7315c380f7878c69eac22ffca938e`). In the P draft, the only substantive changes are the four DE/EN task-demand and expected-performance strings for case 2; metadata and the explanatory `reason` also changed.
- I viewed the actual v2 `genmutationen-candidate.png` at native 1672 × 941, `preview-360.png` at 360 × 203, and `preview-680.png` at 680 × 383. Selected PNG SHA-256: `25efc19cf2535fdd33533a575e3cc6ae29d03d0f78c7e980d562c28460e8ec0d`.
- I rechecked the current canonical goal, the HE Q1.1 and BY B12 2.4 source boundaries, the source-view entries, and the cockpit image height rule (`max-h-[28rem] w-full object-contain`). The canonical goal still has its old DE/EN description and no visualization link.

## Description and P-v2 content

The unchanged bilingual proposal still expresses one coherent assessable analysis: classify substitution, deletion, insertion, and duplication in supplied DNA cases, then justify a **possible** protein consequence from the supplied gene context. It avoids claiming a necessary phenotype or protein-function change from the mutation label. DE and EN match. The described classification-to-consequence chain remains a defensible semantic atomicity candidate, conditional on an input that states the coding region and reading frame for translation claims.

The former case-2 comparator ambiguity is fixed. Both task demands now explicitly compare the TTT→TCT variant's enzyme activity **with the unchanged reference protein under matched conditions**; both expected performances bind the lower activity to that measured comparison only. No functional result is assigned to the other variants and no trait follows from that assay. The unchanged sequence claims remain consistent: `TTT→TCT` changes phenylalanine to serine, whole-`GGC` loss is in frame, two added bases shift the frame, and a documented single-base copy is a duplication with a frameshift. The separate first case still correctly distinguishes the synonymous `GAA→GAG`, single-base indels, and whole-codon copy. If a later scored task asks for the **exact** peptide after copying a base within `AAG`, it must identify which base; the present expected answer requires only the frame consequence.

## Visualization candidate

The v2 duplication card now shows the left five-block source sequence `blue–coral–yellow–teal–violet` and the right seven-block result `blue–coral–yellow–teal–yellow–teal–violet`. The single purple curved arrow starts at the original yellow–teal pair on the **left** and reaches the additional yellow–teal pair on the **right**; its arrowhead lands over the new yellow block. This relationship is visible in the native image, clear at 680 px, and still followable at 360 px. The v1 mislocated short arc is absent.

The other three panels remain scientifically consistent: substitution 5→5 with one changed block, deletion 5→4 with the crossed-out yellow source block removed, and insertion 5→6 with a distinct pink block. All four headings are legible at 360 px; there is no tiny explanatory text. At a 16 px root font, the 680 px preview's 383 px height is below the 28 rem (448 px) card cap. The image is an intentionally simplified sequence model, and the proposed alt text accurately describes the source-to-copy arrow. Neither image nor alt text asserts a protein or phenotype effect. The small color blocks make the descriptive alt text valuable; that is not a blocking visual error for this candidate.

## Boundaries before adoption

The local official [Hessen KCGO Biologie, Q1.1, printed p. 38](https://www.fortbildung.kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf) lists the four types at GK/LK level beside protein biosynthesis and gene-product context. Its source-extraction learning-goal sentence is a **paraphrase**, not PDF wording. Reassess the HE `exact` mapping and GK/LK source views against any adopted current text.

The [Bavarian B12 2.4 competency](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium%20/12/biologie/grundlegend) also addresses mutagenic influences, **protein function**, and protection. The current BY `exact` mapping and GK/LK views cannot be treated as validated for this narrower shared proposal. Seven Sek-I source views (MV, NI, RP, SH, SN, ST, TH) also contain the Q1-tagged canonical ID and need stage-specific source checks. The existing source-projection receipt declares `newSourceReview: false` and was bound to a different whole-canonical-file SHA than the working tree during this QA.

The next reviewer can use this package as a candidate for source decisions and independent **current-text** D/P/A/M/V work. Do not promote this receipt to an active-asset V approval or a five-gate completion claim.
