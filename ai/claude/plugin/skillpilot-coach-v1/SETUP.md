# Set up SkillPilot Coach

## Choose an installation route

SkillPilot has two deliberately separate Claude package routes:

- **Current 1.1.0 replacement candidate:** install it only through an explicitly
  opened SkillPilot candidate test. It contains the coaching Skill and one
  declaration for the same remote SkillPilot connector. Earlier packages were
  observed in paid Claude Web chat and, after account-level direct installation
  on Claude Pro, in the native Claude app on Android. Those observations are
  historical evidence only: exact-candidate Web, Android and Voice acceptance
  for 1.1.0 is still pending, and no earlier package is a supported fallback.
- **Separate connector-only installation:** use the published **SkillPilot**
  entry in the **Connectors Directory** only when a connector without the
  coaching Skill is deliberately required. The Connectors Directory remains a
  separate connector-only distribution route with its own Team/Enterprise
  submission gate and is not a prerequisite for plugin submission.

SkillPilot Coach v1 does not broaden its support scope to Claude Desktop Chat,
Cowork or public Claude Code. The observed Android use does not establish
installation from inside Android or availability through a future public
listing. Official submission requires exact-candidate Web and Android
real-client acceptance. Fresh public-listing installation and Android use are
verified after publication and do not form a circular pre-submission gate.

A plugin and Directory installation that reference this exact remote MCP URL may coexist; Claude exposes one set of tools for the shared server.
Do not add a second manual custom SkillPilot connector with the same URL when the plugin or Directory connection already supplies it.

All fourteen MCP tools and both interactive MCP Apps come from the remote
SkillPilot connector. The Skill provides coaching instructions only. Neither
the Skill nor the plugin shell implements or duplicates the tools or UIs.

## Current 1.1.0 candidate test

1. On an eligible paid Claude account, open **Plugins**, upload the exact
   **SkillPilot Coach v1** 1.1.0 candidate supplied for the test and enable it.
   Do not use an earlier package as a fallback. Do not describe this
   account-level direct installation as an official Directory publication or
   as installation from inside Android.
2. In the plugin's **Connectors** tab, connect the included **SkillPilot**
   connector. An existing published Directory connection may remain active
   when it references the same remote MCP URL; do not add another manual custom
   connection for that URL.
3. Complete the normal OAuth flow. The `offline_access` scope keeps this
   technical connection available; it contains no learner identity
   and selects no SkillPilot learning profile.
4. Open <https://skillpilot.com/> in the first-party SkillPilot WebGUI. In the
   shared web start, visibly choose or load the SkillPilot ID, confirm the
   curriculum and Personal Curriculum, then explicitly choose **Mit Claude
   starten**. SkillPilot creates a fresh opaque `spc_...` learning-session value
   that is valid for exactly 24 hours and prepares the Claude start prompt. The
   permanent SkillPilot ID remains inside SkillPilot.
5. SkillPilot opens Claude Web with its generated start prompt already filled
   into the composer. Review it and select **Send**; do not manually transport
   the prompt. Claude may show its warning for externally supplied input. For
   example, the learning request begins with:

   > Lade mit SkillPilot meinen aktuellen Lernkontext. Sage mir zuerst für
   > jedes Fach, wie viele Lernziele heute fällig, schon beherrscht und noch
   > offen sind, und lerne dann automatisch mit mir weiter.

An earlier account-level package was used successfully with Claude Pro in the
native Claude app on Android. Exact-candidate 1.1.0 acceptance must still
exercise the daily multi-subject plan summary, automatic plan resume, bundled
connector, an explicit switch between two planned subjects, OAuth, intended
SkillPilot learning flow and both interactive MCP Apps. The current SkillPilot
handoff remains the reviewed
`https://claude.ai/new` Web URL; Android support does not add or claim a native
deep-link contract.

Every SkillPilot tool call in that chat uses the generated `learningSessionId`.
The Web handoff places it transiently in the exact `q` parameter of
`https://claude.ai/new`; do not share that address, copy the value into other
chats, publish it, or ask the learner to type it separately. When the 24 hours
have elapsed, return to the first-party start page and create a new session.
Reconnect the plugin-bundled connector only if Claude reports that its
technical OAuth connection is no longer active.

The connector always requires OAuth. It needs no custom request headers and no
manually registered client ID. OAuth authorizes only the technical connector
transport; the separate 24-hour `spc_...` session authorizes learner access.

## Supported plugin surfaces

The v1 publication scope is limited to eligible paid Claude Chat on the Web and
the native Android app after account-level installation. This v1 package does
not claim Claude Desktop Chat or Cowork support and contains no hooks or
subagents. Each additional surface requires separate acceptance evidence and a
later reviewed release before SkillPilot advertises it.

The plugin uses the connector-owned tools and MCP Apps without copying their
schemas, resources or UI bytes into the plugin package. The current SkillPilot
first-party launch handoff opens Claude Web. Availability of the
plugin on a particular eligible paid plan, region or managed workspace is
governed by Anthropic.

Historical direct-install evidence demonstrates the Web surface and a native
Android use on Claude Pro for an earlier package, but it does not validate
1.1.0 or settle whether Anthropic's official plugin distribution serves either
surface. Public-listing reach is verified after publication against the exact
candidate.

The plugin is not available on Claude Free. SkillPilot's Claude integration
targets adults aged 18 or older. This package does not claim iOS plugin support,
installation from inside the Android app or public Claude Code support.

## Independent Connectors Directory route

The Connector Directory submission is maintained separately. If that
connector-only route is published and deliberately selected, connect it through
**Customize > Connectors**. It may coexist with the plugin when both reference
the exact same remote MCP URL, and Claude exposes one set of tools for that
shared server. Do not add a separate manual custom connection for the same URL.
The Directory route supplies the same fourteen tools and two MCP Apps UIs, but not
the coaching Skill. Its Team/Enterprise publisher gate applies only to
Directory submission and does not gate public plugin submission.

## If no learning context is available

Create or resume the learning profile at <https://skillpilot.com>. Choose the
personal curriculum and learning scope there, then return to Claude and reconnect
or, preferably, create a fresh start at
<https://skillpilot.com/>. Claude may coach and update the selected
learning path, but the first-party SkillPilot site owns curriculum setup and
later corrections or withdrawals of ordinary completion.

## Maintainer validation and updates

Run the repository-local structural check and tests:

```bash
node ai/claude/plugin/skillpilot-coach-v1/check-package.mjs
node --test ai/claude/plugin/skillpilot-coach-v1/check-package.test.mjs
node --test ai/claude/plugin/skillpilot-coach-v1/build-package.test.mjs
node ai/claude/plugin/skillpilot-coach-v1/build-package.mjs
```

The build produces the deterministic release archive
`skillpilot-coach-v1.plugin`; do not hand-edit that generated archive.

Before publication, also run the official Anthropic check in an environment with
the Claude CLI installed:

```bash
claude plugin validate ai/claude/plugin/skillpilot-coach-v1 --strict
```

The local check does not replace the exact-candidate Claude OAuth and tool-flow
acceptance runs on Web and Android. Neither validation nor a successful direct
upload proves public-listing availability; that is verified after publication.

Compatible package improvements increment the plugin's semantic version while the
Claude v1 connector contract remains compatible. A breaking instruction package
uses a new major plugin version. A breaking MCP, OAuth, identity, or state contract
also requires a separately reviewed connector major and endpoint; it must not
silently replace the v1 endpoint.
