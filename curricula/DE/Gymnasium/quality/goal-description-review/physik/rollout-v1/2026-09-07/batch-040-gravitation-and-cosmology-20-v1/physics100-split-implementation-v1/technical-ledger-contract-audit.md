# B040 split: technical ledger-contract audit

Technical inspection checkpoint: 2026-09-07T19:06:27Z, independent agent `/root/physics_b043_blind_a`. This is an implementation aid, not a new content review, source/projection approval, or change to any previous blind-review seal. No canonical, source, view, deck, or active quality-ledger writes were made by this audit.

## Semantic classification contract

Source: `contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json`, `$defs.semanticKind` and `$defs.semanticKindDecision`.

Allowed kinds are exactly `curricularAtomic`, `curricularArea`, `practiceAssessment`, `programStructure`, `memory`, `runtimeSupport`, `orientation`. The three converted parents need **curricularArea**, not `curricularCluster`.

Native fingerprint API (exported from `app/scripts/goalBookModel.ts:624`):

```ts
import { fingerprintSemanticKindSourceGoal } from './app/scripts/goalBookModel.ts';

const parentDecision = {
  goalId: finalRawParent.id,
  sourceFingerprint: fingerprintSemanticKindSourceGoal(finalRawParent),
  semanticKind: 'curricularArea',
  decisionStatus: 'authoritative',
  decisionBasis: 'reviewed-current-post-split-curricular-area',
};
const childDecision = {
  goalId: finalRawChild.id,
  sourceFingerprint: fingerprintSemanticKindSourceGoal(finalRawChild),
  semanticKind: 'curricularAtomic',
  decisionStatus: 'authoritative',
  decisionBasis: 'reviewed-current-post-split-curricular-atomic',
};
```

These are the complete five decision fields; additional properties are forbidden. The semantic-kind ledger's native `authoritative` classification is not a claim of human D-review approval. The corresponding `reviewed-current-structural-split-...` bases are also allowed. Recalculate the existing seven-kind counts from actual final decisions, not from copied historical totals.

Source fingerprints bind raw `id,type,nodeKind,title,titleEn,description,descriptionEn,tags,contains,requires,semanticAtomic,dimensionTags,examData,extendedData,release`. Missing and null differ. Tags are uniquely validated and sorted; edge order is retained. Therefore fingerprint all seven final children, three final parents and every changed existing raw goal, including the 13 planned requires rewires and memory goal `266b6cf8-d49d-5197-862c-9998fcf179a5`. Any additional assessment or text changes also need their own current binding.

## Active A/M ledger cleanup and exact shapes

The old three IDs are:

- `c9405043-bdc0-5995-8b4d-5bb56d97d05d`
- `e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9`
- `5db07785-8cca-50d5-81a9-e0264d344af9`

Nonempty `contains` removes these from both ordinary content-leaf review scopes. Preserve their former rows in a separately named implementation archive, and remove their rows from **both active** `canonical-physics-full.review.jsonl` files. Neither goal ledger has an archive/remove status. Add seven individually justified current child decisions, without inheriting old judgments merely from parentage.

Shared record fields are `schemaVersion:1, reviewId:"canonical-physics-full", landscapeId:"7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a", goalId, fingerprint, reviewedAt, reviewer, reason`. Use real review timestamps/identity and nonblank goal-specific reasons.

| Lane | Additional required fields | Optional fields |
| --- | --- | --- |
| A | `ruleVersion:"semantic-atomicity-v1", status, semanticAtomic` | `suggestedAction`, `suggestedSplit:string[]` |
| M goal | `ruleVersion:"memory-card-review-v1", status, memoryUseful` | `memoryGoalIds:string[]`, `deckIds:string[]` |
| M card | Shared metadata, but `deckId,cardId` instead of `goalId`; `ruleVersion:"memory-card-review-v1", status, necessary` | `originGoalIds:string[]` |

A pairings: `atomic/true`, `non_atomic/false`, `needs_developer_review/null`. M goal: `no_memory_needed/false` without references; `memory_required/true` with nonempty memory-goal/deck references; `needs_developer_review/null`. Card: `kept/true` with current ordinary origin IDs; `remove/false`; `needs_developer_review/null`.

**Validator caveat:** `semanticAtomicityReview.ts:297-314` reports obsolete rows but does not make them blocking; A exit 0 alone does not establish zero obsolete debt. `memoryCardReview.ts:1129` does make obsolete goal records blocking. Require explicitly `Obsolete review records: 0` in both outputs, plus exact old-three absence/new-seven presence.

A/M fingerprint functions are private in their executable scripts; do not import those CLIs as libraries. Both hash this payload with their respective ruleVersion:

```ts
{
  ruleVersion, goalId: goal.id, shortKey: goal.shortKey ?? '',
  title: normalizeText(goal.title), titleEn: normalizeText(goal.titleEn),
  description: normalizeText(goal.description),
  descriptionEn: normalizeText(goal.descriptionEn),
  phase: normalizeText(goal.dimensionTags?.phase),
  area: normalizeText(goal.dimensionTags?.area),
  topicCode: normalizeText(goal.dimensionTags?.topicCode),
  nodeKind: normalizeText(goal.nodeKind),
}
```

`normalizeText(v) = String(v ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()`. Recursively serialize arrays in order and object entries sorted by `key.localeCompare(otherKey)`; SHA-256 the stable JSON and prefix `sha256:`. These are NOT semantic-kind source fingerprints. A/M payloads omit requires, contains, type, semanticAtomic, weight and applicability. Requires-only rewires therefore retain matching A/M fingerprints when their bound wording/context fields are unchanged, while semantic-kind fingerprints change. Removal of old parent rows is a scope change even when their A/M hashes still match. Never use blanket `--write-fingerprints` as a review substitute.

## c15, c52 and memory266

The supplied plan has exactly one affected active origin card, `physics_q4_c15`, in `de_gymnasium_physics_structure_q4` (16 primary Q4 cards; retain the other 15 unchanged).

The required trace for the planned outcome is:

```text
physics_q4_c15 kept/true
  originGoalIds = [c52d55c3-b687-586c-b0f9-8ffcd1069424]
    current M goal: memory_required/true
      memoryGoalIds = [266b6cf8-d49d-5197-862c-9998fcf179a5]
      deckIds = [de_gymnasium_physics_structure_q4]
```

The plan assigns the other six children `no_memory_needed`; each still needs an individual current justification. Change c15's goal tag to c52 as well as its ledger origin and corrected cosmological-redshift back text. Update both existing DE deck files; no English deck creation follows from this plan.

Card hashing uses normalized `{ruleVersion,deckId,cardId,front,back,category,tags}`; normalize front/back/category/tags before stable serialization, trim cardId, preserve tag order and filter blank tags. `originGoalIds` itself is not in the card hash, but the changed origin tag and changed back are.

Read-only computation reproduced all six current A/M hashes for the old three goals and c15's current hash:
`sha256:e25092bc0d25bdfcfa6f4f870d4d770b8b71e683c3052e3b19ba4273c15713c1`.

For **exactly** `memoryPlan.cardUpdate.after` in the supplied authoring plan, the computed card hash is:
`sha256:1849b8ce751bde511fab0afe3f89d74d3b2fb83308f939b88fe885cfed7fd713`.
This is a planned-byte test vector, not permission to reuse it after further wording changes.

Memory266 stays `semanticKind:"memory"`; replace only the planned old solar-parent prerequisite with c52, preserving its other prerequisites and deck binding. Rehash its final raw semantic source. It is excluded from ordinary A/M scopes and must not gain an ordinary A/M goal record. Verify c52 and its referenced memory goal are visible together in every configured M visibility scope (currently HE GK and HE LK); direct card tracing alone is insufficient for CQR-302.

## Read-only checks

Executed against the pre-split snapshot with Node 20.20.2:

```text
A: exit 0; content leaves 465; current atomic 465; missing/stale/obsolete 0.
M: exit 0; ordinary leaves 465; no-memory 336; memory-required 129;
   memory goals 5/5 traced; primary cards 148/148 kept;
   goal/card missing/stale/obsolete 0; visibility scopes 2;
   memory-required goals without visible memory node 0.
```

These are baseline checks, NOT post-implementation passes. Pure 7-new/3-leaf-to-cluster scope delta is +4 ordinary leaves (465 to 469), conditional on no concurrent unrelated scope change. Run the two CLIs again on final authored bytes and inspect zero obsolete counts explicitly:

```sh
/home/enpasos/.nvm/versions/node/v20.20.2/bin/node app/node_modules/tsx/dist/cli.mjs app/scripts/semanticAtomicityReview.ts --config=curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.config.json --mode=check
/home/enpasos/.nvm/versions/node/v20.20.2/bin/node app/node_modules/tsx/dist/cli.mjs app/scripts/memoryCardReview.ts --config=curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.config.json --mode=check
```
