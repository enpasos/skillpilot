# AI provider workspace

This directory contains provider-facing packages, regression fixtures, and
build sources. It is not a catalog of currently supported products.

## Current status

| Path | Status | Rule |
| --- | --- | --- |
| `openai plugin/skillpilot-coach-v1/` | **Submitted for OpenAI review** | Frozen byte-for-byte and path-for-path. Read `docs/deploy/openai-plugin-v1-review-freeze.md` before any change. |
| `openai app/` | **Active build and regression source** | Required by CI and by the MCP Apps UI build. It is not a second production server. Keep tracked sources; `dist/` and `node_modules/` are generated locally. |
| `openai custom gpt/` | **Retained rollback baseline** | Do not modernize, move, or partially delete while the V1 review freeze is active. |
| `openai-custom-gpt-visible-session/` | **Retained rollback package** | Still validated by CI. Do not treat it as the preferred product path. |
| `claude/mcp-regression/` | **Paused provider evaluation** | Referenced regression material for the existing Claude MCP connector. It is the likely next provider candidate, but no Claude plugin package has been selected yet. |

## Direction

New provider work should use a versioned, reviewable plugin or connector
package instead of adding loose setup notes at the top level. Do not assume
that another provider uses OpenAI's plugin package format: confirm that
provider's current distribution and review contract first, then create a
separate candidate without changing the frozen OpenAI V1 package or shared V1
runtime behavior.

Until the OpenAI review ends, do not rename the legacy directories above. Their
paths are referenced by CI, release checks, rollback documentation, or review
freeze records. A physical directory migration is a separate post-review task.

