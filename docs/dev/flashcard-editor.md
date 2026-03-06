# Flashcard Editor

The flashcard editor is a local developer tool for editing deck JSON files with live preview.
It runs inside the existing React app and uses local dev-only endpoints.

## Purpose

- Edit one selected flashcard deck directly from the browser.
- Preview cards with the same front/back rendering used by the normal SRS drill.
- Optionally maintain a DE/EN deck pair side by side.

## Source of truth

- Deck files live under `curricula/**/json/*_deck*.json`.
- On save, the edited deck is also mirrored to `app/public/data/`.

This keeps curriculum assets in the curriculum directory while still making them available to the frontend.

## Start

```bash
cd app
npm run dev
```

Then open:

- `http://localhost:5173/flashcard-editor`

## Current implementation

- Route: `/flashcard-editor`
- Main view: `app/src/views/FlashcardEditorView.tsx`
- Dev API: `app/vite.config.ts`
- Shared preview renderer: `app/src/components/srs/FlashcardFlipCard.tsx`

The editor uses the same rendered card component as the learning UI, so preview drift is minimized.

## Supported workflow

- One DE deck is required.
- One optional EN deck can be loaded as a pair.
- Cards are matched by `id`.
- Missing translations are shown as pair diagnostics.

## Editor capabilities

- deck selection from `curricula/**/json/`
- search by id, category, content, or tags
- live flip-card preview
- edit `deckId` and `title`
- edit card `id`, `category`, `tags`, `front`, and `back`
- add, duplicate, and delete cards
- local "done" markers per deck in browser storage

## Validation before save

The editor blocks save if required data is missing:

- `deckId`
- `title`
- `cards`
- per card: `id`, `front`, `back`, `category`
- unique card IDs inside a deck
- `tags` must be a string array if present

For paired DE/EN decks, ID mismatches are surfaced as warnings.

## Save flow

1. Save the JSON back to `curricula/.../json/<deck>.json`.
2. Mirror the same file to `app/public/data/<basename>.json`.
3. Keep formatting stable with two-space indentation and trailing newline.

## Dev API

The editor uses local Vite middleware endpoints:

- `GET /__deck-editor/list`
- `GET /__deck-editor/load?path=...`
- `PUT /__deck-editor/save`

These endpoints are dev-only and are not part of the production API surface.

## Safety rules

- Only deck files under `curricula/**/json/` are loadable.
- Path traversal is blocked by server-side path resolution.
- The tool is intended for local maintenance, not end-user editing.

## Current limits

- No production deployment path
- No authentication or multi-user coordination
- Very large decks may need UI virtualization later
- EN pairing is optional because some curricula currently ship DE-only decks
