# M0 Remediation Plan

Generated from `docs/qa-ci/status/curriculum-quality-status.json`; status snapshot generated at 2026-05-17T21:05:48.979Z.

This report is a reproducible work queue for curricula that are still at `M0`. It deliberately does not create review ledgers or memory-card configs. Those are only added after source coverage and route semantics are ready.

## Current Snapshot

| Metric | Value |
| --- | --- |
| Total curricula | 21 |
| M0 curricula | 11 |
| M6 curricula | 10 |
| Partial source expansion | 6 |
| Source bootstrap | 4 |
| Aggregate root | 1 |

## Recommended Next Work

1. Start with `Englisch (Gymnasium, DE)` as the next source-expansion pilot. It is small enough to keep the process manageable, already has HE/BY source material, and will force the language-specific CEFR/skills modeling questions into the open. The concrete pilot plan is generated as `docs/qa-ci/status/english-remediation-pilot.md`.
2. After English, use `Französisch (Gymnasium, DE)` to verify that the language workflow generalizes to a larger graph with Sek I and Sek II material.
3. Keep `CQR-302` out of these subjects until source coverage, composition views, route scopes, and semantic atomicity are genuinely ready. Memory review is an M6 layer, not a shortcut out of M0.
4. Decide separately how `Gymnasium (DE)` should be counted. It is an aggregate entry point, not a normal subject landscape with its own 16 Bundesland source inventories.

## M0 Detail

| Priority | Curriculum | Category | Sources | QA scopes | CQR-301 | CQR-302 | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | Englisch (Gymnasium, DE) | partial source expansion | 2/16 | 0 | not_configured | not_configured | Recommended next pilot: expand source coverage beyond HE/BY and define language-specific QA scopes before any memory review. |
| 20 | Französisch (Gymnasium, DE) | partial source expansion | 2/16 | 0 | not_configured | not_configured | Good second language pilot after English; HE Sek I/Sek II and BY already provide an initial source base. |
| 30 | Spanisch (Gymnasium, DE) | partial source expansion | 2/16 | 0 | not_configured | not_configured | Complete 16/16 source coverage and Bundesland projections first; then add semantic atomicity, QA scopes, and finally CQR-302. |
| 40 | Musik (Gymnasium, DE) | partial source expansion | 2/16 | 0 | not_configured | not_configured | Complete 16/16 source coverage and Bundesland projections first; then add semantic atomicity, QA scopes, and finally CQR-302. |
| 50 | Chinesisch (Gymnasium, DE) | partial source expansion | 2/16 | 0 | not_configured | not_configured | Complete 16/16 source coverage and Bundesland projections first; then add semantic atomicity, QA scopes, and finally CQR-302. |
| 60 | Griechisch (Gymnasium, DE) | partial source expansion | 2/16 | 0 | not_configured | not_configured | Complete 16/16 source coverage and Bundesland projections first; then add semantic atomicity, QA scopes, and finally CQR-302. |
| 70 | Gymnasium (DE) | aggregate root | 0/16 | 3 | not_configured | not_configured | Decide whether the DE Gymnasium overview should be governed by aggregate-only rules or excluded from subject maturity counts. |
| 80 | Italienisch (Gymnasium, DE) | source bootstrap | 0/16 | 0 | not_configured | not_configured | Start with official source inventory and source-extraction before creating atomicity or memory ledgers. |
| 80 | Polnisch (Gymnasium, DE) | source bootstrap | 0/16 | 0 | not_configured | not_configured | Start with official source inventory and source-extraction before creating atomicity or memory ledgers. |
| 80 | Russisch (Gymnasium, DE) | source bootstrap | 0/16 | 0 | not_configured | not_configured | Start with official source inventory and source-extraction before creating atomicity or memory ledgers. |
| 80 | Tschechisch (Gymnasium, DE) | source bootstrap | 0/16 | 0 | not_configured | not_configured | Start with official source inventory and source-extraction before creating atomicity or memory ledgers. |

## Done Criteria For A Subject Leaving M0

- `CQR-000` is no longer warning or failing: official source inventories are readable, URL-backed, and registered.
- `CQR-003` is clean for all 16 Bundeslaender or the subject has an explicitly reviewed different scope.
- Learner-facing composition views and QA scopes exist before route quality is claimed.
- `CQR-301` semantic atomicity is reviewed from actual goal semantics, not generated as a placeholder.
- `CQR-302` is configured only after the above is stable and only if the subject is ready for M6.

