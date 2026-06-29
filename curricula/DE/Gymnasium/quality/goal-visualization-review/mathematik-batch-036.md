# Goal Visualization Review - Mathematik Batch 036

Review date: 2026-06-29

Scope: canonical `DE Gymnasium Mathematik`, atomic goals.

Batch status: `blocked_provider_quota_retry`

Generator/prompt policy:

- Provider prompts do not contain concrete SkillPilot goal IDs.
- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used.

## Attempted Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `68505a32-3b1d-57b2-a495-00b4097eb50d` | Potenzen von Wurzeltermen vereinfachen | `blocked_provider_quota` | Retried with a narrow prompt focused only on powers of square-root terms. Gemini returned `429` before producing an image. No accepted image was produced or linked. |
| `62e0a4e3-d1d3-46a2-982d-6b99dca6d3fb` | Wurzelterme teilweise radizieren | `not_attempted_after_quota_block` | Left open because the provider quota block occurred on the first retry item. |
| `e131c594-c45e-5718-9f33-7ae39ddc82ad` | Nenner mit Wurzeltermen rationalisieren | `not_attempted_after_quota_block` | Left open because the provider quota block occurred on the first retry item. |
| `759485a9-51c0-4261-af7d-caa3c0e5d68b` | Verknüpfte Ereignisse mit Mengen- und Vierfelderdarstellungen strukturieren | `not_attempted_after_quota_block` | Left open because the provider quota block occurred on the first retry item. |
| `4ac925cf-3862-4810-be2a-d92efff7d735` | Wahrscheinlichkeiten verknüpfter Ereignisse berechnen | `not_attempted_after_quota_block` | Left open because the provider quota block occurred on the first retry item. |

## Batch Checks

- Batch 036 is not a release batch.
- No Batch 036 asset is accepted.
- No Batch 036 asset is linked from the canonical mathematics landscape.
- The affected goals should be picked up again by a future `visualization:plan-batch` run once provider quota is available.
