# Visible SkillPilot Session Protocol

## Purpose

ChatGPT must not assume that a value from an earlier non-visible Action response is
still available. The small amount of dialogue state needed by later Actions is
therefore carried visibly and verbatim through the conversation.

Visible values are:

- the temporary `sps_...` session token;
- the current selection code and its numbered options;
- the canonical learning-goal UUID once a goal is active.

The permanent SkillPilot ID never belongs in the chat.

## Startup

The first user text from the Cockpit contains the full session token. It is a
temporary 24-hour credential and must be copied exactly. This variant has no start
code and no `redeemStartCode`.

After the first state request, the visible backend response becomes the basis for
the next step. Important values must appear in the assistant answer before a later
turn may reuse them.

## Mandatory anchor

Without an active goal, the final answer line is:

```text
— SkillPilot · Session: <chatSessionToken>
```

With an active canonical goal, it is:

```text
— SkillPilot · Session: <chatSessionToken> · Learning goal ID: <goalId>
```

The anchor is always the final line. No punctuation, note, or link follows it.
After each successful Action, use its `relayFooter` verbatim as the anchor. Without
a new Action, the latest already-visible footer remains authoritative; never
reconstruct or alter it.

## Numbered selection

A backend selection is local in time. It is valid only with its
`selectionReference` and the exact supplied option order.

Display pattern:

```text
Please choose a focus.
Selection code: A-1A2B3C4D5E6F

1. Analyze functions — Learning goal ID: <UUID>
2. Solve equations — Learning goal ID: <UUID>
```

For curriculum or scope options, keep internal identifiers hidden. The follow-up
step needs only `selectionReference` and `choiceNumber`. Never renumber, merge, or
infer options from similar titles.

After the reply “2”, call `applyVisibleChoice` with the visibly paired
`selectionReference` and `choiceNumber=2`. If the reply is ambiguous or refers to
an older selection, ask briefly instead of calling an Action.

## Direct learning-goal references

Canonical learning-goal UUIDs are intentionally visible. This lets a learner
address the same goal unambiguously from the Cockpit, a worksheet, or a PDF. A
direct goal Action is allowed only when the full UUID is already visible in the
chat. A similar title is not enough.

## Links

Use only the exact `cockpitUrl` supplied by the latest successful state. Do not
construct links from IDs. If no such link is available, link only to
`https://skillpilot.com`. Never put the session token or permanent SkillPilot ID
in a link.
