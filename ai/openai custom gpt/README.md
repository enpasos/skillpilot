# SkillPilot Custom GPT – clean DE/EN setup

This directory is the sole Builder source for creating two **new** SkillPilot
Custom GPTs from scratch:

- German: `SkillPilot GPT Coach (de)`
- English: `SkillPilot GPT Coach (en)`

There is no previous GPT to update, clone, or preserve. GPT IDs and share URLs do
not exist until the new private GPTs have been created and accepted in the
Builder. Do not copy an ID, URL, Instructions, Knowledge file, or Action from an
older GPT.

`action-regression/` is retained only as provider-regression test infrastructure.
None of its files is Builder source or Knowledge for either production GPT.

## Source layout

Each locale is a complete, independent Builder bundle:

- German Instructions: `de/system_instructions.md`
- German Knowledge: the seven files in `de/knowledge_docs/`
- German Action schema: `de/skillpilot-api-4ai.de.json`
- German creation checklist: `de/gpt_setup_guide.md`
- English Instructions: `en/system_instructions.md`
- English Knowledge: the seven files in `en/knowledge_docs/`
- English Action schema: `en/skillpilot-api-4ai.en.json`
- English creation checklist: `en/gpt_setup_guide.md`

Never mix locale files and never upload a `gpt-bundle.*.json` manifest as
Knowledge. The manifests are repository-only checks for a reproducible clean
creation.

## Startup modes

### Private default

The SkillPilot WebGUI creates a five-minute, single-use `SP-....-....` start code.
The GPT calls `redeemStartCode`, keeps the returned 24-hour `sps_...` token inside
Action context, and immediately calls `getVisibleState`. Later turns reuse the
token from the latest Action result. The user sees neither token, relay footer,
selection reference, nor canonical/card IDs.

This mode depends on the provider retaining the Action result across user turns.
That behavior must pass a real canary before each GPT is shared. It is treated as
an empirically tested runtime dependency, not an official OpenAI guarantee.

### Visible emergency fallback

A separately generated launch message may contain the temporary `sps_...` token
directly. Only then does the GPT use visible relay: values required on later turns
are carried in conversation text and each normal response ends with
`relayFooter`. A private chat never switches to this mode automatically.

The permanent SkillPilot ID never enters ChatGPT in either mode.

## Action surface

Each locale-fixed schema exposes exactly ten operations:

1. `redeemStartCode`
2. `getVisibleState`
3. `applyVisibleChoice`
4. `requestVisibleNavigation`
5. `setVisibleActiveGoal`
6. `setVisibleMastery`
7. `startVisibleVerifiedRecall`
8. `getVisibleVerifiedRecallAnswer`
9. `recordVisibleVerifiedRecallResult`
10. `getVisibleExamEvaluation`

`redeemStartCode` uses the deployed `/api/ai/{lang}/chat-start/redeem` route. The
other nine operations use
`/api/ai/{lang}/sessions/{chatSessionToken}/visible/...`. Both resolve the same
`ChatSessionService` token, so the Custom GPT requires no additional backend
route, JVM process, database, or production service.

The adapter provides backend-guided state, focus and goal selection,
orientation, coaching, mastery, progress, Cockpit resources, Verified Recall,
and protected exam evaluation. Level-2 Personal Curriculum configuration remains
a first-party WebGUI responsibility. This interim channel does not change or
replace the submitted OpenAI app contract.

## OpenAI app review freeze

The submitted OpenAI app's first-party launch flow remains frozen during review.
This package is independent Builder material and changes no app/plugin bytes,
backend route, launch selector, or production WebGUI. The access proposal is in
`docs/deploy/openai-custom-gpt-interim.md`; implementing it during review needs an
explicit, narrow freeze exception.

No environment variable is required for package validation. Do not switch the
production coach variant with `VITE_SKILLPILOT_COACH_VARIANT` to expose these new
GPTs.

## Validation and rollout gate

```bash
npm test --prefix "ai/openai custom gpt"
```

The validator checks clean creation metadata, instruction limits, exactly ten
operations, locale isolation, start-code and token schemas, private/visible mode
rules, current orientation and Level-2 boundaries, exam/Recall privacy, and DE/EN
structural parity. It also rejects inherited GPT IDs, share URLs, and update-in-
place instructions.

Rollout order after approval:

1. Validate this package locally.
2. Create the German GPT as a new private GPT and run its cross-turn canary plus
   complete acceptance.
3. Create the English GPT independently as a new private GPT and run the same
   tests.
4. Record each newly assigned share URL only in the approved deployment
   configuration after that locale passes.
5. Enable a separate WebGUI entry only after the required review-freeze decision.

If a private canary fails, do not claim that locale is operational. Keep the
OpenAI app unchanged and either use an explicitly approved visible fallback or
leave the interim entry disabled.

Official Actions setup reference:
https://developers.openai.com/api/docs/actions/getting-started#step-3-create-the-gpt-action-and-test
