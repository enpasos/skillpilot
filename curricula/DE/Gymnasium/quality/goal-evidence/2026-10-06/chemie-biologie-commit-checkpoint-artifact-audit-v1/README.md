# Commit checkpoint artifact audit

This additive audit inspected the current Chemistry and Biology M7 checkpoint without changing production curriculum inputs, historical artifacts or validator behavior.

## Observed state

- All 19 active input byte hashes match the frozen current378 verification checkpoint. The two current untracked reporting files must join the commit along with the other changed production inputs.
- Active Chemistry/Biology native D chains resolve 1,588 unique index, round, result, resolution and shared bundle artifacts. Every available manifest/resolution artifact byte digest checked here matches; none is missing. The pre-rule inventory records 84 ignored immutable review representations: 42 `bundle/book.pdf` and 42 `bundle/book.html`, totaling 38,637,916 bytes. The largest is 2,280,224 bytes.
- Direct current P/A/M/V configs, criteria, review JSONL, run manifests, composition visibility inputs, current canonicals/ledgers and available visual assets resolve 1,010 unique files: none missing or ignored. Fifteen are untracked: the current378 Memory config and the fourteen canonical/public PNG copies for seven integrated chemistry goals. The full file inventory lists them.
- The generic Git rules now expose all 84 manifest-bound review PDF/HTML files and ignore quality transport ZIPs. This later observation is additive; the inventories preceding it remain unchanged.
- The two oversized ZIPs are immutable historical local transport archives, not files directly read by the production central D/P/A/M/V validators or current CI entry points. Their exact archive hashes and file receipts stay versionable. Their 173,797,806-byte and 110,205,645-byte original archives remain local, unchanged and now ignored. No Git LFS or archive regeneration is needed.

## Actual production reader evidence

`app/scripts/reportDeepUnderstandingRollout.ts` loads the registered landscape, semantic-kind ledger, native D index/group/round JSON, dual summaries, resolutions and synthesis manifests. Its `loadRound` function reads `review-bundle-manifest.json`, `description-review-input.json`, `description-review-campaign.json` and native batch/result files; the bundle manifest binds shared review representations. The present central loader does not unzip either transport archive and does not read the PDF/HTML bytes merely to recalculate a review vote.

`app/scripts/exportGoalBookReviewBundle.ts` actually reads and binds source model, PDF/HTML and corresponding render manifests when creating an immutable native review bundle. Those review inputs must retain their exact bytes and stay available for scientific audit. They differ from the generated public books below ignored `app/public/lernzielbuch/`.

`app/scripts/positiveGoalEvidenceReview.ts` reads exact P configs, current landscape/semantic ledger, criteria, profile JSONL and configured run manifests; it reads actual public visualization bytes when binding resources. `app/scripts/semanticAtomicityReview.ts` reads configured A input/review JSONL. `app/scripts/memoryCardReview.ts` reads M input/card-review JSONL, inline canonical deck evidence and actual composition visibility files. The central V gate additionally reads canonical and public PNG/JPG asset bytes and checks their recorded digests after the standard visualization-QA freshness check.

The current CI workflow invokes existing schema, source-coverage, composition, Memory, deep-understanding and status/floor checks. Those existing production paths do not require local ZIP transport. Official-source PDF downloads remain separate local source caches by the repository's standing generic curriculum PDF ignore policy; no new exception for source downloads was introduced here.

## Limits

This is an availability and commit-readiness audit. It does not perform new scientific description/positive-evidence/atomarity/Memory/visual reviews, grant M7 completion, restore active bindings, claim human review, claim GitHub CI success or claim that all historical local transport content is present in a Git checkout. Strict checkpoint counts remain Chemistry 112/378 and Biology 67/383; Mathematics and Physics M7 are protected. Frozen source-page images, source extracts and receipts already record completed local reviews; candidate material and unresolved source scopes stay open.
