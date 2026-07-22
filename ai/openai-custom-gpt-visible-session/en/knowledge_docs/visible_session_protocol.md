# Visible SkillPilot Session Protocol

## Purpose

Values from an earlier non-visible Action response are not assumed to survive the
next user turn. Only values needed by later Actions are therefore carried visibly
and verbatim through the dialogue:

* temporary `sps_...` session token;
* current selection code and visible numbers;
* full globally unique SkillPilot learning-goal ID of the active goal;
* for Verified Recall, card IDs together with their prompts.

The permanent SkillPilot ID never belongs in the chat.

## Startup and refresh gate

The first user text from the Cockpit contains the complete 24-hour session token.
There is no start code or redemption. Call `getVisibleState` immediately.

Before every substantive response to a later ordinary user turn, load state again
with `getVisibleState`. This prevents active goal, title, description, resources,
progress, or choices from being reconstructed from memory after context compaction
or Cockpit use.

Only three flows begin without this state request:

1. reply to a currently visible choice → `applyVisibleChoice`;
2. complete exam submission → `getVisibleExamEvaluation`;
3. answers to visible cards → `getVisibleVerifiedRecallAnswer`, followed by
   `recordVisibleVerifiedRecallResult`.

Their parameters must already be visible in the chat.

## Mandatory anchor

Without or with an active goal, the final response line is:

```text
— SkillPilot · Session: <chatSessionToken>
— SkillPilot · Session: <chatSessionToken> · Learning goal ID: <goalId>
```

After each successful Action, use its `relayFooter` verbatim. Without a new Action,
the latest visible footer remains binding. The anchor is always the final line; no
punctuation or link follows. An error turn with a missing, invalid, or expired
session has no anchor.

## Numbered choice

A choice is valid only with its `selectionReference` and supplied option order:

```text
Please choose a focus.
Selection code: A-1A2B3C4D5E6F

1. Analyze functions — Learning goal ID: <full SkillPilot learning-goal ID>
2. Solve equations — Learning goal ID: <full SkillPilot learning-goal ID>
```

Curriculum, personalization, scope, and learning-mode choices expose no internal
identifiers. Learning-goal options show their full learning-goal ID.

After an unambiguous single choice, send `choiceNumber`. Use `choiceNumbers` only
for a multi-selection of learning scope explicitly allowed by the backend; it
contains unique visible numbers in the order selected by the learner. Curriculum,
personalization, goal, and learning mode are never multi-selections. Never send
`choiceNumber` and `choiceNumbers` together.

A natural multi-part request in the current user message remains the standing
intent during this assistant turn. If it semantically identifies exactly one
freshly returned option, or only one option exists, call `applyVisibleChoice`
immediately. Ordinary unambiguous synonyms and abbreviations may be matched. After
every successful choice, compare the fresh next state with the same request and
apply the next unambiguous single choice in this turn. Do not display the codes or
options of these intermediate steps.

Only when the current request does not identify one fresh option unambiguously,
display the current choice and code and wait for a user turn. A numbers-only reply
is consumed by that one choice and must not be carried into a new option list. A
multi-part request across setup dimensions is a sequence of single choices, not a
`choiceNumbers` selection. Reserve `choiceNumbers` for an explicitly requested
multi-selection within the same scope list.

Old selection codes, numbers without their paired code, reordered options, or
technical values inferred from titles are forbidden. If ambiguous, ask only for
the currently unresolved decision.

For a spontaneous explicit switch request, `requestVisibleNavigation(target)`
first creates only a choice: `curriculum` for curriculum, `personalization` for
profile, `scope` for learning scope, and `goal` for goal. Only the later
`applyVisibleChoice` mutates state.

## Direct learning-goal references

Canonical learning-goal IDs are intentionally visible and include stable
memorization-goal IDs. A direct goal, mastery, recall,
or exam Action is allowed only when the full ID is already in the chat. A similar
title is not enough.

## Links and secrets

Use only URLs supplied by the latest successful response, verbatim. Never build a
link from IDs and never put the session token or permanent SkillPilot ID in a link.
The visible token is a time-limited credential and is not repeated unnecessarily
outside the mandatory anchor.
