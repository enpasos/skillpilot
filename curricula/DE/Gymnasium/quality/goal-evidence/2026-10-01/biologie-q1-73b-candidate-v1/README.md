# Biologie Q1: Gentests beurteilen — candidate package

**Status, 1 October 2026:** nonblind AI authoring candidate for canonical goal
`73b66ead-e44a-5486-98e3-1fb3f99620a6`. The canonical goal, source mappings,
composition views, quality registries, and learner data were not changed. This
package is neither a current D decision nor an approved P record. The proposed
text needs a new current-text independent A/B review before any adoption.

## Bilingual description proposal

| Language | Current | Proposed |
| --- | --- | --- |
| DE | Die lernende Person kann Anlass, Aussagekraft und Grenzen verschiedener Gentests erläutern. | Die lernende Person kann an einem vorgegebenen anonymen Gentestfall den Anlass, die Aussagekraft des Befunds für die geprüfte Frage und dessen Grenzen für eine sachliche Beratung beurteilen. |
| EN | The learner can explain the reason, validity, and limits of various genetic tests. | Using a supplied anonymous genetic-test case, the learner can assess the reason for testing, what the finding can establish about the question tested, and the limits of that finding for factual counselling. |

The [structured proposal](description-proposal.json) ties the indication,
tested question, finding, and its limit to one supplied case. It removes the
unspecified breadth of “various tests” and makes the title's assessment action
observable. The [V2 profile draft](positive-understanding-evidence-v2.draft.json)
requires two independently handled, meaningfully different cases. It is an
**unbound profile body**, since the proposed description has not become the
current canonical text. Its `data` archetype follows the V2 schema; the earlier
authoring draft's `evaluation` archetype is outside that schema's enum.

## Source and view impact

- The checked local [official Hessian KCGO Biology PDF](../../../../input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf)
  has SHA-256 `52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558`.
  Printed page 39, Q1.3, names “Gentest und Beratung” at the shared GK/LK
  basic level. It does not prescribe a test method, a numerical risk threshold,
  or a personal decision. The local Q1.3.4 [source-extraction text](../../../../input/HE/upper-secondary/source-extraction/DE_HE_BIOLOGIE_SEKII_KC2024.source-extraction.json)
  is an authored paraphrase, not the PDF's wording. The current [HE mapping](../../../../mapping/DE-HE/upper-secondary/hessen_biology_upper_secondary_source_extraction_to_canonical_biology.review.json)
  calls its one-to-one match `exact`; that classification must be reconsidered
  against the official bullet if this narrower text is adopted.
- The official Bavarian [basic](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/grundlegend)
  and [elevated](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/erhoeht)
  B12 Biology curricula both address comparison of genetic-family-counselling
  methods and evaluation of human DNA analysis, including ethical aspects.
  They name wider method and decision content than this bounded test-interpretation
  case. In the inspected [BY source mapping](../../../../mapping/DE-BY/gymnasium/bavaria_biology_source_extraction_to_canonical_biology.review.json),
  the corresponding B12 clauses map to separate canonical goals
  `031fd4f3-906e-5919-ae7f-a2b0b9220604` and
  `2ef8b0c2-8ba3-54b7-99ff-8c743a4efa63`, with no direct mapping to this
  Gentest goal. Its raw canonical applicability includes DE-BY, but that alone
  does not prove BY source coverage or learner-facing projection. Recheck BY
  applicability, mapping and effective views before adopting the proposal;
  do not count this case as the full BY method-comparison or ethics competence.
- The canonical goal currently has Q1, GK/LK, `demandLevel: AB2`, and requires
  the pedigree goal `440854be-7f06-5678-91cb-ba8dcab56959` plus the
  orientation goal `2d451684-6e53-565e-a987-f362da919d2c`. This package
  proposes no ID, edge, scope, course-level or view edit. A reviewer should
  confirm that “beurteilen”, already in the title, fits the intended demand
  level, then recompile and inspect the HE GK/LK source views and any affected
  BY projection after a text change. The [existing Q1 audit](../../../../../../../docs/qa-ci/biology-q1-next-package-audit-2026-10-01.md)
  describes the target as open in the strict D/P/A/M/V intersection.

## Explicit limits of the fictional cases

The draft's first case is a **fictional adult** tested for one named fictional
family variant. The card supplies that the variant has incomplete penetrance.
Detection answers the tested question; it does not prove that the person will
develop the condition. The second, independent case changes both test purpose
and finding: a limited carrier panel reports none of its listed variants. That
does not exclude other variants or carrier status overall. These interpretation
limits align with [MedlinePlus Genetics on test results](https://medlineplus.gov/genetics/understanding/testing/interpretingresults/)
and [incomplete penetrance](https://medlineplus.gov/genetics/understanding/inheritance/penetranceexpressivity/).

Both case cards are invented and anonymous. Tasks request no learner or real
family history, genetic result, diagnosis, or testing decision. A learner
formulates a factual, non-directive statement **about the case**; this is not
clinical counselling. No risk percentage, test sensitivity, false-result rate,
or method comparison is demanded without case data. A positive result and a
negative result each require a constructive explanation of indication, finding
and limit; merely rejecting an exaggerated claim is insufficient evidence.

## Remaining gates

The old twelve-goal A/B review disagreed (`keep`/`revise`) on the current text,
and its synthesis left this goal open. The earlier author proposal informed
this candidate; it is not an independent review. If the proposed text is
adopted, create a new bound D campaign and independent A/B decisions, review
and register a current-fingerprint P record, rebind A and M deliberately,
review source/view impacts, and assess a suitable active image. The separate
[image candidate](../../../goal-visualization-review/biologie-q1-73b-candidate-v1/review.md)
is not a primary link or V pass. Only then rerun the central strict report.

**Local checks:** both JSON files parse; the nested profile validates against
the V2 schema's `profile` definition; README local links resolve. The draft
does not claim to validate as a complete fingerprint-bound P review record.
