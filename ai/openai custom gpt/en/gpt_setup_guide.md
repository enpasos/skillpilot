# Builder setup: create a new SkillPilot GPT Coach (en)

This guide creates a **new English Custom GPT from scratch**. There is no GPT to
update or clone. Start with an empty Builder configuration and keep it private
until all acceptance gates pass.

## 1. New GPT configuration

Recommended metadata:

- Name: `SkillPilot GPT Coach (en)`
- Description: `A personal English-language learning coach for the curriculum configured in SkillPilot.`
- Language of metadata, starters, and answers: English
- Initial visibility: private

Possible conversation starters without technical values:

- `I want to learn with SkillPilot.`
- `How do I start my SkillPilot learning session?`

Do not duplicate an earlier GPT and do not inherit an old GPT ID, share URL,
Action, Instructions, or Knowledge file. Capture the new URL only after private
acceptance succeeds.

## 2. Runtime assumption

Private default startup assumes that ChatGPT can reuse the secret token from the
`redeemStartCode` result in later Action calls. Test this with the real cross-turn
canary below before each release. OpenAI's Action documentation describes Actions
and authentication but does not guarantee this retention as a stable product
contract.

Visible `sps_...` relay is a deliberately started emergency mode. It is not an
automatic fallback and not the normal WebGUI start.

## 3. Instructions and Knowledge

Paste the complete contents of `system_instructions.md` into the Instructions
field without modification.

Upload only these seven English Knowledge files:

1. `knowledge_docs/visible_session_protocol.md`
2. `knowledge_docs/state_personalization_and_progress.md`
3. `knowledge_docs/coaching_and_mastery.md`
4. `knowledge_docs/deep_linking_and_resources.md`
5. `knowledge_docs/verified_recall.md`
6. `knowledge_docs/exam_proctor.md`
7. `knowledge_docs/errors_and_restart.md`

Do not upload any file from `de/` or `action-regression/`. The manifest, setup
guide, and OpenAPI file are not Knowledge files either.

## 4. Create the new Action

1. Add one new Action to this GPT.
2. Paste the complete contents of
   `ai/openai custom gpt/en/skillpilot-api-4ai.en.json` as its schema.
3. Configure authentication as **API Key / Bearer**. Enter the production key
   only from deployment configuration in the Builder, never in the repository,
   Instructions, or Knowledge.
4. Set `https://skillpilot.com/privacy` as privacy-policy URL.

The schema must expose exactly ten operations:

- `redeemStartCode`
- `getVisibleState`
- `applyVisibleChoice`
- `requestVisibleNavigation`
- `setVisibleActiveGoal`
- `setVisibleMastery`
- `startVisibleVerifiedRecall`
- `getVisibleVerifiedRecallAnswer`
- `recordVisibleVerifiedRecallResult`
- `getVisibleExamEvaluation`

All ten operations contain `"x-openai-isConsequential": false`. Each of the nine
session operations must define `"name": "chatSessionToken"` inline, without a
reusable parameter `$ref`. Builder must show no schema error and no skipped
function.

Do not enable optional capabilities such as Web search or Code Interpreter when
they are not needed. If the current Builder permits learner image input, verify
subject feedback for an uploaded image during private acceptance.

Save the new GPT privately now. Do not configure a WebGUI URL or grant link-based
access yet.

## 5. Mandatory private-retention canary

Always use a new chat, a fresh five-minute start code, and the real new Builder
configuration. Never publish live test values in screenshots or tickets.

1. Send the prepared message `Start SkillPilot with start code: SP-....-....`.
   `redeemStartCode` must run exactly once, followed by `getVisibleState` in the
   same turn.
2. Inspect the visible answer: it must contain no start code, `sps_...`,
   `relayFooter`, selection code, or learning-goal ID.
3. In a **new user turn**, ask an ordinary subject question. Before answering,
   `getVisibleState` must succeed with the internally reused token. This is the
   decisive retention canary.
4. In another turn, send only a number from the displayed choice.
   `applyVisibleChoice` must use the internally retained `selectionReference` and
   number while technical values remain hidden.
5. Refresh state again after several ordinary turns. If ChatGPT asks for,
   invents, or cannot reuse a token or reference, the canary failed and the GPT
   must not be shared.

## 6. Functional acceptance

**Natural UX:** `I want to learn maths at upper-secondary level in Hesse.` Apply
fresh uniquely matching options in the same assistant turn and show only the
first open decision. If an option is absent, claim no completion. A numbers-only
reply is consumed by exactly one choice.

Also verify:

1. Curriculum, stage, subjects, and course profile are not changed in chat;
   missing Level-2 configuration returns to the WebGUI.
2. Focus/scope and goal switches use `requestVisibleNavigation`,
   `applyVisibleChoice`, and the fresh successor state. An explicitly allowed
   multi-scope choice uses only `choiceNumbers`, never together with
   `choiceNumber`.
3. Orientation contains no knowledge test; a bare interest selection does not
   save mastery.
4. Ordinary mastery requires two independent checks or genuine transfer and a
   successful `setVisibleMastery` response.
5. Verified Recall uses no model-chosen `batchSize`, reveals no `expectedAnswer`
   before the learner response, saves every result, and calls no extra mastery
   after `masterySaved=true`.
6. Exam solution is absent from state; evaluation follows only complete
   submission, equivalent routes are treated fairly, there is no follow-up
   question, and mastery requires `passingPoints`.
7. Cockpit/image link, progress, and `409`, `401`, and `410` behavior.

## 7. Visible emergency mode and negative tests

Test with a launch message generated specifically for visible fallback: the full
`sps_...` token is in the first user text and `redeemStartCode` does not run.
Selection code, required IDs, and card IDs remain visible; every ordinary answer
ends with the English `relayFooter`.

Negative tests:

- Chat without a start code or visible emergency token: no Action and no request
  for SkillPilot ID or token.
- Missing private token in a later turn: no mode switch; controlled restart via
  `skillpilot.com`.
- Expired token (`410`): no further Action and no stale footer.

## 8. Sharing and the new URL

Only after the canary and full acceptance pass:

1. capture the new GPT URL assigned by the Builder;
2. choose the intended sharing level under the then-current OpenAI policy;
3. place the URL only in the explicitly approved locale-specific deployment
   configuration;
4. repeat the complete start flow from the later WebGUI route.

The URL does not belong in Instructions, Knowledge, schema, or manifest. Never
reuse the English GPT URL as the German configuration.

## 9. Local contract validation

Run from the repository root before creating the GPT in Builder:

```bash
npm test --prefix "ai/openai custom gpt"
```

Official reference:
https://developers.openai.com/api/docs/actions/getting-started#step-3-create-the-gpt-action-and-test
