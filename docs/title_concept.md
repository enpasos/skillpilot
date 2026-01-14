# Curriculum title/description localization concept

## Motivation
The current curriculum JSON embeds bilingual strings via fields like `title` and `titleEn` (same for `description`).
This leads to duplication, potential drift, and makes the schema noisier than needed.
At the same time, each JSON file should remain human-readable on its own.

## Goals
- Keep every locale-specific curriculum JSON readable (contains `title` and `description` in that locale).
- Remove `titleEn` / `descriptionEn` from the core schema.
- Avoid structural drift across locales (same goals, same IDs, same graph).
- Allow missing translations to fall back to the base locale.

## Proposed structure
Use a base-locale curriculum JSON as the single source of truth for structure and strings in that locale.
Store translations in a compact overlay file, then generate full locale JSONs during export/build.

### File layout
- Base (authoring, human-readable):
  - `curricula/.../json/<landscapeId>.de.json`
- Translation overlay (compact, human-readable):
  - `curricula/.../json/i18n/<landscapeId>.en.json`
- Generated localized curriculum (human-readable output):
  - `curricula/.../json/<landscapeId>.en.json`

This keeps the canonical file readable while still enabling clean localization.

### Overlay schema (proposal)
```json
{
  "landscapeId": "EU_EUR_L_CEFR_ENGLISH_A1",
  "baseLocale": "de",
  "locale": "en",
  "version": 1,
  "landscape": {
    "title": "English A1",
    "description": "..."
  },
  "goals": {
    "A1_01_GREETINGS": {
      "title": "Greetings and introductions",
      "description": "The learner can ..."
    }
  }
}
```

### Merge rules
- Start from the base JSON (e.g., `.de.json`).
- If an overlay exists for the target locale:
  - Replace top-level `title` / `description` with overlay values if present.
  - Replace per-goal `title` / `description` where overlay entries exist.
- Any missing overlay entry falls back to the base locale text.
- Unknown goal IDs in the overlay should be flagged (warning or error).

## Export/build flow
1) Author and update the base JSON (structural source of truth).
2) Maintain translation overlays in `json/i18n/`.
3) Export step merges base + overlay and writes full localized JSONs.
4) Runtime uses the full localized JSON, no merge needed.

This keeps runtime simple and ensures each `.xx.json` is readable on its own.

## Migration outline
- Remove `titleEn` / `descriptionEn` from the base schema.
- Extract existing `titleEn` / `descriptionEn` into overlay files.
- Add a merge/export step to generate localized JSONs.
- Add a localization audit to report missing or extra overlay entries.

## Trade-offs
Pros:
- Readable files per locale.
- Single source of truth for structure.
- Reduced schema noise (no duplicated fields).

Cons:
- Requires a merge/export step.
- Need to maintain overlay coverage.

## Open questions
- Base locale (likely `de`) for each landscape?
- Should generated localized JSONs be committed or build artifacts only?
- Validation level: warn vs. fail on missing translations?
