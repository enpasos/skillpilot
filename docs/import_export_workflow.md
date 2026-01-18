# Import/Export Workflow

This document describes the runtime workflow for moving learner state between SkillPilot instances or accounts. It focuses on what is transferred, how it is applied, and which safeguards exist.

## Scope and goals

Import/export is designed for **data portability** without breaking integrity:
- **Included**: curriculum selection, enabled modules, mastery values, planned goals, provenance (copy sources), and client-side SRS state.
- **Excluded**: personal identifiers; the target account keeps its own SkillPilot-ID.
- **Guarantee**: the source profile is never modified by export.

## Export workflow

1. **Collect server state**: the backend composes the signed learner export payload.
2. **Collect client state**: the frontend gathers local SRS progress from browser storage.
3. **Wrap and save**: the client bundles server and client data into a versioned export file.

## Import workflow

1. **Verify signature**: the backend validates the signed server payload.
2. **Apply server state**: the target profile adopts the imported learning state (see rules below).
3. **Restore client state**: the client re-keys SRS entries to the current user and writes them back to local storage.
4. **Append provenance**: the target profile records the import source and timestamp.

## State application rules

When importing into a target profile:
- **Identity preservation**: the target keeps its own `skillpilotId`; the imported ID is ignored.
- **Curriculum settings**: selected curriculum and enabled modules are overwritten by the import.
- **Mastery**: imported mastery values update existing ones; untouched topics remain as-is.
- **Planned goals**: the planned goal list is replaced by the imported list.

## Provenance (chain of custody)

Every import appends the source SkillPilot-ID and timestamp to a **copySources** history. This makes origin transparent and prevents denial of authorship while keeping data portable.

## Integrity and signatures

The server export payload is protected by an **HMAC-SHA256 signature**:
- **Changing values** (e.g., a mastery score) invalidates the signature.
- **Reformatting JSON** (whitespace, key order) is safe because the signature is computed on parsed values.

## Versioned wrapper (client data)

The export file is versioned so client-only data can ride along:

```json
{
  "version": "2.0",
  "exportedAt": "2024-05-20T10:00:00.000Z",
  "serverExport": {
    "data": { "learner": { ... }, "mastery": { ... }, "plannedGoals": [ ... ], "copySources": [ ... ] },
    "signature": "..."
  },
  "clientData": {
    "srsState": {
      "srs_state_USERID_GOALID": { ... }
    }
  }
}
```

This wrapper keeps the backend contract stable while allowing the frontend to preserve local learning progress.
