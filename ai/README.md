# AI provider workspace

This directory contains provider-facing packages, regression fixtures, and
build sources. It is not a catalog of currently supported products.

## Current status

| Path | Status | Rule |
| --- | --- | --- |
| `openai plugin/skillpilot-coach-v1/` | **Submitted for OpenAI review** | Frozen byte-for-byte and path-for-path. Read `docs/deploy/openai-plugin-v1-review-freeze.md` before any change. |
| `openai app/` | **Active build and regression source** | Required by CI and by the MCP Apps UI build. It is not a second production server. Keep tracked sources; `dist/` and `node_modules/` are generated locally. |
| `openai custom gpt/` | **Clean interim Custom GPT source** | Creates new, separate DE/EN GPTs; no previous GPT identity or Builder source is retained. Never change the submitted plugin or its frozen WebGUI launch flow as a side effect. |
| `openai custom gpt/action-regression/` | **Provider regression tests** | Test infrastructure only; never upload it as GPT Instructions or Knowledge. |
| `claude/mcp-regression/` | **Paused provider evaluation** | Referenced regression material for the existing Claude MCP connector. It is the likely next provider candidate, but no Claude plugin package has been selected yet. |

## Direction

New provider work should use a versioned, reviewable plugin or connector
package instead of adding loose setup notes at the top level. Do not assume
that another provider uses OpenAI's plugin package format: confirm that
provider's current distribution and review contract first, then create a
separate candidate without changing the frozen OpenAI V1 package or shared V1
runtime behavior.

Until the OpenAI review ends, preserve the submitted plugin paths and observable
runtime. Custom-GPT package structure may change when its CI and documentation
references are updated without altering that frozen contract.
