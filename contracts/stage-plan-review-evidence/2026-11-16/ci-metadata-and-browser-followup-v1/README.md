# PR #159: generated metadata and browser fixture repair

This bounded follow-up repairs three failures reached by the CI run for
`b81b585d0898ced7ace252cacf41135890bce477` and four further failures found by
running the previously unreached downstream commands locally. That remote run
finished with eleven successful and three failed jobs:

- Curriculum CI: seven descriptions in the public Physics source-rationale
  index did not match the current canonical goals. The existing generator
  supplied those seven replacements. All other index fields, including source
  assignments and review metadata, remain unchanged.
- Curriculum integrated build: the generated Physics visualization status
  still described an older inventory. The normal generator now reports the
  current 841 goals and 485 ordinary atomic goals with image links. Coverage
  is distinct from approval: the report still records zero release-approved
  images and 72 links without an accepted review. No image bytes are changed.
- Application frontend CI: a browser fixture explicitly contained the subject
  under its overview root, while its assertions expected an empty overview.
  The corrected test exercises both valid shapes. It retains unique authored
  targets, own and foreign preparation, real prerequisite focus, safe clicks
  on presentation aggregates, and standalone navigation without public data
  fallback. Production navigation code is unchanged.
- The Mathematics source-rationale coverage report now includes the current
  1,310 goals. Its 807 relevant ordinary atomic goals and 53 missing public
  rationales remain unchanged. This refresh reports the already-authored
  assessment and cluster additions; it does not fill a source gap by assertion.
- The AI transparency inventory refreshes five measured Layer-A fields through
  the existing reviewable patch command: canonical goal count, image extensions,
  recorded providers and C2PA-container observations. It retains the newly
  observed missing marker. Policies, review conclusions, unrelated media hashes
  and all actual assets remain unchanged.
- The method-route regression now checks the current qualitative preparation
  chain, 28 cross-stage Sek-I acquisition branches and 28 narrow Sek-II branches.
  RP retains its distinct experiment bridge and three released successor tasks;
  the withdrawn mixed task must keep empty coverage and stay excluded.
- The semiconductor regression recognizes the exact retained K3 successor of
  the old K1 mapping. It exposed a real generator omission: cold generation
  lost the personally performed amplifier component. One final, single-clause
  override now reproduces the already-active decision. Actual isolated full BY
  generation confirms that every unrelated decision, row, top-level field and
  extraction byte remains unchanged. Historical receipts remain untouched.

The [generated-data comparison](generated-metadata-review.actual.json) is an
actual independent review by a separate agent, bound to the canonical and
output bytes. The browser test has a [separate independent source
review](browser-fixture-review.actual.json). The [later reports](downstream-metadata-review.actual.json)
and [Physics generator/tests](physics-independent-review.actual.json) were also
independently reviewed on their final bytes. None is a new pedagogical
approval or evidence of classroom effectiveness.

Local commands, terminal results, source hashes and retained raw logs accompany
this note. An interrupted local application-build attempt is retained with
an unknown command exit status; only the completed retry can count as local
success. These local results do not establish remote CI, main integration or
deployment readiness. No real Land plan is activated by this repair.

`rationale-author-evidence.actual.tar.gz` retains the failed reproduction,
actual generator output for seven goals, exact patch and successful check.
The large before/after index copies are not duplicated: they are the previous
commit's file and this delivery's file, with hashes retained in the evidence.
`generated-metadata-review.evidence.actual.tar.gz` retains the independent
checks. The [browser author receipt](browser-author-receipt.actual.json) and
`browser-author-evidence.actual.tar.gz` distinguish the nine successful
frontend steps from the final changed-test replay and focused lint. That last
replay includes actual focus and click actions in the empty-overview case.

The [Physics author receipt](physics-author-receipt.actual.json) and
`physics-author-evidence.actual.tar.gz` retain both failed starting points,
the actual cold generator comparison, final passing normal tests, focused
lint/typechecking and 316 unchanged input/review files. The six method tests
compile all 64 atlas views against all 21 canonical roots. The semiconductor
check covers 33 clauses and 70 view/book paths; book navigation is explicitly
distinct from the five actual learner acquisition views.

The [local command receipt](local-checks.actual.json) and
`downstream-checks.evidence.actual.tar.gz` retain all 28 downstream workflow
steps, five frontend artifact checks and the normal rechecks after the two
report refreshes. Initial failures remain visible rather than being overwritten
by passing results. The full quality calculation and all 21 catalog/twelve
route floors pass; Mathematics and Physics remain M7. Final Physics replays are
in the separate author receipt, not silently substituted into the first run.
