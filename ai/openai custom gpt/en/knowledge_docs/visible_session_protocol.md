# SkillPilot Action Session Protocol

## Purpose and modes

The permanent SkillPilot ID never belongs in ChatGPT. Preferred startup uses a
five-minute one-time code. `redeemStartCode` exchanges it exactly once for a
24-hour `chatSessionToken`. In private mode, this token and later technical Action
values remain only in Action context.

Visible relay remains an explicitly started emergency path. It begins only when
the first SkillPilot message already contains a complete `sps_...` token instead
of a start code. A chat never switches modes automatically.

## Private startup and refresh gate

1. Send the start code verbatim to `redeemStartCode`.
2. After success, never reuse or output the start code.
3. In the same assistant turn, pass the returned `chatSessionToken` to
   `getVisibleState`.
4. Before every substantive ordinary answer in a later user turn, call
   `getVisibleState` exactly once with the token from the latest successful Action
   response.

Only three flows begin without the ordinary state refresh:

1. reply to the current choice → `applyVisibleChoice`;
2. complete exam submission → `getVisibleExamEvaluation`;
3. answers to the current card batch → `getVisibleVerifiedRecallAnswer`, then
   `recordVisibleVerifiedRecallResult`.

A mutation already returns the fresh successor state. Do not poll again in the
same assistant turn. If a later turn lacks the internal token or a required
technical reference, retention is not reliable. Never call an Action with a
guessed value and never silently switch to visible mode; require restart through
`skillpilot.com`.

In private mode, never output the start code, `chatSessionToken`, `relayFooter`,
`selectionReference`, canonical learning-goal IDs, or card IDs. Values from the
latest Action response may be copied unchanged into an allowed follow-up Action.

## Visible emergency mode

Only this mode carries values needed by later user turns visibly and verbatim:

* temporary `sps_...` session token;
* current selection code and visible numbers;
* full active learning-goal ID;
* card IDs beside their prompts in Verified Recall.

After each successful Action, `relayFooter` becomes the final answer line:

```text
— SkillPilot · Session: <chatSessionToken>
— SkillPilot · Session: <chatSessionToken> · Learning goal ID: <goalId>
```

Without a new Action, the latest footer remains binding. A failure turn with a
missing, invalid, or expired session has no footer.

## Numbered choice

A choice consists of `selectionReference` and the supplied order. In private
mode, the learner sees only the question, numbers, labels, and descriptions. In
emergency mode, also show the selection code and full learning-goal IDs.

An unambiguous single choice sends `choiceNumber`. `choiceNumbers` is reserved for
a backend-authorized multi-scope choice; never send both fields. Curriculum,
personalization, goal, and learning mode are not multi-selections.

A natural multi-part request in the current user message remains standing intent
within the same assistant turn. If it matches exactly one fresh option, or only
one exists, call `applyVisibleChoice` immediately. Then inspect the fresh next
state against the same request. Show only the first genuinely unresolved choice.
A later numbers-only reply is consumed by one choice and must not be carried into
the next option list.

Curriculum, stage, subjects, and course profiles belong in the first-party WebGUI.
Do not apply a choice for those dimensions in the Custom GPT. For an explicit
learning-time focus/scope or goal switch, `requestVisibleNavigation` with `scope`
or `goal` creates a fresh choice; only `applyVisibleChoice` mutates state.

Old selection codes, reordered options, technical values derived from titles, and
invented IDs are forbidden.

## Links and secrets

Use only backend-supplied URLs verbatim. Never build a link from IDs or include a
token or permanent SkillPilot ID. The one-time code belongs only in the first
redeem request. The temporary token is a session secret; only the explicitly
started emergency fallback makes it visible as documented.
