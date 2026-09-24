# `fde351a8…`: current source-route audit (candidate, not integrated)

This is a targeted machine curriculum audit of the still-open goal “Beziehungen im Modell formulieren”. It makes no human approval claim and changes no goal, mapping, source extraction, registry, or historical review.

## Finding

The current goal requires learners to formulate relationships between quantities **as equations, inequalities or functions** and interpret terms in context. Its `dimensionTags.processCompetencies` names `K2.3`, which is the official problem-solving standard for developing a strategy for a complex problem. The goal instead describes mathematical **modeling**. In the [official HMKB 2024 Mathematics KC](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf), printed pp. 14 and 22, K3 is modeling: constructing or evaluating models, translating real situations, and interpreting results; K3.4 and K3.5 cover multistep modeling and interpretation. This is a plausible route to review, not an automatic new `sourceRef` or a machine approval.

The current HE upper-secondary `exact` mapping points to source goal `he-math-sekii-q4-2-b08-a02-a1b42ed0`, the Q4.2 aspect “Begründen und interpretieren gegebener Terme”. It supports interpreting **given** terms, not independently formulating relations in the three named forms. The extraction says `S. 51`; the same text appears on **printed p. 52** of the official PDF. Both the content mismatch and page-number discrepancy require a versioned correction; a changed hash or local D-resolution alone would not establish the route.

The BW upper-secondary `exact` mapping points to BP2016 §2.3(5), whose extracted official process text explicitly supports describing relations with variables, terms, equations and functions, among other representations. It does not expressly name inequalities or the second act of interpreting terms in context. This route is useful partial support, not by itself a full `exact` proof for the present wording. The existing HE G8 8G.1 and G9 9.1 `exact` mappings point only to broad “realitätsbezogene Beispiele zu Sach- und Textaufgaben” topic foci; neither identifies the claimed three modeling representations. The SH Sek I mapping is already `partial`.

## Required next step

Review the intended competence and per-scope source routes together: HE K3 modeling standards, BW §2.3(5), and the actual HE G8/G9 material. Then make only supported, versioned mapping/metadata and, if needed, goal-text changes; inspect affected learner-facing placements and source rationale; regenerate only affected D, P, A, M, page and image bindings. Re-run the scoped source, publication and five-gate checks before counting `fde351a8…`. Keep its existing P and V records as valid for the current text until a substantive change invalidates them. This goal remains D-open in the present central report.
