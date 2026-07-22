# SkillPilot Custom GPT – Visible Session

This directory is the complete source package for the temporary **Visible Session**
configuration of the two existing SkillPilot Custom GPTs. It is intentionally
separate from the complete legacy package in `ai/openai custom gpt/`. No new GPT is created for this configuration.

The package contains two independently configured language variants. Each one has
its own instructions, Knowledge files, and self-contained, locale-fixed
SkillPilot Action API:

- `de/`: existing German GPT and its package-local `skillpilot-api-4ai.de.json`
- `en/`: existing English GPT and its package-local `skillpilot-api-4ai.en.json`

`de/gpt-bundle.de.json` and `en/gpt-bundle.en.json` are machine-checked manifests
that bind each existing GPT ID and URL to exactly its own Instructions, Knowledge,
API file, path prefix, and operation IDs. They are repository metadata and are not
uploaded to GPT Knowledge.

Never import the API from the other locale and never substitute a shared generic
schema. The German API contains only `/api/ai/de/...` paths and German Action
metadata; the English API contains only `/api/ai/en/...` paths and English Action
metadata.

There is deliberately no `skillpilot-api-4ai.*` directly below `ai/`. Each coach
package owns its API definitions; no root-level file acts as a shared fallback.

Do not merge files from this directory into the legacy directory. The existing
GPT IDs and URLs remain unchanged. A future rollback is performed by reapplying
the retained legacy instructions, Knowledge files, and locale-specific legacy API
to those same GPTs, without reconstructing anything from Git history.

The corresponding implementation is separated in the same way:

- backend Action adapter: `backend/.../ai/visiblesession/`
- web selector and launch client: `app/src/coachVariants/visibleSession/`
- retained rollback sources: `ai/openai custom gpt/`, including its package-local
  `skillpilot-api-4ai.*.json`, and the legacy web utilities

## Why this variant exists

The variant does not rely on a hidden Action response surviving a later user turn.
The SkillPilot Cockpit creates a 24-hour `sps_...` chat-session token and places it
in the first visible user message. The coach repeats that exact token in a compact
footer on every normal answer. Canonical active-goal IDs and all values needed
by a later Action are also carried in visible conversation text.

The permanent SkillPilot ID never enters ChatGPT. It stays in the Cockpit and the
SkillPilot backend.

## Complete runtime contract

Each locale-fixed GPT Action schema exposes exactly nine operations:

1. `getVisibleState` — refresh state before every substantive ordinary user turn;
2. `applyVisibleChoice` — apply one numbered choice or an explicit multi-scope choice;
3. `requestVisibleNavigation` — request a non-mutating choice for a curriculum,
   personalization, scope, or goal switch;
4. `setVisibleActiveGoal` — activate a visibly present full learning-goal ID;
5. `setVisibleMastery` — save backend-fixed Mastery 1.0 after evidence;
6. `startVisibleVerifiedRecall` — obtain a visible card batch;
7. `getVisibleVerifiedRecallAnswer` — reveal an expected answer only after the
   learner answered that visible card;
8. `recordVisibleVerifiedRecallResult` — save the graded card result;
9. `getVisibleExamEvaluation` — obtain protected solution and scoring only after a
   complete visible exam submission.

All nine operations in both locale schemas declare
`x-openai-isConsequential: false`. The package validator checks that declaration
operation by operation in addition to the schema paths and parameters.

There is deliberately no start-code redemption Action. Curriculum,
personalization, scope, learning mode, and normal goal selection are resolved by
relay-safe numbered choices. A spontaneous switch first requests a choice and
mutates state only after the learner's selection. Exam solutions are absent from
ordinary state, and Recall card IDs travel visibly with their prompts.

German final footer:

```text
— SkillPilot · Sitzung: sps_...
— SkillPilot · Sitzung: sps_... · Lernziel-ID: <vollständige SkillPilot-Lernziel-ID>
```

English final footer:

```text
— SkillPilot · Session: sps_...
— SkillPilot · Session: sps_... · Learning goal ID: <full SkillPilot learning-goal ID>
```

The second form is used only while the latest successful backend state has an
active canonical goal.

## Builder bundles

For the existing German GPT
(`https://chatgpt.com/g/g-693ebdcb2fac8191b3a765ce7f451fb2-skillpilot-gpt-deutsch`):

- paste `de/system_instructions.md` into Instructions;
- upload all files in `de/knowledge_docs/` as Knowledge;
- paste `de/skillpilot-api-4ai.de.json` into its existing Action;
- follow `de/gpt_setup_guide.md`.

For the existing English GPT
(`https://chatgpt.com/g/g-69a565a532008191a3b994e83d20241c-skillpilot-gpt-english`),
use only the corresponding files below `en/`, including
`en/skillpilot-api-4ai.en.json`.

OpenAI's GPT Actions guide recommends that Action names and JSON parameters in the
instructions match the imported OpenAPI schema. The package therefore validates
those names locally. Reference:
https://developers.openai.com/api/docs/actions/getting-started#step-3-create-the-gpt-action-and-test

## Local validation

No dependencies are required:

```bash
npm test --prefix ai/openai-custom-gpt-visible-session
```

The validator checks the GPT Builder instruction limit, turn-refresh and visible-
relay rules, exact locale-specific API filenames and all nine paths, Action
metadata, typed exam/Recall privacy boundaries, single and multi-scope choices,
Knowledge coverage, full DE/EN structural parity, and absence of a start-code
redemption Action or permanent SkillPilot ID. It also protects the retained legacy
sources with recorded hashes.

For GPT Builder compatibility, every operation defines `chatSessionToken` inline
with a literal string `name`; the schema deliberately does not use a reusable
`components.parameters` `$ref`. The Builder currently skips an Action when that
parameter reference is not dereferenced before its function parser validates the
entry.

## Runtime default, rollout, and rollback

The web application uses Visible Session by default and points to the stable URLs
of the two existing GPTs. **No environment variable is required for normal operation.**

Roll out in this order:

1. Deploy the backend containing the `/visible/...` Action routes.
2. Build and deploy the updated web application normally, without coach URL or
   coach-variant variables.
3. Update the existing German GPT in place with only the German bundle.
4. Update the existing English GPT in place with only the English bundle.
5. Run a fresh end-to-end acceptance test for each language.

A rollback must be coordinated because both software variants use the same stable
GPT URLs: first restore each existing GPT from the matching legacy source bundle,
then build the web application with the optional
`VITE_SKILLPILOT_COACH_VARIANT=legacy` rollback selector. Never switch only one
side; that would send a Visible Session token to a legacy Action schema or a start
code to a Visible Session schema.
