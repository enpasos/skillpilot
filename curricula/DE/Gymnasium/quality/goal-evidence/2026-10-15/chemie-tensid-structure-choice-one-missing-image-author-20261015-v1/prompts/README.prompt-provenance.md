# Prompt provenance

The actual single built-in `image_gen.imagegen` invocation used the exact body in `prompt.en.txt`, with `transparent_background: false` and no image reference inputs. `prompt.de.txt` is the German reconstruction/translation of that design brief, not an additional provider invocation. Technical goal IDs were excluded from the provider prompt. Four existing curriculum images were viewed locally for KEEP/style orientation; their pixels were not supplied to the provider.

The model/version behind the built-in tool was not exposed. No model version, provider API trace or human review is inferred. The source PNG is copied byte for byte from the built-in generated artifact. Two smaller PNG files are review-only FFmpeg Lanczos downsamplings, not additional generated candidates.

Content attribution: SkillPilot — Tensidstrukturen optimieren, author candidate, 2026-10-15; enpasos - Enterprise Patterns & Solutions GmbH; CC-BY-4.0 for our applicable rights. AI generation is provenance and does not independently establish rights or quality approval.
