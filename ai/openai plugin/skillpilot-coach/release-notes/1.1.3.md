# SkillPilot Coach — 1.1.3 neutral plugin candidate

Unpublished local candidate under the new durable `skillpilot-coach` identity.
The exact public MCP endpoint is `https://mcp-openai.skillpilot.com/mcp`.
Package major releases retain this identity and endpoint; package SemVer is
independent of the runtime contract major. Fresh WebGUI starts open fresh chats.
Existing installations do not automatically migrate to this new identity.
Published Git versions 1.1.0, 1.1.1 and 1.1.2 of `skillpilot-coach-v1`,
their earlier drafts and retained UI resources remain unchanged.

- After confirmed mastery, offer the exact backend-selected next goal by name.
  Naming it does not start its teaching: wait for the learner to continue before
  its task and image. Do not reopen topic selection when the backend has already
  selected the successor. This removes conflicting continuation instructions.
- Apply the existing per-goal visualization rule when continuation is accepted,
  including Voice. Keep the hidden image component eligible for delayed native
  delivery when the standard UI handshake fails first. A real image error
  still closes the component. Preserve the deployed `08030bd956b6…` resource
  unchanged and bind the correction to the new `9c09821e96ab…` resource.
- Do not author solution-bearing suggested replies or next-message drafts.
  Known supplied answers need fresh independent evidence; never infer their
  origin merely from correctness or claim control of host-generated suggestions.
- Extend dialogue regression checks and review criteria for these transitions.
- Add the public support URL and explicit OAuth/CIMD preference to the package.
  Client identities, callbacks and accepted authentication methods remain
  independently pinned by the server; no credential is included in the package.
- Provide a deterministic directory-submission ZIP with imported review
  information and validation findings. Keep the install archive and Git beta
  available for the existing Desktop route.

The neutral endpoint is prepared locally; deployment and host authentication
remain unverified. No tool or permission is added. Contract major remains
`1`, workflow version `coach@1.1`, and OpenAI publication status `DRAFT`.
Local checks do not establish actual ChatGPT Voice rendering or suppression of
host-generated answer suggestions. The handshake race is locally reproduced;
the supplied server trace does not establish it as the Voice failure's cause.
The public-directory route targets desktop, web and mobile; Git import remains
Desktop only. Git rollout, backend deployment, hosted OAuth setup, directory
publication and actual host acceptance remain separate steps.
