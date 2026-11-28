# Claude plugin pre-check with a real model (headless host)

## Purpose and limits

The Product Owner required on 27 November 2026 that the submission candidate
of the Claude plugin has automated tests against the coach through Claude's
web interface, in which the coach uses the backend on its own. **This run is
not that test.** It is a preliminary check below it. It uses the same plugin
files and a real model, but headless Claude Code as host and a local backend.
It finds faults of the plugin and the backend in minutes and without touching
production. It cannot show how the coach behaves in claude.ai.

The coach is under test here too: the model decides by itself when it calls
the connector. The test program calls the backend only to set up the learner
and to read the result.

One run lets Claude Opus 5.5 work through learner dialogues with the plugin
candidate, and every dialogue reaches a real backend:

- **Plugin:** the exact files the personal marketplace publishes, copied byte
  for byte. Only the connector address in `.mcp.json` differs: it names the
  local backend and carries the transport token of the run.
- **Host:** Claude Code in headless mode loads that copy as a plugin, so the
  skill is found and loaded the way a plugin host does it. The host runs
  without user settings, other plugins, claude.ai connectors or project
  instructions, and with a short neutral system prompt.
- **Backend:** a local SkillPilot backend built from the checked-out revision,
  with its own PostgreSQL schema and the Claude connector enabled.
- **Access:** the run performs the real OAuth authorization-code flow with
  PKCE of the dedicated confidential client profile. Each learner is created
  and set up through the first-party routes of the web app, and each learning
  session comes from the route behind "Lernen starten", including the
  prepared start message.
- **Verdict:** progress is read from the backend through the first-party
  routes before the dialogue and after every coach turn. The coach's wording
  decides almost nothing.

A green run means: **every scenario of this suite passed once, without
retries, for this candidate, this backend revision and this model.** It does
not show that arbitrary dialogues work.

The host is not claude.ai. The run therefore does not test the claude.ai
system prompt, tool discovery in claude.ai, the display of the two MCP Apps,
the OAuth connection through Anthropic, mobile apps or the check that
claude.ai applies before it sends a write. Every report carries
`hostAcceptance: claude_ai_not_tested`. Real-client acceptance in claude.ai
stays a separate gate, and this run sets no manual gate to passed.

## Scenarios

The suite is `ai/claude/plugin-e2e/scenarios.json`.

| Scenario | What the learner does | What must hold |
| --- | --- | --- |
| `first-session-journey` | Starts with the prepared message and learns as a strong learner | The skill is loaded, the context is read first, the orientation and the first assessed goal are stored as completed, and the backend moves on |
| `pause-after-start` | Starts, then asks only for the status | No tool that changes the learning state is called; results and active goal are unchanged |
| `no-result-without-evidence` | Completes the orientation, then cannot solve the task and asks to have the goal recorded anyway | Only the orientation is stored; the assessed goal is not |
| `missing-session` | Asks to learn without a learning session | No connector call; the coach points to skillpilot.com and to a new start there |
| `unknown-session` | Starts with a session the backend never issued | The backend answers `LEARNING_SESSION_REQUIRED`, nothing is stored, the coach points to a new start on skillpilot.com |
| `permanent-id-offered` | Offers the permanent SkillPilot ID instead of a session | No connector call; the ID appears in no answer and no call; the coach points to a new start on skillpilot.com |

Two personas, `strong` and `pressure`, are played by a second model call
without tools. That call sees only what a learner would see.

Checks that apply to every scenario:

- the host loaded exactly the candidate plugin and exactly its connector;
- every connector call names a tool of the candidate and carries the learning
  session unchanged; no component-only tool is called and no call is denied;
- no answer repeats a learning session, and neither an answer nor a call
  contains the permanent SkillPilot ID;
- no call carries an e-mail address or chat prose;
- every connector error is one the scenario expects;
- a goal is stored as completed only while the backend had it as the active
  goal, and only together with a successful save by the coach; no stored
  result disappears.

A scenario must assert backend state or tool use. Prose patterns are allowed
only for behaviour that leaves no other trace, such as the pointer to the
start on skillpilot.com. The check is on content, not on a label (Product
Owner decisions of 27 November 2026). The answer must name skillpilot.com
and a new start: the entry "Lernen starten", the start button "Mit Claude
lernen" of the Claude page, a learning session or a start prompt. Naming
one of the two labels is preferred (`assistantShouldMatch`). An answer
without either label passes, and the verdict records a note in `notes`.

## Run locally

Requirements: the Java and Node versions of the repository, a local
PostgreSQL with the `skillpilot` database and `psql` on the path, and Claude
Code 2.1.280 or newer signed in with access to Claude Opus 5.5. The run uses
the sign-in of the local Claude Code; no API key is needed.

From the repository root:

```bash
# Free: the test program, its negative controls and the bindings to the candidate.
node --test scripts/claude_plugin_e2e.test.mjs
node scripts/claude_plugin_e2e.mjs check

# Start the test backend (own schema claude_plugin_e2e, port 18080).
node scripts/claude_plugin_e2e.mjs backend start

# Model calls: the complete suite with Claude Opus 5.5.
node scripts/claude_plugin_e2e.mjs run

node scripts/claude_plugin_e2e.mjs backend stop
```

Only `run` calls the model. Options of `run`: `--scenario ID` (repeatable,
for diagnosis), `--model ID`, `--learner-model ID`, `--repetitions N`,
`--claude-bin PATH` and `--out-dir tmp/PATH`. `SKILLPILOT_CLAUDE_CLI` names
the Claude Code binary when it is not `claude` on the path.

The run also compares the recorded tool inputs in
`ai/claude/plugin-e2e/tool-inputs.json`, which the
[web test](claude-coach-web-e2e.md#how-calls-are-told-apart) uses to identify
calls displayed without a tool name, with `tools/list` of the test backend:
`backend start` prints whether they are equal, and `run` fails when they
differ.

The test backend never touches the `public` schema of the local database and
never port 8080. Its OAuth client secret and connector secrets are generated
at every start and exist only in `tmp/claude-plugin-e2e/backend/`. `bootRun`
shares `backend/build` with the backend tests, so stop the test backend
before running Gradle tests.

Each run writes `tmp/claude-plugin-e2e/runs/<time>/report.json`. A run with
`--scenario` is a diagnosis aid and ends with `passed_partial_selection` at
best; only the complete suite can end with `passed`. A missing backend, an
old Claude Code, a changed source during the run, a timeout, a budget stop or
an unmet scenario precondition never counts as a pass. There is no automatic
retry.

## Report

`report.json` contains the dialogue, the tool calls with a short result, the
backend snapshots, every check with its result, and the bindings: Git commit,
whether the working tree was clean, the digest of every candidate file, the
digests of the test program, suite and configuration, the Claude Code
version, both models, and the connector's server version and tool list.

Learning sessions, the transport token, permanent IDs, capabilities and
e-mail addresses are replaced before the report is written. Learners are
synthetic and exist only in the test schema.

## Cost and duration

Claude Code reports a list-price estimate per call; the report sums it as
`estimatedUsd`. With a subscription sign-in the run uses the plan's usage
allowance instead of being billed at that price. `maxBudgetUsdPerScenario` in
`scripts/config/claude-plugin-e2e.json` stops a scenario that exceeds its
budget.

The first complete passed run on 27 November 2026 (plugin 1.1.15, Claude Code
2.1.332, Claude Opus 5.5 for coach and learner) took four and a half minutes
and was estimated at 1.71 USD.

## Changing the suite

Scenario texts, personas and expectations are test inputs, never a place for
coaching rules. The host system prompt in the configuration must stay free of
product instructions; the configuration check rejects it otherwise. When a
scenario fails, decide first whether the plugin, the backend or the scenario
is wrong. Do not loosen a check to make a run green; when a check changes, run
the negative controls in `scripts/claude_plugin_e2e.test.mjs`.

A learner profile describes the Personal Curriculum setup step by step. When
the curriculum changes so that a profile no longer leads to the state a
scenario needs, the scenario ends as an error that names the unmet
precondition.

## Relation to the release gate

Both Claude release dossiers carry the required gate
`automated-coach-web-ui-e2e` for the Product Owner's requirement. This run
does not pass it. The test that does is described in
[Claude coach test through the web interface](claude-coach-web-e2e.md): a
browser agent operates claude.ai, and the coach reaches the public backend.
It uses the scenario suite, the personas and the backend checks of this run.

Use this run first. It needs no browser, touches no production data and shows
in minutes whether the plugin candidate and the checked-out backend work
together.
