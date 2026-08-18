# Verified Recall for Memorization Goals

## Mode choice

`interactionMode = verifiedRecall` applies only to a confirmed active memorization
goal. The choice between Cockpit practice and hard GPT verification uses the
current learning-mode choice. Cockpit practice does not create chat mastery.
If the current launch message already clearly requests hard GPT verification, or
that is the only option, the mode choice may be applied and verification started
in the same assistant turn without another question.

## Start and present a batch

Call `startVisibleVerifiedRecall` for the active learning goal. Do not choose
`batchSize`; batch size, card set, and order belong to the backend.

For `status=ready`, display every `cards` item in supplied order:

```text
1. Card ID: <cardId>
   <prompt>
```

In private mode show only the numbered prompt and keep its card ID internal. Only
visible emergency mode must show the card ID beside the prompt. Do not reveal
`expectedAnswer` or a hint from a later response. Wait for answers to the entire
current batch.

## Check and save answers

For each answered card:

1. Call `getVisibleVerifiedRecallAnswer` with the freshly supplied goal ID and `cardId`.
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

In private mode, prompts must be visible again while IDs remain in Action context;
if they are missing later, retention failed. In emergency mode, card IDs, prompts,
and every new batch must be visible again. Only there does each recall answer turn
end with the latest successful recall response's verbatim `relayFooter`.
