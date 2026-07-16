# Goal Visualization Review - Mathematik Batch 197

Review date: 2026-07-16

Scope: bounded correction of six freshly rejected mathematics images from fresh AI review shard 1.

Status: `completed_with_three_deferred_provider_limitations`

## Outcome

| Goal ID | Title | Decision | Review |
| --- | --- | --- | --- |
| `5d1decb2-b01b-5c85-88fc-9fc255ff9776` | Klammerterme und Rechenreihenfolge sicher auswerten | `accepted_pilot_after_second_attempt` | The accepted image evaluates `(3 + 4) · 2 − 5` in the correct order and obtains `9`. The malformed phrase `Plus & Plinus` is gone; all visible German text and arithmetic are correct. |
| `474fe553-d868-50d9-a19b-761e64f21c0d` | Kleinen Satz von Fermat beweisen (LK) | `accepted_pilot_after_second_attempt` | The theorem, permutation argument, cancellation modulo `p`, exact residue table for multiplication by `2` modulo `5`, and numerical verification are mutually consistent. No course label appears in the image. |
| `1b67aeb4-2a55-531f-94da-283b4e3df5f1` | Kombinationen mit Binomialkoeffizienten in Anwendungen berechnen | `deferred_provider_limitation` | Three produced candidates remained visibly inconsistent: eight instead of ten listed pairs, then six balls for a five-element ground set, then malformed pair labels with duplicated numerals. The active link and all deployed image copies were removed. |
| `70efdec0-110c-5564-849b-bc05cfff0f6a` | Kombinationen ohne Zurücklegen mit Fakultäten berechnen | `deferred_provider_limitation` | Attempts 1 and 2 rendered the wrong double-factorial denominator `(n−k)!!`; the final fresh candidate corrected the calculation but visibly placed six balls in the ground-set urn labelled `n = 5`. The active link and all deployed image copies were removed. |
| `4f64f771-20ba-581a-86ba-bcdb1759e4d2` | Komplexe Zahlen in Polarform und Gaußscher Zahlenebene darstellen | `deferred_provider_limitation` | All three attempts retained an extra closing parenthesis in the trigonometric polar form despite increasingly explicit formula constraints. The active link and all deployed image copies were removed. |
| `77d607e0-0244-55ca-ba0f-214baa94b8de` | Konfidenzdiagramme deuten (LK) | `accepted_pilot` | The image shows a genuine two-dimensional confidence ellipse, nested 90% and 95% regions, a smaller region for the larger sample, and the correct frequentist coverage interpretation. Decimal commas are used and no course label appears. |

## Attempts

1. `5d1decb2-b01b-5c85-88fc-9fc255ff9776`
   - Attempt 1: `sha256:4d05c524a04777b831df9bfb88f2ec09fb17657101ae1caeab12c9c32befb9e3` - rejected because the visible phrase `Plus & Plinus` remained malformed.
   - Attempt 2: `sha256:4074311e593df75a29abcf79660e1298e423048d3147eb5389847c3dcf38c9a7` - accepted and imported.
2. `474fe553-d868-50d9-a19b-761e64f21c0d`
   - Attempt 1: `sha256:13df7bda9ce7fccfb2f6cc0e3f9c2ebb79b764455b1cd51dc98683adb56c341e` - rejected because the circular example did not explicitly show every residue mapping.
   - Attempt 2: `sha256:dda462afed02d9e27d83fca292083414c8940317aac76a1fc2fb33de9e4d4ab7` - accepted and imported with the exact four-row table.
3. `1b67aeb4-2a55-531f-94da-283b4e3df5f1`
   - Attempt 1: `sha256:8c46a7bdf8135b366c13827cc6a9e246876d8058c653bb92bacf7e64a58a4f1f` - rejected because only eight of ten unordered pairs were visible.
   - Attempt 2: `sha256:fd1772515f2eb5008deba692c2bf0471c4c461575ce8185c6bc15299e0bb595e` - rejected because the ground-set urn visibly contained six balls, including a duplicate `5`.
   - Attempt 3: `sha256:d9af887206b42d56d256cccba7192ae7e67310e9744b5ea759b997b02764d2e2` - rejected because several pair labels contained duplicated numerals and no longer denoted the required pairs.
4. `70efdec0-110c-5564-849b-bc05cfff0f6a`
   - Attempt 1: `sha256:9cefe8cb6e62558f358a4362621dcf9552b1e003127cb85d99ef9375cba3db41` - rejected because the general denominator ended in `(n−k)!!`.
   - Attempt 2: `sha256:e54a4619386045f6e7aca779bd9fead9cf7365bd37f786ac5a56bb71653298a0` - rejected because the same double-factorial error remained.
   - Attempt 3: `sha256:fda1e6e86cfea5c854c43c106766c62bbba86932bb72a35d4e6f394603363b3a` - rejected because the urn labelled `n = 5` visibly contained six balls.
5. `4f64f771-20ba-581a-86ba-bcdb1759e4d2`
   - Attempt 1: `sha256:bad07b76dabd46c737615c7466932451e87ef400d3de8c866833b3e982519c96` - rejected because the polar-form formula ended with an extra closing parenthesis.
   - Attempt 2: `sha256:57d59488353218966266c2f466558695429e0c5980eef900188283f2c0c15314` - rejected because the extra closing parenthesis remained.
   - Attempt 3: `sha256:bf2e6941529131919dbae8e8df742c58f656da5f6939c53a32d83102ef55c470` - rejected because a fresh reconstruction again ended with an extra closing parenthesis.
6. `77d607e0-0244-55ca-ba0f-214baa94b8de`
   - Attempt 1: `sha256:faff9085a96fb8397e1e8a6cdbd0bb28196435302952006572a0c63ffec29dc2` - accepted and imported.

## Active Asset Hashes

- `5d1decb2-b01b-5c85-88fc-9fc255ff9776`: `sha256:4074311e593df75a29abcf79660e1298e423048d3147eb5389847c3dcf38c9a7`
- `474fe553-d868-50d9-a19b-761e64f21c0d`: `sha256:dda462afed02d9e27d83fca292083414c8940317aac76a1fc2fb33de9e4d4ab7`
- `1b67aeb4-2a55-531f-94da-283b4e3df5f1`: no active asset; provider-deferred.
- `70efdec0-110c-5564-849b-bc05cfff0f6a`: no active asset; provider-deferred.
- `4f64f771-20ba-581a-86ba-bcdb1759e4d2`: no active asset; provider-deferred.
- `77d607e0-0244-55ca-ba0f-214baa94b8de`: `sha256:faff9085a96fb8397e1e8a6cdbd0bb28196435302952006572a0c63ffec29dc2`

## Checks

- Every provider call used `--no-import`; every produced candidate was inspected at original resolution before import.
- Prompt append text passed the provider-safety guard for all six goals and contains no technical IDs, filenames, product/platform names, school-form labels or internal paths.
- No SVG or manual fallback was used.
- Candidate paths, hashes and machine-readable review notes are recorded in `tmp/fresh-ai-review/shard-1-corrections.jsonl`.
- Accepted assets remain technical pilots. Human mathematical, accessibility and rights approval remains open.
