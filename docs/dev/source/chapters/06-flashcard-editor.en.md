## Flashcard Editor {#sec:dev-flashcard-editor}

The local Flashcard Editor (`/flashcard-editor`, implemented in [`FlashcardEditorView.tsx`](repo:app/src/views/FlashcardEditorView.tsx) and [`FlashcardFlipCard.tsx`](repo:app/src/components/srs/FlashcardFlipCard.tsx) backed by Vite dev middleware `/__deck-editor/{list,load,save}`) authors and previews spaced-repetition decks (`*_deck*.json`) with live KaTeX math and Markdown rendering.

### Deck JSON Schema, Bilingual Pairing, and Dual-Write Save {#sec:dev-fe-schema}

```json
{
  "schemaVersion": 2,
  "deckId": "physics_sek2_q1_fields_deck",
  "title": "Q1 Elektrisches und magnetisches Feld",
  "cards": [
    {
      "id": "q1-field-01",
      "front": "Definiere die elektrische Feldstaerke $E$.",
      "back": "$E = \\frac{F}{q}$ in $\\mathrm{N/C}$ bzw. $\\mathrm{V/m}$.",
      "originGoalIds": ["<goal-id>"],
      "category": "Grundbegriffe",
      "tags": ["GK", "LK"]
    }
  ]
}
```

Authoring invariants:

- **Required card fields:** Every deck defines `deckId`, `title`, and `cards[]`; each card carries a deck-unique `id`, `front`, `back`, `category`, and optional `tags` (`string[]`). Card IDs must remain stable so existing learner SM-2 and `verifiedRecall` records ([Node Types](repo:docs/concept/skill-graph/node-types.md)) stay bound.
- **Understanding goals (source format 2):** Canonical Gymnasium decks under `curricula/DE/Gymnasium/memory-decks/` declare `"schemaVersion": 2` and follow the [memory-deck contract](repo:contracts/memory-deck/v2/README.md). Each card names its understanding goals, the ordinary atomic goals it supports, in `originGoalIds`; as a set, the list equals the card's kept memory-card review record. A `goal:<id>` tag is the retired encoding of the same relation: readers use it only for a card without `originGoalIds`, and where such tags remain they repeat the field exactly. `npm --prefix app run sync:memory-deck-origins` derives the field from the active review ledgers.
- **DE / EN deck pairing:** Optional English companion decks (`*_deck.en.json`) align card-by-card via identical `id` values so learners can switch languages without losing recall state.
- **Dual-write persistence (repository mode):** Saving via `/__deck-editor/save` writes both the canonical file under `curricula/...` and its runtime mirror under `app/public/data/<basename>.json` (whereas standalone package mode resolves decks from `data/cards/` via `CurriculumResourceResolver`).
