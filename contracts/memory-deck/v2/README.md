# Memory-card deck source format 2

Every canonical German Gymnasium deck under `curricula/DE/Gymnasium/memory-decks/`
declares `"schemaVersion": 2` and conforms to
[memory-deck.schema.json](memory-deck.schema.json). Format 2 adds the card field
`originGoalIds`: the understanding goals of the card, that is the canonical
ordinary atomic goals whose learning the card supports. The list is non-empty,
free of duplicates and, as a set, equal to the `originGoalIds` of the card's kept
record in the active memory-card review ledger. A card without a review record
and without another source of the relation carries no field; the relation is
never inferred.

Earlier decks carried either no version marker or `"schemaVersion": 1`. Neither
was bound to a schema. Some of them already carried `originGoalIds`; others
encoded the relation as `goal:<id>` tags.

## The retired `goal:<id>` tags

The tag `goal:<id>` is the retired encoding of the same relation. Readers use
`originGoalIds` and fall back to `goal:` tags only for a card that does not carry
the field (`cardOriginGoalIds` in `app/src/utils/memoryCardOrigins.ts`).

The Physics and Chemistry decks still carry their `goal:` tags, because the
fingerprints of their kept card reviews (`memory-card-review-v1`) cover the
complete tag list. While a card keeps such tags they must name exactly the
set in `originGoalIds`. Removing them changes those fingerprints and therefore
needs refreshed review records: in the Physics card ledger, and in a successor
of the active Chemistry card ledger under `quality/goal-evidence/`. A
new `goal:` tag without the same `originGoalIds` fails validation.

## Validation

- `python3 scripts/validate_schemas.py` validates every deck against the schema.
  It also requires unique card IDs, exact `goal:` tag mirrors and the same card
  IDs and `originGoalIds` in an `.en.json` variant as in its German deck.
- `npm --prefix app run quality:memory-card-review:check:all` compares each card
  of a format-2 deck with its kept review record. A missing or different
  `originGoalIds` set is a blocking issue.
- `npm --prefix app run check:memory-deck-origins` confirms that the decks equal
  the deterministic derivation from the active review ledgers.
  `npm --prefix app run sync:memory-deck-origins` writes it.

## Packages

The curriculum-package contracts v1 to v1.3 keep the closed card-deck format
`1.0`. The release-model compiler projects a format-2 source deck onto it by
omitting `schemaVersion` and the card field `originGoalIds`. The package keeps
the relation in its release-quality evidence
(`lanes.memoryCards.activeCardDecisions[].originGoalIds`), which is derived from
the same review records. The compiled decks therefore stay byte-identical. A
later package contract that carries the field in the deck itself is a separate
version. It requires new package digests and review bindings.

The subject export (`app/scripts/buildSkillpilotExportPackage.ts`) ships decks as
authored. Its `schemas/flashcard-deck.schema.json` declares `schemaVersion` and
`originGoalIds`, its validator requires every exported origin goal to resolve in
the exported landscape, and the MEM/FWU roundtrip carries the field as
`sp:originGoalId`.
