## Flashcard Editor {#sec:dev-flashcard-editor}

The local Flashcard Editor (`/flashcard-editor`, implemented in [`FlashcardEditorView.tsx`](repo:app/src/views/FlashcardEditorView.tsx) and [`FlashcardFlipCard.tsx`](repo:app/src/components/srs/FlashcardFlipCard.tsx) backed by Vite dev middleware `/__deck-editor/{list,load,save}`) authors and previews spaced-repetition decks (`*_deck*.json`) with live KaTeX math and Markdown rendering.

### Deck JSON Schema, Bilingual Pairing, and Dual-Write Save {#sec:dev-fe-schema}

```json
{
  "deckId": "physics_sek2_q1_fields_deck",
  "title": "Q1 Elektrisches und magnetisches Feld",
  "cards": [
    {
      "id": "q1-field-01",
      "front": "Definiere die elektrische Feldstaerke $E$.",
      "back": "$E = \\frac{F}{q}$ in $\\mathrm{N/C}$ bzw. $\\mathrm{V/m}$.",
      "category": "Grundbegriffe",
      "tags": ["GK", "LK"]
    }
  ]
}
```

Authoring invariants:

- **Required card fields:** Every deck defines `deckId`, `title`, and `cards[]`; each card carries a deck-unique `id`, `front`, `back`, `category`, and optional `tags` (`string[]`). Card IDs must remain stable so existing learner SM-2 and `verifiedRecall` records ([Node Types](repo:docs/concept/skill-graph/node-types.md)) stay bound.
- **DE / EN deck pairing:** Optional English companion decks (`*_deck.en.json`) align card-by-card via identical `id` values so learners can switch languages without losing recall state.
- **Dual-write persistence (repository mode):** Saving via `/__deck-editor/save` writes both the canonical file under `curricula/...` and its runtime mirror under `app/public/data/<basename>.json` (whereas standalone package mode resolves decks from `data/cards/` via `CurriculumResourceResolver`).
