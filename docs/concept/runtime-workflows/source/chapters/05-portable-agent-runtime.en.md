## Portable Agent Runtime Architecture: Interchangeable MCP Hosts {#sec:portable-agent-runtime}

:::note{title="Scope and Structure"}
Strategic architecture governing SkillPilot's long-term host and model-provider independence. Binding operational contracts for current coach adapters are specified in @ref{sec:provider-neutral-coach-boundary} through @ref{sec:openai-plugin-versioning} and take precedence whenever details differ. **Part A** defines the durable normative architecture; **Part B** records the dated market assessment (as of 19 August 2026, complemented by subsequent repository decisions in @ref{sec:openai-plugin-versioning}).
:::

### Part A — Durable architecture: three-tier separation and core invariants {#sec:portable-host-part-a anchors="teil-a-stabile-architektur"}

SkillPilot is structured long-term into three independently replaceable tiers:

1. **SkillPilot Core** as the durable, provider-neutral learning system,
2. an **interchangeable AI Chat Application / MCP Host**,
3. an **interchangeable Model Provider** (preferably addressed via an Open-Responses-conformant interface).

:::principle{title="Two Co-Equal Architectural Rules"}
1. **SkillPilot Core must depend neither on a specific chat host nor on a specific LLM provider.**
2. **Per learner, SkillPilot Core persists exclusively structured, schema-validated learning and control state** — never chat messages, learner phrasing, free-text answers, student work, images, attachments, or model grading transcripts.
:::

Learning conversations do not vanish by keeping Core narrow: they reside in the MCP Host and (when vision is used) at the chosen Model Provider. Because no single platform today satisfies every requirement simultaneously (hosted runtime, cross-device chats, direct user-to-provider billing, Open Responses, Remote MCP, Skills, MCP Apps UI, Agent Plugins, mobile UX, voice dictation, vision, and minor-student eligibility), SkillPilot deliberately supports two operating tracks.

#### Standards and their exact roles

:::table{cols="4.6cm,X"}
| Standard / Term | Normative role in SkillPilot |
| --- | --- |
| **Open Responses** (vs. proprietary *OpenAI Responses API* or emulated `/responses`) | Open specification between the Agent Runtime (MCP Host) and Model Provider/Gateway; conformance requires passing official acceptance tests plus SkillPilot's capability profile — never inferred from a `/responses` URL alone. |
| **Model Context Protocol (MCP)** | Standardizes connectivity between MCP Host/Client and **SkillPilot Core** as a Remote MCP Server over **Streamable HTTP**. |
| **MCP Apps** | Optional sandboxed HTML UI resources attached to MCP tools. Every SkillPilot tool supports plain-text output (universal fallback), `structuredContent`, and optional MCP Apps UI; no essential didactic step may depend solely on UI rendering. |
| **Agent Plugins v1** | Portable install artifact (`plugin.json`, `skills/.../SKILL.md`, `mcp.json`); MCP Apps UIs are served live by the MCP server, and OAuth client profiles stay host-managed outside the plugin archive. |
:::

#### Runtime and installation topology

```text
End Devices (Mobile / Desktop Browser / App: Text, Dictation, Camera)
        | HTTPS
        v
AI Chat Application / MCP Host
  +-- Chat UI + Server-side Agent Runtime (Loop, Context, Attachments, MCP Client)
        |                                       |
        | Open Responses API / Gateway          | Remote MCP (Streamable HTTP + OAuth)
        v                                       v
Model Provider (Learner/Parent          SkillPilot Core
  account; vision images land HERE,       +-- MCP Server (Tools, Resources, MCP Apps UI)
  never inside SkillPilot Core)           +-- Didactic Services (Skill Graph, SRS, Exams)
                                          +-- Learning State DB (structured state only)
```

### State boundaries, operating tracks, media, and billing {#sec:portable-host-boundaries anchors="12-offene-korrekturen-fur-v2"}

:::table{cols="3.6cm,6.2cm,X"}
| Processing domain | Stored data | Controller / owner |
| --- | --- | --- |
| **MCP Host** | Chat user account, chat transcripts, messages, attachments, sessions, optional BYOK credentials | Host operator (in self-hosted pilot: enpasos) |
| **Model Provider** | Submitted prompts and vision images under provider terms | Model provider (direct contract with learner / parent) |
| **SkillPilot Core** | Structured learning and control state (learner link, curriculum/personalization, focus, `activeGoal`, binary mastery, SRS schedule, binary Verified Recall outcome) | enpasos |
:::

- **No cross-host chat portability:** Chat history is host-bound while learning state is SkillPilot-bound (`learner`, `activeGoal`, `masteryValue`, `dueItems`, `lastRecallOutcome`; `nextRecommendedAction` is computed dynamically rather than persisted). Active coach mutations exclude free-text fields (retiring legacy `lastFeedback` exceptions in active contracts; see @ref{sec:coach-boundary-inputs}).
- **Visible identifiers:** A random, opaque `learningSessionId` is explicitly permitted inside model context, whereas internal learner, account, or database IDs remain strictly hidden.
- **Two durable operating tracks:** **Track A** uses provider-hosted MCP hosts (ChatGPT, Claude) with near-zero infra overhead and direct consumer subscriptions; **Track B** uses a portable open-source MCP host (pilot: single-node Docker Compose LibreChat; secondary lab: Archestra) with BYOK, direct provider billing, and explicit operator policies for MongoDB backups, upload-volume retention, key rotation, and minor-protection access controls.
- **Dictation, ephemeral vision, and billing:** Voice input converts to text in browser/host; photographed student work travels from MCP Host to the chosen vision Model Provider and **never** to SkillPilot Core (Core receives only structured writes such as `setMastery` with `1.0`). Provider accounts and API credentials belong strictly to learners or parents/guardians — a central SkillPilot operator key reselling tokens is prohibited.

### Phased roadmap and mandatory host acceptance suite {#sec:portable-host-roadmap}

1. **Phase 1 — Stabilize interfaces:** Host-neutral Remote MCP surface (Streamable HTTP, OAuth 2.0, stable tool names, versioned schemas, idempotency, text fallback, `structuredContent`, optional MCP Apps) plus canonical Agent Plugin bundle with zero image/solution upload tools.
2. **Phase 2 & 3 — Self-hosted pilot & standards lab:** Closed LibreChat pilot (5–10 testers across phone/desktop, dictation, vision, BYOK) alongside practical evaluation of Archestra (Open Responses acceptance tests, MCP Apps).
3. **Phase 4 & 5 — Hosted channels & future managed host:** Claude (adult testers) and ChatGPT (directory release) sharing the same SkillPilot Core state; migration to a third-party managed portable host only once all 12 requirements (Open Responses, BYOK, MCP Apps, Agent Plugins, export/deletion, minor-eligible accounts) are proven.

**Mandatory host and model acceptance gates:** Cross-device session continuation without conflicting writes; 60 s German domain dictation triggering a tool call; phone-camera handwritten solution analysis with documented vision-provider retention; **MCP negative test** (proving zero image bytes, OCR text, solution prose, image URLs, or grading transcripts in MCP args, logs, traces, or DB); **credential negative test**; mobile OAuth refresh and opaque `learningSessionId` with zero internal ID leaks; write idempotency; account/chat deletion verification; complete text-only learning flow plus sandboxed MCP Apps check; direct user billing; official Open Responses test suite.

### Part B — Dated market appendix (as of 19 August 2026) {#sec:portable-host-part-b anchors="teil-b-marktanhang-stand-19-august-2026,15-verwandte-dokumente"}

:::table{cols="2.6cm,2.2cm,2.1cm,2.2cm,2.2cm,X"}
| Criterion | ChatGPT | Claude | LibreChat | Archestra | Target Managed |
| --- | --- | --- | --- | --- | --- |
| Runtime ops | OpenAI | Anthropic | self/3rd-party | self/3rd-party | 3rd-party |
| Mobile MCP | verify in directory | yes (iOS/Android) | mobile web | to verify | required |
| Voice & camera | dictation/vision yes; live voice limited | yes | yes (vision direct to provider) | attachments doc.; mobile test open | required |
| Billing | ChatGPT sub | Claude sub | direct BYOK | personal keys | direct BYOK |
| Open Responses | internal proprietary | no | partial | `/responses` router to test | required |
| MCP + Apps | Remote MCP; dev mode web-only | Remote MCP + mobile Apps | Remote MCP + PKCE; Apps draft | Remote MCP + Apps | required + text fallback |
| Age policy | 13+ (13–17 w/ consent) | Consumer 18+ (API separate) | operator-defined | operator-defined | minor-eligible |
| **Role** | strategic channel | adult benchmark | **immediate pilot** | **2nd candidate** | long-term goal |
:::

Open WebUI is not prioritized ahead of LibreChat or Archestra due to lacking native core MCP Apps support. Related normative contracts: @ref{sec:provider-neutral-coach-boundary}, @ref{sec:skillpilot-owned-coach}, @ref{sec:openai-mcp-oauth-session}, @ref{sec:openai-coach-behavior}, @ref{sec:openai-plugin-versioning}, and [OpenAI MCP Client Binding](repo:docs/security/openai-mcp-client-binding.md).
