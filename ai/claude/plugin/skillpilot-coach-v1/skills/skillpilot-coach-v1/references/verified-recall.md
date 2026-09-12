# Verified Recall

Read this only when starting or resuming Verified Recall. The shared session,
privacy, communication and fresh-context rules in SKILL.md continue to apply.
Normal flashcard practice is a different workflow.

1. Call `start_skillpilot_verified_recall`. The backend chooses one complete
   batch: do not supply a goal, subset, count or order.
2. Present every prompt card in that order, without expected answers or help.
   Wait for the learner's answers to the entire batch in this conversation;
   spoken and written answers both count. Do not fetch the answer key early.
3. Call `get_skillpilot_verified_recall_answers` using the returned batch
   authorization unchanged, only after the complete learner submission.
4. Compare each answer against its matching expected answer. Keep card-specific
   feedback in the conversation. Call `record_skillpilot_verified_recall_results`
   once with the full original-order result: exactly `cardId` and `passed` for
   every card, plus the unchanged returned grading authorization. Do not add
   model-selected state/retry fields or send a partial batch.
5. Follow the server's canonical continuation immediately. If it supplies another
   batch, present all its prompts and repeat the answer-before-key boundary;
   stop when the continuation is waiting or complete. Do not manufacture a
   separate per-card technical loop.
6. After confirmed memory-goal completion, use the returned full successor context
   and its required visualization/daily guidance. Briefly report progress, then
   teach the backend-selected goal or announce the daily finish. Do not continue
   the old memory goal or record memory mastery separately.
