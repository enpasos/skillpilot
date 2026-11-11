# Security Documentation Index

This page groups security and privacy documentation.

## Privacy And Storage

- [Data Privacy and Storage Concept (EN)](data-privacy.md) · [Datenschutz- und Speicherkonzept (DE)](data-privacy.de.md)
- [Coach Feedback: Production Cleanup, 12 September 2026](coach-feedback-cleanup-2026-09-12.md)

## OpenAI MCP

- [OpenAI-MCP: Bindung an den zugelassenen Client (DE)](openai-mcp-client-binding.md) · [OpenAI MCP: Authorized Client Binding (EN)](openai-mcp-client-binding.en.md)
- [OpenAI MCP OAuth App Binding and 24h Learning Sessions](../concept/runtime-workflows/openai-mcp-oauth-learner-session-architecture.md)

## Single-Source Compendium (Volume V)

- Canonical single-source directory: `docs/security/source/` (covering Data Privacy, OpenAI MCP Client Binding, and [EU AI Act Compliance](../legal/ki-verordnung-compliance-stand-2026-07-29.md))
- Typeset PDFs (built on demand / CI): `skillpilot-security-and-privacy.de.pdf` · `skillpilot-security-and-privacy.en.pdf`

## Maintenance

- Add durable security, privacy, or compliance notes here.
- `cd app && npm run check:docs-indexes` fails if a direct Markdown child of `docs/security/` is missing from this index.
