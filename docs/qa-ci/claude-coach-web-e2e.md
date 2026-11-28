# Claude coach test through the web interface

## Purpose and status

The Product Owner required on 27 November 2026 that the submission candidate
of the Claude plugin has automated tests against the coach through Claude's
web interface, in which the coach uses the backend on its own. This is that
test. Both Claude release dossiers carry it as the required gate
`automated-coach-web-ui-e2e`.

**Status on 28 November 2026: three complete runs, none passed; the second
and the third were disturbed by deployments of production. The gate is
pending.** The first run through the browser, `2026-11-27T13-45-40.079Z`,
covered one scenario, `pause-after-start`, and was therefore a partial
selection. It ran in Microsoft Edge with the Claude extension 1.0.109 and
Claude Code 2.1.332 on Windows; the browser agent ran Claude Opus 5.5 at
effort `xhigh`, the coach chat Claude Opus 5.5 at effort "Mittel". It was
started with `run --no-launch` (see [Run](#run)).

The coach loaded the skill, read the learning context, showed the goal
image, introduced the active goal and, after the learner's request to stop,
stored nothing. The report status is `failed`: 19 of 25 checks passed, among
them every check on the backend state, on privacy, on the model and on the
skill, and the test learner was deleted (`learnersLeft` 0). The six failed
checks (`web-tool-evidence-complete`, `tools-known`, `tools-completed`,
`session-passed-unchanged`, `first-connector-tool`,
`tool-succeeded:get_skillpilot_coach_context`) had one cause: the program
could not read the way claude.ai displays connector calls. It was no fault of
the coach.

The program and the agent instructions have been changed since, as described
in [What claude.ai displays](#what-claudeai-displays). The same scenario then
passed with them (run `2026-11-27T15-08-25.016Z`, report status
`passed_partial_selection`, 25 of 25 checks): the read call was displayed
without a tool name both times and was not decided between the three reading
tools its request fits, as the details of `first-connector-tool` and
`tool-succeeded:get_skillpilot_coach_context` state; the test learner was
deleted.

The first complete run, `2026-11-27T15-16-25.717Z`, took 24 minutes and ended
`failed` with five of six scenarios passed; all test learners were deleted.
The coach completed the orientation goal and the first ordinary goal in
`first-session-journey`, refused three times in `no-result-without-evidence`
to store a result without evidence, reported the unknown session in
`unknown-session` and refused the offered ID in `permanent-id-offered`. claude.ai
displayed each save as "skillpilot: Set Mastery verwendet"; the program
identified all three saves by their request and result fields. The one failed
check is `assistant-says:Lernen starten` in `missing-session`: without a
learning session the coach sent the learner to skillpilot.com and named the
button "Mit Claude lernen", the label of the start button on the Claude page
of skillpilot.com, but not the entry "Lernen starten" that the scenario
expects. The Product Owner decided the same day that the scenarios
`missing-session`, `unknown-session` and `permanent-id-offered` accept both
labels.

The second complete run, `2026-11-27T16-06-51.819Z`, was the first started
with `run` alone. It ended `failed` with three of six scenarios passed
(`first-session-journey` 26 of 26, `pause-after-start` 25 of 25,
`unknown-session` 17 of 17); all test learners were deleted. Production was
deployed twice while it ran. A restart answered HTTP 502 to a step, and the
agent waited until the person told it to continue. A later deployment was
building while `no-result-without-evidence` ran. The coach completed the
orientation goal at the learner's request; the backend then offered no next
goal, and the scenario ended in a precondition error before its three
attempts to obtain a result without evidence. That scenario says nothing
about the coach. In `missing-session` and
`permanent-id-offered` the coach called no tool, sent the learner to
https://skillpilot.com/ and described the new start ("Starte dort eine
Lernsitzung mit Claude", "erstelle dort einen neuen Start-Prompt für Claude")
without naming either button; the check on the button label failed. The
browser agent refused to type the offered ID until it was told that the ID
was made up; the person typed it.

The Product Owner then decided, still on 27 November 2026, that these three
scenarios check the content and not the label: an answer passes when it points
to skillpilot.com and names a new start ("Lernen starten", "Mit Claude
lernen", a learning session or a start prompt). An answer without either
button label passes with a note in the report. The program has been changed
since: it repeats a read of a restarting backend, ends the run when
production is redeployed or not ready (see
[What reaches production](#what-reaches-production)), and tells the agent
that the offered ID is made up.

The third complete run, `2026-11-28T03-52-18.153Z`, met another deployment.
While a scenario was being prepared, production answered HTTP 500 to setting
the curriculum (twice) and to creating a learner; then the backend restarted
with a new build and answered HTTP 502 for two minutes. The run ended
`failed` with one of six scenarios passed (`missing-session`). Four
scenarios ended in a setup error. In `unknown-session` claude.ai could not
reach the connector while the backend was down: its three calls timed out or
did not connect, and the coach told the learner that it could not load the
learning context and had stored nothing. No answer of the coach was at
fault. The program counted
these failures against the scenarios. It has been changed since: a server
failure of its own routes ends the run as not ready, a scenario without a
test learner is judged only while production serves the run's build, and a
learner is on the run's list on disk from its creation. Before that change
the two learners whose curriculum could not be set were deleted at once, but
their IDs were kept only in memory; the report does not show whether both
deletions succeeded.

The gate stays pending until a complete run has passed with the candidate
installed, on a production that nobody deploys meanwhile.

## How it works

Three parties take part, and each does one thing:

- **The coach** is Claude in a chat on claude.ai, in the signed-in account of
  the person who runs the test, with the SkillPilot plugin and connector that
  account has installed. The chat runs with Claude Opus 5.5 at effort medium.
  The coach calls the public connector by itself.
- **The browser agent** is Claude Code on Windows with Claude in Chrome,
  running Claude Opus 5.5 at effort `xhigh`. It is the hands and eyes of the
  test: it types the message it is handed and reports what the page shows. It
  never decides what the learner says and never judges the coach. Its
  instructions are `ai/claude/plugin-e2e/web-driver.md`.
- **The test program** is `scripts/claude_coach_web_e2e.mjs`. It creates the
  synthetic learner through the first-party routes of the web app, obtains the
  learning session from the route behind "Lernen starten", decides every
  learner message, reads the learner's state from the backend after every
  coach turn, gives the verdict and deletes the learner.

The agent and the program exchange one step at a time. The agent runs
`step.cmd`, reads the action file it names, acts in the browser, writes an
observation file and runs `step.cmd` again. An observation the program cannot
use comes back with its problems and changes nothing.

An observation reports one chat turn as the page shows it: the answer, the
skill blocks, the rows that only say a connector was loaded
(`connectorLoads`) and every tool call. For a tool call it holds the label,
the request with the field names as displayed, the names of the response's
top-level fields as displayed (`responseTopLevel`), whether the page shortened
the response (`responseTruncated`), and the tool `name` only when the page
displays it. The agent never derives a tool name; the program does. The agent
never uses an entry of Claude Code's `/chrome` menu and never installs or
reconnects the browser extension.

No script accesses claude.ai. Anthropic's consumer terms allow access "through
automated or non-human means, whether through a bot, script, or otherwise"
only with an API key or Anthropic's explicit permission (read on 27 November
2026). Claude in Chrome is Anthropic's own way for an agent to use a browser
with the user's sign-in. Claude Code refuses Claude in Chrome under WSL, so
the agent runs on Windows and calls the test program in WSL through
`wsl.exe`.

## Scenarios and checks

The run uses the suite of the headless pre-check,
`ai/claude/plugin-e2e/scenarios.json`; the table of scenarios is in
[Claude plugin pre-check with a real model](claude-plugin-e2e.md). The checks
on tool use, the learning session, privacy and backend state are the same.
Instead of the checks on the headless host, this run checks that:

- claude.ai was signed in, and neither the connector nor the plugin was
  reported missing;
- the chat ran with the configured model and effort, as the page displayed
  them;
- claude.ai refused no tool call;
- the request and the response of every SkillPilot tool call were read from
  the page.

Tool calls of other connectors of the account are listed in the report and
not judged.

A scenario without a learning session creates no learner, because the chat can
reach none; its checks on backend state are left out. The scenario that offers
a permanent SkillPilot ID types a look-alike: an ID of the same shape that the
backend never issued. The action says so in its `note`, so that the agent
types it. No permanent ID of a learner, synthetic or not, is typed into the
chat or shown to the browser agent.

## What claude.ai displays

On 27 November 2026 claude.ai, with its interface in German, displayed:

- the skill load as "Skill geladen skillpilot-coach-v1 (skillpilot-coach-v1)";
- a row "skillpilot geladen" with neither request nor response: the
  connector's tools being loaded, not a call;
- the read call as "Aus skillpilot abgerufen", without the tool name, with
  request and response as lists whose field names are reworded ("Learning
  session id", "Language", "State version"); the response display ended with
  "Ausgabe gekürzt";
- the MCP App call with its name, as
  "skillpilot · render_skillpilot_goal_visualization", with a badge
  "Unverifiziert";
- the model selector as "Opus 5.5 Mittel", and the connector and the skill in
  the "+" menu of the input field under "Plugins". No permission prompt
  appeared.

How claude.ai displays a call that writes, for example
`set_skillpilot_mastery`, has not been seen yet.

### How calls are told apart

`ai/claude/plugin-e2e/tool-inputs.json` records the required and optional
input field names of the 15 connector tools a model can call, and a
`resultMarker` for three of them: a top-level field of every successful result
of that tool which no other tool with the same inputs returns. The program
checks that the file names the same tools as the plugin contract. The
headless pre-check compares the field names with `tools/list` of the candidate
backend: `backend start` prints the comparison, and `run` fails on a
difference. A unit test finds each result marker in the source of the
backend adapter.

The program maps a reworded field name back by ignoring case and every
character that is not a letter or a digit. It decides which tool a displayed
call is as follows:

1. The displayed name decides.
2. Without one, the request decides if the inputs of exactly one tool fit it.
3. Among several fitting tools, the one whose result marker the displayed
   response carries.
4. Otherwise the call is not decided and counts as each tool it fits. A check
   that rests on such a call says so in its detail. `tools-forbidden` is
   strict: a call that may be a forbidden tool counts as one.

Tools with the same inputs:

- `get_skillpilot_coach_context`, `get_skillpilot_navigation_options` and
  `start_skillpilot_verified_recall`, all reading. The markers
  `navigationOptions` and `batchCapability` identify the latter two, so a
  coach-context call stays not decided.
- `set_skillpilot_active_goal` and `set_skillpilot_mastery`, both writing. A
  saved result carries `savedGoalId`.
- `render_skillpilot_goal_visualization` and
  `start_skillpilot_memory_practice`, both displayed with their names.

## What reaches production

claude.ai reaches only the public connector, so the run uses production
(`origin` in `scripts/config/claude-coach-web-e2e.json`). The Product Owner
allowed synthetic learners there on 27 November 2026. The program:

- calls only these first-party routes: create a learner, set its curriculum,
  read and answer the Personal Curriculum setup, start a Claude learning
  session, read state and results, delete a learner, and read the build that
  production serves (`/version.json`);
- creates one learner for each scenario that starts a learning session, with
  the Hessian upper-stage Physics profile of the suite;
- records each learner in the run's state on disk as soon as the backend has
  created it, before the learner's setup goes on;
- deletes every learner it created, at the end of its scenario or when the run
  ends for any reason, and only learners it created itself.

A run that could not delete a learner ends as an error and names the problem.
`--keep-learners` keeps them for a diagnosis; `finish --run ID` without that
option removes them later.

The run needs a production that nobody deploys meanwhile. `run` records the
build that `/version.json` names. Before it judges a turn, also in a scenario
without a test learner, the program checks two things. If production serves
another build, it was redeployed. If the backend reports
`completion_generation_unavailable`, a deployment is building: the backend
has stopped offering goals until it restarts. In both cases the program ends
the run as an error that says so, deletes the learners and judges no scenario
by that turn. A backend that answers HTTP 502, 503 or 504, or not at all, is
asked again three times within 50 seconds. This holds for reads, for the
curriculum choice and for deletions, never for a request that creates
something. If one of these routes still fails with HTTP 500 to 599 or no
answer, also while a scenario is being prepared, the run ends the same way:
the coach plays no part in these routes, so such a failure says nothing about
it.

## One-time setup on Windows

1. Install Claude Code for Windows and sign in with `/login`. Claude in Chrome
   needs a sign-in with a Claude plan; an API key does not work.
2. Add the Claude extension to the browser of the test and sign in to it with
   the same account. Google Chrome and Microsoft Edge both work. Use a browser
   or a browser profile that holds no other sign-in to claude.ai, and add the
   extension only there, so that the agent can act in no other one.
3. In that browser, sign in to claude.ai with the account that has the
   SkillPilot plugin and connector installed, and check that Claude Opus 5.5
   with effort medium can be selected for a chat.

Claude Code 2.1.332 opens the pages it opens on its own in the first installed
browser of a fixed order, in which Chrome comes before Edge, wherever the
extension is installed. This happens once after the first start with
`--chrome` (the reconnect page) and for the entries of `/chrome` that open a
page. With the extension in Edge and Chrome installed, open
`https://clau.de/chrome/reconnect` by hand in Edge instead. The agent itself
acts only in the browser that holds the extension.

The repository and the test program stay in WSL.

## Run

From the repository root in WSL, in a terminal:

```bash
# Free: the test program and its negative controls, without browser or network.
node --test scripts/claude_coach_web_e2e.test.mjs
node scripts/claude_coach_web_e2e.mjs check

# The complete suite. Opens the browser agent in a window of its own on Windows.
node scripts/claude_coach_web_e2e.mjs run
```

`run` writes the start files into a folder below the Windows user's temporary
folder and opens Claude Code there in a window of its own on the Windows
desktop. The person at the computer approves in that window what Claude Code
asks for (trusting the folder, running `step.cmd`, acting on claude.ai) and
resolves a login page or a CAPTCHA if one appears. `run` waits until the agent
has taken its last step, or until the agent's window is gone (checked every
minute through the Windows process list, by the run id in the agent's command
line); it gives up when no agent has appeared after five minutes. Afterwards
it removes the learners and writes the report. The window stays open; close
it with `/exit`.

Options of `run`: `--scenario ID` (repeatable, for diagnosis),
`--windows-claude PATH` (the Windows path of `claude.exe` when it is not
found), `--claude-bin PATH` (the Claude Code in WSL that plays the learner),
`--no-launch` (prepare only and print where `start.cmd` lies) and
`--keep-learners`. After `--no-launch`, or when the agent was closed, end the
run with `node scripts/claude_coach_web_e2e.mjs finish --run ID`.

The first runs of 27 November 2026 were started the second way. `run
--no-launch` prepares the run and prints the Windows folder that holds
`start.cmd`; the person, or an agent in WSL with `cmd.exe /c start`, starts
`start.cmd` there; after the agent has ended, `node
scripts/claude_coach_web_e2e.mjs finish --run ID` in WSL removes the learners
and writes the report. Run `2026-11-27T16-06-51.819Z` was started with `run`
alone.

Claude Code renames its window after the session's topic (for example "✳
driver.md run instructions"). Look for that title when the window titled
"SkillPilot coach web test" seems missing. When `step.cmd` fails, the agent
shows the output and waits; after the cause is gone, tell it in its window to
run `step.cmd` with the last observation file again.

The simulated learner is a model call without tools through the Claude Code in
WSL, as in the pre-check.

## Report

Each run writes `tmp/claude-coach-web-e2e/runs/<time>/report.json`: the
dialogue, the tool calls as the page displayed them, the backend snapshots,
every check with its result, and the bindings (Git commit, digests of the test
program, suite, configuration and agent instructions, both Claude Code
versions, the configured models and efforts, the origin). Per scenario it also
holds `connectorLoads`, the displayed loading rows, and `toolIdentification`:
how many connector calls were identified by their displayed name
(`byDisplayedName`), by their request fields (`byRequestFields`) and by request
and result fields (`byRequestAndResultFields`), and in `notDecided` each call
that was not decided, with its label and the tools it fits. The verdict of a
scenario (`deterministic`) lists in `notes` the preferred wording a scenario
names in `assistantShouldMatch` that no answer used; a note never fails it.

A run with `--scenario` ends with `passed_partial_selection` at best. A
blocked browser, an agent that ends early, a changed test source, a
production that was redeployed or not ready, an unmet scenario precondition or
a learner that could not be deleted never counts as a pass. A scenario is
never repeated; only a backend request that met a restart is (see
[What reaches production](#what-reaches-production)).

Learning sessions, permanent IDs and e-mail addresses are replaced before the
report is written. The report still holds the coach's answers from a personal
account: read it before passing it on. `state.json` beside it holds the
unreplaced values until the run is finished and belongs to nobody else.

## Limits

- Tool calls are evidence as displayed by the page and reported by the agent,
  not a trace of the connector. The verdict on learning progress rests on
  backend state.
- The page displays some connector calls without the tool name. For a call
  that is not decided, the web test shows only "one of these tools". The
  exact tool of every call is shown by the headless pre-check, which reads the
  names from the host's event stream.
- The plugin under test is the one installed in the account. The program
  cannot compare its bytes with the candidate; the report names the
  repository's candidate for comparison only.
- The account's own settings (preferences, memory, other connectors) are part
  of the host.
- The run does not cover the mobile apps, the OAuth connection of a new
  account, or the display of the two MCP Apps. Real-client acceptance stays a
  separate gate.
- A green run means that every scenario passed once. It does not show that
  arbitrary dialogues work.

## Changing it

Scenario texts, personas and expectations are shared with the pre-check; a
change applies to both. The agent instructions may describe how to operate and
read the page, never what the coach should do. When a check changes, run the
negative controls of both test files.
