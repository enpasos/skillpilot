# Curriculum Quality Status

Generated: 2026-05-05T12:31:38.886Z
Rules version: curriculum-quality-v1

## Summary

| Metric | Value |
| --- | ---: |
| Curricula | 21 |
| M0 | 20 |
| M1 | 0 |
| M2 | 0 |
| M3 | 0 |
| M4 | 1 |

## Curricula

| Curriculum | Maturity | Goals | Atomic | Bundeslaender | QA scopes | Warn | Fail |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Biologie (Gymnasium, DE) | M0 | 216 | 182 | 1/16 | 0 | 1 | 0 |
| Chemie (Gymnasium, DE) | M0 | 217 | 177 | 1/16 | 0 | 1 | 0 |
| Chinesisch (Gymnasium, DE) | M0 | 192 | 181 | 1/16 | 0 | 1 | 0 |
| Deutsch (Gymnasium, DE) | M0 | 181 | 144 | 1/16 | 0 | 1 | 0 |
| Englisch (Gymnasium, DE) | M0 | 130 | 104 | 1/16 | 0 | 1 | 0 |
| Französisch (Gymnasium, DE) | M0 | 331 | 275 | 1/16 | 0 | 1 | 0 |
| Geschichte (Gymnasium, DE) | M0 | 210 | 171 | 1/16 | 0 | 1 | 0 |
| Griechisch (Gymnasium, DE) | M0 | 198 | 185 | 1/16 | 0 | 1 | 0 |
| Gymnasium (DE) | M0 | 1 | 0 | 0/16 | 0 | 1 | 0 |
| Informatik (Gymnasium, DE) | M0 | 221 | 180 | 1/16 | 0 | 1 | 0 |
| Italienisch (Gymnasium, DE) | M0 | 8 | 7 | 1/16 | 0 | 1 | 0 |
| Latein (Gymnasium, DE) | M0 | 142 | 109 | 1/16 | 0 | 1 | 0 |
| Mathematik (Gymnasium, DE) | M4 | 836 | 647 | 16/16 | 2 | 0 | 0 |
| Musik (Gymnasium, DE) | M0 | 76 | 52 | 1/16 | 0 | 1 | 0 |
| Physik (Gymnasium, DE) | M0 | 475 | 392 | 0/16 | 2 | 1 | 0 |
| Politik und Wirtschaft (Gymnasium, DE) | M0 | 208 | 175 | 1/16 | 0 | 1 | 0 |
| Polnisch (Gymnasium, DE) | M0 | 5 | 4 | 1/16 | 0 | 1 | 0 |
| Russisch (Gymnasium, DE) | M0 | 8 | 7 | 1/16 | 0 | 1 | 0 |
| Spanisch (Gymnasium, DE) | M0 | 83 | 59 | 1/16 | 0 | 1 | 0 |
| Tschechisch (Gymnasium, DE) | M0 | 5 | 4 | 1/16 | 0 | 1 | 0 |
| Wirtschaftswissenschaften (Gymnasium, DE) | M0 | 225 | 193 | 1/16 | 0 | 1 | 0 |

## Bundesland Coverage

| Curriculum | Complete | Visible | Partial | Error | Max atomic coverage |
| --- | ---: | ---: | ---: | ---: | ---: |
| Biologie (Gymnasium, DE) | 1/16 | 2 | 1 | 0 | 182/182 (100%) |
| Chemie (Gymnasium, DE) | 1/16 | 2 | 1 | 0 | 177/177 (100%) |
| Chinesisch (Gymnasium, DE) | 1/16 | 2 | 1 | 0 | 181/181 (100%) |
| Deutsch (Gymnasium, DE) | 1/16 | 2 | 1 | 0 | 144/144 (100%) |
| Englisch (Gymnasium, DE) | 1/16 | 2 | 1 | 0 | 104/104 (100%) |
| Französisch (Gymnasium, DE) | 1/16 | 2 | 1 | 0 | 275/275 (100%) |
| Geschichte (Gymnasium, DE) | 1/16 | 2 | 1 | 0 | 171/171 (100%) |
| Griechisch (Gymnasium, DE) | 1/16 | 2 | 1 | 0 | 185/185 (100%) |
| Gymnasium (DE) | 0/16 | 0 | 0 | 0 | 0/0 (0%) |
| Informatik (Gymnasium, DE) | 1/16 | 2 | 1 | 0 | 180/180 (100%) |
| Italienisch (Gymnasium, DE) | 1/16 | 1 | 0 | 0 | 7/7 (100%) |
| Latein (Gymnasium, DE) | 1/16 | 2 | 1 | 0 | 109/109 (100%) |
| Mathematik (Gymnasium, DE) | 16/16 | 16 | 0 | 0 | 647/647 (100%) |
| Musik (Gymnasium, DE) | 1/16 | 2 | 1 | 0 | 52/52 (100%) |
| Physik (Gymnasium, DE) | 0/16 | 16 | 16 | 0 | 355/392 (90.6%) |
| Politik und Wirtschaft (Gymnasium, DE) | 1/16 | 2 | 1 | 0 | 175/175 (100%) |
| Polnisch (Gymnasium, DE) | 1/16 | 1 | 0 | 0 | 4/4 (100%) |
| Russisch (Gymnasium, DE) | 1/16 | 1 | 0 | 0 | 7/7 (100%) |
| Spanisch (Gymnasium, DE) | 1/16 | 2 | 1 | 0 | 59/59 (100%) |
| Tschechisch (Gymnasium, DE) | 1/16 | 1 | 0 | 0 | 4/4 (100%) |
| Wirtschaftswissenschaften (Gymnasium, DE) | 1/16 | 2 | 1 | 0 | 193/193 (100%) |

## Rule Catalog

| Rule | Target | Category | Description |
| --- | --- | --- | --- |
| CQR-001 | M0 | graph | Goal IDs, local references, self-reference guards, and direct DAG checks are clean. |
| CQR-002 | M0 | graph | Stored type metadata agrees with structural atomic/cluster classification. |
| CQR-003 | M1 | applicability | Compiled Bundesland projections expose the full canonical atomic goal set for every declared jurisdiction. |
| CQR-101 | M2 | route | Configured route scopes connect motivation anchors to terminal autonomy goals through effective requires. |
| CQR-102 | M2 | route | Configured route scopes connect motivation anchors to terminal autonomy goals through direct atomic requires. |
| CQR-103 | M2 | route | Configured route scopes no longer depend on cluster-level requires for ordinary didactic sequencing. |
| CQR-201 | M3 | assessment | Terminal autonomy goals in configured scopes are exam-mode-capable or explicitly reviewed. |
| CQR-301 | M4 | review | Configured semantic-atomicity ledgers are complete, current, and free of unresolved review queue entries. |
| CQR-401 | M4 | view | The curriculum has at least one reviewed learner-facing composition view. |
| CQR-501 | M4 | applicability | Active applicability warnings are resolved and accepted warning records still match current findings. |

