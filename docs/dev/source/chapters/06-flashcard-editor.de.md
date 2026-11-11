## Flashcard-Editor {#sec:dev-flashcard-editor}

Der lokale Flashcard-Editor (`/flashcard-editor`, implementiert in [`FlashcardEditorView.tsx`](repo:app/src/views/FlashcardEditorView.tsx) und [`FlashcardFlipCard.tsx`](repo:app/src/components/srs/FlashcardFlipCard.tsx) über die Vite-Dev-Middleware `/__deck-editor/{list,load,save}`) dient der Pflege und Live-Vorschau von Spaced-Repetition-Decks (`*_deck*.json`) inklusive KaTeX-Mathematik und Markdown.

### Deck-JSON-Schema, Sprachpaarung und Dual-Write-Speicherung {#sec:dev-fe-schema}

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

Redaktionsregeln:

- **Pflichtfelder:** Jedes Deck führt `deckId`, `title` und `cards[]`; jede Karte besitzt eine deckweit eindeutige `id`, `front`, `back`, `category` sowie optional `tags` (`string[]`). Karten-IDs müssen stabil bleiben, damit bestehende SM-2- und `verifiedRecall`-Lernstände ([Knotentypen](repo:docs/concept/skill-graph/node-types.md)) erhalten bleiben.
- **DE-/EN-Deck-Paarung:** Optionale englische Begleitdecks (`*_deck.en.json`) nutzen identische Karten-`id`s, sodass ein Sprachwechsel keinen Abrufstatus verliert.
- **Dual-Write-Speicherung (Repository-Modus):** `/__deck-editor/save` aktualisiert synchron die Quelldatei unter `curricula/...` und die Laufzeitkopie unter `app/public/data/<basename>.json` (im Standalone-Paketmodus werden Decks über `CurriculumResourceResolver` aus `data/cards/` aufgelöst).
