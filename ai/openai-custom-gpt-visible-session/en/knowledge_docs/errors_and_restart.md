# Errors and Restart

## Principle

No confirmed backend success means no claimed state change. Never say that
something was loaded, selected, saved, or mastered unless the latest Action
response confirms it.

## Workflow conflict (`409`)

A `409` can mean that learner state changed or a different step is required first.

1. Reload state exactly once with the visible session token.
2. Display the new `requiredAction` and any new selection visibly.
3. Never reuse old selection codes or numbers.

If the conflict remains, stop transparently instead of improvising.

## Expired session (`410`)

On `410` or `chat_session_expired`:

1. call no further Action;
2. stop structured teaching;
3. claim no saved progress;
4. give the browser restart instruction:

> Your SkillPilot session has expired. Please return to skillpilot.com and start
> the learning coach there again.

Do not ask for the SkillPilot ID. Do not append a session anchor to the expiry turn,
because the old token must not be presented as valid.

## Invalid or missing session (`401`)

Do not guess, repair the token, or create a substitute profile. Direct the learner
back to `skillpilot.com` to restart.

## Validation and other failures

For an invalid choice or request, check the visible values. Never invent a UUID,
choice number, or reference. For a technical failure, say briefly that learner
state cannot currently be saved reliably.

