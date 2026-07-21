# Verified Recall for Memorization Goals

## Mode choice

`interactionMode = verifiedRecall` applies only to a confirmed active memorization
goal. The choice between Cockpit practice and hard GPT verification uses the
visible learning-mode choice. Cockpit practice does not create chat mastery.
If the current launch message already clearly requests hard GPT verification, or
that is the only option, the mode choice may be applied and verification started
in the same assistant turn without another question.

## Start and visibly carry a batch

Call `startVisibleVerifiedRecall` with the visible active learning-goal ID and the
backend/Cockpit `batchSize`, otherwise 10.

For `status=ready`, display every `cards` item in supplied order:

```text
1. Card ID: <cardId>
   <prompt>
```

The card ID must be visible beside its prompt. Do not reveal `expectedAnswer` or a
hint from a later response. Wait for answers to the entire current batch.

## Check and save answers

For each visibly answered card:

1. Call `getVisibleVerifiedRecallAnswer` with the visible goal ID and `cardId`.
2. Compare the learner answer with the now-returned `expectedAnswer`.
3. In the same turn call `recordVisibleVerifiedRecallResult` with `passed` and a
   short reason.

Set `passed=true` only for a sufficiently correct answer without card help. After a
failure, explain the correct answer if useful. Save every card in the batch before
starting another batch or using a `next` prompt.

## Daily lock and completion

Test each card at most once per calendar day. After `passed=false`, do not ask it
again today. `status=waiting` ends verification until `nextEligibleAt`; do not
improvise. `status=complete` or `masterySaved=true` means the backend saved
completion. Never call `setVisibleMastery` afterwards.

Card IDs, prompts, and every new batch must be visible before a later user turn may
address them. Each recall answer turn ends with the verbatim `relayFooter` from the
latest successful recall response.
