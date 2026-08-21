# SkillPilot Claude Connector

[Deutsche Anleitung](claude-connector-v1-user-guide.de.md)

The SkillPilot Claude Connector links Claude to an existing pseudonymous
SkillPilot learning profile. It lets Claude read the learner's selected
curriculum, current focus, next learning goals and progress, and it can update
focus and progress when the learner explicitly asks it to do so.

The connector is text-only, is intended for adults aged 18 or older, and uses
OAuth. Claude does not receive the permanent SkillPilot ID or the ID-file
password. SkillPilot does not receive Claude memory or the complete chat
history, but it does process the explicit MCP tool requests and arguments needed
to read or update the learning state.

## Start in five steps

1. Open [SkillPilot](https://skillpilot.com), create or resume a learning
   profile, and select the curriculum you want to use.
2. Download the encrypted `.skillpilot` ID file and keep its password private.
   Do not paste either the file contents or the password into a Claude chat.
3. In Claude, open **Customize > Connectors**. Choose **SkillPilot** from the
   directory when it is available. During the pre-publication test period,
   choose **Add custom connector** and enter exactly:

   ```text
   https://mcp-claude-v1.skillpilot.com/mcp
   ```

4. Keep authentication required and use Claude's detected hosted client
   metadata. Do not add custom request headers. Start the connection, inspect
   the displayed `skillpilot.read` and `skillpilot.write` permissions, then
   select the encrypted `.skillpilot` file on the SkillPilot authorization page
   and enter its password. Decryption happens locally in that browser page; the
   password is not sent to SkillPilot or Claude.
5. Open a fresh Claude chat, enable the SkillPilot connector if Claude asks, and
   start with a request such as:

   ```text
   Use SkillPilot to load my current learning context and help me choose the
   next sensible learning goal.
   ```

The authorization page currently labels the file selector **SkillPilot-ID-Datei
(.skillpilot)**, the password field **Passwort der ID-Datei**, and the connect
button **Lokal entschlüsseln & verbinden**.

## What you can ask

- "What should I learn next in my current SkillPilot focus?"
- "Show me my available focus choices and help me choose one."
- "Explain my active goal, then check my understanding without giving away the
  answer."
- "Start verified recall for my active memory goal."
- "Give me the active exam task and evaluate my complete answer afterwards."

SkillPilot supports German and English coaching. Claude should answer in the
language used by the learner.

Claude is instructed to keep normal coaching responses centred on the learner:
the learning goal, feedback and next step should appear in plain language.
Claude should discuss internal fields, security mechanisms or test details only
when you explicitly ask a developer or diagnostic question, and it must never
reveal secret values.

## Recall and exam timing

Claude is instructed to present every returned recall prompt or the complete
exam task and wait for your complete answer before requesting protected answers,
solutions or scoring criteria. The current text-only v1 connector does not send
the complete Claude conversation to SkillPilot, so SkillPilot cannot technically
prove that Claude waited. Later recall and exam steps still remain bound to the
current authorized learning state through short-lived security proofs.

## Read and write access

The connector can read the current learning context and the navigation options
published by SkillPilot. With write access, it can also save a selected
focus, active goal, verified progress and recall results. It cannot change the
learner's base curriculum or personal-curriculum configuration.

SkillPilot receives each explicit tool request and the arguments required to
perform it, including learner feedback submitted for a requested progress
write. It stores the resulting canonical learning-state changes and the
short-lived security records described in the connector privacy policy. It
does not ingest the complete Claude transcript.

Claude is instructed to record completion only after suitable visible evidence.
SkillPilot stores only “completed” or “not completed”; this is not a grade. To
correct or withdraw completion for an
ordinary learning goal, open the learner profile in the
[SkillPilot Cockpit](https://skillpilot.com/) instead of asking Claude to invent
a lower score. Orientation and memory goals use their own completion rules.

If another SkillPilot application changed the learning state in the meantime,
Claude must reload the current context instead of overwriting the newer state
or applying a change twice.

## Disconnect or reconnect

Disconnect SkillPilot from Claude's connector settings when you no longer want
Claude to access the learning profile. The connector's OAuth revocation flow
invalidates the Claude connection without deleting the SkillPilot learning
profile or connections belonging to another provider.

To reconnect, add or enable SkillPilot again and repeat the OAuth flow with the
encrypted `.skillpilot` file. Use a fresh chat after reconnecting so Claude
loads the current tool catalogue and learning state.

## Troubleshooting

- **Claude cannot find SkillPilot tools:** open a fresh chat and enable
  SkillPilot in the chat's connector menu.
- **The authorization expired:** start the connection again; pending binding
  transactions are intentionally short-lived.
- **A write reports stale state:** ask Claude to reload the SkillPilot context
  before continuing.
- **The ID file does not open:** verify that the selected file is the encrypted
  `.skillpilot` file and that its password is correct. Never send the file or
  password to support by email.
- **The problem persists:** contact
  [support@skillpilot.com](mailto:support@skillpilot.com) without including
  credentials, OAuth codes, tokens, the permanent SkillPilot ID or learner
  answers.

## Privacy and service information

Read the connector-specific
[privacy policy](https://mcp-claude-v1.skillpilot.com/privacy) before connecting.
The policy explains the pseudonymous binding, data sent to Claude, retention and
revocation. Anthropic separately processes prompts, responses and Claude chat
history under its own terms and privacy policy.

SkillPilot is operated by enpasos - Enterprise Patterns & Solutions GmbH. The
connector uses SkillPilot's own first-party API and does not contain sponsored
content or transfer financial assets.

## Version and later updates

The public endpoint above is the stable SkillPilot Claude Connector v1
endpoint. Compatible fixes can be deployed there. A breaking protocol or
identity change is developed on a separate versioned endpoint first, so the
existing connector can remain available while users migrate.
